package com.example.demo.repository;

import com.example.demo.model.entity.RiskEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RiskEventRepository extends JpaRepository<RiskEvent, Long> {

    List<RiskEvent> findTop20ByOrderByTriggeredAtDesc();

    List<RiskEvent> findByTriggeredAtAfterOrderByTriggeredAtDesc(LocalDateTime since);
}
