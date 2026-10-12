package com.ecocivic.demo.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * General-purpose date/time utilities shared across the application.
 */
public final class DateUtil {

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private DateUtil() {}

    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";
        return dateTime.format(DISPLAY_FORMAT);
    }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }
}
