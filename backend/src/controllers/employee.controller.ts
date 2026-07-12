import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getEmployees,
  getEmployeeOptions,
  getMyTeam,
  getEmployeeDetail,
} from "../services/employee.service";

export async function handleGetEmployees(req: AuthRequest, res: Response) {
  try {
    const result = await getEmployees(req);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetEmployeeOptions(
  req: AuthRequest,
  res: Response,
) {
  try {
    const employees = await getEmployeeOptions();

    return res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetMyTeam(req: AuthRequest, res: Response) {
  try {
    const team = await getMyTeam(req.user!.userId);

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function handleGetEmployeeDetail(req: AuthRequest, res: Response) {
  try {
    const employee = await getEmployeeDetail(req.params.id as string);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
