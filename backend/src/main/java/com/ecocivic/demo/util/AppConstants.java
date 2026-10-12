package com.ecocivic.demo.util;

/**
 * Shared constants for the application.
 */
public final class AppConstants {

    private AppConstants() {}

    // Report statuses
    public static final String STATUS_PENDING     = "Pending";
    public static final String STATUS_IN_PROGRESS = "In Progress";
    public static final String STATUS_RESOLVED    = "Resolved";

    // User roles
    public static final String ROLE_USER  = "user";
    public static final String ROLE_ADMIN = "admin";

    // Upload settings
    public static final String UPLOAD_DIR    = "uploads/";
    public static final long   MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
}
