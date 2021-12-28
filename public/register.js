const submitButton = document.getElementById("submit-button");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");

function init() {
    submitButton.addEventListener("click", sendUpdate);
}

function sendUpdate() {
    let newUserData = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    if (!newUserData.username || !newUserData.password)
        return; // Only attempt update if valid values are input

    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    window.location.href = `/users/${JSON.parse(req.responseText).userID}`
                    break;
                case 409: // Conflict: username exists
                default:
                    alert(req.responseText);
                    break;
            }
        }
    }

    // Send a PUT request to the server containing the new user data
    req.open("PUT", "/register");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(newUserData));
}