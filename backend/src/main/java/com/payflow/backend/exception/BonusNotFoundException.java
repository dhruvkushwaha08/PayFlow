package com.payflow.backend.exception;

public class BonusNotFoundException extends RuntimeException {

    public BonusNotFoundException(Long id) {
        super("Bonus not found with id: " + id);
    }
}