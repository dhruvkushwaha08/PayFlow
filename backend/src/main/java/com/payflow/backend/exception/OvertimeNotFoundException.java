package com.payflow.backend.exception;

public class OvertimeNotFoundException extends RuntimeException {

    public OvertimeNotFoundException(Long id) {
        super("Overtime not found with id: " + id);
    }
}