const fs = require('fs');
const path = require('path');

// Path to the original documentation file
const sourcePath = path.join(process.cwd(), '..', 'd2lang-llms-full.txt');

// Path where we want to save our copy
const destPath = path.join(__dirname, 'documentation.txt');

console.log('Setting up D2 Diagram Assistant MCP server...');

try {
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found at: ${sourcePath}`);
    process.exit(1);
  }

  // Copy the file
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Documentation file successfully copied to: ${destPath}`);
  
  console.log('Setup complete! You can now start the server with:');
  console.log('node index.js');
  console.log('For stdio mode, use: node index.js --stdio');
} catch (error) {
  console.error('Error during setup:', error);
  process.exit(1);
}