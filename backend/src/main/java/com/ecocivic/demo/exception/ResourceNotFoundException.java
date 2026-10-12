package com.ecocivic.demo.exception;

/**
 * Thrown when a requested resource (User, Report, etc.) is not found.
 * Maps to HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
