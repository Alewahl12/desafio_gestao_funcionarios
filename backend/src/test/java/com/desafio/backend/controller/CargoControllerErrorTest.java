package com.desafio.backend.controller;

import com.desafio.backend.entity.Cargo;
import com.desafio.backend.repository.CargoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Optional;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CargoControllerErrorTest {
    @Mock private CargoRepository repository;
    @InjectMocks private CargoController controller;

    @Test
    void atualizar_deveRetornar404_quandoCargoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        ResponseEntity<?> res = controller.atualizar(99L, new Cargo());
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}