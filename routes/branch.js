import express from 'express';
import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    updateBranchStatus
} from '../controllers/branch.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.post('/', verifyRole(['admin']), createBranch);
router.get('/', verifyRole(['admin', 'staff']), getAllBranches);
router.get('/:id', verifyRole(['admin', 'staff']), getBranchById);
router.put('/:id', verifyRole(['admin']), updateBranch);
router.put('/:id/status', verifyRole(['admin']), updateBranchStatus);

export default router;