package com.desafio.backend.entity;

import com.desafio.backend.dto.AuthRequest;
import com.desafio.backend.dto.UsuarioResponse;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class ModelTest {

    @Test
    void testarGettersESetters() {
        AuthRequest req = new AuthRequest();
        req.setLogin("admin"); req.setSenha("123");
        assertThat(req.getLogin()).isEqualTo("admin");

        UsuarioResponse res = new UsuarioResponse(1L, "admin");
        assertThat(res.getId()).isEqualTo(1L);

        Usuario u = new Usuario();
        u.setId(1L); u.setLogin("admin"); u.setSenhaHash("hash");
        assertThat(u.getId()).isEqualTo(1L);

        Departamento d = new Departamento();
        d.setId(1L); d.setCodigo("TI"); d.setDescricao("Tecnologia");
        assertThat(d.getCodigo()).isEqualTo("TI");

        Cargo c = new Cargo();
        c.setId(1L); c.setCodigo("DEV"); c.setDescricao("Desenvolvedor");
        assertThat(c.getDescricao()).isEqualTo("Desenvolvedor");

        Funcionario f = new Funcionario();
        f.setId(1L); f.setNome("Nome"); f.setCpf("123");
        assertThat(f.getNome()).isEqualTo("Nome");

        Vinculo v = new Vinculo();
        v.setId(1L); v.setEmpresa("Empresa"); v.setMatricula("123");
        v.setFuncionario(f); v.setCargo(c); v.setDepartamento(d);
        assertThat(v.getEmpresa()).isEqualTo("Empresa");
    }
}