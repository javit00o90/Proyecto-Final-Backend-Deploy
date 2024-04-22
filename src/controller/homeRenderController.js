import ProductService from '../services/productsServices.js';
import TicketsService from '../services/ticketsService.js';
import { getUserDocumentStatus } from '../utils/utils.js';
import ProductsController from './productsController.js';


class HomeRenderController {

    constructor() {
        this.productService = new ProductService();
        this.ticketService = new TicketsService();
    }

    homePage = async (req, res) => {
        try {
            const limit = req.query.limit || 10;
            const products = await ProductsController.getProducts(req);
            const user = req.user;
            res.render('home', { session: { user }, products, currentLimit: limit });
        } catch (error) {
            res.status(500).send('Error getting products');
        }
    };

    homeRegister = (req, res) => {
        let { error, message } = req.query;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('register', { error, message });
    };

    homeLogin = (req, res) => {
        let { error, message } = req.query;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('login', { error, message });
    };

    homeProfile = (req, res) => {
        res.setHeader('Content-Type', 'text/html');
        const user = req.user;
        res.status(200).render('profile', { session: { user } });
    }
    passwordReset = (req, res) => {
        let { error, message } = req.query;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('passwordReset', { error, message });
    };
    passwordReset2 = (req, res) => {
        let { error, message } = req.query;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('passwordReset2', { error, message });
    };
    userUpload = async (req, res) => {
        try {
            res.setHeader('Content-Type', 'text/html');
        let { error, message } = req.query;
        const user = req.user;

        let userDocuments = user.documents;
        let documentStatus = getUserDocumentStatus(userDocuments)

        res.status(200).render('userUpload', { session: { user }, error, message, documentStatus });
        } catch (error) {
            console.log(error)
            res.status(500).render('userUpload', { session: { user }, error, message, documentStatus });
        }
        
    }
    adminControl = (req, res) => {
        let { error, message } = req.query;
        const user = req.user;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).render('adminControl', { session: { user }, error, message });
    };

    productView = async (req, res) => {
        try {
            let { message } = req.query
            const limit = req.query.limit || 10;
            const productsData = await ProductsController.getProducts(req);
            const user = req.user;
            res.render('products', { session: { user }, productsData, message, currentLimit: limit });
        } catch (error) {
            console.error('Error retrieving products:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    productPremiumView = async (req, res) => {
        try {
            let { message } = req.query
            const user = req.user;
            const ownerEmail = user.email;
            const productsData = await this.productService.getProductsByOwner(ownerEmail);
            res.render('premiumProducts', { session: { user }, productsData, message });
        } catch (error) {
            console.error('Error retrieving products:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    ticketsView = async (req, res) => {
        try {
            let { message } = req.query
            const user = req.user;
            const ticketsData = await this.ticketService.searchTicketsByEmail(user.email)
            res.render('tickets', { session: { user }, ticketsData, message });
        } catch (error) {
            console.error('Error retrieving tickets:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}

export default new HomeRenderController();