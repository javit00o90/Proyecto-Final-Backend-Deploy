import mongoose from 'mongoose';
import { formatResponse, validateProducts } from '../utils/utils.js';
import ProductService from '../services/productsServices.js';
import { CustomError, ErrorCodes } from '../utils/errorUtils.js';
import { sendEmail } from '../utils/emailTransport.js';

class ProductsController {
    constructor() {
        this.productService = new ProductService();
    }

    getProducts = async (req, res) => {
        try {
            const queryParams = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                category: req.query.category,
                available: req.query.available,
                sortByPrice: req.query.sortByPrice,
            };

            const result = await this.productService.getProducts(queryParams);

            const response = formatResponse(result);

            if (req.originalUrl.includes('/api/')) {
                res.status(200).json(response);
            } else {
                return result;
            }
        } catch (error) {
            console.error('Error reading products from MongoDB:', error.message);
            throw error;
        }
    };

    getProductById = async (req, res) => {
        try {
            const productId = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new CustomError(
                    ErrorCodes.INVALID_PRODUCT_ID.name,
                    ErrorCodes.INVALID_PRODUCT_ID.message,
                    ErrorCodes.INVALID_PRODUCT_ID.code,
                    'Invalid product ID format'
                );
            }

            const product = await this.productService.getProductById(productId);
            if (product) {
                return res.status(200).json(product);
            } else {
                throw new CustomError(
                    ErrorCodes.PRODUCT_NOT_FOUND.name,
                    ErrorCodes.PRODUCT_NOT_FOUND.message,
                    ErrorCodes.PRODUCT_NOT_FOUND.code,
                    'Product not found in the database'
                );
            }
        } catch (error) {
            console.error('Error getting the product by ID from MongoDB:', error.message);
            return res.status(error.code || 500).json({ name: error.name, code: error.code, message: error.message });
        }
    };

    deleteProduct = async (req, res) => {
        try {
            const { pid } = req.params;
            const { role, email } = req.user;

            if (role === 'admin') {
                const product = await this.productService.getProductById(pid);
                if (product) {
                    const result = await this.productService.deleteProduct(pid);
                    if (result === "Product removed correctly") {
                        const updatedProductList = await this.productService.getProducts();
                        req.app.get('io').emit('productos', updatedProductList.payload);
                        req.logger.info(`User ${email} deleted product id: ${pid}`);

                        if (product.owner !== 'admin') {
                            await sendEmail(product.owner, 'Product Deletion Notification', `Your product with code ${product.code} has been deleted.`);
                        }

                        return res.status(200).json({ message: "Product removed correctly" });
                    } else if (!result) {
                        throw new CustomError(
                            ErrorCodes.PRODUCT_NOT_FOUND.name,
                            ErrorCodes.PRODUCT_NOT_FOUND.message,
                            ErrorCodes.PRODUCT_NOT_FOUND.code,
                            'Product not found in the database'
                        );
                    } else {
                        throw new CustomError(
                            ErrorCodes.INTERNAL_SERVER_ERROR.name,
                            ErrorCodes.INTERNAL_SERVER_ERROR.message,
                            ErrorCodes.INTERNAL_SERVER_ERROR.code,
                            'Internal server error'
                        );
                    }
                }
            } else if (role === 'premium') {
                const product = await this.productService.getProductById(pid);
                if (product.owner === email) {
                    const result = await this.productService.deleteProduct(pid);
                    if (result === "Product removed correctly") {
                        const updatedProductList = await this.productService.getProducts();
                        req.app.get('io').emit('productos', updatedProductList.payload);
                        req.logger.info(`User ${req.user.email} deleted product id: ${pid}`)
                        return res.status(200).json({ message: "Product removed correctly" });
                    } else if (!result) {
                        throw new CustomError(
                            ErrorCodes.PRODUCT_NOT_FOUND.name,
                            ErrorCodes.PRODUCT_NOT_FOUND.message,
                            ErrorCodes.PRODUCT_NOT_FOUND.code,
                            'Product not found in the database'
                        );
                    } else {
                        throw new CustomError(
                            ErrorCodes.INTERNAL_SERVER_ERROR.name,
                            ErrorCodes.INTERNAL_SERVER_ERROR.message,
                            ErrorCodes.INTERNAL_SERVER_ERROR.code,
                            'Internal server error'
                        );
                    }
                } else {
                    throw new CustomError(
                        ErrorCodes.UNAUTHORIZED_ACCESS.name,
                        ErrorCodes.UNAUTHORIZED_ACCESS.message,
                        ErrorCodes.UNAUTHORIZED_ACCESS.code,
                        'Unauthorized access'
                    );
                }
            } else {
                throw new CustomError(
                    ErrorCodes.UNAUTHORIZED_ACCESS.name,
                    ErrorCodes.UNAUTHORIZED_ACCESS.message,
                    ErrorCodes.UNAUTHORIZED_ACCESS.code,
                    'Unauthorized access'
                );
            }
        } catch (error) {
            console.error(`Error deleting the product: ${error.message}`);
            return res.status(error.code || 500).json({ name: error.name, code: error.code, message: error.message });
        }
    };

    addProduct = async (req, res) => {
        try {
            const productsData = Array.isArray(req.body) ? req.body : [req.body];

            const validationResult = validateProducts(productsData);
            if (validationResult.error) {
                return res.status(400).json({ error: validationResult.error });
            }

            const results = await Promise.all(productsData.map(async (productData) => {
                return await this.productService.addProduct(productData);
            }));

            const responseCodes = {
                "Product with that code already exist. Not added": 400,
                "Product added successfully.": 201,
            };

            const reStatus = results.some((result) => responseCodes[result] === 201) ? 201 : 400;

            if (reStatus === 201) {
                const updatedProductList = await this.productService.getProducts();
                req.app.get('io').emit('productos', updatedProductList.payload);
                req.logger.info(`User ${req.user.email} added ${productsData.length} products, code: ${productsData[0].code}`)
            }

            return res.status(reStatus).json({ messages: results });

        } catch (error) {
            console.error(`Error in the product adding path: ${error.message}`);
            res.status(500).json({ error: "Server error!" });
        }

    };

    updateProduct = async (req, res) => {
        try {
            const productId = req.params.pid;
            const updates = req.body;

            const result = await this.productService.updateProduct(productId, updates);

            if (result.status === 200) {
                const updatedProductList = await this.productService.getProducts();
                req.app.get('io').emit('productos', updatedProductList);
            }

            res.status(result.status).json(result);
        } catch (error) {
            console.error(`Error in the product updating path: ${error.message}`);
            res.status(500).json({ error: "Server error!" });
        }
    };

    getProductsByOwner = async (req, res) => {
        try {
            const ownerEmail = req.user.email;

            const result = await this.productService.getProductsByOwner(ownerEmail);

            return result
        } catch (error) {
            console.error('Error reading products from MongoDB:', error.message);
            throw error;
        }
    };

    productRestore = async (req, res) => {
        try {
            const productId = req.params.pid;
            const currentUserEmail = req.user.email;
            const product = await this.productService.getProductById(productId);
            if (!product) {
                throw new CustomError(
                    ErrorCodes.PRODUCT_NOT_FOUND.name,
                    ErrorCodes.PRODUCT_NOT_FOUND.message,
                    ErrorCodes.PRODUCT_NOT_FOUND.code,
                    'Product not found in the database'
                );
            }
            if (product.owner !== currentUserEmail) {
                throw new CustomError(
                    ErrorCodes.NOT_AUTHORIZED.name,
                    ErrorCodes.NOT_AUTHORIZED.message,
                    ErrorCodes.NOT_AUTHORIZED.code,
                    'You are not authorized to restore the status of this product'
                );
            }
            const result = await this.productService.productRestore(productId);
            if (result === "Product status restored correctly") {
                req.logger.info(`User ${req.user.email} restored product id: ${productId}`)
                res.status(200).json({ message: "Product status restored correctly" });
            } else {
                throw new CustomError(
                    ErrorCodes.INTERNAL_SERVER_ERROR.name,
                    ErrorCodes.INTERNAL_SERVER_ERROR.message,
                    ErrorCodes.INTERNAL_SERVER_ERROR.code,
                    'Internal server error'
                );
            }
        } catch (error) {
            return res.status(error.code || 500).json({ name: error.name, code: error.code, message: error.message });
        }


    };
    
}

export default new ProductsController();