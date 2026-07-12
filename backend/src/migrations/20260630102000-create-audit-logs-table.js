"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AUDIT_LOGS", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "USERS",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      entity_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      old_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      new_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Indexes for common lookups: by entity, by user, by time
    await queryInterface.addIndex("AUDIT_LOGS", ["entity_type", "entity_id"]);
    await queryInterface.addIndex("AUDIT_LOGS", ["user_id"]);
    await queryInterface.addIndex("AUDIT_LOGS", ["created_at"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("AUDIT_LOGS");
  },
};