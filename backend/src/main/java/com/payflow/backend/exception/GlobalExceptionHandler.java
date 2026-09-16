package com.payflow.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Employee exceptions

    @ExceptionHandler(EmployeeNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleEmployeeNotFound(EmployeeNotFoundException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(DuplicateEmployeeException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleDuplicateEmployee(DuplicateEmployeeException exception) {
        return exception.getMessage();
    }


    // Attendance exceptions

    @ExceptionHandler(AttendanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleAttendanceNotFound(AttendanceNotFoundException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(DuplicateAttendanceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handleDuplicateAttendance(DuplicateAttendanceException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(InvalidAttendanceException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInvalidAttendance(InvalidAttendanceException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(InactiveEmployeeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInactiveEmployee(InactiveEmployeeException exception) {
        return exception.getMessage();
    }


    // Advance exceptions

    @ExceptionHandler(AdvanceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleAdvanceNotFound(AdvanceNotFoundException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(InvalidAdvanceException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInvalidAdvance(InvalidAdvanceException exception) {
        return exception.getMessage();
    }


    // Bonus exceptions

    @ExceptionHandler(BonusNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleBonusNotFound(BonusNotFoundException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(InvalidBonusException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInvalidBonus(InvalidBonusException exception) {
        return exception.getMessage();
    }


    // Overtime exceptions

    @ExceptionHandler(OvertimeNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleOvertimeNotFound(OvertimeNotFoundException exception) {
        return exception.getMessage();
    }

    @ExceptionHandler(InvalidOvertimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handleInvalidOvertime(InvalidOvertimeException exception) {
        return exception.getMessage();
    }
}