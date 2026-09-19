// Central API configuration - automatically uses correct URL for dev vs production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';
export default API_BASE;
