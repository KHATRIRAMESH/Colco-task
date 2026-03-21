export async function getSongsController(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ songs: [] }));
}

export async function createSongsController(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "Create song functionality not implemented yet",
    }),
  );
}
