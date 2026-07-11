package com.desafio.backend.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Gera e verifica hashes de senha usando SHA-256 com salt aleatório.
 * Não depende do Spring Security — só da biblioteca padrão do Java —
 * para não exigir nenhuma dependência nova no pom.xml.
 *
 * O resultado é armazenado como "saltBase64:hashBase64" numa única coluna.
 */
public class PasswordUtil {

    private static final int SALT_LENGTH = 16;

    public static String gerarHash(String senha) {
        try {
            byte[] salt = new byte[SALT_LENGTH];
            new SecureRandom().nextBytes(salt);

            byte[] hash = hashComSalt(senha, salt);

            return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erro ao gerar hash de senha", e);
        }
    }

    public static boolean verificar(String senha, String senhaHashArmazenada) {
        try {
            String[] partes = senhaHashArmazenada.split(":");
            if (partes.length != 2) {
                return false;
            }

            byte[] salt = Base64.getDecoder().decode(partes[0]);
            byte[] hashArmazenado = Base64.getDecoder().decode(partes[1]);
            byte[] hashCalculado = hashComSalt(senha, salt);

            return MessageDigest.isEqual(hashArmazenado, hashCalculado);
        } catch (Exception e) {
            return false;
        }
    }

    private static byte[] hashComSalt(String senha, byte[] salt) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        digest.update(salt);
        return digest.digest(senha.getBytes());
    }
}