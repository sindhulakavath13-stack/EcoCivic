const form = document.getElementById("complaintForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const complaint =
        document.getElementById("complaint").value;

    const location =
        document.getElementById("location").value;

    const image =
        document.getElementById("image").files[0];

    const logoutButton = document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }


    // Get logged-in user
    const storedUser =
        localStorage.getItem("loggedInUser");

    if (!storedUser) {

        alert("Please login first.");

        window.location.href = "login.html";

        return;
    }

    const user =
        JSON.parse(storedUser);


    // Create JSON Payload to match Java Backend (temporary without image)
    const payload = {
        description: complaint,
        location: location
    };

    try {
        const response = await fetch(
            `${CONFIG.API_BASE_URL}/reports`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify(payload)
            }
        );


        const result = await response.json();

        console.log("Server Response:", result);

        message.textContent = "Report submitted successfully!";

        form.reset();

    } catch (error) {

        console.error("Error:", error);

        message.textContent =
            "Unable to submit complaint.";
    }

});

// Logout button
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    });
}