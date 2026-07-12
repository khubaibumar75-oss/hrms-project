import { Model, DataTypes, Sequelize } from "sequelize";

class ReviewCycle extends Model {
  public id!: string;
  public name!: string;
  public start_date!: string;
  public end_date!: string;
  public status!: string;
  public created_by!: string;
}

export function initReviewCycleModel(sequelize: Sequelize) {
  ReviewCycle.init(
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
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Draft",
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "REVIEW_CYCLES",
      underscored: true,
      timestamps: true,
    }
  );

  return ReviewCycle;
}

export default ReviewCycle;