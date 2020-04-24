/**
 * @file Post Account Login
 * @module Express/Post/PostAccountLogin
 *
 * IO Usage: DB
 * Mutex: Master
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
* Performs all the functions above to complete the login.
*
* @param  {Object} req
* @param  {Object} client
* @return {Object} result - Includes newSessionKey and email property.
*/
async function action_p (req, client) {
    // var result = { errorList: [], newSessionKey: null, email: null };
    var result = { errorList: [], loginSessionKey: null, loginSessionType: null };

    // log(SQL);
    // log(SQL.CUSTOMERS);
    // log(SQL.CUSTOMERS.SELECT_BY_EMAIL);

    if (!req || !req.body) {
        error(req, 'Request body not given.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_NOT_FOUND');
        return result;
    }
    if (!req.body.loginType || (req.body.loginType != 'customer' && req.body.loginType != 'employee')) {
        error(req, 'Request login type invalid. Received:', req.body.loginType);
        t_misc.addError(result.errorList, 'REQUEST_BODY_LOGIN_TYPE_INVALID');
        return result;
    }
    if (!req.body.loginEmail || !validator.isEmail(req.body.loginEmail)) {
        error(req, 'Request login email invalid. Received:', req.body.loginEmail);
        t_misc.addError(result.errorList, 'REQUEST_BODY_LOGIN_EMAIL_INVALID');
        return result;
    }

    var loginType      = req.body.loginType;
    var loginEmail     = req.body.loginEmail;

    if (loginType == 'customer') {
        // Get the customer row.
        var cusRowRes = await t_db.execOptDataQuery_p(SQL.CUSTOMERS.SELECT_BY_EMAIL, [loginEmail], false, client);
        if (cusRowRes.errorList.length > 0 || cusRowRes.rows.length == 0) {
            error(req, 'No customer with given key %s was found in Customers table.', loginEmail);
            t_misc.addError(result.errorList, 'DB_CUSTOMER_NOT_FOUND');
            return result;
        }
        var cusRow = cusRowRes.rows[0];
        
        result.loginSessionKey  = cusRow.CUS_ID;
        result.loginSessionType = 'customer';
    }
    else {
        // Get the employee row.
        var empRowRes = await t_db.execOptDataQuery_p(SQL.EMPLOYEE.SELECT_BY_EMAIL, [loginEmail], false, client);
        if (empRowRes.errorList.length > 0 || empRowRes.rows.length == 0) {
            error(req, 'No employee with given key %s was found in Employee table.', loginEmail);
            t_misc.addError(result.errorList, 'DB_EMPLOYEE_NOT_FOUND');
            return result;
        }
        var empRow = empRowRes.rows[0];
        
        result.loginSessionKey  = empRow.EMP_ID;
        result.loginSessionType = 'employee';
    }

    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postAccountLogin_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /login');

    var suiteResult_p = await action_p(req, client);

    // login failed.
    if (suiteResult_p.errorList.length > 0) {

        debug(req, suiteResult_p.errorList);

        res.send({ error: 'POST_LOGIN_FAILED' });
        
        warn(req, '(End) Login Failed. Response sent.');
    }
    else {
        req.session.loginPK   = suiteResult_p.loginSessionKey;
        req.session.loginType = suiteResult_p.loginSessionType;
        
        req.session.save(function (err) {
             if (err) {
                 error(req, 'Failed to save to new login session.');
                 res.send({ error: 'POST_LOGIN_SESSION_GEN_FAILED' });
                 warn(req, '(End) Login Success but session gen failed. Response sent.');
             }
             else {
                 res.send({ error: null });
                 success(req, '(End) Login Success. Response sent.');
             }
        });
    }
}
