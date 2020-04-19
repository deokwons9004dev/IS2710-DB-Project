/**
 * @file Remove Expired Sessions Service
 * @module service/RemoveExpiredSessions
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************

// *********************************
// IMPORT NPM MODULES
// *********************************
var moment = require('moment');

// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../Application/ServerSettings.js");
const DEF    = settings;

// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_misc   = require('./../Application/MiscTools.js');
var t_log    = require('./../Application/LogTools.js');
var t_db     = require('./../Application/DatabaseTools.js');

// *********************************
// IMPORT CUSTOM MODULES: Objects
// *********************************

// *********************************
// IMPORT CUSTOM MODULES: Managers
// *********************************
var m_ser = require('./../Manager/ServerManager.js');
const SVM = m_ser.ServerManager;

// *********************************
// DEFINE EXTRA
// *********************************
var log      = console.log.bind(this);
var print    = t_log.print;
var success  = t_log.success;
var info     = t_log.info;
var error    = t_log.error;
var warn     = t_log.warn;
var debug    = t_log.debug;
var commit   = t_log.commit;
var printraw = t_log.printraw;


// *********************************
// DEFINE EXTRA: Module Globals
// *********************************
/**
 * @access private
 * @type {Timeout} Main Background Service Interval
 */
var serviceID = null;


// *********************************
// NON-EXPORT HELPERS
// *********************************
async function action_p () {
    var result = { errorList: [] };

    // Get the mysql DB from server manager.
    var client   = SVM.getDatabase();
    var sRowList = null;

    // (DB) Get all the session rows from table Sessions.
    var sListQueryResult = await t_db.getAllSessionRows_p(client);
    if (sListQueryResult.errorList.length > 0) return payQueryResult;
    sRowList = sListQueryResult.sessionRowList || [];

    // (DB) For each session row in sessions, remove if expired.
    for (var i = 0; i < sRowList.length; i++) {
        var sRow = sRowList[i];
        var sRowExpireMoment = t_misc.getMomentFromTZDTString(sRow.sessionExpire);
        // if (sRowExpireMoment.isAfter(moment())) {
        if (moment().isAfter(sRowExpireMoment)) {
            var sDeleteResult = await t_db.deleteSessionRowByKey_p(sRow.sessionKey, client);
            if (sDeleteResult.errorList.length > 0) return sDeleteResult;
            debug('Removed Session (%s,%s,%s,%s).', sRow.sessionKey, sRow.sessionEmail, sRow.sessionIP, sRow.sessionExpire);
        }
    }

    return result;
}

async function timeout_pn () {
    clearInterval(serviceID);

    var sCleanResult = await action_p();
    if (sCleanResult.errorList.length > 0) {
        error('Expired session clean failed.');
        error(sCleanResult.errorList);
        process.exit(0);
    }

    serviceID = setInterval(timeout_pn, DEF.SERVICE.intervals.sessionClean);
    return;
}



// *********************************
// STATIC OBJECT: Session Service
// *********************************
/**
 * Static object that supplies utilities for managing the background Session services.
 * - The main job of this service is to remove expired session rows from DB.
 *
 * @namespace
 */
var SessionCleanerService = {
	/**
	 * Creates and starts the background Session cleaner interval.
	 * - If Session BackgroundServiceInverval is already running, we simply return.
	 */
	startService: function () {
		if (serviceID != null) {
			warn('(End) Session cleaner service is already running.');
			return;
		}

		serviceID = setInterval(timeout_pn, DEF.SERVICE.intervals.sessionClean);
	},
	/**
	 * Stops the background Session cleaner interval.
	 * - If Session BackgroundServiceInverval is already gone, we simply return.
	 */
	stopService: function () {
		if (serviceID == null) {
			warn('(End) Session cleaner service is not running.');
			return;
		}
		clearInterval(serviceID);
		serviceID = null;
	}
}

// *********************************
// FUNCTION EXPORTS
// *********************************
exports.SessionCleanerService = SessionCleanerService;



// *********************************
// FUNCTION TESTS
// *********************************
