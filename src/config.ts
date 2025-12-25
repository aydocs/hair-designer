// In production (Vercel), use the live Render backend.
// In development (Localhost), use the local server.
export const API_BASE_URL = import.meta.env.PROD
    ? 'https://hair-designer.onrender.com'
    : 'http://localhost:3000';
