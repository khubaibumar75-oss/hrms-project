"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GOALS", {
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
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      target_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Not Started",
      },
      verified_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      verified_at: {
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

    // Database-level guard matching the SRS's 0-100 constraint
    await queryInterface.sequelize.query(
      `ALTER TABLE "GOALS" ADD CONSTRAINT goals_progress_range CHECK (progress >= 0 AND progress <= 100);`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("GOALS");
  },
};