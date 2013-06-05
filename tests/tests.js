;(function(root) {
	'use strict';

	/** Use a single `load` function */
	var load = typeof require == 'function' ? require : root.load;

	/** The unit testing framework */
	var QUnit = (function() {
		var noop = Function.prototype;
		return root.QUnit || (
			root.addEventListener || (root.addEventListener = noop),
			root.setTimeout || (root.setTimeout = noop),
			root.QUnit = load('../node_modules/qunitjs/qunit/qunit.js') || root.QUnit,
			(load('../node_modules/qunit-clib/qunit-clib.js') || { 'runInContext': noop }).runInContext(root),
			addEventListener === noop && delete root.addEventListener,
			root.QUnit
		);
	}());

	// Extend `Object.prototype` to see if this library can handle it.
	Object.prototype['♥'] = '...';

	/** The `regenerate` object to test */
	var stringEscape = root.stringEscape || (root.stringEscape = (
		stringEscape = load('../string-escape.js') || root.stringEscape,
		stringEscape = stringEscape.stringEscape || stringEscape
	));

	/*--------------------------------------------------------------------------*/

	var map = function(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	};

	// taken from http://mths.be/punycode
	var stringFromCharCode = String.fromCharCode;
	var ucs2encode = function(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	};

	var allSymbols = '';
	var index;
	var symbol = '';
	// Generate strings based on code points. Trickier than it seems:
	// http://mathiasbynens.be/notes/javascript-encoding
	for (index = 0x000000; index <= 0x10FFFF; index++) {
		symbol = ucs2encode([ index ]);
		// ok(
		// 	eval('\'' + stringEscape(symbol) + '\'') == symbol,
		// 	'U+' + index.toString(16).toUpperCase()
		// );
		allSymbols += symbol + ' ';
	}

	test('stringEscape', function() {
		equal(
			stringEscape('\0\x31'),
			'\\x001',
			'`\\0` followed by `1`'
		);
		equal(
			stringEscape('\0a'),
			'\\0a',
			'`\\0` followed by `a`'
		);
		equal(
			stringEscape('foo"bar\'baz', {
				'quotes': 'LOLWAT' // invalid setting
			}),
			'foo"bar\\\'baz',
			'Invalid `quotes` setting'
		);
		equal(
			stringEscape('\\x00'),
			'\\\\x00',
			'`\\\\x00` shouldn’t be changed to `\\\\0`'
		);
		equal(
			stringEscape('\\\\x00'),
			'\\\\\\\\x00',
			'`\\\\\\\\x00` shouldn’t be changed to `\\\\\\\\0`'
		);
		equal(
			stringEscape('lolwat"foo\'bar', {
				'escapeEverything': true
			}),
			'\\x6C\\x6F\\x6C\\x77\\x61\\x74\\"\\x66\\x6F\\x6F\\\'\\x62\\x61\\x72',
			'escapeEverything'
		);
		ok(
			eval('\'' + stringEscape(allSymbols) + '\'') == allSymbols,
			'All Unicode symbols, space-separated, default quote type (single quotes)'
		);
		ok(
			eval('\'' + stringEscape(allSymbols, {
				'quotes': 'single'
			}) + '\'') == allSymbols,
			'All Unicode symbols, space-separated, single quotes'
		);
		ok(
			eval(stringEscape(allSymbols, {
				'quotes': 'single',
				'wrap': true
			})) == allSymbols,
			'All Unicode symbols, space-separated, single quotes, auto-wrap'
		);
		ok(
			eval('"' + stringEscape(allSymbols, {
				'quotes': 'double'
			}) + '"') == allSymbols,
			'All Unicode symbols, space-separated, double quotes'
		);
		ok(
			eval(stringEscape(allSymbols, {
				'quotes': 'double',
				'wrap': true
			})) == allSymbols,
			'All Unicode symbols, space-separated, double quotes, auto-wrap'
		);
	});

	/*--------------------------------------------------------------------------*/

	// configure QUnit and call `QUnit.start()` for
	// Narwhal, Node.js, PhantomJS, Rhino, and RingoJS
	if (!root.document || root.phantom) {
		QUnit.config.noglobals = true;
		QUnit.start();
	}
}(typeof global == 'object' && global || this));
