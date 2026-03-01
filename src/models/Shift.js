const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shift = sequelize.define('Shift', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    start_time: { type: DataTypes.STRING, allowNull: false },
    end_time: { type: DataTypes.STRING, allowNull: false },
    operational_area: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Shift;