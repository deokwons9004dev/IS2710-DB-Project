/**
 * @file Miscellaneous Tools for LonelyDuck Server (Level 0c)
 * @module Application/MiscTools
 *
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 *
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var fs = require('fs-extra');


// *********************************
// IMPORT NPM MODULES
// *********************************
var validator   = require('validator');
var psvalidator = require('password-validator');
var isValidPath = require('is-valid-path');
var moment      = require('moment');
// var portFinder  = require('portfinder');
var lodash      = require('lodash');
var geoip       = require('geoip-lite');
var countryList = require('country-list');
// var network     = require('network');
// var ip          = require('ip');
// var ip2int      = require('ip-to-int');


// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************


// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************


// *********************************
// IMPORT CUSTOM MODULES: Objects
// *********************************


// *********************************
// IMPORT CUSTOM MODULES: Managers
// *********************************


// *********************************
// DEFINE EXTRA
// *********************************
var log = console.log.bind(this);


// *********************************
// FUNCTION DEFINITIONS: Basic Verifiers
// *********************************
/**
 * (Unsafe) Checks that a given data is a non-null string.
 *
 * @param {?string|undefined} str
 * @return {boolean} - True if non-null string, False otherwise.
 */
function verifyStringNN_u (str) {
	if (str === null || str === undefined || typeof str !== 'string') return false;
	return true;
}
/**
 * (Unsafe) Checks that a given data is a valid url string.
 *
 * @param {?string|undefined} str
 * @return {boolean} - True if valid url, False otherwise.
 */
function verifyURL_u (str) {
	return verifyStringNN_u(str) && validator.isURL(str);
}
/**
 * (Unsafe) Checks that a given data is a valid uuid string (v1 ~ v5).
 *
 * @param {?string|undefined} str
 * @return {boolean} - True if valid uuid, False otherwise.
 */
function verifyUUID_u (uuid) {
	return verifyStringNN_u(uuid) && validator.isUUID(uuid);
}
/**
 * (Unsafe) Checks that a given data is a valid string represention of a potential file path.
 * - A valid file system path that does not actually exist will also return true.
 *
 * @param {?string|undefined} fullpath
 * @return {boolean} - True if valid path, False otherwise.
 */
function verifyPathValid_u (fullpath) {
	return verifyStringNN_u(fullpath) && isValidPath(fullpath);
}
/**
 * (Unsafe) Checks that the string is an existing path in the filesystem.
 *
 * @param {?string|undefined} fullpath
 * @return {boolean} - True if valid path, False otherwise.
 */
function verifyPathExists_u (fullpath) {
	return verifyStringNN_u(fullpath) && fs.pathExistsSync(fullpath);
}

// *********************************
// FUNCTION DEFINITIONS: Validators
// *********************************
/**
 * Checks the validity of the password candidate.
 * Password gets validated against the schema defined in code.
 * PasswordConfirm get validated by comparing with password.
 *
 * @param  {string} newPassword
 * @return {Object} result
 */
function isPasswordValid (newPassword) {
    var result = { errorList: [] };

    var passwordSchema = new psvalidator();
    passwordSchema
        .is().min(8)
        .is().max(100)
        .has().uppercase()
        .has().lowercase()
        .has().digits()
        // .has().symbols()
        .has().not().spaces()

    /* Check Password Validity. */
    if (!passwordSchema.validate(newPassword))
        addError(result.errorList, 'PASSWORD_INVALID');

    return result;
}
/**
 * Checks the validity of the email candidate.
 * Email get validated for correct email format.
 *
 * @param  {string} newEmail
 * @return {Object} result
 */
function isEmailValid (newEmail) {
    var result = { errorList: [] };

    /* Check Email Validity. */
    if (!validator.isEmail(newEmail))
        addError(result.errorList, 'EMAIL_INVALID_FORMAT');
    else if (newEmail.length <= 0)
        addError(result.errorList, 'EMAIL_ZERO_LENGTH');
    else if (newEmail.length > 100)
        addError(result.errorList, 'EMAIL_OVER_LENGTH');

    return result;
}

// *********************************
// FUNCTION DEFINITIONS: Misc Helpers
// *********************************
/**
 * (Unsafe) Returns a new trimmed UUID.
 *
 * @param {?string} uuid
 * @param {number}  len - How many characters from the left to keep.
 * @return {?string}
 */
function trimUUID_u (uuid, len) {
	if (!verifyStringNN_u(uuid)) return null;
	return uuid.substring(0, len);
}
/**
 * (Unsafe) Returns a new trimmed date string (to local time string).
 *
 * @param {?string} date - Date string readable by new Date().
 * @return {?string} - Local time string of the date.
 */
function trimDate_u (date) {
	if (!verifyStringNN_u(date)) return null;
	return new Date(date).toLocaleTimeString();
}
/**
 * (Unsafe) Returns a clone of an object.
 *
 * @param {?Object|undefined} obj - Original javascript object.
 * @return {?Object} - New cloned object.
 */
function deepCopy_u (obj) {
	if (obj === null     ) return null;
	if (obj === undefined) return undefined;
	return lodash.cloneDeep(obj);
}
function deepCopyArray_u (list) {
	var cloneList = [];
	for (var i = 0; i < list.length; i++) {
		cloneList.push(deepCopy_u(list[i]));
	}
	return cloneList;
}

// *********************************
// FUNCTION DEFINITIONS: Time Helpers
// *********************************
/**
 * (Unsafe) Returns a mm:ss format string from the given seconds.
 * - Values less than 60 seconds will be in 0:ss format.
 * - Values less than 10 seconds will be in 0:0s format.
 * @param {number} seconds
 * @return {string} timeString
 */
function toTimeString_u (seconds) {
	if (seconds < 10) return '0:0' + seconds;
	if (seconds < 60) return '0:' + seconds;
	if (seconds % 60 < 10) return Math.round(seconds / 60) + ':0' + (seconds % 60);
	return Math.round(seconds / 60) + ':' + (seconds % 60);
}


// *********************************
// FUNCTION DEFINITIONS: Moment Date Helpers
// *********************************
/**
 * Returns a MySQL DateTime string from a moment object.
 *
 * @param  {Object|undefined} m       - The moment object to extract string from.
 * @return {string}           mySQLDT - In 'YYYY-MM-DD HH:mm:ss' format.
 */
function getMySQLDTStringFromMoment (m) {
	if (m != undefined) return m.format('YYYY-MM-DD HH:mm:ss');
	else                return moment().format('YYYY-MM-DD HH:mm:ss');
}
// /**
//  * Gets a moment object representing a TZ date time from the given string.
//  *
//  * @param  {string} tzdtStr - The TZ date time string to set the moment to.
//  * @return {Object} - Moment object.
//  */
// function getMomentFromTZDTString (tzdtStr) {
// 	return moment(tzdtStr, 'YYYY-MM-DD HH:mm:ss ZZ');
// }
/**
 * Gets a moment object from a MySQL DateTime value.
 * - MySQL DateTime Format has "YYYY-MM-DD hh:mm:ss" formatting.
 * - We will remove the seconds and add a AM/PM to the moment object.
 *
 * @param  {String} mySQLDT - The DateTime string returned by the query.
 * @return {Object} - Moment object.
 */
function getMomentStringFromMySQLDTString (mySQLDT) {
	return moment(mySQLDT).format('YYYY-MM-DD HH:mm A');
}



// *********************************
// FUNCTION DEFINITIONS: File Size Helpers
// *********************************
/**
 * (Unsafe) Returns a file size string using the appropriate highest size format.
 * - Values less than 1KB will be in 'n Bytes'.
 * - Values less than 1MB will be in 'n KB'.
 * - Otherwise, will be in 'n MB'.
 * @param {number} seconds
 * @return {string} timeString
 */
function bytesToHighestSizeString_u (bytes) {
	if (bytes < 1024) return bytes + ' Bytes';
	if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
	return Math.round(bytes / 1048576) + ' MB';
}


// *********************************
// FUNCTION DEFINITIONS: Path Helpers
// *********************************
/**
 * Returns fullPath without the basePath part.
 * - Requires: basePath to be part of fullPath, and both paths exist.
 * - Useful for extracting a relative path from a full path.
 * - Will prune out the first '/' character of the final relpath.
 *
 * @param  {string}  fullPath - Full path string for a file or directory.
 * @param  {string}  basePath - Path string for a parent directory of the fullPath.
 * @return {?string} relPath  - Null if basePath not found in fullPath.
 */
function getRelpath_u (fullPath, basePath) {
	if (fullPath === null || fullPath === undefined) {
		error('Bad fullPath argument (%s)', fullPath);
		process.exit(0);
		// return null;
	}
	if (basePath === null || basePath === undefined) {
		error('Bad basePath argument (%s)', basePath);
		process.exit(0);
		// return null;
	}
	// if (!fs.pathExistsSync(fullPath) || !fs.pathExistsSync(basePath) || !fs.statSync(basePath).isDirectory()) {
	// 	error('Bad basePath argument (%s)', basePath);
	// 	process.exit(0);
	// 	// return null;
	// }
	if (fullPath.indexOf(basePath) !== 0) {
		error('basePath (%s) not found in fullPath (%s)', basePath, fullPath);
		process.exit(0);
		// return null;
	}
	if (basePath.length > fullPath.length) {
		error('basePath (%s) is longer than fullPath (%s)', basePath, fullPath);
		process.exit(0);
		// return null;
	}

	var relPath_raw = fullPath.substring(basePath.length);
	if      (relPath_raw.length ===   0) return '';
	else if (relPath_raw[0]     === '/') return relPath_raw.substring(1);
	else                                 return relPath_raw;
}



// *********************************
// FUNCTION DEFINITIONS: Network Helpers
// *********************************
/**
 * (Async, Unsafe) Returns the network information of this machine.
 *
 * @async
 * @return {ResolvedPromise.<{error: ?string, info: ?Object}>} result
 *
 * <strong>result.error Codes</strong>
 * - null                 - No error occurred.
 * - module error message - Error message created by the network module.
 * @example
 * // Sample output:
 * { name        : 'en0',
 *   type        : 'Wireless',
 *   ip_address  : '10.77.20.46', // Private IP
 *   mac_address : '60:03:08:a7:a4:16',
 *   gateway_ip  : '10.77.16.1',
 *   netmask     : '255.255.248.0' }
 */
function getNetworkInfo_pu () {
	return new Promise(function (resolve) {
		var result = { error: null, info: null };
		network.get_active_interface(function (err, obj) {
			if (err) {
				result.error = err.toString();
				return resolve(result);
			}
			result.info = obj;
			return resolve(result);
		});
	});
}
/**
 * (Unsafe) Returns a list of all connectable IP addresses based on the given privateIP and subnet mask.
 * - Includes the given IP.
 *
 * @param {string} myIP       - IP address of this machine.
 * @param {string} subnetMask - Subnet mask to use for calculating.
 * @return {string[]} connectableIPList
 */
function getConnectableIPAddrList_u (myIP, subnetMask) {
	var subnetInfo = ip.subnet(myIP, subnetMask);
	var currIP     = subnetInfo.firstAddress;
	var numHosts   = subnetInfo.numHosts;

	var connectableIPList = [];

	for (var i = 0; i < numHosts; i++) {
		connectableIPList.push(currIP);

		if (i === numHosts - 1) break;

		var currIPInt = ip2int(currIP).toInt();
		var nextIPInt = currIPInt + 1;
		currIP = ip2int(nextIPInt).toIP();
	}
	return connectableIPList;
}

// *********************************
// FUNCTION DEFINITIONS: Port Helpers
// *********************************
/**
 * Finds a free local port for others to connect to.
 *
 * @async
 * @return {ResolvedPromise.<{error: ?string, port: ?string}>} result
 *
 * <strong>result.error Codes</strong>
 * - null                 - No error occurred.
 * - module error message - Error message created by the port finder module.
 */
function getFreePort_p () {
	return new Promise(function (resolve) {
		portFinder.getPort(function (err, port) {
			if (err) return resolve({ error: err, port: null });
			else     return resolve({ error: null, port: port });
		});
	});
}

// *********************************
// FUNCTION DEFINITIONS: Stack Trace Helpers
// *********************************
/**
 * Returns a list of up to 10 caller function names of the caller stack.
 *
 * @return {string[]} callerList
 */
function getCallerList () {
	var trace = new Error().stack;

	// Separate string based on the 'at' string.
	var trace_at_sep_list = trace.split('    at ');

	// Remove the first 'Error\n' string.
	trace_at_sep_list.splice(0,1);

	/* Caller that has function name will look like this:
	 *     initDBCallback (/LonelyDuck/LonelyDuck/Server/main.js:219:3)
	 * But those that don't have function name will look like this:
	 *     /LonelyDuck/LonelyDuck/Server/main.js:219:3
	 * If caller does not have function name, the name will appear as "Anonymous".
	 */
	var trace_caller_name_list = trace_at_sep_list.map(function (callerLine) {
		var callerLineSpaceSplitList = callerLine.split(' ');
		if (callerLineSpaceSplitList.length === 1)
			return 'Anonymous';
		return callerLineSpaceSplitList[0];
	});

	return trace_caller_name_list;
}
/**
 * Returns a list of up to 10 callers of the function from the given stack trace.
 *
 * @param  {string}   trace
 * @return {string[]} callerList
 */
function getCallerListFromTrace (trace) {
	// Separate string based on the 'at' string.
	var trace_at_sep_list = trace.split('    at ');
	// Remove the first 'Error\n' string.
	trace_at_sep_list.splice(0,1);
	// Map each caller line to its function names.
	var trace_caller_name_list = trace_at_sep_list.map(function (callerLine) {
		return callerLine.split(' ')[0];
	});
	return trace_caller_name_list;
}
/**
 * Returns the list of filenames (with ext) of the caller stack.
 * From immediate caller to last caller.
 *
 * @return {string} - String of the filename of the caller module.
 */
function getCallerModuleNameList () {
	var trace = new Error().stack;

	// Get a list split by \n.
	var trace_nl_sep_list      = trace.split('\n');

	// Get the sublist without the first 'Error' item.
	trace_nl_sep_list = trace_nl_sep_list.slice(1);

	/* Each item in trace_nl_sep_list has format like this:
	 * 'at Object.addError (/Volumes/SSD_2TB/Dropbox/Projects/LonelyDuck/LonelyDuck/Server/Modules/Application/MiscTools.js:406:6)'
	 * Each of these will be reduced to a format like this:
	 * 'MiscTools'
	 */
	var trace_module_name_list = trace_nl_sep_list.map(function (callerLine) {
		var callerLine_sep_colon_list    = callerLine.split(':');
		var callerLine_sep_colon_extract = callerLine_sep_colon_list[0];

		var callerLine_sep_slash_list    = callerLine_sep_colon_extract.split('/');
		var callerLine_sep_slash_extract = callerLine_sep_slash_list[callerLine_sep_slash_list.length - 1];
		return callerLine_sep_slash_extract
	});

	return trace_module_name_list;
}

// *********************************
// FUNCTION DEFINITIONS: Error Helpers
// *********************************
/**
 * Ensures that the given object has the errorList array property.
 * - Any object that has this format is called an ELParent.
 * - Throws error if obj is not an ELParent.
 * @param {Object} obj
 */
function ensureELParent_n (obj) {
	if (obj == undefined || obj.errorList == undefined)
		throw new Error('Object does not have errorList property.');
	if (typeof(obj.errorList) != 'object' || !Array.isArray(obj.errorList))
		throw new Error('.errorList is not an array.');
}
/**
 * Adds an error object to the given error list.
 * This function will automitically attach the caller's module name and function
 * to the object.
 *
 * @param  {Object[]} errorList
 * @param  {string}   errorName
 * @param  {string}   errorDetail
 */
function addError (errorList, errorName, errorDetail) {
	// log(getCallerModuleNameList());
	// log(getCallerList());

	errorList.push({
		module     : getCallerModuleNameList()[2],
		function   : getCallerList()[2],
		error      : errorName,
		errorDetail: errorDetail
	});
}
/**
 * Returns the same errorList, with a new error object pushed to the end of list.
 *
 * @param  {Object[]}                     errorList   - Current error list.
 * @param  {string}                       errorName   - Name of the new error.
 * @param  {string|Object|null|undefined} errorDetail - Details of the error.
 *
 * @return {Object[]} errorList - Updated error list.
 */
function pushedEL (errorList, errorName, errorDetail) {
	errorList.push({
		module     : getCallerModuleNameList()[2],
		function   : getCallerList()[2],
		error      : errorName,
		errorDetail: errorDetail
	});
	return errorList;
}
/**
 * Returns the same Object containing the errorlist, with a new error object
 * pushed to the end of list.
 * - This follows the convention where almost every async helper function
 *   resolves with an object that contains an errorList array.
 *
 * @param  {Object}                       errorParent - Object containing the errorList.
 * @param  {string}                       errorName   - Name of the new error.
 * @param  {string|Object|null|undefined} errorDetail - Details of the error.
 *
 * @return {Object} errorParent - Same errorParent with updated errorList.
 */
function pushedELParent (errorParent, errorName, errorDetail) {
	ensureELParent_n(errorParent);

	errorParent.errorList.push({
		module     : getCallerModuleNameList()[2],
		function   : getCallerList()[2],
		error      : errorName,
		errorDetail: errorDetail
	});
	return errorParent;
}
/**
 * Returns the merged EL parent from the given two EL parents.
 * - The errors of ELParent2 will be pushed behind those of ELParent1.
 * - All the other properties of each ELParent will just be merged together
 *   using spread operator.
 * - If two have property with same name, ELParent2 will overwrite it.
 *
 * @param  {Object} ELParent1 - Object containing the errorList.
 * @param  {Object} ELParent2 - Object containing the errorList.
 *
 * @return {Object} Merged object.
 */
function mergeELParents (ELParent1, ELParent2) {
	ensureELParent_n(ELParent1);
	ensureELParent_n(ELParent2);

	var mergedEL = ELParent1.errorList.concat(ELParent2.errorList);
	var mergedELParent = {...ELParent1, ...ELParent2};
	mergedELParent.errorList = mergedEL;
	return mergedELParent;
}
/**
 * Returns the list of all error names from the list of error objects.
 *
 * @param  {Object[]} errorList
 * @param  {string}   errorName
 * @param  {string}   errorDetail
 */
function getErrorNameList (errorList) {
	return errorList.map(function (errorObj) { return errorObj.error; });
}
/**
 * Checks whether the given object has a non-empty errorList property.
 * - This follows the convention where almost every async helper function
 *   resolves with an object that contains an errorList array.
 *
 * @param  {Object} errorParent - Object containing the errorList.
 * @return {boolean} true if object has non-empty errorList, false otherwise.
 */
function hasELError (errorParent) {
	ensureELParent_n(errorParent);

	return errorParent.errorList.length > 0;
}


// *********************************
// FUNCTION DEFINITIONS: Wait Timers
// *********************************
function sleepMS_pnu (ms) {
	return new Promise(function (resolve) {
		var timeout = setTimeout(function () {
			return resolve();
		}, ms);
	});
}


// *********************************
// FUNCTION DEFINITIONS: License Key Generator
// *********************************
/**
 * Generates a random license key.
 *
 * @param  {number}            lcKeyLength     - Desired license key length.
 * @param  {number}            lcKeyGroupCount - How many characters before a dash.
 * @param  {charSet|undefined} charSet         - (Optional) The character set to use.
 * @return {string} lcKey
 */
function generateNewLicenseKey (lcKeyLength, lcKeyGroupCount, charSet) {
	charSet           = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var lcKey         = '';
	var charSetLength = charSet.length;
	for (var i = 0; i < lcKeyLength; i++) {
		if (i % lcKeyGroupCount == 0 && i > 0) lcKey += '-';
		lcKey += charSet.charAt(Math.floor(Math.random() * charSetLength));
	}
	return lcKey;
}


// *********************************
// FUNCTION DEFINITIONS: String Helpers
// *********************************
/**
 * (Unsafe) Generates a random string of the given size.
 *
 * @param  {number} size - Megabytesw
 * @return {string} str
 */
function generateStringMB_u (size) {
	var text     = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < size * 1024 * 1024; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}
/**
 * Returns a new UUID string using the given UUID string without dashes.
 * - If the given UUID already has dashes, they will be stripped away first.
 * - The original UUID without dashes must still be valid (32 chars).
 * @param  {string} originalUUID - Original UUID string
 * @return {string|null} uuidStr - Null if error.
 */
function getUUIDFromNoDashUUID (originalUUID) {
	originalUUID = originalUUID.replace(/-/g, '');
	if (originalUUID.length != 32) return null;

	var uuidStr = '';
	uuidStr += originalUUID.substring(0,8) + '-';
	uuidStr += originalUUID.substring(8,12) + '-';
	uuidStr += originalUUID.substring(12,16) + '-';
	uuidStr += originalUUID.substring(16,20) + '-';
	uuidStr += originalUUID.substring(20,32);
	return uuidStr;
}

// *********************************
// FUNCTION DEFINITIONS: Random Number Generators
// *********************************
/**
 * (Unsafe) Generates a random number from the given range.
 * - min and max inclusive.
 * @param  {number} min
 * @param  {number} max
 * @return {number}
 */
function randNum_u (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
/**
 * (Unsafe) Generates a random float from the given range.
 * - min and max inclusive.
 * - Up to 4 decimal places.
 * @param  {number} min
 * @param  {number} max
 * @return {number}
 */
function randFloat_u (min, max, precision) {
	if (!precision) precision = 4;
    return (Math.random() * (max - min) + min).toFixed(precision);
}


// *********************************
// FUNCTION DEFINITIONS: Web Helpers
// *********************************
/**
 * (Async, Empty, Unsafe) Waits for jquery to load.
 * @param {Object} window - Main browser window.
 */
async function waitForJquery_pnu (window) {
	while (!window.jQuery) {
		await sleepMS_pnu(50);
	}
}
/**
 * (Async, Empty, Unsafe) Waits for DOM to load.
 * @param {Object} document - Main browser document.
 */
async function waitForDOM_pnu (document) {
	while (document.readyState !== 'complete') {
		await sleepMS_pnu(50);
	}
}


// *********************************
// FUNCTION DEFINITIONS: Geolocation
// *********************************
function getIPGeoLocation (ipAddr) {
	var geoData     = geoip.lookup(ipAddr);
	var cityName    = null;
	var countryCode = null;
	var finalString = '';

	if (geoData && geoData.country
		&& typeof(geoData.country) === 'string'
		&& geoData.country.length > 0)
		countryCode = geoData.country;

	if (geoData && geoData.city
		&& typeof(geoData.city) === 'string'
		&& geoData.city.length > 0)
		cityName = geoData.city;

	if (cityName) finalString += cityName;
	if (countryCode) {
		if (!cityName) finalString += countryList.getName(countryCode);
		else           finalString += ', ' + countryCode;
	}

	return finalString;
}




// *********************************
// FUNCTION EXPORTS
// *********************************
exports.verifyStringNN_u   = verifyStringNN_u;
exports.verifyURL_u        = verifyURL_u;
exports.verifyUUID_u       = verifyUUID_u;
exports.verifyPathValid_u  = verifyPathValid_u;
exports.verifyPathExists_u = verifyPathExists_u;


// Validators
exports.isPasswordValid = isPasswordValid;
exports.isEmailValid    = isEmailValid;


// Object Modifiers
exports.trimUUID_u      = trimUUID_u;
exports.trimDate_u      = trimDate_u;
exports.deepCopy_u      = deepCopy_u;
exports.deepCopyArray_u = deepCopyArray_u;


// Date & Time helpers
exports.toTimeString_u                   = toTimeString_u;
exports.getMySQLDTStringFromMoment       = getMySQLDTStringFromMoment;
exports.getMomentStringFromMySQLDTString = getMomentStringFromMySQLDTString;

exports.bytesToHighestSizeString_u = bytesToHighestSizeString_u;

exports.getRelpath_u = getRelpath_u;

exports.getNetworkInfo_pu           = getNetworkInfo_pu;
exports.getConnectableIPAddrList_u  = getConnectableIPAddrList_u;

exports.getFreePort_p  = getFreePort_p;

// Stack trace helpers
exports.getCallerList           = getCallerList;
exports.getCallerListFromTrace  = getCallerListFromTrace;
exports.getCallerModuleNameList = getCallerModuleNameList;

// Error helpers
exports.ensureELParent_n  = ensureELParent_n;
exports.addError          = addError;
exports.pushedEL          = pushedEL;
exports.pushedELParent    = pushedELParent;
exports.mergeELParents    = mergeELParents;
exports.getErrorNameList  = getErrorNameList;
exports.hasELError        = hasELError;

exports.sleepMS_pnu  = sleepMS_pnu;

// License key generator
exports.generateNewLicenseKey  = generateNewLicenseKey;

// String helpers
exports.generateStringMB_u    = generateStringMB_u;
exports.getUUIDFromNoDashUUID = getUUIDFromNoDashUUID;

exports.randNum_u   = randNum_u;
exports.randFloat_u = randFloat_u;

exports.waitForJquery_pnu = waitForJquery_pnu;
exports.waitForDOM_pnu    = waitForDOM_pnu;

// Geolocation Helpers
exports.getIPGeoLocation = getIPGeoLocation;





// *********************************
// FUNCTION TESTS
// *********************************
// function getRelPath_test1 () {
// 	var fp1   = '/Users/deokwons9004/Documents/syncdir1/Group123(90fd74)/VEX/priv/libvex_amd64_darwin_a-guest_amd64_helpers.o';
// 	var bp1_1 = '';
// 	var bp1_2 = '/';
// 	var bp1_3 = '/Users';
// 	var bp1_4 = '/Users/';
// 	var bp1_5 = '/Users/deokwons9004/Documents/syncdir1/Group123(90fd74)/VEX/priv';
//
// 	console.log(getRelpath_u(fp1,bp1_1));
// 	console.log(getRelpath_u(fp1,bp1_2));
// 	console.log(getRelpath_u(fp1,bp1_3));
// 	console.log(getRelpath_u(fp1,bp1_4));
// 	console.log(getRelpath_u(fp1,bp1_5));
// }
//
// function genString_test1 () {
// 	var s = generateString_u(1);
// 	console.log(s);
// }
//
// function getConnectableIPAddrList_u_test1 () {
// 	var l = getConnectableIPAddrList_u('10.77.20.46', '255.255.248.0');
// 	console.table(l);
// }
//
// function deepCopyArray_test1 () {
// 	var a = [1,2,3,4,5];
// 	var b = a;
// 	var c = deepCopyArray_u(a);
//
// 	console.log(a == b);
// 	console.log(a === b);
// 	console.log(a == c);
// 	console.log(a === c);
// 	console.log(c);
// }

function uuidTest () {
	var uuid1 = 'b710fe1ea7b34f58b4d2e85a311354a9';
	log(getUUIDFromNoDashUUID(uuid1));
	var uuid2 = 'a886968e-8b58-4d56-95ac-bbf75f287dcb';
	log(getUUIDFromNoDashUUID(uuid2));
	log('Finished!');
}

function moment_test1 () {
    var dateTimeStamp = getTZDTStringFromMoment();
    log(dateTimeStamp);
}

function pushedEL_test1 () {
	var r = { errorList: [] };
	return pushedEL(r.errorList, 'TEST_ERROR', { attr1: 'doggo' });
}
function pushedEL_test2 () {
	var r = pushedEL_test1();
	return pushedEL(r, 'TEST_ERROR_2', null);
}

function throwErrorTest1 () {
	throw new Error({ ERROR: 'TEST1', DETAILS: 69 });
}
function throwErrorTest2 () {
	var e = new Error();
	e.name    = 'LonelyDuckError';
	e.message = 'Some internal error occurred!';
	throw e;

	log('Does this happen?');
	return;
}
function throwErrorTest3 () {
	var e = new Error('Some internal error occurred!');
	e.name = 'LonelyDuckError';
	throw e;

	log('Does this happen?');
	return;
}

function pushedELParent_test1 () {
	var r = { errorList: [] };
	r = pushedELParent(r, 'TEST_ERROR_0', [1,2,3,4,5]);
	r = pushedELParent(r, 'TEST_ERROR_1', { attr1: 'doggo' });
	r = pushedELParent(r, 'TEST_ERROR_2', 'some detailed text');
	r = pushedELParent(r, 'TEST_ERROR_3', null);
	r = pushedELParent(r, 'TEST_ERROR_4');
	return r;
}
function pushedELParent_test2 () {
	var r2 = pushedELParent_test1();
	r2 = pushedELParent(r2, 'NEW_ERROR_0', [1,2,3,4,5]);
	r2 = pushedELParent(r2, 'NEW_ERROR_1', { attr1: 'doggo' });
	r2 = pushedELParent(r2, 'NEW_ERROR_2', 'some detailed text');
	r2 = pushedELParent(r2, 'NEW_ERROR_3', null);
	r2 = pushedELParent(r2, 'NEW_ERROR_4');
	return r2;
}

async function testAsync () {
	// var elist = pushedEL_test1();
	// log(elist);

	// var elist = pushedEL_test2();
	// log(elist);

	// try {
	// 	throwErrorTest1();
	// } catch (e) {
	// 	log('Caught error:', e);
	// 	log('Caught error:', e.toString());
	// } finally {
	// 	log('Finished catching error.');
	// }

	// throwErrorTest2();

	// try {
	// 	throwErrorTest2();
	// }
	// catch (e) {
	// 	log('Caught error:', e);
	// }

	// try {
	// 	throwErrorTest3();
	// }
	// catch (e) {
	// 	log('Caught error:', e);
	// 	log('Error msg:', e.message);
	// }

}

function testSync () {
	// throwErrorTest3();
	var r = pushedELParent_test2();
	log(r);
}

// testSync();
// testAsync();
