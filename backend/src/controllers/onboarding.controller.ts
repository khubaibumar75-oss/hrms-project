import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { initiateOnboarding, verifyAndSetPassword } from "../services/onboarding.service";

export async function handleInitiateOnboarding(req: AuthRequest, res: Response) {
  try {
    const {
      email,
      fullName,
      roleId,
      employeeCode,
      designation,
      employmentType,
      joiningDate,
      departmentId,
      teamId,
      managerId,
    } = req.body;

    const result = await initiateOnboarding(
      email,
      fullName,
      roleId,
      employeeCode,
      designation,
      employmentType,
      joiningDate,
      departmentId || null,
      teamId || null,
      managerId || null
    );

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleVerify(req: Request, res: Response) {
  try {
    const { token, password } = req.body;
    const user = await verifyAndSetPassword(token, password);
    res.status(200).json({
      success: true,
      message: "Account verified successfully. You can now log in.",
      data: { email: user.get("email") },
    });
  } catch (error: any) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}