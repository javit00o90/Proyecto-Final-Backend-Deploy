import ProductManager from '../dao/managers/productsManager.js';
import { productModel } from '../dao/models/products.model.js';
productModel

class ProductService {
    constructor() {
        this.productManager = new ProductManager();
    }

    async getProducts(queryParams) {
        if (!queryParams) {
            queryParams = {
                page: 1,
                limit: 1000,
            };
            return await this.productManager.getProducts(queryParams);
        }
        return await this.productManager.getProducts(queryParams);
    }

    async getProductById(productId) {
        return await this.productManager.getProductById(productId);
    }

    async deleteProduct(productId) {
        return await this.productManager.deleteProduct(productId);
    }

    async addProduct(productsData) {
        return await this.productManager.addProductRawJSON(productsData);
    }

    async updateProduct(productId, updates) {
        return await this.productManager.updateProduct(productId, updates);
    }

    async getProductsByOwner(ownerEmail) {
        return await this.productManager.getProductsByOwner(ownerEmail);
    }

    async productRestore(pid) {
        return await this.productManager.productRestore(pid);
    }
}

export default ProductService;