import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { healthCheck } from 'routes/health-check';
import crypto from 'crypto';
import { Events, Message, User } from 'types/types';

const messages: Message[] = [
    {
        content: 'Hi 1',
        author: 'Test1',
        timestamp: '2022-10-25T10:42:36.370Z',
        id: 'cc9811c5217c525b411bfe7c8b616852a752822ca4de8d28b2b113b906a89824',
    },
    {
        content: 'Hi 2',
        author: 'Test2',
        timestamp: '2022-10-25T10:45:11.390Z',
        id: '616852a752822ca4cc98112b113b906a8c5217c525b411bfe7c8bde8d28b9824',
    },
    {
        content: 'Hi 3',
        author: 'Test3',
        timestamp: '2022-10-25T10:48:36.150Z',
        id: 'de8d28b2b113b90bfe7c8b6168cc9811c5217c525b41152a752822ca46a89824',
    },
];

const users: User = {
    _E9JSqynu35fJ4bIAAAB: 'Test1',
    znlbFaz31OAxAX7RAAAD: 'Test2',
    znlbFaz31OAxAX7RDDAD: 'Test3',
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

    socket.on(Events.SET_USERNAME, (username: string) => {
        if (
            Object.values(users).some(
                (existingUsername) => existingUsername === username,
            )
        ) {
            socket.emit(Events.SET_USERNAME_FAILURE, username);
        } else {
            users[socket.id] = username;

            socket.emit(Events.SET_USERNAME_SUCCESS, {
                messages: messages,
                usernames: Object.values(users),
            });
        }
    });

    socket.on(Events.NEW_MESSAGE, (content: string) => {
        const author = users[socket.id];

        if (!author) {
            socket.emit(Events.NEW_MESSAGE_USERNAME_NOT_REGISTERED);
            return;
        }

        const timestamp = new Date().toISOString();
        const id = crypto.randomBytes(32).toString('hex');

        const newMessage: Message = {
            content,
            author,
            timestamp,
            id,
        };

        messages.push(newMessage);
        Object.keys(users).forEach((key) =>
            io.to(key).emit(Events.NEW_MESSAGE_UPDATE, newMessage),
        );
    });

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
        console.log(users[socket.id], ' left the chat');
        delete users[socket.id];
        socket.broadcast.emit(Events.USER_DISCONNECTED, Object.values(users));
    });
});

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
