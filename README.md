# JavaScript string escape [![Build status](https://travis-ci.org/mathiasbynens/javascript-string-escape.png?branch=master)](https://travis-ci.org/mathiasbynens/javascript-string-escape) [![Dependency status](https://gemnasium.com/mathiasbynens/javascript-string-escape.png)](https://gemnasium.com/mathiasbynens/javascript-string-escape)

This is a JavaScript library for escaping JavaScript strings while generating the shortest possible valid output.

Feel free to fork if you see possible improvements!

## Installation

In a browser:

```html
<script src="string-escape.js"></script>
```

Via [npm](http://npmjs.org/):

```bash
npm install string-escape
```

In [Narwhal](http://narwhaljs.org/), [Node.js](http://nodejs.org/), and [RingoJS](http://ringojs.org/):

```js
var stringEscape = require('string-escape');
```

In [Rhino](http://www.mozilla.org/rhino/):

```js
load('string-escape.js');
```

Using an AMD loader like [RequireJS](http://requirejs.org/):

```js
require(
  {
    'paths': {
      'string-escape': 'path/to/string-escape'
    }
  },
  ['string-escape'],
  function(stringEscape) {
    console.log(stringEscape);
  }
);
```

## API

### `stringEscape(string, options)`

This function takes a string and returns an escaped version of the string where any characters that are not printable ASCII symbols are escaped using the shortest possible (but valid) [escape sequences for use in JavaScript strings](http://mathiasbynens.be/notes/javascript-escapes).

```js
stringEscape('Ich ♥ Bücher');
// → 'Ich \\u2665 B\\xFCcher'

stringEscape('foo 𝌆 bar');
// → 'foo \\uD834\\uDF06 bar'
```

The optional `options` argument accepts an object with the following options:

#### `quotes`

The default value for the `quotes` option is `'single'`. This means that any occurences of `'` in the input string will be escaped as `\'`, so that the output can be used in a string literal wrapped in single quotes.

```js
stringEscape('Lorem ipsum "dolor" sit \'amet\' etc.');
// → 'Lorem ipsum "dolor" sit \\\'amet\\\' etc.'

stringEscape('Lorem ipsum "dolor" sit \'amet\' etc.', {
  'quotes': 'single'
});
// → 'Lorem ipsum "dolor" sit \\\'amet\\\' etc.'
// → "Lorem ipsum \"dolor\" sit \\'amet\\' etc."
```

If you want to use the output as part of a string literal wrapped in double quotes, set the `quotes` option to `'double'`.

```js
stringEscape('Lorem ipsum "dolor" sit \'amet\' etc.', {
  'quotes': 'double'
});
// → 'Lorem ipsum \\"dolor\\" sit \'amet\' etc.'
// → "Lorem ipsum \\\"dolor\\\" sit 'amet' etc."
```

#### `wrap`

The `wrap` option takes a boolean value (`true` or `false`), and defaults to `false` (disabled). When enabled, the output will be a valid JavaScript string literal wrapped in quotes. The type of quotes can be specified through the `quotes` setting.

```js
stringEscape('Lorem ipsum "dolor" sit \'amet\' etc.', {
  'quotes': 'single',
  'wrap': true
});
// → '\'Lorem ipsum "dolor" sit \\\'amet\\\' etc.\''
// → "\'Lorem ipsum \"dolor\" sit \\\'amet\\\' etc.\'"

stringEscape('Lorem ipsum "dolor" sit \'amet\' etc.', {
  'quotes': 'double',
  'wrap': true
});
// → '"Lorem ipsum \\"dolor\\" sit \'amet\' etc."'
// → "\"Lorem ipsum \\\"dolor\\\" sit \'amet\' etc.\""
```

### `stringEscape.version`

A string representing the semantic version number.

## Support

This library has been tested in at least Chrome 27-29, Firefox 3-22, Safari 4-6, Opera 10-12, IE 6-10, Node.js v0.10.0, Narwhal 0.3.2, RingoJS 0.8-0.9, PhantomJS 1.9.0, and Rhino 1.7RC4.

## Unit tests & code coverage

After cloning this repository, run `npm install` to install the dependencies needed for development and testing. You may want to install Istanbul _globally_ using `npm install istanbul -g`.

Once that’s done, you can run the unit tests in Node using `npm test` or `node tests/tests.js`. To run the tests in Rhino, Ringo, Narwhal, and web browsers as well, use `grunt test`.

To generate [the code coverage report](http://rawgithub.com/mathiasbynens/javascript-string-escape/master/coverage/string-escape/string-escape.js.html), use `grunt cover`.

## Author

| [![twitter/mathias](http://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](http://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](http://mathiasbynens.be/) |

## License

This library is dual licensed under the [MIT](http://mths.be/mit) and [GPL](http://mths.be/gpl) licenses.
