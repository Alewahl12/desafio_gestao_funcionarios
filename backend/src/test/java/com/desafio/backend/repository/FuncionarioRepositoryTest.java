package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import com.desafio.backend.entity.Departamento;
import com.desafio.backend.entity.Funcionario;
import com.desafio.backend.entity.Vinculo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class FuncionarioRepositoryTest {

    @Autowired
    private FuncionarioRepository repository;

    @Autowired
    private CargoRepository cargoRepository;

    @Autowired
    private DepartamentoRepository departamentoRepository;

    @Test
    void existsByCpf_deveRetornarTrue_quandoCpfJaCadastrado() {
        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Ana Silva");
        funcionario.setCpf("123.456.789-00");
        repository.save(funcionario);

        assertThat(repository.existsByCpf("123.456.789-00")).isTrue();
    }

    @Test
    void existsByCpf_deveRetornarFalse_quandoCpfNaoCadastrado() {
        assertThat(repository.existsByCpf("000.000.000-00")).isFalse();
    }

    @Test
    void orphanRemoval_deveExcluirVinculoDoBanco_quandoRemovidoDaLista() {
        Cargo cargo = new Cargo();
        cargo.setCodigo("DEV");
        cargo.setDescricao("Desenvolvedor");
        cargo = cargoRepository.save(cargo);

        Departamento departamento = new Departamento();
        departamento.setCodigo("TI");
        departamento.setDescricao("Tecnologia da Informação");
        departamento = departamentoRepository.save(departamento);

        Funcionario funcionario = new Funcionario();
        funcionario.setNome("Ana Silva");
        funcionario.setCpf("123.456.789-00");

        Vinculo vinculo = new Vinculo();
        vinculo.setEmpresa("Empresa X");
        vinculo.setMatricula("123");
        vinculo.setCargo(cargo);
        vinculo.setDepartamento(departamento);
        vinculo.setFuncionario(funcionario);
        funcionario.setVinculos(new ArrayList<>(List.of(vinculo)));

        Funcionario salvo = repository.saveAndFlush(funcionario);
        assertThat(salvo.getVinculos()).hasSize(1);

        // Remove o vínculo da lista (como o Controller faz na edição) e salva de novo
        salvo.getVinculos().clear();
        repository.saveAndFlush(salvo);

        Funcionario recarregado = repository.findById(salvo.getId()).orElseThrow();
        assertThat(recarregado.getVinculos()).isEmpty();
    }
}