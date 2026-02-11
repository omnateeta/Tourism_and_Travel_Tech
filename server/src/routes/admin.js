const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin authentication required for all routes
router.use(auth);

// Employee management routes
router.get('/employees', adminController.getAllEmployeesAdmin);
router.get('/employees/:id', adminController.getEmployeeByIdAdmin);
router.post('/employees', adminController.createEmployee);
router.put('/employees/:id', adminController.updateEmployee);
router.delete('/employees/:id', adminController.deleteEmployee);
router.patch('/employees/:id/toggle-active', adminController.toggleEmployeeActive);

// Bulk operations
router.patch('/employees/bulk-status', adminController.bulkUpdateStatus);

// Statistics
router.get('/stats', adminController.getAdminStats);

module.exports = router;