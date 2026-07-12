import { Model, DataTypes, Sequelize } from "sequelize";

class GoalProgressLog extends Model {
  public id!: string;
  public goal_id!: string;
  public updated_by!: string;
  public previous_progress!: number;
  public new_progress!: number;
  public comment!: string;
}

export function initGoalProgressLogModel(sequelize: Sequelize) {
  GoalProgressLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      goal_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      previous_progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      new_progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "GOAL_PROGRESS_LOGS",
      underscored: true,
      timestamps: false,
      createdAt: "created_at",
    }
  );

  return GoalProgressLog;
}

export default GoalProgressLog;