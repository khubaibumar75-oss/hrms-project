"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("REVIEWS", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      review_cycle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "REVIEW_CYCLES",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      review_template_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "REVIEW_TEMPLATES",
          key: "id",
        },
        onDelete: "CASCADE",
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
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      review_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },
      score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      submitted_at: {
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

    // One review per (employee, reviewer, type, cycle) — prevents duplicate submissions
    await queryInterface.addIndex(
      "REVIEWS",
      ["review_cycle_id", "employee_id", "reviewer_id", "review_type"],
      {
        unique: true,
        name: "reviews_unique_per_reviewer_cycle",
      }
    );

    // DB-level guard matching the SRS's three perspectives
    await queryInterface.sequelize.query(
      `ALTER TABLE "REVIEWS" ADD CONSTRAINT reviews_type_check CHECK (review_type IN ('Self', 'Peer', 'Manager'));`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("REVIEWS");
  },
};