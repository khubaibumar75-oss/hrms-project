import { Model, DataTypes, Sequelize } from "sequelize";

class Permission extends Model {
  public id!: string;
  public name!: string;
  public module!: string;
  public action!: string;
}

export function initPermissionModel(sequelize: Sequelize) {
  Permission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
      },
      module: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "PERMISSIONS",
      underscored: true,
      timestamps: true,
    }
  );

  return Permission;
}

export default Permission;