/**
 * IS2710 Project Web Server
 * GET (Misc) - /myinfo
 *
 * Author : David Song (deokwons9004dev@gmail.com)
 * Version: 1.0.0
 */

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var fs   = require("fs");
var path = require("path");

// *********************************
// IMPORT NPM MODULES
// *********************************
var validator = require('validator');


// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var settings = require("./../../../Application/ServerSettings.js");
const DEF    = settings;

// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_misc  = require('./../../../Application/MiscTools.js');
var t_log   = require('./../../../Application/LogTools.js');
var t_db    = require('./../../../Application/DatabaseTools.js');

// *********************************
// DEFINE EXTRA
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
 // EXPORT
 // *********************************
module.exports = async function getMyInfo_p (req, res, client) {
    printraw('');
    print(req, '(Start) GET /myinfo');
    
    if (!req || !req.session || !req.session.loginPK || !req.session.loginType) {
        error('Request does not have a logged in session data.');
        res.send({ error: 'REQUEST_SESSION_NOT_FOUND' });
        return;
    }
    
    if (typeof(req.session.loginPK) != 'number') {
        error('Request session primary key is not a number. Got ' + typeof(req.session.loginPK));
        res.send({ error: 'REQUEST_SESSION_LOGIN_PK_INVALID_TYPE' });
        return;
    }
    if (req.session.loginType != 'customer' && req.session.loginType != 'employee') {
        error('Request session login type is invalid. Got ' + req.session.loginType);
        res.send({ error: 'REQUEST_SESSION_LOGIN_TYPE_INVALID_TYPE' });
        return;
    }
    
    var loginPK   = req.session.loginPK;
    var loginType = req.session.loginType;
    
    if (loginType == 'customer') {
        
        // Get customer row.
        var cusRowRes = await t_db.getCustomerRowByPK_p(loginPK, client);
        if (cusRowRes.errorList.length > 0 || cusRowRes.customerRow == null) {
            error('No customer with given key %s was found in Customers table.', loginPK);
            res.send({ error: 'DB_CUSTOMER_NOT_FOUND' });
            return;
        }
        var cusRow = cusRowRes.customerRow;
        
        res.send({
        	CUS_ID  : cusRow.CUS_ID,
        	name    : cusRow.name,
        	email   : cusRow.email,
        	address : cusRow.address,
        	income  : cusRow.income,
        	company : cusRow.company,
        });
    }
    else {
        // Get employee row.
        var empRowRes = await t_db.getEmployeeRowByPK_p(loginPK, client);
        if (empRowRes.errorList.length > 0 || empRowRes.employeeRow == null) {
            error('No employee with given key %s was found in Employee table.', loginPK);
            res.send({ error: 'DB_CUSTOMER_NOT_FOUND' });
            return;
        }
        var empRow = empRowRes.employeeRow;
        
        res.send({
        	EMP_ID  : empRow.EMP_ID,
        	name    : empRow.name,
        	address : empRow.address,
        	phone   : empRow.phone,
        	email   : empRow.email,
        });
    }
    
    success(req, '(End) Data Sent.');
}
