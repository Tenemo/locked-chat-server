import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { healthCheck } from 'routes/health-check';
// import crypto from 'crypto';
// import { UserWhitespacable } from '@babel/types';
// import { stringify } from 'querystring';

// enum events {
//     NEW_MESSAGE = 'new-message',
//     NEW_MESSAGE_UPDATE = 'new-message-update',
//     SET_USERNAME = 'set-username',
//     SET_USERNAME_STATUS = 'set-username-status',
// }

// type Message = {
//     content: string;
//     author: string;
//     timestamp: string;
//     id: string;
// };

// const messages: Message[] = [
//     {
//         content: 'abc',
//         author: 'Rafał',
//         timestamp: '123',
//         id: '1',
//     },
// ];

// const users = {};

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

    // socket.on(events.SET_USERNAME, (nick: string) => {
    //     type History = { status: boolean; messages: Message[]; users: {} };

    //     const history: History = {
    //         status: false,
    //         messages: [],
    //         users: {},
    //     };

    //     if (
    //         Object.values(users).some((existingNick) => existingNick === nick)
    //     ) {
    //         socket.emit(events.SET_USERNAME_STATUS, history);
    //     } else {
    //         users[socket.id] = nick;

    //         history.status = true;
    //         history.messages = messages;
    //         history.users = users;

    //         socket.emit(events.SET_USERNAME_STATUS, history);
    //     }
    //     console.log('history: ', history, 'socket: :', socket.id);
    // });

    // socket.on(events.NEW_MESSAGE, (data: string) => {
    //     if (!(socket.id in users)) return;

    //     const author = users[socket.id];
    //     console.log('author: ', author);
    //     const timestamp = new Date().toISOString();
    //     const id = crypto.randomBytes(32).toString('hex');

    //     const newMessage: Message = {
    //         content: data,
    //         author,
    //         timestamp,
    //         id,
    //     };

    //     messages.push(newMessage);
    //     io.emit(events.NEW_MESSAGE_UPDATE, newMessage);
    // });

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
    });
});

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
