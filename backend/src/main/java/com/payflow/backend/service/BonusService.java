package com.payflow.backend.service;

import com.payflow.backend.dto.CreateBonusRequest;
import com.payflow.backend.entity.Bonus;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.exception.InactiveEmployeeException;
import com.payflow.backend.exception.InvalidBonusException;
import com.payflow.backend.exception.BonusNotFoundException;
import com.payflow.backend.repository.BonusRepository;
import com.payflow.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BonusService {

    private final BonusRepository bonusRepository;
    private final EmployeeRepository employeeRepository;

    public BonusService(
            BonusRepository bonusRepository,
            EmployeeRepository employeeRepository) {
        this.bonusRepository = bonusRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Bonus> getAllBonuses() {
        return bonusRepository.findAll();
    }

    public Bonus getBonusById(Long id) {
        return bonusRepository.findById(id)
                .orElseThrow(() -> new BonusNotFoundException(id));
    }

    public List<Bonus> getBonusesByEmployeeId(Long employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        return bonusRepository.findByEmployeeId(employeeId);
    }

    public Bonus createBonus(CreateBonusRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new EmployeeNotFoundException(request.getEmployeeId()));

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(request.getEmployeeId());
        }

        if (request.getBonusDate().isAfter(LocalDate.now())) {
            throw new InvalidBonusException(
                    "Bonus date cannot be in the future");
        }

        if ("PERCENTAGE".equals(request.getBonusType())
                && request.getValue().compareTo(new java.math.BigDecimal("100")) > 0) {
            throw new InvalidBonusException(
                    "Percentage bonus cannot be greater than 100");
        }

        Bonus bonus = new Bonus();

        bonus.setEmployeeId(request.getEmployeeId());
        bonus.setBonusType(request.getBonusType());
        bonus.setValue(request.getValue());
        bonus.setBonusDate(request.getBonusDate());
        bonus.setReason(request.getReason());

        return bonusRepository.saveAndFlush(bonus);
    }
}