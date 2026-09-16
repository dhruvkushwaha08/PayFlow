package com.payflow.backend.service;

import com.payflow.backend.dto.GeneratePayrollRequest;
import com.payflow.backend.entity.*;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final AttendanceRepository attendanceRepository;
    private final BonusRepository bonusRepository;
    private final OvertimeRepository overtimeRepository;
    private final AdvanceRepository advanceRepository;

    public PayrollService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            SalaryStructureRepository salaryStructureRepository,
            AttendanceRepository attendanceRepository,
            BonusRepository bonusRepository,
            OvertimeRepository overtimeRepository,
            AdvanceRepository advanceRepository) {

        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.attendanceRepository = attendanceRepository;
        this.bonusRepository = bonusRepository;
        this.overtimeRepository = overtimeRepository;
        this.advanceRepository = advanceRepository;
    }

    // =========================================================
    // GENERATE PAYROLL
    // =========================================================

    @Transactional
    public Payroll generatePayroll(GeneratePayrollRequest request) {

        Long employeeId = request.getEmployeeId();
        LocalDate payrollMonth = request.getPayrollMonth();

        // -----------------------------------------------------
        // 1. Check employee
        // -----------------------------------------------------

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {

            throw new IllegalArgumentException(
                    "Inactive employee cannot have payroll generated"
            );
        }

        // -----------------------------------------------------
        // 2. Check duplicate payroll
        // -----------------------------------------------------

        if (payrollRepository.existsByEmployeeIdAndPayrollMonth(
                employeeId, payrollMonth)) {

            throw new IllegalArgumentException(
                    "Payroll already exists for this employee and month"
            );
        }

        // -----------------------------------------------------
        // 3. Month information
        // -----------------------------------------------------

        YearMonth yearMonth = YearMonth.from(payrollMonth);

        int daysInMonth = yearMonth.lengthOfMonth();

        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        // -----------------------------------------------------
        // 4. Find active salary structure
        // -----------------------------------------------------

        List<SalaryStructure> salaryStructures =
                salaryStructureRepository.findByEmployeeId(employeeId);

        SalaryStructure activeSalary = salaryStructures.stream()
                .filter(salary ->
                        !salary.getEffectiveFrom().isAfter(payrollMonth)
                                &&
                                (
                                        salary.getEffectiveTo() == null
                                                ||
                                                !salary.getEffectiveTo()
                                                        .isBefore(payrollMonth)
                                )
                )
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "No salary structure found for employee " + employeeId
                ));

        BigDecimal baseSalary = activeSalary.getMonthlySalary();

        // -----------------------------------------------------
        // 5. Calculate payable attendance
        // -----------------------------------------------------

        List<Attendance> attendanceRecords =
                attendanceRepository.findByEmployeeId(employeeId);

        BigDecimal daysWorked = attendanceRecords.stream()
                .filter(attendance ->
                        !attendance.getAttendanceDate().isBefore(monthStart)
                                &&
                                !attendance.getAttendanceDate()
                                        .isAfter(monthEnd)
                )
                .map(attendance -> {

                    String status = attendance.getStatus();

                    if ("PRESENT".equalsIgnoreCase(status)) {
                        return BigDecimal.ONE;
                    }

                    if ("HALF_DAY".equalsIgnoreCase(status)) {
                        return new BigDecimal("0.5");
                    }

                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // -----------------------------------------------------
        // 6. Calculate earned salary
        // -----------------------------------------------------

        BigDecimal earnedSalary = baseSalary
                .multiply(daysWorked)
                .divide(
                        BigDecimal.valueOf(daysInMonth),
                        2,
                        RoundingMode.HALF_UP
                );

        // -----------------------------------------------------
        // 7. Calculate bonuses
        // -----------------------------------------------------

        List<Bonus> bonusRecords =
                bonusRepository.findByEmployeeId(employeeId);

        BigDecimal bonusAmount = BigDecimal.ZERO;

        for (Bonus bonus : bonusRecords) {

            LocalDate bonusDate = bonus.getBonusDate();

            if (bonusDate.isBefore(monthStart)
                    || bonusDate.isAfter(monthEnd)) {

                continue;
            }

            if ("PERCENTAGE".equalsIgnoreCase(bonus.getBonusType())) {

                BigDecimal percentageBonus =
                        earnedSalary
                                .multiply(bonus.getValue())
                                .divide(
                                        BigDecimal.valueOf(100),
                                        2,
                                        RoundingMode.HALF_UP
                                );

                bonusAmount = bonusAmount.add(percentageBonus);

            } else if ("FIXED".equalsIgnoreCase(bonus.getBonusType())) {

                bonusAmount = bonusAmount.add(bonus.getValue());
            }
        }

        // -----------------------------------------------------
        // 8. Calculate overtime
        // -----------------------------------------------------

        List<Overtime> overtimeRecords =
                overtimeRepository.findByEmployeeId(employeeId);

        BigDecimal overtimeAmount = overtimeRecords.stream()
                .filter(overtime ->
                        !overtime.getOvertimeDate().isBefore(monthStart)
                                &&
                                !overtime.getOvertimeDate()
                                        .isAfter(monthEnd)
                )
                .map(Overtime::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // -----------------------------------------------------
        // 9. Calculate advance deduction
        // -----------------------------------------------------

        List<Advance> advanceRecords =
                advanceRepository.findByEmployeeId(employeeId);

        BigDecimal advanceDeduction = advanceRecords.stream()
                .filter(advance ->
                        "PENDING".equalsIgnoreCase(advance.getStatus())
                                &&
                                !advance.getAdvanceDate().isAfter(monthEnd)
                )
                .map(Advance::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // -----------------------------------------------------
        // 10. Other deductions
        // -----------------------------------------------------

        BigDecimal otherDeductions = BigDecimal.ZERO;

        // -----------------------------------------------------
        // 11. Final salary
        // -----------------------------------------------------

        BigDecimal netSalary = earnedSalary
                .add(bonusAmount)
                .add(overtimeAmount)
                .subtract(advanceDeduction)
                .subtract(otherDeductions);

        // -----------------------------------------------------
        // 12. Create payroll record
        // -----------------------------------------------------

        Payroll payroll = new Payroll();

        payroll.setEmployeeId(employeeId);
        payroll.setPayrollMonth(payrollMonth);
        payroll.setBaseSalary(baseSalary);
        payroll.setDaysInMonth(daysInMonth);
        payroll.setDaysWorked(daysWorked);
        payroll.setEarnedSalary(earnedSalary);
        payroll.setBonusAmount(bonusAmount);
        payroll.setOvertimeAmount(overtimeAmount);
        payroll.setAdvanceDeduction(advanceDeduction);
        payroll.setOtherDeductions(otherDeductions);
        payroll.setNetSalary(netSalary);

        // Payroll starts as DRAFT
        payroll.setStatus("DRAFT");

        Payroll savedPayroll = payrollRepository.saveAndFlush(payroll);

        // IMPORTANT:
        // Advances are NOT marked DEDUCTED here.
        // They remain PENDING until payroll is finalized.

        return savedPayroll;
    }

    // =========================================================
    // GET ALL PAYROLL
    // =========================================================

    public List<Payroll> getAllPayroll() {

        return payrollRepository.findAll();
    }

    // =========================================================
    // GET PAYROLL BY ID
    // =========================================================

    public Payroll getPayrollById(Long payrollId) {

        return payrollRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payroll not found with id: " + payrollId
                ));
    }

    // =========================================================
    // GET PAYROLL BY EMPLOYEE
    // =========================================================

    public List<Payroll> getPayrollByEmployeeId(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {

            throw new EmployeeNotFoundException(employeeId);
        }

        return payrollRepository.findByEmployeeId(employeeId);
    }

    // =========================================================
    // GET PAYROLL BY MONTH
    // =========================================================

    public List<Payroll> getPayrollByMonth(String payrollMonth) {

        YearMonth yearMonth;

        try {

            yearMonth = YearMonth.parse(payrollMonth);

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Invalid payroll month. Use format YYYY-MM, for example 2026-09"
            );
        }

        LocalDate monthStart = yearMonth.atDay(1);

        return payrollRepository.findByPayrollMonth(monthStart);
    }

    // =========================================================
    // FINALIZE PAYROLL
    // =========================================================

    @Transactional
    public Payroll finalizePayroll(Long payrollId) {

        // -----------------------------------------------------
        // 1. Find payroll
        // -----------------------------------------------------

        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Payroll not found with id: " + payrollId
                ));

        // -----------------------------------------------------
        // 2. Check current status
        // -----------------------------------------------------

        if (!"DRAFT".equalsIgnoreCase(payroll.getStatus())) {

            throw new IllegalArgumentException(
                    "Only DRAFT payroll can be finalized"
            );
        }

        // -----------------------------------------------------
        // 3. Finalize payroll
        // -----------------------------------------------------

        payroll.setStatus("FINALIZED");

        Payroll finalizedPayroll =
                payrollRepository.saveAndFlush(payroll);

        // -----------------------------------------------------
        // 4. Mark included advances as DEDUCTED
        // -----------------------------------------------------

        LocalDate monthEnd =
                YearMonth.from(payroll.getPayrollMonth()).atEndOfMonth();

        List<Advance> advanceRecords =
                advanceRepository.findByEmployeeId(
                        payroll.getEmployeeId());

        for (Advance advance : advanceRecords) {

            if ("PENDING".equalsIgnoreCase(advance.getStatus())
                    &&
                    !advance.getAdvanceDate().isAfter(monthEnd)) {

                advance.setStatus("DEDUCTED");

                advanceRepository.save(advance);
            }
        }

        return finalizedPayroll;
    }
}