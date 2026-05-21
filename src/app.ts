// src/app.ts
import express from "express";
import cors from "cors";
import router from "./routes/cardRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.json({ message: "Tiny Anki API is running " });
});
export default app;
