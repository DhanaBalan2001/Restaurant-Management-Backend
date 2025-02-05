import Inventory from '../models/Inventory.js';

export const createInventory = async (req, res) => {
  try {
      const newItem = await Inventory.create(req.body);
      res.status(201).json(newItem);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const getAllInventory = async (req, res) => {
  try {
      const inventory = await Inventory.find();
      res.json(inventory);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const checkLowStock = async (req, res) => {
  try {
      const lowStockItems = await Inventory.find({
          quantity: { $lte: 10 }
      });

      if (lowStockItems.length > 0) {
          res.json({
              alert: true,
              items: lowStockItems,
              message: "Low stock items detected"
          });
      } else {
          res.json({ alert: false, message: "Stock levels normal" });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const updateInventory = async (req, res) => {
  try {
      const { id } = req.params;
      const oldItem = await Inventory.findById(id);
      const updatedItem = await Inventory.findByIdAndUpdate(
          id,
          { 
              $set: {
                  ...req.body,
                  lastRestocked: req.body.quantity ? new Date() : undefined
              }
          },
          { new: true }
      );

      if (!updatedItem) {
          return res.status(404).json({ message: "Inventory item not found" });
      }

      if (oldItem.quantity <= 10 && updatedItem.quantity > 10) {
          console.log(`Stock refilled alert for ${updatedItem.name}`);
          return res.json({
              ...updatedItem.toObject(),
              alert: true,
              message: `${updatedItem.name} has been refilled above threshold`
          });
      }

      if (updatedItem.quantity <= 10) {
          console.log(`Low stock alert for ${updatedItem.name}`);
      }

      res.json(updatedItem);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

export const deleteInventory = async (req, res) => {
  try {
      const { id } = req.params;
      const deletedItem = await Inventory.findByIdAndDelete(id);
        
      if (!deletedItem) {
          return res.status(404).json({ message: "Inventory item not found" });
      }
        
      res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};