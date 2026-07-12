import { User, Employee, Role } from "../models";
import { generateVerificationToken } from "../utils/token.util";
import { hashPassword } from "../utils/hash.util";
import { sendVerificationEmail } from "../mailer/mailer.config";

export async function initiateOnboarding(
  email: string,
  fullName: string,
  roleId: string,
  employeeCode: string,
  designation: string,
  employmentType: string,
  joiningDate: string,
  departmentId: string | null,
  teamId: string | null,
  managerId: string | null
) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw { status: 400, message: "A user with this email already exists" };
  }

  const role = await Role.findByPk(roleId);
  if (!role) {
    throw { status: 404, message: "Invalid role" };
  }

  const token = generateVerificationToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Temporary placeholder password hash — overwritten when candidate sets their real password
  const placeholderHash = await hashPassword(token);

  const user = await User.create({
    email,
    password_hash: placeholderHash,
    full_name: fullName,
    role_id: roleId,
    is_verified: false,
    is_active: false,
    status: "PENDING",
    verification_token: token,
    verification_token_expires: expires,
  });

  const employee = await Employee.create({
    user_id: user.get("id"),
    employee_code: employeeCode,
    department_id: departmentId,
    team_id: teamId,
    manager_id: managerId,
    designation,
    employment_type: employmentType,
    joining_date: joiningDate,
    status: "Pending",
  });

  const verificationLink = `http://localhost:5173/activate?token=${token}`;

// Don't block the response on email delivery — log and continue if it fails
sendVerificationEmail(email, fullName, verificationLink).catch((err) => {
  console.error("Failed to send verification email:", err.message);
});

return { user, employee, verificationLink };
}

export async function verifyAndSetPassword(token: string, newPassword: string) {
  const user = await User.findOne({ where: { verification_token: token } });

  if (!user) {
    throw { status: 400, message: "Invalid verification token" };
  }

  const expires = user.get("verification_token_expires") as Date;
  if (!expires || new Date() > expires) {
    throw { status: 400, message: "Verification token has expired" };
  }

  if (user.get("is_verified")) {
    throw { status: 400, message: "This account is already verified" };
  }

  const hashedPassword = await hashPassword(newPassword);

  await user.update({
    password_hash: hashedPassword,
    is_verified: true,
    is_active: true,
    status: "ACTIVE",
    verification_token: null,
    verification_token_expires: null,
  });

  // Also activate the employee record
  const employee = await Employee.findOne({ where: { user_id: user.get("id") } });
  if (employee) {
    await employee.update({ status: "Active" });
  }

  return user;
}