/**
 * IS2710 Project Web Server
 * GET (DATA) - /product/purchase/:PUR_ID
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
module.exports = async function getMain (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /product/purchase/:PUR_ID');

    // Get PUR_ID param from URL.
    // log(req);

    if (!req || !req.params || !req.params.PUR_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    // if (typeof req.param.PUR_ID !== 'number') {
    if (!validator.isNumeric(req.params.PUR_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.PUR_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var purID = req.params.PUR_ID;

    // Get purcahse row from pur_id,
    var purRowRes = await t_db.getPurchaseRowByPK_p(purID, client);
    if (purRowRes.errorList.length > 0 || purRowRes.purchaseRow == null) {
        error('No purcahse with given key %s was found in Purcahses table.', purID);
        res.send({ error: 'DB_PURCHASES_QUERY_FAIL' });
        return;
    }
    var purRow = purRowRes.purchaseRow;
    
    // Get SalesPerson row from sp_id,
    var salesRowRes = await t_db.getSalesPersonRowByPK_p(purRow.SP_ID, client);
    if (salesRowRes.errorList.length > 0 || salesRowRes.salesPersonRow == null) {
        error('No salesperson with given key %s was found in SalesPersons table..', purRow.SP_ID);
        res.send({ error: 'DB_SALESPERSONS_QUERY_FAIL' });
        return;
    }
    var salesRow = salesRowRes.salesPersonRow;
    
    // Get Products row from pd_id.
    var productRowRes = await t_db.getProductRowByPK_p(purRow.PD_ID, client);
    if (productRowRes.errorList.length > 0 || productRowRes.productRow == null) {
        error('No product with given key %s was found in Products table..', purRow.PD_ID);
        res.send({ error: 'DB_PRODUCTS_QUERY_FAIL' });
        return;
    }
    var productRow = productRowRes.productRow
    
    res.send({
        purchaseDate       : t_misc.getMomentStringFromMySQLDTString(purRow.purchase_date),
    	CustomerID         : purRow.CUS_ID,
    	SalesPersonName    : salesRow.name,
    	SalesPersonAddress : salesRow.address,
    	SalesPersonEmail   : salesRow.email,
    	SalesPersonjob     : salesRow.job,
    	ProductID          : productRow.PD_ID,
    	ProductName        : productRow.name,
    	ProductDescription : productRow.description,
    	ProductPrice       : productRow.price
    });

    success(req, '(End) Data Sent.');
}
