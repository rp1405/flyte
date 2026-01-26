import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "users",
      columns: [
        // 'id' is AUTOMATICALLY added by WatermelonDB. Do not add it here.
        { name: "name", type: "string" },
        { name: "email", type: "string" },
        { name: "profile_picture_url", type: "string", isOptional: true },
        { name: "token", type: "string" },
      ],
    }),
    tableSchema({
      name: "rooms",
      columns: [
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "type", type: "string" },
        { name: "expiry_time", type: "number" }, // Changed to string as per your interface (ISO)
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
        { name: "last_message_timestamp", type: "number" },
      ],
    }),
    tableSchema({
      name: "messages",
      columns: [
        { name: "text", type: "string" },
        { name: "timestamp", type: "string" }, // Your interface requested string
        { name: "room_id", type: "string", isIndexed: true }, // FK to Room

        // JUST DATA FIELDS (No Relations)
        { name: "sender_id", type: "string" },
        { name: "sender_name", type: "string" },

        // Media
        { name: "media_type", type: "string", isOptional: true },
        { name: "media_link", type: "string", isOptional: true },
      ],
    }),
  ],
});
