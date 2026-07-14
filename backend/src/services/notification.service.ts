import { Notification } from "../models";
import { Op } from "sequelize";

export async function getMyNotifications(userId: string) {
  const notifications = await Notification.findAll({
    where: { user_id: userId },
    order: [
      ["is_read", "ASC"],
      ["created_at", "DESC"],
    ],
  });

  return notifications;
}

export async function markAsRead(userId: string, notificationId: string) {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw { status: 404, message: "Notification not found" };
  }

  if (notification.get("user_id") !== userId) {
    throw {
      status: 403,
      message: "You can only mark your own notifications as read",
    };
  }

  await notification.update({ is_read: true });
  return notification;
}

export async function markAllAsRead(userId: string) {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } },
  );

  return { message: "All notifications marked as read" };
}
