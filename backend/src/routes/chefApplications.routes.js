import { Router } from 'express';
import ChefApplication from '../models/chefApplicationModel.js';
import { asyncHandler } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
    const data = pick(req.body, ['name', 'email', 'restaurantName', 'phone']);
    const pending = await ChefApplication.exists({
        email: String(data.email ?? '').trim().toLowerCase(),
        status: 'pending'
    });
    if (pending) return res.status(409).json({ message: 'An application for this email is already pending' });
    const application = await ChefApplication.create(data);
    res.status(201).json(application);
}));

export default router;