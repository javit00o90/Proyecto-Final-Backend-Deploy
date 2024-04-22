import express from 'express';
const router = express.Router();
import auth from '../middleware/authenticate.js'
import { userPremiumAccessMiddleware } from '../middleware/access.js';

router.get('/', auth, userPremiumAccessMiddleware, async (req, res) => {
    const user = req.user;
    res.render('chat', { session: { user }});
});

export default router;