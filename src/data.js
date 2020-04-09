'use strict';

const regenerate = require('regenerate');
const whitespaceCodePoints = require('unicode-13.0.0/General_Category/Space_Separator/code-points.js');

const set = regenerate()
	.addRange(0x20, 0x7E) // printable ASCII symbols
	.remove('"')          // not `"`
	.remove('\'')         // not `'`
	.remove('\\')         // not `\`
	.remove('`');         // not '`'

const whitespace = regenerate()
	.addRange(0x2028, 0x2029);

for (let i = 0; i < whitespaceCodePoints.length; i++) {
	const codePoint = whitespaceCodePoints[i];
	if (codePoint > 0x80) {
		whitespace.add(codePoint);
	}
}

module.exports = {
	'whitelist': set.toString().slice(1, -1),
	'whitespace': whitespace.toString(),
	'version': require('../package.json').version
};
