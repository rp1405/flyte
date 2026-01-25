import { Model } from "@nozbe/watermelondb";
import { text } from "@nozbe/watermelondb/decorators";

export default class User extends Model {
  static table = "users";

  // "!" asserts that this property will exist at runtime (managed by WatermelonDB)
  @text("name") name!: string;
  @text("email") email!: string;
  @text("profile_picture_url") profilePictureUrl?: string;
  @text("token") token!: string;
}
