package com.payflow.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateOvertimeRequest {

    @NotNull
    private Long employeeId;

    @NotNull
    private LocalDate overtimeDate;

    @NotNull
    @DecimalMin(
        value = "0.01",
        message = "Overtime hours must be greater than 0"
    )
    private BigDecimal hours;

    @NotNull
    @DecimalMin(
        value = "0.00",
        message = "Overtime rate cannot be negative"
    )
    private BigDecimal ratePerHour;

    private String notes;

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getOvertimeDate() {
        return overtimeDate;
    }

    public void setOvertimeDate(LocalDate overtimeDate) {
        this.overtimeDate = overtimeDate;
    }

    public BigDecimal getHours() {
        return hours;
    }

    public void setHours(BigDecimal hours) {
        this.hours = hours;
    }

    public BigDecimal getRatePerHour() {
        return ratePerHour;
    }

    public void setRatePerHour(BigDecimal ratePerHour) {
        this.ratePerHour = ratePerHour;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}