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

    // Aceita ?descricao=X&codigo=Y opcionais — sem eles, retorna tudo.
    @GetMapping
    public List<Departamento> listar(
            @RequestParam(required = false, defaultValue = "") String descricao,
            @RequestParam(required = false, defaultValue = "") String codigo) {
        return repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(descricao, codigo);
    }

    // Rota para BUSCAR um departamento por ID (Preenche os dados na tela de edição)
    @GetMapping("/{id}")
    public ResponseEntity<Departamento> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Rota para ATUALIZAR um departamento existente
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Departamento atualizado) {
        return repository.findById(id)
                .map(departamento -> {
                    // Se o usuário tentar mudar para um código que já existe em outro departamento, bloqueia
                    if (!departamento.getCodigo().equals(atualizado.getCodigo()) && 
                        repository.existsByCodigo(atualizado.getCodigo())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Erro: O código informado já existe em outro departamento.");
                    }
                    
                    // Atualiza os dados e salva
                    departamento.setCodigo(atualizado.getCodigo());
                    departamento.setDescricao(atualizado.getDescricao());
                    Departamento salvo = repository.save(departamento);
                    
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}