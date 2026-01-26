// src/models/journey.ts

// --- HELPER INTERFACES for Nested Data ---

// Represents the User object nested within the response
export interface JourneyUser {
  id: string;
  // Timestamps are returned as ISO strings
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phoneNumber: string | null; // Can be null based on example
  profilePictureUrl: string;
  nickname: string | null;
}

// Represents the Room objects (Source, Destination, Flight) nested within the response
export interface JourneyRoom {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  // You can make type more specific (e.g., 'SOURCE' | 'FLIGHT') if values are fixed
  type: string;
  expiryTime: string; 
  lastMessageTimestamp: string; // Can be null based on example
}

// --- MAIN INTERFACES ---

// The data you send TO the backend (Unchanged from your request)
export interface CreateJourneyRequestPayload {
  source: string;
  destination: string;
  departureTime: string; // ISO string
  arrivalTime: string; // ISO string
  flightNumber: string;
  userId: string
}

// The data you get BACK from the backend on success
// Updated to match the actual JSON structure provided.
export interface JourneyResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  // Note: 'name' is null in the example, so we allow null here
  name: string | null;
  source: string;
  destination: string;
  // Note: Backend returns 'departTime', your request used 'departureTime'
  departTime: string;
  arrivalTime: string;
  destinationSlot: string;
  sourceSlot: string;
  flightNumber: string;
  // Nested objects using helper interfaces
  user: JourneyUser;
  sourceRoom: JourneyRoom;
  destinationRoom: JourneyRoom;
  flightRoom: JourneyRoom;
}
