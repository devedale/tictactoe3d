import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';
import { User } from './user';

class Game extends Model {
    public id!: number;
    public userId1!: number;
    public userId2!: number | null;
    public type!: 'classic' | '3D';
    public board!: number[][] | number[][][];
    public currentTurn!: number;
    public winner!: number | null;
    public moves!: {
      playerId: number;
      position: number[];
      timestamp: Date;
    }[];
  
  public dao!: Dao<Game>;

  static initialize(): void {
    this.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          userId1: {
            type: DataTypes.INTEGER,
            references: {
              model: 'users',
              key: 'id',
            },
            allowNull: false,
          },
          userId2: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
              },
            allowNull: true, 
          },
          type: {
            type: DataTypes.ENUM('classic', '3D'),
            allowNull: false,
          },
          board: {
            type: DataTypes.JSON,
            allowNull: false,
          },
          startingPlayer: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          winner: {
            type: DataTypes.INTEGER,
            allowNull: true, 
          },
          moves: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
          },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        }
      },
      {
        sequelize,
        modelName: 'game',
        timestamps: true,
      }
    );

    this.dao = new Dao<Game>(this);
  }


  static associate() {
    this.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
    this.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });
  }
}

Game.initialize();
Game.associate();

export { Game };
