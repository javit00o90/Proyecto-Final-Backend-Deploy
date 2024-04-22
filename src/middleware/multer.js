import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imageFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
const documentFileTypes = ['application/pdf', 'text/plain', 'application/msword'];

const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            if (!imageFileTypes.includes(file.mimetype) && !documentFileTypes.includes(file.mimetype)) {
                const err = new Error('File type not supported');
                err.code = 415;
                return cb(err, false);
            }
        if (file.fieldname === 'avatar' && imageFileTypes.includes(file.mimetype)) {
            cb(null, path.join(__dirname, '../public/uploads/profiles'));
        } else if (file.fieldname === 'products' && imageFileTypes.includes(file.mimetype)) {
            cb(null, path.join(__dirname, '../public/uploads/products'));
        } else if (documentFileTypes.includes(file.mimetype)) {
            cb(null, path.join(__dirname, '../public/uploads/documents'));
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });