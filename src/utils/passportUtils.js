import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../config/config.dotenv.js';

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const validatePass = (user, password) => bcrypt.compareSync(password, user.password)

export const generateToken = (usuario) => {
    try {
        const { _id, first_name, last_name, age, cartId, email, role, documents, last_online } = usuario;
        return jwt.sign({ _id, first_name, last_name, age, cartId, email, role, documents, last_online }, config.SECRETCODE, { expiresIn: "1h" });
    } catch (error) {
        console.error('Token generation error!:', error);
    }
};

export const tokenVerify = (token) => {
    try {
        return jwt.verify(token, config.SECRETCODE)
    } catch (error) {
        console.error('Token verify error!', error);
    }
};