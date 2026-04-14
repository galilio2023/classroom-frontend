// scripts/validate-env.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const envExamplePath = path.join(rootDir, '.env.example');
const srcDir = path.join(rootDir, 'src');

if (!fs.existsSync(envExamplePath)) {
  console.error("❌ Missing .env.example file");
  process.exit(1);
}

const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
const documentedKeys = [...envExampleContent.matchAll(/^([A-Z0-9_]+)=/gm)].map(m => m[1]);

// 1. Audit Source Code for used VITE_ keys
function getUsedEnvKeys(dir) {
  let keys = new Set();
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        const subKeys = getUsedEnvKeys(fullPath);
        subKeys.forEach(k => keys.add(k));
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      // 🛡️ REGEX: Support whitespace or varied formatting while maintaining static target
      const matches = content.matchAll(/import\.meta\.env\s*\.\s*(VITE_[A-Z0-9_]+)/g);
      for (const match of matches) {
        keys.add(match[1]);
      }
      
      // 🛡️ SECURITY & BUNDLING WARNING: 
      // Audit for dynamic access: import.meta.env[key]. 
      // Vite cannot statically replace dynamic access, which can lead to undefined values in production.
      if (content.includes("import.meta.env[")) {
        console.warn(`⚠️  Warning in ${fullPath}: Dynamic access to 'import.meta.env' detected. Vite requires static property access (e.g., import.meta.env.VITE_KEY) for reliable bundling.`);
      }
    }
  }
  return keys;
}

const usedKeys = getUsedEnvKeys(srcDir);
let hasError = false;

for (const key of usedKeys) {
  if (!documentedKeys.includes(key)) {
    console.error(`❌ Undocumented environment variable used in code: ${key}. Add it to .env.example.`);
    hasError = true;
  }
}

// 2. Check actual .env for placeholders if it exists
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const key of documentedKeys) {
    const lineMatch = new RegExp(`^${key}=(.*)$`, 'm').exec(envContent);
    if (lineMatch) {
      const value = lineMatch[1].trim();
      if (!value || value.includes('REPLACE_WITH')) {
        console.error(`❌ Error: ${key} in .env still has a placeholder or empty value.`);
        hasError = true;
      }
    }
  }
}

if (hasError) {
  process.exit(1);
}

console.log("✅ Environment variable audit passed.");
