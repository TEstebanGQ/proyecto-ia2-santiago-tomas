package com.rutaia.service;

import com.rutaia.entity.Curso;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class N8nCourseSyncService {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String webhookUrl;

    public N8nCourseSyncService(@Value("${n8n.course-sync.webhook-url:http://localhost:5679/webhook/sincronizar-curso}") String webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    public boolean sincronizarCurso(Curso curso) { return enviar("UPSERT", curso, curso.getId()); }
    public boolean eliminarVectorCurso(Long cursoId) { return enviar("ELIMINAR", null, cursoId); }

    private boolean enviar(String accion, Curso curso, Long cursoId) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("accion", accion);
            body.put("cursoId", cursoId);
            if (curso != null) {
                Map<String, Object> c = new LinkedHashMap<>();
                c.put("id", curso.getId()); c.put("nombre", curso.getNombre());
                c.put("descripcion", curso.getDescripcion()); c.put("categoria", curso.getCategoria());
                c.put("nivel", curso.getNivel()); c.put("duracionHoras", curso.getDuracionHoras());
                c.put("prerrequisitos", curso.getPrerrequisitos()); body.put("curso", c);
            }
            ResponseEntity<Map> response = restTemplate.exchange(webhookUrl, HttpMethod.POST,
                    new HttpEntity<>(body, new HttpHeaders() {{ setContentType(MediaType.APPLICATION_JSON); }}), Map.class);
            return response.getStatusCode().is2xxSuccessful() && Boolean.TRUE.equals(response.getBody().get("ok"));
        } catch (Exception e) { return false; }
    }
}
