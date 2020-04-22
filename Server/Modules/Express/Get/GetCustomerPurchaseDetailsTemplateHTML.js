/**
 * IS2710 Project Web Server
 * GET (HTML) - /customer/purchase/details
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

 // *********************************
 // IMPORT CUSTOM MODULES: Other
 // *********************************
 var settings = require("./../../Application/ServerSettings.js");
 const DEF    = settings;

 // *********************************
 // IMPORT CUSTOM MODULES: Tools
 // *********************************
 var t_log  = require('./../../Application/LogTools.js');

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
module.exports = function getMain (req, res) {
    // printraw('');
    print(req, '(Start) GET /customer/purchase/details');

    var html = fs.readFileSync(DEF.PATH.TEMPLATES.CUSTOMER_PURCHASE_DETAILS, 'utf8');
    res.send(html.toString());

    success(req, '(End) Page Sent.');
}
