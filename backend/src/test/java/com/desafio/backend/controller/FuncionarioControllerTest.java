package com.desafio.backend.controller;

import com.desafio.backend.entity.Cargo;
import com.desafio.backend.entity.Departamento;
import com.desafio.backend.entity.Funcionario;
import com.desafio.backend.entity.Vinculo;
import com.desafio.backend.repository.FuncionarioRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FuncionarioControllerTest {

    @Mock
    private FuncionarioRepository repository;

    @InjectMocks
    private FuncionarioController controller;

    private Vinculo criarVinculo(String empresa, String matricula) {
        Cargo cargo = new Cargo();
        cargo.setId(1L);
        cargo.setCodigo("DEV");
        cargo.setDescricao("Desenvolvedor");

        Departamento depto = new Departamento();
        depto.setId(1L);
        depto.setCodigo("TI");
        depto.setDescricao("Tecnologia da Informação");

        Vinculo v = new Vinculo();
        v.setEmpresa(empresa);
        v.setMatricula(matricula);
        v.setCargo(cargo);
        v.setDepartamento(depto);
        return v;
    }

    @Test
    @SuppressWarnings("unchecked")
    void listar_deveRetornarPaginaDeFuncionarios() {
        Page<Funcionario> pagina = new PageImpl<>(List.of(new Funcionario()));
        when(repository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class))).thenReturn(pagina);

        Page<Funcionario> resultado = controller.listar(null, null, null, null, null, null, Pageable.unpaged());
        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
    }

    @Test
    void buscarPorId_deveRetornarFuncionario_quandoEncontrado() {
        Funcionario f = new Funcionario();
        f.setId(1L);
        when(repository.findById(1L)).thenReturn(Optional.of(f));

        ResponseEntity<Funcionario> res = controller.buscarPorId(1L);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(res.getBody()).isNotNull();
    }

    @Test
    void criar_deveRetornar201_quandoDadosValidos() {
        Funcionario novo = new Funcionario();
        novo.setNome("Carlos");
        novo.setCpf("111.111.111-11");

        when(repository.existsByCpf("111.111.111-11")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> res = controller.criar(novo);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void criar_deveRetornar400_quandoCpfDuplicado() {
        Funcionario novo = new Funcionario();
        novo.setCpf("111.111.111-11");

        when(repository.existsByCpf("111.111.111-11")).thenReturn(true);

        ResponseEntity<?> res = controller.criar(novo);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void atualizar_deveSubstituirVinculosAntigosPelosNovos() {
        Funcionario existente = new Funcionario();
        existente.setId(1L);
        existente.setNome("Ana Silva");
        existente.setCpf("111.111.111-11");
        existente.setVinculos(new ArrayList<>(List.of(criarVinculo("Empresa Antiga", "111"))));

        Vinculo vinculoNovo = criarVinculo("Empresa Nova", "222");
        Funcionario atualizado = new Funcionario();
        atualizado.setNome("Ana Silva Editada");
        atualizado.setCpf("111.111.111-11");
        atualizado.setVinculos(new ArrayList<>(List.of(vinculoNovo)));

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        Funcionario salvo = (Funcionario) resposta.getBody();
        assertThat(salvo.getNome()).isEqualTo("Ana Silva Editada");
        assertThat(salvo.getVinculos()).hasSize(1);
        assertThat(salvo.getVinculos().get(0).getEmpresa()).isEqualTo("Empresa Nova");
    }

    @Test
    void atualizar_deveRetornar400_quandoNovoCpfJaExisteEmOutroFuncionario() {
        Funcionario existente = new Funcionario();
        existente.setId(1L);
        existente.setCpf("111.111.111-11");

        Funcionario atualizado = new Funcionario();
        atualizado.setCpf("222.222.222-22");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existsByCpf("222.222.222-22")).thenReturn(true);

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void atualizar_deveRetornar404_quandoFuncionarioNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        
        ResponseEntity<?> resposta = controller.atualizar(99L, new Funcionario());
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void atualizar_deveLidarComVinculosNulos() {
        Funcionario existente = new Funcionario();
        existente.setId(1L);
        existente.setCpf("111.111.111-11");

        Funcionario atualizado = new Funcionario();
        atualizado.setCpf("111.111.111-11");
        atualizado.setVinculos(null);

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void atualizar_deveRetornar200_quandoCpfNaoFoiAlterado() {
        Funcionario existente = new Funcionario();
        existente.setId(1L);
        existente.setCpf("111.111.111-11");

        Funcionario atualizado = new Funcionario();
        atualizado.setCpf("111.111.111-11");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);
        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}