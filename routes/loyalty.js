import express from 'express';
import { 
  getLoyaltyStatus, 
  addLoyaltyPoints, 
  useReward 
} from '../controllers/loyalty.js';
import { verifyRole } from '../controllers/auth.js';

const router = express.Router();

router.use(verifyRole(['customer']));

router.get('/status', getLoyaltyStatus);
router.post('/add-points', addLoyaltyPoints);
router.post('/rewards/:rewardId/use', useReward);

export default router;
