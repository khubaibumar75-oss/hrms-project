import { Model, DataTypes, Sequelize } from "sequelize";

class User extends Model {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public full_name!: string;
  public role_id!: string;
  public is_verified!: boolean;
  public is_active!: boolean;
  public last_login!: Date | null;
  public verification_token!: string | null;
  public verification_token_expires!: Date | null;
  public status!: string;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    {
      sequelize,
      tableName: "USERS",
      underscored: true,
      timestamps: true,
      paranoid: true,
    }
  );

  return User;
}

export default User;