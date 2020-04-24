/**
 * IS2710 Project Web Server
 * GET (DATA) - /employee/search/:EMP_ID
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
module.exports = async function getEmployeeSearchData_p (req, res, client) {
    // printraw('');
    print(req, '(Start) GET /employee/search/:EMP_ID');

    if (!req || !req.params || !req.params.EMP_ID) {
        error('Request param was not given.');
        res.send({ error: 'REQUEST_PARAM_NOT_FOUND' });
        return;
    }
    
    if (!validator.isNumeric(req.params.EMP_ID)) {
        error('Request param incorrect type. Expected number. Got ' + typeof(req.param.EMP_ID));
        res.send({ error: 'REQUEST_PARAM_INVALID_TYPE' });
        return;
    }

    var empID = req.params.EMP_ID;

    // Get employee row.
    var empRowRes = await t_db.getEmployeeRowByPK_p(empID, client);
    if (empRowRes.errorList.length > 0 || empRowRes.employeeRow == null) {
        error('No product with given key %s was found in Employee table.', empID);
        res.send({ error: 'DB_EMPLOYEE_QUERY_FAIL' });
        return;
    }
    var empRow = empRowRes.employeeRow;
    
    res.send({
    	EMP_ID   : empRow.EMP_ID,
    	name    : empRow.name,
    	address : empRow.address,
    	phone   : empRow.phone,
    	email     : empRow.email,
    });

    success(req, '(End) Data Sent.');
}
