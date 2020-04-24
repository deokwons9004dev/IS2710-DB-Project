/**
 * IS2710 Project Web Server
 * GET (DATA) - /salesperson/search/:SP_ID
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
module.exports = async function getSalesPersonSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /salesperson/search/:SP_ID');

    if (!req || !req.params || !req.params.SP_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    if (!validator.isNumeric(req.params.SP_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.SP_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var spID = req.params.SP_ID;

    // Get salesperson row.
    var spRowRes = await t_db.getSalesPersonRowByPK_p(spID, client);
    if (spRowRes.errorList.length > 0 || spRowRes.salesPersonRow == null) {
        error('No product with given key %s was found in SalesPersons table.', spID);
        res.send({ error: 'DB_SALESPERSONS_QUERY_FAIL' });
        return;
    }
    var spRow = spRowRes.salesPersonRow;
    
    res.send({
    	SP_ID   : spRow.SP_ID,
    	name    : spRow.name,
    	address : spRow.address,
    	email   : spRow.email,
    	job     : spRow.job,
    });

    success(req, '(End) Data Sent.');
}
