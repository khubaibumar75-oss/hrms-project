"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get role IDs we need
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "ROLES";`
    );
    const deptManagerRoleId = roles.find((r) => r.name === "Department Manager").id;
    const employeeRoleId = roles.find((r) => r.name === "Employee").id;

    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    // Create a manager user
    const managerUserId = uuidv4();
    await queryInterface.bulkInsert("USERS", [
      {
        id: managerUserId,
        email: "manager@hrms.test",
        password_hash: hashedPassword,
        full_name: "Sarah Manager",
        role_id: deptManagerRoleId,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create two employee users
    const emp1UserId = uuidv4();
    const emp2UserId = uuidv4();
    await queryInterface.bulkInsert("USERS", [
      {
        id: emp1UserId,
        email: "employee1@hrms.test",
        password_hash: hashedPassword,
        full_name: "Alex Employee",
        role_id: employeeRoleId,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: emp2UserId,
        email: "employee2@hrms.test",
        password_hash: hashedPassword,
        full_name: "Jamie Employee",
        role_id: employeeRoleId,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create a department, managed by Sarah
    const departmentId = uuidv4();
    await queryInterface.bulkInsert("DEPARTMENTS", [
      {
        id: departmentId,
        name: "Engineering",
        manager_id: managerUserId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create a team under that department, led by Sarah
    const teamId = uuidv4();
    await queryInterface.bulkInsert("TEAMS", [
      {
        id: teamId,
        department_id: departmentId,
        name: "Backend Team",
        lead_id: managerUserId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create employee profile for the manager
    const managerEmployeeId = uuidv4();
    await queryInterface.bulkInsert("EMPLOYEES", [
      {
        id: managerEmployeeId,
        user_id: managerUserId,
        employee_code: "EMP-001",
        department_id: departmentId,
        team_id: teamId,
        manager_id: null,
        designation: "Engineering Manager",
        employment_type: "Full-time",
        salary: 120000.0,
        joining_date: "2023-01-15",
        status: "Active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create employee profiles for the two employees, reporting to the manager
    await queryInterface.bulkInsert("EMPLOYEES", [
      {
        id: uuidv4(),
        user_id: emp1UserId,
        employee_code: "EMP-002",
        department_id: departmentId,
        team_id: teamId,
        manager_id: managerEmployeeId,
        designation: "Backend Developer",
        employment_type: "Full-time",
        salary: 75000.0,
        joining_date: "2024-03-01",
        status: "Active",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        user_id: emp2UserId,
        employee_code: "EMP-003",
        department_id: departmentId,
        team_id: teamId,
        manager_id: managerEmployeeId,
        designation: "Intern",
        employment_type: "Intern",
        salary: 25000.0,
        joining_date: "2026-06-01",
        status: "Active",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("EMPLOYEES", null, {});
    await queryInterface.bulkDelete("TEAMS", null, {});
    await queryInterface.bulkDelete("DEPARTMENTS", null, {});
    await queryInterface.bulkDelete("USERS", {
      email: ["manager@hrms.test", "employee1@hrms.test", "employee2@hrms.test"],
    }, {});
  },
};