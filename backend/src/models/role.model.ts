import { Model, DataTypes, Sequelize } from "sequelize";

class Role extends Model {
  public id!: string;
  public name!: string;
  public description!: string | null;
}

export function initRoleModel(sequelize: Sequelize) {
  Role.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ROLES",
      underscored: true,
      timestamps: true,
    }
  );

  return Role;
}

export default Role;