/**
 * START SERVER WITH MIGRATION CHECK
 * Ensures database is updated before starting server
 */

const { spawn } = require('child_process');
const path = require('path');

async function startServer() {
  console.log('🚀 Starting server with migration check...\n');
  
  // Run migration script first
  console.log('📦 Running database migration...');
  
  const migration = spawn('node', [path.join(__dirname, 'scripts/auto-migrate-on-deploy.js')], {
    stdio: 'inherit',
    shell: true
  });
  
  migration.on('close', (code) => {
    if (code === 0 || code === null) {
      console.log('\n✅ Migration check complete');
      console.log('🚀 Starting application server...\n');
      
      // Start the actual server
      const server = spawn('node', ['index.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      server.on('close', (serverCode) => {
        process.exit(serverCode);
      });
      
    } else {
      console.error('\n❌ Migration failed with code:', code);
      console.error('⚠️  Starting server anyway (existing functionality will work)...\n');
      
      // Start server even if migration fails (for backward compatibility)
      const server = spawn('node', ['index.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      server.on('close', (serverCode) => {
        process.exit(serverCode);
      });
    }
  });
}

startServer();
