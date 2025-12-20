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

/**
 * Dummy data for Indian airports.
 * TODO: Replace with backend API call in the future.
 */
export const DUMMY_AIRPORTS: Airport[] = [
  {
    iata: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
  },
  {
    iata: "DEL",
    name: "Indira Gandhi International Airport",
    city: "New Delhi",
  },
  {
    iata: "BLR",
    name: "Kempegowda International Airport",
    city: "Bengaluru",
  },
  {
    iata: "HYD",
    name: "Rajiv Gandhi International Airport",
    city: "Hyderabad",
  },
  {
    iata: "MAA",
    name: "Chennai International Airport",
    city: "Chennai",
  },
  {
    iata: "CCU",
    name: "Netaji Subhash Chandra Bose International Airport",
    city: "Kolkata",
  },
  {
    iata: "COK",
    name: "Cochin International Airport",
    city: "Kochi",
  },
  {
    iata: "AMD",
    name: "Sardar Vallabhbhai Patel International Airport",
    city: "Ahmedabad",
  },
  { iata: "GOI", name: "Dabolim Airport", city: "Goa" },
  { iata: "PNQ", name: "Pune Airport", city: "Pune" },
];
