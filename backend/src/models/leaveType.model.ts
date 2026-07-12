import { Model, DataTypes, Sequelize } from "sequelize";

class LeaveType extends Model {
  public id!: string;
  public name!: string;
  public default_allocation!: number;
}

export function initLeaveTypeModel(sequelize: Sequelize) {
  LeaveType.init(
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
      default_allocation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "LEAVE_TYPES",
      underscored: true,
      timestamps: true,
    }
  );

  return LeaveType;
}

export default LeaveType;