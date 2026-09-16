package com.payflow.backend.exception;

public class InactiveEmployeeException extends RuntimeException {

    public InactiveEmployeeException(Long employeeId) {
        super("Employee is inactive and cannot receive new records. Employee id: " + employeeId);
    }
}