import mongoose from 'mongoose';
import { getAuth } from '@clerk/express';
import User from '../models/userModel.js';

export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const requireUser = asyncHandler(async (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = user;
    next();
});

export const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
};

export const validateId = (param = 'id') => (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params[param])) return res.status(400).json({ message: 'Invalid id' });
    next();
};