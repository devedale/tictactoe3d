import { Sequelize } from 'sequelize';

class Database {
  private static instance: Database;
  private _sequelize: Sequelize;

  private constructor() {
    this._sequelize = new Sequelize({
      database: process.env.DB_DB || '',
      username: process.env.DB_USER || '',
      password: process.env.DB_PASSWORD || '',
      host: 'db',
      dialect: 'postgres',
      dialectOptions: {
        autoIncrement: true,
      },
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()._sequelize;
    }
    return Database.instance;
  }
}

const databaseInstance = Database.getInstance();
export default databaseInstance;
