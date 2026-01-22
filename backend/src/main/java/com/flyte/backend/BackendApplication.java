package com.flyte.backend;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(BackendApplication.class, args);
	}

	@PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

}
