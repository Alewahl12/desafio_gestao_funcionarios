package com.desafio.backend.controller;

import com.desafio.backend.entity.Vinculo;
import com.desafio.backend.repository.VinculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vinculos")
@CrossOrigin(origins = "*")
public class VinculoController {

    @Autowired
    private VinculoRepository repository;

    @PostMapping
    public ResponseEntity<Vinculo> criar(@RequestBody Vinculo vinculo) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(vinculo));
    }

    @GetMapping
    public List<Vinculo> listar() {
        return repository.findAll();
    }
}