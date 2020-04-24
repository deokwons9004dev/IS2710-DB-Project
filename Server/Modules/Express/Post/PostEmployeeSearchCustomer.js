/**
 * @file Post Account Login
 * @module Express/Post/PostEmployeeSearchCustomer
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 *
 * @todo
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var fs   = require('fs-extra');
var path = require('path');

// *********************************
// IMPORT NPM MODULES
// *********************************
// var esc         = require("escape-html");
var validator   = require("validator");
// var psvalidator = require('password-validator');
// var bcrypt      = require('bcrypt');
// var uuidv4      = require('uuid/v4');
// var moment      = require('moment');
// var ipware      = require('ipware')().get_ip;

// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../../Application/ServerSettings.js");
var querySQL = require("./../../Application/QuerySQL.js");
const SET    = settings;
const SQL    = querySQL;


// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_misc  = require('./../../Application/MiscTools.js');
var t_log   = require('./../../Application/LogTools.js');
var t_res   = require("./../../Application/ResponseTools.js");
var t_db    = require("./../../Application/DatabaseTools.js");
// var t_email = require("./../../Application/EmailTools.js");

// *********************************
// IMPORT CUSTOM MODULES: Objects
// *********************************

// *********************************
// IMPORT CUSTOM MODULES: Managers
// *********************************
var m_ser = require('./../../Manager/ServerManager.js');
const SVM = m_ser.ServerManager;

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



// *********************************
// NON-EXPORT HELPERS
// *********************************

/**
* @async
* 
*
* @param  {Object} req
* @param  {Object} client
* @return {Object} result
*/
async function action_p (req, client) {
    var result = { errorList: [], rows: [], fields: null };

    // Check body param.
    if (!req || !req.body || !req.body.searchType || !req.body.searchTerm) {
        error(req, 'Request body param not given.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_NOT_FOUND');
        return result;
    }
    if (typeof(req.body.searchType) != 'string' || typeof(req.body.searchTerm) != 'string') {
        error(req, 'Request body params are invalid.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_PARAMS_INVALID');
        return result;
    }

    // Check login session.
    if (!req.session || !req.session.loginPK || !req.session.loginType) {
        error(req, 'Request does not have a login session.');
        t_misc.addError(result.errorList, 'REQUEST_LOGIN_SESSION_NOT_FOUND');
        return result;
    }

    var searchType   = req.body.searchType;
    var searchTerm   = req.body.searchTerm;
    
    var sessionPK   = req.session.loginPK;
    var sessionType = req.session.loginType;

    if (sessionType != 'employee') {
        error(req, 'Request must be done by an employee.');
        t_misc.addError(result.errorList, 'REQUEST_NON_EMPLOYEE_REJECT');
        return result;
    }

    // (DB) Search from Cases table.
    if (searchType == 'name') {
        var searchRes  = await t_db.execOptDataQuery_p(SQL.ADVANCED.SEARCH_CUSTOMER_BY_NAME, [searchTerm], true, client);
        if (searchRes.errorList.length > 0) {
            error(req, 'Failed to search for customer by name.');
            t_misc.addError(result.errorList, 'DB_CUSTOMER_NAME_SEARCH_FAIL', searchRes.errorList[0]);
            return result;
        }
        result.rows   = searchRes.rows;
        result.fields = searchRes.fields;
    }
    else if (searchType == 'email') {
        var searchRes  = await t_db.execOptDataQuery_p(SQL.ADVANCED.SEARCH_CUSTOMER_BY_EMAIL, [searchTerm], true, client);
        if (searchRes.errorList.length > 0) {
            error(req, 'Failed to search for customer by email.');
            t_misc.addError(result.errorList, 'DB_CUSTOMER_EMAIL_SEARCH_FAIL', searchRes.errorList[0]);
            return result;
        }
        result.rows   = searchRes.rows;
        result.fields = searchRes.fields;
    }
    else {
        error(req, 'Request search type (%s) not supported.', searchType);
        t_misc.addError(result.errorList, 'REQUEST_SEARCH_TYPE_NOT_SUPPORTED');
        return result;
    }

    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postEmployeeSearchCustomer_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /employee/search/customer');

    var suiteResult_p = await action_p(req, client);

    if (suiteResult_p.errorList.length > 0) {

        error(req, suiteResult_p.errorList);
        res.send({ error: 'POST_EMPLOYEE_SEARCH_CUSTOMER_FAILED' });
        warn(req, '(End) Employee customer search failed. Response sent.');
    }
    else {
        res.send({ 
            error  : null,
            rows   : suiteResult_p.rows,
            fields : suiteResult_p.fields
        });
        success(req, '(End) Employee customer search success. Response sent.');
    }
}
