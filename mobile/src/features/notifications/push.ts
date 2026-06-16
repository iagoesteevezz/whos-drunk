import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

/**
 * How notifications behave while the app is in the foreground. Call once on
 * startup (from the root layout).
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Requests permission and returns the Expo push token, or null if unavailable
 * (simulator, permission denied, or no project id). Never throws.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push tokens are only issued on physical devices.
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return null;
  }

  // EAS project id is required to mint an Expo push token.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResponse.data;
  } catch {
    return null;
  }
}

/** Normalizes the RN platform to the values the backend accepts. */
export function currentPlatform(): 'ios' | 'android' | 'unknown' {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'unknown';
}
