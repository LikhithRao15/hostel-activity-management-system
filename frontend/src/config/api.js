let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Automatically strip trailing slash if present to avoid double slash (//) redirect issues
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

console.log("Hostel System API Base URL:", BASE_URL);
export default BASE_URL;
