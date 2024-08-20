import { Sequelize } from 'sequelize';

/** Singleton class for managing a Sequelize database connection. */
class Database {
  private static instance: Database;
  private _sequelize: Sequelize;

  /** Private constructor to initialize the Sequelize instance. */
  private constructor() {
    this._sequelize = new Sequelize({
      database: process.env.DB_DB || '', // Database name
      username: process.env.DB_USER || '', // Database username
      password: process.env.DB_PASSWORD || '', // Database password
      host: 'db', // Database host
      dialect: 'postgres', // Database dialect
      dialectOptions: {
        autoIncrement: true, // Dialect option for auto-increment
      },
    });
  }

  /**
   * Gets the singleton instance of the Database.
   *
   * @returns {Database} The Database instance.
   */
  public static getInstance(): Database {
    if (!Database.instance) {
      // Create a new instance and initialize the Sequelize connection
      Database.instance = new Database()._sequelize;
    }
    return Database.instance;
  }
}

// Instantiate and export the singleton Database instance
const databaseInstance = Database.getInstance();
export default databaseInstance;
