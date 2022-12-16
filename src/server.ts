import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { healthCheck } from 'routes/health-check';
import crypto from 'crypto';
import { Events, Message, User, CustomRequest, Body } from 'types/types';
import { generateToken, validateToken } from 'utils/jwt.utils';
import { VerifyInterface, verifyToken } from 'routes/verify-token';

// import fs from 'fs';
// import path from 'path';
// import jwt from 'jsonwebtoken';
//testowe dane do wysłania
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const dane: { imie: string } = {
//     imie: 'wojtek',
// };
// const privateKey = {
//     key: fs.readFileSync(path.join(__dirname, './../private.pem'), 'utf8'),
//     passphrase: 'lockedchat',
// };
// const token = jwt.sign(
//     dane,
//     privateKey,
//     { algorithm: 'RS256' },
//     function (err, token) {
//         console.log('error', err);
//         console.log('token ', token);
//     },
// );

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

export const users: User = {
    _E9JSqynu35fJ4bIAAAB: { username: 'Test1', socketID: '123456' },
    znlbFaz31OAxAX7RAAAD: { username: 'Test2', socketID: '123456' },
    znlbFaz31OAxAX7RDDAD: { username: 'Test3', socketID: '123456' },
};

app.get('/health-check', healthCheck);
app.post('/verify-token', verifyToken);

app.post('/set-username', (req: CustomRequest<Body>, res) => {
    if (
        Object.values(users).some(
            (userId) => userId.username === req.body.username,
        )
    ) {
        res.status(403);
        res.send('Username already exists.');
        console.log('Cannot register:', req.body, '\n'); // for dev's purpose - delete later
    } else {
        const token = generateToken({
            username: req.body.username,
            socketID: req.body.socketID,
        });
        const userID = crypto.randomBytes(32).toString('hex');
        users[userID] = {
            username: req.body.username,
            socketID: req.body.socketID,
        };

        const usernames: string[] = [];
        for (const key in users) {
            const user = users[key];
            usernames.push(user.username);
        }
        res.send({
            messages,
            usernames,
            token,
            userID,
        });
        io.emit(Events.UPDATE_USERNAMES, Object.values(users));
        console.log('New user registered: userId:\n', userID, users[userID]); // for dev's purpose - delete later
        console.log(`New user's list:`, usernames, '\n'); // for dev's purpose - delete later
    }
});

io.on(`connection`, (socket) => {
    console.log(`Client connected: `, socket.id);
    //popraw :string

    socket.on(Events.USER_RECONNECT, async ({ token }: { token: string }) => {
        console.log('reconnect udany ', token);
        const sprawdzamToken = validateToken(token) as VerifyInterface;
        socket.emit('testuje', sprawdzamToken);
        // console.log('sprawdzenie ', sprawdzamToken);
        // console.log('typeof ', typeof sprawdzamToken);
    });

    socket.on(
        Events.NEW_MESSAGE,
        (message: string | { content: string; messageId: string }) => {
            const author = users[socket.id]; //todo

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
                content:
                    typeof message === 'string' ? message : message.content,
                author,
                timestamp,
                id,
                ...(typeof message === 'object' && {
                    replyTo: message.messageId,
                }),
            };

            messages.push(newMessage);
            Object.keys(users).forEach((key) =>
                io.to(key).emit(Events.NEW_MESSAGE_UPDATE, newMessage),
            );
            console.log(`New message:`, newMessage, '\n'); // for dev's purpose - delete later
        },
    );

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
        console.log(users[socket.id], 'left the chat');
        delete users[socket.id];
        socket.broadcast.emit(Events.USER_DISCONNECTED, Object.values(users));
        console.log(`New user's list:`, Object.values(users), '\n'); // for dev's purpose - delete later
    });
});
