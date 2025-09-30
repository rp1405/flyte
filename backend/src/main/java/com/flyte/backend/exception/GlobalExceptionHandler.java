package com.flyte.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * A global exception handler to process and format errors across the entire application.
 * Using @RestControllerAdvice makes this class a central point for handling exceptions.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation exceptions thrown when a @Valid annotated request body fails validation.
     * This method is triggered by the MethodArgumentNotValidException.
     *
     * @param ex The MethodArgumentNotValidException that was thrown.
     * @return A ResponseEntity containing a map of field names to their specific error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Ensures the response has a 400 status code
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Create a map to store the field name and its corresponding error message
        Map<String, String> errors = new HashMap<>();

        // Loop through all the validation errors from the exception
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            // Get the name of the field that failed validation
            String fieldName = ((FieldError) error).getField();
            // Get the custom error message you defined in the DTO
            String errorMessage = error.getDefaultMessage();
            // Add the field and message to the map
            errors.put(fieldName, errorMessage);
        });

        // Return the map as the response body with a 400 Bad Request status
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        Throwable rootCause = ex.getMostSpecificCause();

        // This is a more robust way to check for unique constraint violations
        // by checking the standard SQL State code '23505' for unique violations.
        if (rootCause instanceof SQLException && "23505".equals(((SQLException) rootCause).getSQLState())) {
            String message = rootCause.getMessage();
            // We can still check the message to see if the violation was on the email column
            if (message != null && message.contains("(email)")) {
                error.put("email", "A user with this email address already exists.");
            } else {
                error.put("error", "A record with this value already exists.");
            }
        } else {
            error.put("error", "There was a database conflict.");
        }
        return new ResponseEntity<>(error, HttpStatus.CONFLICT); // HTTP 409 Conflict
    }
}