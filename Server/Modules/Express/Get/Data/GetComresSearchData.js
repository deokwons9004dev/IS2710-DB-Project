/**
 * IS2710 Project Web Server
 * GET (DATA) - /comres/search/:COMRES_ID
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
module.exports = async function getComresSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /comres/search/:COMRES_ID');

    if (!req || !req.params || !req.params.COMRES_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    if (!validator.isNumeric(req.params.COMRES_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.COMRES_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var comresID = req.params.COMRES_ID;

    // Get common resolution row.
    var comresRowRes = await t_db.getComresRowByPK_p(comresID, client);
    if (comresRowRes.errorList.length > 0 || comresRowRes.comresRow == null) {
        error('No product with given key %s was found in CommonResolutions table.', comresID);
        res.send({ error: 'DB_COMRES_QUERY_FAIL' });
        return;
    }
    var comresRow = comresRowRes.comresRow;
    
    res.send({
    	COMRES_ID   : comresRow.COMRES_ID,
    	name    : comresRow.name,
    	guide : comresRow.guide,
    	views   : comresRow.views,
    	PD_ID     : comresRow.PD_ID,
    	CUS_ID     : comresRow.CUS_ID,
    	EMP_ID     : comresRow.EMP_ID,
    });

    success(req, '(End) Data Sent.');
}
