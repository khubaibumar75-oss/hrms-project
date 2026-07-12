import { Model, DataTypes, Sequelize } from "sequelize";

class ReviewAnswer extends Model {
  public id!: string;
  public review_id!: string;
  public review_question_id!: string;
  public rating!: number;
  public answer_text!: string | null;
}

export function initReviewAnswerModel(sequelize: Sequelize) {
  ReviewAnswer.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      review_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      review_question_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      answer_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "REVIEW_ANSWERS",
      underscored: true,
      timestamps: true,
    }
  );

  return ReviewAnswer;
}

export default ReviewAnswer;