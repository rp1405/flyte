import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";

// 1. Import your Schema (the blueprint you just pasted)
import { schema } from "./schema";

// 2. Import your Models (the JS classes)
import Message from "./models/Message";
import Room from "./models/Room";
import User from "./models/User";

// 3. Create the Adapter (The engine that talks to SQLite)
const adapter = new SQLiteAdapter({
  schema,
  // (optional) dbName: 'myapp',
  // (optional) migrations,
  jsi: true, // Recommended: Enables faster C++ database operations
  onSetUpError: (error) => {
    console.error("Database failed to load:", error);
  },
});

// 4. Create and Export the Database Instance
export const database = new Database({
  adapter,
  modelClasses: [User, Room, Message],
});
