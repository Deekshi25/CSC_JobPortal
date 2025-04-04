// State management
let jobs = [];

const apiUrl = "https://7pk8ryh2ld.execute-api.us-east-1.amazonaws.com/stage1";

// UI Functions
function showJobForm() {
    document.getElementById('jobFormModal').classList.remove('hidden');
}

function hideJobForm() {
    document.getElementById('jobFormModal').classList.add('hidden');
    document.getElementById('jobForm').reset();
}

function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.clear();
    window.location.href = "http://127.0.0.1:5500/index.html";
}

// Job Management Functions
function handleAddJob(event) {
    event.preventDefault();

    const newJob = {
        jobId: Math.random().toString(36).substr(2, 9),
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('jobCompany').value,
        location: document.getElementById('jobLocation').value,
        status: document.getElementById('jobStatus').value
    };
    
    jobs.push(newJob);
    updateJobsList();
    updateStats();
    hideJobForm();
}

function handleDeleteJob(jobId) {
    jobs = jobs.filter(job => job.jobId !== jobId); // Use jobId instead of jobid
    updateJobsList();
    updateStats();
}


// Update Jobs List UI
function updateJobsList() {
    const jobsListContainer = document.getElementById("jobsList");

    if (!jobs || jobs.length === 0) {
        jobsListContainer.innerHTML = `
            <p class="text-gray-500 p-4 text-center">No jobs available.</p>
        `;
        return;
    }

    // ✅ Create table structure
    let tableHTML = `
        <table class="min-w-full bg-white border border-gray-300 rounded-lg shadow">
            <thead class="bg-gray-200">
                <tr>
                    <th class="px-4 py-2 border">Title</th>
                    <th class="px-4 py-2 border">Company</th>
                    <th class="px-4 py-2 border">Location</th>
                    <th class="px-4 py-2 border">Status</th>
                    <th class="px-4 py-2 border">Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    // ✅ Loop through jobs & add rows
    jobs.forEach(job => {
        tableHTML += `
            <tr>
                <td class="px-4 py-2 border">${job.title}</td>
                <td class="px-4 py-2 border">${job.company}</td>
                <td class="px-4 py-2 border">${job.location}</td>
                <td class="px-4 py-2 border text-${job.status === 'active' ? 'green' : 'red'}-500">${job.status}</td>
                <td class="px-4 py-2 border text-center">
                   <button onclick="deleteJob('${job.jobid}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>


                </td>
            </tr>
        `;
    });

    // ✅ Close the table
    tableHTML += `</tbody></table>`;

    // ✅ Insert into jobsListContainer
    jobsListContainer.innerHTML = tableHTML;
}


// Update Job Stats
function updateStats() {
    document.getElementById('totalJobs').textContent = jobs.length;
    document.getElementById('activeJobs').textContent = jobs.filter(job => job.status === 'active').length;
}

async function deleteJob(jobId) {
    if (!jobId) {
        console.error("Error: Missing jobId for deletion.");
        return;
    }

    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
        const response = await fetch(`${apiUrl}/admin/deleteJob?jobId=${encodeURIComponent(jobId)}`, { method: "GET" });

        if (!response.ok) {
            console.error("Failed to delete job from server.");
            return;
        }

        // ✅ Ensure `jobs` is updated
        fetchAndDisplayAllJobs();

        // ✅ Update the UI immediately
        updateJobsList();
        updateStats();
        // window.location.reload(true);

    } catch (error) {
        console.error("Error deleting job:", error);
    }
}

document.getElementById('jobForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const jobTitle = document.getElementById('jobTitle').value.trim();
    const jobCompany = document.getElementById('jobCompany').value.trim();
    const jobLocation = document.getElementById('jobLocation').value.trim();
    const jobStatus = document.getElementById('jobStatus').value;

    if (!jobTitle || !jobCompany || !jobLocation || !jobStatus) {
        console.log("Missing values in the form!");
        document.getElementById('responseMessage').textContent = "Please fill out all fields!";
        return;
    }

    const jobData = { title: jobTitle, company: jobCompany, location: jobLocation, status: jobStatus };
    
    console.log("jobData:", jobData); // Debugging
    
    

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jobData)
        });

        const result = await response.json();
        document.getElementById('responseMessage').textContent = result.message || "Job added successfully!";

        // Update UI with new job
        jobs.push(jobData);
        updateJobsList();
        updateStats();

        document.getElementById('jobForm').reset();
        hideJobForm();
    } catch (error) {
        console.error("Error adding job:", error);
        document.getElementById('responseMessage').textContent = "Failed to add job.";
    }
});
// console.log("responseMessage element:", document.getElementById('responseMessage'));




// Fetch and Display All Jobs from API
async function fetchAndDisplayAllJobs() {
    try {
        const response = await fetch(`${apiUrl}/admin/getAllJobs`);
        const data = await response.json();
        console.log("Raw API Response:", data);

        // ✅ Ensure `data.body` is parsed properly
        const parsedBody = typeof data.body === "string" ? JSON.parse(data.body) : data.body;
        console.log("Parsed Body:", parsedBody);

        // ✅ Validate response structure
        if (!parsedBody.jobs || !Array.isArray(parsedBody.jobs)) {
            console.error("Invalid jobs format:", parsedBody);
            document.getElementById("jobsList").innerHTML = 
                `<tr><td colspan="5" class="text-center text-red-500 p-4">Invalid job data received.</td></tr>`;
            return;
        }

        // ✅ Update global `jobs` array
        jobs = parsedBody.jobs;
        updateJobsList();
        updateStats();
    } catch (error) {
        console.error("Error fetching jobs:", error);
        document.getElementById("jobsList").innerHTML = 
            `<tr><td colspan="5" class="text-center text-red-500 p-4">Error loading jobs.</td></tr>`;
    }
}

// ✅ Call function when page loads
window.onload = fetchAndDisplayAllJobs;
