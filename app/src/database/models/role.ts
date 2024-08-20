import { Model, DataTypes } from 'sequelize';
import sequelize from '../connection';
import { Dao } from './dao';

/** Represents a user role within the system. Extends Sequelize's Model class for ORM functionality. */
class Role extends Model {
  /** Unique identifier for the role. */
  private id!: number;

  /** Name of the role (e.g., 'admin', 'user'). */
  private name!: string;

  /** Data Access Object for managing database operations for the Role model. */
  public dao!: Dao<Role>;

  /**
   * Initializes the Role model with its attributes and options. Should be called once to set up the model in the Sequelize instance.
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

    // Initialize the DAO for this model.
    this.dao = Dao.getInstance(Role);
  }
}

// Initialize the Role model.
Role.initialize();

export { Role };
