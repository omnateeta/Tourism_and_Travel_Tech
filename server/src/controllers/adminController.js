const Employee = require('../models/Employee');

// Admin authentication middleware
const isAdmin = (req, res, next) => {
  // In a real implementation, check if user has admin role
  // For now, we'll allow all authenticated users to act as admin
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  // In real app: if (!req.user.isAdmin) return res.status(403).json({success: false, message: 'Admin access required'});
  next();
};

// Get all employees (admin version with more details)
exports.getAllEmployeesAdmin = async (req, res) => {
  try {
    const employees = await Employee.find({})
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
};

// Get employee by ID (admin version)
exports.getEmployeeByIdAdmin = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
};

// Create new employee
exports.createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      specialties,
      languages,
      experience,
      rating,
      availability,
      status,
      isActive,
      responseTime,
      bio
    } = req.body;

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    const employee = new Employee({
      name,
      email,
      phone,
      role,
      department,
      specialties: Array.isArray(specialties) ? specialties : specialties?.split(',').map(s => s.trim()).filter(s => s) || [],
      languages: Array.isArray(languages) ? languages : languages?.split(',').map(l => l.trim()).filter(l => l) || [],
      experience,
      rating: rating || 0,
      availability: availability || 'Mon-Fri 9AM-5PM',
      status: status || 'offline',
      isActive: isActive !== undefined ? isActive : true,
      responseTime: responseTime || 'Under 10 min',
      bio
    });

    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      department,
      specialties,
      languages,
      experience,
      rating,
      availability,
      status,
      isActive,
      responseTime,
      bio
    } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(role && { role }),
      ...(department && { department }),
      ...(specialties && { 
        specialties: Array.isArray(specialties) ? specialties : specialties.split(',').map(s => s.trim()).filter(s => s) 
      }),
      ...(languages && { 
        languages: Array.isArray(languages) ? languages : languages.split(',').map(l => l.trim()).filter(l => l) 
      }),
      ...(experience !== undefined && { experience }),
      ...(rating !== undefined && { rating }),
      ...(availability && { availability }),
      ...(status && { status }),
      ...(isActive !== undefined && { isActive }),
      ...(responseTime && { responseTime }),
      ...(bio && { bio })
    };

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
};

// Bulk update employee statuses
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { employeeIds, status } = req.body;
    
    if (!Array.isArray(employeeIds) || !status) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    const result = await Employee.updateMany(
      { _id: { $in: employeeIds } },
      { status }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} employees`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error bulk updating employees',
      error: error.message
    });
  }
};

// Get admin statistics
exports.getAdminStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isActive: true });
    const availableEmployees = await Employee.countDocuments({ status: 'available' });
    const busyEmployees = await Employee.countDocuments({ status: 'busy' });
    const offlineEmployees = await Employee.countDocuments({ status: 'offline' });
    
    const avgRating = await Employee.aggregate([
      { $group: { _id: null, average: { $avg: "$rating" } } }
    ]);

    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgExperience: { $avg: '$experience' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentEmployees = await Employee.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name role department status rating createdAt');

    res.json({
      success: true,
      data: {
        totals: {
          total: totalEmployees,
          active: activeEmployees,
          available: availableEmployees,
          busy: busyEmployees,
          offline: offlineEmployees
        },
        averages: {
          rating: avgRating[0]?.average || 0
        },
        departmentStats,
        recentEmployees
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message
    });
  }
};

// Toggle employee active status
exports.toggleEmployeeActive = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.isActive = !employee.isActive;
    await employee.save();

    res.json({
      success: true,
      message: `Employee ${employee.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: employee.isActive }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling employee status',
      error: error.message
    });
  }
};