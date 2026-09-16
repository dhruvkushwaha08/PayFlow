package com.payflow.backend.repository;

import com.payflow.backend.entity.Bonus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BonusRepository extends JpaRepository<Bonus, Long> {

    List<Bonus> findByEmployeeId(Long employeeId);
}