package com.desafio.backend.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "funcionario")
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 14) // CPF com pontuação ex: 000.000.000-00
    private String cpf;

    // A MÁGICA ACONTECE AQUI: CascadeType.ALL e orphanRemoval=true
    @OneToMany(mappedBy = "funcionario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vinculo> vinculos = new ArrayList<>();

    public Funcionario() {
    }

    // --- Getters e Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public List<Vinculo> getVinculos() { return vinculos; }
    public void setVinculos(List<Vinculo> vinculos) { this.vinculos = vinculos; }
}