import axios from "axios"

const axiosClient = axios.create({
    // Use the local API while running Vite, and the deployed API in production.
    baseURL: import.meta.env.VITE_API_URL || (
        import.meta.env.DEV
            ? 'http://localhost:4000'
            : 'https://leetcode-iaic.onrender.com'
    ),
    timeout: 15000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;

