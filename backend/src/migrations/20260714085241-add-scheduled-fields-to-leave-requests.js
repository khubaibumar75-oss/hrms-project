"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("LEAVE_REQUESTS", "is_scheduled", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("LEAVE_REQUESTS", "scheduled_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      "LEAVE_REQUESTS",
      "is_scheduled"
    );

    await queryInterface.removeColumn(
      "LEAVE_REQUESTS",
      "scheduled_at"
    );
  },
};