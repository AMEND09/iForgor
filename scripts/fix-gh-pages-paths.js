const fs = require('fs');
const path = require('path');

const pkg = require(path.join(__dirname, '..', 'package.json'));
const homepage = pkg.homepage || '';
const outDir = path.join(__dirname, '..', 'web-build');
const indexFile = path.join(outDir, 'index.html');
const filesToFix = [indexFile];

if (!fs.existsSync(indexFile)) {
  console.error('web-build/index.html not found — run the web build first');
  process.exit(1);
}

const replaceInFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // If homepage is set to a subpath like https://user.github.io/repo, ensure assets reference that base
  if (homepage) {
    const homepageRoot = homepage.replace(/\/$/, ''); // no trailing slash
    // Replace absolute domain root references (e.g. https://user.github.io/_expo) to include repo path
    content = content.replace(/https:\/\/[^\/]+\//g, (match) => {
      // Only replace domain root if it points to the same host as homepage
      if (match.indexOf(homepageRoot.split('//')[1].split('/')[0]) !== -1) {
        return homepageRoot + '/';
      }
      return match;
    });

    // Replace leading '/_expo' or '/static' occurrences to use homepage root
    // Use a function replacement to avoid accidental $n literal insertion
    content = content.replace(/(=["'])(\/(?:_expo|static|manifest.webmanifest))/g, (match, p1, p2) => {
      return `${p1}${homepageRoot}${p2}`;
    });

    // Also replace occurrences of src="/_expo to homepage/_expo
    content = content.replace(/src=\"\/_expo/g, `src=\"${homepageRoot}/_expo`);
    content = content.replace(/href=\"\/_expo/g, `href=\"${homepageRoot}/_expo`);
    content = content.replace(/src=\"\/static/g, `src=\"${homepageRoot}/static`);
    content = content.replace(/href=\"\/static/g, `href=\"${homepageRoot}/static`);
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed paths in', file);
};

filesToFix.forEach(replaceInFile);

// ensure SPA fallback exists
const out404 = path.join(outDir, '404.html');
fs.copyFileSync(indexFile, out404);
console.log('Copied index.html -> 404.html');

console.log('done');
