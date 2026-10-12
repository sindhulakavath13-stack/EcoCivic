package com.ecocivic.demo.exception;

/**
 * Thrown when a business rule is violated (e.g. email already exists,
 * invalid status transition, access denied on a resource).
 * Maps to HTTP 400.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
