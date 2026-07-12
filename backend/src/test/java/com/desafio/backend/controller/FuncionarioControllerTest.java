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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
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

        Departamento departamento = new Departamento();
        departamento.setId(1L);
        departamento.setCodigo("TI");
        departamento.setDescricao("Tecnologia da Informação");

        Vinculo vinculo = new Vinculo();
        vinculo.setEmpresa(empresa);
        vinculo.setMatricula(matricula);
        vinculo.setCargo(cargo);
        vinculo.setDepartamento(departamento);
        return vinculo;
    }

    @Test
    void criar_deveRetornar400_quandoCpfJaCadastrado() {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Ana Silva");
        funcionario.setCpf("123.456.789-00");

        when(repository.existsByCpf("123.456.789-00")).thenReturn(true);

        ResponseEntity<?> resposta = controller.criar(funcionario);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void criar_deveSalvarFuncionarioComVinculos_quandoCpfNovo() {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Ana Silva");
        funcionario.setCpf("123.456.789-00");
        funcionario.setVinculos(new ArrayList<>(List.of(criarVinculo("Empresa X", "12345"))));

        when(repository.existsByCpf("123.456.789-00")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.criar(funcionario);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        // 1x para salvar o funcionário sem vínculos, 1x para salvar já com os vínculos associados
        verify(repository, times(2)).save(any());

        Funcionario salvo = (Funcionario) resposta.getBody();
        assertThat(salvo.getVinculos()).hasSize(1);
        assertThat(salvo.getVinculos().get(0).getFuncionario()).isEqualTo(salvo);
        assertThat(salvo.getVinculos().get(0).getEmpresa()).isEqualTo("Empresa X");
    }

    @Test
    void criar_deveSalvarUmaVez_quandoFuncionarioSemVinculos() {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Ana Silva");
        funcionario.setCpf("123.456.789-00");
        funcionario.setVinculos(new ArrayList<>());

        when(repository.existsByCpf("123.456.789-00")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        controller.criar(funcionario);

        verify(repository, times(1)).save(any());
    }

    @Test
    void atualizar_deveRetornar404_quandoFuncionarioNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<?> resposta = controller.atualizar(99L, new Funcionario());

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void atualizar_deveRetornar400_quandoNovoCpfJaExisteEmOutroFuncionario() {
        Funcionario existente = new Funcionario();
        existente.setId(1L);
        existente.setNome("Ana Silva");
        existente.setCpf("111.111.111-11");

        Funcionario atualizado = new Funcionario();
        atualizado.setNome("Ana Silva");
        atualizado.setCpf("222.222.222-22");

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.existsByCpf("222.222.222-22")).thenReturn(true);

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        verify(repository, never()).save(any());
    }

    @Test
    void atualizar_devePermitir_quandoCpfNaoMudou() {
        Funcionario existente = new Funcionario();
        existente.setId(1L);
        existente.setNome("Ana Silva");
        existente.setCpf("111.111.111-11");
        existente.setVinculos(new ArrayList<>());

        Funcionario atualizado = new Funcionario();
        atualizado.setNome("Ana Silva Santos");
        atualizado.setCpf("111.111.111-11");
        atualizado.setVinculos(new ArrayList<>());

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(repository, never()).existsByCpf(any());
        assertThat(existente.getNome()).isEqualTo("Ana Silva Santos");
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
        atualizado.setNome("Ana Silva");
        atualizado.setCpf("111.111.111-11");
        atualizado.setVinculos(new ArrayList<>(List.of(vinculoNovo)));

        when(repository.findById(1L)).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<?> resposta = controller.atualizar(1L, atualizado);

        assertThat(resposta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(existente.getVinculos()).hasSize(1);
        assertThat(existente.getVinculos().get(0).getEmpresa()).isEqualTo("Empresa Nova");
        assertThat(existente.getVinculos().get(0).getFuncionario()).isEqualTo(existente);
    }
}