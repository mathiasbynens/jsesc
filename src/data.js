'use strict';

const regenerate = require('regenerate');

function createAsciiSet() {
	return regenerate()
		.addRange(0x20, 0x7E) // printable ASCII symbols
		.remove('"')          // not `"`
		.remove('\'')         // not `'`
		.remove('\\')         // not `\`
		.remove('`');         // not '`'
}

const set = createAsciiSet();

const extendedSet = createAsciiSet()
	.addRange(0x80, 0xFE); // printable extended ASCII symbols

module.exports = {
	'whitelist': set.toString(),
	'whitelistExtended': extendedSet.toString(),
	'version': require('../package.json').version
};
