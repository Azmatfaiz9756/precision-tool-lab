import fs from 'fs';
import path from 'path';

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.jsx')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('<img')) {
        console.log(full.replace(/\\/g, '/'));
      }
    }
  });
}

walk('src');
