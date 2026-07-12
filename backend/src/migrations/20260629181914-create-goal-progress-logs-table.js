"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GOAL_PROGRESS_LOGS", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      goal_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "GOALS",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      previous_progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      new_progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("GOAL_PROGRESS_LOGS");
  },
};