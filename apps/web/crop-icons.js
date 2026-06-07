const Jimp = require('jimp');

async function processImage() {
  try {
    const src = 'C:\\Users\\berni\\.gemini\\antigravity\\brain\\76349a7c-84cf-4cf5-84d2-621e63e0ab8a\\media__1780805813510.png';
    const image = await Jimp.read(src);
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    // The text "TRANSAKSI KITA" is at the bottom. We'll crop out the bottom 25%
    const cropHeight = Math.floor(height * 0.75);
    
    // We also want to make it a square, centered
    const size = Math.min(width, cropHeight);
    const startX = Math.max(0, Math.floor((width - size) / 2));
    
    image.crop(startX, 0, size, size);
    
    // Create the icon versions
    const icon192 = image.clone().resize(192, 192);
    const icon512 = image.clone().resize(512, 512);
    
    await icon192.writeAsync('d:\\ARHAT POS\\apps\\web\\public\\icons\\icon-192x192.png');
    await icon512.writeAsync('d:\\ARHAT POS\\apps\\web\\public\\icons\\icon-512x512.png');
    await icon512.writeAsync('d:\\ARHAT POS\\apps\\web\\src\\app\\icon.png');
    
    console.log('Icons cropped and saved successfully');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
