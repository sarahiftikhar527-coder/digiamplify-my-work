const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

const DIRS = [
  path.resolve(__dirname, 'frontend/src'),
  path.resolve(__dirname, 'backend/src')
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
        let content = fs.readFileSync(filePath, 'utf8');
        try {
          const cleanContent = strip(content);
          fs.writeFileSync(filePath, cleanContent, 'utf8');
          console.log(`Comments successfully removed from: ${filePath}`);
        } catch (e) {
          console.error(`Failed to process ${filePath}:`, e);
        }
      }
    }
  }
}

for (const dir of DIRS) {
  if (fs.existsSync(dir)) {
    console.log(`Starting comment stripping in directory: ${dir}`);
    processDirectory(dir);
  } else {
    console.warn(`Directory not found: ${dir}`);
  }
}
console.log('Successfully completed comment stripping for all frontend and backend source code.');
