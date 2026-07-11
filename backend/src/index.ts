import express from 'express';
import dotenv from 'dotenv';
import triageRoutes from './routes/triage';
import scribeRoutes from './routes/scribe';
import { avatarWebSocketHandler } from './routes/avatar';

dotenv.config();
import path from 'path';
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '../medgemma-ai-500912-fe89c0fe5481.json');

import expressWs from 'express-ws';

const { app, getWss } = expressWs(express());
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.json());

app.use('/api/triage', triageRoutes);
app.use('/api/scribe', scribeRoutes);
app.ws('/api/live-avatar', avatarWebSocketHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
