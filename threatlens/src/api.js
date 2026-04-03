import axios from "axios";

export const API = axios.create({
  baseURL: "https://portfolioraj.in",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});