import express from 'express';
import { createTable, getAllTables } from '../controllers/table.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.post('/', verifyRole(['admin']), createTable);
router.get('/', getAllTables);

export default router;
