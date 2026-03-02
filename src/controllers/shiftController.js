const { Shift, Op } = require('../models');
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

module.exports = { getAllShifts, createShift };