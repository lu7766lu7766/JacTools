const path = require('path');
const babel = require('rollup-plugin-babel');

const resolveFile = function(filePath) {
  return path.join(__dirname, '.', filePath)
}

module.exports = {
  input: resolveFile('index.js'),
  output: {
    file: resolveFile('dist/index.js'),
    name: 'index',
    format: 'es',
  },
  plugins: [
    babel({
      "presets": [
        ["@babel/preset-env", {
          "modules": false
        }],
      ]
    }),
  ],
}