package com.flyte.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            ClassPathResource resource = new ClassPathResource("flyte-6ccab-firebase-adminsdk-fbsvc-89c60e37e6.json");
            InputStream serviceAccount = resource.getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Application has been initialized");
            }
        } catch (IOException e) {
            System.err.println("Error initializing Firebase: " + e.getMessage());
        }
    }
}
