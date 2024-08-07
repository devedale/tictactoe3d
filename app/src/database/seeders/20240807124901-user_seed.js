'use strict';
const bcrypt = require('bcrypt'); 
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    const hashedPassword3 = await bcrypt.hash('password789', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'user1@example.com',
        password: hashedPassword1,
        tokens: 100,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user2@example.com',
        password: hashedPassword2,
        tokens: 150,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user3@example.com',
        password: hashedPassword3,
        tokens: 200,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
