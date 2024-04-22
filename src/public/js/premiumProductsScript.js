async function deleteProduct(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: "DELETE",
        });
        if (response.ok) {
            location.reload();
        } else {
            const data = await response.json();
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error.message);
    }
}

async function restoreProduct(productId) {
    try {
        const response = await fetch(`/products/premium/${productId}/restore`, {
            method: "PUT",
        });
        if (response.ok) {
            location.reload();
        } else {
            const data = await response.json();
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error restoring product status:', error.message);
    }
}

const productCards = document.querySelectorAll('.productCard');
productCards.forEach(card => {
    const productId = card.getAttribute('id').split('-')[1];
    const statusElement = card.querySelector('p:nth-of-type(1)');
    const status = statusElement.innerText.split(': ')[1].toLowerCase();
    if (status === 'true') {
        statusElement.style.color = 'green';
        const deleteButton = card.querySelector('#deleteBtn');
        deleteButton.addEventListener('click', function() {
            deleteProduct(productId);
        });
    } else {
        statusElement.style.color = 'red';
        const restoreButton = card.querySelector('#restoreBtn');
        restoreButton.addEventListener('click', function() {
            restoreProduct(productId);
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("productForm");
    if (productForm) {
        productForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const price = parseFloat(document.getElementById("price").value);
            const stock = parseInt(document.getElementById("stock").value, 10);

            const thumbnailsString = document.getElementById("thumbnails").value;
            const thumbnailsArray = thumbnailsString
                .split(",")
                .map((thumbnail) => thumbnail.trim());

            const formData = {
                title: document.getElementById("title").value,
                description: document.getElementById("description").value,
                price: isNaN(price) ? 0 : price,
                code: document.getElementById("code").value,
                stock: isNaN(stock) ? 0 : stock,
                category: document.getElementById("category").value,
                owner: document.getElementById("owner").value,
                thumbnails: thumbnailsArray,
            };

            try {
                const response = await fetch("/api/products", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    if(errorDetails.error){
                        alert(errorDetails.error)
                        return;
                    }
                    alert(errorDetails.messages)
                    return;
                    
                }

                const result = await response.json();
                alert(result.messages)
                location.reload();
            } catch (error) {
                console.error("Error sending the request:", error);
            }
        });
    }
});