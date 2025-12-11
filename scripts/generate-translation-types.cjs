#!/usr/bin/env node
/**
 * Generate TypeScript types from JSON translation files
 * No external dependencies required - uses Node.js built-in modules only
 * 
 * Usage:
 *   node scripts/generate-translation-types.cjs
 *   node scripts/generate-translation-types.cjs --watch
 *   ./scripts/generate.sh
 *   ./scripts/generate-watch.sh
 */

const fs = require('fs');
const path = require('path');

// Load config
const CONFIG_PATH = path.join(__dirname, 'config.json');
let config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (error) {
  console.error('❌ Error reading config.json:', error.message);
  process.exit(1);
}

// Resolve paths (relative to project root)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.resolve(PROJECT_ROOT, config.localesDir);
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, config.outputDir);
const OUTPUT_FILE = path.join(OUTPUT_DIR, config.outputFile);

function flattenKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Nested object - recurse
        keys.push(...flattenKeys(obj[key], fullKey));
      } else {
        // Leaf node - add key
        keys.push(fullKey);
      }
    }
  }
  
  return keys.sort(); // Sort alphabetically
}

function generateTypes(config) {
  try {
    // Read source locale JSON
    const sourceJsonPath = path.join(LOCALES_DIR, `${config.sourceLocale}.json`);
    
    if (!fs.existsSync(sourceJsonPath)) {
      throw new Error(`Source locale file not found: ${sourceJsonPath}`);
    }
    
    const sourceJson = JSON.parse(fs.readFileSync(sourceJsonPath, 'utf8'));
    
    // Flatten keys
    const keys = flattenKeys(sourceJson);
    
    if (keys.length === 0) {
      console.warn('⚠️  No translation keys found');
      return;
    }
    
    // Generate type definition
    const typeDefinition = `// Auto-generated file. Do not edit manually.
// Generated at: ${new Date().toISOString()}
// Run: node scripts/generate-translation-types.cjs
// Config: ${CONFIG_PATH}

export type TranslationKey = 
${keys.map(key => `  | '${key}'`).join('\n')};

// Union type for easier use
export type TranslationKeyUnion = ${keys.map(key => `'${key}'`).join(' | ')};

// Module augmentation cho react-i18next (tự động gợi ý khi dùng useTranslation)
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: Record<TranslationKey, string>;
    };
  }
}

// Module augmentation cho next-intl (tự động gợi ý khi dùng useTranslations)
declare module 'next-intl' {
  interface Messages extends Record<TranslationKey, string> {}
}

${config.namespace ? `
declare module '${config.namespace}' {
  interface Messages {
    [key: string]: any;
  }
}
` : ''}

// Global type declaration (optional)
declare global {
  namespace TranslationKeys {
    type Key = TranslationKey;
  }
}
`;

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write file
    fs.writeFileSync(OUTPUT_FILE, typeDefinition, 'utf8');
    
    console.log(`✅ Generated ${keys.length} translation keys`);
    console.log(`📁 Source: ${sourceJsonPath}`);
    console.log(`📝 Output: ${OUTPUT_FILE}`);
    console.log(`\n💡 Usage:`);
    console.log(`   import type { TranslationKey } from '@/types/translations';`);
    
  } catch (error) {
    console.error('❌ Error generating types:', error.message);
    process.exit(1);
  }
}

// Watch mode using fs.watch (built-in)
function watchMode(config) {
  console.log('\n👀 Watching for changes... (Press Ctrl+C to stop)');
  
  fs.watch(LOCALES_DIR, { recursive: false }, (eventType, filename) => {
    if (filename && filename.endsWith('.json')) {
      console.log(`\n📝 ${filename} changed, regenerating...`);
      generateTypes(config);
    }
  });
  
  // Also watch the directory itself
  fs.watchFile(path.join(LOCALES_DIR, `${config.sourceLocale}.json`), { interval: 1000 }, () => {
    console.log(`\n📝 ${config.sourceLocale}.json changed, regenerating...`);
    generateTypes(config);
  });
}

// Main execution
function main() {
  generateTypes(config);
  
  // Watch mode (optional)
  if (config.enableWatch && process.argv.includes('--watch')) {
    watchMode(config);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateTypes, flattenKeys };

