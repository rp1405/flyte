import messaging from "@react-native-firebase/messaging";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { RootStackNavigationProp } from "../App";
import { NotificationService } from "../services/NotificationService";
import Toast from "react-native-toast-message";

export const usePushNotifications = (userId?: string) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const requestUserPermission = async () => {
      // Requests permissions for iOS and Android 13+
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("Authorization status:", authStatus);
        getFcmToken();
      } else {
        console.log("Push notification permission denied.");
      }
    };

    const getFcmToken = async () => {
      try {
        const token = await messaging().getToken();
        setFcmToken(token);
        console.log("FCM Token:", token);
        await registerTokenWithBackend(token, userId);
      } catch (error) {
        console.error("Error fetching FCM token", error);
      }
    };

    const registerTokenWithBackend = async (token: string, uId: string) => {
      try {
        await NotificationService.registerToken(token, uId);
        console.log("FCM token registered with backend successfully.");
      } catch (error) {
        console.error("Failed to register FCM token with backend", error);
      }
    };

    requestUserPermission();

    // 1. Listen for Foreground Messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived in foreground!", remoteMessage);

      let roomId: string | undefined;
      let textMessage: string | undefined;
      try {
        const bodyData = JSON.parse(remoteMessage.notification?.body || "{}");
        roomId = bodyData.room?.id;
        textMessage = bodyData.messageText;
      } catch (e) {
        console.error("Could not parse notification body for roomId", e);
      }

      Toast.show({
        type: 'info',
        text1: remoteMessage.notification?.title || "New Message",
        text2: textMessage || "",
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        onPress: () => {
          
          if (roomId) {
            navigation.navigate("ChatDetail", {
              roomId: roomId,
              userId: userId,
            });
          }
          Toast.hide();
        }
      });
    });

    // 2. Handle background notification clicks (App is in background)
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        "Notification caused app to open from background state:",
        remoteMessage.notification
      );
      let roomId: string | undefined;
      try {
        const bodyData = JSON.parse(remoteMessage.notification?.body || "{}");
        roomId = bodyData.room?.id;
      } catch (e) {
        console.error("Could not parse notification body for roomId", e);
      }
      if (roomId) {
        navigation.navigate("ChatDetail", {
          roomId: roomId,
          userId: userId,
        });
      }
    });

    // 3. Handle quit state notification clicks (App was completely closed)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "Notification caused app to open from quit state:",
            remoteMessage.notification
          );
          let roomId: string | undefined;
          try {
            const bodyData = JSON.parse(remoteMessage.notification?.body || "{}");
            roomId = bodyData.room?.id;
          } catch (e) {
            console.error("Could not parse notification body for roomId", e);
          }
          if (roomId) {
            // Use setTimeout to ensure navigation is ready if it opened from cold start
            setTimeout(() => {
              navigation.navigate("ChatDetail", {
                roomId: roomId,
                userId: userId,
              });
            }, 500);
          }
        }
      });

    return unsubscribe; // Cleanup foreground listener on unmount
  }, [userId, navigation]);

  return { fcmToken };
};
