import Menu from '../models/Menu.js';

export const createMenu = async (req, res) => {
  try {
      const newMenu = await Menu.create(req.body);
      res.status(201).json(newMenu);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getAllMenus = async (req, res) => {
  try {
      const menus = await Menu.find();
      res.json(menus);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getMenuById = async (req, res) => {
  try {
      const menu = await Menu.findById(req.params.id);
      if (!menu) {
          return res.status(404).json({ message: "Menu not found" });
      }
      res.json(menu);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
      // Find the existing menu item first
      const menuItem = await Menu.findById(req.params.id);
      
      if (!menuItem) {
          return res.status(404).json({ message: "Menu item not found" });
      }
      
      // Only update the fields that are provided in the request
      if (req.body.name) menuItem.name = req.body.name;
      if (req.body.price) menuItem.price = req.body.price;
      if (req.body.description) menuItem.description = req.body.description;
      if (req.body.category) menuItem.category = req.body.category;
      if (req.body.image) menuItem.image = req.body.image;
      if (req.body.isAvailable !== undefined) menuItem.isAvailable = req.body.isAvailable;
      if (req.body.customizationOptions) menuItem.customizationOptions = req.body.customizationOptions;
      
      // Save the updated menu item
      const updatedMenu = await menuItem.save();
      
      res.json(updatedMenu);
  } catch (error) {
      res.status(500).json({ 
          message: error.message,
          error: error.name === 'ValidationError' ? 'Validation Error' : 'Server Error'
      });
  }
};


export const deleteMenu = async (req, res) => {
  try {
      await Menu.findByIdAndDelete(req.params.id);
      res.json({ message: "Menu deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};