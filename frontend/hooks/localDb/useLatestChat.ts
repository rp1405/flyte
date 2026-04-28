import { database } from "@/db";
import Room from "@/db/models/Room";
import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

export const useLatestChat = () => {
  const [latestRoom, setLatestRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query = database.get<Room>("rooms").query(
      Q.where("type", Q.notIn(["dm", "DM"])),
      Q.sortBy("last_message_timestamp", Q.desc),
      Q.take(1)
    );

    const subscription = query.observe().subscribe((data) => {
      setLatestRoom(data.length > 0 ? data[0] : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { latestRoom, isLoading };
};
