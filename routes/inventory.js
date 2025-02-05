import express from 'express';
import {
    createInventory,
    getAllInventory,
    checkLowStock,
    updateInventory,
    deleteInventory
} from '../controllers/inventory.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.post('/', verifyRole(['admin']), createInventory);
router.get('/', verifyRole(['admin']), getAllInventory);
router.get('/low-stock', verifyRole(['admin']), checkLowStock);
router.put('/update/:id', verifyRole(['admin']), updateInventory);
router.delete('/:id', verifyRole(['admin']), deleteInventory);

export default router;