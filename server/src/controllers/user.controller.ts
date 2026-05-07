import { Request, Response } from 'express';
import User from '../models/User';
import Post from '../models/Post';
import { sendSuccess, sendError } from '../utils/response';

export const getAuthorProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return sendError(res, 'User not found', 404);

    const posts = await Post.find({ author: user._id, status: 'published' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    sendSuccess(res, { user, posts });
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch profile', 500);
  }
};
