import http from "http";
import { parse } from "querystring";
import { serveStatic } from "./utils/static.js";
import {
  createUserController,
  deleteUserController,
  getUsersController,
  logInUserController,
  logOutUserController,
  registerUserController,
  updateUserController,
} from "./controllers/user.controller.js";
import {
  createArtistController,
  getArtistsController,
} from "./controllers/artist.controller.js";
import {
  createSongsController,
  getSongsController,
} from "./controllers/songs.controller.js";
import { pathToRegex } from "./utils/pathConverter.js";

const routes = [
  // authentication routes
  { method: "POST", path: "/api/register", handler: registerUserController },
  { method: "POST", path: "/api/login", handler: logInUserController },
  { method: "POST", path: "/api/logout", handler: logOutUserController },

  // user management routes
  { method: "POST", path: "/api/users", handler: createUserController },
  { method: "GET", path: "/api/users", handler: getUsersController },
  { method: "PATCH", path: "/api/users/:id", handler: updateUserController },
  { method: "DELETE", path: "/api/users/:id", handler: deleteUserController },

  //artist management routes
  { method: "POST", path: "/api/artists", handler: createArtistController },
  { method: "GET", path: "/api/artists", handler: getArtistsController },
  // { method: "PUT", path: "/api/artists/:id", handler: updateArtistController },
  // { method: "DELETE", path: "/api/artists/:id", handler: deleteArtistController },

  // song management routes
  { method: "GET", path: "/api/songs", handler: getSongsController },
  { method: "POST", path: "/api/songs", handler: createSongsController },
].map((route) => ({
  ...route,
  regex: pathToRegex(route.path),
}));

function router(req, res) {
  const [pathname, queryString] = req.url.split("?");

  const match = routes.find(
    (r) => r.method === req.method && r.regex.test(pathname),
  );

  if (!match) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
    return;
  }

  const paramValues = pathname.match(match.regex).slice(1);
  const paramNames = (match.path.match(/:\w+/g) || []).map((name) =>
    name.slice(1),
  );
  req.params = Object.fromEntries(
    paramNames.map((name, index) => [name, paramValues[index]]),
  );
  req.query = queryString ? parse(queryString) : {};

  return match.handler(req, res);
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith("/api/")) {
    return router(req, res);
  }
  try {
    await serveStatic(req, res);
  } catch (error) {
    console.error("Static serve error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal server error");
  }
});

server.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
