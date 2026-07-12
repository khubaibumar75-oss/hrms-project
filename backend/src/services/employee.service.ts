import { Op } from "sequelize";
import { Employee, User, Department, Team, Role } from "../models";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getEmployees(req: AuthRequest) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const search = req.query.search as string;
  const sortBy = (req.query.sortBy as string) || "created_at";
  const sortDir = (req.query.sortDir as "asc" | "desc") || "desc";
  const departmentId = req.query.department_id as string;
  const status = req.query.status as string;

  const whereClause: any = {};

  if (departmentId) {
    whereClause.department_id = departmentId;
  }

  if (status) {
    whereClause.status = status;
  }

  const userWhere: any = {};

  if (search) {
    userWhere.full_name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const currentUser = await User.findByPk(req.user!.userId, {
    attributes: ["id"],
    include: [
      {
        model: Role,
        attributes: ["name"],
      },
    ],
  });

  if (!currentUser) {
    throw new Error("User not found");
  }
  const role = (currentUser as any).Role;

  if (!role) {
    throw new Error("Role not found");
  }

  const roleName = role.name;

  if (roleName !== "Super Admin") {
    if (roleName === "Department Manager") {
      const departments = await Department.findAll({
        where: {
          manager_id: req.user!.userId,
        },
        attributes: ["id"],
      });

      const departmentIds = departments.map((d: any) => d.id);

      if (departmentIds.length === 0) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      if (whereClause.department_id) {
        if (!departmentIds.includes(whereClause.department_id)) {
          return {
            items: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }
      } else {
        whereClause.department_id = {
          [Op.in]: departmentIds,
        };
      }
    } else {
      const employee = await Employee.findOne({
        where: {
          user_id: req.user!.userId,
        },
      });

      if (!employee) {
        return {
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      whereClause.id = employee.id;
    }
  }

  let order: any[] = [];

  if (sortBy === "full_name") {
    order = [[{ model: User }, "full_name", sortDir]];
  } else {
    order = [[sortBy, sortDir]];
  }

  const { count, rows } = await Employee.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        attributes: {
          exclude: ["password_hash"],
        },
        include: [
          {
            model: Role,
          },
        ],
      },
      {
        model: Department,
      },
      {
        model: Team,
      },
      {
        model: Employee,
        as: "manager",
        include: [
          {
            model: User,
            attributes: ["full_name"],
          },
        ],
      },
    ],
    offset,
    limit,
    order,
    distinct: true,
  });

  return {
    items: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}
export async function getEmployeeOptions() {
  return await Employee.findAll({
    where: {
      status: "Active",
    },
    include: [
      {
        model: User,
        attributes: ["full_name"],
      },
    ],
    attributes: ["id", "employee_code"],
    order: [["employee_code", "ASC"]],
  });
}

export async function getMyTeam(userId: string) {
  const manager = await Employee.findOne({
    where: {
      user_id: userId,
    },
  });

  if (!manager) {
    return [];
  }

  return await Employee.findAll({
    where: {
      manager_id: manager.id,
    },
    include: [
      {
        model: User,
        attributes: ["full_name"],
      },
    ],
    attributes: ["id", "employee_code"],
    order: [["employee_code", "ASC"]],
  });
}

export async function getEmployeeDetail(employeeId: string) {
  return await Employee.findByPk(employeeId, {
    include: [
      {
        model: User,
        attributes: {
          exclude: ["password_hash"],
        },
        include: [
          {
            model: Role,
          },
        ],
      },
      {
        model: Department,
      },
      {
        model: Team,
      },
      {
        model: Employee,
        as: "manager",
        include: [
          {
            model: User,
            attributes: ["full_name"],
          },
        ],
      },
      {
        model: Employee,
        as: "directReports",
        include: [
          {
            model: User,
            attributes: ["full_name"],
          },
        ],
      },
    ],
  });
}
