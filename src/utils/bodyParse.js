import { parseCSV } from "./csvParser.js";

export function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers["content-type"] || "";

        if (contentType.includes("application/json")) {
          const text = buffer.toString("utf-8");
          return resolve(text ? JSON.parse(text) : {});
        }

        if (contentType.includes("application/x-www-form-urlencoded")) {
          const text = buffer.toString("utf-8");
          const params = new URLSearchParams(text);
          const parsed = Object.fromEntries(params.entries());
          return resolve(parsed);
        }

        if (contentType.includes("text/csv")) {
          const text = buffer.toString("utf-8");
          const rows = parseCSV(text);
          return resolve({ csvRows: rows });
        }

        try {
          return resolve(JSON.parse(body));
        } catch {
          const params = new URLSearchParams(body);
          const parsed = Object.fromEntries(params.entries());
          return resolve(parsed);
        }
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}
