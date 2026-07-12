import { Model, DataTypes, Sequelize } from "sequelize";

class Goal extends Model {
  public id!: string;
  public employee_id!: string;
  public created_by!: string;
  public title!: string;
  public description!: string | null;
  public target_date!: string;
  public progress!: number;
  public status!: string;
  public verified_by!: string | null;
  public verified_at!: Date | null;
}

export function initGoalModel(sequelize: Sequelize) {
  Goal.init(
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
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      target_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Not Started",
      },
      verified_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "GOALS",
      underscored: true,
      timestamps: true,
    }
  );

  return Goal;
}

export default Goal;