package com.flyte.backend.util;

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
    private String slotString; // Keeps the technical ID: S16T20D06012026

    // Formatters for the human-readable string
    private static final DateTimeFormatter ID_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");
    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("ha"); // e.g. 4PM
    private static final DateTimeFormatter DATE_SUFFIX = DateTimeFormatter.ofPattern("ddMMM"); // e.g. 06Jan

    public SlotGenerator(Instant instant, int totalSlots) {

        if (totalSlots <= 0 || 24 % totalSlots != 0) {
            throw new IllegalArgumentException(
                    "The number of slots must be a positive integer that divides 24 perfectly.");
        }

        this.totalSlots = totalSlots;
        this.slotDurationInHours = 24 / this.totalSlots;

        ZonedDateTime utcDateTime = instant.atZone(ZoneOffset.UTC);

        // Logic to calculate start/end hours
        int hour = utcDateTime.getHour();
        int startHour = (hour / slotDurationInHours) * slotDurationInHours;

        // Set Instants
        ZonedDateTime startOfSlot = utcDateTime.withHour(startHour).truncatedTo(ChronoUnit.HOURS);
        this.slotStart = startOfSlot.toInstant();
        this.slotEnd = startOfSlot.plusHours(slotDurationInHours).toInstant();

        // Set Technical ID (Old logic preserved)
        String datePart = utcDateTime.format(ID_FORMATTER);
        // e.g. S16T20D06012026
        this.setSlotString(String.format("S%02dT%02dD%s", startHour, startHour + slotDurationInHours, datePart));
    }

    /**
     * NEW: Returns a human-friendly string for Room Names.
     * Example Output: "4PM-8PM-06Jan"
     */
    public String getReadableSlotString() {
        ZonedDateTime start = slotStart.atZone(ZoneOffset.UTC);
        ZonedDateTime end = slotEnd.atZone(ZoneOffset.UTC);

        return String.format("%s-%s-%s",
                start.format(HOUR_FORMATTER),
                end.format(HOUR_FORMATTER),
                start.format(DATE_SUFFIX));
    }
}