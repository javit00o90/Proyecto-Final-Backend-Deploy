document.getElementById('showUsersBtn').addEventListener('click', function () {
    fetch('/api/users/show')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error showing users');
            }
            return response.json();
        })
        .then(data => {
            displayUsers(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});

document.getElementById('clearInactiveBtn').addEventListener('click', function () {
    const clearLoadingDiv = document.getElementById('clearLoading');
    clearLoadingDiv.textContent = 'Clearing inactive users...';

    fetch('/api/users/clear', {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error clearing users');
            }
            return response.json();
        })
        .then(data => {
            clearLoadingDiv.textContent = '';
            document.getElementById('userList').innerHTML = `<p>${data}</p>`;
        })
        .catch(error => {
            clearLoadingDiv.textContent = '';
            console.error('There was a problem with the fetch operation:', error);
        });
});

function displayUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'userCard';

        const firstNameP = document.createElement('p');
        firstNameP.textContent = `First Name: ${user.first_name}`;

        const lastNameP = document.createElement('p');
        lastNameP.textContent = `Last Name: ${user.last_name}`;

        const emailP = document.createElement('p');
        emailP.textContent = `Email: ${user.email}`;

        const roleP = document.createElement('p');
        roleP.textContent = `Role: ${user.role}`;

        const roleBtn = document.createElement('button');
        roleBtn.textContent = 'Change Role';
        roleBtn.classList.add('btn');
        roleBtn.classList.add('btn-info');
        roleBtn.style.marginRight = '10px';
        roleBtn.addEventListener('click', function () {
            changeUserRole(user._id);
        });

        const actionBtn = document.createElement('button');
        if (user.status) {
            actionBtn.textContent = 'Delete';
            actionBtn.classList.add('btn');
            actionBtn.classList.add('btn-danger');
            actionBtn.addEventListener('click', function () {
                deleteUser(user._id);
            });
        } else {
            actionBtn.textContent = 'Restore';
            actionBtn.classList.add('btn');
            actionBtn.classList.add('btn-success');
            actionBtn.addEventListener('click', function () {
                deleteUser(user._id);
            });
        }

        userDiv.appendChild(firstNameP);
        userDiv.appendChild(lastNameP);
        userDiv.appendChild(emailP);
        userDiv.appendChild(roleP);
        userDiv.appendChild(roleBtn);
        userDiv.appendChild(actionBtn);
        
        userList.appendChild(userDiv);
    });
}

function changeUserRole(userId) {
    fetch(`/api/users/rolechange/${userId}`, {
        method: 'GET'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error changing user role');
            }
            return response.json();
        })
        .then(data => {
            alert(data)
            document.getElementById('showUsersBtn').click();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function deleteUser(userId) {
    fetch(`/api/users/delete/${userId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting user');
            }
            return response.json();
        })
        .then(data => {
            alert(data)
            document.getElementById('showUsersBtn').click();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}