const io = require("socket.io")(8000, {
    cors: { origin: "*" }
});

const users = {};
const rooms = {}; 

io.on('connection', socket => {
    socket.on('join-room', ({ name, room }) => {
        users[socket.id] = name;
        rooms[socket.id] = room;

        socket.join(room);
        socket.to(room).emit('user-joined', name);

        // Handle text messages
        socket.on('send-message', ({ message }) => {
            io.to(room).emit('receive', {
                name: users[socket.id],
                message: message
            });
        });

        // Handle file sending
        socket.on('send-file', (data) => {
            io.to(room).emit('receive-file', {
                name: users[socket.id],
                fileName: data.fileName,
                fileType: data.fileType,
                file: data.file
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            socket.to(room).emit('user-left', users[socket.id]);
            delete users[socket.id];
            delete rooms[socket.id];
        });
    });
});
