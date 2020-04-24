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
 * Executes a raw query string and return a promise.
 *
 * @param  {string}        queryStatement
 * @param  {Object}        client
 * @return {Object} result - Includes rows and fields.
 */
function execRawQuery_p (queryStatement, client) {
    return new Promise(function (resolve) {
        var result = { errorList: [], rows: [], fields: null };
        client.query(queryStatement, function (err, rows, fields) {
            if (err) {
                t_misc.addError(result.errorList, 'DB_RAW_QUERY_EXEC_ERROR', err.toString());
                return resolve(result);
            }
                
            if (rows && rows.length > 0) result.rows   = rows;
            if (fields)                  result.fields = fields;
            
            return resolve(result);
        });
    });
}
/**
 * @async
 * Executes a optioned query and return a promise.
 *
 * @param  {String}        querySQL
 * @param  {boolean}       keepDuplicateColumnNames
 * @param  {Object}        client
 * @return {Object} result - Includes rows and fields.
 */
function execOptQuery_p (querySQL, keepDuplicateColumnNames, client) {
    return new Promise(function (resolve) {
        
        var result = { errorList: [], rows: [], fields: null };
        
        var opt = { 
            sql        : querySQL, 
            nestTables : (keepDuplicateColumnNames == true) ? '_' : false 
            
        };
        
        client.query(opt, function (err, rows, fields) {
            if (err) {
                t_misc.addError(result.errorList, 'DB_OPT_QUERY_EXEC_ERROR', err.toString());
                return resolve(result);
            }
                
            if (rows && rows.length > 0) result.rows   = rows;
            if (fields)                  result.fields = fields;
            
            return resolve(result);
        });
    });
}
/**
 * @async
 * Executes a optioned query and return a promise.
 *
 * @param  {String}        querySQL
 * @param  {String[]}      dataList
 * @param  {boolean}       keepDuplicateColumnNames
 * @param  {Object}        client
 * @return {Object} result - Includes rows and fields.
 */
function execOptDataQuery_p (querySQL, dataList, keepDuplicateColumnNames, client) {
    return new Promise(function (resolve) {
        
        var result = { errorList: [], rows: [], fields: null };
        
        var opt = { 
            sql        : querySQL, 
            nestTables : (keepDuplicateColumnNames == true) ? '_' : false ,
            values     : dataList
        };
        
        client.query(opt, function (err, rows, fields) {
            if (err) {
                t_misc.addError(result.errorList, 'DB_OPT_QUERY_EXEC_ERROR', err.toString());
                return resolve(result);
            }
                
            if (rows && rows.length > 0) result.rows   = rows;
            if (fields)                  result.fields = fields;
            
            return resolve(result);
        });
    });
}
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
        client.query(queryStatement, queryData, function (err, rows, fields) {
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
 * Gets the row from the Customers table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes customerRow.
 */
function getCustomerRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], customerRow: null };

        client.query("SELECT * FROM Customers WHERE CUS_ID = ?", pk, function (err, rows) {
            if (err)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', err.toString());
            else if (rows.length > 0)
                result.customerRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the Products table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes productRow.
 */
function getProductRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], productRow: null };

        client.query("SELECT * FROM Products WHERE PD_ID = ?", pk, function (err, rows) {
            if (err)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', err.toString());
            else if (rows.length > 0)
                result.productRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the SalesPersons table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes salesPersonRow.
 */
function getSalesPersonRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], salesPersonRow: null };

        client.query("SELECT * FROM SalesPersons WHERE SP_ID = ?", pk, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.salesPersonRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the Employee table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes employeeRow.
 */
function getEmployeeRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], employeeRow: null };

        client.query("SELECT * FROM Employee WHERE EMP_ID = ?", pk, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.employeeRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the Purchses table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes purchaseRow.
 */
function getPurchaseRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], purchaseRow: null };

        client.query("SELECT * FROM Purchases WHERE PUR_ID = ?", pk, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.purchaseRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the CommonResolutions table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes comresRow.
 */
function getComresRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], comresRow: null };

        client.query("SELECT * FROM CommonResolutions WHERE COMRES_ID = ?", pk, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.comresRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the Cases table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes caseRow.
 */
function getCaseRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], caseRow: null };

        client.query("SELECT * FROM Cases WHERE CAS_ID = ?", pk, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.caseRow = rows[0];
            return resolve(result);
        });
    });
}
/**
 * @async
 * Gets the row from the CaseComments table using the given PK.
 *
 * @param  {int} pk
 * @param  {Object} client
 * @return {Object} result - Includes caseCommentRow.
 */
function getCaseCommentRowByPK_p (pk, client) {
    return new Promise (function (resolve) {
        var result = { errorList: [], caseCommentRow: null };

        client.query("SELECT * FROM CaseComments WHERE CMT_ID = ?", pk, function (error, rows) {
            if (error)
                t_misc.addError(result.errorList, 'DB_SELECT_ERROR', error.toString());
            else if (rows.length > 0)
                result.caseCommentRow = rows[0];
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
/* Execute Any Query */
exports.execRawQuery_p = execRawQuery_p;
exports.execOptQuery_p = execOptQuery_p;
exports.execOptDataQuery_p = execOptDataQuery_p;
exports.execQuery_p    = execQuery_p;

/* Selections */
exports.getCustomerRowByPK_p     = getCustomerRowByPK_p;
exports.getProductRowByPK_p      = getProductRowByPK_p;
exports.getSalesPersonRowByPK_p  = getSalesPersonRowByPK_p;
exports.getEmployeeRowByPK_p  = getEmployeeRowByPK_p;
exports.getPurchaseRowByPK_p     = getPurchaseRowByPK_p;
exports.getComresRowByPK_p     = getComresRowByPK_p;
exports.getCaseRowByPK_p     = getCaseRowByPK_p;
exports.getCaseCommentRowByPK_p     = getCaseCommentRowByPK_p;


// /* Multiple Selections (Condition) */


// /* Multiple Selections (No Condition) */


// /* Insertions */


// /* Updates */


// /* Removals */


/* MySQL */
exports.applySQLFile_p = applySQLFile_p;
exports.useDatabase_p  = useDatabase_p;
exports.dropDatabase_p = dropDatabase_p;
