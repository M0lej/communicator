import axios from "axios";

export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(
  /\/+$/,
  "",
);

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  withCredentials: true,
});

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}
