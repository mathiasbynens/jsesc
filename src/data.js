'use strict';

const regenerate = require('regenerate');
const fs = require('fs');

const set = regenerate()
	.addRange(0x20, 0x7E) // printable ASCII symbols
	.remove('"')          // not `"`
	.remove('\'')         // not `'`
	.remove('\\');        // not `\`

module.exports = {
	'whitelist': set.toString(),
	'version': require('../package.json').version
};
