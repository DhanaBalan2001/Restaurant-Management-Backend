import express from 'express';
import { createTable, getAllTables, updateTableStatus } from '../controllers/table.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.post('/', verifyRole(['admin']), createTable);
router.get('/', getAllTables);
router.patch('/:id/status', verifyRole(['staff', 'admin']), updateTableStatus);

export default router;
