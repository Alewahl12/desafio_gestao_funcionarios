package com.desafio.backend.specification;

import com.desafio.backend.entity.Funcionario;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import static org.assertj.core.api.Assertions.assertThat;

class FuncionarioSpecificationTest {

    @Test
    void deveCriarSpecificationVazia_quandoSemFiltros() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                null, null, null, null, null, null
        );
        assertThat(spec).isNotNull();
    }

    @Test
    void deveCriarSpecification_quandoTodosFiltrosPreenchidos() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                "Nome", "123", "MAT1", "Empresa", 1L, 1L
        );
        assertThat(spec).isNotNull();
    }

    @Test
    void deveIgnorarFiltrosVazios() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                "", "   ", "", "  ", null, null
        );
        assertThat(spec).isNotNull();
    }

    @Test
    void deveCriarSpecification_quandoApenasFiltroNomePreenchido() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                "Apenas Nome", null, null, null, null, null
        );
        assertThat(spec).isNotNull();
    }

    @Test
    void deveCriarSpecification_quandoApenasFiltroCargoPreenchido() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                null, null, null, null, 1L, null
        );
        assertThat(spec).isNotNull();
    }

    @Test
    void deveCriarSpecification_testandoFiltrosRestantesIsolados() {
        assertThat(FuncionarioSpecification.comFiltros(null, "111", null, null, null, null)).isNotNull();
        assertThat(FuncionarioSpecification.comFiltros(null, null, "MAT", null, null, null)).isNotNull();
        assertThat(FuncionarioSpecification.comFiltros(null, null, null, "Emp", null, null)).isNotNull();
        assertThat(FuncionarioSpecification.comFiltros(null, null, null, null, null, 1L)).isNotNull();
    }
}