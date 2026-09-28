package com.rutaia.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rutaia.dto.ComparacionEmbeddingsRequestDTO;
import com.rutaia.dto.ComparacionEmbeddingsResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class EmbeddingComparisonService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingComparisonService.class);

    private final String openRouterApiKey;
    private final String embeddingModel;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public EmbeddingComparisonService(
            @Value("${openrouter.api.key:}") String openRouterApiKey,
            @Value("${openrouter.embedding.model:openai/text-embedding-3-small}") String embeddingModel
    ) {
        this.openRouterApiKey = openRouterApiKey;
        this.embeddingModel = embeddingModel;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Compara semánticamente dos preguntas mediante sus embeddings vectoriales sin usar un LLM.
     * Calcula la similitud de cosenos directamente sobre los vectores numéricos.
     */
    public ComparacionEmbeddingsResponseDTO comparar(ComparacionEmbeddingsRequestDTO request) {
        String textoA = request.getPreguntaA() != null ? request.getPreguntaA().trim() : "";
        String textoB = request.getPreguntaB() != null ? request.getPreguntaB().trim() : "";

        if (textoA.isBlank() || textoB.isBlank()) {
            throw new IllegalArgumentException("Ambas preguntas (preguntaA y preguntaB) deben contener texto.");
        }

        // 1 y 2: Generar embeddings para cada texto con exactamente el mismo modelo
        List<Double> vectorA = obtenerEmbedding(textoA);
        List<Double> vectorB = obtenerEmbedding(textoB);

        // 3: Comprobar que ambos resultados sean vectores válidos y compatibles
        validarVectores(vectorA, vectorB);

        // 4: Calcular la similitud del coseno puramente algebraica (sin LLM)
        double similitud = calcularSimilitudCoseno(vectorA, vectorB);

        // Redondear a 4 decimales
        double similitudRedondeada = Math.round(similitud * 10000.0) / 10000.0;

        // 5: Devolver las dos preguntas y el valor de similitud
        return new ComparacionEmbeddingsResponseDTO(textoA, textoB, similitudRedondeada);
    }

    private List<Double> obtenerEmbedding(String texto) {
        try {
            String url = "https://openrouter.ai/api/v1/embeddings";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openRouterApiKey);
            headers.set("HTTP-Referer", "https://github.com/TEstebanGQ/proyecto-ia2-santiago-tomas");
            headers.set("X-Title", "RutaIA Embedding Comparison");

            Map<String, Object> body = new HashMap<>();
            body.put("model", embeddingModel);
            body.put("input", texto);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

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
            throw new IllegalStateException("OpenRouter no devolvió un vector de embeddings válido.");
        } catch (Exception e) {
            log.error("Error al obtener embedding desde OpenRouter: {}", e.getMessage());
            throw new RuntimeException("Error al generar embedding: " + e.getMessage(), e);
        }
    }

    private void validarVectores(List<Double> vecA, List<Double> vecB) {
        if (vecA == null || vecB == null) {
            throw new IllegalStateException("Uno o ambos embeddings son nulos.");
        }
        if (vecA.isEmpty() || vecB.isEmpty()) {
            throw new IllegalStateException("Uno o ambos vectores de embeddings están vacíos.");
        }
        if (vecA.size() != vecB.size()) {
            throw new IllegalStateException(String.format(
                    "Incompatibilidad de dimensiones en los vectores: Vector A (%d) vs Vector B (%d)",
                    vecA.size(), vecB.size()
            ));
        }
    }

    private double calcularSimilitudCoseno(List<Double> vecA, List<Double> vecB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        int size = vecA.size();
        for (int i = 0; i < size; i++) {
            double a = vecA.get(i);
            double b = vecB.get(i);
            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (normA * normB);
    }
}
