/*
 * INFSCI 2710 Project Server Application
 * Created By   : David Song (deokwons9004dev@gmail.com)
 * Version      : 1.0.0
 * Port         : 7001
 * Secure Port  : 4001 (Not needed if you use Nginx for HTTPS)
 * ApiDoc Build Command: apidoc -i Server/ -o Web/apidoc/ -e Server/node_modules/
*/

// *********************************
// IMPORT NATIVE/HYBRID MODULES
// *********************************
var http = require("http");
var fs   = require("fs-extra");
var path = require("path");
var util = require('util');
var cp   = require("child_process");

// *********************************
// IMPORT NPM MODULES
// *********************************
var mysql    = require("mysql");
var express  = require("express");
// var sio      = require("socket.io");
// var async    = require("async");
var bcp      = require("bcrypt-nodejs")
var uuidV1   = require("uuid/v1");
var colors   = require("colors");
var antiddos = require("anti-ddos");

var ipware    = require('ipware')().get_ip;
// var requestIP = require('request-ip');


// This is some change~
// This is some more change.
// fsfsfsdf



// *********************************
// IMPORT CUSTOM MODULES: Logging
// *********************************
// var Logger = require("./Modules/Application/Logger.js");
var log    = console.log.bind(this);


// *********************************
// IMPORT CUSTOM MODULES: Other
// *********************************
var Settings = require("./Modules/Application/ServerSettings.js");
const DEF    = Settings;


// *********************************
// IMPORT CUSTOM MODULES: Tools
// *********************************
var t_db    = require("./Modules/Application/DatabaseTools.js");
var t_log   = require('./Modules/Application/LogTools.js');
// var t_email = require('./Modules/Application/EmailTools.js');

// *********************************
// IMPORT CUSTOM MODULES: Managers
// *********************************
var m_ser = require('./Modules/Manager/ServerManager.js');
const SVM = m_ser.ServerManager;

// *********************************
// IMPORT CUSTOM MODULES: Services
// *********************************
// var s_session = require('./Modules/Services/RemoveExpiredSessions.js');

// *********************************
// IMPORT EXPRESS MIDDLEWARE: NPM
// *********************************
var favicon      = require("serve-favicon");
var cookieParser = require("cookie-parser");
var bodyParser   = require("body-parser");
var serveStatic  = require("serve-static");
var session      = require("express-session");
var fileStore    = require("session-file-store")(session);
var multer       = require("multer");

// *********************************
// IMPORT EXPRESS MIDDLEWARE: CUSTOM
// *********************************
// var CustomSessionMiddleware = require("./Modules/Middleware/CustomSessionMiddleware.js");


// *********************************
// IMPORT REQUEST HANDLERS: NON-HTML GET
// *********************************



// *********************************
// IMPORT REQUEST HANDLERS: HTML GET
// *********************************
// var GetMain                  = require("./Modules/Express/Get/GetMain.js");



// *********************************
// IMPORT REQUEST HANDLERS: POST
// *********************************
// var PostAccountLogin        = require("./Modules/Express/Post/PostAccountLogin.js");



// *********************************
// IMPORT REQUEST HANDLERS: SOCKET
// *********************************


// *********************************
// DEFINE EXTRA: Macros
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
// DEFINE EXTRA: Database
// *********************************
var client = null; // Current MySQL Connection.

// *********************************
// DEFINE: Express Application
// *********************************
var app = express();
app.set("port"       , 8080);
app.set("port_secure", 4001); // Inactive.
app.set('trust proxy', 1);

var server = http.createServer(app).listen(app.get('port'), async function () {

	// // (LOCK) Initialize master mutex lock.
	// SVM.initMasterLock();

	// (DB) Initialize Database Connection.
	client = mysql.createConnection({
		user              : DEF.MYSQL.ID,
		password          : DEF.MYSQL.PS,
		multipleStatements: false
	});
	SVM.setDatabase(client);

	// (DB) Apply latest SQL file to MySQL.
	var applySQLResult = await t_db.applySQLFile_p(DEF.MYSQL.ID, DEF.MYSQL.PS, DEF.PATH.DB.SQL);
	if (applySQLResult.errorList.length > 0) {
		error('Failed to apply SQL file to MySQL.');
		error(applySQLResult.errorList);
		process.exit();
	}
	info('Applied latest SQL file to MySQL.');

	// (DB) Make client use LonelyDuck DB.
	var useDBResult = await t_db.useDatabase_p(DEF.MYSQL.DB_NAME, client);
	if (useDBResult.errorList.length > 0) {
		error('Failed to make client use DB (%s).', DEF.MYSQL.DB_NAME);
		error(useDBResult.errorList);
		process.exit();
	}
	info('Client now using Database (%s).', DEF.MYSQL.DB_NAME);

	success('Server has arrived.');
});

// /* Init SocketIO with Shared Session. This is crucial if you
//  * want to use the same sessions within SocketIO. */
// var io = sio.listen(server);
// io.use(function (socket, next) {
// 	sessionMiddleWare(socket.request, socket.request.res, next);
// });

/* Init Express Middleware */
var ddos = new antiddos({
	maxcount    : 100,
	limit       : 80,
	burst       : 40,
	maxexpiry   : 20,
	errormessage: 'Timeout penalty for attempted dos attack.'
});
app.use(ddos.express);                                // DDOS protection middleware.
app.use(bodyParser());                                // POST body parser middleware.
app.use(cookieParser(DEF.COOKIE.signKeys));           // Cookie parser middleware.
app.use(multer({ dest: Settings.uploadPath }).any()); // POST file upload middleware.
// app.use(favicon(path.join(__dirname, '/../Web/img', 'nodelogo.png')));

app.use(function ipwareMiddleware (req, res, next) {
	var ip_info = ipware(req);
	// { clientIp: '127.0.0.1', clientIpRoutable: false }
	next();
});
// app.use(sessionMiddleWare); // Attach the session middleware init'ed above.
// app.use(function requestIPMiddleware (req, res, next) {
// 	const clientIp = requestIP.getClientIp(req);
// 	debug(clientIp);
// 	next();
// });


// app.use('/pages'    ,serveStatic(path.join(__dirname, '/../Web/pages')));
// app.use('/css'      ,serveStatic(path.join(__dirname, '/../Web/css')));
// app.use('/js'       ,serveStatic(path.join(__dirname, '/../Web/js')));
// app.use('/img'      ,serveStatic(path.join(__dirname, '/../Web/img')));
// app.use('/api'      ,serveStatic(path.join(__dirname, '/../Web/apidoc')));
// app.use('/download' ,serveStatic(path.join(__dirname, '/../Web/download')));
app.use(serveStatic(path.join(__dirname, '/../Web'), {
	index     : ['index.html'],
	extensions: ['html', 'htm']
}));

/* Session & Cookie Cleaner. This will run before
 * you catch any GET or POST requests. */
// app.use(function (req, res, next) { CustomSessionMiddleware(req, res, next, client); });


// *********************************
// ERROR HANDLING
// *********************************
// process.on('rejectionHandled', function (e) {
//     error('rejectionHandled:', e);
// });
// process.on('uncaughtException', async function (e) {
//     error('uncaughtException:', e);
// 	if (e.code && e.code == 'PROTOCOL_CONNECTION_LOST') {
//
// 		// Reconnect MySQL client.
// 		commit('Reconnecting MySQL connection.');
// 		client = mysql.createConnection({
// 			user              : DEF.MYSQL.ID,
// 			password          : DEF.MYSQL.PS,
// 			multipleStatements: false
// 		});
// 		info('MySQL connection established.');
//
// 		// (DB) Make client use LonelyDuck DB.
// 		var useDBResult = await t_db.useDatabase_p(DEF.MYSQL.DB_NAME, client);
// 		if (useDBResult.errorList.length > 0) {
// 			error('Failed to make client use DB (%s).', DEF.MYSQL.DB_NAME);
// 			error(useDBResult.errorList);
// 			process.exit();
// 		}
// 		info('Client now using Database (%s).', DEF.MYSQL.DB_NAME);
// 	}
// });
// process.on('unhandledRejection', function (e) {
//     error('unhandledRejection:', e);
// });
// process.on('warning', function (e) {
//     error('warning:', e);
// });



// *********************************
// GET REQUESTS (HTML)
// *********************************
// /**
//  * @api {get} / Main Page Access
//  * @apiName    GetMain
//  * @apiGroup   Get Requests (HTML)
//  * @apiVersion 1.0.0
//  */
// app.get("/", function (req, res) { GetMain(req, res); });
// /**
//  * @api {get} /login LonelyDuck login page.
//  * @apiName    GetLogin
//  * @apiGroup   Get Requests (HTML)
//  * @apiVersion 1.0.0
//  */
// app.get("/login", function (req, res) { GetLogin(req, res); });
// /**
//  * @api {get} /register LonelyDuck register page.
//  * @apiName    GetRegister
//  * @apiGroup   Get Requests (HTML)
//  * @apiVersion 1.0.0
//  */
// app.get("/register", function (req, res) { GetRegister(req, res); });
// /**
//  * @api {get} /psreset LonelyDuck password reset page.
//  * @apiName    GetPasswordReset
//  * @apiGroup   Get Requests (HTML)
//  * @apiVersion 1.0.0
//  */
// app.get("/psreset", function (req, res) { GetPasswordReset(req, res); });
