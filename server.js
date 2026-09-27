const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const players = {};

io.on('connection', (socket) => {
    if (Object.keys(players).length >= 4) {
        socket.disconnect();
        return;
    }
    players[socket.id] = { id: socket.id, x: 0, y: 2, z: 0, rotationY: 0 };
    socket.emit('current_players', players);
    socket.broadcast.emit('player_joined', players[socket.id]);

    socket.on('player_move', (data) => {
        if (players[socket.id]) {
            Object.assign(players[socket.id], data);
            socket.broadcast.emit('player_moved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('player_left', socket.id);
    });
});

server.listen(process.env.PORT || 3000);
