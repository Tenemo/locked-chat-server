import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { healthCheck } from 'routes/health-check';
import crypto from 'crypto';
// import { UserWhitespacable } from '@babel/types';
// import { stringify } from 'querystring';

enum events {
    NEW_MESSAGE = 'new-message',
    NEW_MESSAGE_UPDATE = 'new-message-update',
    SET_USERNAME = 'set-username',
    SET_USERNAME_STATUS = 'set-username-status',
}

type Message = {
    content: string;
    author: string;
    timestamp: string;
    id: string;
};

const messages: Message[] = [
    {
        content: 'Hi',
        author: 'Rafał',
        timestamp: '2022-10-25T10:42:36.370Z',
        id: 'cc9811c5217c525b411bfe7c8b616852a752822ca4de8d28b2b113b906a89824',
    },
];

type User = { [key: string]: string };

const users: User = {
    _E9JSqynu35fJ4bIAAAB: 'Rafał',
    znlbFaz31OAxAX7RAAAD: 'Piotrek',
    znlbFaz31OAxAX7RDDAD: 'Wojtek',
};

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

    socket.on(events.SET_USERNAME, (nick: string) => {
        type History = {
            ok: boolean;
            messages: Message[];
            users: User;
        };

        const history: History = {
            ok: false,
            messages: [],
            users: {},
        };

        if (
            Object.values(users).some((existingNick) => existingNick === nick)
        ) {
            socket.emit(events.SET_USERNAME_STATUS, history);
        } else {
            users[socket.id] = nick;

            history.ok = true;
            history.messages = messages;
            history.users = users;

            socket.emit(events.SET_USERNAME_STATUS, history);
        }
    });

    socket.on(events.NEW_MESSAGE, (textOfMessage: string) => {
        if (!(socket.id in users)) return;

        const author = users[socket.id];
        const timestamp = new Date().toISOString();
        const id = crypto.randomBytes(32).toString('hex');

        const newMessage: Message = {
            content: textOfMessage,
            author,
            timestamp,
            id,
        };

        messages.push(newMessage);
        io.emit(events.NEW_MESSAGE_UPDATE, newMessage); // person without nickname can see new messages for now
    });

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
    });
});

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
