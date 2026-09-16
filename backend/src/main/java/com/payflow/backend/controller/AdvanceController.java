package com.payflow.backend.controller;

import com.payflow.backend.dto.CreateAdvanceRequest;
import com.payflow.backend.dto.UpdateAdvanceStatusRequest;
import com.payflow.backend.entity.Advance;
import com.payflow.backend.service.AdvanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/advances")
public class AdvanceController {

    private final AdvanceService advanceService;

    public AdvanceController(AdvanceService advanceService) {
        this.advanceService = advanceService;
    }

    @GetMapping
    public List<Advance> getAllAdvances() {
        return advanceService.getAllAdvances();
    }

    @GetMapping("/{id}")
    public Advance getAdvanceById(@PathVariable Long id) {
        return advanceService.getAdvanceById(id);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Advance> getAdvancesByEmployeeId(
            @PathVariable Long employeeId) {

        return advanceService.getAdvancesByEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<Advance> createAdvance(
            @Valid @RequestBody CreateAdvanceRequest request) {

        Advance advance = advanceService.createAdvance(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(advance);
    }

    @PatchMapping("/{id}/status")
    public Advance updateAdvanceStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdvanceStatusRequest request) {

        return advanceService.updateAdvanceStatus(id, request);
    }
}