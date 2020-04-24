/**
 * IS2710 Project Web Server
 * GET (DATA) - /product/search/:PD_ID
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
module.exports = async function getProductSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /product/search/:PD_ID');

    if (!req || !req.params || !req.params.PD_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    if (!validator.isNumeric(req.params.PD_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.PD_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var pdID = req.params.PD_ID;

    // Get product row.
    var pdRowRes = await t_db.getProductRowByPK_p(pdID, client);
    if (pdRowRes.errorList.length > 0 || pdRowRes.productRow == null) {
        error('No product with given key %s was found in Products table.', pdID);
        res.send({ error: 'DB_PRODUCTS_QUERY_FAIL' });
        return;
    }
    var pdRow = pdRowRes.productRow;
    
    res.send({
    	PD_ID       : pdRow.PD_ID,
    	name        : pdRow.name,
    	description : pdRow.description,
    	price       : pdRow.price,
    });

    success(req, '(End) Data Sent.');
}
