import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 5173);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"]
]);

const server = createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url || "/", `http://${request.headers.host}`).pathname);
    const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
    const filePath = path.resolve(frontendDirectory, relativePath);

    if (!filePath.startsWith(`${frontendDirectory}${path.sep}`) && filePath !== path.join(frontendDirectory, "index.html")) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes.get(path.extname(filePath)) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(contents);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404).end("Not found");
      return;
    }

    console.error("No se pudo servir el archivo solicitado:", error);
    response.writeHead(500).end("Internal server error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Frontend disponible en http://localhost:${port}`);
});
