package com.payflow.backend.repository;

import com.payflow.backend.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    boolean existsByEmployeeIdAndPayrollMonth(
            Long employeeId,
            LocalDate payrollMonth
    );

    List<Payroll> findByEmployeeId(Long employeeId);

    List<Payroll> findByPayrollMonth(LocalDate payrollMonth);
}