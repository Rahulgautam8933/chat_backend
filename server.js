


const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');


app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (data) => {
        socket.join(data);
        console.log(`Client joined the room socket.id ${socket.id} with ${data}`);
    })
    socket.on('send_message', (data) => {
        socket.to(data.room).emit("receive_message", data)
        // console.log(`Client  message ${data}`);
        console.log(data);
    })
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
