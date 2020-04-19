/**
 * @file Database Tools
 * @module Modules/Application/DatabaseTools
 *
 * Contains all essential database command helpers.
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 *
 * @todo hubabuba!
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var cp = require("child_process");

// *********************************
// IMPORT NPM MODULES
// *********************************
// var async     = require("async");
var colors    = require("colors");
var moment    = require("moment");
// var uuidv4    = require("uuid/v4");
// var bcp       = require("bcrypt-nodejs");

// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../Application/ServerSettings.js");
const DEF    = settings;

// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_misc  = require('./../Application/MiscTools.js');
var t_log   = require('./../Application/LogTools.js');

// *********************************
// IMPORT CUSTOM MODULES: Objects
// *********************************

// *********************************
// IMPORT CUSTOM MODULES: Managers
// *********************************

// *********************************
// DEFINE EXTRA: Macros
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
// DEFINE EXTRA
// *********************************

/* Import Custom Modules */
// var EmailTools = require("./../Application/EmailTools.js");
var Settings   = require("./../Application/ServerSettings.js");
// var DateTools  = require("./../Application/DateTools.js");






// *********************************
// NON-EXPORT HELPERS
// *********************************
/**
 * @async
 * Executes the query and return a promise.
 *
 * @param  {string}        queryStatement
 * @param  {string|Object} queryData
 * @param  {Object}        client
 * @return {Object} result - Includes rows
 */
function execQuery_p (queryStatement, queryData, client) {
    return new Promise(function (resolve) {
        var result = { errorList: [], rows: null };
        client.query(queryStatement, queryData, function (err, rows) {
            if (err)
                t_misc.addError(result.errorList, 'DB_QUERY_EXEC_ERROR', err.toString());
            else if (rows && rows.length > 0)
                result.rows = rows;
            return resolve(result);
        });
    });
}


/*
 * =================================
 * SELECTION SECTION
 * =================================
 */
/**
 * @async
 * Gets the table row from Members table using the given email.
 *
 * @param  {string} email
 * @param  {Object} client
 * @return {Object} result - Includes memberRow.
 */
function getMemberRowByEmail_p (email, client) {
    return new Promise (function (resolve, reject) {
        var result = { errorList: [], memberRow: null };

        client.query("SELECT * FROM Members WHERE memberEmail = ?", email, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.memberRow = rows[0];
            return resolve(result);
        });
    });
}

/**
 * @async
 * Gets the session row from Sessions table.
 * Searches using the given unique sessionKey and sessionIP.
 *
 * @param  {string} sessionKey
 * @param  {string} sessionIP
 * @param  {Object} client
 * @return {Object} result - Includes sessionRow object.
 */
function getSessionRowByKeyIP_p (sessionKey, sessionIP, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], sessionRow: null };
        var queryRow = [ sessionKey, sessionIP ];

        client.query("SELECT * FROM Sessions WHERE sessionKey = ? AND sessionIP = ?", queryRow, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.sessionRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets a single license row from Licenses table.
 * Searches using the given unique license key.
 *
 * @param  {string} licenseKey
 * @param  {Object} client
 * @return {Object} result - Includes sessionRow object.
 */
function getLicenseRowByKey_p (licenseKey, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], licenseRow: null };
        var queryRow = [ licenseKey ];

        client.query("SELECT * FROM Licenses WHERE lcKey = ?", queryRow, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.licenseRow = rows[0];
            return resolve(result);
        });
    });
}

/**
 * @async
 * Gets a product row from Products table.
 * Searches using the unique product code.
 *
 * @param  {string} productCode
 * @param  {Object} client
 * @return {Object} result - Includes productRow object.
 */
function getProductRowByCode_p (productCode, client) {
    return new Promise (function (resolve, reject) {
        var result = { errorList: [], productRow: null };

        client.query("SELECT * FROM Products WHERE pdCode = ?", productCode, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.productRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets a payment row from Payments table.
 * Searches using the unique paypal order ID.
 *
 * @param  {string} orderID
 * @param  {Object} client
 * @return {Object} result - Includes paymentRow object.
 */
function getPaymentRowByOrderID_p (orderID, client) {
    return new Promise (function (resolve, reject) {
        var result = { errorList: [], paymentRow: null };

        client.query("SELECT * FROM Payments WHERE payOrderID = ?", orderID, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.paymentRow = rows[0];
            return resolve(result);
        });
    });
}
/**
* @async
* Gets an EmailRequest row from the EmailRequests table.
* Searches using the unique reqCode.
*
* @param  {string} reqCode
* @param  {Object} client
* @return {PromiseObject} result - Includes emailRequestRow object.
*/
async function getEmailRequestRowByCode_p (reqCode, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], emailRequestRow: null };
        var queryRow = [ reqCode ];

        client.query("SELECT * FROM EmailRequests WHERE reqCode = ?", queryRow, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.emailRequestRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get the device row from the Devices table.
 * Searches using the given device UUID.
 *
 * @param  {string} devUUID
 * @param  {Object} client
 * @return {Object} result - ELFormat including deviceRow.
 */
function getDeviceRowByUUID_p (devUUID, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], deviceRow: null };
        var queryRow = [ devUUID ];

        client.query("SELECT * FROM Devices WHERE devUUID = ?", queryRow, function (err, rows) {
            if (err)                  t_misc.addError(result.errorList, 'DB_SELECT_ERROR', err.toString());
            else if (rows.length > 0) result.deviceRow = rows[0];
            return resolve(result);
        });
    });
}











/*
 * =================================
 * SELECTION SECTION (Multiple, Condition)
 * =================================
 */
/**
 * @async
 * Get all license rows from the Licenses table.
 * Searches using the given email.
 *
 * @param  {string} email
 * @param  {Object} client
 * @return {Object} result - Includes licenseRowList.
 */
function getAllLicenseRowsByEmail_p (email, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], licenseRowList: null };
        var queryRow = [ email ];

        client.query("SELECT * FROM Licenses WHERE lcMemberEmail = ?", queryRow, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.licenseRowList = rows;
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get all device rows from the Devices table.
 * Searches using the given license key.
 *
 * @param  {string} licenseKey
 * @param  {Object} client
 * @return {Object} result - Includes deviceRowList.
 */
function getAllDeviceRowsByKey_p (licenseKey, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], deviceRowList: null };
        var queryRow = [ licenseKey ];

        client.query("SELECT * FROM Devices WHERE devLicenseKey = ?", queryRow, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.deviceRowList = rows;
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get all device rows from the Devices table.
 * Searches using the given device UUID.
 *
 * @param  {string} licenseKey
 * @param  {Object} client
 * @return {Object} result - Includes deviceRowList.
 */
function getAllDeviceRowsByUUID_p (devUUID, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], deviceRowList: null };
        var queryRow = [ devUUID ];

        client.query("SELECT * FROM Devices WHERE devUUID = ?", queryRow, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.deviceRowList = rows;
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get all rows from the Activations table.
 * Searches using the given license key.
 *
 * @param  {string} lcKey
 * @param  {Object} client
 * @return {Object} result - Includes actRowList, which is null if empty.
 */
function getAllActRowsByLcKey_p (lcKey, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], actRowList: null };
        var queryRow = [ lcKey ];

        client.query("SELECT * FROM Activations WHERE actLcKey = ?", queryRow, function (error, rows) {
            if      (error)           t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0) result.actRowList = rows;
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get all rows from the Activations table.
 * Searches using the given device UUID.
 *
 * @param  {string} devUUID
 * @param  {Object} client
 * @return {Object} result - Includes actRowList, which is null if empty.
 */
function getAllActRowsByDevUUID_p (devUUID, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], actRowList: null };
        var queryRow = [ devUUID ];

        client.query("SELECT * FROM Activations WHERE actDevUUID = ?", queryRow, function (error, rows) {
            if      (error)           t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0) result.actRowList = rows;
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get all rows from the Activations table.
 * Searches using the given device UUID and license key.
 *
 * @param  {string} devUUID
 * @param  {string} lcKey
 * @param  {Object} client
 * @return {Object} result - Includes actRowList, which is null if empty.
 */
function getAllActRowsByDevUUIDWithLcKey_p (devUUID, lcKey, client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], actRowList: null };
        var queryRow = [ devUUID, lcKey ];

        client.query("SELECT * FROM Activations WHERE actDevUUID = ? and actLcKey = ?", queryRow, function (error, rows) {
            if      (error)           t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0) result.actRowList = rows;
            return resolve(result);
        });
    });
}









/*
 * =================================
 * SELECTION SECTION (Multiple, No Condition)
 * =================================
 */
/**
 * @async
 * Get all session rows from the Sessions table.
 * No search.
 *
 * @param  {Object} client
 * @return {Object} result - Includes sessionRowList.
 */
function getAllSessionRows_p (client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], sessionRowList: null };

        client.query("SELECT * FROM Sessions", function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.sessionRowList = rows;
            return resolve(result);
        });
    });
}
/**
 * @async
 * Get all product rows from the Products table.
 * No search.
 *
 * @param  {Object} client
 * @return {Object} result - Includes productRowList.
 */
function getAllProductRows_p (client) {
    return new Promise (function (resolve, reject) {
        var result   = { errorList: [], productRowList: null };

        client.query("SELECT * FROM Products", function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.productRowList = rows;
            return resolve(result);
        });
    });
}






/*
 * =================================
 * INSERT SECTION
 * =================================
 */

/**
 * @async
 * Inserts a new row in the Members table.
 *
 * @param  {Object} insertObj
 * @param  {Object} client
 * @return {Object} result
 */
async function insertNewMemberRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result       = { errorList: [] };
        var newMemberRow = [
            insertObj.memberEmail,
            insertObj.memberPass,
            insertObj.memberAuth,
            insertObj.memberVerify
        ];

        client.query("INSERT INTO Members VALUES (?,?,?,?)", newMemberRow, function (err) {
            if (err)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', err.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Generates and inserts a new login session to Sessions table.
 * Generated session will expire after 90 days.
 *
 * @param  {Object} insertObj
 * @param  {Object} client
 * @return {Object} result
 */
function insertNewSessionRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result        = { errorList: [] };
        var newSessionRow = [
            insertObj.sessionKey,
            insertObj.sessionEmail,
            insertObj.sessionIP,
            insertObj.sessionExpire
        ];

        client.query("INSERT INTO Sessions VALUES (?,?,?,?)", newSessionRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', error.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Inserts a new row in the Devices table.
 *
 * @param  {Object} insertObj
 * @param  {Object} client
 * @return {Object} result
 */
function insertNewDeviceRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result        = { errorList: [] };
        var newDeviceRow = [
            insertObj.devUUID,
            // insertObj.devLicenseKey,
            insertObj.devName,
            insertObj.devPlatform,
            insertObj.devDistro,
            insertObj.devRelease,
            insertObj.devArch,
            insertObj.devIP,
            insertObj.devGeo,
            insertObj.devDate
            // insertObj.devAppVer
        ];

        client.query("INSERT INTO Devices VALUES (?,?,?,?,?,?,?,?,?)", newDeviceRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', error.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Inserts a new row in the Licenses table.
 *
 * @param  {Object} insertObj
 * @param  {Object} client
 * @return {Object} result
 */
function insertNewLicenseRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result        = { errorList: [] };
        var newLicenseRow = [
            insertObj.lcKey,
            insertObj.lcOrderID,
            insertObj.lcMemberEmail,
            insertObj.lcProductCode,
            insertObj.lcPaymentUSD,
            insertObj.lcActive
        ];

        client.query("INSERT INTO Licenses VALUES (?,?,?,?,?,?)", newLicenseRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', error.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Inserts a new row in the Payments table.
 *
 * @param  {string}      orderID      - Paypal Order ID.
 * @param  {string}      productCode
 * @param  {string|null} receiptEmail
 * @param  {string|null} memberEmail
 * @param  {Object}      client
 * @return {Object}      result
 */
async function insertNewPaymentRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result        = { errorList: [] };
        var newPaymentRow = [
            insertObj.payOrderID,
            insertObj.payProductCode,
            insertObj.payReceiptEmail,
            insertObj.payMemberEmail,
            insertObj.payCreationDate,
            insertObj.payStatus
        ];

        client.query("INSERT INTO Payments VALUES (?,?,?,?,?,?)", newPaymentRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', error.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Inserts a new row in the Products table.
 *
 * @param  {string}      orderID      - Paypal Order ID.
 * @param  {string}      productCode
 * @param  {string|null} receiptEmail
 * @param  {string|null} memberEmail
 * @param  {Object}      client
 * @return {Object}      result
 */
async function insertNewProductRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result        = { errorList: [] };
        var newProductRow = [
            insertObj.pdCode,
            insertObj.pdName,
            insertObj.pdAppName,
            insertObj.pdPriceUSD,
            insertObj.pdDeviceLimit,
            insertObj.pdExpireDate
        ];

        client.query("INSERT INTO Products VALUES (?,?,?,?,?,?)", newProductRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', error.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Inserts a new row in the Activations table.
 *
 * @param  {Object} insertObj
 * @param  {Object} client
 * @return {Object} result
 */
function insertNewActivationRow_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result           = { errorList: [] };
        var newActivationRow = [
            insertObj.actDevUUID,
            insertObj.actLcKey
        ];

        client.query("INSERT INTO Activations VALUES (?,?)", newActivationRow, function (err) {
            if (err) t_misc.addError(result.errorList, 'DB_INSERT_ERROR', err.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Inserts a new row in the EmailRequests table.
 *
 * @param  {Object} insertObj
 * @param  {Object} client
 * @return {Object} result
 */
function insertNewEmailRequest_p (insertObj, client) {
    return new Promise (function (resolve, reject) {
        var result             = { errorList: [] };
        var newEmailRequestRow = [
            insertObj.reqCode,
            insertObj.reqEmail,
            insertObj.reqService,
            insertObj.reqExpire
        ];

        client.query("INSERT INTO EmailRequests VALUES (?,?,?,?)", newEmailRequestRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_INSERT_ERROR', error.toString());
            return resolve(result);
        });
    });
}














/*
 * =================================
 * UPDATE SECTION
 * =================================
 */
/**
 * @async
 * Updates the member row with the given email.
 * Changes the memberVerify column to given value.
 *
 * @param  {string} email
 * @param  {boolen} newMemberVerify
 * @param  {Object} client
 * @return {Object} result
 */
async function updateMemberRowVerify_p (email, newMemberVerify, client) {
    return new Promise (function (resolve, reject) {
        var result          = { errorList: [] };
        var updateMemberRow = [ newMemberVerify, email ];

        client.query("UPDATE Members SET memberVerify = ? WHERE memberEmail = ?", updateMemberRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_UPDATE_ERROR', error.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Updates the member row with the given email.
 * Changes the memberPass column to given value.
 *
 * @param  {string} email
 * @param  {boolen} newPassHash
 * @param  {Object} client
 * @return {Object} result
 */
async function updateMemberRowPassword_p (email, newPassHash, client) {
    return new Promise (function (resolve, reject) {
        var result          = { errorList: [] };
        var updateMemberRow = [ newPassHash, email ];

        client.query("UPDATE Members SET memberPass = ? WHERE memberEmail = ?", updateMemberRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_UPDATE_ERROR', error.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Updates the session row with the given sessionKey and sessionIP
 *
 * @param  {string} searchKey - Session key of existing session.
 * @param  {string} searchIP  - Session IP of existing session.
 * @param  {Object} updateOpt
 * @param  {Object} client
 * @return {Object} result
 */
async function updateSessionRowByKeyIP_p (searchKey, searchIP, updateOpt, client) {
    var result = { errorList: [] };

    if (updateOpt.sessionKey != undefined) {
        var qresult = await execQuery_p('UPDATE Sessions SET sessionKey = ? WHERE sessionKey = ? AND sessionIP = ?', [updateOpt.sessionKey, searchKey, searchIP], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.sessionEmail != undefined) {
        var qresult = await execQuery_p('UPDATE Sessions SET sessionEmail = ? WHERE sessionKey = ? AND sessionIP = ?', [updateOpt.sessionEmail, searchKey, searchIP], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.sessionIP != undefined) {
        var qresult = await execQuery_p('UPDATE Sessions SET sessionIP = ? WHERE sessionKey = ? AND sessionIP = ?', [updateOpt.sessionIP, searchKey, searchIP], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.sessionExpire != undefined) {
        var qresult = await execQuery_p('UPDATE Sessions SET sessionExpire = ? WHERE sessionKey = ? AND sessionIP = ?', [updateOpt.sessionExpire, searchKey, searchIP], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    return result;
}
/**
 * @async
 * Updates the license row with the given license key
 * and updates the lcActive.
 *
 * @param  {string} searchKey    - License key of existing license.
 * @param  {string} updateActive - New Active boolean of the license.
 * @param  {Object} client
 * @return {Object} result
 */
function updateLicenseRowActive_p (searchKey, updateActive, client) {
    return new Promise (function (resolve, reject) {
        var result         = { errorList: [] };
        var updateRowQuery = [
            updateActive,
            searchKey
        ];

        client.query("UPDATE Licenses SET lcActive = ? WHERE lcKey = ?", updateRowQuery, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_UPDATE_ERROR', error.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Updates the license row with the given license key/
 *
 * @param  {string} searchKey - License key of existing license.
 * @param  {Object} updateOpt - Should include row, value pair of updates.
 * @param  {Object} client
 * @return {Object} result
 */
async function updateLicenseRowByKey_p (searchKey, updateOpt, client) {
    var result = { errorList: [] };

    if (updateOpt.lcKey != undefined) {
        var qresult = await execQuery_p('UPDATE Licenses SET lcKey = ? WHERE lcKey = ?', [updateOpt.lcKey, searchKey], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.lcOrderID != undefined) {
        var qresult = await execQuery_p('UPDATE Licenses SET lcOrderID = ? WHERE lcKey = ?', [updateOpt.lcOrderID, searchKey], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.lcMemberEmail != undefined) {
        var qresult = await execQuery_p('UPDATE Licenses SET lcMemberEmail = ? WHERE lcKey = ?', [updateOpt.lcMemberEmail, searchKey], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.lcProductCode != undefined) {
        var qresult = await execQuery_p('UPDATE Licenses SET lcProductCode = ? WHERE lcKey = ?', [updateOpt.lcProductCode, searchKey], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.lcPaymentUSD != undefined) {
        var qresult = await execQuery_p('UPDATE Licenses SET lcPaymentUSD = ? WHERE lcKey = ?', [updateOpt.lcPaymentUSD, searchKey], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.lcActive != undefined) {
        var qresult = await execQuery_p('UPDATE Licenses SET lcActive = ? WHERE lcKey = ?', [updateOpt.lcActive, searchKey], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    return result;
}
/**
 * @async
 * Updates the payment row with the given order ID.
 *
 * @param  {string} searchID  - Order ID of existing payment.
 * @param  {Object} updateOpt - Should include row, value pair of updates.
 * @param  {Object} client
 * @return {Object} result
 */
async function updatePaymentRowByID_p (searchID, updateOpt, client) {
    var result = { errorList: [] };

    if (updateOpt.payOrderID != undefined) {
        var qresult = await execQuery_p('UPDATE Payments SET payOrderID = ? WHERE payOrderID = ?', [updateOpt.payOrderID, searchID], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.payProductCode != undefined) {
        var qresult = await execQuery_p('UPDATE Payments SET payProductCode = ? WHERE payOrderID = ?', [updateOpt.payProductCode, searchID], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.payReceiptEmail != undefined) {
        var qresult = await execQuery_p('UPDATE Payments SET payReceiptEmail = ? WHERE payOrderID = ?', [updateOpt.payReceiptEmail, searchID], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.payMemberEmail != undefined) {
        var qresult = await execQuery_p('UPDATE Payments SET payMemberEmail = ? WHERE payOrderID = ?', [updateOpt.payMemberEmail, searchID], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.payCreationDate != undefined) {
        var qresult = await execQuery_p('UPDATE Payments SET payCreationDate = ? WHERE payOrderID = ?', [updateOpt.payCreationDate, searchID], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    if (updateOpt.payStatus != undefined) {
        var qresult = await execQuery_p('UPDATE Payments SET payStatus = ? WHERE payOrderID = ?', [updateOpt.payStatus, searchID], client);
        if (qresult.errorList.length > 0) return qresult;
    }
    return result;
}
/**
 * @async
 * Updates the devices row with the given devUUID.
 *
 * @param  {string} devUUID   - Searching devUUID of the original row.
 * @param  {Object} updateOpt - Should include row, value pair of updates.
 * @param  {Object} client
 * @return {Object} result
 */
async function updateDeviceRowByUUID_p (devUUID, updateOpt, client) {
    var result = { errorList: [] };

    if (updateOpt.devName != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devName = ? WHERE devUUID = ?', [updateOpt.devName, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devPlatform != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devPlatform = ? WHERE devUUID = ?', [updateOpt.devPlatform, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devDistro != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devDistro = ? WHERE devUUID = ?', [updateOpt.devDistro, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devRelease != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devRelease = ? WHERE devUUID = ?', [updateOpt.devRelease, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devArch != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devArch = ? WHERE devUUID = ?', [updateOpt.devArch, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devIP != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devIP = ? WHERE devUUID = ?', [updateOpt.devIP, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devGeo != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devGeo = ? WHERE devUUID = ?', [updateOpt.devGeo, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    if (updateOpt.devDate != undefined) {
        var qr = await execQuery_p('UPDATE Devices SET devDate = ? WHERE devUUID = ?', [updateOpt.devDate, devUUID], client);
        if (t_misc.hasELError(qr)) return qr;
    }
    return result;
}













/*
 * =================================
 * REMOVE SECTION
 * =================================
 */
/**
 * @async
 * Removes a row from the Sessions table.
 * Uses the given session key to search the row.
 *
 * @param  {string} sKey
 * @param  {Object} client
 * @return {Object} result
 */
async function deleteSessionRowByKey_p (sKey, client) {
    return new Promise (function (resolve, reject) {
        var result         = { errorList: [] };
        var deleteQueryRow = [ sKey ];

        client.query("DELETE FROM Sessions WHERE sessionKey = ?", deleteQueryRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_DELETE_ERROR', error.toString());
            return resolve(result);
        });
    });
}

/**
 * @async
 * Removes a row from the EmailRequests table.
 * Uses the given reqCode to search the row.
 *
 * @param  {string} reqCode
 * @param  {Object} client
 * @return {Object} result
 */
async function deleteEmailRequestRowByCode_p (reqCode, client) {
    return new Promise (function (resolve, reject) {
        var result                = { errorList: [] };
        var deleteEmailRequestRow = [ reqCode ];

        client.query("DELETE FROM EmailRequests WHERE reqCode = ?", deleteEmailRequestRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_DELETE_ERROR', error.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Removes a row from the EmailRequests table.
 * Uses the given email and request service to search the row.
 *
 * @param  {string} email
 * @param  {string} service
 * @param  {Object} client
 * @return {Object} result
 */
function deleteEmailRequestRowByEmailService_p (email, service, client) {
    return new Promise (function (resolve, reject) {
        var result = { errorList: [] };
        var deleteEmailRequestRow = [
            service,
            email
        ];

        client.query("DELETE FROM EmailRequests WHERE reqService = ? AND reqEmail = ?", deleteEmailRequestRow, function (error) {
            if (error)
                t_misc.addError(result.errorList, 'DB_DELETE_ERROR', error.toString());
            return resolve(result);
        });
    });
}















/*
 * =================================
 * OTHER SECTION
 * =================================
 */
/**
 * @async
 * Applies the given SQL file to the MySQL database.
 *
 * @param  {string} mysqlID
 * @param  {string} mysqlPS
 * @param  {string} mysqlSQLFilePath
 * @return {Object} result
 */
function applySQLFile_p (mysqlID, mysqlPS, mysqlSQLFilePath) {
    return new Promise (function (resolve) {
        var result   = { errorList: [] };
        var mysqlCMD = "mysql -u "    + mysqlID
                     + " --password=" + mysqlPS
    				 + " < "          + mysqlSQLFilePath;
        cp.exec(mysqlCMD, function (err, stdout, stderr) {
            if (err)
                t_misc.addError(result.errorList, 'DB_APPLY_SQL_FAIL', err.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Makes the MySQL client use the given database.
 *
 * @param  {string} databaseName
 * @param  {Object} client
 * @return {Object} result
 */
function useDatabase_p (databaseName, client) {
    return new Promise (function (resolve) {
        var result   = { errorList: [] };
        client.query('use ' + databaseName, function (err) {
            if (err)
                t_misc.addError(result.errorList, 'DB_USE_DB_FAIL', err.toString());
            return resolve(result);
        });
    });
}
/**
 * @async
 * Drops the LoenlyDuck database.
 *
 * @param  {string} databaseName
 * @param  {Object} client
 * @return {Object} result
 */
function dropDatabase_p (databaseName, client) {
    return new Promise (function (resolve) {
        var result   = { errorList: [] };
        client.query('drop database ' + databaseName, function (err) {
            if (err)
                t_misc.addError(result.errorList, 'DB_DROP_DB_FAIL', err.toString());
            return resolve(result);
        });
    });
}

// exports.flushDB = function (client, callback) {
//     client.query("drop database " + Settings.adminDatabaseName, function (error) {
//         if (error)
//             return callback(error.toString());
//         else
//             exports.initDB(Settings.adminDatabaseID, Settings.adminDatabasePS, client, Settings.adminDatabaseName, Settings.adminDatabaseSQL, function () {
//                 return callback();
//             });
//     });
// }



// *********************************
// FUNCTION EXPORTS
// *********************************
/* Selections */
exports.getMemberRowByEmail_p      = getMemberRowByEmail_p;
exports.getSessionRowByKeyIP_p     = getSessionRowByKeyIP_p;
exports.getLicenseRowByKey_p       = getLicenseRowByKey_p;
exports.getProductRowByCode_p      = getProductRowByCode_p;
exports.getPaymentRowByOrderID_p   = getPaymentRowByOrderID_p;
exports.getEmailRequestRowByCode_p = getEmailRequestRowByCode_p;
exports.getDeviceRowByUUID_p       = getDeviceRowByUUID_p;

/* Multiple Selections (Condition) */
exports.getAllLicenseRowsByEmail_p        = getAllLicenseRowsByEmail_p;
exports.getAllDeviceRowsByKey_p           = getAllDeviceRowsByKey_p;  // This doesn't make sense anymore.
exports.getAllDeviceRowsByUUID_p          = getAllDeviceRowsByUUID_p; // This should be singular.
exports.getAllActRowsByLcKey_p            = getAllActRowsByLcKey_p;
exports.getAllActRowsByDevUUID_p          = getAllActRowsByDevUUID_p;
exports.getAllActRowsByDevUUIDWithLcKey_p = getAllActRowsByDevUUIDWithLcKey_p; // This should be singular.

/* Multiple Selections (No Condition) */
exports.getAllSessionRows_p          = getAllSessionRows_p;
exports.getAllProductRows_p          = getAllProductRows_p;

/* Insertions */
exports.insertNewMemberRow_p     = insertNewMemberRow_p;
exports.insertNewSessionRow_p    = insertNewSessionRow_p;
exports.insertNewDeviceRow_p     = insertNewDeviceRow_p;
exports.insertNewLicenseRow_p    = insertNewLicenseRow_p;
exports.insertNewPaymentRow_p    = insertNewPaymentRow_p;
exports.insertNewProductRow_p    = insertNewProductRow_p;
exports.insertNewActivationRow_p = insertNewActivationRow_p;
exports.insertNewEmailRequest_p  = insertNewEmailRequest_p;

/* Updates */
exports.updateMemberRowVerify_p   = updateMemberRowVerify_p;
exports.updateMemberRowPassword_p = updateMemberRowPassword_p;
exports.updateSessionRowByKeyIP_p = updateSessionRowByKeyIP_p;
exports.updateLicenseRowByKey_p   = updateLicenseRowByKey_p;
exports.updatePaymentRowByID_p    = updatePaymentRowByID_p;
exports.updateDeviceRowByUUID_p   = updateDeviceRowByUUID_p;

/* Removals */
exports.deleteSessionRowByKey_p               = deleteSessionRowByKey_p;
exports.deleteEmailRequestRowByCode_p         = deleteEmailRequestRowByCode_p;
exports.deleteEmailRequestRowByEmailService_p = deleteEmailRequestRowByEmailService_p;

/* MySQL */
exports.applySQLFile_p = applySQLFile_p;
exports.useDatabase_p  = useDatabase_p;
exports.dropDatabase_p = dropDatabase_p;
