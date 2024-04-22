window.addEventListener('DOMContentLoaded', () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const token = urlParams.get('token');

    document.getElementById('token').value = token;

    const checkPasswordsMatch = () => {
        const password = document.getElementById('password').value;
        const repeatPassword = document.getElementById('password2').value;
        const errorDiv = document.getElementById('error');

        if (password !== repeatPassword) {
            errorDiv.innerHTML = "Passwords don't match";
            return false;
        }
        errorDiv.innerHTML = "";
        return true;
    };

    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();

        if (checkPasswordsMatch()) {
            event.target.submit();
        }
    });
});