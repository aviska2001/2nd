#!/usr/bin/env node

/**
 * CloudLinux Deployment Preparation Script
 * 
 * This script prepares the application for CloudLinux NodeJS Selector deployment
 * by removing the local node_modules directory and ensuring the application
 * is ready for the symlink-based module management.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing application for CloudLinux NodeJS Selector deployment...\n');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  console.log('📁 Found local node_modules directory');
  console.log('⚠️  CloudLinux NodeJS Selector requires node_modules to be a symlink');
  console.log('   managed by the virtual environment.\n');
  
  console.log('💡 To prepare for deployment:');
  console.log('   1. Remove the local node_modules directory');
  console.log('   2. Upload application files (excluding node_modules)');
  console.log('   3. Configure NodeJS Selector in cPanel');
  console.log('   4. Dependencies will be installed automatically\n');
  
  console.log('⚡ Would you like to remove node_modules now? (Manual action required)');
  console.log('   Run: rmdir /s node_modules (Windows) or rm -rf node_modules (Linux/Mac)\n');
} else {
  console.log('✅ No local node_modules directory found');
  console.log('✅ Application is ready for CloudLinux NodeJS Selector deployment\n');
}

// Check package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('📋 Package.json analysis:');
  console.log(`   - Name: ${packageJson.name}`);
  console.log(`   - Version: ${packageJson.version}`);
  
  if (packageJson.engines) {
    console.log(`   - Node.js requirement: ${packageJson.engines.node || 'Not specified'}`);
  } else {
    console.log('   - ⚠️  Consider adding "engines" field for Node.js version requirement');
  }
  
  console.log(`   - Main startup script: ${packageJson.scripts?.start || 'Not specified'}`);
  console.log(`   - Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
  console.log(`   - Dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}\n`);
}

console.log('📖 For detailed deployment instructions, see CLOUDLINUX_DEPLOYMENT.md');
console.log('🎯 Application should be deployed with server.js as the startup file');
