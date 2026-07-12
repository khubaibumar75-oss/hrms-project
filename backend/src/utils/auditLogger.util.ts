import { AuditLog } from "../models";

export async function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  oldData: object | null,
  newData: object | null
) {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData,
    });
  } catch (error) {
    // Never let audit logging failures break the actual business operation
    console.error("Failed to write audit log:", error);
  }
}