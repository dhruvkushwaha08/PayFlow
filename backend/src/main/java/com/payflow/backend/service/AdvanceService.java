package com.payflow.backend.service;

import com.payflow.backend.dto.CreateAdvanceRequest;
import com.payflow.backend.dto.UpdateAdvanceStatusRequest;
import com.payflow.backend.entity.Advance;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.exception.AdvanceNotFoundException;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.exception.InactiveEmployeeException;
import com.payflow.backend.exception.InvalidAdvanceException;
import com.payflow.backend.repository.AdvanceRepository;
import com.payflow.backend.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AdvanceService {

    private final AdvanceRepository advanceRepository;
    private final EmployeeRepository employeeRepository;

    public AdvanceService(
            AdvanceRepository advanceRepository,
            EmployeeRepository employeeRepository) {

        this.advanceRepository = advanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Advance> getAllAdvances() {
        return advanceRepository.findAll();
    }

    public Advance getAdvanceById(Long id) {

        return advanceRepository.findById(id)
                .orElseThrow(() ->
                        new AdvanceNotFoundException(id));
    }

    public List<Advance> getAdvancesByEmployeeId(Long employeeId) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new EmployeeNotFoundException(employeeId));

        return advanceRepository.findByEmployeeId(employeeId);
    }

    public Advance createAdvance(CreateAdvanceRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new EmployeeNotFoundException(
                                request.getEmployeeId()));

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(
                    request.getEmployeeId());
        }

        LocalDate today = LocalDate.now();

        if (request.getAdvanceDate().isAfter(today)) {
            throw new InvalidAdvanceException(
                    "Advance date cannot be in the future");
        }

        Advance advance = new Advance();

        advance.setEmployeeId(request.getEmployeeId());
        advance.setAmount(request.getAmount());
        advance.setAdvanceDate(request.getAdvanceDate());

        // Every new advance starts as PENDING.
        advance.setStatus("PENDING");

        advance.setNotes(request.getNotes());

        return advanceRepository.saveAndFlush(advance);
    }

    public Advance updateAdvanceStatus(
            Long id,
            UpdateAdvanceStatusRequest request) {

        Advance advance = advanceRepository.findById(id)
                .orElseThrow(() ->
                        new AdvanceNotFoundException(id));

        String currentStatus = advance.getStatus();
        String newStatus = request.getStatus();

        if (!"PENDING".equals(currentStatus)) {
            throw new InvalidAdvanceException(
                    "Advance status cannot be changed because it is already "
                            + currentStatus);
        }

        if (!"DEDUCTED".equals(newStatus)
                && !"CANCELLED".equals(newStatus)) {

            throw new InvalidAdvanceException(
                    "Status can only be changed to DEDUCTED or CANCELLED");
        }

        advance.setStatus(newStatus);

        return advanceRepository.saveAndFlush(advance);
    }
}