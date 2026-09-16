package com.payflow.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "payroll",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_payroll_employee_month",
            columnNames = {"employee_id", "payroll_month"}
        )
    }
)
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_id")
    private Long payrollId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "payroll_month", nullable = false)
    private LocalDate payrollMonth;

    @Column(name = "base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "days_in_month", nullable = false)
    private Integer daysInMonth;

    @Column(name = "days_worked", nullable = false, precision = 6, scale = 2)
    private BigDecimal daysWorked;

    @Column(name = "earned_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal earnedSalary;

    @Column(name = "bonus_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal bonusAmount;

    @Column(name = "overtime_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal overtimeAmount;

    @Column(name = "advance_deduction", nullable = false, precision = 12, scale = 2)
    private BigDecimal advanceDeduction;

    @Column(name = "other_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal otherDeductions;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }

    public Long getPayrollId() {
        return payrollId;
    }

    public void setPayrollId(Long payrollId) {
        this.payrollId = payrollId;
    }

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

    public BigDecimal getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public Integer getDaysInMonth() {
        return daysInMonth;
    }

    public void setDaysInMonth(Integer daysInMonth) {
        this.daysInMonth = daysInMonth;
    }

    public BigDecimal getDaysWorked() {
        return daysWorked;
    }

    public void setDaysWorked(BigDecimal daysWorked) {
        this.daysWorked = daysWorked;
    }

    public BigDecimal getEarnedSalary() {
        return earnedSalary;
    }

    public void setEarnedSalary(BigDecimal earnedSalary) {
        this.earnedSalary = earnedSalary;
    }

    public BigDecimal getBonusAmount() {
        return bonusAmount;
    }

    public void setBonusAmount(BigDecimal bonusAmount) {
        this.bonusAmount = bonusAmount;
    }

    public BigDecimal getOvertimeAmount() {
        return overtimeAmount;
    }

    public void setOvertimeAmount(BigDecimal overtimeAmount) {
        this.overtimeAmount = overtimeAmount;
    }

    public BigDecimal getAdvanceDeduction() {
        return advanceDeduction;
    }

    public void setAdvanceDeduction(BigDecimal advanceDeduction) {
        this.advanceDeduction = advanceDeduction;
    }

    public BigDecimal getOtherDeductions() {
        return otherDeductions;
    }

    public void setOtherDeductions(BigDecimal otherDeductions) {
        this.otherDeductions = otherDeductions;
    }

    public BigDecimal getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(BigDecimal netSalary) {
        this.netSalary = netSalary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}