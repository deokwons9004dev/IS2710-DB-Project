/**
 * @file Post Account Register
 * @module Express/Post/PostAccountRegister
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
var esc         = require("escape-html");
var validator   = require("validator");
var psvalidator = require('password-validator');
var bcrypt      = require('bcrypt');
var uuidv4      = require('uuid/v4');
var moment      = require('moment');

// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../../Application/ServerSettings.js");
const DEF    = settings;

// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_misc  = require('./../../Application/MiscTools.js');
var t_log   = require('./../../Application/LogTools.js');
var t_res   = require("./../../Application/ResponseTools.js");
var t_db    = require("./../../Application/DatabaseTools.js");
var t_email = require("./../../Application/EmailTools.js");

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
 * Valid request object must include a body object that has the appropriate email and password string fields.
 *
 * @param  {Object} req - The request object.
 * @return {Object} result
 */
function checkRequestValidity (req) {
    var result = { errorList: [] };
    if (!req || !req.body || !req.body.newEmail || !req.body.newPassword || !req.body.newPasswordConfirm)
        t_misc.addError(result.errorList, 'REQ_BODY_INCOMPLETE');
    else if (typeof(req.body.newEmail) !== 'string')
        t_misc.addError(result.errorList, 'EMAIL_NOT_STRING');
    else if (typeof(req.body.newPassword) !== 'string')
        t_misc.addError(result.errorList, 'PASSWORD_NOT_STRING');
    else if (typeof(req.body.newPasswordConfirm) !== 'string')
        t_misc.addError(result.errorList, 'PASSWORDCONFIRM_NOT_STRING');
    return result;
}


/**
 * @async
 * Performs all the functions above to complete the registration.
 *
 * @param  {Object} req
 * @param  {Object} client
 * @return {Object} result
 */
async function action_p (req, client) {
    var result = { errorList: [] };

    var reqValidityResult = checkRequestValidity(req);
    if (reqValidityResult.errorList.length > 0) return reqValidityResult;
    debug(req, 'Request validity check passed.');

    var newEmail           = req.body.newEmail;
    var newPassword        = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    var newPasswordHash    = bcrypt.hashSync(newPassword, DEF.ACCOUNT.saltRounds);

    info(req, 'New Account Registration: %s', newEmail);
    info(req, 'user-agent: %s', req.headers['user-agent']);

    var emailValidityResult = t_misc.isEmailValid(newEmail);
    if (emailValidityResult.errorList.length > 0) return emailValidityResult;

    var psValidityResult = t_misc.isPasswordValid(newPassword);
    if (psValidityResult.errorList.length > 0) return psValidityResult;

    var psConfirmValidity = (newPassword === newPasswordConfirm);
    if (!psConfirmValidity) {
        t_misc.addError(result.errorList, 'DB_PS_PSCONFIRM_MISMATCH');
        return result;
    }
    debug(req, 'Register data validity check passed.');

    // (DB) Get existing row from Members table, and check whether email already exists.
    var queryMemberResult = await t_db.getMemberRowByEmail_p(newEmail, client);
    if (queryMemberResult.errorList.length > 0) return queryMemberResult;
    if (queryMemberResult.memberRow !== null) {
        t_misc.addError(result.errorList, 'DB_MEMBER_ALREADY_EXIST');
        return result;
    }
    debug(req, 'Email availability check passed.');

    // (DB) Insert new row to Members.
    var registerResult = await t_db.insertNewMemberRow_p({
        memberEmail  : newEmail,
        memberPass   : newPasswordHash,
        memberAuth   : 'USER',
        memberVerify : false,
    }, client);
    if (registerResult.errorList.length > 0) return registerResult;
    debug(req, 'Account registration passed.');

    return result;
}


function filterErrorCode (ecode) {
    if (ecode === 'DB_MEMBER_ALREADY_EXIST') return ecode;
    else                                     return null;
}



// *********************************
// EXPORT
// *********************************
module.exports = async function postAccountRegister_p (req, res, client) {
    printraw('');
	print(req, '(Start) POST /register');

    await SVM.lockMaster_p();
    var suiteResult_p = await action_p(req, client);
    SVM.unlockMaster();

    if (suiteResult_p.errorList.length > 0) {
        t_res.sendResponse(res, {
            result: 'fail',
            cause : filterErrorCode(suiteResult_p.errorList[0].error)
        });

        debug(req, suiteResult_p.errorList);
        error(req, '(End) Failed to register account.');
    }
    else {
        // Set session cookie to client for verification process.
        let options = {
            sameSite: 'Strict',
            httpOnly: true, // The cookie only accessible by the web server
            signed  : true // Indicates if the cookie should be signed
        }
        res.cookie('account_verify_email', req.body.newEmail, options);

        t_res.sendResponse(res, { result: 'success' });

        success(req, '(End) Successfully registered account (%s).', req.body.newEmail);
    }
}
