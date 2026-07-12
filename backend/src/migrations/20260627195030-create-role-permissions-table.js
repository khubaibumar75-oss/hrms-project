"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ROLE_PERMISSIONS", {
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "ROLES",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "PERMISSIONS",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("ROLE_PERMISSIONS", {
      fields: ["role_id", "permission_id"],
      type: "primary key",
      name: "role_permissions_pkey",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ROLE_PERMISSIONS");
  },
};