"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the Super Admin role id
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM "ROLES" WHERE name = 'Super Admin' LIMIT 1;`
    );

    if (!roles.length) {
      throw new Error("Super Admin role not found. Run the roles seeder first.");
    }

    const superAdminRoleId = roles[0].id;
    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    await queryInterface.bulkInsert("USERS", [
      {
        id: uuidv4(),
        email: "admin@hrms.test",
        password_hash: hashedPassword,
        full_name: "Test Admin",
        role_id: superAdminRoleId,
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("USERS", { email: "admin@hrms.test" }, {});
  },
};