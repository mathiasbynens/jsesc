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

	// Quick and dirty test to see if we’re in PhantomJS or Node
	var runExtendedTests = (function() {
		try {
			return root.phantom || process.argv[0] == 'node';
		} catch(error) { }
	}());

	test('stringEscape: common usage', function() {
		equal(
			typeof stringEscape.version,
			'string',
			'`stringEscape.version` must be a string'
		);
		equal(
			stringEscape('\0\x31'),
			'\\x001',
			'`\\0` followed by `1`'
		);
		equal(
			stringEscape('\0\x38'),
			'\\x008',
			'`\\0` followed by `8`'
		);
		equal(
			stringEscape('\0\x39'),
			'\\x009',
			'`\\0` followed by `9`'
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
			stringEscape('a\\x00'),
			'a\\\\x00',
			'`a\\\\x00` shouldn’t be changed to `\\\\0`'
		);
		equal(
			stringEscape('\\\x00'),
			'\\\\\\0',
			'`\\\\\\x00` should be changed to `\\\\\\0`'
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
		// Stringifying flat objects containing only string values
		equal(
			stringEscape({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }),
			'{\'foo\\0bar\\uFFFDbaz\':\'foo\\0bar\\uFFFDbaz\'}',
			'Stringifying a flat object with default settings`'
		);
		equal(
			stringEscape({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'quotes': 'double'
			}),
			'{"foo\\0bar\\uFFFDbaz":"foo\\0bar\\uFFFDbaz"}',
			'Stringifying a flat object with `quotes: \'double\'`'
		);
		equal(
			stringEscape({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'compact': false
			}),
			'{\n\t\'foo\\0bar\\uFFFDbaz\': \'foo\\0bar\\uFFFDbaz\'\n}',
			'Stringifying a flat object with `compact: false`'
		);
		equal(
			stringEscape({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'compact': false,
				'indent': '  '
			}),
			'{\n  \'foo\\0bar\\uFFFDbaz\': \'foo\\0bar\\uFFFDbaz\'\n}',
			'Stringifying a flat object with `compact: false, indent: \'  \'`'
		);
		equal(
			stringEscape({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'escapeEverything': true
			}),
			'{\'\\x66\\x6F\\x6F\\0\\x62\\x61\\x72\\uFFFD\\x62\\x61\\x7A\':\'\\x66\\x6F\\x6F\\0\\x62\\x61\\x72\\uFFFD\\x62\\x61\\x7A\'}',
			'Stringifying a flat object with `escapeEverything: true`'
		);
		// JSON
		equal(
			stringEscape('foo\x00bar\xFF\uFFFDbaz', {
				'json': true
			}),
			'"foo\\u0000bar\\u00FF\\uFFFDbaz"',
			'JSON-stringifying a string'
		);
		equal(
			stringEscape('foo\x00bar\uFFFDbaz', {
				'escapeEverything': true,
				'json': true,
				'quotes': 'single' // `json: true` should override this setting
			}),
			'"\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A"',
			'JSON-stringifying a string with `escapeEverything: true`'
		);
		equal(
			stringEscape({ 'foo\x00bar\uFFFDbaz': 'foo\x00bar\uFFFDbaz' }, {
				'escapeEverything': true,
				'json': true,
				'quotes': 'single' // `json: true` should override this setting
			}),
			'{"\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A":"\\u0066\\u006F\\u006F\\u0000\\u0062\\u0061\\u0072\\uFFFD\\u0062\\u0061\\u007A"}',
			'JSON-stringifying a flat object with `escapeEverything: true`'
		);
	});

	if (runExtendedTests) {
		test('stringEscape: advanced tests', function() {
			var map = function(array, fn) {
				var length = array.length;
				while (length--) {
					array[length] = fn(array[length]);
				}
				return array;
			};

			// taken from http://mths.be/punycode
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
			// http://mathiasbynens.be/notes/javascript-encoding
			for (codePoint = 0x000000; codePoint <= 0x10FFFF; codePoint++) {
				symbol = ucs2encode(codePoint);
				// ok(
				// 	eval('\'' + stringEscape(symbol) + '\'') == symbol,
				// 	'U+' + codePoint.toString(16).toUpperCase()
				// );
				allSymbols += symbol + ' ';
			}

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
	}

	/*--------------------------------------------------------------------------*/

	// configure QUnit and call `QUnit.start()` for
	// Narwhal, Node.js, PhantomJS, Rhino, and RingoJS
	if (!root.document || root.phantom) {
		QUnit.config.noglobals = true;
		QUnit.start();
	}
}(typeof global == 'object' && global || this));
