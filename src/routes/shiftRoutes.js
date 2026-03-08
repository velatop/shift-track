const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getAllShifts, createShift, getDailySummary } = require('../controllers/shiftController');

router.get('/summary', authenticate, getDailySummary);
router.get('/',        authenticate, getAllShifts);
router.post('/',       authenticate, createShift);
router.get('/',  authenticate, getAllShifts);
router.post('/', authenticate, createShift);


module.exports = router;