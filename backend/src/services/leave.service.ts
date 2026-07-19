import { Op } from "sequelize";
import {
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  Employee,
  User,
  Role,
  sequelize,
} from "../models";
import { logAudit } from "../utils/auditLogger.util";
import { createNotification } from "../utils/notify.util";
export async function getHRLeaveApprovals(
  page: number,
  limit: number,
  search: string,
) {
  const where: any = {
    status: "Pending",
    manager_status: "Approved",
    hr_status: "Pending",
    [Op.and]: [
      { is_scheduled: false },
      { status: "Pending" },
      {
        [Op.or]: [
          { scheduled_at: null },
          { scheduled_at: { [Op.lte]: new Date() } },
        ],
      },
    ],
  };

  if (search) {
    where.reason = { [Op.iLike]: `%${search}%` };
  }

  console.log("========== HR WHERE ==========");
  console.dir(where, { depth: null });

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    include: [
      { model: Employee, include: [{ model: User }] },
      { model: LeaveType },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset: (page - 1) * limit,
  });

  return { data: rows, total: count, page, limit };
}

export async function getLeaveApprovals(
  managerUserId: string,
  page: number,
  limit: number,
  search: string,
) {
  const manager = await Employee.findOne({ where: { user_id: managerUserId } });
  if (!manager) throw { status: 404, message: "Manager profile not found" };

  const where: any = {
    status: "Pending",
    manager_status: "Pending",
    // Scheduled leaves should not appear until cron releases them.
    is_scheduled: false,
    // Extra guard in case some rows still have scheduled_at populated.
    [Op.or]: [
      { scheduled_at: null },
      { scheduled_at: { [Op.lte]: new Date() } },
    ],
  };

  if (search) {
    where.reason = { [Op.iLike]: `%${search}%` };
  }
  console.log("========== MANAGER WHERE ==========");
  console.dir(where, { depth: null });

  const { rows, count } = await LeaveRequest.findAndCountAll({
    logging: console.log, // <-- Add this

    where,

    include: [
      {
        model: Employee,
        required: true,
        where: {
          manager_id: manager.get("id"),
        },
        include: [{ model: User }],
      },
      {
        model: LeaveType,
      },
    ],

    order: [["created_at", "DESC"]],

    limit,

    offset: (page - 1) * limit,
  });

  return { data: rows, total: count, page, limit };
}

async function getRoleName(userId: string): Promise<string> {
  const user = await User.findByPk(userId, {
    include: [Role],
  });

  const role = user?.get("Role") as any;

  return role?.name?.toLowerCase() || "";
}

export async function getLeaveTypes() {
  return LeaveType.findAll({
    order: [["name", "ASC"]],
  });
}

export async function getLeaveBalances(userId: string) {
  const employee = await Employee.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!employee) {
    throw {
      status: 404,
      message: "Employee profile not found",
    };
  }

  return LeaveBalance.findAll({
    where: {
      employee_id: employee.get("id"),
    },

    include: [
      {
        model: LeaveType,
      },
    ],
  });
}

export async function getLeaveRequests(
  userId: string,
  page: number,
  limit: number,
  search: string,
  sortField: string,
  sortDirection: "asc" | "desc",
) {
  const employee = await Employee.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!employee) {
    throw {
      status: 404,
      message: "Employee profile not found",
    };
  }

  const roleName = await getRoleName(userId);

  const isAdminOrHr = roleName === "super admin" || roleName === "hr manager";

  const where: any = isAdminOrHr
    ? {}
    : {
        employee_id: employee.get("id"),
      };

  if (search) {
    where.reason = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const allowedSortFields = ["created_at", "start_date", "end_date", "status"];

  const orderField = allowedSortFields.includes(sortField)
    ? sortField
    : "created_at";

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,

    include: [
      {
        model: Employee,
      },
      {
        model: LeaveType,
      },
    ],

    order: [[orderField, sortDirection === "asc" ? "ASC" : "DESC"]],

    limit,

    offset: (page - 1) * limit,
  });

  return {
    data: rows,
    total: count,
    page,
    limit,
  };
}

export async function requestLeave(
  userId: string,
  leaveTypeId: string,
  startDate: string,
  endDate: string,
  reason: string,
  isScheduled: boolean = false,
  scheduledAt: string | null = null,
) {
  console.log("DEBUG requestLeave:", {
    isScheduled,
    scheduledAt,
    now: new Date().toISOString(),
  });
  console.log("========== REQUEST ==========");
  console.log("scheduledAt from frontend:", scheduledAt);
  console.log("new Date(scheduledAt):", new Date(scheduledAt!));
  console.log("ISO:", new Date(scheduledAt!).toISOString());
  console.log("=============================");

  const employee = await Employee.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!employee) {
    throw {
      status: 404,
      message: "Employee profile not found",
    };
  }
  // ...rest of the function stays exactly the same

  const daysRequested =
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24) +
    1;

  if (daysRequested <= 0) {
    throw {
      status: 400,
      message: "Invalid date range",
    };
  }
  if (isScheduled) {
    if (!scheduledAt) {
      throw {
        status: 400,
        message: "Scheduled date is required.",
      };
    }

    const scheduleDate = new Date(scheduledAt);
    const leaveStart = new Date(startDate);

    if (scheduleDate >= leaveStart) {
      throw {
        status: 400,
        message: "Scheduled date must be before the leave start date.",
      };
    }

    if (scheduleDate <= new Date()) {
      throw {
        status: 400,
        message: "Scheduled date must be in the future.",
      };
    }
  }

  const balance = await LeaveBalance.findOne({
    where: {
      employee_id: employee.get("id"),

      leave_type_id: leaveTypeId,
    },
  });

  if (!balance) {
    throw {
      status: 404,
      message: "Leave balance not found for this leave type",
    };
  }

  if (Number(balance.get("remaining_days")) < daysRequested) {
    throw {
      status: 400,
      message: "Insufficient leave balance",
    };
  }
  console.log("SERVICE BEFORE CREATE:", {
    isScheduled,
    scheduledAt,
  });
  const request = await LeaveRequest.create({
    employee_id: employee.get("id"),

    leave_type_id: leaveTypeId,

    start_date: startDate,

    end_date: endDate,

    days_requested: daysRequested,

    reason,

    status: isScheduled ? "Scheduled" : "Pending",

    manager_status: "Pending",

    hr_status: "Pending",

    is_scheduled: isScheduled,

    scheduled_at: isScheduled ? scheduledAt : null,
  });

  console.log("========== LEAVE DEBUG ==========");
  console.log("isScheduled:", isScheduled, typeof isScheduled);
  console.log("manager_id:", employee.get("manager_id"));
  console.log("=================================");

  // Only notify manager immediately for NON-scheduled requests.
  // Scheduled leaves should reach manager only when the cron releases them.
  if (!isScheduled && employee.get("manager_id")) {
    const manager = await Employee.findByPk(
      employee.get("manager_id") as string,
    );

    if (manager) {
      await createNotification(
        manager.get("user_id") as string,

        "New Leave Request",

        "An employee has submitted a leave request requiring your approval.",

        "LEAVE_REQUEST",

        "LeaveRequest",

        request.get("id") as string,
      );
    }
  }

  return request;
}

export async function managerReview(
  managerUserId: string,
  requestId: string,
  decision: "Approved" | "Rejected",
  comment: string,
) {
  const request = await LeaveRequest.findByPk(requestId, {
    include: [
      {
        model: Employee,
      },
    ],
  });

  if (!request) {
    throw {
      status: 404,
      message: "Leave request not found",
    };
  }

  const scheduledAt = request.get("scheduled_at") as Date | null;

  if (request.get("is_scheduled") && scheduledAt && scheduledAt > new Date()) {
    throw {
      status: 400,
      message: "This leave request is not available for review yet.",
    };
  }

  if (request.get("manager_status") !== "Pending") {
    throw {
      status: 400,
      message: "This request has already been reviewed by a manager",
    };
  }

  const employee = request.get("Employee") as any;

  const managerEmployee = await Employee.findOne({
    where: {
      user_id: managerUserId,
    },
  });

  if (!managerEmployee || employee.manager_id !== managerEmployee.get("id")) {
    throw {
      status: 403,
      message: "You are not the manager of this employee",
    };
  }

  const oldData = {
    manager_status: request.get("manager_status"),

    status: request.get("status"),
  };

  await request.update({
    manager_status: decision,

    manager_comment: comment,

    manager_reviewed_by: managerUserId,

    manager_reviewed_at: new Date(),

    status: decision === "Rejected" ? "Rejected" : "Pending",
  });

  await logAudit(
    managerUserId,

    decision === "Approved"
      ? "LEAVE_MANAGER_APPROVED"
      : "LEAVE_MANAGER_REJECTED",

    "LeaveRequest",

    requestId,

    oldData,

    {
      manager_status: decision,

      status: decision === "Rejected" ? "Rejected" : "Pending",
    },
  );

  if (decision === "Approved") {
    const hrUsers = await User.findAll({
      include: [
        {
          model: Role,
          where: {
            name: "HR Manager",
          },
        },
      ],
    });

    for (const hr of hrUsers) {
      await createNotification(
        hr.get("id") as string,

        "Leave Approval Required",

        "A leave request has been approved by a department manager and requires HR review.",

        "LEAVE_REQUEST",

        "LeaveRequest",

        requestId,
      );
    }
  }

  if (decision === "Rejected") {
    await createNotification(
      employee.get("user_id") as string,

      "Leave Request Rejected",

      "Your leave request has been rejected by your department manager.",

      "LEAVE_REJECTED",

      "LeaveRequest",

      requestId,
    );
  }

  return request;
}

export async function hrReview(
  hrUserId: string,
  requestId: string,
  decision: "Approved" | "Rejected",
  comment: string,
) {
  const request = await LeaveRequest.findByPk(requestId);
  if (!request) {
    throw {
      status: 404,
      message: "Leave request not found",
    };
  }
  if (request.get("manager_status") !== "Approved") {
    throw {
      status: 400,
      message: "This request has not been approved by manager yet",
    };
  }

  if (request.get("hr_status") !== "Pending") {
    throw {
      status: 400,
      message: "This request has already been reviewed by HR",
    };
  }

  if (decision === "Rejected") {
    const oldData = {
      hr_status: request.get("hr_status"),

      status: request.get("status"),
    };

    await request.update({
      hr_status: "Rejected",

      hr_comment: comment,

      hr_reviewed_by: hrUserId,

      hr_reviewed_at: new Date(),

      status: "Rejected",
    });

    await logAudit(
      hrUserId,

      "LEAVE_REJECTED",

      "LeaveRequest",

      requestId,

      oldData,

      {
        hr_status: "Rejected",

        status: "Rejected",
      },
    );

    const emp = await Employee.findByPk(request.get("employee_id") as string);

    if (emp) {
      await createNotification(
        emp.get("user_id") as string,

        "Leave Request Rejected",

        "Your leave request has been rejected by HR.",

        "LEAVE_REJECTED",

        "LeaveRequest",

        requestId,
      );
    }

    return request;
  }

  const oldBalance = await LeaveBalance.findOne({
    where: {
      employee_id: request.get("employee_id"),

      leave_type_id: request.get("leave_type_id"),
    },
  });

  const oldRemaining = oldBalance
    ? Number(oldBalance.get("remaining_days"))
    : null;

  const result = await sequelize.transaction(async (t) => {
    const balance = await LeaveBalance.findOne({
      where: {
        employee_id: request.get("employee_id"),

        leave_type_id: request.get("leave_type_id"),
      },

      transaction: t,

      lock: t.LOCK.UPDATE,
    });

    if (!balance) {
      throw {
        status: 404,
        message: "Leave balance not found",
      };
    }

    const remaining = Number(balance.get("remaining_days"));

    const requested = Number(request.get("days_requested"));

    if (remaining < requested) {
      throw {
        status: 400,
        message: "Insufficient leave balance",
      };
    }

    await balance.update(
      {
        remaining_days: remaining - requested,
      },
      {
        transaction: t,
      },
    );

    await request.update(
      {
        hr_status: "Approved",

        hr_comment: comment,

        hr_reviewed_by: hrUserId,

        hr_reviewed_at: new Date(),

        status: "Approved",
      },
      {
        transaction: t,
      },
    );

    return request;
  });

  await logAudit(
    hrUserId,

    "LEAVE_APPROVED",

    "LeaveRequest",

    requestId,

    {
      remaining_days: oldRemaining,

      status: "Pending",
    },

    {
      remaining_days: oldRemaining! - Number(request.get("days_requested")),

      status: "Approved",
    },
  );

  const emp = await Employee.findByPk(request.get("employee_id") as string);

  if (emp) {
    await createNotification(
      emp.get("user_id") as string,

      "Leave Request Approved",

      "Your leave request has been approved.",

      "LEAVE_APPROVED",

      "LeaveRequest",

      requestId,
    );
  }

  return result;
}
