import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility dedicated strictly to iOS.
 * On Android, Web, or any other non-iOS platform, every function
 * is a guaranteed safe no-op.
 */
class HapticsService {
  /**
   * Helper to verify if the current runtime is iOS.
   */
  private isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  /**
   * Subtle selection click for tabs, pickers, OTP digit focus, and toggles.
   */
  async selection(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Gracefully ignore on devices/simulators without haptic support
    }
  }

  /**
   * Light impact for small buttons, list item taps, and card interactions.
   */
  async lightImpact(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Gracefully ignore
    }
  }

  /**
   * Medium impact for primary buttons (Login, Send Message, Place Order, Start Recording).
   */
  async mediumImpact(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Gracefully ignore
    }
  }

  /**
   * Heavy impact for decisive or destructive actions (Stop Recording, Clear, Logout).
   */
  async heavyImpact(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Gracefully ignore
    }
  }

  /**
   * Success notification vibration for completed actions (Order Placed, OTP Verified, Quote Accepted).
   */
  async successNotification(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Gracefully ignore
    }
  }

  /**
   * Error notification vibration for failed actions (Wrong OTP, Network Failure, Validation Error).
   */
  async errorNotification(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Gracefully ignore
    }
  }

  /**
   * Warning notification vibration for alert popups and caution prompts.
   */
  async warningNotification(): Promise<void> {
    if (!this.isIOS()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Gracefully ignore
    }
  }
}

export const haptic = new HapticsService();
export default haptic;
