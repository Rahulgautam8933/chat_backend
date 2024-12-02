import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';  // Add .js extension for local files

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Track connected users
let users = [];

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', (data) => {
        // For private chats, join a unique room based on user identifiers (e.g., usernames)
        const room = data.room;  // Room is sent from the client, e.g., a combination of two usernames
        socket.join(room);
        users.push({
            socketId: socket.id,
            username: data.username,
            room: room,
        });
        console.log(`${data.username} joined room: ${room}`);
    });

    socket.on('send_message', (data) => {
        // Emit the message to the room (private chat room)
        socket.to(data.room).emit('receive_message', data);
        console.log('Message sent:', data);
    });

    socket.on('disconnect', () => {
        // Remove the user from the list when they disconnect
        users = users.filter(user => user.socketId !== socket.id);
        console.log('Client disconnected:', socket.id);
    });
});

// Routes
import chatRoutes from './routes/chatRoutes.js'; // Adjust the imports to use ESM
import userRoutes from './routes/userRoutes.js';  // Adjust the imports to use ESM

app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
