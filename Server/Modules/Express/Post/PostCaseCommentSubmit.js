/**
 * @file Post Account Login
 * @module Express/Post/PostCaseCommentSubmit
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
* @return {Object} result
*/
async function action_p (req, client) {
    var result = { errorList: [] };

    // Check body param.
    if (!req || !req.body || !req.body.caseID || !req.body.commentText) {
        error(req, 'Request body param not given.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_NOT_FOUND');
        return result;
    }
    if (typeof(req.body.caseID) != 'number' || typeof(req.body.commentText) != 'string') {
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

    var caseID        = req.body.caseID;
    var caseComment   = req.body.commentText;
    var sessionPK   = req.session.loginPK;
    var sessionType = req.session.loginType;
    
    var EMP_ID = null; 
    var CUS_ID = null; 

    if (sessionType == 'customer') {
        CUS_ID = sessionPK;
    }
    else {
        EMP_ID = sessionPK;
    }

    // (DB) Insert new case comment to CaseComments table.
    var insertData = [t_misc.getMySQLDTStringFromMoment(), caseComment, caseID, EMP_ID, CUS_ID];
    var cmtRowInsertRes = await t_db.execOptDataQuery_p(SQL.CASECOMMENTS.INSERT_WITHOUT_PK, insertData, false, client);
    if (cmtRowInsertRes.errorList.length > 0) {
        error(req, 'Failed to insert row into CaseComments table.');
        t_misc.addError(result.errorList, 'DB_CASECOMMENTS_INSERT_FAIL', cmtRowInsertRes.errorList[0]);
        return result;
    }

    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postCaseCommentSubmit_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /case/comment/submit');

    var suiteResult_p = await action_p(req, client);

    // case comment submit failed.
    if (suiteResult_p.errorList.length > 0) {

        error(req, suiteResult_p.errorList);
        res.send({ error: 'POST_CASE_COMMENT_SUBMIT_FAILED' });
        warn(req, '(End) Case comment submit failed. Response sent.');
    }
    else {
        res.send({ error: null });
        success(req, '(End) Case comment submit success. Response sent.');
    }
}
