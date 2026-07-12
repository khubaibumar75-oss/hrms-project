import { Model, DataTypes, Sequelize } from "sequelize";

class ReviewTemplate extends Model {
  public id!: string;
  public review_cycle_id!: string;
  public name!: string;
  public description!: string | null;
}

export function initReviewTemplateModel(sequelize: Sequelize) {
  ReviewTemplate.init(
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "REVIEW_TEMPLATES",
      underscored: true,
      timestamps: true,
    }
  );

  return ReviewTemplate;
}

export default ReviewTemplate;