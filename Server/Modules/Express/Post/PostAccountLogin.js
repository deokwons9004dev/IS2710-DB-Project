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
// var validator   = require("validator");
// var psvalidator = require('password-validator');
var bcrypt      = require('bcrypt');
var uuidv4      = require('uuid/v4');
var moment      = require('moment');
// var ipware      = require('ipware')().get_ip;

// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../../Application/ServerSettings.js");
const SET    = settings;

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
 * Checks the validity of the request object.
 * Login method should be included in the body as one of:
 *     - req.body.loginMethod
 *         (PLAIN_WEB, PLAIN_OTHER, SESSIONKEY_BODY, SESSIONKEY_COOKIE, ...)
 *
 * If login using PLAIN_WEB:
 *     - body.email
 *     - body.password
 *     - Response will send a signed cookie that contains the new session key.
 *
 * If login using PLAIN_OTHER:
 *     - body.email
 *     - body.password
 *     - Response will include new session key in body as data.
 *
 * If login using SESSIONKEY_BODY:
 *     - body.sessionKey
 *     - Response will include new session key in body as data.
 *
 * If login using SESSIONKEY_COOKIE:
 *     - req.signedCookies['account_login_sessionkey']
 *     - Response will send a signed cookie that contains the new session key.
 *
 * @param  {Object} req - The request object.
 * @return {Object} result
 */
function checkRequestValidity (req) {
    var result = { errorList: [] };
    if (!req || !req.body || !req.body.loginMethod)
        t_misc.addError(result.errorList, 'LOGIN_METHOD_NOTGIVEN');
    else if (req.body.loginMethod === 'PLAIN_WEB' || req.body.loginMethod === 'PLAIN_OTHER') {
        if (!req.body.email || !req.body.password)
            t_misc.addError(result.errorList, 'LOGIN_PLAIN_CRED_INCOMPLETE');
        else if (typeof(req.body.email) !== 'string')
            t_misc.addError(result.errorList, 'EMAIL_NOT_STRING');
        else if (typeof(req.body.password) !== 'string')
            t_misc.addError(result.errorList, 'PASSWORD_NOT_STRING');
    }
    else if (req.body.loginMethod === 'SESSIONKEY_BODY') {
        if (!req.body.sessionKey || typeof(req.body.sessionKey) !== 'string')
            t_misc.addError(result.errorList, 'SESSIONKEY_INCOMPLETE');
    }
    else if (req.body.loginMethod === 'SESSIONKEY_COOKIE') {
        if (!req.signedCookies || !req.signedCookies['account_login_sessionkey'])
            t_misc.addError(result.errorList, 'SESSIONKEY_COOKIE_NOTGIVEN');
        else if (typeof(req.signedCookies['account_login_sessionkey']) !== 'string')
            t_misc.addError(result.errorList, 'SESSIONKEY_COOKIE_INCOMPLETE');
    }
    else {
        t_misc.addError(result.errorList, 'LOGIN_METHOD_INVALID');
    }
    return result;
}

/**
* Checks whether the given login password matches the password hash from the table row.
*
* @param  {string} loginPassword
* @param  {string} userRowPasswordHash
* @return {Object} result
*/
function checkPassword (loginPassword, userRowPasswordHash) {
    var result = { errorList: [] };
    if (!bcrypt.compareSync(loginPassword, userRowPasswordHash))
        t_misc.addError(result.errorList, 'PASSWORD_MISMATCH');
    return result;
}





/**
* @async
* Performs all the functions above to complete the login.
* On success, the result will include a new session key to be sent via cookie or response data.
* On fail by 'ACCOUNT_NOT_VERIFIED', the result will include the user's email
* to set up the 'account_verify_email' signed cookie.
* On fail by any other error, none will be supplied.
*
* @param  {Object} req
* @param  {Object} client
* @return {Object} result - Includes newSessionKey and email property.
*/
async function action_p (req, client) {
    var result = { errorList: [], newSessionKey: null, email: null };

    var reqValidityResult = checkRequestValidity(req);
    if (reqValidityResult.errorList.length > 0) return reqValidityResult;
    debug(req, 'Request validity check passed.');

    var loginIP     = req.clientIp;
    var loginMethod = req.body.loginMethod;
    if (loginMethod === 'PLAIN_WEB' || loginMethod === 'PLAIN_OTHER') {
        var email    = req.body.email;
        var password = req.body.password;

        info(req, 'Account Login By Email/Password: %s', email);
        info(req, 'user-agent: %s', req.headers['user-agent']);

        // (DB) Get member row (row must exist).
        var memberQueryResult = await t_db.getMemberRowByEmail_p(email, client);
        if (memberQueryResult.errorList.length > 0) return memberQueryResult;
        if (memberQueryResult.memberRow === null) {
            t_misc.addError(result.errorList, 'DB_MEMBER_NOT_FOUND');
            return result;
        }
        debug(req, 'Got matching member row from table.');

        // Check password match.
        var memberRow               = memberQueryResult.memberRow;
        var memberRowPasswordHash   = memberRow.memberPass;
        var checkPasswordResult_p = await checkPassword(password, memberRowPasswordHash);
        if (checkPasswordResult_p.errorList.length > 0) return checkPasswordResult_p;
        debug(req, 'Password matches.');

        // Check account verified.
        if (!memberRow.memberVerify) {
            t_misc.addError(result.errorList, 'ACCOUNT_NOT_VERIFIED');
            result.email = email;
            return result;
        }

        // Generate new session.
        var newSessionKey = uuidv4();
        var insertSessionRowResult_p = await t_db.insertNewSessionRow_p({
            sessionKey   : newSessionKey,
            sessionEmail : memberRow.memberEmail,
            sessionIP    : loginIP,
            sessionExpire: t_misc.getTZDTStringFromMoment(moment().add(90, 'days'))
        }, client);
        if (insertSessionRowResult_p.errorList.length > 0) return insertSessionRowResult_p;
        debug(req, 'Successfully inserted new session row.');

        result.newSessionKey = newSessionKey;
    }
    else {
        var loginSessionKey = null;
        if (loginMethod === 'SESSIONKEY_BODY') {
            loginSessionKey = req.body.sessionKey;
        }
        else if (loginMethod === 'SESSIONKEY_COOKIE') {
            loginSessionKey = req.signedCookies['account_login_sessionkey'];
        }

        info(req, 'Account Login By SessionKey: %s', loginSessionKey);
        info(req, 'user-agent: %s', req.headers['user-agent']);

        // (DB) Get Session Row (row must exist).
        var sessionQueryResult = await t_db.getSessionRowByKeyIP_p(loginSessionKey, loginIP, client);
        if (sessionQueryResult.errorList.length > 0) return sessionQueryResult;
        if (sessionQueryResult.sessionRow === null) {
            t_misc.addError(result.errorList, 'DB_SESSION_NOT_FOUND');
            return result;
        }
        debug(req, 'Got matching session row from table.');

        // (DB) Get Member row using the email from the session row (row must exist).
        var sessionRowEmail   = sessionQueryResult.sessionRow.sessionEmail;
        var memberQueryResult = await t_db.getMemberRowByEmail_p(sessionRowEmail, client);
        if (memberQueryResult.errorList.length > 0) return memberQueryResult;
        if (memberQueryResult.memberRow === null) {
            t_misc.addError(result.errorList, 'DB_MEMBER_NOT_FOUND');
            return result;
        }
        debug(req, 'Got matching member row from table.');

        // (ETC) Check account verified.
        var memberRow = memberQueryResult.memberRow;
        if (!memberRow.memberVerify) {
            t_misc.addError(result.errorList, 'ACCOUNT_NOT_VERIFIED');
            result.email = memberRow.memberEmail;
            return result;
        }

        // (DB) Regenerate session row with new sessionKey.
        var newSessionKey = uuidv4();
        var updateSessionRowResult_p = await t_db.updateSessionRowByKeyIP_p(loginSessionKey, loginIP, {
            sessionKey: newSessionKey
        }, client);
        if (updateSessionRowResult_p.errorList.length > 0) return updateSessionRowResult_p;
        debug(req, 'Regenerated session row.');

        result.newSessionKey = newSessionKey;
    }
    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postAccountLogin_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /login');

    await SVM.lockMaster_p();
    var suiteResult_p = await action_p(req, client);
    SVM.unlockMaster();

    if (suiteResult_p.errorList.length > 0) {

        debug(req, suiteResult_p.errorList);

        /* If login failed with ACCOUNT_NOT_VERIFIED error,
         * give user signed cookie 'account_verify_email' to allow for account
         * verification email request.
         */
        if (t_misc.getErrorNameList(suiteResult_p.errorList).indexOf('ACCOUNT_NOT_VERIFIED') != -1) {
            var email = suiteResult_p.email;
            let options = {
                // domain: ,
                // encode: ,
                // expires: ,
                // maxAge: 1000 * 60 * 15, // would expire after 15 minutes
                // path: ,
                // secure: ,
                sameSite: 'Strict',
                httpOnly: true, // The cookie only accessible by the web server
                signed  : true // Indicates if the cookie should be signed
            }
            res.cookie('account_verify_email', email, options);
            t_res.sendResponse(res, {
                result: 'fail',
                cause : 'ACCOUNT_NOT_VERIFIED'
            });
            warn(req, '(End) Account is not verified. Response sent with account_verify_email cookie.');
        }
        /* If login failed with any other error,
         * also remove the 'account_login_sessionkey' cookie to invalidate the session key.
         */
        else {
            res.clearCookie('account_login_sessionkey');
            t_res.sendResponse(res, { result: 'fail' });
            error(req, '(End) Failed to login account.');
        }
    }
    else {
        /* If login succeeded using PLAIN_WEB or SESSIONKEY_COOKIE,
         * update or set a new 'account_login_sessionkey' cookie to with the new session key.
         */
        var loginMethod   = req.body.loginMethod;
        var newSessionKey = suiteResult_p.newSessionKey;
        if (loginMethod === 'PLAIN_WEB' || loginMethod === 'SESSIONKEY_COOKIE') {

            let options = {
                sameSite: 'Strict',
                httpOnly: true, // The cookie only accessible by the web server
                signed  : true // Indicates if the cookie should be signed
            }
            res.cookie('account_login_sessionkey', newSessionKey, options);
            t_res.sendResponse(res, { result: 'success' });
        }
        /* If login succeeded using other methods,
         * send the new session key in the data of the response.
         */
        else {
            t_res.sendResponse(res, {
                result    : 'success',
                sessionKey: newSessionKey
            });
        }
        info(req, 'New session key:', newSessionKey);
        success(req, '(End) Account successfully logged in.');
    }
}
