'use strict';

/**
 * @module migrations/seed-roles-table
 * @typedef {import('sequelize-cli').Migration} Migration
 *
 *   Migration script for seeding the 'roles' table with initial data.
 */

/** @type {Migration} */
module.exports = {
  /**
   * Run the migration to insert initial data into the 'roles' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the data has been inserted.
   */
  async up(queryInterface) {
    await queryInterface.bulkInsert('roles', [
      {
        name: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  /**
   * Run the migration to delete all data from the 'roles' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the data has been deleted.
   */
  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
