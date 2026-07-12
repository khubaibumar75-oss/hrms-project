import { Model, DataTypes, Sequelize } from "sequelize";

class Team extends Model {
  public id!: string;
  public department_id!: string;
  public name!: string;
  public lead_id!: string | null;
}

export function initTeamModel(sequelize: Sequelize) {
  Team.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      department_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      lead_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "TEAMS",
      underscored: true,
      timestamps: true,
    }
  );

  return Team;
}

export default Team;