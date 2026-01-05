// Build script to package Lambda functions
import { build } from 'esbuild';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

const lambdas = ['redirect', 'links', 'analytics'];

async function buildLambda(name) {
  console.log(`Building ${name}...`);
  
  // Bundle with esbuild
  await build({
    entryPoints: [path.join(__dirname, '..', 'src', 'handlers', `${name}.ts`)],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(distDir, name, `${name}.js`),
	    // Lambda loads handlers as CommonJS by default. Bundling to CJS avoids
	    // "Cannot use import statement outside a module" errors and produces a
	    // self-contained artifact (no node_modules in the zip).
	    format: 'cjs',
    minify: true,
    sourcemap: true
  });

  // Create zip file
  const zipPath = path.join(distDir, `${name}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`  ${name}.zip: ${archive.pointer()} bytes`);
      resolve();
    });
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(path.join(distDir, name), false);
    archive.finalize();
  });
}

async function main() {
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Build all lambdas
  for (const lambda of lambdas) {
    await buildLambda(lambda);
  }

  console.log('Build complete!');
}

main().catch(console.error);
