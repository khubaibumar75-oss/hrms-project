import { Model, DataTypes, Sequelize } from "sequelize";

class LeaveRequest extends Model {
  public id!: string;
  public employee_id!: string;
  public leave_type_id!: string;
  public start_date!: string;
  public end_date!: string;
  public days_requested!: number;
  public reason!: string | null;

  public status!: string;

  public manager_status!: string;
  public manager_comment!: string | null;
  public manager_reviewed_by!: string | null;
  public manager_reviewed_at!: Date | null;

  public hr_status!: string;
  public hr_comment!: string | null;
  public hr_reviewed_by!: string | null;
  public hr_reviewed_at!: Date | null;

  // Scheduled Leave
  public is_scheduled!: boolean;
  public scheduled_at!: Date | null;
}

export function initLeaveRequestModel(sequelize: Sequelize) {
  LeaveRequest.init(
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

      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      days_requested: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },

      manager_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },

      manager_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      manager_reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      manager_reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      hr_status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },

      hr_comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      hr_reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      hr_reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // -----------------------------
      // Scheduled Leave Fields
      // -----------------------------
      is_scheduled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "LEAVE_REQUESTS",
      underscored: true,
      timestamps: true,
    },
  );

  return LeaveRequest;
}

export default LeaveRequest;
