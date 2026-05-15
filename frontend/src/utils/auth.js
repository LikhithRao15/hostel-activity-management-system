export const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login page if token missing or expired
    console.error("No auth token found – redirecting to login");
    window.location.href = "/login";
    return null;
  }
  return token;
};
