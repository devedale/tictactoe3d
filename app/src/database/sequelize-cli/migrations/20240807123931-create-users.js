'use strict';

/**
 * @module migrations/create-users-table
 * @typedef {import('sequelize-cli').Migration} Migration
 *
 *   Migration script for creating and dropping the 'users' table.
 */

/** @type {Migration} */
module.exports = {
  /**
   * Run the migration to create the 'users' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @param {import('sequelize').Sequelize} Sequelize - The Sequelize instance for defining the table schema.
   * @returns {Promise<void>} A promise that resolves when the table has been created.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tokens: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      // Foreign key referencing the 'roles' table
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles', // The name of the table to reference
          key: 'id', // The column in the referenced table
        },
        onDelete: 'CASCADE', // Optional: ensures that if a role is deleted, users with that role are also deleted
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
   * Run the migration to drop the 'users' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the table has been dropped.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
