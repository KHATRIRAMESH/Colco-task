import { getSongs } from './routes/songs.js';
import { getUsers, createUser, logIn, registerUser, logOut } from './routes/users.js';

const routes = [
    { method: "POST", path: "/api/register", handler: registerUser },
    { method: "POST", path: "/api/login", handler: logIn },
    { method: "POST", path: "/api/logout", handler: logOut },
    { method: 'GET', path: "/api/users", handler: getUsers },
    { method: 'POST', path: "/api/users", handler: createUser },
    { method: "GET", path: "/api/songs", handler: getSongs }
];

function router(req, res) {
    const match = routes.find(
        r => r.method === req.method && r.path === req.url
    );

    if (match) {
        match.handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
}

export default router;