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
    const skills = await Skill.findAll({ where: { id: skillIds } });
    await employee.setSkills(skills);
    const result = await Employee.findByPk(employee.id, { include: [Skill] });
    res.status(201).json({ message: 'Successful registration', employee: result });
  } catch (err) {
    res.status(500).json({ error: 'Error registering employee' });
  }
};

const updateEmployeeSkills = async (req, res) => {
  const { id } = req.params;
  const { skillIds } = req.body;
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const skills = await Skill.findAll({ where: { id: skillIds } });
    await employee.setSkills(skills);
    await employee.update({ skills_updated_at: new Date() });
    const updated = await Employee.findByPk(id, { include: [Skill] });
    res.json(updated);
  } catch (err) {
    console.error('SC-11 ERROR:', err.message);
    res.status(500).json({ error: 'Error updating skills' });
  }
};

module.exports = { getAllEmployees, createEmployee, updateEmployeeSkills };
