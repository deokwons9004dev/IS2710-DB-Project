/**
 * @file Post Account Login
 * @module Express/Post/PostEmployeeAggCases
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
    if (!req || !req.body || !req.body.aggType) {
        error(req, 'Request body param not given.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_NOT_FOUND');
        return result;
    }
    if (typeof(req.body.aggType) != 'string') {
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

    // debug(req.session);

    var aggType     = req.body.aggType;

    var sessionPK   = req.session.loginPK;
    var sessionType = req.session.loginType;

    if (sessionType != 'employee') {
        error(req, 'Request must be done by an employee.');
        t_misc.addError(result.errorList, 'REQUEST_NON_EMPLOYEE_REJECT');
        return result;
    }

    // (DB) Perform aggregation queries.
    if (aggType == 'product') {
        var aggRes  = await t_db.execOptQuery_p(SQL.ADVANCED.AGG_CASES_BY_PRODUCT_DESC, true, client);
        if (aggRes.errorList.length > 0) {
            error(req, 'Failed to aggregate cases by product (PK).');
            t_misc.addError(result.errorList, 'DB_AGG_CASES_BY_PRODUCT_FAIL', aggRes.errorList[0]);
            return result;
        }
        result.rows   = aggRes.rows;
        result.fields = aggRes.fields;
    }
    else if (aggType == 'closed') {
        var aggRes  = await t_db.execOptQuery_p(SQL.ADVANCED.AGG_CASES_BY_CLOSED_EMP_DESC, true, client);
        if (aggRes.errorList.length > 0) {
            error(req, 'Failed to aggregate cases closed by employee (PK).');
            t_misc.addError(result.errorList, 'DB_AGG_CASES_BY_CLOSED_EMP_FAIL', aggRes.errorList[0]);
            return result;
        }
        result.rows   = aggRes.rows;
        result.fields = aggRes.fields;
    }
    else if (aggType == 'customer') {
        var aggRes  = await t_db.execOptQuery_p(SQL.ADVANCED.AGG_CASES_BY_CUSTOMER_DESC, true, client);
        if (aggRes.errorList.length > 0) {
            error(req, 'Failed to aggregate cases by customer (PK).');
            t_misc.addError(result.errorList, 'DB_AGG_CASES_BY_CUSTOMER_FAIL', aggRes.errorList[0]);
            return result;
        }
        result.rows   = aggRes.rows;
        result.fields = aggRes.fields;
    }
    else if (aggType == 'customer_company') {
        var aggRes  = await t_db.execOptQuery_p(SQL.ADVANCED.AGG_CASES_BY_CUSTOMER_COMPANY_DESC, true, client);
        if (aggRes.errorList.length > 0) {
            error(req, 'Failed to aggregate cases by customer\'s company (name).');
            t_misc.addError(result.errorList, 'DB_AGG_CASES_BY_CUSTOMER_COMPANY_FAIL', aggRes.errorList[0]);
            return result;
        }
        result.rows   = aggRes.rows;
        result.fields = aggRes.fields;
    }
    else {
        error(req, 'Request aggregation type (%s) not supported.', aggType);
        t_misc.addError(result.errorList, 'REQUEST_AGG_TYPE_NOT_SUPPORTED');
        return result;
    }

    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postEmployeeAggCases_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /employee/agg/cases');

    var suiteResult_p = await action_p(req, client);

    if (suiteResult_p.errorList.length > 0) {

        error(req, suiteResult_p.errorList);
        res.send({ error: 'POST_EMPLOYEE_AGG_FAILED' });
        warn(req, '(End) Employee aggregation query failed. Response sent.');
    }
    else {
        res.send({ 
            error  : null,
            rows   : suiteResult_p.rows,
            fields : suiteResult_p.fields
        });
        success(req, '(End) Employee aggregation query success. Response sent.');
    }
}
