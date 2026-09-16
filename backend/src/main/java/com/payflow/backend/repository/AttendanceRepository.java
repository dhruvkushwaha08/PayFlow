package com.payflow.backend.repository;

import com.payflow.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );
}