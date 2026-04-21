const Jimp = require('jimp');

Jimp.read('public/logo.png')
  .then(image => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red   = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue  = this.bitmap.data[idx + 2];
      
      // if it's very close to white
      if (red > 235 && green > 235 && blue > 235) {
        this.bitmap.data[idx + 3] = 0; // alpha to 0
      }
    });
    
    return image.writeAsync('public/logo.png');
  })
  .then(() => console.log('Background removed!'))
  .catch(err => {
    console.error(err);
  });
