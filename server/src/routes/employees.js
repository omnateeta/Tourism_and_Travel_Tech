const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', employeeController.getAllEmployees);
router.get('/search', employeeController.searchEmployees);
router.get('/department/:department', employeeController.getEmployeesByDepartment);
router.get('/:id', employeeController.getEmployeeById);
router.get('/stats/overview', employeeController.getEmployeeStats);

// Protected routes (require authentication)
router.post('/call', auth, employeeController.initiateCall);
router.put('/:id/status', auth, employeeController.updateEmployeeStatus);

module.exports = router;