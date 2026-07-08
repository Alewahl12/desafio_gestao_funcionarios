package com.desafio.backend.repository;

import com.desafio.backend.entity.Vinculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VinculoRepository extends JpaRepository<Vinculo, Long> {
}