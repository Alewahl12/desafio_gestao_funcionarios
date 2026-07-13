package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {
    boolean existsByCodigo(String codigo);

    // Filtro parcial e sem diferenciar maiúsculas/minúsculas nos dois campos,
    // agora devolvendo só uma página por vez em vez da lista inteira.
    Page<Cargo> findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(String descricao, String codigo, Pageable pageable);
}