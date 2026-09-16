package com.payflow.backend.repository;

import com.payflow.backend.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {

    List<SalaryStructure> findByEmployeeId(Long employeeId);
}