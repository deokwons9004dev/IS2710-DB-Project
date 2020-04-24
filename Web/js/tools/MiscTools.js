/**
 * @file Misc Tools
 * @module Web/js/Tools/MiscTools
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 *
 * @requires
 */

// *********************************
// FUNCTIONS: Date Time Helpers
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
// FUNCTIONS: Wait Timers
// *********************************
function sleepMS_pnu (ms) {
	return new Promise(function (resolve) {
		var timeout = setTimeout(function () {
			return resolve();
		}, ms);
	});
}
