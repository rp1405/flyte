import { Model, Relation } from "@nozbe/watermelondb";
import { relation, text } from "@nozbe/watermelondb/decorators";
import Room from "./Room";

export default class Message extends Model {
  static table = "messages";

  static associations = {
    rooms: { type: "belongs_to", key: "room_id" },
  } as const;

  @text("text") text!: string;
  @text("timestamp") timestamp!: string;

  // Relation: Strictly typed to link to the Room model
  @relation("rooms", "room_id") room!: Relation<Room>;

  // Sender Info (Raw Data - not a relation)
  @text("sender_id") senderId!: string;
  @text("sender_name") senderName!: string;

  // Media (Optional)
  @text("media_type") mediaType?: string;
  @text("media_link") mediaLink?: string;
}
