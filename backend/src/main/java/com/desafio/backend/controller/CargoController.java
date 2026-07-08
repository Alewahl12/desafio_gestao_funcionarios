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

    @GetMapping
    public List<Cargo> listar() {
        return repository.findAll();
    }
}