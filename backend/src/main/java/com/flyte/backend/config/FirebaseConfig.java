package com.flyte.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @Value("${firebase.credentials.path:flyte-6ccab-firebase-adminsdk-fbsvc-89c60e37e6.json}")
    private String credentialsPath;
    
    @Value("${firebase.use-file:false}")
    private boolean useFile;

    @PostConstruct
    public void initialize() {
        try {

            InputStream serviceAccount;
            
            if (useFile) {
                // Local: Load from classpath
                ClassPathResource resource = new ClassPathResource(credentialsPath);
                serviceAccount = resource.getInputStream();
            } else {
                // Production: Load from environment variable
                String firebaseJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
                if (firebaseJson == null) {
                    throw new IllegalStateException("FIREBASE_CREDENTIALS_JSON not set");
                }
                serviceAccount = new ByteArrayInputStream(firebaseJson.getBytes());
            }
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
