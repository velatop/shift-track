const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getAllShifts, createShift } = require('../controllers/shiftController');

router.get('/',  authenticate, getAllShifts);
router.post('/', authenticate, createShift);

module.exports = router;