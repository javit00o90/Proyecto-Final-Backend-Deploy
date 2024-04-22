import express from 'express';
const router = express.Router();
import auth from '../middleware/authenticate.js'


router.get('/', auth, async (req, res) => {
    const user = req.user;
    res.render('realTimeProducts', { session: { user } });
});


export default router;