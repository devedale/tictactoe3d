'use strict';
const bcrypt = require('bcrypt');

/**
 * @module migrations/seed-users-table
 * @typedef {import('sequelize-cli').Migration} Migration
 *
 *   Migration script for seeding the 'users' table with initial data, including hashed passwords.
 */

/** @type {Migration} */
module.exports = {
  /**
   * Run the migration to insert initial data into the 'users' table.
   *
   * This method hashes passwords using bcrypt and inserts three user records with different roles and tokens.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the data has been inserted.
   */
  async up(queryInterface) {
    // Hash the passwords
    const hashedPassword1 = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    const hashedPassword3 = await bcrypt.hash('password789', 10);

    // Insert user records
    await queryInterface.bulkInsert('users', [
      {
        email: 'ai', // Example user with a placeholder password
        password: '$2b$10$' + 'a'.repeat(53), // Invalid password hash (just a placeholder)
        tokens: 10,
        roleId: 2, // User role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: process.env.ADMIN_EMAIL, // Admin user with hashed password
        password: hashedPassword1,
        tokens: 100,
        roleId: 1, // Admin role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user@example.com', // Regular user with hashed password
        password: hashedPassword3,
        tokens: 10,
        roleId: 2, // User role
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  /**
   * Run the migration to delete all data from the 'users' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the data has been deleted.
   */
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
