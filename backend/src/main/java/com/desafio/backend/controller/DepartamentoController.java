package com.desafio.backend.controller;

import com.desafio.backend.entity.Departamento;
import com.desafio.backend.repository.DepartamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departamentos")
@CrossOrigin(origins = "*") // Libera o acesso para o React (Frontend) depois!
public class DepartamentoController {

    @Autowired
    private DepartamentoRepository repository;

    // Rota para CRIAR um departamento
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Departamento departamento) {
        // Validação da Regra de Negócio: Código não pode ser duplicado
        if (repository.existsByCodigo(departamento.getCodigo())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: O código informado já existe em outro departamento.");
        }
        
        Departamento salvo = repository.save(departamento);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // Rota para LISTAR todos os departamentos
    @GetMapping
    public List<Departamento> listar() {
        return repository.findAll();
    }
}