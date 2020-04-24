/**
 * @file Post Account Login
 * @module Express/Post/PostProductComresSubmit
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
    var result = { errorList: [] };

    // Check body param.
    if (!req || !req.body || !req.body.productID || !req.body.name || !req.body.guide) {
        error(req, 'Request body param not given.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_NOT_FOUND');
        return result;
    }
    if (typeof(req.body.productID) != 'number' 
        || typeof(req.body.name) != 'string' || typeof(req.body.guide) != 'string') {
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

    var productID    = req.body.productID;
    var comresName   = req.body.name;
    var comresGuide  = req.body.guide;
    
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

    // (DB) Insert new common resolution to CommonResolutions table.
    var insertData = [comresName, comresGuide, 0, productID, CUS_ID, EMP_ID];
    var comresRowInsertRes = await t_db.execOptDataQuery_p(SQL.COMRES.INSERT_WITHOUT_PK, insertData, false, client);
    if (comresRowInsertRes.errorList.length > 0) {
        error(req, 'Failed to insert row into CommonResolutions table.');
        t_misc.addError(result.errorList, 'DB_COMRES_INSERT_FAIL', comresRowInsertRes.errorList[0]);
        return result;
    }

    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postProductComresSubmit_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /product/comres/submit');

    var suiteResult_p = await action_p(req, client);

    // comres submit failed.
    if (suiteResult_p.errorList.length > 0) {

        error(req, suiteResult_p.errorList);
        res.send({ error: 'POST_PRODUCT_COMRES_SUBMIT_FAILED' });
        warn(req, '(End) Product comres submit failed. Response sent.');
    }
    else {
        res.send({ error: null });
        success(req, '(End) Product comres submit success. Response sent.');
    }
}
