const changeRoleBtn = document.getElementById('changeRole');
if (changeRoleBtn) {
    changeRoleBtn.addEventListener('click', async function () {
        const userId = this.getAttribute('data-user-id');
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        };

        try {
            const response = await fetch(`/api/users/premium/${userId}`, requestOptions);
            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message);
            } else {
                const updatedUser = await response.json();
                const divContainer = document.getElementById('userRole');
                divContainer.textContent = "Your role changed to " + updatedUser.role + ". You need to relog to update";
                divContainer.style.display = "block";
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert('Error: ' + error.message);
        }
    });
}