"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM "ROLES" WHERE name = 'HR Manager' LIMIT 1;`
    );

    if (!roles.length) {
      throw new Error("HR Manager role not found. Run the roles seeder first.");
    }

    const hrRoleId = roles[0].id;
    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    await queryInterface.bulkInsert("USERS", [
      {
        id: uuidv4(),
        email: "hr@hrms.test",
        password_hash: hashedPassword,
        full_name: "HR Manager Test",
        role_id: hrRoleId,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("USERS", { email: "hr@hrms.test" }, {});
  },
};