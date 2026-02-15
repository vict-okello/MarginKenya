const RAW_API_BASE = import.meta.env.VITE_API_URL || "https://marginkenya-backend.onrender.com";

export const API_BASE_URL = String(RAW_API_BASE).replace(/\/+$/, "");

