package com.desafio.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Adiciona campos de correlação (requestId, método, rota, status, duração) ao MDC
 * do SLF4J para cada requisição HTTP. Esses campos aparecem automaticamente em
 * todas as linhas de log estruturado geradas durante essa requisição — sem
 * precisar passar isso manualmente em cada logger.info(...) espalhado pelo código.
 *
 * Como é um @Component que estende Filter, o Spring Boot registra ele
 * automaticamente na cadeia de filtros — não precisa de nenhuma configuração extra.
 */
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = request.getHeader(REQUEST_ID_HEADER);
        if (requestId == null || requestId.isBlank()) {
            requestId = UUID.randomUUID().toString();
        }

        long inicio = System.currentTimeMillis();

        try {
            MDC.put("requestId", requestId);
            MDC.put("httpMethod", request.getMethod());
            MDC.put("httpPath", request.getRequestURI());
            response.setHeader(REQUEST_ID_HEADER, requestId);

            log.info("Requisição recebida");

            filterChain.doFilter(request, response);

        } finally {
            long duracaoMs = System.currentTimeMillis() - inicio;
            MDC.put("durationMs", String.valueOf(duracaoMs));
            MDC.put("status", String.valueOf(response.getStatus()));

            log.info("Requisição finalizada");

            MDC.clear();
        }
    }
}