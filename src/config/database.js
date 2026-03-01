const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './shifttrack.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

module.exports = sequelize;