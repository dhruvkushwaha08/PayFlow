package com.payflow.backend.repository;

import com.payflow.backend.entity.Overtime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OvertimeRepository extends JpaRepository<Overtime, Long> {

    List<Overtime> findByEmployeeId(Long employeeId);
}