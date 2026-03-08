const { Op } = require('../models');
const { Op: SequelizeOp } = require('sequelize');

const getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.findAll({ order: [['date', 'ASC'], ['start_time', 'ASC']] });
        res.json(shifts);
    } catch (err) {
        res.status(500).json({ error: 'Error obtaining turns' });
    }
};

const createShift = async (req, res) => {
    const { date, start_time, end_time, operational_area } = req.body;

    if (!date || !start_time || !end_time || !operational_area) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const exists = await Shift.findOne({
            where: { date, start_time, operational_area }
        });

        if (exists) {
            return res.status(409).json({ error: 'Conflict: duplicate shift for that area and time' });
        }

        const shift = await Shift.create({ date, start_time, end_time, operational_area });
        res.status(201).json({ message: 'Shift created', shift });
    } catch (err) {
        res.status(500).json({ error: 'Error creating shift' });
    }
};

const { Shift, Employee, Skill } = require('../models');

const getDailySummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const shifts = await Shift.findAll({
      where: { date: today },
      include: [{ model: Employee, include: [Skill] }],
      order: [['operational_area', 'ASC'], ['start_time', 'ASC']]
    });

    const summary = shifts.map(shift => {
      const assignedCount = shift.Employees ? shift.Employees.length : 0;
      let coverage_status;

      if (assignedCount === 0) {
        coverage_status = 'uncovered';
      } else if (assignedCount < 2) {
        coverage_status = 'partial';
      } else {
        coverage_status = 'covered';
      }

      return {
        id:               shift.id,
        date:             shift.date,
        start_time:       shift.start_time,
        end_time:         shift.end_time,
        operational_area: shift.operational_area,
        assigned_employees: assignedCount,
        coverage_status,
        employees: shift.Employees || []
      };
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Error getting daily summary' });
  }
};

const getAvailableEmployees = async (req, res) => {
  const { id } = req.params;

  try {
    const shift = await Shift.findByPk(id);
    if (!shift) return res.status(404).json({ error: 'Shift not found' });

    const allEmployees = await Employee.findAll({ include: [Skill] });

    const conflictingShifts = await Shift.findAll({
      where: {
        date:       shift.date,
        start_time: shift.start_time
      },
      include: [Employee]
    });

    const assignedIds = new Set(
      conflictingShifts.flatMap(s => s.Employees.map(e => e.id))
    );

    const available = allEmployees.filter(emp => {
      const notConflicting = !assignedIds.has(emp.id);
      const hasSkills      = emp.Skills && emp.Skills.length > 0;
      return notConflicting && hasSkills;
    });

    res.json(available);
  } catch (err) {
    res.status(500).json({ error: 'Error filtering employees' });
  }
};

module.exports = { getAllShifts, createShift, getDailySummary, getAvailableEmployees }