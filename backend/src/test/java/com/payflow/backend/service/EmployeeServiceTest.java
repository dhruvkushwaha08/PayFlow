package com.payflow.backend.service;

import com.payflow.backend.dto.CreateEmployeeRequest;
import com.payflow.backend.dto.UpdateEmployeeRequest;
import com.payflow.backend.entity.Employee;
import com.payflow.backend.exception.DuplicateEmployeeException;
import com.payflow.backend.exception.EmployeeNotFoundException;
import com.payflow.backend.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void getEmployeeById_shouldReturnEmployee_whenEmployeeExists() {

        Employee employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setEmployeeCode("EMP001");
        employee.setFirstName("Tanjiro");

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        Employee result = employeeService.getEmployeeById(1L);

        assertEquals("EMP001", result.getEmployeeCode());
        assertEquals("Tanjiro", result.getFirstName());
    }

    @Test
    void getEmployeeById_shouldThrowException_whenEmployeeDoesNotExist() {

        when(employeeRepository.findById(999L))
                .thenReturn(Optional.empty());

        assertThrows(
                EmployeeNotFoundException.class,
                () -> employeeService.getEmployeeById(999L)
        );
    }

    @Test
    void createEmployee_shouldCreateActiveEmployee() {

        CreateEmployeeRequest request = new CreateEmployeeRequest();

        request.setBusinessId(1L);
        request.setRoleId(1L);
        request.setEmployeeCode("TEST100");
        request.setFirstName("Test");
        request.setLastName("Employee");
        request.setEmail("test100@example.com");
        request.setPhone("9999999999");
        request.setJoiningDate(LocalDate.of(2026, 9, 20));

        Employee savedEmployee = new Employee();
        savedEmployee.setEmployeeCode("TEST100");
        savedEmployee.setFirstName("Test");
        savedEmployee.setStatus("ACTIVE");

        when(employeeRepository.save(org.mockito.ArgumentMatchers.any(Employee.class)))
                .thenReturn(savedEmployee);

        Employee result = employeeService.createEmployee(request);

        assertEquals("TEST100", result.getEmployeeCode());
        assertEquals("Test", result.getFirstName());
        assertEquals("ACTIVE", result.getStatus());

        verify(employeeRepository).save(org.mockito.ArgumentMatchers.any(Employee.class));
    }

    @Test
    void createEmployee_shouldThrowException_whenEmployeeCodeIsDuplicate() {

        CreateEmployeeRequest request = new CreateEmployeeRequest();

        request.setBusinessId(1L);
        request.setRoleId(1L);
        request.setEmployeeCode("EMP001");
        request.setFirstName("Duplicate");
        request.setLastName("Employee");
        request.setEmail("duplicate@example.com");
        request.setPhone("9999999999");
        request.setJoiningDate(LocalDate.of(2026, 9, 20));

        when(employeeRepository.save(org.mockito.ArgumentMatchers.any(Employee.class)))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("Duplicate"));

        assertThrows(
                DuplicateEmployeeException.class,
                () -> employeeService.createEmployee(request)
        );
    }

    @Test
    void updateEmployee_shouldUpdateEmployee() {

        Employee employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setEmployeeCode("EMP001");
        employee.setFirstName("Old");
        employee.setLastName("Name");
        employee.setStatus("ACTIVE");

        UpdateEmployeeRequest request = new UpdateEmployeeRequest();

        request.setRoleId(2L);
        request.setEmployeeCode("EMP001");
        request.setFirstName("Updated");
        request.setLastName("Employee");
        request.setEmail("updated@example.com");
        request.setPhone("8888888888");
        request.setJoiningDate(LocalDate.of(2026, 9, 20));
        request.setStatus("ACTIVE");

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.save(employee))
                .thenReturn(employee);

        Employee result = employeeService.updateEmployee(1L, request);

        assertEquals("Updated", result.getFirstName());
        assertEquals("Employee", result.getLastName());
        assertEquals("ACTIVE", result.getStatus());

        verify(employeeRepository).save(employee);
    }

    @Test
    void deactivateEmployee_shouldSetStatusToInactive() {

        Employee employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setEmployeeCode("EMP001");
        employee.setStatus("ACTIVE");

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.save(employee))
                .thenReturn(employee);

        Employee result = employeeService.deactivateEmployee(1L);

        assertEquals("INACTIVE", result.getStatus());

        verify(employeeRepository).save(employee);
    }
}