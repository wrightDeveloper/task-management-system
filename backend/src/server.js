import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

connectDB();

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin:"*",
    },
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
});

const PORT =  process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});