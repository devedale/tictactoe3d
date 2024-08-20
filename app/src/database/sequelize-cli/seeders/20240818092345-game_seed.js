'use strict';

/** @type {import('sequelize-cli').Migration} Migration script to seed the 'games' table with initial data. */
module.exports = {
  /**
   * Runs the migration to insert seed data into the 'games' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface used for performing database operations.
   * @returns {Promise<void>} A promise that resolves when the operation completes.
   */
  async up(queryInterface) {
    await queryInterface.bulkInsert('games', [
      {
        userId1: 1,
        userId2: 2,
        type: '2d',
        board: JSON.stringify([
          ['X', 'O', 'X'],
          ['X', 'O', 'O'],
          ['O', 'X', 'X'],
        ]),
        currentPlayer: 1,
        winner: 0,
        moves: JSON.stringify([
          { playerId: 1, playerEmail: 'ai', position: [0, 0], timestamp: new Date('2024-08-18T00:00:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 1], timestamp: new Date('2024-08-18T00:01:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 2], timestamp: new Date('2024-08-18T00:02:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 1], timestamp: new Date('2024-08-18T00:03:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 0], timestamp: new Date('2024-08-18T00:04:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 0], timestamp: new Date('2024-08-18T00:05:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 2], timestamp: new Date('2024-08-18T00:06:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 1], timestamp: new Date('2024-08-18T00:07:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 2], timestamp: new Date('2024-08-18T00:08:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T00:00:00.000Z'),
        updatedAt: new Date('2024-08-18T00:08:00.000Z'),
      },

      {
        userId1: 1,
        userId2: 2,
        type: '3d',
        board: JSON.stringify([
          [
            ['O', 'O', 'O', 'O'],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
          ],
          [
            [null, null, null, null],
            [null, 'X', null, null],
            [null, 'X', 'X', null],
            [null, null, null, null],
          ],
          [
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
          ],
          [
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
          ],
        ]),
        currentPlayer: 2,
        winner: 2,
        moves: JSON.stringify([
          { playerId: 1, playerEmail: 'ai', position: [0, 0, 0], timestamp: new Date('2024-08-18T13:19:38.074Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 1, 1], timestamp: new Date('2024-08-18T13:19:46.056Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 0, 1], timestamp: new Date('2024-08-18T13:19:46.127Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 2, 1], timestamp: new Date('2024-08-18T13:19:52.646Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 0, 2], timestamp: new Date('2024-08-18T13:19:52.727Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 2, 2], timestamp: new Date('2024-08-18T13:19:56.624Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 0, 3], timestamp: new Date('2024-08-18T13:19:56.695Z') },
        ]),
        createdAt: new Date('2024-08-18T13:19:37.995Z'),
        updatedAt: new Date('2024-08-18T13:19:56.747Z'),
      },

      {
        userId1: 2,
        userId2: 3,
        type: '2d',
        board: JSON.stringify([
          ['O', 'X', 'O'],
          ['X', 'X', 'O'],
          ['O', 'O', 'X'],
        ]),
        currentPlayer: 2,
        winner: 0, // Partita pari
        moves: JSON.stringify([
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 1], timestamp: new Date('2024-08-18T01:00:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 0], timestamp: new Date('2024-08-18T01:01:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 1], timestamp: new Date('2024-08-18T01:02:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 0], timestamp: new Date('2024-08-18T01:03:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 2], timestamp: new Date('2024-08-18T01:04:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 2], timestamp: new Date('2024-08-18T01:05:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 0], timestamp: new Date('2024-08-18T01:06:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [2, 1], timestamp: new Date('2024-08-18T01:07:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 2], timestamp: new Date('2024-08-18T01:08:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T01:00:00.000Z'),
        updatedAt: new Date('2024-08-18T01:08:00.000Z'),
      },
      {
        userId1: 3,
        userId2: 1,
        type: '2d',
        board: JSON.stringify([
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          [null, null, null],
        ]),
        currentPlayer: 1,
        winner: null,
        moves: JSON.stringify([
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 0], timestamp: new Date('2024-08-18T02:00:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 1], timestamp: new Date('2024-08-18T02:01:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 2], timestamp: new Date('2024-08-18T02:02:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 0], timestamp: new Date('2024-08-18T02:03:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 1], timestamp: new Date('2024-08-18T02:04:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 2], timestamp: new Date('2024-08-18T02:05:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T02:00:00.000Z'),
        updatedAt: new Date('2024-08-18T02:07:00.000Z'),
      },
      {
        userId1: 1,
        userId2: 3,
        type: '2d',
        board: JSON.stringify([
          ['X', 'O', 'O'],
          ['X', null, 'X'],
          [null, null, 'O'],
        ]),
        currentPlayer: 1,
        winner: 1,
        moves: JSON.stringify([
          { playerId: 1, playerEmail: 'ai', position: [0, 0], timestamp: new Date('2024-08-18T03:00:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 1], timestamp: new Date('2024-08-18T03:01:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 0], timestamp: new Date('2024-08-18T03:02:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 2], timestamp: new Date('2024-08-18T03:03:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 2], timestamp: new Date('2024-08-18T03:04:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [2, 2], timestamp: new Date('2024-08-18T03:05:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T03:00:00.000Z'),
        updatedAt: new Date('2024-08-18T03:05:00.000Z'),
      },
      {
        userId1: 2,
        userId2: 1,
        type: '2d',
        board: JSON.stringify([
          ['O', null, 'O'],
          ['O', null, 'X'],
          [null, 'X', null],
        ]),
        currentPlayer: 2,
        winner: 2,
        moves: JSON.stringify([
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 0], timestamp: new Date('2024-08-18T04:00:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 1], timestamp: new Date('2024-08-18T04:01:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 2], timestamp: new Date('2024-08-18T04:02:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 2], timestamp: new Date('2024-08-18T04:03:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: 'RESIGN', timestamp: new Date('2024-08-18T04:04:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T04:00:00.000Z'),
        updatedAt: new Date('2024-08-18T04:05:00.000Z'),
      },
      {
        userId1: 1,
        userId2: 2,
        type: '2d',
        board: JSON.stringify([
          ['X', 'O', 'O'],
          ['O', 'X', 'X'],
          ['O', 'X', null],
        ]),
        currentPlayer: 2,
        winner: 1,
        moves: JSON.stringify([
          { playerId: 1, playerEmail: 'ai', position: [0, 0], timestamp: new Date('2024-08-18T05:00:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 1], timestamp: new Date('2024-08-18T05:01:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 1], timestamp: new Date('2024-08-18T05:02:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 0], timestamp: new Date('2024-08-18T05:03:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 1], timestamp: new Date('2024-08-18T05:04:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 0], timestamp: new Date('2024-08-18T05:05:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 2], timestamp: new Date('2024-08-18T05:06:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T05:00:00.000Z'),
        updatedAt: new Date('2024-08-18T05:06:00.000Z'),
      },
      {
        userId1: 2,
        userId2: 3,
        type: '2d',
        board: JSON.stringify([
          ['O', 'X', 'O'],
          ['X', null, 'X'],
          ['O', null, null],
        ]),
        currentPlayer: 2,
        winner: 1,
        moves: JSON.stringify([
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 0], timestamp: new Date('2024-08-18T06:00:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 1], timestamp: new Date('2024-08-18T06:01:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 1], timestamp: new Date('2024-08-18T06:02:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 0], timestamp: new Date('2024-08-18T06:03:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 2], timestamp: new Date('2024-08-18T06:04:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: 'RESIGN', timestamp: new Date('2024-08-18T06:05:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T06:00:00.000Z'),
        updatedAt: new Date('2024-08-18T06:05:00.000Z'),
      },
      {
        userId1: 1,
        userId2: 2,
        type: '2d',
        board: JSON.stringify([
          ['X', 'O', 'O'],
          ['O', 'X', 'X'],
          ['X', 'O', null],
        ]),
        currentPlayer: 1,
        winner: 2,
        moves: JSON.stringify([
          { playerId: 1, playerEmail: 'ai', position: [0, 0], timestamp: new Date('2024-08-18T07:00:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 1], timestamp: new Date('2024-08-18T07:01:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 1], timestamp: new Date('2024-08-18T07:02:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 0], timestamp: new Date('2024-08-18T07:03:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 0], timestamp: new Date('2024-08-18T07:04:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 1], timestamp: new Date('2024-08-18T07:05:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 2], timestamp: new Date('2024-08-18T07:06:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T07:00:00.000Z'),
        updatedAt: new Date('2024-08-18T07:06:00.000Z'),
      },
      {
        userId1: 2,
        userId2: 3,
        type: '2d',
        board: JSON.stringify([
          ['O', 'X', null],
          ['X', 'O', 'X'],
          ['O', null, null],
        ]),
        currentPlayer: 3,
        winner: 1,
        moves: JSON.stringify([
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [0, 0], timestamp: new Date('2024-08-18T08:00:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 1], timestamp: new Date('2024-08-18T08:01:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [1, 1], timestamp: new Date('2024-08-18T08:02:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 0], timestamp: new Date('2024-08-18T08:03:00.000Z') },
          { playerId: 2, playerEmail: process.env.ADMIN_EMAIL, position: [2, 1], timestamp: new Date('2024-08-18T08:04:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: 'RESIGN', timestamp: new Date('2024-08-18T08:05:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T08:00:00.000Z'),
        updatedAt: new Date('2024-08-18T08:05:00.000Z'),
      },
      {
        userId1: 1,
        userId2: 3,
        type: '2d',
        board: JSON.stringify([
          ['X', 'O', 'X'],
          ['X', 'X', 'O'],
          ['O', 'X', 'O'],
        ]),
        currentPlayer: 1,
        winner: null,
        moves: JSON.stringify([
          { playerId: 1, playerEmail: 'ai', position: [0, 0], timestamp: new Date('2024-08-18T09:00:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [0, 1], timestamp: new Date('2024-08-18T09:01:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [0, 2], timestamp: new Date('2024-08-18T09:02:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 1], timestamp: new Date('2024-08-18T09:03:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [1, 0], timestamp: new Date('2024-08-18T09:04:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [1, 2], timestamp: new Date('2024-08-18T09:05:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 1], timestamp: new Date('2024-08-18T09:06:00.000Z') },
          { playerId: 3, playerEmail: 'user@example.com', position: [2, 0], timestamp: new Date('2024-08-18T09:07:00.000Z') },
          { playerId: 1, playerEmail: 'ai', position: [2, 2], timestamp: new Date('2024-08-18T09:08:00.000Z') },
        ]),
        createdAt: new Date('2024-08-18T09:00:00.000Z'),
        updatedAt: new Date('2024-08-18T09:08:00.000Z'),
      },
    ]);
  },

  /**
   * Reverses the migration by deleting all entries from the 'games' table.
   *
   * @param {import('sequelize').QueryInterface} queryInterface - The query interface used for performing database operations.
   * @returns {Promise<void>} A promise that resolves when the operation completes.
   */
  async down(queryInterface) {
    await queryInterface.bulkDelete('games', null, {});
  },
};
