const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'Contact.jsx');
let content = fs.readFileSync(filePath, 'utf8');
console.log('BEFORE:', content.substring(0, 150));

content = content.split('base44Client').join('apiClient');
content = content.replace(/\bbase44\b/g, 'apiClient');

fs.writeFileSync(filePath, content, 'utf8');

const after = fs.readFileSync(filePath, 'utf8');
console.log('AFTER:', after.substring(0, 150));
