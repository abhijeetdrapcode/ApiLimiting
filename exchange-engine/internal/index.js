var UglifyJS = require('uglify-js');
var fs = require('fs');
var path = require('path');
try {
  ['dataLoader', 'drapcode', 'drapcode.body', 'utils', 'drapcode.modal', 'chat-bot'].forEach(
    (name) => {
      const oldCode = fs.readFileSync(path.resolve(__dirname, `./${name}.js`), 'utf8');
      var result = UglifyJS.minify(oldCode, {
        sourceMap: {
          filename: `${name}.js`,
          url: `${name}.js.map`,
        },
      });

      const { code } = result;
      fs.writeFileSync(path.resolve(__dirname, `../public/${name}.min.js`), code);
    },
  );
} catch (error) {
  console.error(error);
}

return;
