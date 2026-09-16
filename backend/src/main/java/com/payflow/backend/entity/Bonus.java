package com.payflow.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bonus")
public class Bonus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bonus_id")
    private Long bonusId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "bonus_type", nullable = false)
    private String bonusType;

    @Column(name = "value", nullable = false, precision = 12, scale = 2)
    private BigDecimal value;

    @Column(name = "bonus_date", nullable = false)
    private LocalDate bonusDate;

    @Column(name = "reason")
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getBonusId() {
        return bonusId;
    }

    public void setBonusId(Long bonusId) {
        this.bonusId = bonusId;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}