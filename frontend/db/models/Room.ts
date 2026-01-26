import { Model, Q, Query } from "@nozbe/watermelondb";
import { children, text } from "@nozbe/watermelondb/decorators";
import Message from "./Message";

export default class Room extends Model {
  static table = "rooms";

  static associations = {
    messages: { type: "has_many", foreignKey: "room_id" },
  } as const;

  @text("name") name!: string;
  @text("description") description!: string;
  @text("type") type!: string;

  // Storing dates as strings per your request (ISO format)
  @text("expiry_time") expiryTime!: string;
  @text("created_at") createdAt!: string;
  @text("updated_at") updatedAt!: string;
  @text("last_message_timestamp") lastMessageTimestamp!: string;

  // Relationship: Returns a Query object that resolves to Message[]
  @children("messages") _messages!: Query<Message>;

  get messages() {
    return this._messages.extend(
      Q.sortBy("timestamp", "desc") // Enforce: Newest First
    );
  }
}
