import axios from "axios";

export const API = axios.create({
  baseURL: "https://portfolioraj.in",
  headers: {
    "Content-Type": "application/json",
  },
});