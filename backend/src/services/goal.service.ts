import { Goal, GoalProgressLog, Employee, User } from "../models";
import { logAudit } from "../utils/auditLogger.util";

export async function getGoals() {
  return Goal.findAll({
    include: [{ model: Employee }, { model: User, as: "creator" }],
    order: [["created_at", "DESC"]],
  });
}

export async function createGoal(
  managerUserId: string,
  employeeId: string,
  title: string,
  description: string,
  targetDate: string,
) {
  const managerEmployee = await Employee.findOne({
    where: { user_id: managerUserId },
  });
  if (!managerEmployee) {
    throw { status: 404, message: "Manager employee profile not found" };
  }

  const targetEmployee = await Employee.findByPk(employeeId);
  if (!targetEmployee) {
    throw { status: 404, message: "Target employee not found" };
  }

  if (targetEmployee.get("manager_id") !== managerEmployee.get("id")) {
    throw {
      status: 403,
      message: "You can only set goals for your direct reports",
    };
  }

  const goal = await Goal.create({
    employee_id: employeeId,
    created_by: managerUserId,
    title,
    description,
    target_date: targetDate,
    progress: 0,
    status: "Not Started",
  });

  return goal;
}

export async function updateProgress(
  userId: string,
  goalId: string,
  newProgress: number,
  comment: string,
) {
  if (newProgress < 0 || newProgress > 100) {
    throw { status: 400, message: "Progress must be between 0 and 100" };
  }

  if (!comment || comment.trim().length === 0) {
    throw {
      status: 400,
      message: "A comment is required when updating progress",
    };
  }

  const employee = await Employee.findOne({ where: { user_id: userId } });
  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  const goal = await Goal.findByPk(goalId);
  if (!goal) {
    throw { status: 404, message: "Goal not found" };
  }

  if (goal.get("employee_id") !== employee.get("id")) {
    throw {
      status: 403,
      message: "You can only update progress on your own goals",
    };
  }

  if (goal.get("status") === "Achieved") {
    throw {
      status: 400,
      message: "This goal has already been verified as achieved",
    };
  }

  const previousProgress = goal.get("progress") as number;

  let newStatus = "In Progress";
  if (newProgress === 0) newStatus = "Not Started";
  if (newProgress === 100) newStatus = "Achieved";
  await goal.update({
    progress: newProgress,
    status: newProgress === 100 ? "In Progress" : newStatus,
  });

  await GoalProgressLog.create({
    goal_id: goalId,
    updated_by: userId,
    previous_progress: previousProgress,
    new_progress: newProgress,
    comment,
  });

  return goal;
}

export async function verifyGoal(managerUserId: string, goalId: string) {
  const goal = await Goal.findByPk(goalId, { include: [{ model: Employee }] });
  if (!goal) {
    throw { status: 404, message: "Goal not found" };
  }

  if (goal.get("progress") !== 100) {
    throw {
      status: 400,
      message: "Goal must reach 100% progress before it can be verified",
    };
  }

  const employee = goal.get("Employee") as any;
  const managerEmployee = await Employee.findOne({
    where: { user_id: managerUserId },
  });

  if (!managerEmployee || employee.manager_id !== managerEmployee.get("id")) {
    throw { status: 403, message: "You are not the manager of this employee" };
  }

  const oldData = { status: goal.get("status"), verified_by: null };

  await goal.update({
    status: "Achieved",
    verified_by: managerUserId,
    verified_at: new Date(),
  });

  await logAudit(managerUserId, "GOAL_VERIFIED", "Goal", goalId, oldData, {
    status: "Achieved",
    verified_by: managerUserId,
  });

  return goal;
}
