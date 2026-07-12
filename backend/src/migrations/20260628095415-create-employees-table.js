"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("EMPLOYEES", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      employee_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      department_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "DEPARTMENTS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      team_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "TEAMS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      manager_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "EMPLOYEES",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      designation: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      employment_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Full-time",
      },
      salary: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      joining_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Active",
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
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("EMPLOYEES", ["deleted_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("EMPLOYEES");
  },
};