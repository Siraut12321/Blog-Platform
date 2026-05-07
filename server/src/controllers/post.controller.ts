import { Request, Response } from 'express';
import slugify from 'slugify';
import Post from '../models/Post';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';

const calcReadingTime = (content: string) => Math.max(1, Math.ceil(content.split(' ').length / 200));

const generateSlug = async (title: string): Promise<string> => {
  let slug = slugify(title, { lower: true, strict: true });
  const exists = await Post.findOne({ slug });
  if (exists) slug = `${slug}-${Date.now()}`;
  return slug;
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, excerpt, tags, status, coverImage } = req.body;
    const slug = await generateSlug(title);
    const post = await Post.create({
      title, content, excerpt, tags: tags || [], status: status || 'draft',
      coverImage, slug, author: req.user!._id,
      readingTime: calcReadingTime(content),
    });
    sendSuccess(res, post, 'Post created', 201);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to create post', 500);
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, tag, search, author } = req.query;
    const query: Record<string, unknown> = { status: 'published' };

    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (search) query.$text = { $search: search as string };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    sendSuccess(res, { posts, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch posts', 500);
  }
};

export const getTrendingPosts = async (_req: Request, res: Response) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await Post.find({ status: 'published', createdAt: { $gte: sevenDaysAgo } })
      .populate('author', 'name avatar')
      .sort({ views: -1, likesCount: -1 })
      .limit(5)
      .lean();
    sendSuccess(res, posts);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch trending posts', 500);
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar bio');
    if (!post) return sendError(res, 'Post not found', 404);
    sendSuccess(res, post);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch post', 500);
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user!._id });
    if (!post) return sendError(res, 'Post not found or unauthorized', 404);

    const { title, content, excerpt, tags, status, coverImage } = req.body;
    if (title && title !== post.title) post.slug = await generateSlug(title);
    if (title) post.title = title;
    if (content) { post.content = content; post.readingTime = calcReadingTime(content); }
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (tags) post.tags = tags;
    if (status) post.status = status;
    if (coverImage !== undefined) post.coverImage = coverImage;

    await post.save();
    sendSuccess(res, post, 'Post updated');
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to update post', 500);
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user!._id });
    if (!post) return sendError(res, 'Post not found or unauthorized', 404);
    sendSuccess(res, null, 'Post deleted');
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to delete post', 500);
  }
};

export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return sendError(res, 'Post not found', 404);

    const userId = req.user!._id;
    const liked = post.likes.some(id => id.equals(userId));

    if (liked) {
      post.likes = post.likes.filter(id => !id.equals(userId));
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }
    await post.save();
    sendSuccess(res, { liked: !liked, likesCount: post.likesCount });
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to toggle like', 500);
  }
};

export const toggleBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) return sendError(res, 'User not found', 404);

    const postId = req.params.id;
    const bookmarked = user.bookmarks.some(id => id.equals(postId));

    if (bookmarked) {
      user.bookmarks = user.bookmarks.filter(id => !id.equals(postId));
    } else {
      user.bookmarks.push(new (require('mongoose').Types.ObjectId)(postId));
    }
    await user.save();
    sendSuccess(res, { bookmarked: !bookmarked });
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to toggle bookmark', 500);
  }
};

export const getMyPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const query: Record<string, unknown> = { author: req.user!._id };
    if (status) query.status = status;
    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();
    sendSuccess(res, posts);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch posts', 500);
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name avatar' },
    });
    sendSuccess(res, user?.bookmarks || []);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch bookmarks', 500);
  }
};

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded');
    sendSuccess(res, { url: (req.file as Express.Multer.File & { path: string }).path });
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Upload failed', 500);
  }
};
