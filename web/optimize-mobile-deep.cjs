const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'src', 'pages', 'student');

function addClass(tagMatch, beforeStyle, classNameToAdd, styleContent) {
    let newBefore = beforeStyle;
    if (newBefore.includes('className=')) {
        newBefore = newBefore.replace(/className=(["'{])([^"'}]+)(["'}])/, (m, p1, p2, p3) => {
            if (!p2.includes(classNameToAdd)) {
                return `className=${p1}${p2} ${classNameToAdd}${p3}`;
            }
            return m;
        });
    } else {
        newBefore = `className="${classNameToAdd}" ${newBefore}`;
    }
    return `<div${newBefore}style={{${styleContent}}}`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Any container with `gap: 12`, `gap: 14`, `gap: 16`, `gap: 20`, or `gap: 24` that is explicitly NOT wrapping.
  // We want to add `mobile-wrap` to them, to prevent squishing on mobile.
  // Exception: if it's already wrapped, or if it has `alignItems: 'center'` with just a few small items (like an icon and text).
  // Actually, a safer pattern is adding `.mobile-wrap` to `<div style={{ display: 'flex', gap: '1rem' }}>` 
  
  // Let's add `.mobile-wrap` to flex containers with `justifyContent: 'space-between'` since those often squish!
  content = content.replace(/<div([^>]*)style=\{\{([^}]*display:\s*'flex'[^}]*justifyContent:\s*'space-between'[^}]*)\}\}/g, (match, beforeStyle, styleContent) => {
      // Don't add if it already has wrap
      if (styleContent.includes('wrap')) return match;
      return addClass(match, beforeStyle, 'mobile-wrap', styleContent);
  });

  // Let's add `.mobile-wrap` to the top Search + Filter bar on pages (usually gap: 12 or 16)
  content = content.replace(/<div([^>]*)style=\{\{([^}]*display:\s*'flex'[^}]*gap:\s*(12|16|20|24|'1rem'|'1.5rem')[^}]*)\}\}/g, (match, beforeStyle, styleContent) => {
      // Don't add if it already has wrap or column direction
      if (styleContent.includes('wrap') || styleContent.includes('column')) return match;
      return addClass(match, beforeStyle, 'mobile-wrap', styleContent);
  });

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
