import express from 'express';
const router = express.Router();
import ProductsController from '../controller/productsController.js';
import { adminAccessMiddleware, adminPremiumAccessMiddleware } from '../middleware/access.js';
import auth from '../middleware/authenticate.js';


router.get('/', ProductsController.getProducts);
router.get('/:pid', ProductsController.getProductById);
router.delete('/:pid',auth, adminPremiumAccessMiddleware, ProductsController.deleteProduct);
router.post('/',auth, adminPremiumAccessMiddleware, ProductsController.addProduct);
router.put('/:pid',auth, adminAccessMiddleware, ProductsController.updateProduct);

export default router;