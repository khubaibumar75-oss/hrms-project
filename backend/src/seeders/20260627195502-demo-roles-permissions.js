"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const superAdminId = uuidv4();
    const hrManagerId = uuidv4();
    const deptManagerId = uuidv4();
    const employeeId = uuidv4();

    await queryInterface.bulkInsert("ROLES", [
      {
        id: superAdminId,
        name: "Super Admin",
        description: "Full system access across all modules",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: hrManagerId,
        name: "HR Manager",
        description: "Manages onboarding, leave approvals, and review cycles",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: deptManagerId,
        name: "Department Manager",
        description: "Manages direct reports, approves leave and goals",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: employeeId,
        name: "Employee",
        description: "Standard employee self-service access",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const permissions = [
      { name: "attendance:clock_in", module: "Attendance", action: "CREATE" },
      { name: "attendance:clock_out", module: "Attendance", action: "UPDATE" },
      { name: "leave:request", module: "Leave", action: "CREATE" },
      { name: "leave:approve", module: "Leave", action: "UPDATE" },
      { name: "goal:create", module: "Goals", action: "CREATE" },
      { name: "goal:update_progress", module: "Goals", action: "UPDATE" },
      { name: "review:create_cycle", module: "Reviews", action: "CREATE" },
      { name: "review:submit", module: "Reviews", action: "CREATE" },
      { name: "employee:manage", module: "Employees", action: "UPDATE" },
      { name: "employee:view", module: "Employees", action: "READ" },
    ].map((p) => ({
      id: uuidv4(),
      ...p,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await queryInterface.bulkInsert("PERMISSIONS", permissions);

    // Give Super Admin every permission
    const rolePermissions = permissions.map((p) => ({
      role_id: superAdminId,
      permission_id: p.id,
      created_at: new Date(),
    }));

    await queryInterface.bulkInsert("ROLE_PERMISSIONS", rolePermissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ROLE_PERMISSIONS", null, {});
    await queryInterface.bulkDelete("PERMISSIONS", null, {});
    await queryInterface.bulkDelete("ROLES", null, {});
  },
};