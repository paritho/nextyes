const path = require('path');

module.exports = {
  entry: {
    index: "./src/index.js",
    content: "./src/content.js",
    note:"./src/notes.js"
  },
  output: {
    path: path.resolve(__dirname, 'public/assets/js'),
    filename: '[name]-bundle.js'
  }
}