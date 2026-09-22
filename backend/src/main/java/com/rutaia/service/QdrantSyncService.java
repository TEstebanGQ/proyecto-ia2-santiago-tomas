package com.rutaia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rutaia.entity.Curso;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class QdrantSyncService {

    private static final Logger log = LoggerFactory.getLogger(QdrantSyncService.class);

    private final String qdrantUrl;
    private final String collectionName;
    private final String openRouterApiKey;
    private final String embeddingModel;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public QdrantSyncService(
            @Value("${qdrant.url:http://localhost:6333}") String qdrantUrl,
            @Value("${qdrant.collection:cursos_academicos}") String collectionName,
            @Value("${openrouter.api.key:}") String openRouterApiKey,
            @Value("${openrouter.embedding.model:openai/text-embedding-3-small}") String embeddingModel
    ) {
        this.qdrantUrl = qdrantUrl;
        this.collectionName = collectionName;
        this.openRouterApiKey = openRouterApiKey;
        this.embeddingModel = embeddingModel;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Sincroniza automáticamente un curso con Qdrant Vector DB (RF 05)
     * Genera el embedding y hace upsert del punto con su payload.
     */
    public boolean sincronizarCurso(Curso curso) {
        if (curso == null || curso.getId() == null) return false;

        try {
            log.info("Sincronizando curso #{} ('{}') con Qdrant...", curso.getId(), curso.getNombre());

            // 1. Construir texto representativo para el embedding
            String textoParaEmbedding = String.format(
                    "Curso: %s. Categoría: %s. Nivel: %s. Duración: %d horas. Descripción: %s",
                    curso.getNombre(),
                    curso.getCategoria(),
                    curso.getNivel(),
                    curso.getDuracionHoras(),
                    curso.getDescripcion()
            );

            // 2. Obtener vector de embedding desde OpenRouter
            List<Double> vector = generarEmbedding(textoParaEmbedding);
            if (vector == null || vector.isEmpty()) {
                log.warn("No se pudo obtener el vector para el curso #{}. Omitiendo sincronización.", curso.getId());
                return false;
            }

            // 3. Preparar payload de Qdrant
            Map<String, Object> payload = new HashMap<>();
            payload.put("curso_id", curso.getId());
            payload.put("nombre", curso.getNombre());
            payload.put("descripcion", curso.getDescripcion());
            payload.put("categoria", curso.getCategoria());
            payload.put("nivel", curso.getNivel());
            payload.put("duracion_horas", curso.getDuracionHoras());
            payload.put("activo", curso.getActivo() != null ? curso.getActivo() : true);

            Map<String, Object> point = new HashMap<>();
            point.put("id", curso.getId());
            point.put("vector", vector);
            point.put("payload", payload);

            Map<String, Object> body = new HashMap<>();
            body.put("points", Collections.singletonList(point));

            // 4. Enviar a Qdrant (Upsert)
            String url = String.format("%s/collections/%s/points", qdrantUrl, collectionName);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Curso #{} indexado exitosamente en Qdrant (colección '{}')", curso.getId(), collectionName);
                return true;
            } else {
                log.warn("Respuesta inesperada de Qdrant al indexar curso #{}: {}", curso.getId(), response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Error al sincronizar curso #{} con Qdrant: {}", curso.getId(), e.getMessage());
            return false;
        }
    }

    /**
     * Elimina el vector de un curso en Qdrant cuando el curso se desactiva.
     * Esto asegura que el Asesor RAG no lo considere en las búsquedas semánticas.
     */
    public boolean eliminarVectorCurso(Long cursoId) {
        if (cursoId == null) return false;

        try {
            log.info("Eliminando vector del curso #{} en Qdrant (desactivación)...", cursoId);
            String url = String.format("%s/collections/%s/points/delete", qdrantUrl, collectionName);

            Map<String, Object> body = new HashMap<>();
            body.put("points", Collections.singletonList(cursoId));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Vector del curso #{} eliminado exitosamente de Qdrant", cursoId);
                return true;
            } else {
                log.warn("Respuesta inesperada de Qdrant al eliminar vector #{}: {}", cursoId, response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Error al eliminar vector del curso #{} en Qdrant: {}", cursoId, e.getMessage());
            return false;
        }
    }

    private List<Double> generarEmbedding(String texto) {
        try {
            String url = "https://openrouter.ai/api/v1/embeddings";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openRouterApiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", embeddingModel);
            body.put("input", texto);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode embeddingNode = root.path("data").path(0).path("embedding");
                if (embeddingNode.isArray()) {
                    List<Double> vector = new ArrayList<>();
                    for (JsonNode n : embeddingNode) {
                        vector.add(n.asDouble());
                    }
                    return vector;
                }
            }
        } catch (Exception e) {
            log.warn("Error al calcular embedding con OpenRouter: {}", e.getMessage());
        }
        return Collections.emptyList();
    }
}
