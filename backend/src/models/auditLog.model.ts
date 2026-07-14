import { Model, DataTypes, Sequelize } from "sequelize";

class AuditLog extends Model {
  public id!: string;
  public user_id!: string | null;
  public action!: string;
  public entity_type!: string;
  public entity_id!: string | null;
  public old_data!: object | null;
  public new_data!: object | null;
}

export function initAuditLogModel(sequelize: Sequelize) {
  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entity_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      old_data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      new_data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "AUDIT_LOGS",
      underscored: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "created_at",
    },
  );

  return AuditLog;
}

export default AuditLog;
