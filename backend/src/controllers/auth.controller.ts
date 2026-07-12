import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { User, Role } from "../models";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import { verifyAndSetPassword } from "../services/onboarding.service";
import { generateVerificationToken } from "../utils/token.util";
import { sendVerificationEmail } from "../mailer/mailer.config";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("========== LOGIN SUCCESS ==========");
    console.log(result);
    console.log("===================================");

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error("========== LOGIN ERROR ==========");
    console.error(error);
    console.error(error?.stack);
    console.error("=================================");

    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await User.findByPk(req.user!.userId, {
      include: [{ model: Role }],
      attributes: {
        exclude: ["password_hash"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.get("id"),
          email: user.get("email"),
          fullName: user.get("full_name"),
          role: (user as any).Role?.name,
        },
      },
    });
  } catch (error: any) {
    console.error("========== GET ME ERROR ==========");
    console.error(error);
    console.error(error?.stack);
    console.error("==================================");

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

export async function refresh(req: Request, res: Response) {
  console.log("========== REFRESH REQUEST ==========");
  console.log("Cookies:", req.cookies);
  console.log("Refresh token:", req.cookies.refreshToken);

  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findByPk(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const accessToken = generateAccessToken({
      userId: payload.userId,
      roleId: payload.roleId,
      email: payload.email,
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error: any) {
    console.error("========== REFRESH ERROR ==========");
    console.error(error);
    console.error(error?.stack);
    console.error("===================================");

    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function verifyTokenController(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification token" });
    }

    const expires = user.get("verification_token_expires") as Date;
    if (!expires || new Date() > expires) {
      return res
        .status(400)
        .json({ success: false, message: "Verification token has expired" });
    }

    if (user.get("is_verified")) {
      return res
        .status(400)
        .json({ success: false, message: "This account is already verified" });
    }

    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        email: user.get("email"),
        full_name: user.get("full_name"),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function activateAccountController(req: Request, res: Response) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and password are required" });
    }

    const user = await verifyAndSetPassword(token, password);

    const payload = {
      userId: user.get("id") as string,
      roleId: user.get("role_id") as string,
      email: user.get("email") as string,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const role = await Role.findByPk(user.get("role_id") as string);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.get("id"),
          email: user.get("email"),
          fullName: user.get("full_name"),
          role: role?.name,
        },
      },
    });
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export async function resendActivationController(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.get("is_verified")) {
      return res
        .status(400)
        .json({ success: false, message: "Account is already verified" });
    }

    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      verification_token: token,
      verification_token_expires: expires,
    });

    const verificationLink = `http://localhost:5173/activate?token=${token}`;
    sendVerificationEmail(
      email,
      user.get("full_name") as string,
      verificationLink,
    ).catch((err) => {
      console.error("Failed to send verification email:", err.message);
    });

    return res.status(200).json({
      success: true,
      message: "Activation email resent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}
