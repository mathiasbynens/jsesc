# JavaScript string escape [![Build status](https://travis-ci.org/mathiasbynens/javascript-string-escape.png?branch=master)](https://travis-ci.org/mathiasbynens/javascript-string-escape) [![Dependency status](https://gemnasium.com/mathiasbynens/javascript-string-escape.png)](https://gemnasium.com/mathiasbynens/javascript-string-escape)

This is a JavaScript library for escaping JavaScript strings while generating the shortest possible valid output. [Here’s an online demo.](http://mothereff.in/js-escapes)

Feel free to fork if you see possible improvements!

## Installation

Via [Bower](http://bower.io/):

```bash
bower install string-escape
```

Via [Component](https://github.com/component/component):

```bash
component install mathiasbynens/javascript-string-escape
```

Via [npm](http://npmjs.org/):

```bash
npm install string-escape
```

In a browser:

```html
<script src="string-escape.js"></script>
```

In [Node.js](http://nodejs.org/) and [RingoJS](http://ringojs.org/):

```js
var stringEscape = require('string-escape');
```

In [Narwhal](http://narwhaljs.org/):

```js
var stringEscape = require('string-escape').stringEscape;
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

### `stringEscape(value, options)`

This function takes a value and returns an escaped version of the value where any characters that are not printable ASCII symbols are escaped using the shortest possible (but valid) [escape sequences for use in JavaScript strings](http://mathiasbynens.be/notes/javascript-escapes). The first supported value type is strings:

```js
stringEscape('Ich ♥ Bücher');
// → 'Ich \\u2665 B\\xFCcher'

stringEscape('foo 𝌆 bar');
// → 'foo \\uD834\\uDF06 bar'
```

Instead of a string, the `value` can also be a flat object containing only string values. In that case, `stringEscape` will return a stringified version of the object where any characters that are not printable ASCII symbols are escaped in the same way.

```js
stringEscape({
  'Ich ♥ Bücher': 'foo 𝌆 bar'
});
// → '{\'Ich \\u2665 B\\xFCcher\':\'foo \\uD834\\uDF06 bar\'}'
```

Instead of a string or an object, the `value` can also be a flat array containing only string values. In that case, `stringEscape` will return a stringified version of the array where any characters that are not printable ASCII symbols are escaped in the same way.

```js
stringEscape([
  'Ich ♥ Bücher': 'foo 𝌆 bar'
]);
// → '[\'Ich \\u2665 B\\xFCcher\',\'foo \\uD834\\uDF06 bar\']'
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

This setting also affects the output for arrays and objects:

```js
stringEscape({ 'Ich ♥ Bücher': 'foo 𝌆 bar' }, {
  'quotes': 'double'
});
// → '{"Ich \\u2665 B\\xFCcher":"foo \\uD834\\uDF06 bar"}'

stringEscape([ 'Ich ♥ Bücher', 'foo 𝌆 bar' ], {
  'quotes': 'double'
});
// → '["Ich \\u2665 B\\xFCcher","foo \\uD834\\uDF06 bar"]'
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

#### `escapeEverything`

The `escapeEverything` option takes a boolean value (`true` or `false`), and defaults to `false` (disabled). When enabled, all the symbols in the output will be escaped, even printable ASCII symbols.

```js
stringEscape('lolwat"foo\'bar', {
  'escapeEverything': true
});
// → '\\x6C\\x6F\\x6C\\x77\\x61\\x74\\"\\x66\\x6F\\x6F\\\'\\x62\\x61\\x72'
// → "\\x6C\\x6F\\x6C\\x77\\x61\\x74\\\"\\x66\\x6F\\x6F\\'\\x62\\x61\\x72"
```

This setting also affects the output for arrays and objects:

```js
stringEscape({ 'Ich ♥ Bücher': 'foo 𝌆 bar' }, {
  'escapeEverything': true
});
// → '{\'\x49\x63\x68\x20\u2665\x20\x42\xFC\x63\x68\x65\x72\':\'\x66\x6F\x6F\x20\uD834\uDF06\x20\x62\x61\x72\'}'
// → "{'\x49\x63\x68\x20\u2665\x20\x42\xFC\x63\x68\x65\x72':'\x66\x6F\x6F\x20\uD834\uDF06\x20\x62\x61\x72'}"

stringEscape([ 'Ich ♥ Bücher': 'foo 𝌆 bar' ], {
  'escapeEverything': true
});
// → '[\'\x49\x63\x68\x20\u2665\x20\x42\xFC\x63\x68\x65\x72\',\'\x66\x6F\x6F\x20\uD834\uDF06\x20\x62\x61\x72\']'
```

#### `compact`

The `compact` option takes a boolean value (`true` or `false`), and defaults to `true` (enabled). When enabled, the output for arrays and objects will be as compact as possible; it won’t be formatted nicely.

```js
stringEscape({ 'Ich ♥ Bücher': 'foo 𝌆 bar' }, {
  'compact': true // this is the default
});
// → '{\'Ich \u2665 B\xFCcher\':\'foo \uD834\uDF06 bar\'}'

stringEscape({ 'Ich ♥ Bücher': 'foo 𝌆 bar' }, {
  'compact': false
});
// → '{\n\t\'Ich \u2665 B\xFCcher\': \'foo \uD834\uDF06 bar\'\n}'

stringEscape([ 'Ich ♥ Bücher', 'foo 𝌆 bar' ], {
  'compact': false
});
// → '[\n\t\'Ich \u2665 B\xFCcher\',\n\t\'foo \uD834\uDF06 bar\'\n]'
```

This setting has no effect on the output for strings.

#### `indent`

The `indent` option takes a string value, and defaults to `'\t'`. When the `compact` setting is enabled (`true`), the value of the `indent` option is used to format the output for arrays and objects.

```js
stringEscape({ 'Ich ♥ Bücher': 'foo 𝌆 bar' }, {
  'compact': false,
  'indent': '\t' // this is the default
});
// → '{\n\t\'Ich \u2665 B\xFCcher\': \'foo \uD834\uDF06 bar\'\n}'

stringEscape({ 'Ich ♥ Bücher': 'foo 𝌆 bar' }, {
  'compact': false,
  'indent': '  '
});
// → '{\n  \'Ich \u2665 B\xFCcher\': \'foo \uD834\uDF06 bar\'\n}'

stringEscape([ 'Ich ♥ Bücher', 'foo 𝌆 bar' ], {
  'compact': false,
  'indent': '  '
});
// → '[\n  \'Ich \u2665 B\xFCcher\',\n\  t\'foo \uD834\uDF06 bar\'\n]'
```

This setting has no effect on the output for strings.

#### `json`

The `json` option takes a boolean value (`true` or `false`), and defaults to `false` (disabled). When enabled, the output will always be valid JSON. [Hexadecimal character escape sequences](http://mathiasbynens.be/notes/javascript-escapes#hexadecimal) and the `\v` or `\0` escape sequences will not be used. Setting `json: true` implies `quotes: 'double', wrap: true`.

```js
stringEscape('foo\x00bar\xFF\uFFFDbaz', {
  'json': true
});
// → '"foo\\u0000bar\\u00FF\\uFFFDbaz"'

stringEscape({ 'foo\x00bar\xFF\uFFFDbaz': 'foo\x00bar\xFF\uFFFDbaz' }, {
  'json': true
});
// → '{"foo\\u0000bar\\u00FF\\uFFFDbaz":"foo\\u0000bar\\u00FF\\uFFFDbaz"}'

stringEscape([ 'foo\x00bar\xFF\uFFFDbaz', 'foo\x00bar\xFF\uFFFDbaz' ], {
  'json': true
});
// → '["foo\\u0000bar\\u00FF\\uFFFDbaz","foo\\u0000bar\\u00FF\\uFFFDbaz"]'
```

### `stringEscape.version`

A string representing the semantic version number.

### Using the `jsesc` binary

To use the `jsesc` binary in your shell, simply install javascript-string-escape globally using npm:

```bash
npm install -g string-escape
```

After that you will be able to escape strings from the command line:

```bash
$ jsesc 'föo ♥ bår 𝌆 baz'
f\xF6o \u2665 b\xE5r \uD834\uDF06 baz
```

To escape flat arrays containing only string values or flat objects containing only string values, use the `-o`/`--object` option:

```bash
$ jsesc --object '{ "föo": "♥", "bår": "𝌆 baz" }'
{'f\xF6o':'\u2665','b\xE5r':'\uD834\uDF06 baz'}
```

To prettify the output in such cases, use the `-p`/`--pretty` option:

```bash
$ jsesc --pretty '{ "föo": "♥", "bår": "𝌆 baz" }'
{
  'f\xF6o': '\u2665',
  'b\xE5r': '\uD834\uDF06 baz'
}
```

For valid JSON output, use the `-j`/`--json` option:

```bash
$ jsesc --json --pretty '{ "föo": "♥", "bår": "𝌆 baz" }'
{
  "f\u00F6o": "\u2665",
  "b\u00E5r": "\uD834\uDF06 baz"
}
```

To create a version of a JSON file (representing a flat array containing only string values or a flat object containing only string values) where any non-ASCII symbols are escaped:

```bash
$ cat data-raw.json | jsesc --json --object > data-escaped.json
```

See `jsesc --help` for the full list of options.

## Support

This library has been tested in at least Chrome 27-29, Firefox 3-22, Safari 4-6, Opera 10-12, IE 6-10, Node.js v0.10.0, Narwhal 0.3.2, RingoJS 0.8-0.9, PhantomJS 1.9.0, and Rhino 1.7RC4.

## Unit tests & code coverage

After cloning this repository, run `npm install` to install the dependencies needed for development and testing. You may want to install Istanbul _globally_ using `npm install istanbul -g`.

Once that’s done, you can run the unit tests in Node using `npm test` or `node tests/tests.js`. To run the tests in Rhino, Ringo, Narwhal, and web browsers as well, use `grunt test`.

To generate [the code coverage report](http://rawgithub.com/mathiasbynens/javascript-string-escape/master/coverage/javascript-string-escape/string-escape.js.html), use `grunt cover`.

## Author

| [![twitter/mathias](http://gravatar.com/avatar/24e08a9ea84deb17ae121074d0f17125?s=70)](http://twitter.com/mathias "Follow @mathias on Twitter") |
|---|
| [Mathias Bynens](http://mathiasbynens.be/) |

## License

This library is available under the [MIT](http://mths.be/mit) license.
