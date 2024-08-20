/**
 * Configuration for database connection settings for different environments.
 *
 * @module config/database
 */
module.exports = {
  /**
   * Database configuration for the development environment.
   *
   * @type {Object}
   * @property {string} username - The database username.
   * @property {string} password - The database password.
   * @property {string} database - The name of the database.
   * @property {string} host - The host of the database.
   * @property {string} dialect - The dialect used by the database (PostgreSQL).
   */
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    host: 'db',
    dialect: 'postgres',
  },

  /**
   * Database configuration for the test environment.
   *
   * @type {Object}
   * @property {string} username - The database username.
   * @property {string} password - The database password.
   * @property {string} database - The name of the database.
   * @property {string} host - The host of the database.
   * @property {string} dialect - The dialect used by the database (PostgreSQL).
   */
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    host: 'db',
    dialect: 'postgres',
  },

  /**
   * Database configuration for the production environment.
   *
   * @type {Object}
   * @property {string} username - The database username.
   * @property {string} password - The database password.
   * @property {string} database - The name of the database.
   * @property {string} host - The host of the database.
   * @property {string} dialect - The dialect used by the database (PostgreSQL).
   */
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    host: 'db',
    dialect: 'postgres',
  },
};
