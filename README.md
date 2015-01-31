[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

# node-cp

`cp -r` for Node.js

Install with `npm install node-cp`

## API

`cp(source, destination, callback)`

The callback will be called with an error if there is one and with an nested array of copied files names

## Usage

Usage of `node-cp` is simple

```javascript
var cp = require('node-cp');

cp(source, destination, function (err, files) {
 if (err) {
   return console.error(err);
 }
 console.log('Copied files', files);
});
```

# License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/node-cp.svg?style=flat
[npm-url]: https://www.npmjs.com/package/node-cp
[travis-image]: https://img.shields.io/travis/Adezandee/node-cp.svg?style=flat
[travis-url]: https://travis-ci.org/Adezandee/node-cp
[coveralls-image]: https://img.shields.io/coveralls/Adezandee/node-cp.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Adezandee/node-cp?branch=master
