const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace the buggy Material Symbols URL with the clean exact one
      content = content.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined[^"']+/g, 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`Updated: ${fullPath}`);
    }
  }
}

processDir(publicDir);
console.log('All icons fixed.');
