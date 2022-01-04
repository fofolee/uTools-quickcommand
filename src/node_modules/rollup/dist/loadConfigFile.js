/*
  @license
	Rollup.js v2.62.0
	Fri, 24 Dec 2021 06:27:02 GMT - commit 81ce56f87de5fae51c00c4a0a977830ee93c5987


	https://github.com/rollup/rollup

	Released under the MIT License.
*/
'use strict';

require('fs');
require('path');
require('url');
const loadConfigFile_js = require('./shared/loadConfigFile.js');
require('./shared/rollup.js');
require('./shared/mergeOptions.js');
require('process');
require('tty');
require('crypto');
require('events');



module.exports = loadConfigFile_js.loadAndParseConfigFile;
//# sourceMappingURL=loadConfigFile.js.map
