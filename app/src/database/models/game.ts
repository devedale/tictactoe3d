import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';
import { User } from './user';

/** Represents a game session between two players. Extends Sequelize's Model class for ORM functionality. */
class Game extends Model {
  /** Unique identifier for each game. */
  public id!: number;

  /** ID of the first player. */
  public userId1!: number;

  /** ID of the second player, if applicable. */
  public userId2!: number | null;

  /** Type of the game, either 2D or 3D. */
  public type!: '2d' | '3d';

  /** Internal board representation (either 2D or 3D). */
  private board!: Board2D | Board3D;

  /** Indicator of which player's turn it is. */
  public currentPlayer!: number;

  /** ID of the winning player, if the game is over. */
  public winner!: number | null;

  /** Array of moves made during the game. Each move contains the player ID, position, and timestamp. */
  public moves!: {
    playerId: number;
    position: Coordinate2D | Coordinate3D;
    timestamp: Date;
  }[];

  /** Data Access Object for managing database operations. */
  public dao!: Dao<Game>;

  /**
   * Constructs a new Game instance.
   *
   * @param {Partial<Game>} values - Initial values to populate the Game instance.
   */
  constructor(values: Partial<Game>) {
    super(values);
  }

  /**
   * Initializes the Game model with its attributes and options. Should be called once to set up the model.
   *
   * @returns {void}
   * @static
   */
  static initialize(): void {
    this.init(
      {
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
        },
      },
      {
        sequelize,
        modelName: 'game',
        timestamps: true,
      }
    );

    // Initialize the DAO for this model.
    this.dao = Dao.getInstance(Game);
  }

  /**
   * Sets up associations with other models. This method defines relationships like belongsTo or hasMany.
   *
   * @returns {void}
   * @static
   */
  static associate(): void {
    this.belongsTo(User, { foreignKey: 'userId1', as: 'user1' });
    this.belongsTo(User, { foreignKey: 'userId2', as: 'user2' });
  }
}

// Initialize the Game model and set up associations.
Game.initialize();
Game.associate();

export { Game };
