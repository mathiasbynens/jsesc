'use strict';

const regenerate = require('regenerate');

const set = regenerate()
	.addRange(0x20, 0x7E) // printable ASCII symbols
	.remove('"')          // not `"`
	.remove('\'')         // not `'`
	.remove('\\')         // not `\`
	.remove('`');         // not '`'

module.exports = {
	'whitelist': set.toString().slice(1, -1),
	'version': require('../package.json').version
};
