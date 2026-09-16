package com.payflow.backend.exception;

public class DuplicateAttendanceException extends RuntimeException {

    public DuplicateAttendanceException(Long employeeId) {
        super("Attendance already exists for employee id: " + employeeId);
    }
}