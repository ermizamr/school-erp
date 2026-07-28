const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'src', 'pages', 'student');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Wrap tables with responsive div if not already wrapped
  if (!content.includes('table-responsive')) {
      content = content.replace(/(<table[^>]*>[\s\S]*?<\/table>)/g, '<div className="table-responsive" style={{ overflowX: "auto", width: "100%", WebkitOverflowScrolling: "touch" }}>$1</div>');
  }

  // 2. Specific fix for StudentMessages flex layout
  if (filePath.endsWith('StudentMessages.jsx')) {
      content = content.replace(
          /display:\s*'flex',\s*height:\s*'calc\(100vh\s*-\s*56px\)'/,
          `display: 'flex', flexWrap: 'wrap', minHeight: 'calc(100vh - 56px)'`
      );
      content = content.replace(
          /width:\s*320,\s*flexShrink:\s*0/,
          `flex: '1 1 320px', minWidth: 320`
      );
      content = content.replace(
          /flex:\s*1,\s*display:\s*'flex',\s*flexDirection:\s*'column'/,
          `flex: '2 1 400px', minWidth: 320, display: 'flex', flexDirection: 'column'`
      );
  }

  // 3. Fix StudentAttendance calendar header to not squish too small
  if (filePath.endsWith('StudentAttendance.jsx')) {
      content = content.replace(
          /display:'grid',gridTemplateColumns:'repeat\(7,1fr\)'/g,
          `display:'grid',gridTemplateColumns:'repeat(7,minmax(35px,1fr))'`
      );
      // Wrap the calendar grid in an overflow container
      if (content.includes('border:\'1px solid var(--border-color)\',borderRadius:12,overflow:\'hidden\'')) {
          content = content.replace(
            /border:'1px solid var\(--border-color\)',borderRadius:12,overflow:'hidden'/g,
            `border:'1px solid var(--border-color)',borderRadius:12,overflowX:'auto'`
          );
      }
  }

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
