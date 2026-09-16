package com.payflow.backend.controller;

import com.payflow.backend.dto.CreateOvertimeRequest;
import com.payflow.backend.entity.Overtime;
import com.payflow.backend.service.OvertimeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overtime")
public class OvertimeController {

    private final OvertimeService overtimeService;

    public OvertimeController(OvertimeService overtimeService) {
        this.overtimeService = overtimeService;
    }

    @GetMapping
    public List<Overtime> getAllOvertime() {
        return overtimeService.getAllOvertime();
    }

    @GetMapping("/{id}")
    public Overtime getOvertimeById(@PathVariable Long id) {
        return overtimeService.getOvertimeById(id);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Overtime> getOvertimeByEmployeeId(
            @PathVariable Long employeeId) {
        return overtimeService.getOvertimeByEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<Overtime> createOvertime(
            @Valid @RequestBody CreateOvertimeRequest request) {

        Overtime overtime = overtimeService.createOvertime(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(overtime);
    }
}