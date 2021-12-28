const privacyForm = document.getElementById("privacy-form");
const submitButton = document.getElementById("submit-button");

// userID and userPrivate passed from user.pug

function init() {
    populatePrivacyForm();
    submitButton.addEventListener("click", sendUpdate);
}

function sendUpdate() {
    if (userData.privacy === (privacyForm.elements["privacy"].value === "true"))
        return; // Only attempt update if value is changed; compare boolean values

    const req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            alert(req.responseText);
            location.reload();
        }
    }

    // Send a POST request to the server containing the new user profile data
    req.open("POST", `/users/${userData.userID}`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({privacy: privacyForm.elements["privacy"].value}));
}

function populatePrivacyForm() {
    privacyForm.textContent = ""; // clear privacy form content

    let privateTrueRadio = document.createElement("input");
    privateTrueRadio.setAttribute("id", "private-true");
    privateTrueRadio.setAttribute("name", "privacy");
    privateTrueRadio.setAttribute("type", "radio");
    privateTrueRadio.setAttribute("value", "true");

    let privateTrueLabel = document.createElement("label");
    privateTrueLabel.setAttribute("for", "private-true");
    privateTrueLabel.textContent = "Yes";

    let privateFalseRadio = document.createElement("input");
    privateFalseRadio.setAttribute("id", "private-false");
    privateFalseRadio.setAttribute("name", "privacy");
    privateFalseRadio.setAttribute("type", "radio");
    privateFalseRadio.setAttribute("value", "false");

    let privateFalseLabel = document.createElement("label");
    privateFalseLabel.setAttribute("for", "private-false");
    privateFalseLabel.textContent = "No";

    submitButton.textContent = "Update Privacy";

    if (userData.privacy) {
        privateTrueRadio.setAttribute("checked", "checked");
        privateTrueLabel.textContent += " (current)";
    } else {
        privateFalseRadio.setAttribute("checked", "checked");
        privateFalseLabel.textContent += " (current)";
    }

    privacyForm.append(
        privateTrueRadio, privateTrueLabel,
        privateFalseRadio, privateFalseLabel,
        document.createElement("br"), document.createElement("br"));
}