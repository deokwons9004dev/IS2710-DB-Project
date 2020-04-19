/**
 * GET (NON-HTML) - Reloads the database.
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
 var settings = require("./../../../Application/ServerSettings.js");
 const DEF    = settings;

 // *********************************
 // IMPORT CUSTOM MODULES: Tools
 // *********************************
 var t_misc = require('./../../../Application/MiscTools.js');
 var t_log  = require('./../../../Application/LogTools.js');
 var t_res  = require('./../../../Application/ResponseTools.js');
 var t_db   = require('./../../../Application/DatabaseTools.js');

 // *********************************
 // IMPORT CUSTOM MODULES: Managers
 // *********************************
 var m_ser = require('./../../../Manager/ServerManager.js');
 const SVM = m_ser.ServerManager;

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
 // NON-EXPORT HELPERS
 // *********************************
/**
 * @async
 * Performs the database reloading.
 *
 * @param  {Object} req
 * @param  {Object} client
 * @return {Object} result
 */
async function action_p (req, client) {
    var result = { errorList: [] };

    var dropResult = await t_db.dropDatabase_p(DEF.MYSQL.DB_NAME, client);
    if (dropResult.errorList.length > 0) return dropResult;

    var sqlResult = await t_db.applySQLFile_p(DEF.MYSQL.ID, DEF.MYSQL.PS, DEF.PATH.DB.SQL);
    if (sqlResult.errorList.length > 0) return sqlResult;

    var useResult = await t_db.useDatabase_p(DEF.MYSQL.DB_NAME, client);
    if (useResult.errorList.length > 0) return useResult;

    return result;
}











 // *********************************
 // EXPORT
 // *********************************
module.exports = async function getDatabaseReload_p (req, res, client) {
    printraw('');
    // print(req, '[GET] LonelyDuck database reload request.');
    print(req, '(Start) [No-HTML] GET /admin/reload');

    await SVM.lockMaster_p();
    var actionResult = await action_p(req, client);
    SVM.unlockMaster();

    if (actionResult.errorList.length > 0) {
        t_res.sendResponse(res, {
            result: 'fail',
            cause : t_misc.getErrorNameList(actionResult.errorList)
        });

        debug(req, actionResult.errorList);
        error(req, '(End) Failed to reload database.');
    }
    else {
        t_res.sendResponse(res, { result : 'success' });

        success(req, '(End) Successfully reloaded database.');
    }
}
