import { Router } from 'express';
import restaurants from './restaurants.routes.js';
import dishes from './dishes.routes.js';
import cart from './cart.routes.js';
import orders from './orders.routes.js';
import reviews from './reviews.routes.js';
import messages from './messages.routes.js';
import notifications from './notifications.routes.js';
import paymentMethods from './paymentMethods.routes.js';

const router = Router();

router.use('/restaurants', restaurants);
router.use('/dishes', dishes);
router.use('/cart', cart);
router.use('/orders', orders);
router.use('/reviews', reviews);
router.use('/messages', messages);
router.use('/notifications', notifications);
router.use('/payment-methods', paymentMethods);

export default router;