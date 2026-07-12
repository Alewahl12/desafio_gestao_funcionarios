package com.desafio.backend.repository;

import com.desafio.backend.entity.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
    boolean existsByCodigo(String codigo);

    // Filtro parcial e sem diferenciar maiúsculas/minúsculas nos dois campos.
    List<Departamento> findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(String descricao, String codigo);
}