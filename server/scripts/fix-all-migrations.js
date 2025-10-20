#!/usr/bin/env node
'use strict';

/**
 * Script to add dependency guards to all migrations that reference base tables
 * Run with: node scripts/fix-all-migrations.js
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '..', 'migrations');
const baseTables = ['users', 'companies', 'jobs', 'job_applications', 'resumes', 'educations', 'work_experiences', 'agency_client_authorizations'];

// Files to skip (already have base table creation or already fixed)
const skipFiles = [
  '20250810113802-users.js',           // Creates users
  '20250810113803-companies.js',       // Creates companies  
  '20250810113804-jobs.js',            // Creates jobs
  '20241220000001-create-job-preferences.js', // Already fixed
  '20250110000002-create-agency-client-authorizations.js', // Already fixed
  '20250110000000-add-professional-details-to-users.js', // Already fixed
  '20250110000001-add-agency-system-companies.js', // Already fixed
  '20250110000003-add-agency-fields-to-jobs.js' // Already fixed
];

function detectDependencies(content) {
  const deps = [];
  
  // Check for ALTER TABLE or addColumn on base tables
  baseTables.forEach(table => {
    if (content.includes(`ALTER TABLE "public"."${table}"`) ||
        content.includes(`ALTER TABLE "${table}"`) ||
        content.includes(`ALTER TABLE '${table}'`) ||
        content.includes(`addColumn('${table}'`) ||
        content.includes(`addColumn("${table}")`) ||
        content.includes(`removeColumn('${table}'`) ||
        content.includes(`removeColumn("${table}")`)) {
      deps.push(table);
    }
  });
  
  return [...new Set(deps)]; // unique
}

function hasGuard(content) {
  return content.includes('showAllTables()') && content.includes('Skipping');
}

function addGuard(content, deps) {
  const depsCheck = deps.map(t => `!normalized.includes('${t}')`).join(' || ');
  const depsList = deps.join(', ');
  
  const guard = `    // Guard: skip if dependent tables don't exist yet
    const tables = await queryInterface.showAllTables();
    const normalized = Array.isArray(tables)
      ? tables.map((t) => (typeof t === 'string' ? t : t.tableName || t)).map((n) => String(n).toLowerCase())
      : [];
    
    if (${depsCheck}) {
      console.log('ℹ️  Skipping migration (${depsList} not created yet)');
      return;
    }

`;

  // Insert guard right after "async up(queryInterface, Sequelize) {" but before transaction
  const upMatch = content.match(/(async up\s*\([^)]+\)\s*\{\s*\n)/);
  if (upMatch) {
    const insertPos = upMatch.index + upMatch[0].length;
    return content.slice(0, insertPos) + guard + content.slice(insertPos);
  }
  
  return content;
}

async function main() {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js'));
  
  console.log(`🔍 Scanning ${files.length} migration files...`);
  
  let fixed = 0;
  let skipped = 0;
  
  for (const file of files) {
    if (skipFiles.includes(file)) {
      skipped++;
      continue;
    }
    
    const filePath = path.join(migrationsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    const deps = detectDependencies(content);
    
    if (deps.length > 0 && !hasGuard(content)) {
      console.log(`✏️  Adding guard to ${file} (depends on: ${deps.join(', ')})`);
      content = addGuard(content, deps);
      fs.writeFileSync(filePath, content, 'utf-8');
      fixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} migrations`);
  console.log(`ℹ️  Skipped ${skipped} migrations (base tables or already fixed)`);
  console.log(`\n🚀 Run: npx sequelize-cli db:migrate`);
}

main().catch(console.error);

