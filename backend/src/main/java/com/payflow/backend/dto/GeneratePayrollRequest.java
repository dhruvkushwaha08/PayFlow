package com.payflow.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class GeneratePayrollRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Payroll month is required")
    private LocalDate payrollMonth;

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDate getPayrollMonth() {
        return payrollMonth;
    }

    public void setPayrollMonth(LocalDate payrollMonth) {
        this.payrollMonth = payrollMonth;
    }
}