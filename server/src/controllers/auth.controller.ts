import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '7d' } as jwt.SignOptions);

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (await User.findOne({ email })) return sendError(res, 'Email already in use');

    const user = await User.create({ name, email, password, role: role === 'author' ? 'author' : 'reader' });
    const token = signToken(user._id.toString());
    sendSuccess(res, { user, token }, 'Registration successful', 201);
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }
    const token = signToken(user._id.toString());
    sendSuccess(res, { user, token }, 'Login successful');
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Login failed', 500);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  sendSuccess(res, req.user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );
    sendSuccess(res, user, 'Profile updated');
  } catch (err: unknown) {
    sendError(res, err instanceof Error ? err.message : 'Update failed', 500);
  }
};
