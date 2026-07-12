"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("REVIEW_ANSWERS", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      review_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "REVIEWS",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      review_question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "REVIEW_QUESTIONS",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      answer_text: {
        type: Sequelize.TEXT,
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

    // SRS explicit constraint: rating >= 1 AND rating <= 5
    await queryInterface.sequelize.query(
      `ALTER TABLE "REVIEW_ANSWERS" ADD CONSTRAINT review_answers_rating_range CHECK (rating >= 1 AND rating <= 5);`
    );

    // One answer per question per review
    await queryInterface.addIndex("REVIEW_ANSWERS", ["review_id", "review_question_id"], {
      unique: true,
      name: "review_answers_unique_question",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("REVIEW_ANSWERS");
  },
};