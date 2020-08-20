const path = require('path');

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'bundle.js'
      },
      devServer:{
        contentBase: path.join(__dirname, 'public/'),
        port: 8000
      }
}