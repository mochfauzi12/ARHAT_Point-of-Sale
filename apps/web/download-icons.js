const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

const run = async () => {
  if (!fs.existsSync('public/icons')) {
    fs.mkdirSync('public/icons', { recursive: true });
  }
  console.log('Downloading icons...');
  await download('https://placehold.co/192x192/0f766e/ffffff.png?text=TK', 'public/icons/icon-192x192.png');
  await download('https://placehold.co/512x512/0f766e/ffffff.png?text=TK', 'public/icons/icon-512x512.png');
  console.log('Done!');
};

run();
