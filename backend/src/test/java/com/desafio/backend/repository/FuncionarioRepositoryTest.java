package com.desafio.backend.repository;

import com.desafio.backend.entity.Cargo;
import com.desafio.backend.entity.Departamento;
import com.desafio.backend.entity.Funcionario;
import com.desafio.backend.entity.Vinculo;
import com.desafio.backend.specification.FuncionarioSpecification;
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

    @Test
    void comFiltros_deveFiltrarPorNomeParcialSemDiferenciarCaixa() {
        Funcionario ana = new Funcionario();
        ana.setNome("Ana Silva");
        ana.setCpf("111.111.111-11");
        repository.save(ana);

        Funcionario bruno = new Funcionario();
        bruno.setNome("Bruno Costa");
        bruno.setCpf("222.222.222-22");
        repository.save(bruno);

        List<Funcionario> resultado = repository.findAll(
                FuncionarioSpecification.comFiltros("ana", null, null, null, null, null));

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getNome()).isEqualTo("Ana Silva");
    }

    @Test
    void comFiltros_deveFiltrarPeloCargoDoVinculo() {
        Cargo cargoDev = cargoRepository.save(criarCargo("DEV", "Desenvolvedor"));
        Cargo cargoQa = cargoRepository.save(criarCargo("QA", "Analista de Qualidade"));
        Departamento departamento = departamentoRepository.save(criarDepartamento("TI", "Tecnologia da Informação"));

        Funcionario dev = new Funcionario();
        dev.setNome("Ana Silva");
        dev.setCpf("111.111.111-11");
        Vinculo vinculoDev = criarVinculo("Empresa X", "111", cargoDev, departamento, dev);
        dev.setVinculos(new ArrayList<>(List.of(vinculoDev)));
        repository.save(dev);

        Funcionario qa = new Funcionario();
        qa.setNome("Bruno Costa");
        qa.setCpf("222.222.222-22");
        Vinculo vinculoQa = criarVinculo("Empresa X", "222", cargoQa, departamento, qa);
        qa.setVinculos(new ArrayList<>(List.of(vinculoQa)));
        repository.save(qa);

        List<Funcionario> resultado = repository.findAll(
                FuncionarioSpecification.comFiltros(null, null, null, null, cargoDev.getId(), null));

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getNome()).isEqualTo("Ana Silva");
    }

    @Test
    void comFiltros_deveRetornarTudo_quandoNenhumFiltroInformado() {
        Funcionario ana = new Funcionario();
        ana.setNome("Ana Silva");
        ana.setCpf("111.111.111-11");
        repository.save(ana);

        Funcionario bruno = new Funcionario();
        bruno.setNome("Bruno Costa");
        bruno.setCpf("222.222.222-22");
        repository.save(bruno);

        List<Funcionario> resultado = repository.findAll(
                FuncionarioSpecification.comFiltros(null, null, null, null, null, null));

        assertThat(resultado).hasSize(2);
    }

    private Cargo criarCargo(String codigo, String descricao) {
        Cargo cargo = new Cargo();
        cargo.setCodigo(codigo);
        cargo.setDescricao(descricao);
        return cargo;
    }

    private Departamento criarDepartamento(String codigo, String descricao) {
        Departamento departamento = new Departamento();
        departamento.setCodigo(codigo);
        departamento.setDescricao(descricao);
        return departamento;
    }

    private Vinculo criarVinculo(String empresa, String matricula, Cargo cargo, Departamento departamento, Funcionario funcionario) {
        Vinculo vinculo = new Vinculo();
        vinculo.setEmpresa(empresa);
        vinculo.setMatricula(matricula);
        vinculo.setCargo(cargo);
        vinculo.setDepartamento(departamento);
        vinculo.setFuncionario(funcionario);
        return vinculo;
    }
}