package com.desafio.backend.controller;

import com.desafio.backend.entity.Funcionario;
import com.desafio.backend.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/funcionarios")
@CrossOrigin(origins = "*")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository repository;

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Funcionario funcionario) {
        // Validação da Regra de Negócio: CPF não pode ser duplicado
        if (repository.existsByCpf(funcionario.getCpf())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: O CPF informado já existe.");
        }
        
        Funcionario salvo = repository.save(funcionario);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @GetMapping
    public List<Funcionario> listar() {
        return repository.findAll();
    }
}