'use strict';

const assert = require('assert');
const jsesc = require('..');

const values = [
	['fraction', 1.5],
	['negative fraction', -0.5],
	['infinity', Infinity],
	['negative infinity', -Infinity],
	['NaN', NaN],
	['boxed fraction', new Number(1.5)],
	['boxed negative fraction', new Number(-0.5)],
	['boxed NaN', new Number(NaN)]
];
const modes = [
	['hexadecimal', '0x2A'],
	['binary', '0b101010'],
	['octal', '0o52']
];

describe('non-integer numbers', function() {
	modes.forEach(function(mode) {
		const numbers = mode[0];
		values.forEach(function(entry) {
			it('preserves ' + entry[0] + ' with ' + numbers, function() {
				const value = entry[1];
				const output = jsesc(value, { numbers });
				assert.ok(Object.is(eval('(' + output + ')'), Number(value)));
				assert.strictEqual(output, String(value));
			});
		});

		it('keeps integer and BigInt output with ' + numbers, function() {
			assert.strictEqual(jsesc(42, { numbers }), mode[1]);
			assert.strictEqual(jsesc(new Number(42), { numbers }), mode[1]);
			const boxed = new Number(42);
			boxed.valueOf = function() { throw new Error('Must not be called'); };
			assert.strictEqual(jsesc(boxed, { numbers }), mode[1]);
			assert.strictEqual(jsesc(BigInt(42), { numbers }), mode[1] + 'n');
		});

		it('keeps JSON precedence with ' + numbers, function() {
			assert.strictEqual(jsesc(BigInt(42), { numbers, json: true }), '42');
			assert.strictEqual(jsesc(BigInt(-42), { numbers, json: true }), '-42');
			values.forEach(function(entry) {
				const expected = JSON.stringify(Number(entry[1]));
				const output = jsesc(entry[1], { numbers, json: true });
				assert.strictEqual(output, expected);
				assert.strictEqual(JSON.parse(output), JSON.parse(expected));
			});
		});

		it('preserves numbers in nested values with ' + numbers, function() {
			const input = values.map(function(entry) { return entry[1]; });
			const output = jsesc({ values: input }, { numbers, compact: false });
			const restored = eval('(' + output + ')').values;
			input.forEach(function(value, index) {
				assert.ok(Object.is(restored[index], Number(value)));
			});
		});
	});

	it('keeps decimal output', function() {
		values.forEach(function(entry) {
			assert.strictEqual(jsesc(entry[1]), String(entry[1]));
		});
	});

	it('keeps lowercase hexadecimal integers alongside fractional values', function() {
		assert.strictEqual(
			jsesc([42, 1.5, BigInt(42)], { numbers: 'hexadecimal', lowercaseHex: true }),
			'[0x2a,1.5,0x2an]'
		);
	});
});
