/**
 * IS2710 Project Web Server
 * GET (DATA) - /customer/search/:CUS_ID
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
module.exports = async function getCustomerSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /customer/search/:CUS_ID');

    // Get PUR_ID param from URL.
    // log(req);

    if (!req || !req.params || !req.params.CUS_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    // if (typeof req.param.PUR_ID !== 'number') {
    if (!validator.isNumeric(req.params.CUS_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.CUS_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var cusID = req.params.CUS_ID;

    // Get customer row from CUS_ID,
    var cusRowRes = await t_db.getCustomerRowByPK_p(cusID, client);
    if (cusRowRes.errorList.length > 0 || cusRowRes.customerRow == null) {
        error('No customer with given key %s was found in Customers table.', cusID);
        res.send({ error: 'DB_CUSTOMERS_QUERY_FAIL' });
        return;
    }
    var cusRow = cusRowRes.customerRow;
    
    res.send({
    	CUS_ID   : cusRow.CUS_ID,
    	name     : cusRow.name,
    	email    : cusRow.email,
    	address  : cusRow.address,
    	income   : cusRow.income,
    	company  : cusRow.company,
    });

    success(req, '(End) Data Sent.');
}
