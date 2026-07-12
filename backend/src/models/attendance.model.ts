import { Model, DataTypes, Sequelize } from "sequelize";

class Attendance extends Model {
  public id!: string;
  public employee_id!: string;
  public attendance_date!: string;
  public clock_in!: Date | null;
  public clock_out!: Date | null;
  public status!: string;
  public total_hours!: number | null;
}

export function initAttendanceModel(sequelize: Sequelize) {
  Attendance.init(
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
      attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      clock_in: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      clock_out: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Present",
      },
      total_hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ATTENDANCE",
      underscored: true,
      timestamps: true,
    }
  );

  return Attendance;
}

export default Attendance;