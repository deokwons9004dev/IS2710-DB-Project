/**
 * @file Server Manager (Level 0c)
 * @module manager/ServerManager
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var path = require('path');
var fs   = require('fs-extra');


// *********************************
// IMPORT NPM MODULES
// *********************************
// var urlparse = require('url-parse');
var asyncMutex = require('async-mutex').Mutex;


// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require('./../Application/ServerSettings.js');
const DEF = settings;


// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
// var t_misc = require('./../application/MiscTools.js');
var t_log = require('./../Application/LogTools.js'); // 1


// *********************************
// DEFINE EXTRA: Macros
// *********************************
var log      = console.log.bind(this);
var success  = t_log.success;
var info     = t_log.info;
var error    = t_log.error;
var warn     = t_log.warn;
var debug    = t_log.debug;
var print    = t_log.print;
var commit   = t_log.commit;
var printraw = t_log.printraw;


// *********************************
// DEFINE EXTRA: Module Globals
// *********************************

/* MySQL Database */
var mysqlDB = null;


/* Async Lock/Unlock */
var masterMutex   = null;
var masterRelease = null;

// *********************************
// STATIC OBJECT: Server Manager
// *********************************
/**
 * Static object that supplies utilities for managing the server information and properties.
 * @namespace
 */
var ServerManager = {

	// *********************************
	// GETTERS
	// *********************************
	//------------------------
	// Getters: MySQL Database
	//------------------------
	getDatabase             : function () { return mysqlDB; },





	// *********************************
	// SETTERS
	// *********************************
	//------------------------
	// Setters: MySQL Database
	//------------------------
	setDatabase             : function (db_new) { mysqlDB = db_new; },



	//------------------------
	// Mutex Lock Helpers
	//------------------------
	initMasterLock:       function () { masterMutex   = new asyncMutex(); },
	lockMaster_p  : async function () { masterRelease = await masterMutex.acquire(); },
	unlockMaster  :       function () {
		if (masterRelease != null) {
			var tempRelease = masterRelease;
			masterRelease = null;
			tempRelease();
		}
		else {
			error('(FATAL) Unlocking a NULL Lock. Something is terribly wrong.');
			process.exit(0);
		}
	}
}


// *********************************
// FUNCTION EXPORTS
// *********************************
exports.ServerManager = ServerManager;
