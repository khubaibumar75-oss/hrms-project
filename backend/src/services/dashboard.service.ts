import { Op, fn, col } from "sequelize";
import {
  Attendance,
  Employee,
  Goal,
  LeaveBalance,
  LeaveRequest,
  Review,
  ReviewCycle,
  User,
  Role,
} from "../models";

export async function getDashboardSummary(userId: string) {
  const user = await User.findByPk(userId, {
    include: [{ model: Role }],
  });

  if (!user) throw new Error("User not found");

  const role = (user as any).Role?.name;

  const employee = await Employee.findOne({
    where: { user_id: userId },
  });

  if (role === "Super Admin" || role === "HR Manager") {
    const totalEmployees = await Employee.count();

    const pendingApprovals = await LeaveRequest.count({
      where: { status: "Pending" },
    });

    const attendance = await Attendance.findAll({
      order: [["attendance_date", "DESC"]],
      limit: 14,
    });

    const goals = await Goal.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const reviewCycles = await ReviewCycle.findAll();

    return {
      scope: "manager",
      teamSize: totalEmployees,
      pendingApprovalsCount: pendingApprovals,
      attendanceTrend: attendance.map((a: any) => ({
        date: a.attendance_date,
        present: a.status === "Present" ? 1 : 0,
        late: a.status === "Late" ? 1 : 0,
        absent: a.status === "Absent" ? 1 : 0,
      })),
      goalsByStatus: goals.map((g: any) => ({
        status: g.status,
        count: Number(g.count),
      })),
      reviewCycles: reviewCycles.map((r: any) => ({
        id: r.id,
        name: r.name,
        completionPercent: 0,
      })),
    };
  }

  if (!employee) {
    return {
      scope: "manager",
      teamSize: 0,
      pendingApprovalsCount: 0,
      attendanceTrend: [],
      goalsByStatus: [],
      reviewCycles: [],
    };
  }

  if (role === "Employee" || role === "Intern" || role === "Staff") {
    const attendance = await Attendance.findAll({
      where: { employee_id: employee.id },
      order: [["attendance_date", "DESC"]],
      limit: 7,
    });

    const weeklyHours = attendance.reduce(
      (sum, a: any) => sum + Number(a.total_hours || 0),
      0,
    );

    const leaveBalances = await LeaveBalance.findAll({
      where: { employee_id: employee.id },
    });

    const goals = await Goal.findAll({
      where: { employee_id: employee.id },
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    const pendingReviews = await Review.count({
      where: {
        employee_id: employee.id,
        status: "Pending",
      },
    });

    return {
      scope: "employee",
      attendance: {
        weeklyHours,
        weeklyTargetHours: 40,
        daily: attendance.reverse().map((a: any) => ({
          date: a.attendance_date,
          hours: Number(a.total_hours || 0),
        })),
      },
      leaveBalances: leaveBalances.map((b: any) => ({
        leave_type: b.leave_type_id,
        remaining_days: Number(b.remaining_days),
      })),
      goalsByStatus: goals.map((g: any) => ({
        status: g.status,
        count: Number(g.count),
      })),
      pendingReviewsCount: pendingReviews,
    };
  }

  const teamEmployees = await Employee.findAll({
    where: { manager_id: employee.id },
  });

  const employeeIds = teamEmployees.map((e) => e.id);

  const pendingApprovals = await LeaveRequest.count({
    where: {
      employee_id: {
        [Op.in]: employeeIds,
      },
      status: "Pending",
    },
  });

  const attendance = await Attendance.findAll({
    where: {
      employee_id: {
        [Op.in]: employeeIds,
      },
    },
    order: [["attendance_date", "DESC"]],
    limit: 14,
  });

  const goals = await Goal.findAll({
    where: {
      employee_id: {
        [Op.in]: employeeIds,
      },
    },
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });

  const reviewCycles = await ReviewCycle.findAll();

  return {
    scope: "manager",
    teamSize: employeeIds.length,
    pendingApprovalsCount: pendingApprovals,
    attendanceTrend: attendance.map((a: any) => ({
      date: a.attendance_date,
      present: a.status === "Present" ? 1 : 0,
      late: a.status === "Late" ? 1 : 0,
      absent: a.status === "Absent" ? 1 : 0,
    })),
    goalsByStatus: goals.map((g: any) => ({
      status: g.status,
      count: Number(g.count),
    })),
    reviewCycles: reviewCycles.map((r: any) => ({
      id: r.id,
      name: r.name,
      completionPercent: 0,
    })),
  };
}
