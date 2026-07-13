package com.desafio.backend.controller;

import com.desafio.backend.entity.Cargo;
import com.desafio.backend.repository.CargoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
class CargoControllerTest {

    @Mock
    private CargoRepository repository;

    @InjectMocks
    private CargoController controller;

    @Test
    void criar_deveRetornar201_quandoCodigoNaoExiste() {
        Cargo novoCargo = new Cargo();
        novoCargo.setCodigo("DEV");
        novoCargo.setDescricao("Desenvolvedor");

        when(repository.existsByCodigo("DEV")).thenReturn(false);
        when(repository.save(novoCargo)).thenReturn(novoCargo);

        ResponseEntity<?> resposta = controller.criar(novoCargo);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resposta.getBody()).isEqualTo(novoCargo);
        verify(repository).save(novoCargo);
    }

    @Test
    void criar_deveRetornar400_quandoCodigoJaExiste() {
        Cargo novoCargo = new Cargo();
        novoCargo.setCodigo("DEV");
        novoCargo.setDescricao("Desenvolvedor");

        when(repository.existsByCodigo("DEV")).thenReturn(true);

        ResponseEntity<?> resposta = controller.criar(novoCargo);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void listar_deveRetornarTodosCargos_quandoFiltrosVazios() {
        Page<Cargo> pagina = new PageImpl<>(List.of(new Cargo(), new Cargo()));
        when(repository.findByDescricaoContainingIgnoreCaseAndCodigoContainingIgnoreCase(
                any(), any(), any(Pageable.class)))
                .thenReturn(pagina);

        Page<Cargo> resultado = controller.listar("", "", Pageable.unpaged());

        assertThat(resultado.getContent()).hasSize(2);
    }

    @Test
    void buscarPorId_deveRetornarCargo_quandoEncontrado() {
        Cargo cargo = new Cargo();
        cargo.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(cargo));

        ResponseEntity<Cargo> resposta = controller.buscarPorId(1L);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resposta.getBody()).isEqualTo(cargo);
    }

    @Test
    void buscarPorId_deveRetornar404_quandoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<Cargo> resposta = controller.buscarPorId(99L);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void atualizar_devePermitir_quandoCodigoNaoMudou() {
        Cargo existente = new Cargo();
        existente.setId(1L);
        existente.setCodigo("DEV");
        existente.setDescricao("Desenvolvedor");

        Cargo atualizado = new Cargo();
        atualizado.setCodigo("DEV");
        atualizado.setDescricao("Desenvolvedor Pleno");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(repository, never()).existsByCodigo(any());
        assertThat(existente.getDescricao()).isEqualTo("Desenvolvedor Pleno");
    }

    @Test
    void atualizar_deveRetornar400_quandoNovoCodigoJaExisteEmOutroCargo() {
        Cargo existente = new Cargo();
        existente.setId(1L);
        existente.setCodigo("DEV");
        existente.setDescricao("Desenvolvedor");

        Cargo atualizado = new Cargo();
        atualizado.setCodigo("QA");
        atualizado.setDescricao("Analista de Qualidade");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existsByCodigo("QA")).thenReturn(true);

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void atualizar_deveRetornar404_quandoCargoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<?> resposta = controller.atualizar(99L, new Cargo());

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}