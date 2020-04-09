'use strict';

const regenerate = require('regenerate');

const set = regenerate()
	.addRange(0x20, 0x7E) // printable ASCII symbols
	.remove('"')          // not `"`
	.remove('\'')         // not `'`
	.remove('\\')         // not `\`
	.remove('`');         // not '`'

const whitespace = regenerate()
	.add(require('unicode-13.0.0/General_Category/Space_Separator/code-points.js'))
	.removeRange(0x20, 0x7E) // printable ASCII symbols
	.add(0x2028, 0x2029);

module.exports = {
	'whitelist': set.toString().slice(1, -1),
	'whitespace': whitespace.toString(),
	'version': require('../package.json').version
};
