import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//check routes
app.get("/", (req, res) => {
    res.send("Task Management API is running...");
});

app.use("/api/auth",(req, res) => res.send("Auth route"));
app.use("/api/users", (req, res) => res.send("Users route"));
app.use("/api/tasks", (req, res) => res.send("Task route"));
app.use("/api/comments", (req, res) => res.send("Comments route"));
app.use("/api/assets", (req, res) => res.send("Assets route"));
app.use("/api/chat", (req, res) => res.send("Chat route"));

app.use("/api/tasks", taskRoutes);

export default app;