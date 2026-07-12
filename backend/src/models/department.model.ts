import { Model, DataTypes, Sequelize } from "sequelize";

class Department extends Model {
  public id!: string;
  public name!: string;
  public manager_id!: string | null;
}

export function initDepartmentModel(sequelize: Sequelize) {
  Department.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      manager_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "DEPARTMENTS",
      underscored: true,
      timestamps: true,
    }
  );

  return Department;
}

export default Department;