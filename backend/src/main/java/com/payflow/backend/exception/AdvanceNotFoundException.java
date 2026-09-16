package com.payflow.backend.exception;

public class AdvanceNotFoundException extends RuntimeException {

    public AdvanceNotFoundException(Long id) {
        super("Advance not found with id: " + id);
    }
}