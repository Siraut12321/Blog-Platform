import { Router } from 'express';
import { getAuthorProfile } from '../controllers/user.controller';

const router = Router();

router.get('/:id', getAuthorProfile);

export default router;
