package com.payflow.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateBonusRequest {

    @NotNull
    private Long employeeId;

    @NotBlank
    @Pattern(
        regexp = "PERCENTAGE|FIXED",
        message = "Bonus type must be PERCENTAGE or FIXED"
    )
    private String bonusType;

    @NotNull
    @DecimalMin(
        value = "0.01",
        message = "Bonus value must be greater than 0"
    )
    private BigDecimal value;

    @NotNull
    private LocalDate bonusDate;

    private String reason;

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getBonusType() {
        return bonusType;
    }

    public void setBonusType(String bonusType) {
        this.bonusType = bonusType;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public LocalDate getBonusDate() {
        return bonusDate;
    }

    public void setBonusDate(LocalDate bonusDate) {
        this.bonusDate = bonusDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}