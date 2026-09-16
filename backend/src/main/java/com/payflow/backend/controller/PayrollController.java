package com.payflow.backend.controller;

import com.payflow.backend.dto.GeneratePayrollRequest;
import com.payflow.backend.entity.Payroll;
import com.payflow.backend.service.PayrollService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // =========================================================
    // GENERATE PAYROLL
    // =========================================================

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public Payroll generatePayroll(
            @Valid @RequestBody GeneratePayrollRequest request) {

        return payrollService.generatePayroll(request);
    }

    // =========================================================
    // GET ALL PAYROLL
    // =========================================================

    @GetMapping
    public List<Payroll> getAllPayroll() {

        return payrollService.getAllPayroll();
    }

    // =========================================================
    // GET PAYROLL BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Payroll getPayrollById(
            @PathVariable Long id) {

        return payrollService.getPayrollById(id);
    }

    // =========================================================
    // GET PAYROLL BY EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public List<Payroll> getPayrollByEmployee(
            @PathVariable Long employeeId) {

        return payrollService.getPayrollByEmployeeId(employeeId);
    }

    // =========================================================
    // GET PAYROLL BY MONTH
    // =========================================================

    @GetMapping("/month/{payrollMonth}")
    public List<Payroll> getPayrollByMonth(
            @PathVariable String payrollMonth) {

        return payrollService.getPayrollByMonth(payrollMonth);
    }

    // =========================================================
    // FINALIZE PAYROLL
    // =========================================================

    @PatchMapping("/{id}/finalize")
    public Payroll finalizePayroll(
            @PathVariable Long id) {

        return payrollService.finalizePayroll(id);
    }
}