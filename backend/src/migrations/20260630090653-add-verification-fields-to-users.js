"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("USERS", "verification_token", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("USERS", "verification_token_expires", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("USERS", "status", {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: "PENDING",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("USERS", "verification_token");
    await queryInterface.removeColumn("USERS", "verification_token_expires");
    await queryInterface.removeColumn("USERS", "status");
  },
};