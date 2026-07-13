package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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

        Page<Cargo> pagina = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "", "", Pageable.unpaged());

        assertThat(pagina.getContent()).hasSize(1);
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

        Page<Cargo> pagina = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "desenvolv", "", Pageable.unpaged());

        assertThat(pagina.getContent()).hasSize(1);
        assertThat(pagina.getContent().get(0).getCodigo()).isEqualTo("DEV");
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

        Page<Cargo> pagina = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "Desenvolvedor", "QA", Pageable.unpaged());

        assertThat(pagina.getContent()).isEmpty();
    }

    @Test
    void findByDescricaoECodigo_deveDividirResultadosEmPaginas() {
        for (int i = 1; i <= 3; i++) {
            Cargo cargo = new Cargo();
            cargo.setCodigo("CG" + i);
            cargo.setDescricao("Cargo " + i);
            repository.save(cargo);
        }

        Pageable primeiraPagina = PageRequest.of(0, 2, Sort.by("descricao"));
        Page<Cargo> pagina1 = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "", "", primeiraPagina);

        assertThat(pagina1.getContent()).hasSize(2);
        assertThat(pagina1.getTotalElements()).isEqualTo(3);
        assertThat(pagina1.getTotalPages()).isEqualTo(2);
        assertThat(pagina1.hasNext()).isTrue();

        Page<Cargo> pagina2 = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "", "", primeiraPagina.next());

        assertThat(pagina2.getContent()).hasSize(1);
        assertThat(pagina2.hasNext()).isFalse();
    }
}