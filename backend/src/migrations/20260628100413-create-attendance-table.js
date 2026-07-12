"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ATTENDANCE", {
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
      attendance_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      clock_in: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      clock_out: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Present",
      },
      total_hours: {
        type: Sequelize.DECIMAL(5, 2),
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

    // Prevent duplicate attendance records for the same employee on the same day
    await queryInterface.addIndex("ATTENDANCE", ["employee_id", "attendance_date"], {
      unique: true,
      name: "attendance_employee_date_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ATTENDANCE");
  },
};