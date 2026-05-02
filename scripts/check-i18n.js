import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * i18n Sync Utility (Namespace Version)
 * 
 * Ensures Arabic locale files stay in sync with English files (the source of truth).
 * - Iterates through all namespaces in src/i18n/locales/en/
 * - Adds missing keys to corresponding ar/ files.
 * - Removes stale keys from ar/ files.
 * - Reports mismatches.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enDir = path.join(__dirname, '../src/i18n/locales/en');
const arDir = path.join(__dirname, '../src/i18n/locales/ar');

const isDryRun = process.argv.includes('--dry-run');

let totalMissingCount = 0;
let totalExtraCount = 0;
let totalMismatchCount = 0;

/**
 * Reports keys present in source but missing in target.
 */
function reportMissingKeys(source, target, currentPath = '') {
  let missing = 0;
  let mismatches = 0;

  Object.keys(source).forEach(key => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    
    if (!(key in target)) {
      console.log(`  ❌ Missing: ${fullPath}`);
      missing++;
    } else if (typeof source[key] !== typeof target[key]) {
      console.log(`  ‼️ Type Mismatch: ${fullPath} (${typeof source[key]} vs ${typeof target[key]})`);
      mismatches++;
    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      const res = reportMissingKeys(source[key], target[key], fullPath);
      missing += res.missing;
      mismatches += res.mismatches;
    }
  });
  return { missing, mismatches };
}

/**
 * Reports keys present in target but missing in source (stale keys).
 */
function reportExtraKeys(source, target, currentPath = '') {
  let extra = 0;
  Object.keys(target).forEach(key => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    
    if (!(key in source)) {
      console.log(`  ⚠️ Extra: ${fullPath}`);
      extra++;
    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      extra += reportExtraKeys(source[key], target[key], fullPath);
    }
  });
  return extra;
}

/**
 * Performs a deep sync of target from source.
 */
function getSyncedData(source, target) {
  if (typeof source !== 'object' || source === null || Array.isArray(source)) {
    return (typeof target === typeof source) ? target : source;
  }

  const synced = {};
  Object.keys(source).forEach(key => {
    if (!(key in target)) {
      synced[key] = source[key]; 
    } else {
      synced[key] = getSyncedData(source[key], target[key]);
    }
  });
  return synced;
}

console.log("--- 🔍 i18n Sync Report (Namespaces) ---");
if (isDryRun) {
  console.log("🏃 Running in DRY-RUN mode. No files will be changed.\n");
}

// 1. Get all English namespace files
const namespaces = fs.readdirSync(enDir).filter(file => file.endsWith('.json'));

namespaces.forEach(file => {
  const enPath = path.join(enDir, file);
  const arPath = path.join(arDir, file);

  console.log(`\n📂 Namespace: ${file}`);

  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  let arContent = {};

  if (fs.existsSync(arPath)) {
    arContent = JSON.parse(fs.readFileSync(arPath, 'utf8'));
  } else {
    console.log(`  🆕 Arabic file does not exist. Will create it.`);
  }

  const { missing, mismatches } = reportMissingKeys(enContent, arContent);
  const extra = reportExtraKeys(enContent, arContent);

  totalMissingCount += missing;
  totalMismatchCount += mismatches;
  totalExtraCount += extra;

  if (!isDryRun) {
    const updatedAr = getSyncedData(enContent, arContent);
    fs.writeFileSync(arPath, JSON.stringify(updatedAr, null, 2), 'utf8');
  }
});

console.log(`\n--- Summary ---`);
console.log(`Total Missing: ${totalMissingCount}`);
console.log(`Total Extra  : ${totalExtraCount}`);
console.log(`Total Mismatched: ${totalMismatchCount}`);

if (!isDryRun) {
  console.log("\n✅ All Arabic namespaces have been synced with English.");
} else {
  console.log("\n👀 Dry run complete. No changes made.");
}
