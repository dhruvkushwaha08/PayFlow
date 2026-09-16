package com.payflow.backend.service;

import com.payflow.backend.dto.CreateOvertimeRequest;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.entity.Overtime;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.exception.InactiveEmployeeException;
import com.payflow.backend.exception.InvalidOvertimeException;
import com.payflow.backend.exception.OvertimeNotFoundException;
import com.payflow.backend.repository.EmployeeRepository;
import com.payflow.backend.repository.OvertimeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class OvertimeService {

    private final OvertimeRepository overtimeRepository;
    private final EmployeeRepository employeeRepository;

    public OvertimeService(
            OvertimeRepository overtimeRepository,
            EmployeeRepository employeeRepository) {
        this.overtimeRepository = overtimeRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<Overtime> getAllOvertime() {
        return overtimeRepository.findAll();
    }

    public Overtime getOvertimeById(Long id) {
        return overtimeRepository.findById(id)
                .orElseThrow(() -> new OvertimeNotFoundException(id));
    }

    public List<Overtime> getOvertimeByEmployeeId(Long employeeId) {
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        return overtimeRepository.findByEmployeeId(employeeId);
    }

    public Overtime createOvertime(CreateOvertimeRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new EmployeeNotFoundException(request.getEmployeeId()));

        if (!"ACTIVE".equals(employee.getStatus())) {
            throw new InactiveEmployeeException(request.getEmployeeId());
        }

        if (request.getOvertimeDate().isAfter(LocalDate.now())) {
            throw new InvalidOvertimeException(
                    "Overtime date cannot be in the future");
        }

        if (request.getOvertimeDate().isBefore(employee.getJoiningDate())) {
            throw new InvalidOvertimeException(
                    "Overtime date cannot be before employee joining date");
        }

        BigDecimal amount = request.getHours()
                .multiply(request.getRatePerHour());

        Overtime overtime = new Overtime();

        overtime.setEmployeeId(request.getEmployeeId());
        overtime.setOvertimeDate(request.getOvertimeDate());
        overtime.setHours(request.getHours());
        overtime.setRatePerHour(request.getRatePerHour());
        overtime.setAmount(amount);
        overtime.setNotes(request.getNotes());

        return overtimeRepository.saveAndFlush(overtime);
    }
}