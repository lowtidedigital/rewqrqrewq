// Build script to package Lambda functions
import { build } from "esbuild";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

// Add ALL lambdas you want zipped here.
// These must match filenames in src/handlers/<name>.ts
const lambdas = [
  "redirect",
  "links",
  "analytics",
  "billing_api",
  "stripe_webhook",
];

async function buildLambda(name) {
  console.log(`Building ${name}...`);

  const entry = path.join(__dirname, "..", "src", "handlers", `${name}.ts`);
  if (!fs.existsSync(entry)) {
    throw new Error(`Missing handler file: ${entry}`);
  }

  // Ensure output directory exists: dist/<name>/
  const outDir = path.join(distDir, name);
  fs.mkdirSync(outDir, { recursive: true });

  // Bundle with esbuild
  await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: path.join(outDir, `${name}.js`),

    // Lambda loads handlers as CommonJS by default.
    format: "cjs",

    minify: true,
    sourcemap: true,
  });

  // Create zip file at dist/<name>.zip
  const zipPath = path.join(distDir, `${name}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      console.log(`  ${name}.zip: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on("warning", (err) => {
      // non-fatal warnings (like stat failures)
      console.warn(err);
    });

    archive.on("error", reject);

    archive.pipe(output);

    // Put dist/<name>/* at the root of the zip
    archive.directory(outDir, false);

    archive.finalize();
  });
}

async function main() {
  // Ensure dist directory exists
  fs.mkdirSync(distDir, { recursive: true });

  // Build all lambdas
  for (const lambda of lambdas) {
    await buildLambda(lambda);
  }

  console.log("Build complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
