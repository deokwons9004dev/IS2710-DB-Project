/**
 * IS2710 Project Web Server
 * GET (DATA) - /case/comment/search/:CMT_ID
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
module.exports = async function getCaseCommentSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /case/comment/search/:CMT_ID');

    if (!req || !req.params || !req.params.CMT_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    if (!validator.isNumeric(req.params.CMT_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.CMT_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var cmtID = req.params.CMT_ID;

    // Get case comment row.
    var caseCommentRowRes = await t_db.getCaseCommentRowByPK_p(cmtID, client);
    if (caseCommentRowRes.errorList.length > 0 || caseCommentRowRes.caseCommentRow == null) {
        error('No product with given key %s was found in CaseComments table.', cmtID);
        res.send({ error: 'DB_CASECOMMENTS_QUERY_FAIL' });
        return;
    }
    var caseCommentRow = caseCommentRowRes.caseCommentRow;
    
    res.send({
    	CMT_ID   : caseCommentRow.CMT_ID,
    	ctime    : caseCommentRow.ctime,
    	ctext : caseCommentRow.ctext,
    	CAS_ID   : caseCommentRow.CAS_ID,
    	EMP_ID     : caseCommentRow.EMP_ID,
    	CUS_ID     : caseCommentRow.CUS_ID,
    });

    success(req, '(End) Data Sent.');
}
