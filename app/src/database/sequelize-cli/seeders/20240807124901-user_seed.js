'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword1 = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);
    const hashedPassword3 = await bcrypt.hash('password789', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'ai',
        password: '$2b$10$' + 'a'.repeat(53),
        tokens: 10,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword1,
        tokens: 100,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'user@example.com',
        password: hashedPassword3,
        tokens: 10,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
