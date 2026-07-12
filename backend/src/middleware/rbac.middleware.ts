import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { Role, Permission } from "../models";

export function requirePermission(permissionName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const role = await Role.findByPk(req.user.roleId, {
        include: [
          {
            model: Permission,
            where: { name: permissionName },
            required: false,
          },
        ],
      });

      const permissions = (role?.get("Permissions") as any[]) || [];

      if (!role || permissions.length === 0) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: missing permission '${permissionName}'`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
}