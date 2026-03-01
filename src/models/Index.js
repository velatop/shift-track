const sequelize = require('../config/database');
const Employee = require('./Employee');
const Skill = require('./Skill');
const Shift = require('./Shift');
const User = require('./User');

Employee.belongsToMany(Skill, { through: 'EmployeeSkills' });
Skill.belongsToMany(Employee, { through: 'EmployeeSkills' });

Shift.belongsToMany(Employee, { through: 'ShiftAssignments' });
Employee.belongsToMany(Shift, { through: 'ShiftAssignments' });

const createUser = async (username, password) => {
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 12);
    return User.create({ username, password_hash });
};

module.exports = { sequelize, Employee, Skill, Shift, User, createUser };