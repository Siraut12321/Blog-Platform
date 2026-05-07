import { Request, Response } from 'express';
import Comment from '../models/Comment';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    const withReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'name avatar')
          .sort({ createdAt: 1 })
          .lean();
        return { ...comment, replies };
      })
    );
    sendSuccess(res, withReplies);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to fetch comments', 500);
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content, parentComment } = req.body;
    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user!._id,
      content,
      parentComment: parentComment || null,
    });
    await comment.populate('author', 'name avatar');
    sendSuccess(res, comment, 'Comment added', 201);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to add comment', 500);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, author: req.user!._id });
    if (!comment) return sendError(res, 'Comment not found or unauthorized', 404);
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();
    sendSuccess(res, null, 'Comment deleted');
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Failed to delete comment', 500);
  }
};
