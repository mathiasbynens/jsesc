var regenerate = require('regenerate');



// if (/[\x20\x21\x23-\x26\x28-\x5B\x5D-\x7E]/.test(character)) {
// 	// It’s a printable ASCII character that is not `"`, `'` or `\`,
// 	// so don’t escape it.
// 	return character;
// }

var set = regenerate()
	.addRange(0x20, 0x7E) // printable ASCII symbols
	.remove('"')          // not `"`
	.remove('\'')         // not `'`
	.remove('\\');        // not `\`

module.exports = {
	'whitelist': set.toString()
};
