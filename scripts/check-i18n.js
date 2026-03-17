import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '../src/i18n/en.json');
const arPath = path.join(__dirname, '../src/i18n/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

let missingCount = 0;
let extraCount = 0;
let mismatchCount = 0;

function syncCheck(source, target, currentPath = '', mode = 'missing') {
  Object.keys(source).forEach(key => {
    const fullPath = currentPath ? `${currentPath}.${key}` : key;
    
    if (!(key in target)) {
      if (mode === 'missing') {
        console.log(`❌ Missing in Arabic: ${fullPath}`);
        missingCount++;
      } else {
        console.log(`⚠️ Extra in Arabic (Not in English): ${fullPath}`);
        extraCount++;
      }
    } else if (typeof source[key] !== typeof target[key]) {
      // Catch type mismatches (e.g., string vs object)
      console.log(`‼️ Type Mismatch at: ${fullPath} (${typeof source[key]} vs ${typeof target[key]})`);
      mismatchCount++;
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      syncCheck(source[key], target[key], fullPath, mode);
    }
  });
}

function getSyncedData(source, target) {
  // Clone the target to avoid mutating the original until we are ready
  const synced = Array.isArray(target) ? [...target] : { ...target };
  
  Object.keys(source).forEach(key => {
    if (!(key in target)) {
      // Key is missing, fill with English value as a placeholder
      synced[key] = source[key]; 
    } else if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      // Recursively sync nested objects
      synced[key] = getSyncedData(source[key], target[key]);
    }
  });
  
  return synced;
}

console.log("--- 🔍 i18n Sync Report ---");
syncCheck(en, ar, '', 'missing'); // Check what Arabic is missing
syncCheck(ar, en, '', 'extra');   // Check what Arabic has that English doesn't

console.log(`\nResults: ${missingCount} Missing | ${extraCount} Extra | ${mismatchCount} Mismatched`);

// Auto-sync
const updatedAr = getSyncedData(en, ar);
fs.writeFileSync(arPath, JSON.stringify(updatedAr, null, 2), 'utf8');
console.log("\n✅ ar.json has been synced. Missing keys filled with English placeholders.");
