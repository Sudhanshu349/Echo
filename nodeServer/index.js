const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

const users = {};
const rooms = {};

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Socket.IO logic
io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    socket.on('join-room', ({ name, room }) => {
        users[socket.id] = name;
        rooms[socket.id] = room;

        socket.join(room);
        socket.to(room).emit('user-joined', name);

        // Text messages
        socket.on('send-message', ({ message }) => {
            io.to(room).emit('receive', { name: users[socket.id], message });
        });

        // File sharing
        socket.on('send-file', (data) => {
            io.to(room).emit('receive-file', {
                name: users[socket.id],
                fileName: data.fileName,
                fileType: data.fileType,
                file: data.file
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            socket.to(room).emit('user-left', users[socket.id]);
            delete users[socket.id];
            delete rooms[socket.id];
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
