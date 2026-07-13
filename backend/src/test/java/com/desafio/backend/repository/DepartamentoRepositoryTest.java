package com.desafio.backend.repository;

import com.desafio.backend.entity.Departamento;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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

    @Test
    void findByDescricaoECodigo_deveFiltrarPorCodigoParcialSemDiferenciarCaixa() {
        Departamento ti = new Departamento();
        ti.setCodigo("TI");
        ti.setDescricao("Tecnologia da Informação");
        repository.save(ti);

        Departamento rh = new Departamento();
        rh.setCodigo("RH");
        rh.setDescricao("Recursos Humanos");
        repository.save(rh);

        Page<Departamento> pagina = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "", "ti", Pageable.unpaged());

        assertThat(pagina.getContent()).hasSize(1);
        assertThat(pagina.getContent().get(0).getCodigo()).isEqualTo("TI");
    }

    @Test
    void findByDescricaoECodigo_deveRetornarVazio_quandoNadaCorresponde() {
        Page<Departamento> pagina = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "inexistente", "", Pageable.unpaged());

        assertThat(pagina.getContent()).isEmpty();
    }

    @Test
    void findByDescricaoECodigo_deveDividirResultadosEmPaginas() {
        for (int i = 1; i <= 3; i++) {
            Departamento departamento = new Departamento();
            departamento.setCodigo("DP" + i);
            departamento.setDescricao("Departamento " + i);
            repository.save(departamento);
        }

        Pageable primeiraPagina = PageRequest.of(0, 2, Sort.by("descricao"));
        Page<Departamento> pagina1 = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "", "", primeiraPagina);

        assertThat(pagina1.getContent()).hasSize(2);
        assertThat(pagina1.getTotalElements()).isEqualTo(3);
        assertThat(pagina1.getTotalPages()).isEqualTo(2);
        assertThat(pagina1.hasNext()).isTrue();

        Page<Departamento> pagina2 = repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                "", "", primeiraPagina.next());

        assertThat(pagina2.getContent()).hasSize(1);
        assertThat(pagina2.hasNext()).isFalse();
    }
}