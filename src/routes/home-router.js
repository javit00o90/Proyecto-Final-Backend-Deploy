import express from 'express';
const router = express.Router();
import auth from '../middleware/authenticate.js'
import homeRenderController from '../controller/homeRenderController.js';
import { adminAccessMiddleware } from '../middleware/access.js';


router.get('/', auth, homeRenderController.homePage);
router.get('/register', homeRenderController.homeRegister)
router.get('/login', homeRenderController.homeLogin)
router.get('/passwordreset', homeRenderController.passwordReset)
router.get('/passwordreset2', homeRenderController.passwordReset2)
router.get('/profile', auth, homeRenderController.homeProfile);
router.get('/uploads', auth, homeRenderController.userUpload);
router.get('/admin', auth, adminAccessMiddleware, homeRenderController.adminControl);


export default router;

