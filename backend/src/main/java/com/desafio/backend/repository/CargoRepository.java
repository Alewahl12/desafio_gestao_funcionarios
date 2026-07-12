package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CargoRepository extends JpaRepository<Cargo, Long> {
    boolean existsByCodigo(String codigo);

    // Filtro parcial e sem diferenciar maiúsculas/minúsculas nos dois campos.
    // Chamando com "" nos dois parâmetros, o efeito é o mesmo de findAll().
    List<Cargo> findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(String descricao, String codigo);
}