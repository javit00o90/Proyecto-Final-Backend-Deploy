import express from 'express';
import auth from '../middleware/authenticate.js';
import UserController from '../controller/userController.js';
import { upload } from '../middleware/multer.js';
import { adminAccessMiddleware } from '../middleware/access.js';
const router = express.Router();

router.get('/premium/:uid', auth, UserController.premiumGet);
router.post('/premium/:uid', auth, UserController.premiumPost);
router.post("/passwordreset", UserController.passwordReset)
router.get("/passwordreset2", UserController.passwordReset2)
router.post("/passwordreset3", UserController.passwordReset3)
router.post('/:uid/documents', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'products', maxCount: 10 },
    { name: 'documentsId', maxCount: 1 },
    { name: 'documentsAdress', maxCount: 1 },
    { name: 'documentsAccount', maxCount: 1 }
]), UserController.uploadPost);
router.get('/show', auth, adminAccessMiddleware, UserController.usersGet);
router.delete('/clear', auth, adminAccessMiddleware, UserController.usersClear);
router.delete('/delete/:uid', auth, adminAccessMiddleware, UserController.userDelete);
router.get('/rolechange/:uid', auth, adminAccessMiddleware, UserController.roleChange);


export default router;