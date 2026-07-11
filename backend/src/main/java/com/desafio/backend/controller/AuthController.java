package com.desafio.backend.controller;

import com.desafio.backend.dto.AuthRequest;
import com.desafio.backend.dto.UsuarioResponse;
import com.desafio.backend.entity.Usuario;
import com.desafio.backend.repository.UsuarioRepository;
import com.desafio.backend.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UsuarioRepository repository;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody AuthRequest dados) {
        if (dados.getLogin() == null || dados.getLogin().isBlank() ||
            dados.getSenha() == null || dados.getSenha().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: Login e senha são obrigatórios.");
        }

        if (dados.getSenha().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: A senha deve ter pelo menos 6 caracteres.");
        }

        if (repository.existsByLogin(dados.getLogin())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: Este login já está em uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setLogin(dados.getLogin());
        usuario.setSenhaHash(PasswordUtil.gerarHash(dados.getSenha()));

        Usuario salvo = repository.save(usuario);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UsuarioResponse(salvo.getId(), salvo.getLogin()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest dados) {
        if (dados.getLogin() == null || dados.getSenha() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro: Login e senha são obrigatórios.");
        }

        return repository.findByLogin(dados.getLogin())
                .map(usuario -> {
                    if (!PasswordUtil.verificar(dados.getSenha(), usuario.getSenhaHash())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("Erro: Login ou senha inválidos.");
                    }
                    return ResponseEntity.ok(new UsuarioResponse(usuario.getId(), usuario.getLogin()));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Erro: Login ou senha inválidos."));
    }
}