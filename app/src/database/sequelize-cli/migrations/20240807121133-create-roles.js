'use strict';

/**
 * @module migrations/create-roles-table
 * @typedef {import('sequelize-cli').Migration} Migration
 *
 *   Migration script for creating and dropping the 'roles' table.
 */

/** @type {Migration} */
module.exports = {
  /**
   * Run the migration to create the 'roles' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @param {import('sequelize').Sequelize} Sequelize - The Sequelize instance for defining the table schema.
   * @returns {Promise<void>} A promise that resolves when the table has been created.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  /**
   * Run the migration to drop the 'roles' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the table has been dropped.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
