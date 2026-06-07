const fs = require('fs');

const src = 'C:\\Users\\berni\\.gemini\\antigravity\\brain\\76349a7c-84cf-4cf5-84d2-621e63e0ab8a\\media__1780805813510.png';
const targets = [
  'd:\\ARHAT POS\\apps\\web\\public\\icons\\icon-192x192.png',
  'd:\\ARHAT POS\\apps\\web\\public\\icons\\icon-512x512.png',
  'd:\\ARHAT POS\\apps\\web\\src\\app\\icon.png'
];

try {
  for (const t of targets) {
    fs.copyFileSync(src, t);
    console.log('Copied to', t);
  }
  if (fs.existsSync('d:\\ARHAT POS\\apps\\web\\src\\app\\favicon.ico')) {
    fs.unlinkSync('d:\\ARHAT POS\\apps\\web\\src\\app\\favicon.ico');
    console.log('Deleted favicon.ico');
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
