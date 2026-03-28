package com.example.demo.repository;

import com.example.demo.model.entity.SolarDataSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SolarDataRepository extends JpaRepository<SolarDataSnapshot, Long> {

    List<SolarDataSnapshot> findByCapturedAtBetweenOrderByCapturedAtDesc(
            LocalDateTime start, LocalDateTime end);

    List<SolarDataSnapshot> findTop100ByOrderByCapturedAtDesc();
}
