import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';

export const createTable = async (req, res) => {
    try {
        const newTable = await Table.create(req.body);
        res.status(201).json(newTable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllTables = async (req, res) => {
    try {
        const tables = await Table.find();
        const currentDate = new Date();
        
        // Get current reservations for all tables
        const currentReservations = await Reservation.find({
            date: {
                $gte: new Date(currentDate.setHours(0,0,0)),
                $lt: new Date(currentDate.setHours(23,59,59))
            },
            status: { $ne: 'cancelled' }
        });

        const tablesWithStatus = tables.map(table => {
            const tableReservations = currentReservations.filter(
                res => res.table.toString() === table._id.toString()
            );
            return {
                ...table.toObject(),
                currentReservations: tableReservations
            };
        });

        res.json(tablesWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTableStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      const validStatuses = ['available', 'reserved', 'occupied'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid table status' });
      }
  
      const updatedTable = await Table.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedTable) {
        return res.status(404).json({ message: 'Table not found' });
      }
  
      // Emit socket event for real-time updates
      const io = req.app.get('io');
      io.emit('table_status_update', {
        tableId: id,
        status: updatedTable.status
      });
  
      res.json(updatedTable);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  