package com.payflow.backend.service;

import com.payflow.backend.dto.CreateEmployeeRequest;
import com.payflow.backend.dto.UpdateEmployeeRequest;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.exception.DuplicateEmployeeException;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.repository.EmployeeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    public Employee createEmployee(CreateEmployeeRequest request) {

        Employee employee = new Employee();

        employee.setBusinessId(request.getBusinessId());
        employee.setRoleId(request.getRoleId());
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus("ACTIVE");

        try {
            return employeeRepository.save(employee);
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateEmployeeException(request.getEmployeeCode());
        }
    }

    public Employee updateEmployee(Long id, UpdateEmployeeRequest request) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employee.setRoleId(request.getRoleId());
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus());

        return employeeRepository.save(employee);
    }

    public Employee deactivateEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));

        employee.setStatus("INACTIVE");

        return employeeRepository.save(employee);
    }
}