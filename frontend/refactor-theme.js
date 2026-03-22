const fs = require('fs');
const path = require('path');

const directories = [
  'C:/Users/USER/Desktop/company-app/frontend/src/pages',
  'C:/Users/USER/Desktop/company-app/frontend/src/pages/admin',
  'C:/Users/USER/Desktop/company-app/frontend/src/components'
];

const replacements = [
  // Backgrounds
  { regex: /background:\s*(['"])#f0f4f8\1/g, replace: "background: 'var(--bg-main, #f0f4f8)'" },
  { regex: /backgroundColor:\s*(['"])#f0f4f8\1/g, replace: "backgroundColor: 'var(--bg-main, #f0f4f8)'" },
  { regex: /background:\s*(['"])white\1/g, replace: "background: 'var(--bg-card, white)'" },
  { regex: /backgroundColor:\s*(['"])white\1/g, replace: "backgroundColor: 'var(--bg-card, white)'" },
  { regex: /background:\s*(['"])#f8fafc\1/g, replace: "background: 'var(--bg-light, #f8fafc)'" },
  { regex: /background:\s*(['"])#ffffff\1/gi, replace: "background: 'var(--bg-card, #ffffff)'" },
  { regex: /background:\s*"(white)"/g, replace: 'background: "var(--bg-card, white)"' },

  // Text Colors
  { regex: /color:\s*(['"])#0f172a\1/g, replace: "color: 'var(--text-main, #0f172a)'" },
  { regex: /color:\s*(['"])#1e293b\1/g, replace: "color: 'var(--text-main, #1e293b)'" },
  { regex: /color:\s*(['"])#334155\1/g, replace: "color: 'var(--text-muted, #334155)'" },
  { regex: /color:\s*(['"])#475569\1/g, replace: "color: 'var(--text-muted, #475569)'" },
  { regex: /color:\s*(['"])#64748b\1/g, replace: "color: 'var(--text-muted, #64748b)'" },
  { regex: /color:\s*(['"])#94a3b8\1/g, replace: "color: 'var(--text-lighter, #94a3b8)'" },
  { regex: /color:\s*(['"])#000000\1/g, replace: "color: 'var(--text-main, #000000)'" },
  { regex: /color:\s*(['"])black\1/gi, replace: "color: 'var(--text-main, black)'" },

  // Borders
  { regex: /border:\s*(['"])1px solid #e2e8f0\1/g, replace: "border: '1px solid var(--border-color, #e2e8f0)'" },
  { regex: /border:\s*(['"])1.5px solid #e2e8f0\1/g, replace: "border: '1.5px solid var(--border-color, #e2e8f0)'" },
  { regex: /borderBottom:\s*(['"])1px solid #e2e8f0\1/g, replace: "borderBottom: '1px solid var(--border-color, #e2e8f0)'" },
  { regex: /borderTop:\s*(['"])1px solid #e2e8f0\1/g, replace: "borderTop: '1px solid var(--border-color, #e2e8f0)'" },
  { regex: /borderRight:\s*(['"])1px solid #e2e8f0\1/g, replace: "borderRight: '1px solid var(--border-color, #e2e8f0)'" },
  { regex: /borderLeft:\s*(['"])1px solid #e2e8f0\1/g, replace: "borderLeft: '1px solid var(--border-color, #e2e8f0)'" },
  { regex: /borderColor:\s*(['"])#e2e8f0\1/g, replace: "borderColor: 'var(--border-color, #e2e8f0)'" },
  { regex: /border:\s*(['"])1px solid #f1f5f9\1/g, replace: "border: '1px solid var(--border-light, #f1f5f9)'" },
  { regex: /borderBottom:\s*(['"])1px solid #f1f5f9\1/g, replace: "borderBottom: '1px solid var(--border-light, #f1f5f9)'" },
];

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      replacements.forEach(r => {
        content = content.replace(r.regex, r.replace);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

directories.forEach(processDirectory);
console.log('Theme refactor complete.');
