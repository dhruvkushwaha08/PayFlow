package com.payflow.backend.exception;

public class InvalidBonusException extends RuntimeException {

    public InvalidBonusException(String message) {
        super(message);
    }
}