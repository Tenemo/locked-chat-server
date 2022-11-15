import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { healthCheck } from 'routes/health-check';
import crypto from 'crypto';
import { Events, Message, User, CustomRequest, Body } from 'types/types';

dotenv.config();

const app = express();
app.use(express.json(), cors());

const httpServer = createServer(app);
const port = process.env.PORT ?? 4000;

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

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

app.get('/health-check', healthCheck);

app.post('/set-username', (req: CustomRequest<Body>, res) => {
    if (
        Object.values(users).some(
            (existingUsername) => existingUsername === req.body.username,
        )
    ) {
        res.status(403);
        res.send('Username already exists.');
        console.log('Cannot register:', req.body, '\n'); // for dev's purpose - delete later
    } else {
        users[req.body.socketID] = req.body.username;

        res.status(200);
        res.send({
            messages: messages,
            usernames: Object.values(users),
        });
        io.emit(Events.UPDATE_USERS, Object.values(users));
        console.log('New user registered:', req.body); // for dev's purpose - delete later
        console.log(`New user's list:`, Object.values(users), '\n'); // for dev's purpose - delete later
    }
});

io.on(`connection`, async (socket) => {
    console.log(`Client connected: `, socket.id);

    socket.on(Events.NEW_MESSAGE, (content: string, messageId: string) => {
        const author = users[socket.id];

        if (!author) {
            socket.emit(Events.NEW_MESSAGE_USERNAME_NOT_REGISTERED);
            console.log(
                `Cannot send this message: ${socket.id} need username\n`,
            ); // for dev's purpose - delete later
            return;
        }

        const timestamp = new Date().toISOString();
        const id = crypto.randomBytes(32).toString('hex');

        const newMessage: Message = {
            content,
            author,
            timestamp,
            id,
            ...(messageId && {
                replyTo: messageId,
            }),
        };

        messages.push(newMessage);
        Object.keys(users).forEach((key) =>
            io.to(key).emit(Events.NEW_MESSAGE_UPDATE, newMessage),
        );
        console.log(`New message:`, newMessage, '\n'); // for dev's purpose - delete later
    });

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
        console.log(users[socket.id], 'left the chat');
        delete users[socket.id];
        socket.broadcast.emit(Events.USER_DISCONNECTED, Object.values(users));
        console.log(`New user's list:`, Object.values(users), '\n'); // for dev's purpose - delete later
    });
});
