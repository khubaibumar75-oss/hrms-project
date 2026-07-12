import { Model, DataTypes, Sequelize } from "sequelize";

class Employee extends Model {
  public id!: string;
  public user_id!: string;
  public employee_code!: string;
  public department_id!: string | null;
  public team_id!: string | null;
  public manager_id!: string | null;
  public designation!: string;
  public employment_type!: string;
  public salary!: number | null;
  public joining_date!: string;
  public status!: string;
}

export function initEmployeeModel(sequelize: Sequelize) {
  Employee.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },
      employee_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      team_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      manager_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      employment_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Full-time",
      },
      salary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      joining_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Active",
      },
    },
    {
      sequelize,
      tableName: "EMPLOYEES",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return Employee;
}

export default Employee;