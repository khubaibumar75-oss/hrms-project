import { User, Role } from "../models";
import { comparePassword } from "../utils/hash.util";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util";

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({
    where: { email },
    include: [{ model: Role }],
  });

  if (!user) {
    throw {
      status: 401,
      message: "Invalid email or password",
    };
  }

  if (!user.get("is_active")) {
    throw {
      status: 403,
      message: "Account is deactivated",
    };
  }

  if (!user.get("is_verified")) {
    throw {
      status: 403,
      message: "Account is not verified",
    };
  }

  const isMatch = await comparePassword(
    password,
    user.get("password_hash") as string
  );

  if (!isMatch) {
    throw {
      status: 401,
      message: "Invalid email or password",
    };
  }

  const payload = {
    userId: user.get("id") as string,
    roleId: user.get("role_id") as string,
    email: user.get("email") as string,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await user.update({
    last_login: new Date(),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.get("id"),
      email: user.get("email"),
      fullName: user.get("full_name"),
      role: (user.get("Role") as any)?.name,
    },
  };
}