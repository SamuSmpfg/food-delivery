import { Router } from 'express';
import ChefApplication from '../models/chefApplicationModel.js';
import { asyncHandler } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';
import { sendMail, escapeHtml } from '../services/mailer.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
    const data = pick(req.body, ['name', 'email', 'restaurantName', 'phone']);
    const pending = await ChefApplication.exists({
        email: String(data.email ?? '').trim().toLowerCase(),
        status: 'pending'
    });
    if (pending) return res.status(409).json({ message: 'An application for this email is already pending' });
    const application = await ChefApplication.create(data);

    const name = escapeHtml(data.name ?? '');
    const restaurantName = escapeHtml(data.restaurantName ?? '');

    await sendMail({
        to: data.email,
        subject: 'Recebemos sua candidatura para ser chef',
        text: `Olá ${data.name ?? ''}, recebemos a candidatura do restaurante ${data.restaurantName ?? ''}. Vamos analisar e entraremos em contato em breve.`,
        html: `<p>Olá ${name},</p><p>Recebemos a candidatura do restaurante <strong>${restaurantName}</strong>.</p><p>Vamos analisar e entraremos em contato em breve.</p>`
    });

    res.status(201).json(application);
}));

export default router;  