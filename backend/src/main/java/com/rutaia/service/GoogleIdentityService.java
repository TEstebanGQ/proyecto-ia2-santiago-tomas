package com.rutaia.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleIdentityService {

    private final String clientId;

    public GoogleIdentityService(@Value("${google.oauth.client-id:}") String clientId) {
        this.clientId = clientId;
    }

    public GoogleProfile verify(String credential) {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("Google Sign-In no está configurado en el servidor.");
        }
        if (credential == null || credential.isBlank()) {
            throw new IllegalArgumentException("Google no entregó una credencial válida.");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
            GoogleIdToken token = verifier.verify(credential);
            if (token == null) {
                throw new IllegalArgumentException("No fue posible verificar la identidad de Google.");
            }

            GoogleIdToken.Payload payload = token.getPayload();
            if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
                throw new IllegalArgumentException("La cuenta de Google debe tener el correo verificado.");
            }

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("Google no proporcionó un correo electrónico.");
            }
            return new GoogleProfile(email.trim().toLowerCase(),
                    name == null || name.isBlank() ? "Estudiante Google" : name.trim(),
                    payload.getSubject());
        } catch (GeneralSecurityException | java.io.IOException e) {
            throw new IllegalStateException("No fue posible validar la credencial de Google.", e);
        }
    }

    public record GoogleProfile(String email, String name, String subject) { }
}
