import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:postId', getComments);
router.post('/:postId', authenticate, createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;
