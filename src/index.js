import http from 'http';
import router from './router.js';
import { serveStatic } from './helper/static.js';

const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/api')) { return router(req, res); }
    try {
        await serveStatic(req, res);
    } catch (error) {
        console.error('Static serve error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
    }
});

server.listen(3000, () => {
    console.log('Running on http://localhost:3000');
});