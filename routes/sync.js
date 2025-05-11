import express from 'express';
import { syncData } from '../controllers/sync.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.get('/', verifyRole(['customer', 'staff']), syncData);

export default router;
