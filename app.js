
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Task 1: Serve the frontend
app.use(express.static(path.join(__dirname, 'dist', 'FrontEnd')));

// Task 2: Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Atlas connected successfully'))
    .catch((error) => console.error('MongoDB connection error:', error.message));

// Employee schema
const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    position: { type: String, required: true },
    salary: { type: Number, required: true }
});

const Employee = mongoose.model('Employee', employeeSchema);

// GET: Get all employees
app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employees' });
    }
});

// GET: Get one employee by ID
app.get('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch employee' });
    }
});

// POST: Add a new employee
app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;

        if (!name || !location || !position || salary === undefined || salary === '') {
            return res.status(400).json({
                message: 'Name, location, position and salary are required'
            });
        }

        const employee = await Employee.create({
            name,
            location,
            position,
            salary: Number(salary)
        });

        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({
            message: 'Failed to add employee',
            error: error.message
        });
    }
});

// DELETE: Delete an employee by ID
app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete employee' });
    }
});

// PUT: Update an employee using id or _id in the request body
app.put('/api/employeelist', async (req, res) => {
    try {
        const { id, _id, name, location, position, salary } = req.body;
        const employeeId = id || _id;

        if (!employeeId) {
            return res.status(400).json({
                message: 'Employee id or _id is required to update an employee'
            });
        }

        if (!mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (location !== undefined) updates.location = location;
        if (position !== undefined) updates.position = position;

        if (salary !== undefined && salary !== '') {
            updates.salary = Number(salary);
        }

        const employee = await Employee.findByIdAndUpdate(
            employeeId,
            updates,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(400).json({
            message: 'Failed to update employee',
            error: error.message
        });
    }
});

// Required frontend connection code — kept at the bottom
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/Frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
