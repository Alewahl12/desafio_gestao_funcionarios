package com.desafio.backend.dto;

public class AuthRequest {

    private String login;
    private String senha;

    public AuthRequest() {
    }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}