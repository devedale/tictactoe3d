'use strict';

/**
 * @module migrations/create-games-table
 * @typedef {import('sequelize-cli').Migration} Migration
 *
 *   Migration script for creating and dropping the 'games' table.
 */

/** @type {Migration} */
module.exports = {
  /**
   * Run the migration to create the 'games' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @param {import('sequelize').Sequelize} Sequelize - The Sequelize instance for defining the table schema.
   * @returns {Promise<void>} A promise that resolves when the table has been created.
   */
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId1: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users', // The name of the table to reference
          key: 'id', // The column in the referenced table
        },
        allowNull: false,
      },
      userId2: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users', // The name of the table to reference
          key: 'id', // The column in the referenced table
        },
        allowNull: true, // Allows for a game with only one user
      },
      type: {
        type: Sequelize.ENUM('2d', '3d'), // Enum type for specifying game type
        allowNull: false,
      },
      board: {
        type: Sequelize.JSON, // JSON type for storing the game board state
        allowNull: false,
      },
      currentPlayer: {
        type: Sequelize.INTEGER, // ID of the current player
        allowNull: false,
      },
      winner: {
        type: Sequelize.INTEGER, // ID of the winner; can be null if no winner yet
        allowNull: true,
      },
      moves: {
        type: Sequelize.JSON, // JSON type for storing moves made in the game
        allowNull: false,
        defaultValue: [], // Default to an empty array
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
   * Run the migration to drop the 'games' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface for running database operations.
   * @returns {Promise<void>} A promise that resolves when the table has been dropped.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('games');
  },
};
