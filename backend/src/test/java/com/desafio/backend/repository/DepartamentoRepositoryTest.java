package com.desafio.backend.repository;

import com.desafio.backend.entity.Departamento;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class DepartamentoRepositoryTest {

    @Autowired
    private DepartamentoRepository repository;

    @Test
    void existsByCodigo_deveRetornarTrue_quandoCodigoJaCadastrado() {
        Departamento departamento = new Departamento();
        departamento.setCodigo("TI");
        departamento.setDescricao("Tecnologia da Informação");
        repository.save(departamento);

        assertThat(repository.existsByCodigo("TI")).isTrue();
    }

    @Test
    void existsByCodigo_deveRetornarFalse_quandoCodigoNaoCadastrado() {
        assertThat(repository.existsByCodigo("INEXISTENTE")).isFalse();
    }

    @Test
    void save_deveGerarIdAutomaticamente() {
        Departamento departamento = new Departamento();
        departamento.setCodigo("RH");
        departamento.setDescricao("Recursos Humanos");

        Departamento salvo = repository.save(departamento);

        assertThat(salvo.getId()).isNotNull();
    }
}