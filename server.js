const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = http.createServer(app);
const { userToSockets, socketToUser } = require("./socket-manager");
const socketAuth = require("./socketAuth");
const io = new Server(httpServer, {
    cors: {
        origin: "https://crm-tprb.vercel.app",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});
const SOCKET_PORT = process.env.SOCKET_PORT;
io.use(socketAuth);
io.on("connection", (socket) => {
    const userId = socket.user._id;
    if (!userToSockets.has(userId)) {
        userToSockets.set(userId, new Set());
    }
    userToSockets.get(userId).add(socket.id);
    socketToUser.set(socket.id, userId);
    console.log("User to Sockets : ", userToSockets);
    console.log("Sockets to User : ", socketToUser);
    socket.on("join-project", (projectId) => {
        socket.join(`projectId:${projectId}`);
        console.log(`User : ${userId} joined group chat of project : ${projectId}`)
    });
    socket.on("leave-project", (projectId) => {
        socket.leave(`projectId:${projectId}`);
        console.log(`User : ${userId} left group chat of project : ${projectId}`)
    });
    socket.on("new-unread", ({ userId }) => {
        socket.join(`joinUnread:userId:${userId}`);
        console.log(`User : ${userId} joined unread tracking `);
    });
    socket.on("leave-unread", ({ userId }) => {
        socket.leave(`joinUnread:userId:${userId}`);
        console.log(`User : ${userId} left unread tracking `);

    });
    socket.on("disconnect", () => {
        console.log(`Socket ID : ${socket.id} disconnected`);
        const userId = socketToUser.get(socket.id);
        if (userId) {
            const sockets = userToSockets.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
            }
            if (sockets && sockets.size == 0) {
                userToSockets.delete(userId);
            }
            socketToUser.delete(socket.id);
        }
    })
});
app.use(express.json());
app.post("/emit", (req, res) => {
    console.log("Body : ", req.body);
    const sockets = userToSockets.get(req.body.userId);
    for (let socketId of sockets) {
        io.to(socketId).emit(req.body.event, req.body.payload);
    }
    return res.status(200).json({
        success: true,
    });
});
app.post("/chat-message", (req, res) => {
    console.log("Body : ", req.body);
    const { projectId, newMessage } = req.body;
    io.to(`projectId:${projectId}`).emit(
        req.body.event,
        req.body.payload,
    );
    return res.status(200).json({
        success: true,
    });
});
app.post("/count-unread", (req, res) => {
    console.log("Body : ", req.body);
    const { userId } = req.body;
    io.to(`joinUnread:userId:${userId}`).emit(
        req.body.event,
        req.body.payload,
    );
    return res.status(200).json({
        success: true,
    });
})
httpServer.listen(SOCKET_PORT, () => {
    console.log(`Socket Server is running on PORT ${SOCKET_PORT}`);
});