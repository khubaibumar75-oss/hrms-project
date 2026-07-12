"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create leave types
    const sickLeaveId = uuidv4();
    const casualLeaveId = uuidv4();
    const annualLeaveId = uuidv4();

    await queryInterface.bulkInsert("LEAVE_TYPES", [
      {
        id: sickLeaveId,
        name: "Sick Leave",
        default_allocation: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: casualLeaveId,
        name: "Casual Leave",
        default_allocation: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: annualLeaveId,
        name: "Annual Leave",
        default_allocation: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Get all employees we seeded earlier
    const [employees] = await queryInterface.sequelize.query(
      `SELECT id FROM "EMPLOYEES";`
    );

    // Give every employee a balance row for each leave type
    const balances = [];
    const leaveTypeIds = [sickLeaveId, casualLeaveId, annualLeaveId];
    const allocations = { [sickLeaveId]: 15, [casualLeaveId]: 10, [annualLeaveId]: 20 };

    for (const emp of employees) {
      for (const leaveTypeId of leaveTypeIds) {
        balances.push({
          id: uuidv4(),
          employee_id: emp.id,
          leave_type_id: leaveTypeId,
          remaining_days: allocations[leaveTypeId],
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("LEAVE_BALANCES", balances);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("LEAVE_BALANCES", null, {});
    await queryInterface.bulkDelete("LEAVE_TYPES", null, {});
  },
};