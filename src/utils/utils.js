export const validateProducts = (productsData) => {
    const requiredFields = ['title', 'description', 'price', 'code', 'stock', 'category'];
    const invalidFields = [];

    for (const productData of productsData) {
        const missingFields = requiredFields.filter(field => !(field in productData));

        if (missingFields.length > 0) {
            invalidFields.push(`Required fields are missing in a product: ${missingFields.join(', ')}`);
        }

        const typeValidation = {
            title: 'string',
            description: 'string',
            price: 'number',
            code: 'string',
            stock: 'number',
            category: 'string',
            status: 'boolean'
        };

        const productInvalidFields = Object.entries(typeValidation).reduce((acc, [field, type]) => {
            if (productData[field] !== undefined) {
                if (type === 'array' && !Array.isArray(productData[field])) {
                    acc.push(field);
                } else if (typeof productData[field] !== type) {
                    acc.push(field);
                }
            }
            return acc;
        }, []);

        if (!Array.isArray(productData.thumbnails)) {
            invalidFields.push('Invalid format for thumbnails field in a product');
        }

        if (productData.stock <= 0 || productData.price <= 0) {
            invalidFields.push('Stock must be greater than 0 and price cannot be negative');
        }

        if (productInvalidFields.length > 0) {
            invalidFields.push(`Invalid data types in product fields: ${productInvalidFields.join(', ')}`);
        }
    }

    return { error: invalidFields.join('\n') };
}

export const formatResponse = (result) => {
    return {
        status: 'success',
        payload: result.payload,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.prevLink,
        nextLink: result.nextLink,
    };
}


const currentDate = new Date();
currentDate.setHours(currentDate.getHours() - 3);
export const formattedDate = currentDate.toLocaleString('es-ES', {
    timeZone: 'UTC',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});



export const getUserDocumentStatus = (userDocuments) => {
    const documentStatus = {
        avatar: 'no',
        documentsId: 'no',
        documentsAdress: 'no',
        documentsAccount: 'no'
    };

    userDocuments.forEach(doc => {
        if (doc.name === 'avatar') {
            documentStatus.avatar = 'yes';
        } else if (doc.name === 'documentsId') {
            documentStatus.documentsId = 'yes';
        } else if (doc.name === 'documentsAdress') {
            documentStatus.documentsAdress = 'yes';
        } else if (doc.name === 'documentsAccount') {
            documentStatus.documentsAccount = 'yes';
        }
    });
    
    return documentStatus;
};
