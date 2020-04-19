/**
 * @file Log Tools (Level 1c)
 * @module Application/LogTools
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 *
 * @todo
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var util = require('util');
var os   = require('os');

// *********************************
// IMPORT NPM MODULES
// *********************************
var colors = require("colors");
var moment = require('moment');


// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../Application/ServerSettings.js");
const DEF = settings;

// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_misc   = require('./../Application/MiscTools.js'); // 0


// *********************************
// IMPORT CUSTOM MODULES: Objects
// *********************************


// *********************************
// IMPORT CUSTOM MODULES: Managers
// *********************************
// var m_client = require('./../manager/ClientManager.js'); // 0


// *********************************
// DEFINE EXTRA: Macros
// *********************************
var glog = global.console.log;


// *********************************
// DEFINE EXTRA
// *********************************
// const level_max = 14;
// const levels    = {}


// *********************************
// FUNCTION DEFINITIONS: Non-Export Helpers
// *********************************
function constructOutputString (callerArgObj, logType) {

	// (If given) Extract Request object, and change arguments object.
	var reqIP = '';
	if (typeof(callerArgObj[0]) === 'object' && callerArgObj[0].clientIp != undefined) {
		// glog(callerArgObj[0]);
		// glog(callerArgObj[0] instanceof 'IncomingMessage');
		reqIP = callerArgObj[0].clientIp || '';
		var callerArgObjKeyArray = Object.keys(callerArgObj);
		for (var i = 1; i < callerArgObjKeyArray.length; i++) {
			callerArgObj[i-1] = callerArgObj[i];
			// if (i == callerArgObjKeyArray.length - 1) delete callerArgObj[i];
			if (i == callerArgObjKeyArray.length - 1) callerArgObj[i] = '';
		}
	}

	// glog(callerArgObj);
	// glog(this);

	var outputString = '';
	if (DEF.appMode === 'DEV') {
		outputString = '[' + t_misc.trimDate_u(moment().toISOString()) + ']'
			+ '[' + reqIP + ']'
			+ logType
			+ '(' + t_misc.getCallerModuleNameList()[3]
			+ ':' + t_misc.getCallerList()[3] + ') '
			+ util.format.apply(null, callerArgObj)
			// + util.format.apply(this, callerArgObj)
	}
	else if (DEF.appMode === 'TEST') {
		outputString =
			'[' + t_misc.trimDate_u(moment().toISOString()) + ']'
			+ logType
			+ util.format.apply(null, callerArgObj)
	}

	// glog(outputString);
	return outputString;
}






// *********************************
// FUNCTION DEFINITIONS: Print Formaters
// *********************************
/**
 * Outputs PRINT formatting (white) applied to string arguments.
 */
function print () {
	var outputString = constructOutputString(arguments, '[PRINT  ]');
	if (os.platform() === 'darwin') process.stdout.write(outputString + '\n');
	else                            glog(outputString);
}
/**
 * Outputs DEBUG formatting (grey) applied to string arguments.
 */
function debug () {
	var outputString = constructOutputString(arguments, '[DEBUG  ]');
	if (os.platform() === 'darwin') process.stdout.write(colors.grey(outputString) + '\n')
	else                            glog(colors.grey(outputString));
}
/**
 * Outputs SUCCESS formatting (green) applied to string arguments.
 */
function success () {
	var outputString = constructOutputString(arguments, '[SUCCESS]');
	if (os.platform() === 'darwin') process.stdout.write(colors.green(outputString) + '\n')
	else                            glog(colors.green(outputString));
}
/**
 * Outputs INFO formatting (cyan) applied to string arguments.
 */
function info () {
	var outputString = constructOutputString(arguments, '[INFO   ]');
	if (os.platform() === 'darwin') process.stdout.write(colors.cyan(outputString) + '\n')
	else                            glog(colors.cyan(outputString));
}
/**
 * Outputs ERROR formatting (red) applied to string arguments.
 */
function error () {
	var outputString = constructOutputString(arguments, '[ERROR  ]');
	if (os.platform() === 'darwin') process.stdout.write(colors.red(outputString) + '\n')
	else                            glog(colors.red(outputString));
}
/**
 * Outputs WARN formatting (yellow) applied to string arguments.
 */
function warn () {
	var outputString = constructOutputString(arguments, '[WARNING]');
	if (os.platform() === 'darwin') process.stdout.write(colors.yellow(outputString) + '\n')
	else                            glog(colors.yellow(outputString));
}
/**
 * Outputs COMMIT formatting (magenta) applied to string arguments.
 * - Useful for background services that modifies data in the background.
 */
function commit () {
	var outputString = constructOutputString(arguments, '[COMMIT ]');
	if (os.platform() === 'darwin') process.stdout.write(colors.magenta(outputString) + '\n')
	else                            glog(colors.magenta(outputString));
}
/**
 * Outputs RAW formatting (no color, no prefix) applied to string arguments.
 * - Useful for using raw logging in NodeJS context.
 */
function printraw () {
	var outputString = util.format.apply(this, arguments);
	if (os.platform() === 'darwin') process.stdout.write(outputString + '\n')
	else                            glog(outputString);
}

// *********************************
// FUNCTION EXPORTS
// *********************************
exports.print    = print;
exports.debug    = debug;
exports.success  = success;
exports.info     = info;
exports.error    = error;
exports.warn     = warn;
exports.commit   = commit;
exports.printraw = printraw;
