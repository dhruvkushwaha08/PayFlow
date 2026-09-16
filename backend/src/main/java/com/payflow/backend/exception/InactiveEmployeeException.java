package com.payflow.backend.exception;

public class InactiveEmployeeException extends RuntimeException {

    public InactiveEmployeeException(Long employeeId) {
        super("Attendance cannot be recorded for inactive employee with id: " + employeeId);
    }
}