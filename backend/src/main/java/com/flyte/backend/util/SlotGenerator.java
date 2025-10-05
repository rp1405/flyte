package com.flyte.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Data;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Data
public class SlotGenerator {

    private final int totalSlots;
    private final int slotDurationInHours;
    private Instant slotStart;
    private Instant slotEnd;
    private String slotString;
    // A reusable, thread-safe formatter for the date part of the slot string.
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");

    public SlotGenerator(Instant instant, int totalSlots) {
        if (totalSlots <= 0 || 24 % totalSlots != 0) {
            throw new IllegalArgumentException(
                    "The number of slots must be a positive integer that divides 24 perfectly (e.g., 1, 2, 3, 4, 6, 8, 12, 24).");
        }
        this.totalSlots = totalSlots;
        this.slotDurationInHours = 24 / this.totalSlots;

        ZonedDateTime utcDateTime = instant.atZone(ZoneOffset.UTC);

        // Get the hour of the day (0-23)
        int hour = utcDateTime.getHour();

        // Calculate the starting and ending hours of the slot
        int startHour = (hour / slotDurationInHours) * slotDurationInHours;
        int endHour = startHour + slotDurationInHours;

        // Format the date part using our predefined formatter
        String datePart = utcDateTime.format(DATE_FORMATTER);

        this.setSlotString(String.format("S%02dT%02dD%s", startHour, endHour, datePart));
        this.setSlotStart(utcDateTime.withHour(startHour % 24).withMinute(0).withSecond(0).withNano(0).toInstant());
        ZonedDateTime startOfSlot = utcDateTime.withHour(startHour).truncatedTo(ChronoUnit.HOURS);
        this.slotEnd = startOfSlot.plusHours(slotDurationInHours).toInstant();
    }
}
