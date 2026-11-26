import { Router } from 'express';
import { myBids } from '../controllers/bidController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/mine', requireAuth, myBids);
export default router;
