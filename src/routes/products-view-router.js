import express from 'express';
const router = express.Router();
import ProductsController from '../controller/productsController.js';
import auth from '../middleware/authenticate.js'
import { premiumAccessMiddleware } from '../middleware/access.js';
import homeRenderController from '../controller/homeRenderController.js';


router.get('/', auth,  homeRenderController.productView);
router.get('/tickets', auth,  homeRenderController.ticketsView);
router.get('/premium', auth,  premiumAccessMiddleware, homeRenderController.productPremiumView);
router.put('/premium/:pid/restore', auth, premiumAccessMiddleware, ProductsController.productRestore);


export default router;