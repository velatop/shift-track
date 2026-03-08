const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getAllShifts, createShift, getDailySummary, getAvailableEmployees } = require('../controllers/shiftController');

router.get('/summary', authenticate, getDailySummary);
router.get('/',        authenticate, getAllShifts);
router.post('/',       authenticate, createShift);
router.get('/',  authenticate, getAllShifts);
router.post('/', authenticate, createShift);
router.get('/:id/available-employees', authenticate, getAvailableEmployees);

module.exports = router;