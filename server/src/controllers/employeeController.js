const Employee = require('../models/Employee');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .select('-password')
      .sort({ rating: -1, experience: -1 });
    
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

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select('-password');
    
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

// Get employees by department
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const employees = await Employee.find({ 
      department: department,
      isActive: true 
    }).select('-password').sort({ rating: -1 });
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employees by department',
      error: error.message
    });
  }
};

// Search employees
exports.searchEmployees = async (req, res) => {
  try {
    const { query } = req.query;
    
    const employees = await Employee.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { role: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { specialties: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    }).select('-password').sort({ rating: -1 });
    
    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching employees',
      error: error.message
    });
  }
};

// Update employee status
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee status updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating employee status',
      error: error.message
    });
  }
};

// Get employee statistics
exports.getEmployeeStats = async (req, res) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          avgExperience: { $avg: '$experience' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalEmployees = await Employee.countDocuments({ isActive: true });
    const availableEmployees = await Employee.countDocuments({ 
      isActive: true, 
      status: 'available' 
    });
    
    res.json({
      success: true,
      data: {
        totalEmployees,
        availableEmployees,
        departmentStats: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching employee statistics',
      error: error.message
    });
  }
};

// Initiate call to employee
exports.initiateCall = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.user.id;
    
    // In a real implementation, this would integrate with a VoIP service
    // For now, we'll just log the call request
    
    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Employee not available'
      });
    }
    
    // Log the call (in production, this would connect to a call service)
    console.log(`Call initiated: User ${userId} -> Employee ${employeeId} (${employee.name})`);
    
    res.json({
      success: true,
      message: 'Call initiated successfully',
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          phone: employee.phone,
          email: employee.email
        },
        estimatedWaitTime: employee.status === 'available' ? 'Instant' : '2-5 minutes'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initiating call',
      error: error.message
    });
  }
};