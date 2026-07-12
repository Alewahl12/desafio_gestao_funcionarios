package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.List;

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

    @Test
    void findByDescricaoECodigo_deveRetornarTudo_quandoFiltrosVazios() {
        Cargo cargo = new Cargo();
        cargo.setCodigo("DEV");
        cargo.setDescricao("Desenvolvedor");
        repository.save(cargo);

        assertThat(repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase("", ""))
                .hasSize(1);
    }

    @Test
    void findByDescricaoECodigo_deveFiltrarPorDescricaoParcialSemDiferenciarCaixa() {
        Cargo dev = new Cargo();
        dev.setCodigo("DEV");
        dev.setDescricao("Desenvolvedor");
        repository.save(dev);

        Cargo qa = new Cargo();
        qa.setCodigo("QA");
        qa.setDescricao("Analista de Qualidade");
        repository.save(qa);

        List<Cargo> resultado = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase("desenvolv", "");

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getCodigo()).isEqualTo("DEV");
    }

    @Test
    void findByDescricaoECodigo_deveCombinarOsDoisFiltros() {
        Cargo dev = new Cargo();
        dev.setCodigo("DEV");
        dev.setDescricao("Desenvolvedor");
        repository.save(dev);

        // Existe cargo com "Desenvolvedor" e existe cargo com código "QA",
        // mas nenhum satisfaz as duas condições ao mesmo tempo.
        Cargo qa = new Cargo();
        qa.setCodigo("QA");
        qa.setDescricao("Analista de Qualidade");
        repository.save(qa);

        List<Cargo> resultado = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase("Desenvolvedor", "QA");

        assertThat(resultado).isEmpty();
    }
}