import { Router } from 'express';
import { listUserReviews } from '../controllers/reviewController.js';
import { getUser, updateMe } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/validate.js';

const router = Router();
router.param('id', uuidParam);

router.put('/me', requireAuth, updateMe);
router.get('/:id', getUser);
router.get('/:id/reviews', listUserReviews);
export default router;
