import { Router } from 'express';
import {
  createPost, getPosts, getTrendingPosts, getPostBySlug,
  updatePost, deletePost, toggleLike, toggleBookmark,
  getMyPosts, getBookmarks, uploadImage,
} from '../controllers/post.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload } from '../utils/cloudinary';

const router = Router();

router.get('/', getPosts);
router.get('/trending', getTrendingPosts);
router.get('/my-posts', authenticate, authorize('author'), getMyPosts);
router.get('/bookmarks', authenticate, getBookmarks);
router.get('/:slug', getPostBySlug);

router.post('/upload-image', authenticate, authorize('author'), upload.single('image'), uploadImage);
router.post('/', authenticate, authorize('author'), createPost);
router.patch('/:id', authenticate, authorize('author'), updatePost);
router.delete('/:id', authenticate, authorize('author'), deletePost);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/bookmark', authenticate, toggleBookmark);

export default router;
