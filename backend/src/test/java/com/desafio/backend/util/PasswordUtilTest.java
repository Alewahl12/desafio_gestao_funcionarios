package com.desafio.backend.util;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class PasswordUtilTest {

    @Test
    void deveGerarEVerificarHashCorretamente() {
        String senha = "minhasenha123";
        String hash = PasswordUtil.gerarHash(senha);
        
        assertThat(hash).isNotBlank();
        assertThat(hash).contains(":");
        assertThat(PasswordUtil.verificar(senha, hash)).isTrue();
        assertThat(PasswordUtil.verificar("senha_errada", hash)).isFalse();
    }

    @Test
    void deveRetornarFalseParaHashInvalido() {
        assertThat(PasswordUtil.verificar("senha", "hashsemdoispontos")).isFalse();
    }
}