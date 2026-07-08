package com.desafio.backend.repository;

import com.desafio.backend.entity.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    // Regra: CPF não pode ser duplicado
    boolean existsByCpf(String cpf);
}