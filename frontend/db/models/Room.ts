import { Model, Q, Query } from "@nozbe/watermelondb";
import { children, date, text } from "@nozbe/watermelondb/decorators";
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
  @date("expiry_time") expiryTime!: Date;
  @date("created_at") createdAt!: Date;
  @date("updated_at") updatedAt!: Date;
  @date("last_message_timestamp") lastMessageTimestamp!: Date;

  // Relationship: Returns a Query object that resolves to Message[]
  @children("messages") _messages!: Query<Message>;

  get messages() {
    return this._messages.extend(
      Q.sortBy("timestamp", "desc") // Enforce: Newest First
    );
  }
}
