import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import socketIo, { Server } from 'socket.io';

import { healthCheck } from 'routes/health-check';
import { countReset } from 'console';
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

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT ?? 4000;

app.get('/health-check', healthCheck);

app.get('/messages', function (_req, res) {
    res.send(messages);
});

app.post('/send', (req, res) => {
    messages.push(req.body as Message);
    res.send('Message saved.');
});

const httpServer = createServer(app);
const io = socketIo(httpServer);

io.on(`connection`, (socket) => {
    console.log(`client connected: `, socket.id);

    socket.join(`clock-room`);

    socket.on(`disconnect`, (reason) => {
        console.log(reason);
    });
});

httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
