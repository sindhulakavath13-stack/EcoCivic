console.log("NEW DASHBOARD JS LOADED");

const API_URL = `${CONFIG.API_BASE_URL}/reports`;

let allComplaints = [];

async function loadComplaints() {

    try {

        const userStr = localStorage.getItem("loggedInUser");
        const token = userStr ? JSON.parse(userStr).token : "";

        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch complaints");
        }

        const complaints = await response.json();

        allComplaints = complaints;

        console.log("Complaints received:", complaints);
        console.log("First complaint:", complaints[0]);
        console.log("Subcategory:", complaints[0].subcategory);

        document.getElementById("totalComplaints").textContent = complaints.length;

        const highPriorityCount = complaints.filter(
        complaint => complaint.priority === "High"
        ).length;

        document.getElementById("highPriority").textContent = highPriorityCount;

        const pendingCount = complaints.filter(
        complaint => complaint.status === "Pending"
        ).length;

        document.getElementById("pendingComplaints").textContent = pendingCount;

        const resolvedCount = complaints.filter(
        complaint => complaint.status === "Resolved"
        ).length;

        document.getElementById("resolvedComplaints").textContent = resolvedCount;

        displayComplaints(complaints);
        createCategoryChart(complaints);
        createPriorityChart(complaints);
        createLocationChart(complaints);
        createSustainabilityChart(complaints);
    } catch (error) {

        console.error("Error loading complaints:", error);

    }
}


function displayComplaints(complaints) {

    const resultCount = document.getElementById("resultCount");

    resultCount.textContent =
        `Showing ${complaints.length} of ${allComplaints.length} complaints`;

    const table = document.getElementById("complaintsTable");

    if (complaints.length === 0) {

    table.innerHTML = `
        <tr>
            <td colspan="7" class="no-results">
                No complaints match your search or filters.
            </td>
        </tr>
    `;

    return;
}


    table.innerHTML = "";


    complaints.forEach(complaint => {

        const row = document.createElement("tr");

row.innerHTML = `
    <td>${complaint.complaint || "N/A"}</td>
    <td>${complaint.category || "N/A"}</td>
    <td>${complaint.subcategory || "N/A"}</td>
    <td>${complaint.priority || "N/A"}</td>
    <td>${complaint.location || "N/A"}</td>

    <td>
        <select class="status-select" data-id="${complaint.id || complaint._id}">
            <option value="Pending" ${complaint.status === "Pending" ? "selected" : ""}>
                Pending
            </option>

            <option value="In Progress" ${complaint.status === "In Progress" ? "selected" : ""}>
                In Progress
            </option>

            <option value="Resolved" ${complaint.status === "Resolved" ? "selected" : ""}>
                Resolved
            </option>
        </select>
    </td>

    <td>
        <button class="view-details-btn" data-id="${complaint.id || complaint._id}">
            View Details
        </button>
    </td>
`;
        table.appendChild(row);

    });
}


loadComplaints();

function createCategoryChart(complaints) {
    const categoryCounts = {};

    complaints.forEach(complaint => {
        const category = complaint.category || "Unknown";

        if (categoryCounts[category]) {
            categoryCounts[category]++;
        } else {
            categoryCounts[category] = 1;
        }
    });

    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);

    new Chart(document.getElementById("categoryChart"), {
        type: "bar",
        data: {
            labels: categories,
            datasets: [{
                label: "Number of Complaints",
                data: counts
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createPriorityChart(complaints) {
    const priorityCounts = {
        High: 0,
        Medium: 0,
        Low: 0
    };

    complaints.forEach(complaint => {
        const priority = complaint.priority;

        if (priorityCounts[priority] !== undefined) {
            priorityCounts[priority]++;
        }
    });

    new Chart(document.getElementById("priorityChart"), {
        type: "doughnut",
        data: {
            labels: ["High", "Medium", "Low"],
            datasets: [{
                label: "Priority",
                data: [
                    priorityCounts.High,
                    priorityCounts.Medium,
                    priorityCounts.Low
                ]
            }]
        },
        options: {
            responsive: true
        }
    });
}

function createLocationChart(complaints) {
    const locationCounts = {};

    complaints.forEach(complaint => {
        const location = complaint.location || "Unknown";

        if (locationCounts[location]) {
            locationCounts[location]++;
        } else {
            locationCounts[location] = 1;
        }
    });

    const locations = Object.keys(locationCounts);
    const counts = Object.values(locationCounts);

    new Chart(document.getElementById("locationChart"), {
        type: "bar",
        data: {
            labels: locations,
            datasets: [{
                label: "Number of Complaints",
                data: counts
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function createSustainabilityChart(complaints) {
    const sustainabilityCounts = {};

    complaints.forEach(complaint => {
        const area = complaint.sustainability_area || "Unknown";

        if (sustainabilityCounts[area]) {
            sustainabilityCounts[area]++;
        } else {
            sustainabilityCounts[area] = 1;
        }
    });

    const areas = Object.keys(sustainabilityCounts);
    const counts = Object.values(sustainabilityCounts);

    new Chart(document.getElementById("sustainabilityChart"), {
        type: "bar",
        data: {
            labels: areas,
            datasets: [{
                label: "Number of Complaints",
                data: counts
            }]
        },
        options: {
            responsive: true,
            indexAxis: "y",
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function applyFilters() {
    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    const selectedPriority =
        document.getElementById("priorityFilter").value;

    const selectedStatus =
        document.getElementById("statusFilter").value;

    const filteredComplaints = allComplaints.filter(complaint => {

    
        const matchesSearch =
            (complaint._id || "").toLowerCase().includes(searchText) ||
            (complaint.complaint || "").toLowerCase().includes(searchText) ||
            (complaint.category || "").toLowerCase().includes(searchText) ||
            (complaint.subcategory || "").toLowerCase().includes(searchText) ||
            (complaint.priority || "").toLowerCase().includes(searchText) ||
            (complaint.location || "").toLowerCase().includes(searchText) ||
            (complaint.sustainability_area || "").toLowerCase().includes(searchText) ||
            (complaint.status || "").toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            complaint.category === selectedCategory;

        const matchesPriority =
            selectedPriority === "All" ||
            complaint.priority === selectedPriority;

        const matchesStatus =
            selectedStatus === "All" ||
            complaint.status === selectedStatus;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesPriority &&
            matchesStatus
        );
    });

    displayComplaints(filteredComplaints);
}

document.getElementById("searchInput")
    .addEventListener("input", applyFilters);

document.getElementById("categoryFilter")
    .addEventListener("change", applyFilters);

document.getElementById("priorityFilter")
    .addEventListener("change", applyFilters);

document.getElementById("statusFilter")
    .addEventListener("change", applyFilters);

    document.addEventListener("change", async function (event) {

    if (!event.target.classList.contains("status-select")) {
        return;
    }

    const select = event.target;

    const complaintId = select.dataset.id;
    const newStatus = select.value;

    try {

        const userStr = localStorage.getItem("loggedInUser");
        const token = userStr ? JSON.parse(userStr).token : "";

        const response = await fetch(
            `${API_URL}/${complaintId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to update status");
        }

        console.log("Status updated:", result);

        // Update the local complaint data
            const complaint = allComplaints.find(
                item => String(item.id || item._id) === String(complaintId)
            );

            if (complaint) {
                complaint.status = newStatus;
            }

        // Update dashboard statistics
        document.getElementById("pendingComplaints").textContent =
            allComplaints.filter(
                item => item.status === "Pending"
            ).length;

        document.getElementById("resolvedComplaints").textContent =
            allComplaints.filter(
                item => item.status === "Resolved"
            ).length;

        // Re-apply current filters
        applyFilters();

        console.log(
            `Complaint ${complaintId} status changed to ${newStatus}`
        );

    } catch (error) {

        console.error("Status update error:", error);

        alert("Failed to update complaint status.");

    }

});

// View complaint details
document.addEventListener("click", function (event) {

    // Close complaint details modal
    if (event.target.id === "closeModal") {
        document.getElementById("complaintModal").style.display = "none";
        return;
    }

    // Open complaint details
    if (!event.target.classList.contains("view-details-btn")) {
        return;
    }

    const complaintId = event.target.dataset.id;

    const complaint = allComplaints.find(
        item => String(item.id || item._id) === String(complaintId)
    );

    if (!complaint) {
        alert("Complaint details not found.");
        return;
    }

    // Fill complaint details
    document.getElementById("detailComplaint").textContent =
        complaint.complaint || "N/A";

    document.getElementById("detailCategory").textContent =
        complaint.category || "N/A";

    document.getElementById("detailSubcategory").textContent =
        complaint.subcategory || "N/A";

    document.getElementById("detailPriority").textContent =
        complaint.priority || "N/A";

    document.getElementById("detailLocation").textContent =
        complaint.location || "N/A";

    document.getElementById("detailSustainability").textContent =
        complaint.sustainability_area || "N/A";

    document.getElementById("detailSummary").textContent =
        complaint.summary || "N/A";

    document.getElementById("detailStatus").textContent =
        complaint.status || "Pending";

    document.getElementById("detailCreatedAt").textContent =
        complaint.created_at
            ? new Date(complaint.created_at).toLocaleString()
            : "N/A";

    document.getElementById("detailUpdatedAt").textContent =
        complaint.updated_at
            ? new Date(complaint.updated_at).toLocaleString()
            : "N/A";

// Display uploaded complaint image
const detailImage = document.getElementById("detailImage");

if (complaint.image) {

    detailImage.src =
        `http://127.0.0.1:5000/uploads/${complaint.image}`;

    detailImage.style.display = "block";

    detailImage.onerror = function () {
        detailImage.style.display = "none";
        console.error(
            "Unable to load complaint image:",
            complaint.image
        );
    };

} else {

    detailImage.src = "";
    detailImage.style.display = "none";

}

// Show modal
document.getElementById("complaintModal").style.display = "block";
});

// Close modal when clicking outside the modal content
window.addEventListener("click", function (event) {

    const modal = document.getElementById("complaintModal");

    if (event.target === modal) {
        modal.style.display = "none";
    }

});

document.getElementById("clearFiltersBtn")
    .addEventListener("click", function () {

        document.getElementById("searchInput").value = "";

        document.getElementById("categoryFilter").value = "All";

        document.getElementById("priorityFilter").value = "All";

        document.getElementById("statusFilter").value = "All";

        displayComplaints(allComplaints);
    });

    document.getElementById("logoutBtn")
    .addEventListener("click", function () {

        localStorage.removeItem("loggedInUser");

        window.location.href = "admin-login.html";
    });

    const storedUser = localStorage.getItem("loggedInUser");

if (storedUser) {

    const user = JSON.parse(storedUser);

    const userInfo =
        document.getElementById("loggedInUserInfo");

    if (userInfo) {

        userInfo.textContent =
            `Welcome, ${user.name}`;
    }
}