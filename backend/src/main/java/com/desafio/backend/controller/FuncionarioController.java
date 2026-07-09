package com.desafio.backend.controller;

import com.desafio.backend.entity.Funcionario;
import com.desafio.backend.entity.Vinculo;
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

    @GetMapping
    public List<Funcionario> listar() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Funcionario> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Funcionario funcionario) {
        if (repository.existsByCpf(funcionario.getCpf())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: O CPF informado já está cadastrado.");
        }
        
        // 1. Guarda os vínculos e limpa do funcionário para não dar conflito no Hibernate
        List<Vinculo> vinculos = funcionario.getVinculos();
        funcionario.setVinculos(new java.util.ArrayList<>());
        
        // 2. Salva o Funcionário primeiro
        Funcionario salvo = repository.save(funcionario);
        
        // 3. Associa os vínculos ao funcionário salvo e atualiza
        if (vinculos != null && !vinculos.isEmpty()) {
            vinculos.forEach(v -> v.setFuncionario(salvo));
            salvo.getVinculos().addAll(vinculos);
            repository.save(salvo);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Funcionario atualizado) {
        return repository.findById(id)
                .map(funcionario -> {
                    if (!funcionario.getCpf().equals(atualizado.getCpf()) && 
                        repository.existsByCpf(atualizado.getCpf())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Erro: O CPF informado já está cadastrado em outro funcionário.");
                    }
                    
                    funcionario.setNome(atualizado.getNome());
                    funcionario.setCpf(atualizado.getCpf());
                    
                    funcionario.getVinculos().clear(); 
                    if (atualizado.getVinculos() != null) {
                        atualizado.getVinculos().forEach(v -> {
                            v.setFuncionario(funcionario); 
                            funcionario.getVinculos().add(v); 
                        });
                    }
                    
                    Funcionario salvo = repository.save(funcionario);
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}