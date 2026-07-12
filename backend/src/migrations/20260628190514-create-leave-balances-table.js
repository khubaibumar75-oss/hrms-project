"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LEAVE_BALANCES", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      employee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "EMPLOYEES",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      leave_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "LEAVE_TYPES",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      remaining_days: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // One balance row per employee per leave type
    await queryInterface.addIndex("LEAVE_BALANCES", ["employee_id", "leave_type_id"], {
      unique: true,
      name: "leave_balances_employee_type_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("LEAVE_BALANCES");
  },
};