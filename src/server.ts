import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { healthCheck } from 'routes/health-check';
import crypto from 'crypto';

type Message = {
    content: string;
    author: string;
    timestamp: string;
    id: string;
};
const messages: Message[] = [
    {
        content: 'abc',
        author: 'Rafał',
        timestamp: '123',
        id: '1',
    },
];

type User = {
    nick: string;
    id: string;
};

const users: User[] = [{ nick: 'Garrow', id: '1' }];

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT ?? 4000;

app.get('/health-check', healthCheck);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

io.on(`connection`, async (socket) => {
    console.log(`client connected: `, socket.id);

    socket.on('new-message', (data: string) => {
        console.log(data);
        const timestamp = new Date().toISOString();
        const id = crypto.randomBytes(32).toString('hex');

        const newMessage: Message = {
            content: data,
            author: socket.id,
            timestamp,
            id,
        };

        messages.push(newMessage);
        io.emit('new-message-update', newMessage);
    });

    socket.on('set-username', (nick: string) => {
        if (users.some((user) => user.nick === nick)) {
            socket.emit('set-username-failed'); // one argument?
        } else {
            users.push({ nick: nick, id: socket.id });
            socket.emit('set-username-correct', users);
            socket.send(messages);
        }
        console.log(users);
    });

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
    });
});

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// enum z nazwami
