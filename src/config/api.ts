// Centralized API base URL configuration.
// Reads from VITE_API_URL env var at build time; defaults to localhost for dev.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';