import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(frontendDirectory, "dist");
const apiBaseUrl = process.env.API_BASE_URL?.trim();
const resolvedApiBaseUrl = apiBaseUrl === "same-origin" ? "" : apiBaseUrl ?? "http://localhost:5050";

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
for (const page of ["index.html", "habitaciones.html", "servicios.html", "promociones.html"]) {
  await cp(path.join(frontendDirectory, page), path.join(outputDirectory, page));
}
await cp(path.join(frontendDirectory, "styles.css"), path.join(outputDirectory, "styles.css"));
await cp(path.join(frontendDirectory, "app.js"), path.join(outputDirectory, "app.js"));
await cp(path.join(frontendDirectory, "assets"), path.join(outputDirectory, "assets"), { recursive: true });
await writeFile(
  path.join(outputDirectory, "config.js"),
  `window.HOTEL_CONFIG = { apiBaseUrl: ${JSON.stringify(resolvedApiBaseUrl)} };\n`,
  "utf8"
);

console.log(`Frontend generado en ${outputDirectory}; API: ${resolvedApiBaseUrl || "mismo origen"}`);
