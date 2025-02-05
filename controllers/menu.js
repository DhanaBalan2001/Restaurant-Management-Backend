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
      const updatedMenu = await Menu.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true }
      );
      res.json(updatedMenu);
  } catch (error) {
      res.status(500).json({ message: error.message });
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