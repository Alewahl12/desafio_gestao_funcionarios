package com.desafio.backend.specification;

import com.desafio.backend.entity.Funcionario;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;

import static org.mockito.Mockito.*;
@SuppressWarnings("unchecked")
class FuncionarioSpecificationBranchTest {

    @Test
    void deveExecutarLambdaComTodosOsFiltros() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                "Nome", "111", "MAT1", "Empresa", 1L, 2L
        );
        
        Root<Funcionario> root = mock(Root.class, RETURNS_DEEP_STUBS);
        CriteriaQuery<?> query = mock(CriteriaQuery.class, RETURNS_DEEP_STUBS);
        CriteriaBuilder cb = mock(CriteriaBuilder.class, RETURNS_DEEP_STUBS);
        
        Join<Object, Object> joinMock = mock(Join.class, RETURNS_DEEP_STUBS);
        when(root.join(anyString(), any(JoinType.class))).thenReturn(joinMock);
        
        spec.toPredicate(root, query, cb);
    }

    @Test
    void deveExecutarLambdaSemNenhumFiltro() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                null, null, null, null, null, null
        );
        
        Root<Funcionario> root = mock(Root.class, RETURNS_DEEP_STUBS);
        CriteriaQuery<?> query = mock(CriteriaQuery.class, RETURNS_DEEP_STUBS);
        CriteriaBuilder cb = mock(CriteriaBuilder.class, RETURNS_DEEP_STUBS);
        
        spec.toPredicate(root, query, cb);
    }

    @Test
    void deveExecutarLambdaComFiltrosVaziosEspacos() {
        Specification<Funcionario> spec = FuncionarioSpecification.comFiltros(
                "", "   ", "", "  ", null, null
        );
        
        Root<Funcionario> root = mock(Root.class, RETURNS_DEEP_STUBS);
        CriteriaQuery<?> query = mock(CriteriaQuery.class, RETURNS_DEEP_STUBS);
        CriteriaBuilder cb = mock(CriteriaBuilder.class, RETURNS_DEEP_STUBS);
        
        spec.toPredicate(root, query, cb);
    }
}