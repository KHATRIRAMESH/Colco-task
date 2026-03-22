import fs from "fs";
import path from "path";
import { sessionAuthMiddleware } from "../middleware/sessionAuth.js";

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
};

export async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, "http://localhost");
  const pathname = requestUrl.pathname;
  console.log(`Serving static file: ${pathname}`);

  await sessionAuthMiddleware(req, res);
  const hasValidSession = Boolean(req.isAuthenticated);

  if (pathname === "/") {
    const target = hasValidSession ? "/dashboard.html" : "/login.html";
    res.writeHead(302, { Location: target });
    return res.end();
  }

  if (
    (pathname === "/login.html" || pathname === "/register.html") &&
    hasValidSession
  ) {
    res.writeHead(302, { Location: "/dashboard.html" });
    return res.end();
  }

  if (pathname === "/dashboard.html" && !hasValidSession) {
    res.writeHead(302, { Location: "/login.html" });
    return res.end();
  }

  const filePath = path.join(process.cwd(), "public", pathname);
  console.log(`Resolved file path: ${filePath}`);
  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || "text/plain";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mimeType });
    return res.end(data);
  });
}
