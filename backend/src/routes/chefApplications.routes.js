import { Router } from 'express';
import { createClerkClient } from '@clerk/backend';
import ChefApplication from '../models/chefApplicationModel.js';
import { asyncHandler } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
    const data = pick(req.body, ['name', 'email', 'restaurantName', 'phone']);
    const email = String(data.email ?? '').trim().toLowerCase();
    const pending = await ChefApplication.exists({ email, status: 'pending' });
    if (pending) return res.status(409).json({ message: 'An application for this email is already pending' });
    const application = await ChefApplication.create(data);

    try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const { data: users } = await clerk.users.getUserList({ emailAddress: [email] });

        if (users.length) {
            await clerk.users.updateUserMetadata(users[0].id, { publicMetadata: { role: 'chef' } });
        } else {
            await clerk.invitations.createInvitation({
                emailAddress: email,
                redirectUrl: process.env.CHEF_INVITE_REDIRECT_URL,
                publicMetadata: { role: 'chef' },
                ignoreExisting: true
            });
        }

        application.status = 'approved';
        await application.save();
    } catch (error) {
        console.error('Erro ao enviar convite de chef:', error.message);
    }

    res.status(201).json(application);
}));

export default router;