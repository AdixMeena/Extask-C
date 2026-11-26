import { Router } from 'express';
import { getTaskBids, placeBid } from '../controllers/bidController.js';
import { createReview } from '../controllers/reviewController.js';
import {
  cancelTask,
  completeTask,
  createTask,
  getTask,
  listTasks,
  myTasks,
  selectBid,
} from '../controllers/taskController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { uuidParam } from '../middleware/validate.js';

const router = Router();
router.param('id', uuidParam);
router.param('bidId', uuidParam);

router.get('/', listTasks);
router.post('/', requireAuth, createTask);
router.get('/mine', requireAuth, myTasks); // must stay above '/:id'
router.get('/:id', optionalAuth, getTask);
router.put('/:id/cancel', requireAuth, cancelTask);
router.put('/:id/select/:bidId', requireAuth, selectBid);
router.put('/:id/complete', requireAuth, completeTask);
router.post('/:id/bids', requireAuth, placeBid);
router.get('/:id/bids', requireAuth, getTaskBids);
router.post('/:id/reviews', requireAuth, createReview);
export default router;
