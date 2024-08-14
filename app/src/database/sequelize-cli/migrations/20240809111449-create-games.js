'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
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
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      userId2: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users',
            key: 'id',
          },
        allowNull: true, 
      },
      type: {
        type: Sequelize.ENUM('2d', '3d'),
        allowNull: false,
      },
      board: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      currentPlayer: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      winner: {
        type: Sequelize.INTEGER,
        allowNull: true, 
      },
      moves: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
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

  async down(queryInterface) {
    await queryInterface.dropTable('games');
  }
};
