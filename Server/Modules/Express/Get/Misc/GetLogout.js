/**
 * IS2710 Project Web Server
 * GET (DATA) - /logout
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
module.exports = async function getLogout_p (req, res, client) {
    printraw('');
    print(req, '(Start) GET /logout');

    if (!req.session) {
        warn(req, '(End) Logout without any login session.');
        res.redirect('/');
        return;
    }

    req.session.destroy(function (err) {
        if (err) 
            warn(req, '(End) Error while destroying session:', err.toString());
        else
            success(req, '(End) Logout successful.');
        res.redirect('/');
    });
}
