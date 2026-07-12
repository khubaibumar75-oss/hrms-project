"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("LEAVE_REQUESTS", {
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
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      days_requested: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },
      manager_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },
      manager_comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      manager_reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      manager_reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      hr_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },
      hr_comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      hr_reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      hr_reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("LEAVE_REQUESTS");
  },
};