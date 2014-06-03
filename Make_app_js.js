var fs = require('fs');
var Snockets = require('snockets');
var snockets = new Snockets();

var path = './src/js/app.js';
snockets.getConcatenation(path, { minify: false }, function(err, js) {
  if (err) console.error(err);
  fs.writeFile('./assets/app.js', js, function(err) {
    if (err) console.error(err);
  });
});
