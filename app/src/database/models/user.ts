import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../connection';
import { Dao } from './dao';
import { Role } from './role';

/** Represents a user within the system. Extends Sequelize's Model class for ORM functionality. */
class User extends Model {
  /** Unique identifier for the user. */
  private id!: number;

  /** Email address of the user. */
  private email!: string;

  /** Hashed password of the user. */
  private password!: string;

  /** Number of tokens available to the user. */
  private tokens!: number;

  /** Foreign key referencing the user's role. */
  private roleId!: number;

  /** Data Access Object for managing database operations for the User model. */
  public dao!: Dao<User>;

  /**
   * Initializes the User model with its attributes and options. Sets up hooks for password hashing before creation and updates.
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
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        tokens: {
          type: DataTypes.FLOAT,
          allowNull: false,
          defaultValue: 0.0,
        },
        roleId: {
          type: DataTypes.INTEGER,
          references: {
            model: 'roles',
            key: 'id',
          },
          allowNull: false,
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
        modelName: 'user',
        timestamps: true,
        hooks: {
          /**
           * Hash the user's password before creating a new user record.
           *
           * @param {User} user - The user instance being created.
           * @returns {Promise<void>}
           */
          beforeCreate: async (user: User) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          },
          /**
           * Hash the user's password before updating the user record, if the password has changed.
           *
           * @param {User} user - The user instance being updated.
           * @returns {Promise<void>}
           */
          beforeUpdate: async (user: User) => {
            if (user.changed('password')) {
              const salt = await bcrypt.genSalt(10);
              user.password = await bcrypt.hash(user.password, salt);
            }
          },
        },
      }
    );

    // Initialize the DAO for this model.
    this.dao = Dao.getInstance(User);
  }

  /**
   * Compares a candidate password with the user's stored hashed password.
   *
   * @param {string} candidatePassword - The plain text password to compare.
   * @returns {Promise<boolean>} - True if the password matches, false otherwise.
   */
  public comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Sets up associations between the User model and other models.
   *
   * @returns {void}
   * @static
   */
  static associate(): void {
    this.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  }
}

// Initialize the User model and set up associations.
User.initialize();
User.associate();

export { User };
