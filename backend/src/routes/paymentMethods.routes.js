import { Router } from 'express';
import { asyncHandler, requireUser, validateId } from '../middleware/auth.js';
import { pick } from '../utils/pick.js';

const router = Router();

router.use(requireUser);

router.get('/', asyncHandler(async (req, res) => {
    res.json(req.user.paymentMethods);
}));

router.post('/', asyncHandler(async (req, res) => {
    const data = pick(req.body, ['stripePaymentMethodId', 'brand', 'last4', 'expMonth', 'expYear']);
    const duplicate = req.user.paymentMethods.some(
        (method) => method.stripePaymentMethodId === data.stripePaymentMethodId
    );
    if (duplicate) return res.status(409).json({ message: 'Payment method already saved' });
    req.user.paymentMethods.push(data);
    await req.user.save();
    res.status(201).json(req.user.paymentMethods[req.user.paymentMethods.length - 1]);
}));

router.delete('/:id', validateId(), asyncHandler(async (req, res) => {
    req.user.paymentMethods.pull(req.params.id);
    await req.user.save();
    res.status(204).end();
}));

export default router;