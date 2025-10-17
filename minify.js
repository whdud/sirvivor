const fs = require('fs');

// Read the HTML file
const html = fs.readFileSync('index.html', 'utf8');

// Basic minification
let minified = html
    // Remove HTML comments (but keep conditional comments)
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    // Remove multi-line comments in JS
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove single-line comments in JS (but not URLs like https://)
    .replace(/(?<!:)\/\/.*$/gm, '')
    // Remove excessive whitespace (but preserve single spaces)
    .replace(/\n\s*\n/g, '\n')
    // Remove leading/trailing whitespace on lines
    .replace(/^\s+/gm, '')
    .replace(/\s+$/gm, '')
    // Compress multiple spaces to single space
    .replace(/ {2,}/g, ' ');

// Write the minified version
fs.writeFileSync('index.min.html', minified);

const originalSize = Buffer.byteLength(html, 'utf8');
const minifiedSize = Buffer.byteLength(minified, 'utf8');
const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);

console.log(`Original: ${originalSize} bytes`);
console.log(`Minified: ${minifiedSize} bytes`);
console.log(`Reduction: ${reduction}%`);
