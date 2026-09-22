package com.rutaia.service;

import com.rutaia.dto.N8nRecomendacionRequest;
import com.rutaia.dto.N8nRecomendacionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class N8nOrquestadorService {

    private static final Logger log = LoggerFactory.getLogger(N8nOrquestadorService.class);

    private final RestTemplate restTemplate;

    @Value("${n8n.webhook.url:http://127.0.0.1:5678/webhook/recomendar-cursos}")
    private String n8nWebhookUrl;

    public N8nOrquestadorService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public N8nRecomendacionResponse enviarConsultaAn8n(N8nRecomendacionRequest request) {
        String targetUrl = n8nWebhookUrl != null ? n8nWebhookUrl.replace("localhost", "127.0.0.1") : "http://127.0.0.1:5678/webhook/recomendar-cursos";
        log.info("Enviando consulta ID {} a webhook n8n: {}", request.getIdConsulta(), targetUrl);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<N8nRecomendacionRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<N8nRecomendacionResponse> response = restTemplate.postForEntity(
                    targetUrl,
                    entity,
                    N8nRecomendacionResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Respuesta exitosa de n8n para consulta ID {}: estado {}", request.getIdConsulta(), response.getBody().getEstadoFinal());
                return response.getBody();
            } else {
                log.warn("Respuesta no satisfactoria de n8n: {}", response.getStatusCode());
                return crearRespuestaError(request.getIdConsulta(), request.getPregunta(), "Respuesta inesperada de la orquestación n8n");
            }
        } catch (Exception e) {
            log.error("Fallo al comunicarse con n8n en {}: {}", n8nWebhookUrl, e.getMessage());
            return crearRespuestaError(request.getIdConsulta(), request.getPregunta(), "Error de comunicación con n8n/IA: " + e.getMessage());
        }
    }

    private N8nRecomendacionResponse crearRespuestaError(Long idConsulta, String pregunta, String errorMsg) {
        N8nRecomendacionResponse resp = new N8nRecomendacionResponse();
        resp.setIdConsulta(idConsulta);
        resp.setPregunta(pregunta);
        resp.setRespuesta(errorMsg);
        resp.setEstadoFinal("Error");
        return resp;
    }
}
