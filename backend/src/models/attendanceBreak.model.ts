import { Model, DataTypes, Sequelize } from "sequelize";

class AttendanceBreak extends Model {
  public id!: string;
  public attendance_id!: string;
  public start_time!: Date;
  public end_time!: Date | null;
  public duration_minutes!: number | null;
}

export function initAttendanceBreakModel(sequelize: Sequelize) {
  AttendanceBreak.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      attendance_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "ATTENDANCE_BREAKS",
      underscored: true,
      timestamps: true,
    }
  );

  return AttendanceBreak;
}

export default AttendanceBreak;