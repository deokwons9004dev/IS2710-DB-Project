/*
 * INFSCI 2710 Project Server Application
 * Created By   : David Song (deokwons9004dev@gmail.com)
 * Version      : 1.0.0
 * Port         : 7001
 * Secure Port  : 4001 (Not needed if you use Nginx for HTTPS)
 * ApiDoc Build Command: apidoc -i Server/ -o Web/apidoc/ -e Server/node_modules/
 * ApiDoc Build Command: apidoc -f Server/main.js -c Server/ -e ./.c9/ -t apiDocTemplates/apidoc-template/template/ -o ./Web/apidoc/
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
// IMPORT REQUEST HANDLERS: DATA GET
// *********************************
var GetProductPurchaseData              = require("./Modules/Express/Get/Data/GetProductPurchaseData.js");


// *********************************
// IMPORT REQUEST HANDLERS: HTML GET
// *********************************
var GetMainHTML               = require("./Modules/Express/Get/GetMainHTML.js");
var GetLoginHTML              = require("./Modules/Express/Get/GetLoginHTML.js");
var GetCustomerMainHTML       = require("./Modules/Express/Get/GetCustomerMainHTML.js");
var GetEmployeeMainHTML       = require("./Modules/Express/Get/GetEmployeeMainHTML.js");
var GetAPIHTML                = require("./Modules/Express/Get/GetAPIHTML.js");

// var GetProductHTML            = require("./Modules/Express/Get/GetProductHTML.js");
// var GetCustomerMyOrdersHTML   = require("./Modules/Express/Get/GetCustomerMyOrdersHTML.js");
// var GetCustomerCaseCreateHTML = require("./Modules/Express/Get/GetCustomerCaseCreateHTML.js");

var GetCustomerCaseDetailsTemplateHTML     = require("./Modules/Express/Get/GetCustomerCaseDetailsTemplateHTML.js");
var GetCustomerCaseNewTemplateHTML         = require("./Modules/Express/Get/GetCustomerCaseNewTemplateHTML.js");
var GetCustomerPurchaseDetailsTemplateHTML = require("./Modules/Express/Get/GetCustomerPurchaseDetailsTemplateHTML.js");
var GetProductResolutionsTemplateHTML      = require("./Modules/Express/Get/GetProductResolutionsTemplateHTML.js");
var GetProductComresNewHTML                = require("./Modules/Express/Get/GetProductComresNewHTML.js");



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

// app.set("listenIP"   , '127.0.0.1');   // For Live Preview inside cloud9.
// app.set("listenIP"   , '0.0.0.0');   // For Live Preview inside cloud9.
// app.set("listenIP"   , '3.135.64.50'); // For sharing server app with public internet.
// app.set("listenIP"   , '3.136.229.81'); // For sharing server app with public internet (using elastic IP).
app.set("listenIP"   , '172.31.20.148'); // For sharing server app with public internet (using private IP)

// app.set("port"       , 80);
// app.set("port"       , 3000);
app.set("port"       , 8080);
app.set("port_secure", 4001); // Inactive.

app.set('trust proxy', 1);

var server = http.createServer(app).listen(app.get('port'), async function () {
// var server = http.createServer(app).listen(app.get('port'), app.get('listenIP'), async function () {

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
app.use('/css'      ,serveStatic(path.join(__dirname, '/../Web/css')));
app.use('/js'       ,serveStatic(path.join(__dirname, '/../Web/js')));
app.use('/img'      ,serveStatic(path.join(__dirname, '/../Web/img')));
app.use('/api'      ,serveStatic(path.join(__dirname, '/../Web/apidoc')));
// app.use('/download' ,serveStatic(path.join(__dirname, '/../Web/download')));

// app.use(serveStatic(path.join(__dirname, '/../Web'), {
// 	index     : ['index.html'],
// 	extensions: ['html', 'htm']
// }));

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
/**
 * @apiDefine GET_HTML Get (HTML)
 * Normal GET Request APIs for HTML pages.
 */
 
/**
 * @api {get} / /
 * @apiDescription Requests main intro page.<br />
 * This page shows the list of available products, but since user 
 * is not logged in as either a customer or an employee, there is no buy option 
 * for the products, but they can see the resolutions.
 * 
 * @apiName    GetMainHTML
 * @apiGroup   GET_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/", function (req, res) { GetMainHTML(req, res); });

/**
 * @api {get} /login /login
 * @apiDescription Requests login page for both customer and employee.
 * 
 * @apiName    GetLoginHTML
 * @apiGroup   GET_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/login", function (req, res) { GetLoginHTML(req, res); });

/**
 * @api {get} /customer /customer
 * @apiDescription Requests main page for logged in customer.<br />
 * This page should show at least the following:
 * - My Info Table: A single row table that shows the basic information about the customer.
 * - My Purchases Table: A table that shows all the purchases that the customer has made.
 * - My Cases Table: A table that shows all the cases that the customer has opened (started).
 * - Products Table: The table of products available to buy.
 * 
 * @apiName    GetCustomerMainHTML
 * @apiGroup   GET_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/customer", function (req, res) { GetCustomerMainHTML(req, res); });

/**
 * @api {get} /employee /employee
 * @apiDescription Requests main page for logged in employee.
 * 
 * @apiName    GetEmployeeMainHTML
 * @apiGroup   GET_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/employee", function (req, res) { GetEmployeeMainHTML(req, res); });

/**
 * @api {get} /api /api
 * @apiDescription Requests the API page for this server.
 * 
 * @apiName    GetAPIHTML
 * @apiGroup   GET_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/api", function (req, res) { GetAPIHTML(req, res); });




// *********************************
// GET REQUESTS (HTML Templates)
// *********************************
/**
 * @apiDefine GET_TEMPLATE_HTML Get (TemplateHTML)
 * GET requests for data-empty template pages.<br />
 * These requests will only send the data-empty template HTML to the browser.<br />
 * To provide the proper HTML page with the user data supplied, once the user 
 * clicks a link (or a button) that has the resource's unique identifier 
 * (usually the Primary Key of the row), you must save the UID as a temp cookie
 * and first request this template page. Then, once the page is completely rendered,
 * you can use the appropriate Data GET request to get the specific resource data
 * using the cookie value as the parameter(s).<br />
 * Make sure to remove the temp cookie after use.<br />
 * For a visual guide, check the "Misc/LinkClickRequestDiagram.png" for how a link
 * click should be handled.
 */

/**
 * @api {get} /customer/case/details /customer/case/details
 * 
 * @apiDescription Requests a case detail template HTML page.
 * 
 * @apiName    GetCustomerCaseDetailsTemplateHTML
 * @apiGroup   GET_TEMPLATE_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/customer/case/details", function (req, res) { GetCustomerCaseDetailsTemplateHTML(req, res); });
/**
 * @api {get} /customer/case/new /customer/case/new
 * 
 * @apiDescription Requests a open new case template HTML page.
 * 
 * @apiName    GetCustomerCaseNewTemplateHTML
 * @apiGroup   GET_TEMPLATE_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/customer/case/new", function (req, res) { GetCustomerCaseNewTemplateHTML(req, res); });
/**
 * @api {get} /customer/purchase/details /customer/purchase/details
 * 
 * @apiDescription Requests a customer purchase detail template HTML page.
 * 
 * @apiName    GetCustomerPurchaseDetailsTemplateHTML
 * @apiGroup   GET_TEMPLATE_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/customer/purchase/details", function (req, res) { GetCustomerPurchaseDetailsTemplateHTML(req, res); });
/**
 * @api {get} /product/resolutions /product/resolutions
 * 
 * @apiDescription Requests a product's resolution template HTML page.
 * 
 * @apiName    GetProductResolutionsTemplateHTML
 * @apiGroup   GET_TEMPLATE_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/product/resolutions", function (req, res) { GetProductResolutionsTemplateHTML(req, res); });
/**
 * @api {get} /product/comres/new /product/comres/new
 * 
 * @apiDescription Requests a product's new common resolution posting template HTML page.
 * 
 * @apiName    GetProductComresNewHTML
 * @apiGroup   GET_TEMPLATE_HTML
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
app.get("/product/comres/new", function (req, res) { GetProductComresNewHTML(req, res); });




// *********************************
// GET REQUESTS (Data)
// *********************************
/**
 * @apiDefine GET_DATA Get (Data)
 * GET requests for non-HTML data only.
 */
 
/**
 * @api {get} /purchase/details/:PUR_ID /purchase/details/:PUR_ID
 * 
 * @apiDescription Requests information about a customer's product purchase data.
 * 
 * @apiParam {Number} PUR_ID The PK of each Purchases table row.
 * @apiParamExample {Number} Request-Example:
 *		{
 *			PUR_ID: 12345
 *		}
 * 
 * @apiError REQUEST_PARAM_NOT_FOUND    The <code>PUR_ID</code> of the purchase was not found.
 * @apiError REQUEST_PARAM_INVALID_TYPE The <code>PUR_ID</code> is not a number type.
 * @apiError DB_PURCHASES_QUERY_FAIL    Failed to query the Purchases table.
 * @apiError DB_SALESPERSONS_QUERY_FAIL Failed to query the SalesPersons table.
 * @apiError DB_PRODUCTS_QUERY_FAIL     Failed to query the Products table.
 * @apiErrorExample {json} Error-Response:
 *		HTTP/1.1 404 Not Found
 *		{
 *			"error": "REQUEST_PARAM_NOT_FOUND"
 *		}
 * 
 * @apiSuccess {Object} PurchaseDetails                     All relevent information about the purchase made by the customer.
 * @apiSuccess {String} PurchaseDetails.purchaseDate        DateTime of the purcahse.
 * @apiSuccess {Number} PurchaseDetails.CustomerID          (PK) Unique identifier of the purchased customer.
 * @apiSuccess {String} PurchaseDetails.SalesPersonName     Name of the sales person who sold the product..
 * @apiSuccess {String} PurchaseDetails.SalesPersonAddress  Address of the office that the sales person works in,
 * @apiSuccess {String} PurchaseDetails.SalesPersonEmail    Email address of the sales person.
 * @apiSuccess {String} PurchaseDetails.SalesPersonjob      Job title of the sales person.
 * @apiSuccess {String} PurchaseDetails.ProductID           (PK) Unique identifier of the purchased product.
 * @apiSuccess {String} PurchaseDetails.ProductName         Name of the purchased product.
 * @apiSuccess {String} PurchaseDetails.ProductDescription  Description of the product.
 * @apiSuccess {Number} PurchaseDetails.ProductPrice        Price of the product.
 * 
 * @apiSuccessExample {json} Success-Response:
 *		HTTP/1.1 200 OK
 *		{
 *			purchaseDate       : "2020-04-20 03:40 PM",
 *			CustomerID         : 707,
 *			SalesPersonName    : "James Smith",
 *			SalesPersonAddress : "5508 Walnut St, Pittsburgh, PA 15232",
 *			SalesPersonEmail   : "james123@company.com",
 *			SalesPersonjob     : "Regional Manager",
 *			ProductID          : 119283,
 *			ProductName        : "TPLink Wireless Router T20",
 *			ProductDescription : "- JD Power Award ---Highest in customer...",
 *			ProductPrice       : 99
 *		}
 * 
 * 
 * @apiExample {curl} Example usage:
 *		GET http://3.23.28.11/product/purchase/1 OR
 *		curl -i http://3.23.28.11/product/purchase/1 OR
 *		<!DOCTYPE html>
		<html>
			<head>
				<meta charset="UTF-8">
				<title></title>
				<script
					src="https://code.jquery.com/jquery-1.12.4.min.js"
					integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="
					crossorigin="anonymous"></script>
				<script>
					$(document).ready(function () {
						$.ajax({
							method: 'get',
							url: 'http://3.23.28.11/product/purchase/1',
							success: function (data, textStatus, jqXHR) { 
								$( "#result" ).html( data );
							},
							dataType: 'json'
						});
					})
				</script>
			</head>
			<body>
				<p id="result"></p>
			</body>
		</html>
 * 
 * @apiName    GetProductPurchaseData
 * @apiGroup   GET_DATA
 * @apiVersion 1.0.0
 */
app.get("/product/purchase/:PUR_ID", function (req, res) { GetProductPurchaseData(req, res, client); });


app.get("/customer/search/:CUS_ID", function (req, res) { (req, res, client); });
app.get("/product/search/:PD_ID", function (req, res) { (req, res, client); });
app.get("/salesperson/search/:SP_ID", function (req, res) { (req, res, client); });
app.get("/employee/search/:EMP_ID", function (req, res) { (req, res, client); });
app.get("/comres/search/:COMRES_ID", function (req, res) { (req, res, client); });
app.get("/case/search/:CAS_ID", function (req, res) { (req, res, client); });
app.get("/case/comment/search/:CMT_ID", function (req, res) { (req, res, client); });

app.get("/logout", function (req, res) { (req, res, client); });



// *********************************
// POST REQUESTS (General)
// *********************************

// A customer buys a product.
app.post("/product/purchase", function (req, res) { (req, res, client); });

// An employee or customer posts a comment about a case.
app.post("/case/comment/post", function (req, res) { (req, res, client); });

// An employee or customer posts a common resolution about a product.
app.post("/product/comres/post", function (req, res) { (req, res, client); });


// *********************************
// POST REQUESTS (Search)
// *********************************
// An employee searches cases.
app.post("employee/search/case", function (req, res) { (req, res, client); });
app.post("employee/search/customer", function (req, res) { (req, res, client); });
app.post("employee/search/comres", function (req, res) { (req, res, client); });




// *********************************
// POST REQUESTS (Aggregation)
// *********************************
// An employee makes an aggregation query request on the cases.
app.post("employee/agg/case", function (req, res) { (req, res, client); });


/**
 *  {get} /customer/case/create/:PD_ID Requests a customer "Create New Case" template HTML page.
 * 
 * @apiDescription The page will have a form like-structure (label and value), with a “Submit” button at the very button.
 * It should have the following field inputs:
 * - Summary: A basic title describing the issue.
 *   ex) Summary: My router can't connect to 5GHz networks. 
 * - Description: A detailed text providing more insight to the problem/issue thats occurring.
 *   ex) Description: I bought this router because it said it can connect to 5GHz networks and blah... 
 * - Customer: The name from the Customers table.
 *   ex) Customer: John Smith
 * - Product: The name from the Products table.
 *   ex) Product: TP-LINK_N20P Router
 * 
 * - The customer's CUS_ID will be available via cookies, and the product's PD_ID 
 *   will be available via the request params, and you can make subsequent GET requests 
 *   to retrieve information about the customer and the product (and use their names 
 *   to auto-fill in the fields).
 * 
 * @apiName    GetCustomerCaseCreateHTML
 * @apiGroup   Get Requests (HTML)
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
// app.get("/customer/case/create/:PD_ID", function (req, res) { GetCustomerCaseCreateHTML(req, res); });
/**
 *  {get} /customer/case Requests a "View My Case" template HTML page.
 * @apiName    GetCustomerMyOrdersHTML
 * @apiGroup   Get Requests (HTML)
 * @apiVersion 1.0.0
 * @apiSuccess {String} HTML data of the page.
 */
// app.get("/customer/myorders", function (req, res) { GetCustomerMyOrdersHTML(req, res); });
