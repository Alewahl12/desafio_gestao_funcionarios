package com.desafio.backend.controller;

import com.desafio.backend.entity.Departamento;
import com.desafio.backend.repository.DepartamentoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepartamentoControllerTest {

    @Mock
    private DepartamentoRepository repository;

    @InjectMocks
    private DepartamentoController controller;

    @Test
    void criar_deveRetornar201_quandoCodigoNaoExiste() {
        Departamento novoDepartamento = new Departamento();
        novoDepartamento.setCodigo("TI");
        novoDepartamento.setDescricao("Tecnologia da Informação");

        when(repository.existsByCodigo("TI")).thenReturn(false);
        when(repository.save(novoDepartamento)).thenReturn(novoDepartamento);

        ResponseEntity<?> resposta = controller.criar(novoDepartamento);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resposta.getBody()).isEqualTo(novoDepartamento);
        verify(repository).save(novoDepartamento);
    }

    @Test
    void criar_deveRetornar400_quandoCodigoJaExiste() {
        Departamento novoDepartamento = new Departamento();
        novoDepartamento.setCodigo("TI");
        novoDepartamento.setDescricao("Tecnologia da Informação");

        when(repository.existsByCodigo("TI")).thenReturn(true);

        ResponseEntity<?> resposta = controller.criar(novoDepartamento);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void listar_deveRetornarTodosDepartamentos_quandoFiltrosVazios() {
        when(repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase("", ""))
                .thenReturn(List.of(new Departamento(), new Departamento()));

        List<Departamento> resultado = controller.listar("", "");

        assertThat(resultado).hasSize(2);
    }

    @Test
    void buscarPorId_deveRetornarDepartamento_quandoEncontrado() {
        Departamento departamento = new Departamento();
        departamento.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(departamento));

        ResponseEntity<Departamento> resposta = controller.buscarPorId(1L);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isEqualTo(departamento);
    }

    @Test
    void buscarPorId_deveRetornar404_quandoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Departamento> resposta = controller.buscarPorId(99L);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void atualizar_devePermitir_quandoCodigoNaoMudou() {
        Departamento existente = new Departamento();
        existente.setId(1L);
        existente.setCodigo("TI");
        existente.setDescricao("Tecnologia da Informação");

        Departamento atualizado = new Departamento();
        atualizado.setCodigo("TI");
        atualizado.setDescricao("Tecnologia da Informação 2");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(repository, never()).existsByCodigo(any());
        assertThat(existente.getDescricao()).isEqualTo("Tecnologia da Informação 2");
    }

    @Test
    void atualizar_deveRetornar400_quandoNovoCodigoJaExisteEmOutroDepartamento() {
        Departamento existente = new Departamento();
        existente.setId(1L);
        existente.setCodigo("TI");
        existente.setDescricao("Tecnologia da Informação");

        Departamento atualizado = new Departamento();
        atualizado.setCodigo("RH");
        atualizado.setDescricao("Recursos Humanos");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existsByCodigo("RH")).thenReturn(true);

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void atualizar_deveRetornar404_quandoDepartamentoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<?> resposta = controller.atualizar(99L, new Departamento());

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}