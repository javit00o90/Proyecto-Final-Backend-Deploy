window.onload = function () {
    let form = document.getElementById('uploadForm');
    let userIdInput = document.getElementById('userId');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let userId = userIdInput.value;
        form.action = "/api/users/" + userId + "/documents";

        let fileInputs = form.querySelectorAll('input[type="file"]');
        let filesSelected = false;
        fileInputs.forEach(function (input) {
            if (input.files.length > 0) {
                filesSelected = true;
            }
        });

        if (!filesSelected) {
            alert('Please select at least one file to upload.');
            return false;
        }

        form.submit();
    });
};

