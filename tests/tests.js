(function(root) {
	'use strict';

	var noop = Function.prototype;

	var load = (typeof require == 'function' && !(root.define && define.amd)) ?
		require :
		(!root.document && root.java && root.load) || noop;

	var QUnit = (function() {
		return root.QUnit || (
			root.addEventListener || (root.addEventListener = noop),
			root.setTimeout || (root.setTimeout = noop),
			root.QUnit = load('../node_modules/qunitjs/qunit/qunit.js') || root.QUnit,
			addEventListener === noop && delete root.addEventListener,
			root.QUnit
		);
	}());

	var qe = load('../node_modules/qunit-extras/qunit-extras.js');
	if (qe) {
		qe.runInContext(root);
	}

	// Extend `Object.prototype` to see if this library can handle it.
	Object.prototype['\u2665'] = '...';

	/** The `regenerate` object to test */
	var jsesc = root.jsesc || (root.jsesc = (
		jsesc = load('../jsesc.js') || root.jsesc,
		jsesc = jsesc.jsesc || jsesc
	));

	/*--------------------------------------------------------------------------*/

	// Quick and dirty test to see if we’re in PhantomJS or Node
	var isNode = typeof process != 'undefined' && process.argv &&
		process.argv[0].slice(-4) == 'node';
	var runExtendedTests = root.phantom || isNode;

	// explicitly call `QUnit.module()` instead of `module()`
	// in case we are in a CLI environment
	QUnit.module('jsesc');

	test('common usage', function() {
		equal(
			typeof jsesc.version,
			'string',
			'`jsesc.version` must be a string'
		);
		equal(
			jsesc('\0\x31'),
			'\\x001',
			'`\\0` followed by `1`'
		);
		equal(
			jsesc('\0\x38'),
			'\\x008',
			'`\\0` followed by `8`'
		);
		equal(
			jsesc('\0\x39'),
			'\\x009',
			'`\\0` followed by `9`'
		);
		equal(
			jsesc('\0a'),
			'\\0a',
			'`\\0` followed by `a`'
		);
		equal(
			jsesc('foo"bar\'baz', {
				'quotes': 'LOLWAT' // invalid setting
			}),
			'foo"bar\\\'baz',
			'Invalid `quotes` setting'
		);
		equal(
			jsesc('\\x00'),
			'\\\\x00',
			'`\\\\x00` shouldn’t be changed to `\\\\0`'
		);
		equal(
			jsesc('a\\x00'),
			'a\\\\x00',
			'`a\\\\x00` shouldn’t be changed to `\\\\0`'
		);
		equal(
			jsesc('\\\x00'),
			'\\\\\\0',
			'`\\\\\\x00` should be changed to `\\\\\\0`'
		);
		equal(
			jsesc('\\\\x00'),
			'\\\\\\\\x00',
			'`\\\\\\\\x00` shouldn’t be changed to `\\\\\\\\0`'
		);
		equal(
			jsesc('lolwat"foo\'bar', {
				'escapeEverything': true
			}),
			'\\x6C\\x6F\\x6C\\x77\\x61\\x74\\"\\x66\\x6F\\x6F\\\'\\x62\\x61\\x72',
			'escapeEverything'
		);
		equal(
			jsesc('foo</script>bar</style>baz</script>qux', {
				'escapeEtago': true
			}),
			'foo<\\/script>bar<\\/style>baz<\\/script>qux',
			'escapeEtago'
		);
		equal(
			jsesc('foo</sCrIpT>bar</STYLE>baz</SCRIPT>qux', {
				'escapeEtago': true
			}),
			'foo<\\/sCrIpT>bar<\\/STYLE>baz<\\/SCRIPT>qux',
			'escapeEtago'
		);
		equal(
			jsesc([0x42, 0x1337], {
				'numbers': 'decimal'
			}),
			'[66,4919]',
			'`numbers: \'decimal\'` (default)'
		);
		equal(
			jsesc([0x42, 0x1337], {
				'numbers': 'binary'
			}),
			'[0b1000010,0b1001100110111]',
			'`numbers: \'binary\'`'
		);
		equal(
			jsesc([0x42, 0x1337, NaN, Infinity], {
				'numbers': 'binary',
				'json': true
			}),
			'[66,4919,null,null]',
			'`json: true` takes precedence over `numbers: \'binary\'`'
		);
		equal(
			jsesc([0x42, 0x1337], {
				'numbers': 'octal'
			}),
			'[0o102,0o11467]',
			'`numbers: \'octal\'`'
		);
		equal(
			jsesc([0x42, 0x1337], {
				'numbers': 'hexadecimal'
			}),
			'[0x42,0x1337]',
			'`numbers: \'hexadecimal\'`'
		);
		equal(
			jsesc('a\uD834\uDF06b', {
				'es6': true
			}),
			'a\\u{1D306}b',
			'es6'
		);
		equal(
			jsesc('a\uD834\uDF06b\uD83D\uDCA9c', {
				'es6': true
			}),
			'a\\u{1D306}b\\u{1F4A9}c',
			'es6'
		);
		equal(
			jsesc('a\uD834\uDF06b\uD83D\uDCA9c', {
				'es6': true,
				'escapeEverything': true
			}),
			'\\x61\\u{1D306}\\x62\\u{1F4A9}\\x63',
			'es6 + escapeEverything'
		);
		equal(
			jsesc({}, {
				'compact': true
			}),
			'{}',
			'Stringifying an empty object with `compact: true`'
		);
		equal(
			jsesc({}, {
				'compact': false
			}),
			'{}',
			'Stringifying an empty object with `compact: false`'
		);
		equal(
			jsesc([], {
				'compact': true
			}),
			'[]',
			'Stringifying an empty array with `compact: true`'
		);
		equal(
			jsesc([], {
				'compact': false
			}),
			'[]',
			'Stringifying an empty array with `compact: false`'
		);
		// Stringifying flat objects containing only string values
		equal(
			jsesc({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }),
			'{\'foo\\0bar\\uFFFDbaz\':\'foo\\0bar\\uFFFDbaz\'}',
			'Stringifying a flat object with default settings`'
		);
		equal(
			jsesc({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'quotes': 'double'
			}),
			'{"foo\\0bar\\uFFFDbaz":"foo\\0bar\\uFFFDbaz"}',
			'Stringifying a flat object with `quotes: \'double\'`'
		);
		equal(
			jsesc({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'compact': false
			}),
			'{\n\t\'foo\\0bar\\uFFFDbaz\': \'foo\\0bar\\uFFFDbaz\'\n}',
			'Stringifying a flat object with `compact: false`'
		);
		equal(
			jsesc({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'compact': false,
				'indent': '  '
			}),
			'{\n  \'foo\\0bar\\uFFFDbaz\': \'foo\\0bar\\uFFFDbaz\'\n}',
			'Stringifying a flat object with `compact: false, indent: \'  \'`'
		);
		equal(
			jsesc({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'escapeEverything': true
			}),
			'{\'\\x66\\x6F\\x6F\\0\\x62\\x61\\x72\\uFFFD\\x62\\x61\\x7A\':\'\\x66\\x6F\\x6F\\0\\x62\\x61\\x72\\uFFFD\\x62\\x61\\x7A\'}',
			'Stringifying a flat object with `escapeEverything: true`'
		);
		// Stringifying flat arrays containing only string values
		equal(
			jsesc(['foo\x00bar\uFFFDbaz', '\xA9'], {
				'escapeEverything': true
			}),
			'[\'\\x66\\x6F\\x6F\\0\\x62\\x61\\x72\\uFFFD\\x62\\x61\\x7A\',\'\\xA9\']',
			'Stringifying a flat array with `escapeEverything: true`'
		);
		equal(
			jsesc(['foo\x00bar\uFFFDbaz', '\xA9'], {
				'compact': false
			}),
			'[\n\t\'foo\\0bar\\uFFFDbaz\',\n\t\'\\xA9\'\n]',
			'Stringifying a flat array with `compact: false`'
		);
		// Maps
		if (typeof Map != 'undefined') {
			equal(
				jsesc(
					new Map([])
				),
				'new Map()',
				'Stringifying an empty Map'
			);
			equal(
				jsesc(
					new Map([
						['a', 1],
						['b', 2]
					]),
					{
						'compact': true
					}
				),
				'new Map([[\'a\',1],[\'b\',2]])',
				'Stringifying a Map with `compact: true`'
			);
			equal(
				jsesc(
					new Map([
						['a', 1],
						['b', 2]
					]),
					{
						'compact': false
					}
				),
				'new Map([\n\t[\'a\', 1],\n\t[\'b\', 2]\n])',
				'Stringifying a Map with `compact: false`'
			);
			equal(
				jsesc(
					new Map([
						['a', 1],
						['b', [
							'a',
							'nested',
							'array'
						]]
					]),
					{
						'compact': false
					}
				),
				'new Map([\n\t[\'a\', 1],\n\t[\'b\', [\n\t\t\'a\',\n\t\t\'nested\',\n\t\t\'array\'\n\t]]\n])',
				'Stringifying a Map with `compact: false`'
			);
			equal(
				jsesc(
					new Map([
						['a', 1],
						['b', new Map([
							['x', 2],
							['y', 3]
						])]
					]),
					{
						'compact': false
					}
				),
				'new Map([\n\t[\'a\', 1],\n\t[\'b\', new Map([\n\t\t[\'x\', 2],\n\t\t[\'y\', 3]\n\t])]\n])',
				'Stringifying a Map with `compact: false`'
			);
		}
		if (typeof Set != 'undefined') {
			equal(
				jsesc(
					new Set([])
				),
				'new Set()',
				'Stringifying an empty Set'
			);
			equal(
				jsesc(
					new Set([
						['a'],
						'b',
						{}
					]),
					{
						'compact': true
					}
				),
				'new Set([[\'a\'],\'b\',{}])',
				'Stringifying a Set with `compact: true`'
			);
			equal(
				jsesc(
					new Set([
						['a'],
						'b',
						{}
					]),
					{
						'compact': false
					}
				),
				'new Set([\n\t[\n\t\t\'a\'\n\t],\n\t\'b\',\n\t{}\n])',
				'Stringifying a Set with `compact: false`'
			);
		}
		// JSON
		equal(
			jsesc('foo\x00bar\xFF\uFFFDbaz', {
				'json': true
			}),
			'"foo\\u0000bar\\u00FF\\uFFFDbaz"',
			'JSON-stringifying a string'
		);
		equal(
			jsesc('foo\x00bar\uFFFDbaz', {
				'escapeEverything': true,
				'json': true
			}),
			'"\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A"',
			'JSON-stringifying a string with `escapeEverything: true`'
		);
		equal(
			jsesc({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'escapeEverything': true,
				'json': true
			}),
			'{"\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A":"\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A"}',
			'JSON-stringifying a flat object with `escapeEverything: true`'
		);
		equal(
			jsesc(['foo\x00bar\uFFFDbaz', 'foo\x00bar\uFFFDbaz'], {
				'escapeEverything': true,
				'json': true
			}),
			'["\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A","\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A"]',
			'JSON-stringifying a flat array with `escapeEverything: true`'
		);
		equal(
			jsesc('foo\x00bar', {
				'json': true,
				'wrap': false // override default `wrap: true` when `json` is enabled
			}),
			'foo\\u0000bar',
			'Escaping as JSON with `wrap: false`'
		);
		equal(
			jsesc('foo "\x00" bar', {
				'json': true,
				'wrap': false // override default `wrap: true` when `json` is enabled
			}),
			'foo \\"\\u0000\\" bar',
			'Escaping as JSON with `wrap: false` escapes double quotes correctly'
		);
		equal(
			jsesc('foo "\x00" bar \' qux', {
				'json': true,
				'quotes': 'single', // override default `quotes: 'double'` when `json` is enabled
				'wrap': false // override default `wrap: true` when `json` is enabled
			}),
			'foo "\\u0000" bar \\\' qux',
			'Escaping as JSON with `wrap: false, quotes: \'single\'`'
		);
		equal(
			jsesc('foo\uD834\uDF06bar\xA9baz', {
				'json': true,
				'es6': true // override default `es6: false` when `json` is enabled
			}),
			'"foo\\u{1D306}bar\\u00A9baz"',
			'Escaping as JSON with `es6: true`'
		);
		var tmp = {
			'shouldn\u2019t be here': 10,
			'toJSON': function() {
				return {
					'hello': 'world',
					'\uD83D\uDCA9': 'foo',
					'pile': '\uD83D\uDCA9'
				};
			}
		};
		equal(
			jsesc(tmp, { 'json' : true }),
			'{"hello":"world","\\uD83D\\uDCA9":"foo","pile":"\\uD83D\\uDCA9"}',
			'`toJSON` methods are called when `json: true`'
		);
		notEqual(
			jsesc(tmp),
			'{"hello":"world","\\uD83D\\uDCA9":"foo","pile":"\\uD83D\\uDCA9"}',
			'`toJSON` methods are not called when `json: false`'
		);
		equal(
			jsesc(42, {
				'numbers': 'hexadecimal',
				'lowercaseHex': true
			}),
			'0x2a',
			'Hexadecimal integeral literals are lowercase when `lowercaseHex: true`'
		);
		equal(
			jsesc('\u2192\xE9', {
				'lowercaseHex': true
			}),
			'\\u2192\\xe9',
			'Alphabetical hexadecimal digits are lowercase when `lowercaseHex: true`'
		);
		equal(
			jsesc('\u2192\xE9', {
				'lowercaseHex': false
			}),
			'\\u2192\\xE9',
			'Alphabetical hexadecimal digits are uppercase when `lowercaseHex: false`'
		);
		equal(
			jsesc('\u2192\xE9', {
				'lowercaseHex': true,
				'json': true
			}),
			'"\\u2192\\u00e9"',
			'Alphabetical hexadecimal digits are lowercase when `lowercaseHex: false` and `json: true`'
		);
		equal(
			jsesc('\u2192\xe9', {
				'lowercaseHex': false,
				'json': true
			}),
			'"\\u2192\\u00E9"',
			'Alphabetical hexadecimal digits are uppercase when `lowercaseHex: false` and `json: true`'
		);
		equal(
			jsesc('\xE7\xE7a\xE7\xE7', {
				'lowercaseHex': true,
				'escapeEverything': true
			}),
			'\\xe7\\xe7\\x61\\xe7\\xe7',
			'Alphabetical hexadecimal digits are lowercase when `lowercaseHex: true` and `escapeEverything: true`'
		);
		equal(
			jsesc('\xE7\xE7a\xE7\xE7', {
				'lowercaseHex': false,
				'escapeEverything': true
			}),
			'\\xE7\\xE7\\x61\\xE7\\xE7',
			'Alphabetical hexadecimal digits are uppercase when `lowercaseHex: false` and `escapeEverything: true`'
		);
		equal(
			jsesc('\u2192\xE9\uD83D\uDCA9', {
				'lowercaseHex': true,
				'es6': true
			}),
			'\\u2192\\xe9\\u{1f4a9}',
			'Alphabetical hexadecimal digits are lowercase when `lowercaseHex: true` and `es6: true`'
		);
		equal(
			jsesc('\u2192\xE9\uD83D\uDCA9', {
				'lowercaseHex': false,
				'es6': true
			}),
			'\\u2192\\xE9\\u{1F4A9}',
			'Alphabetical hexadecimal digits are uppercase when `lowercaseHex: false` and `es6: true`'
		);
	});

	if (runExtendedTests) {
		test('advanced tests', function() {
			var map = function(array, fn) {
				var length = array.length;
				while (length--) {
					array[length] = fn(array[length]);
				}
				return array;
			};

			// taken from https://mths.be/punycode
			var stringFromCharCode = String.fromCharCode;
			var ucs2encode = function(value) {
				var output = '';
				if (value > 0xFFFF) {
					value -= 0x10000;
					output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
					value = 0xDC00 | value & 0x3FF;
				}
				output += stringFromCharCode(value);
				return output;
			};

			var allSymbols = '';
			var codePoint;
			var symbol = '';
			// Generate strings based on code points. Trickier than it seems:
			// https://mathiasbynens.be/notes/javascript-encoding
			for (codePoint = 0x000000; codePoint <= 0x10FFFF; codePoint += 0xF) {
				symbol = ucs2encode(codePoint);
				// ok(
				// 	eval('\'' + jsesc(symbol) + '\'') == symbol,
				// 	'U+' + codePoint.toString(16).toUpperCase()
				// );
				allSymbols += symbol + ' ';
			}

			ok(
				eval('\'' + jsesc(allSymbols) + '\'') == allSymbols,
				'All Unicode symbols, space-separated, default quote type (single quotes)'
			);
			ok(
				eval('\'' + jsesc(allSymbols, {
					'quotes': 'single'
				}) + '\'') == allSymbols,
				'All Unicode symbols, space-separated, single quotes'
			);
			ok(
				eval(jsesc(allSymbols, {
					'quotes': 'single',
					'wrap': true
				})) == allSymbols,
				'All Unicode symbols, space-separated, single quotes, auto-wrap'
			);
			ok(
				eval('"' + jsesc(allSymbols, {
					'quotes': 'double'
				}) + '"') == allSymbols,
				'All Unicode symbols, space-separated, double quotes'
			);
			ok(
				eval(jsesc(allSymbols, {
					'quotes': 'double',
					'wrap': true
				})) == allSymbols,
				'All Unicode symbols, space-separated, double quotes, auto-wrap'
			);

			// Some of these depend on `JSON.parse()`, so only test them in Node
			if (isNode) {
				var testArray = [
					undefined, Infinity, new Number(Infinity), -Infinity,
					new Number(-Infinity), 0, new Number(0), -0, new Number(-0), +0,
					new Number(+0), new Function(), 'str',
					function zomg() { return 'desu'; }, null, true, new Boolean(true),
					false, new Boolean(false), {
						"foo": 42, "hah": [ 1, 2, 3, { "foo" : 42 } ]
					}
				];
				equal(
					jsesc(testArray, {
						'json': false
					}),
					'[undefined,Infinity,Infinity,-Infinity,-Infinity,0,0,0,0,0,0,function anonymous() {\n\n},\'str\',function zomg() { return \'desu\'; },null,true,true,false,false,{\'foo\':42,\'hah\':[1,2,3,{\'foo\':42}]}]',
					'Escaping a non-flat array with all kinds of values'
				);
				equal(
					jsesc(testArray, {
						'json': true
					}),
					'[null,null,null,null,null,0,0,0,0,0,0,null,"str",null,null,true,true,false,false,{"foo":42,"hah":[1,2,3,{"foo":42}]}]',
					'Escaping a non-flat array with all kinds of values, with `json: true`'
				);
				equal(
					jsesc(testArray, {
						'json': true,
						'compact': false
					}),
					'[\n\tnull,\n\tnull,\n\tnull,\n\tnull,\n\tnull,\n\t0,\n\t0,\n\t0,\n\t0,\n\t0,\n\t0,\n\tnull,\n\t"str",\n\tnull,\n\tnull,\n\ttrue,\n\ttrue,\n\tfalse,\n\tfalse,\n\t{\n\t\t"foo": 42,\n\t\t"hah": [\n\t\t\t1,\n\t\t\t2,\n\t\t\t3,\n\t\t\t{\n\t\t\t\t"foo": 42\n\t\t\t}\n\t\t]\n\t}\n]',
					'Escaping a non-flat array with all kinds of values, with `json: true, compact: false`'
				);
			}
		});
	}

	// Test binary
	if (isNode) {
		asyncTest('jsesc binary', function() {

			var exec = require('child_process').exec;

			var shellTest = function(command, callback) {
				exec(command, function(error, stdout, stderr) {
					callback({
						'stdout': stdout,
						'stderr': stderr,
						'exitStatus': error ? error.code : 0
					});
				});
			};

			var tests = [
				{
					'description': 'No arguments',
					'command': './bin/jsesc',
					'expected': {
						'exitStatus': 1
					}
				},
				{
					'description': '-h option',
					'command': './bin/jsesc -h',
					'expected': {
						'exitStatus': 1
					}
				},
				{
					'description': '--help option',
					'command': './bin/jsesc --help',
					'expected': {
						'exitStatus': 1
					}
				},
				{
					'description': '-v option',
					'command': './bin/jsesc -v',
					'expected': {
						'exitStatus': 1
					}
				},
				{
					'description': '--version option',
					'command': './bin/jsesc --version',
					'expected': {
						'exitStatus': 1
					}
				},
				{
					'description': 'No options',
					'command': './bin/jsesc "f\xF6o \u2665 b\xE5r \uD834\uDF06 baz"',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': 'No options, piping content',
					'command': 'echo "f\xF6o \u2665 b\xE5r \uD834\uDF06 baz" | ./bin/jsesc',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-s option',
					'command': './bin/jsesc -s f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-s option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc -s',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--single-quotes option',
					'command': './bin/jsesc --single-quotes f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--single-quotes option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc --single-quotes',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-d option',
					'command': './bin/jsesc -d f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \'\\"\'\\" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-d option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc -d',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \'\\"\'\\" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--double-quotes option',
					'command': './bin/jsesc --double-quotes f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \'\\"\'\\" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--double-quotes option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc --double-quotes',
					'expected': {
						'stdout': 'f\\xF6o \\u2665 \'\\"\'\\" b\\xE5r \\uD834\\uDF06 baz\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-w option',
					'command': './bin/jsesc -w f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': '\'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\'\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-w option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc -w',
					'expected': {
						'stdout': '\'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\'\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--wrap option',
					'command': './bin/jsesc --wrap f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': '\'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\'\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--wrap option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc --wrap',
					'expected': {
						'stdout': '\'f\\xF6o \\u2665 \\\'"\\\'" b\\xE5r \\uD834\\uDF06 baz\'\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-6 option',
					'command': './bin/jsesc -6 a\uD834\uDF06b\uD83D\uDCA9c',
					'expected': {
						'stdout': 'a\\u{1D306}b\\u{1F4A9}c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-6 option, piping content',
					'command': 'echo a\uD834\uDF06b\uD83D\uDCA9c | ./bin/jsesc -6',
					'expected': {
						'stdout': 'a\\u{1D306}b\\u{1F4A9}c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},

				{
					'description': '--es6 option',
					'command': './bin/jsesc --es6 a\uD834\uDF06b\uD83D\uDCA9c',
					'expected': {
						'stdout': 'a\\u{1D306}b\\u{1F4A9}c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--es6 option, piping content',
					'command': 'echo a\uD834\uDF06b\uD83D\uDCA9c | ./bin/jsesc --es6',
					'expected': {
						'stdout': 'a\\u{1D306}b\\u{1F4A9}c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-e option',
					'command': './bin/jsesc -e f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': '\\x66\\xF6\\x6F\\x20\\u2665\\x20\\\'\\"\\\'\\"\\x20\\x62\\xE5\\x72\\x20\\uD834\\uDF06\\x20\\x62\\x61\\x7A\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-e option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc -e',
					'expected': {
						'stdout': '\\x66\\xF6\\x6F\\x20\\u2665\\x20\\\'\\"\\\'\\"\\x20\\x62\\xE5\\x72\\x20\\uD834\\uDF06\\x20\\x62\\x61\\x7A\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--escape-everything option',
					'command': './bin/jsesc --escape-everything f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': '\\x66\\xF6\\x6F\\x20\\u2665\\x20\\\'\\"\\\'\\"\\x20\\x62\\xE5\\x72\\x20\\uD834\\uDF06\\x20\\x62\\x61\\x7A\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--escape-everything option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc --escape-everything',
					'expected': {
						'stdout': '\\x66\\xF6\\x6F\\x20\\u2665\\x20\\\'\\"\\\'\\"\\x20\\x62\\xE5\\x72\\x20\\uD834\\uDF06\\x20\\x62\\x61\\x7A\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-t option',
					'command': './bin/jsesc -t "foo</script>bar"',
					'expected': {
						'stdout': 'foo<\\/script>bar\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-t option, piping content',
					'command': 'echo "foo</script>bar" | ./bin/jsesc -t',
					'expected': {
						'stdout': 'foo<\\/script>bar\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--escape-etago option',
					'command': './bin/jsesc --escape-etago "foo</script>bar"',
					'expected': {
						'stdout': 'foo<\\/script>bar\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--escape-etago option, piping content',
					'command': 'echo "foo</script>bar" | ./bin/jsesc --escape-etago',
					'expected': {
						'stdout': 'foo<\\/script>bar\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-l option',
					'command': './bin/jsesc -l a\uD834\uDF06b\uD83D\uDCA9c',
					'expected': {
						'stdout': 'a\\ud834\\udf06b\\ud83d\\udca9c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-l option, piping content',
					'command': 'echo a\uD834\uDF06b\uD83D\uDCA9c | ./bin/jsesc -l',
					'expected': {
						'stdout': 'a\\ud834\\udf06b\\ud83d\\udca9c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--lowercase-hex option',
					'command': './bin/jsesc --lowercase-hex a\uD834\uDF06b\uD83D\uDCA9c',
					'expected': {
						'stdout': 'a\\ud834\\udf06b\\ud83d\\udca9c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--lowercase-hex option, piping content',
					'command': 'echo a\uD834\uDF06b\uD83D\uDCA9c | ./bin/jsesc --lowercase-hex',
					'expected': {
						'stdout': 'a\\ud834\\udf06b\\ud83d\\udca9c\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-j option',
					'command': './bin/jsesc -j f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': '"f\\u00F6o \\u2665 \'\\"\'\\" b\\u00E5r \\uD834\\uDF06 baz"\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-j option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc -j',
					'expected': {
						'stdout': '"f\\u00F6o \\u2665 \'\\"\'\\" b\\u00E5r \\uD834\\uDF06 baz"\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--json option',
					'command': './bin/jsesc --json f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz',
					'expected': {
						'stdout': '"f\\u00F6o \\u2665 \'\\"\'\\" b\\u00E5r \\uD834\\uDF06 baz"\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--json option, piping content',
					'command': 'echo f\xF6o\\ \u2665\\ \\\'\\"\\\'\\"\\ b\xE5r\\ \uD834\uDF06\\ baz | ./bin/jsesc --json',
					'expected': {
						'stdout': '"f\\u00F6o \\u2665 \'\\"\'\\" b\\u00E5r \\uD834\\uDF06 baz"\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-o option',
					'command': './bin/jsesc -o \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\}',
					'expected': {
						'stdout': '{\'f\\xF6o\':\'b\\xE5r \\uD834\\uDF06 baz\'}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-o option, piping content',
					'command': 'echo \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\} | ./bin/jsesc -o',
					'expected': {
						'stdout': '{\'f\\xF6o\':\'b\\xE5r \\uD834\\uDF06 baz\'}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--object option',
					'command': './bin/jsesc --object \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\}',
					'expected': {
						'stdout': '{\'f\\xF6o\':\'b\\xE5r \\uD834\\uDF06 baz\'}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--object option, piping content',
					'command': 'echo \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\} | ./bin/jsesc --object',
					'expected': {
						'stdout': '{\'f\\xF6o\':\'b\\xE5r \\uD834\\uDF06 baz\'}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-p option',
					'command': './bin/jsesc --json -p \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\}',
					'expected': {
						'stdout': '{\n\t"f\\u00F6o": "b\\u00E5r \\uD834\\uDF06 baz"\n}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '-p option, piping content',
					'command': 'echo \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\} | ./bin/jsesc --json -p',
					'expected': {
						'stdout': '{\n\t"f\\u00F6o": "b\\u00E5r \\uD834\\uDF06 baz"\n}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--pretty option',
					'command': './bin/jsesc --json --pretty \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\}',
					'expected': {
						'stdout': '{\n\t"f\\u00F6o": "b\\u00E5r \\uD834\\uDF06 baz"\n}\n',
						'stderr': '',
						'exitStatus': 0
					}
				},
				{
					'description': '--pretty option, piping content',
					'command': 'echo \\{\\"f\xF6o\\":\\"b\xE5r\\ \uD834\uDF06\\ baz\\"\\} | ./bin/jsesc --json --pretty',
					'expected': {
						'stdout': '{\n\t"f\\u00F6o": "b\\u00E5r \\uD834\\uDF06 baz"\n}\n',
						'stderr': '',
						'exitStatus': 0
					}
				}
			];
			var counter = tests.length;
			function done() {
				--counter || QUnit.start();
			}

			tests.forEach(function(object) {
				shellTest(object.command, function(data) {
					// We can’t use `deepEqual` since sometimes not all expected values are provided
					Object.keys(object.expected).forEach(function(key) {
						equal(object.expected[key], data[key], object.description);
					});
					done();
				});
			});

		});
	}

	/*--------------------------------------------------------------------------*/

	// configure QUnit and call `QUnit.start()` for
	// Narwhal, Node.js, PhantomJS, Rhino, and RingoJS
	if (!root.document || root.phantom) {
		QUnit.config.noglobals = true;
		QUnit.start();
	}
}(typeof global == 'object' && global || this));
