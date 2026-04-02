import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import analyzeRoute from "./routes/analyzeRoutes";
import dashboardRoute from "./routes/dashboardRoutes";
import projectsRoute from "./routes/projectRoutes";
import threatMiddleware from "./middleware/threatMiddleware";
import suggestionsRoutes from "./routes/suggestionRoutes";

dotenv.config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: "*" }
});

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io rooms
io.on("connection", (socket) => {
  console.log("Dashboard connected:", socket.id);
  socket.on("join_project", ({ projectId }: { projectId: string }) => {
    socket.join(projectId);
    console.log(`Dashboard joined project: ${projectId}`);
  });
});

// Routes
app.use("/api/analyze",   analyzeRoute(io));
app.use("/api/dashboard", dashboardRoute);
app.use("/api/projects", projectsRoute);
app.use("/api/suggestions", suggestionsRoutes);

// Demo routes with threat middleware applied
app.use("/demo", threatMiddleware(io));
app.get("/demo/test", (req, res) => {
  res.json({ message: "Request processed!", threatScore: (req as any).threatScore });
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "ThreatLens server running ✅" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ThreatLens server running on port ${PORT} ✅`);
});

export { io };