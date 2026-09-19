package com.payflow.backend.service;

import com.payflow.backend.dto.GeneratePayrollRequest;
import com.payflow.backend.entity.Advance;
import com.payflow.backend.entity.Attendance;
import com.payflow.backend.entity.Bonus;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.entity.Overtime;
import com.payflow.backend.entity.Payroll;
import com.payflow.backend.entity.SalaryStructure;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.repository.AdvanceRepository;
import com.payflow.backend.repository.AttendanceRepository;
import com.payflow.backend.repository.BonusRepository;
import com.payflow.backend.repository.EmployeeRepository;
import com.payflow.backend.repository.OvertimeRepository;
import com.payflow.backend.repository.PayrollRepository;
import com.payflow.backend.repository.SalaryStructureRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PayrollServiceTest {

    @Mock
    private PayrollRepository payrollRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private SalaryStructureRepository salaryStructureRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private BonusRepository bonusRepository;

    @Mock
    private OvertimeRepository overtimeRepository;

    @Mock
    private AdvanceRepository advanceRepository;

    @InjectMocks
    private PayrollService payrollService;

    @Test
    void generatePayroll_shouldCalculateSalaryCorrectly() {

        Long employeeId = 1L;
        LocalDate payrollMonth = LocalDate.of(2026, 9, 1);

        Employee employee = new Employee();
        employee.setEmployeeId(employeeId);
        employee.setStatus("ACTIVE");

        SalaryStructure salary = new SalaryStructure();
        salary.setMonthlySalary(new BigDecimal("28000"));
        salary.setEffectiveFrom(LocalDate.of(2026, 7, 1));
        salary.setEffectiveTo(null);

        Attendance present1 = new Attendance();
        present1.setAttendanceDate(LocalDate.of(2026, 9, 1));
        present1.setStatus("PRESENT");

        Attendance present2 = new Attendance();
        present2.setAttendanceDate(LocalDate.of(2026, 9, 2));
        present2.setStatus("PRESENT");

        Attendance halfDay = new Attendance();
        halfDay.setAttendanceDate(LocalDate.of(2026, 9, 3));
        halfDay.setStatus("HALF_DAY");

        Bonus bonus = new Bonus();
        bonus.setBonusDate(LocalDate.of(2026, 9, 10));
        bonus.setBonusType("PERCENTAGE");
        bonus.setValue(new BigDecimal("10"));

        Overtime overtime = new Overtime();
        overtime.setOvertimeDate(LocalDate.of(2026, 9, 15));
        overtime.setAmount(new BigDecimal("200"));

        Advance advance = new Advance();
        advance.setAdvanceDate(LocalDate.of(2026, 9, 5));
        advance.setAmount(new BigDecimal("5000"));
        advance.setStatus("PENDING");

        when(employeeRepository.findById(employeeId))
                .thenReturn(Optional.of(employee));

        when(payrollRepository.existsByEmployeeIdAndPayrollMonth(
                employeeId, payrollMonth))
                .thenReturn(false);

        when(salaryStructureRepository.findByEmployeeId(employeeId))
                .thenReturn(List.of(salary));

        when(attendanceRepository.findByEmployeeId(employeeId))
                .thenReturn(List.of(present1, present2, halfDay));

        when(bonusRepository.findByEmployeeId(employeeId))
                .thenReturn(List.of(bonus));

        when(overtimeRepository.findByEmployeeId(employeeId))
                .thenReturn(List.of(overtime));

        when(advanceRepository.findByEmployeeId(employeeId))
                .thenReturn(List.of(advance));

        when(payrollRepository.saveAndFlush(any(Payroll.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        GeneratePayrollRequest request = new GeneratePayrollRequest();
        request.setEmployeeId(employeeId);
        request.setPayrollMonth(payrollMonth);

        Payroll result = payrollService.generatePayroll(request);

        assertEquals(new BigDecimal("28000"), result.getBaseSalary());
        assertEquals(new BigDecimal("2.5"), result.getDaysWorked());
        assertEquals(new BigDecimal("2333.33"), result.getEarnedSalary());
        assertEquals(new BigDecimal("233.33"), result.getBonusAmount());
        assertEquals(new BigDecimal("200"), result.getOvertimeAmount());
        assertEquals(new BigDecimal("5000"), result.getAdvanceDeduction());
        assertEquals(new BigDecimal("-2233.34"), result.getNetSalary());
        assertEquals("DRAFT", result.getStatus());

        verify(payrollRepository).saveAndFlush(any(Payroll.class));
    }

    @Test
    void generatePayroll_shouldThrowException_whenEmployeeDoesNotExist() {

        when(employeeRepository.findById(999L))
                .thenReturn(Optional.empty());

        GeneratePayrollRequest request = new GeneratePayrollRequest();
        request.setEmployeeId(999L);
        request.setPayrollMonth(LocalDate.of(2026, 9, 1));

        assertThrows(
                EmployeeNotFoundException.class,
                () -> payrollService.generatePayroll(request)
        );
    }

    @Test
    void generatePayroll_shouldRejectInactiveEmployee() {

        Employee employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setStatus("INACTIVE");

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        GeneratePayrollRequest request = new GeneratePayrollRequest();
        request.setEmployeeId(1L);
        request.setPayrollMonth(LocalDate.of(2026, 9, 1));

        assertThrows(
                IllegalArgumentException.class,
                () -> payrollService.generatePayroll(request)
        );
    }

    @Test
    void generatePayroll_shouldRejectDuplicatePayroll() {

        Employee employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setStatus("ACTIVE");

        LocalDate payrollMonth = LocalDate.of(2026, 9, 1);

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        when(payrollRepository.existsByEmployeeIdAndPayrollMonth(
                1L, payrollMonth))
                .thenReturn(true);

        GeneratePayrollRequest request = new GeneratePayrollRequest();
        request.setEmployeeId(1L);
        request.setPayrollMonth(payrollMonth);

        assertThrows(
                IllegalArgumentException.class,
                () -> payrollService.generatePayroll(request)
        );
    }

    @Test
    void finalizePayroll_shouldMarkPayrollAsFinalizedAndDeductAdvance() {

        Payroll payroll = new Payroll();
        payroll.setEmployeeId(1L);
        payroll.setPayrollMonth(LocalDate.of(2026, 9, 1));
        payroll.setStatus("DRAFT");

        Advance advance = new Advance();
        advance.setAdvanceDate(LocalDate.of(2026, 9, 5));
        advance.setAmount(new BigDecimal("5000"));
        advance.setStatus("PENDING");

        when(payrollRepository.findById(1L))
                .thenReturn(Optional.of(payroll));

        when(payrollRepository.saveAndFlush(payroll))
                .thenReturn(payroll);

        when(advanceRepository.findByEmployeeId(1L))
                .thenReturn(List.of(advance));

        Payroll result = payrollService.finalizePayroll(1L);

        assertEquals("FINALIZED", result.getStatus());
        assertEquals("DEDUCTED", advance.getStatus());

        verify(payrollRepository).saveAndFlush(payroll);
        verify(advanceRepository).save(advance);
    }

    @Test
    void finalizePayroll_shouldRejectAlreadyFinalizedPayroll() {

        Payroll payroll = new Payroll();
        payroll.setEmployeeId(1L);
        payroll.setPayrollMonth(LocalDate.of(2026, 9, 1));
        payroll.setStatus("FINALIZED");

        when(payrollRepository.findById(1L))
                .thenReturn(Optional.of(payroll));

        assertThrows(
                IllegalArgumentException.class,
                () -> payrollService.finalizePayroll(1L)
        );
    }
}