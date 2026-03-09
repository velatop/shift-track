const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getAllShifts, createShift, getDailySummary,
    getAvailableEmployees, assignEmployee, getCoverageAlerts } = require('../controllers/shiftController');

router.get('/summary', authenticate, getDailySummary);
router.get('/alerts', authenticate, getCoverageAlerts);
router.get('/:id/available-employees', authenticate, getAvailableEmployees);
router.post('/:id/assign', authenticate, assignEmployee);
router.get('/', authenticate, getAllShifts);
router.post('/', authenticate, createShift);

module.exports = router;