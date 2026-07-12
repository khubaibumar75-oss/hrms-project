import { Model, DataTypes, Sequelize } from "sequelize";

class ReviewQuestion extends Model {
  public id!: string;
  public review_template_id!: string;
  public question_text!: string;
  public weight!: number;
}

export function initReviewQuestionModel(sequelize: Sequelize) {
  ReviewQuestion.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      review_template_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1.0,
      },
    },
    {
      sequelize,
      tableName: "REVIEW_QUESTIONS",
      underscored: true,
      timestamps: true,
    }
  );

  return ReviewQuestion;
}

export default ReviewQuestion;