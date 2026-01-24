// src/models/airport.ts

/**
 * Represents an airport entity.
 * Used for source and destination selection.
 */
export interface Airport {
  iata: string; // e.g., BOM (The unique identifier)
  name: string; // e.g., Chhatrapati Shivaji Maharaj International Airport
  city: string; // e.g., Mumbai
}


