package com.desafio.backend.controller;

import com.desafio.backend.entity.Vinculo;
import com.desafio.backend.repository.VinculoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VinculoControllerTest {

    @Mock
    private VinculoRepository repository;

    @InjectMocks
    private VinculoController controller;

    @Test
    void deveCriarVinculo() {
        Vinculo v = new Vinculo();
        when(repository.save(any())).thenReturn(v);
        
        ResponseEntity<Vinculo> res = controller.criar(v);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void deveListarVinculos() {
        when(repository.findAll()).thenReturn(List.of(new Vinculo()));
        List<Vinculo> res = controller.listar();
        assertThat(res).isNotEmpty();
    }
}