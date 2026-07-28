const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'src', 'pages', 'student');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Convert `<div style={{ display: 'flex', gap: '...' }}>` to include `flexWrap: 'wrap'` on mobile via class
  // Strategy: Find any `display: 'flex'` that doesn't have `flexWrap: 'wrap'` and give it className="mobile-wrap"
  // We have to be careful not to break existing classNames.
  
  content = content.replace(/<div([^>]*)style=\{\{([^}]*display:\s*'flex'[^}]*)\}\}/g, (match, beforeStyle, styleContent) => {
      // If it already wraps, skip
      if (styleContent.includes("flexWrap: 'wrap'") || styleContent.includes("flexWrap:\"wrap\"") || styleContent.includes('flexWrap:"wrap"')) {
          return match;
      }
      
      // If it's explicitly flexShrink: 0 or has a fixed width, maybe we don't wrap it, but wrapping is safer for generic rows.
      // Better yet, just add className="mobile-wrap"
      
      let newBefore = beforeStyle;
      if (newBefore.includes('className=')) {
          newBefore = newBefore.replace(/className=(["'{])([^"'}]+)(["'}])/, (m, p1, p2, p3) => {
              if (!p2.includes('mobile-wrap')) {
                  return `className=${p1}${p2} mobile-wrap${p3}`;
              }
              return m;
          });
      } else {
          newBefore = `className="mobile-wrap" ${newBefore}`;
      }
      return `<div${newBefore}style={{${styleContent}}}`;
  });

  // 2. Reduce padding inside glass-card on mobile. My index.css handles `.glass-card`.
  
  if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', path.basename(filePath));
  }
}

fs.readdirSync(DIR).forEach(file => {
  if (file.endsWith('.jsx')) {
    processFile(path.join(DIR, file));
  }
});

console.log('Done.');
