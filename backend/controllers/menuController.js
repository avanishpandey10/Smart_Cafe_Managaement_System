const Menu = require('../models/Menu');

// @desc    Get all menu items
// @route   GET /api/menu
const getMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find({ available: true });
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create menu item (admin)
// @route   POST /api/menu
const createMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.create(req.body);
        res.status(201).json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update menu item (admin)
// @route   PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete menu item (admin)
// @route   DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await Menu.findByIdAndDelete(req.params.id);
        
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        
        res.json({ message: 'Menu item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};