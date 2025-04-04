// Retrieve tokens from localStorage
var accessToken = localStorage.getItem("access_token");
var idToken = localStorage.getItem("id_token");

console.log("Access Token:", accessToken);
console.log("ID Token:", idToken);

if (!accessToken || !idToken) {
    console.error("Access Token or ID Token missing. Redirecting to login.");
    window.location.href = 'http://127.0.0.1:5500/index.html';
}

// Function to decode JWT token
function parseJwt(token) {
    try {
        var base64Url = token.split('.')[1]; // Get payload part
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Convert to valid Base64
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Invalid JWT Token", error);
        return null;
    }
}

// Decode the ID Token
var decodedIdToken = parseJwt(idToken);
console.log("Decoded ID Token:", decodedIdToken);

// Extract user details from ID Token
var UserName = decodedIdToken?.name || decodedIdToken?.["cognito:username"] || "Unknown";
var UserEmail = decodedIdToken?.email || "Unknown";

// Store values in localStorage
localStorage.setItem("userName", UserName);
localStorage.setItem("userEmail", UserEmail);

// Display user details on the webpage
if (document.getElementById('userName')) {
    document.getElementById('userName').innerText = UserName;
}

if (document.getElementById('userEmail')) {
    document.getElementById('userEmail').innerText = UserEmail;
}

// Log results for debugging
console.log("Stored UserName:", UserName);
console.log("Stored UserEmail:", UserEmail);
