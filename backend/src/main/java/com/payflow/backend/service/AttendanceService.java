package com.payflow.backend.service;

import com.payflow.backend.dto.CreateAttendanceRequest;
import com.payflow.backend.dto.UpdateAttendanceRequest;
import com.payflow.backend.entity.Attendance;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.entity.Payroll;
import com.payflow.backend.exception.AttendanceNotFoundException;
import com.payflow.backend.exception.DuplicateAttendanceException;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.exception.InactiveEmployeeException;
import com.payflow.backend.exception.InvalidAttendanceException;
import com.payflow.backend.repository.AttendanceRepository;
import com.payflow.backend.repository.EmployeeRepository;
import com.payflow.backend.repository.PayrollRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollRepository payrollRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            PayrollRepository payrollRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.payrollRepository = payrollRepository;
    }

    // =========================================================
    // GET ALL ATTENDANCE
    // =========================================================

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // =========================================================
    // GET ATTENDANCE BY ID
    // =========================================================

    public Attendance getAttendanceById(Long id) {

        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new AttendanceNotFoundException(id));
    }

    // =========================================================
    // CREATE ATTENDANCE
    // =========================================================

    public Attendance createAttendance(CreateAttendanceRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                request.getEmployeeId()));

        // -----------------------------------------------------
        // Check employee status
        // -----------------------------------------------------

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(
                    request.getEmployeeId());
        }

        // -----------------------------------------------------
        // Validate attendance date
        // -----------------------------------------------------

        validateAttendanceDate(
                request.getAttendanceDate(),
                employee.getJoiningDate()
        );

        // -----------------------------------------------------
        // Check finalized payroll
        // -----------------------------------------------------

        validatePayrollLock(
                request.getEmployeeId(),
                request.getAttendanceDate()
        );

        // -----------------------------------------------------
        // Validate check-in / check-out
        // -----------------------------------------------------

        validateCheckInAndCheckOut(
                request.getStatus(),
                request.getCheckIn(),
                request.getCheckOut()
        );

        // -----------------------------------------------------
        // Create attendance
        // -----------------------------------------------------

        Attendance attendance = new Attendance();

        attendance.setEmployeeId(request.getEmployeeId());
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setStatus(request.getStatus());
        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setNotes(request.getNotes());

        try {

            return attendanceRepository.saveAndFlush(attendance);

        } catch (DataIntegrityViolationException exception) {

            throw new DuplicateAttendanceException(
                    request.getEmployeeId());
        }
    }

    // =========================================================
    // UPDATE ATTENDANCE
    // =========================================================

    public Attendance updateAttendance(
            Long id,
            UpdateAttendanceRequest request) {

        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new AttendanceNotFoundException(id));

        Employee employee = employeeRepository
                .findById(attendance.getEmployeeId())
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                attendance.getEmployeeId()));

        // -----------------------------------------------------
        // Check employee status
        // -----------------------------------------------------

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(
                    employee.getEmployeeId());
        }

        // -----------------------------------------------------
        // Validate attendance date
        // -----------------------------------------------------

        validateAttendanceDate(
                request.getAttendanceDate(),
                employee.getJoiningDate()
        );

        // -----------------------------------------------------
        // Check old attendance month
        // -----------------------------------------------------

        validatePayrollLock(
                attendance.getEmployeeId(),
                attendance.getAttendanceDate()
        );

        // -----------------------------------------------------
        // Check new attendance month
        // -----------------------------------------------------

        validatePayrollLock(
                attendance.getEmployeeId(),
                request.getAttendanceDate()
        );

        // -----------------------------------------------------
        // Validate check-in / check-out
        // -----------------------------------------------------

        validateCheckInAndCheckOut(
                request.getStatus(),
                request.getCheckIn(),
                request.getCheckOut()
        );

        // -----------------------------------------------------
        // Update attendance
        // -----------------------------------------------------

        attendance.setAttendanceDate(
                request.getAttendanceDate());

        attendance.setStatus(
                request.getStatus());

        attendance.setCheckIn(
                request.getCheckIn());

        attendance.setCheckOut(
                request.getCheckOut());

        attendance.setNotes(
                request.getNotes());

        try {

            return attendanceRepository.saveAndFlush(attendance);

        } catch (DataIntegrityViolationException exception) {

            throw new DuplicateAttendanceException(
                    attendance.getEmployeeId());
        }
    }

    // =========================================================
    // PAYROLL LOCK VALIDATION
    // =========================================================

    private void validatePayrollLock(
            Long employeeId,
            LocalDate attendanceDate) {

        YearMonth attendanceMonth =
                YearMonth.from(attendanceDate);

        List<Payroll> payrollRecords =
                payrollRepository.findByEmployeeId(employeeId);

        for (Payroll payroll : payrollRecords) {

            if (payroll.getPayrollMonth() == null) {
                continue;
            }

            YearMonth payrollMonth =
                    YearMonth.from(payroll.getPayrollMonth());

            if (attendanceMonth.equals(payrollMonth)
                    && "FINALIZED".equalsIgnoreCase(
                            payroll.getStatus())) {

                throw new InvalidAttendanceException(
                        "Attendance cannot be modified because payroll for "
                                + attendanceMonth
                                + " is finalized");
            }
        }
    }

    // =========================================================
    // ATTENDANCE DATE VALIDATION
    // =========================================================

    private void validateAttendanceDate(
            LocalDate attendanceDate,
            LocalDate joiningDate) {

        LocalDate today = LocalDate.now();

        if (attendanceDate.isAfter(today)) {

            throw new InvalidAttendanceException(
                    "Attendance cannot be recorded for a future date");
        }

        if (attendanceDate.isBefore(joiningDate)) {

            throw new InvalidAttendanceException(
                    "Attendance date cannot be before employee joining date");
        }
    }

    // =========================================================
    // CHECK-IN / CHECK-OUT VALIDATION
    // =========================================================

    private void validateCheckInAndCheckOut(
            String status,
            LocalTime checkIn,
            LocalTime checkOut) {

        if ("ABSENT".equals(status)
                || "LEAVE".equals(status)) {

            if (checkIn != null || checkOut != null) {

                throw new InvalidAttendanceException(
                        "Check-in and check-out are not allowed for "
                                + status);
            }

            return;
        }

        if (checkIn != null
                && checkOut != null
                && checkOut.isBefore(checkIn)) {

            throw new InvalidAttendanceException(
                    "Check-out time cannot be before check-in time");
        }
    }
}