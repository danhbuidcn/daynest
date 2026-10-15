import * as Haptics from 'expo-haptics';

// Fire and forget: a device without a vibration motor, or a rejected call, must never break the
// action that asked for it.
const run = (call: () => Promise<void>) => {
  call().catch(() => {});
};

export const tapLight = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const lift = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const success = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
