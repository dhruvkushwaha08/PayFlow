package com.payflow.backend.repository;

import com.payflow.backend.entity.Advance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdvanceRepository extends JpaRepository<Advance, Long> {

    List<Advance> findByEmployeeId(Long employeeId);
}