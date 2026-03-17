import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * i18n Sync Utility
 * 
 * Ensures ar.json stays in sync with en.json (the source of truth).
 * - Adds missing keys to ar.json with English placeholders.
 * - Removes extra keys from ar.json that no longer exist in en.json.
 * - Reports type mismatches.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '../src/i18n/en.json');
const arPath = path.join(__dirname, '../src/i18n/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

let missingCount = 0;
let extraCount = 0;
let mismatchCount = 0;

/**
 * Reports keys present in source but missing in target.
 */
function reportMissingKeys(source, target, currentPath = '') {
  Object.keys(source).forEach(key => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    
    if (!(key in target)) {
      console.log(`❌ Missing in Arabic: ${fullPath}`);
      missingCount++;
    } else if (typeof source[key] !== typeof target[key]) {
      console.log(`‼️ Type Mismatch at: ${fullPath} (${typeof source[key]} vs ${typeof target[key]})`);
      mismatchCount++;
    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      reportMissingKeys(source[key], target[key], fullPath);
    }
  });
}

/**
 * Reports keys present in target but missing in source (stale keys).
 */
function reportExtraKeys(source, target, currentPath = '') {
  Object.keys(target).forEach(key => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    
    if (!(key in source)) {
      console.log(`⚠️ Extra in Arabic (Not in English): ${fullPath}`);
      extraCount++;
    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      reportExtraKeys(source[key], target[key], fullPath);
    }
  });
}

/**
 * Performs a deep sync of target from source.
 * This is an "Exclusive Sync": it only keeps keys present in the source.
 */
function getSyncedData(source, target) {
  // If source is not an object or is an array, we just return the source as the new value
  // (unless we want to preserve the target value if it exists and types match)
  if (typeof source !== 'object' || source === null || Array.isArray(source)) {
    return (typeof target === typeof source) ? target : source;
  }

  const synced = {};
  
  Object.keys(source).forEach(key => {
    if (!(key in target)) {
      // Key is missing in target, use source value (English placeholder)
      synced[key] = source[key]; 
    } else {
      // Key exists in both, recurse if it's an object
      synced[key] = getSyncedData(source[key], target[key]);
    }
  });
  
  return synced;
}

console.log("--- 🔍 i18n Sync Report ---");
reportMissingKeys(en, ar);
reportExtraKeys(en, ar);

console.log(`\nResults: ${missingCount} Missing | ${extraCount} Extra | ${mismatchCount} Mismatched`);

// Auto-sync with cleanup
const updatedAr = getSyncedData(en, ar);
fs.writeFileSync(arPath, JSON.stringify(updatedAr, null, 2), 'utf8');

console.log("\n✅ ar.json has been synced.");
console.log("- Missing keys were filled with English placeholders.");
console.log("- Extra (stale) keys were removed to keep the translation clean.");
