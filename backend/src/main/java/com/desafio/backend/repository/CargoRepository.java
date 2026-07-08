package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {
    boolean existsByCodigo(String codigo);
}