import { io } from "socket.io-client";

export const socket = io("https://portfolioraj.in", {
  transports: ["websocket"],
});