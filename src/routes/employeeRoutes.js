const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getAllEmployees, createEmployee, updateEmployeeSkills } = require('../controllers/employeeController');

router.get('/',  authenticate, getAllEmployees);
router.post('/', authenticate, createEmployee);
router.put('/:id/skills', authenticate, updateEmployeeSkills);

module.exports = router;