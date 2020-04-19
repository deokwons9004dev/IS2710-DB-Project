/**
 * @file Custom Session Middleware
 * @module Modules/Middleware/CustomSessionMiddleware
 *
 * Intercepts and checks session via incoming request signed cookies.
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 *
 * @todo
 */
 // *********************************
 // IMPORT NATIVE/HYBRID MODULES
 // *********************************
 // var fs   = require('fs-extra');
 // var path = require('path');

 // *********************************
 // IMPORT NPM MODULES
 // *********************************
 // var uuidv4      = require('uuid/v4');
 // var moment      = require('moment');

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
 // var t_res   = require("./..Application/ResponseTools.js");
 var t_db    = require("./../Application/DatabaseTools.js");

 // *********************************
 // IMPORT CUSTOM MODULES: Objects
 // *********************************

 // *********************************
 // IMPORT CUSTOM MODULES: Managers
 // *********************************
 // var m_ser = require('./../../Manager/ServerManager.js');
 // const SVM = m_ser.ServerManager;

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
 // EXPORT
 // *********************************
 module.exports = async function customSessionMiddleware_p (req, res, next, client) {
     printraw('');
     print(req, '(Start) Checking session from URL (%s).', req.url);

     // Check if signedCookies['account_login_sessionkey'] exists.
     if (!req.signedCookies || !req.signedCookies['account_login_sessionkey']) {
         success(req, '(Start, End) No session cookie found.');
         next();
         return;
     }

     // Check type validity of session cookie (remove if invalid).
     if (typeof(req.signedCookies['account_login_sessionkey']) !== 'string') {
         warn(req, '(Start, End) Invalid session cookie. Removed cookie.');
         res.clearCookie('account_login_sessionkey');
         next();
         return;
     }

     // (DB) Get the row from Sessions with matching sessionkey.
     var sessionKey = req.signedCookies['account_login_sessionkey'];
     var sessionIP  = req.clientIp;
     debug(req, 'SessionKey (%s) SessionIP (%s).', sessionKey, sessionIP);

     var sessionQueryResult = await t_db.getSessionRowByKeyIP_p(sessionKey, sessionIP, client);

     // Remove session cookie if query error.
     if (sessionQueryResult.errorList.length > 0) {
         debug(req, sessionQueryResult.errorList);
         error(req, '(Start, End) Failed to query session row. Removed cookie.');
         res.clearCookie('account_login_sessionkey');
         next();
         return;
     }
     // Remove session cookie if session row NULL.
     if (sessionQueryResult.sessionRow == null) {
         error(req, '(Start, End) Session row not found. Removed cookie.');
         res.clearCookie('account_login_sessionkey');
         next();
         return;
     }

     // (DB) Get the row from Members with matching session email.
     var sessionEmail      = sessionQueryResult.sessionRow.sessionEmail;
     var memberQueryResult = await t_db.getMemberRowByEmail_p(sessionEmail, client);

     // Remove session cookie if query error.
     if (memberQueryResult.errorList.length > 0) {
         debug(req, memberQueryResult.errorList);
         error(req, '(Start, End) Failed to query member row. Removed cookie.');
         res.clearCookie('account_login_sessionkey');
         next();
         return;
     }
     // Remove session cookie if member row NULL.
     if (memberQueryResult.memberRow == null) {
         error(req, '(Start, End) Member row with matching email not found. Removed cookie.');
         res.clearCookie('account_login_sessionkey');
         next();
         return;
     }

     // Signed cookie is valid. Pass on to request handlers.
     // success(req, '(End) Session cookie validated.');
     next();
     return;
 }
