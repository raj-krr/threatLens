import express from "express";
import { Server } from "socket.io";
import { analyzeRequest } from "../controllers/analyzeControllers";

export default (io: Server) => {
  const router = express.Router();

  router.post("/", analyzeRequest(io));

  return router;
};