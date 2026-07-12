import { Attendance, AttendanceBreak, Employee, Role } from "../models";
import { Op } from "sequelize";

async function validateAttendanceAccess(roleId: string) {
  const role = await Role.findByPk(roleId);

  if (!role) {
    throw {
      status: 403,
      message: "Invalid role",
    };
  }

  const allowedRoles = ["Employee", "Department Manager"];

  if (!allowedRoles.includes(role.name)) {
    throw {
      status: 403,
      message: "Attendance is not available for this role",
    };
  }

  return role;
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function clockIn(userId: string, roleId: string) {
  await validateAttendanceAccess(roleId);

  const employee = await Employee.findOne({ where: { user_id: userId } });
  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const today = getTodayDateString();

  const existing = await Attendance.findOne({
    where: { employee_id: employee.get("id"), attendance_date: today },
  });

  if (existing) {
    throw { status: 400, message: "Already clocked in today" };
  }

  const now = new Date();
  const nineAM = new Date(now);
  nineAM.setHours(9, 15, 0, 0);

  const status = now > nineAM ? "Late" : "Present";

  const record = await Attendance.create({
    employee_id: employee.get("id"),
    attendance_date: today,
    clock_in: now,
    status,
  });

  return record;
}

export async function startBreak(userId: string, roleId: string) {
  await validateAttendanceAccess(roleId);

  const employee = await Employee.findOne({ where: { user_id: userId } });
  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const today = getTodayDateString();
  const attendance = await Attendance.findOne({
    where: { employee_id: employee.get("id"), attendance_date: today },
  });

  if (!attendance) {
    throw { status: 400, message: "You haven't clocked in today" };
  }
  if (attendance.clock_out) {
    throw { status: 400, message: "You've already clocked out today" };
  }

  const openBreak = await AttendanceBreak.findOne({
    where: { attendance_id: attendance.get("id"), end_time: null },
  });
  if (openBreak) {
    throw { status: 400, message: "You already have an active break" };
  }

  const breakRecord = await AttendanceBreak.create({
    attendance_id: attendance.get("id"),
    start_time: new Date(),
  });
  return await Attendance.findByPk(attendance.id, {
    include: [{ model: AttendanceBreak, as: "breaks" }],
  });
}

export async function endBreak(userId: string, roleId: string) {
  await validateAttendanceAccess(roleId);

  const employee = await Employee.findOne({ where: { user_id: userId } });
  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const today = getTodayDateString();
  const attendance = await Attendance.findOne({
    where: { employee_id: employee.get("id"), attendance_date: today },
  });

  if (!attendance) {
    throw { status: 400, message: "You haven't clocked in today" };
  }

  const openBreak = await AttendanceBreak.findOne({
    where: { attendance_id: attendance.get("id"), end_time: null },
  });

  if (!openBreak) {
    throw { status: 400, message: "No active break to end" };
  }

  const endTime = new Date();
  const startTime = openBreak.get("start_time") as Date;
  const durationMinutes = Math.round(
    (endTime.getTime() - startTime.getTime()) / 60000,
  );

  await openBreak.update({
    end_time: endTime,
    duration_minutes: durationMinutes,
  });

  return openBreak;
}

export async function clockOut(userId: string, roleId: string) {
  await validateAttendanceAccess(roleId);

  const employee = await Employee.findOne({ where: { user_id: userId } });
  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const today = getTodayDateString();
  const attendance = await Attendance.findOne({
    where: { employee_id: employee.get("id"), attendance_date: today },
    include: [{ model: AttendanceBreak, as: "breaks" }],
  });

  if (!attendance) {
    throw { status: 400, message: "You haven't clocked in today" };
  }
  if (attendance.clock_out) {
    throw { status: 400, message: "You've already clocked out today" };
  }

  const openBreak = await AttendanceBreak.findOne({
    where: { attendance_id: attendance.get("id"), end_time: null },
  });
  if (openBreak) {
    throw {
      status: 400,
      message: "Please end your active break before clocking out",
    };
  }

  const clockOutTime = new Date();
  const clockInTime = attendance.get("clock_in") as Date;

  const breaks = (attendance.get("breaks") as any[]) || [];
  const totalBreakMinutes = breaks.reduce(
    (sum, b) => sum + (b.duration_minutes || 0),
    0,
  );

  const totalMinutesWorked =
    (clockOutTime.getTime() - clockInTime.getTime()) / 60000 -
    totalBreakMinutes;

  const totalHours = Math.max(0, totalMinutesWorked / 60);

  await attendance.update({
    clock_out: clockOutTime,
    total_hours: totalHours.toFixed(2),
  });

  return attendance;
}

export async function getTodayAttendance(userId: string, roleId: string) {
  await validateAttendanceAccess(roleId);

  const employee = await Employee.findOne({
    where: { user_id: userId },
  });

  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const today = getTodayDateString();

  const attendance = await Attendance.findOne({
    where: {
      employee_id: employee.id,
      attendance_date: today,
    },
    include: [{ model: AttendanceBreak, as: "breaks" }],
  });

  return attendance;
}

export async function getAttendanceHistory(
  userId: string,
  roleId: string,
  page = 1,
  limit = 10,
) {
  await validateAttendanceAccess(roleId);

  const employee = await Employee.findOne({
    where: { user_id: userId },
  });

  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Attendance.findAndCountAll({
    where: { employee_id: employee.id },
    include: [{ model: AttendanceBreak, as: "breaks" }],
    order: [["attendance_date", "DESC"]],
    limit,
    offset,
  });

  return {
    records: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
}
