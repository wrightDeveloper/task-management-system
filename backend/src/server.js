import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const Server = http.createServer(app);


const io = new Server(Server, {
    cors: {
        origin:"*",
    },
});

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
});

const PORT =  process.env.PORT || 5000;

Server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});