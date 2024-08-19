import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';

class Role extends Model {
  private id!: number;
  private name!: string;
  public dao!: Dao<Role>;

  static initialize(): void {
    this.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        modelName: 'role',
        timestamps: true,
      }
    );

    this.dao = Dao.getInstance(Role);
  }
}

Role.initialize();

export { Role };
