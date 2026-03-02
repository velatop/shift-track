const { Employee, Skill } = require('../models');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({ include: [Skill] });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving employees' });
  }
};

const createEmployee = async (req, res) => {
  const { name, position, skillIds } = req.body;

  if (!name || !position) {
    return res.status(400).json({ error: 'Name and position are required' });
  }
  if (!skillIds || skillIds.length === 0) {
    return res.status(400).json({ error: 'At least one skill is required' });
  }

  try {
    const employee = await Employee.create({ name, position });
    const skills   = await Skill.findAll({ where: { id: skillIds } });
    await employee.setSkills(skills);

    const result = await Employee.findByPk(employee.id, { include: [Skill] });
    res.status(201).json({ message: 'Successful registration', employee: result });
  } catch (err) {
    res.status(500).json({ error: 'Error registering employee' });
  }
};

module.exports = { getAllEmployees, createEmployee };