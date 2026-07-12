package com.desafio.backend.controller;

import com.desafio.backend.entity.Cargo;
import com.desafio.backend.repository.CargoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cargos")
@CrossOrigin(origins = "*") // Essencial para o React
public class CargoController {

    @Autowired
    private CargoRepository repository;

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Cargo cargo) {
        // Validação da Regra de Negócio: Código não pode ser duplicado
        if (repository.existsByCodigo(cargo.getCodigo())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: O código informado já existe em outro cargo.");
        }
        
        Cargo salvo = repository.save(cargo);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    // Aceita ?descricao=X&codigo=Y opcionais — sem eles, retorna tudo (mesmo
    // comportamento de antes). O frontend ainda não usa isso; a lógica de
    // filtro por enquanto continua no cliente e será trocada junto com a
    // implementação de paginação.
    @GetMapping
    public List<Cargo> listar(
            @RequestParam(required = false, defaultValue = "") String descricao,
            @RequestParam(required = false, defaultValue = "") String codigo) {
        return repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(descricao, codigo);
    }

    // Rota para BUSCAR um cargo por ID (Preenche os dados na tela de edição)
    @GetMapping("/{id}")
    public ResponseEntity<Cargo> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Rota para ATUALIZAR um cargo existente
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Cargo atualizado) {
        return repository.findById(id)
                .map(cargo -> {
                    // Validação: não permite mudar para um código que já existe
                    if (!cargo.getCodigo().equals(atualizado.getCodigo()) && 
                        repository.existsByCodigo(atualizado.getCodigo())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Erro: O código informado já existe em outro cargo.");
                    }
                    
                    cargo.setCodigo(atualizado.getCodigo());
                    cargo.setDescricao(atualizado.getDescricao());
                    Cargo salvo = repository.save(cargo);
                    
                    return ResponseEntity.ok(salvo);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}