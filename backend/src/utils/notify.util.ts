import { Notification } from "../models";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  entityType: string | null = null,
  entityId: string | null = null
) {
  try {
    await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      is_read: false,
      entity_type: entityType,
      entity_id: entityId,
    });
  } catch (error) {
    // Never let notification creation failures break the actual business operation
    console.error("Failed to create notification:", error);
  }
}