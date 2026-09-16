package com.payflow.backend.controller;

import com.payflow.backend.dto.CreateBonusRequest;
import com.payflow.backend.entity.Bonus;
import com.payflow.backend.service.BonusService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bonuses")
public class BonusController {

    private final BonusService bonusService;

    public BonusController(BonusService bonusService) {
        this.bonusService = bonusService;
    }

    @GetMapping
    public List<Bonus> getAllBonuses() {
        return bonusService.getAllBonuses();
    }

    @GetMapping("/{id}")
    public Bonus getBonusById(@PathVariable Long id) {
        return bonusService.getBonusById(id);
    }

    @GetMapping("/employee/{employeeId}")
    public List<Bonus> getBonusesByEmployeeId(
            @PathVariable Long employeeId) {
        return bonusService.getBonusesByEmployeeId(employeeId);
    }

    @PostMapping
    public ResponseEntity<Bonus> createBonus(
            @Valid @RequestBody CreateBonusRequest request) {

        Bonus bonus = bonusService.createBonus(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bonus);
    }
}