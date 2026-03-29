package com.example.demo.repository;

import com.example.demo.model.entity.RecipientMail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipientMailRepository extends JpaRepository<RecipientMail, Long> {
    Optional<RecipientMail> findByEmail(String email);
    void deleteByEmail(String email);
}
