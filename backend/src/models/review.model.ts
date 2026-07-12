import { Model, DataTypes, Sequelize } from "sequelize";

class Review extends Model {
  public id!: string;
  public review_cycle_id!: string;
  public review_template_id!: string;
  public employee_id!: string;
  public reviewer_id!: string;
  public review_type!: string;
  public status!: string;
  public score!: number | null;
  public submitted_at!: Date | null;
}

export function initReviewModel(sequelize: Sequelize) {
  Review.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      review_cycle_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      review_template_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reviewer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      review_type: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Pending",
      },
      score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "REVIEWS",
      underscored: true,
      timestamps: true,
    }
  );

  return Review;
}

export default Review;