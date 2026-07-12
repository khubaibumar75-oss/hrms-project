import { Model, DataTypes, Sequelize } from "sequelize";

class Notification extends Model {
  public id!: string;
  public user_id!: string;
  public title!: string;
  public message!: string;
  public type!: string;
  public is_read!: boolean;
  public entity_type!: string | null;
  public entity_id!: string | null;
}

export function initNotificationModel(sequelize: Sequelize) {
  Notification.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      entity_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "NOTIFICATIONS",
      underscored: true,
      timestamps: true,
      updatedAt: false,
      createdAt: "created_at",
    }
  );

  return Notification;
}

export default Notification;