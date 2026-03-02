const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getAllEmployees, createEmployee } = require('../controllers/employeeController');

router.get('/',  authenticate, getAllEmployees);
router.post('/', authenticate, createEmployee);

module.exports = router;