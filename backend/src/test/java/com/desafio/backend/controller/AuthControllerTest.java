package com.desafio.backend.controller;

import com.desafio.backend.dto.AuthRequest;
import com.desafio.backend.entity.Usuario;
import com.desafio.backend.repository.UsuarioRepository;
import com.desafio.backend.util.PasswordUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UsuarioRepository repository;

    @InjectMocks
    private AuthController controller;

    @Test
    void registrar_deveRetornar201_quandoDadosValidos() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin");
        req.setSenha("123456");

        when(repository.existsByLogin("admin")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> {
            Usuario u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        ResponseEntity<?> res = controller.registrar(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void registrar_deveRetornar400_quandoSenhaCurta() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin");
        req.setSenha("123");

        ResponseEntity<?> res = controller.registrar(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void registrar_deveRetornar400_quandoDadosNulosOuEmBranco() {
        AuthRequest req = new AuthRequest();
        ResponseEntity<?> res = controller.registrar(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        req.setLogin("");
        req.setSenha("");
        res = controller.registrar(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void registrar_deveRetornar400_quandoLoginJaExiste() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin");
        req.setSenha("123456");
        when(repository.existsByLogin("admin")).thenReturn(true);
        
        ResponseEntity<?> res = controller.registrar(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void login_deveRetornar200_quandoCredenciaisCorretas() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin");
        req.setSenha("123456");

        Usuario u = new Usuario();
        u.setId(1L);
        u.setLogin("admin");
        u.setSenhaHash(PasswordUtil.gerarHash("123456"));

        when(repository.findByLogin("admin")).thenReturn(Optional.of(u));

        ResponseEntity<?> res = controller.login(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void login_deveRetornar400_quandoDadosNulos() {
        ResponseEntity<?> res = controller.login(new AuthRequest());
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void login_deveRetornar401_quandoSenhaInvalida() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin");
        req.setSenha("errada");

        Usuario u = new Usuario();
        u.setSenhaHash(PasswordUtil.gerarHash("correta123"));

        when(repository.findByLogin("admin")).thenReturn(Optional.of(u));
        ResponseEntity<?> res = controller.login(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void login_deveRetornar401_quandoUsuarioNaoExiste() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin");
        req.setSenha("123456");

        when(repository.findByLogin("admin")).thenReturn(Optional.empty());
        ResponseEntity<?> res = controller.login(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void registrar_deveRetornar400_quandoDadosSaoApenasEspacos() {
        AuthRequest req = new AuthRequest();
        req.setLogin("   ");
        req.setSenha("      ");
        ResponseEntity<?> res = controller.registrar(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void login_deveRetornar401_quandoDadosSaoApenasEspacos() {
        AuthRequest req = new AuthRequest();
        req.setLogin("   ");
        req.setSenha("      ");
        ResponseEntity<?> res = controller.login(req);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}