import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const source = new URL("../node_modules/html2canvas/dist/html2canvas.min.js", import.meta.url);
const destination = new URL("../public/vendor/html2canvas.min.js", import.meta.url);

await mkdir(dirname(fileURLToPath(destination)), { recursive: true });
await copyFile(source, destination);
