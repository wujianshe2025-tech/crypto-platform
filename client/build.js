const fs = require('fs');
const path = require('path');

// 创建 dist 目录
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// 复制 index.html
console.log('Copying index.html...');
fs.copyFileSync('index.html', 'dist/index.html');

// 复制其他 HTML 文件（如果有）
const htmlFiles = ['predictions.html', 'test-wallet.html'];
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`Copying ${file}...`);
    fs.copyFileSync(file, `dist/${file}`);
  }
});

console.log('Build completed! Files are in dist/ directory');
