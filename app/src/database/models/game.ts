import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';
import { User } from './user';




class Game extends Model {
    public id!: number; // Unique identifier for each game.
    public userId1!: number; // ID of the first player.
    public userId2!: number | null; // ID of the second player, if applicable.
    public type!: '2d' | '3d'; // Type of the game, either 2D or 3D.
    private board!: Board2D | Board3D; // Internal board representation.
    public currentPlayer!: number; // Indicator of which player's turn it is.
    public winner!: number | null; // ID of the winning player, if the game is over.
    public moves!: {
      playerId: number;
      position: Coordinate2D | Coordinate3D;
      timestamp: Date;
    }[]; // Array of moves made during the game.

    public dao!: Dao<Game>; // Data Access Object for managing database operations.

    constructor(values) {
        super(values);
    }

    // Static method to initialize the Game model with its attributes and options.
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
                type: DataTypes.ENUM('2d', '3d'),
                allowNull: false,
            },
            board: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            currentPlayer: {
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
        });

        this.dao = new Dao<Game>(this); // Initialize the Data Access Object for this model.
    }

    // Static method to set up associations with other models.
    static associate() {
        this.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
        this.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });
    }


}

Game.initialize(); // Initialize the Game model.
Game.associate(); // Set up associations between models.

export { Game };
