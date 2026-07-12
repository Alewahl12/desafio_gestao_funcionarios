package com.desafio.backend.specification;

import com.desafio.backend.entity.Funcionario;
import com.desafio.backend.entity.Vinculo;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

/**
 * Monta a query de listagem de Funcionário com filtros opcionais. Nome e CPF
 * pertencem ao próprio Funcionário; Matrícula, Empresa, Cargo e Departamento
 * pertencem ao Vínculo, então só faz o JOIN quando pelo menos um desses
 * filtros for realmente usado.
 */
public class FuncionarioSpecification {

    public static Specification<Funcionario> comFiltros(
            String nome, String cpf, String matricula, String empresa, Long cargoId, Long departamentoId) {

        return (root, query, cb) -> {
            query.distinct(true);
            Predicate predicado = cb.conjunction();

            if (temValor(nome)) {
                predicado = cb.and(predicado, cb.like(cb.lower(root.get("nome")), curinga(nome)));
            }
            if (temValor(cpf)) {
                predicado = cb.and(predicado, cb.like(root.get("cpf"), curinga(cpf)));
            }

            boolean precisaDeVinculo = temValor(matricula) || temValor(empresa) || cargoId != null || departamentoId != null;

            if (precisaDeVinculo) {
                Join<Funcionario, Vinculo> vinculo = root.join("vinculos", JoinType.LEFT);

                if (temValor(matricula)) {
                    predicado = cb.and(predicado, cb.like(vinculo.get("matricula"), curinga(matricula)));
                }
                if (temValor(empresa)) {
                    predicado = cb.and(predicado, cb.like(cb.lower(vinculo.get("empresa")), curinga(empresa)));
                }
                if (cargoId != null) {
                    predicado = cb.and(predicado, cb.equal(vinculo.get("cargo").get("id"), cargoId));
                }
                if (departamentoId != null) {
                    predicado = cb.and(predicado, cb.equal(vinculo.get("departamento").get("id"), departamentoId));
                }
            }

            return predicado;
        };
    }

    private static boolean temValor(String texto) {
        return texto != null && !texto.isBlank();
    }

    private static String curinga(String texto) {
        return "%" + texto.toLowerCase() + "%";
    }
}