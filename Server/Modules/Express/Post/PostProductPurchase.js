/**
 * @file Post Account Login
 * @module Express/Post/PostProductPurchase
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
* @return {Object} result
*/
async function action_p (req, client) {
    var result = { errorList: [] };

    // Check body param.
    if (!req || !req.body || !req.body.productID) {
        error(req, 'Request body param not given.');
        t_misc.addError(result.errorList, 'REQUEST_BODY_NOT_FOUND');
        return result;
    }
    if (typeof(req.body.productID) != 'number') {
        error(req, 'Request productID is invalid. Received:', req.body.productID);
        t_misc.addError(result.errorList, 'REQUEST_BODY_PD_ID_INVALID');
        return result;
    }

    // Check login session.
    if (!req.session || !req.session.loginPK || !req.session.loginType) {
        error(req, 'Request does not have a login session.');
        t_misc.addError(result.errorList, 'REQUEST_LOGIN_SESSION_NOT_FOUND');
        return result;
    }

    var pdID        = req.body.productID;
    var sessionPK   = req.session.loginPK;
    var sessionType = req.session.loginType;

    if (sessionType != 'customer') {
        error(req, 'Non customer cannot purchase item.');
        t_misc.addError(result.errorList, 'REQUEST_SESSION_NOT_CUSTOMER');
        return result;
    }

    // Get customer row.
    var cusRowRes = await t_db.execOptDataQuery_p(SQL.CUSTOMERS.SELECT_BY_PK, [sessionPK], false, client);
    if (cusRowRes.errorList.length > 0 || cusRowRes.rows.length == 0) {
        error(req, 'No customer with given key %s was found in Customers table.', sessionPK);
        t_misc.addError(result.errorList, 'DB_CUSTOMER_NOT_FOUND');
        return result;
    }
    var cusRow = cusRowRes.rows[0];

    // Get product row.
    var pdRowRes = await t_db.execOptDataQuery_p(SQL.PRODUCTS.SELECT_BY_PK, [pdID], false, client);
    if (pdRowRes.errorList.length > 0 || pdRowRes.rows.length == 0) {
        error(req, 'No product with given key %s was found in Customers table.', pdID);
        t_misc.addError(result.errorList, 'DB_PRODUCT_NOT_FOUND');
        return result;
    }
    var pdRow = pdRowRes.rows[0];

    // Get random salesperson row.
    var spRowRes = await t_db.execOptQuery_p(SQL.SALESPERSONS.SELECT_RANDOM_ROW, false, client);
    if (spRowRes.errorList.length > 0 || spRowRes.rows.length == 0) {
        error(req, 'No salesperson available.');
        t_misc.addError(result.errorList, 'DB_SALESPERSON_NONE_AVAILABLE');
        return result;
    }
    var spRow = spRowRes.rows[0];

    // Check that customer has enough balance to buy product.
    if (cusRow.income < pdRow.price) {
        error(req, 'Customer does not have enough income ($%d) to purchase item ($%d)', cusRow.income, pdRow.price);
        t_misc.addError(result.errorList, 'REQUEST_CUSTOMER_LOW_BALANCE');
        return result;
    }

    // (DB) Insert row into Purchases table.
    var insertData = [t_misc.getMySQLDTStringFromMoment(), cusRow.CUS_ID, spRow.SP_ID, pdRow.PD_ID];
    var purchaseRowInsertRes = await t_db.execOptDataQuery_p(SQL.PURCHASES.INSERT_WITHOUT_PK, insertData, false, client);
    if (purchaseRowInsertRes.errorList.length > 0) {
        error(req, 'Failed to insert row into Purchases table.');
        t_misc.addError(result.errorList, 'DB_SALESPERSON_NONE_AVAILABLE', purchaseRowInsertRes.errorList[0]);
        return result;
    }

    // (DB) Update customer row with subtracted income.
    var updateData      = [cusRow.income - pdRow.price, cusRow.CUS_ID];
    var cusRowUpdateRes = await t_db.execOptDataQuery_p(SQL.CUSTOMERS.UPDATE_INCOME_BY_PK, updateData, false, client);
    if (cusRowUpdateRes.errorList.length > 0) {
        error(req, 'Failed to update row from Customers table.');
        t_misc.addError(result.errorList, 'DB_CUSTOMERS_UPDATE_FAIL', cusRowUpdateRes.errorList[0]);
        return result;
    }

    return result;
}






// *********************************
// EXPORT
// *********************************
module.exports = async function postProductPurchase_p (req, res, client) {
    printraw('');
    print(req, '(Start) POST /product/purchase');

    var suiteResult_p = await action_p(req, client);

    // purchase failed.
    if (suiteResult_p.errorList.length > 0) {

        error(req, suiteResult_p.errorList);
        res.send({ error: 'POST_PRODUCT_PURCHASE_FAILED' });
        warn(req, '(End) Product purchase failed. Response sent.');
    }
    else {
        res.send({ error: null });
        success(req, '(End) Product purchase success. Response sent.');
    }
}
