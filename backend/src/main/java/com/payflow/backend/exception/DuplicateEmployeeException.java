package com.payflow.backend.exception;

public class DuplicateEmployeeException extends RuntimeException {

    public DuplicateEmployeeException(String employeeCode) {
        super("Employee code already exists: " + employeeCode);
    }
}
