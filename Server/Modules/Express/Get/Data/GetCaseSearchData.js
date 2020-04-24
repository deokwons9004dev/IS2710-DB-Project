/**
 * IS2710 Project Web Server
 * GET (DATA) - /case/search/:CAS_ID
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
module.exports = async function getCaseSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /case/search/:CAS_ID');

    if (!req || !req.params || !req.params.CAS_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    if (!validator.isNumeric(req.params.CAS_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.CAS_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var caseID = req.params.CAS_ID;

    // Get case row.
    var caseRowRes = await t_db.getCaseRowByPK_p(caseID, client);
    if (caseRowRes.errorList.length > 0 || caseRowRes.caseRow == null) {
        error('No product with given key %s was found in Cases table.', caseID);
        res.send({ error: 'DB_CASES_QUERY_FAIL' });
        return;
    }
    var caseRow = caseRowRes.caseRow;
    
    res.send({
    	CAS_ID   : caseRow.CAS_ID,
    	summary    : caseRow.summary,
    	description : caseRow.description,
    	opentime   : caseRow.opentime,
    	closetime     : caseRow.closetime,
    	status     : caseRow.status,
    	PUR_ID     : caseRow.PUR_ID,
    	EMP_ID     : caseRow.EMP_ID,
    	COMRES_ID     : caseRow.COMRES_ID,
    });

    success(req, '(End) Data Sent.');
}
