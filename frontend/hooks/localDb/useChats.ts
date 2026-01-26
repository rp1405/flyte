// hooks/useChats.ts
import { database } from "@/db";
import Room from "@/db/models/Room";
import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

export const useChats = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query = database.get<Room>("rooms").query(
      // This effectively does: "Latest message decides which room comes on top"
      Q.sortBy("last_message_timestamp", Q.desc)
    );

    const subscription = query.observe().subscribe((data) => {
      setRooms(data);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { rooms, isLoading };
};
