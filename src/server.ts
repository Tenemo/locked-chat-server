import dotenv from 'dotenv';
import express from 'express';

import { healthCheck } from 'routes/health-check';
type Message = {
    content: string;
    author: string;
    timestamp: string;
};
const messages: Message[] = [
    {
        content: 'abc',
        author: 'Rafał',
        timestamp: '123',
    },
];

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT ?? 4000;

app.get('/health-check', healthCheck);

app.listen(port, () => {
    console.log(`App listening on port ${port}.`);
});

app.get('/messages', function (_req, res) {
    res.send(messages);
});

app.post('/send', (req, res) => {
    messages.push(req.body as Message);
    res.send('Message saved.');
});
