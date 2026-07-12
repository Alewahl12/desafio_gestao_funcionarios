package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CargoRepositoryTest {

    @Autowired
    private CargoRepository repository;

    @Test
    void existsByCodigo_deveRetornarTrue_quandoCodigoJaCadastrado() {
        Cargo cargo = new Cargo();
        cargo.setCodigo("DEV");
        cargo.setDescricao("Desenvolvedor");
        repository.save(cargo);

        assertThat(repository.existsByCodigo("DEV")).isTrue();
    }

    @Test
    void existsByCodigo_deveRetornarFalse_quandoCodigoNaoCadastrado() {
        assertThat(repository.existsByCodigo("INEXISTENTE")).isFalse();
    }

    @Test
    void save_deveGerarIdAutomaticamente() {
        Cargo cargo = new Cargo();
        cargo.setCodigo("QA");
        cargo.setDescricao("Analista de Qualidade");

        Cargo salvo = repository.save(cargo);

        assertThat(salvo.getId()).isNotNull();
    }
}