const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 Building DRONE WAR for Toss Apps-in-Toss...');

// 1. Webpack으로 SDK 번들링
console.log('🔧 Bundling Toss SDK with webpack...');
try {
    execSync('npx webpack --config webpack.config.js', { stdio: 'inherit' });
    console.log('✅ Webpack bundle created');
} catch (error) {
    console.error('❌ Webpack build failed:', error.message);
    process.exit(1);
}

// 2. dist-webpack에서 dist로 파일 복사
const webpackDistDir = path.join(__dirname, 'dist-webpack');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// 재귀 복사 함수
function copyRecursive(src, dest) {
    if (fs.existsSync(src)) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        fs.readdirSync(src).forEach(item => {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);

            if (fs.lstatSync(srcPath).isDirectory()) {
                copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
}

// webpack 출력물을 dist로 복사
copyRecursive(webpackDistDir, distDir);
console.log('✅ Copied webpack output to dist/');

console.log('✅ Build complete! Files ready in dist/');
