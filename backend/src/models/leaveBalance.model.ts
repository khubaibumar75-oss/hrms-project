import { Model, DataTypes, Sequelize } from "sequelize";

class LeaveBalance extends Model {
  public id!: string;
  public employee_id!: string;
  public leave_type_id!: string;
  public remaining_days!: number;
}

export function initLeaveBalanceModel(sequelize: Sequelize) {
  LeaveBalance.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      leave_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      remaining_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "LEAVE_BALANCES",
      underscored: true,
      timestamps: true,
    }
  );

  return LeaveBalance;
}

export default LeaveBalance;