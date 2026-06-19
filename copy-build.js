import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  BACKEND STATIC FOLDER
const destination = "E:/ElearningPlatform/backend/src/main/resources/static";

//  frontend DIST folder
const source = path.join(__dirname, "dist");

console.log("🧹 Clearing old static files...");
fs.emptyDirSync(destination);

console.log("📁 Copying new build files...");
fs.copySync(source, destination);

console.log("🔥 Copy complete! New frontend deployed.");
