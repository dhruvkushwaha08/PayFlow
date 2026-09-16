package com.payflow.backend.service;

import com.payflow.backend.dto.CreateAttendanceRequest;
import com.payflow.backend.dto.UpdateAttendanceRequest;
import com.payflow.backend.entity.Attendance;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.exception.AttendanceNotFoundException;
import com.payflow.backend.exception.DuplicateAttendanceException;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.exception.InactiveEmployeeException;
import com.payflow.backend.exception.InvalidAttendanceException;
import com.payflow.backend.repository.AttendanceRepository;
import com.payflow.backend.repository.EmployeeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Long id) {

        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new AttendanceNotFoundException(id));
    }

    public Attendance createAttendance(CreateAttendanceRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new EmployeeNotFoundException(request.getEmployeeId()));

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(request.getEmployeeId());
        }

        validateAttendanceDate(
                request.getAttendanceDate(),
                employee.getJoiningDate()
        );

        validateCheckInAndCheckOut(request.getStatus(),
                request.getCheckIn(),
                request.getCheckOut());

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

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(
                    employee.getEmployeeId());
        }

        validateAttendanceDate(
                request.getAttendanceDate(),
                employee.getJoiningDate()
        );

        validateCheckInAndCheckOut(
                request.getStatus(),
                request.getCheckIn(),
                request.getCheckOut()
        );

        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setStatus(request.getStatus());
        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setNotes(request.getNotes());

        try {

            return attendanceRepository.saveAndFlush(attendance);

        } catch (DataIntegrityViolationException exception) {

            throw new DuplicateAttendanceException(
                    attendance.getEmployeeId());
        }
    }

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

    private void validateCheckInAndCheckOut(
            String status,
            java.time.LocalTime checkIn,
            java.time.LocalTime checkOut) {

        if ("ABSENT".equals(status) || "LEAVE".equals(status)) {

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