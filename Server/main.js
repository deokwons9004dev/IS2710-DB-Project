/*
 * INFSCI 2710 Project Server Application
 * Created By   : David Song (deokwons9004dev@gmail.com)
 * Version      : 1.0.0
 * Port         : 8080
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
// IMPORT REQUEST HANDLERS: HTML GET
// *********************************
var GetMainHTML               = require("./Modules/Express/Get/GetMainHTML.js");
var GetLoginHTML              = require("./Modules/Express/Get/GetLoginHTML.js");
var GetCustomerMainHTML       = require("./Modules/Express/Get/GetCustomerMainHTML.js");
var GetEmployeeMainHTML       = require("./Modules/Express/Get/GetEmployeeMainHTML.js");
var GetAPIHTML                = require("./Modules/Express/Get/GetAPIHTML.js");


// *********************************
// IMPORT REQUEST HANDLERS: HTML TEMPLATE GET
// *********************************
var GetCustomerCaseDetailsTemplateHTML     = require("./Modules/Express/Get/GetCustomerCaseDetailsTemplateHTML.js");
var GetCustomerCaseNewTemplateHTML         = require("./Modules/Express/Get/GetCustomerCaseNewTemplateHTML.js");
var GetCustomerPurchaseDetailsTemplateHTML = require("./Modules/Express/Get/GetCustomerPurchaseDetailsTemplateHTML.js");
var GetProductResolutionsTemplateHTML      = require("./Modules/Express/Get/GetProductResolutionsTemplateHTML.js");
var GetProductComresNewHTML                = require("./Modules/Express/Get/GetProductComresNewHTML.js");


// *********************************
// IMPORT REQUEST HANDLERS: DATA GET
// *********************************
var GetProductPurchaseData = require("./Modules/Express/Get/Data/GetProductPurchaseData.js");
var GetCustomerSearchData = require("./Modules/Express/Get/Data/GetCustomerSearchData.js");
var GetProductSearchData = require("./Modules/Express/Get/Data/GetProductSearchData.js");
var GetSalesPersonSearchData = require("./Modules/Express/Get/Data/GetSalesPersonSearchData.js");
var GetEmployeeSearchData = require("./Modules/Express/Get/Data/GetEmployeeSearchData.js");
var GetComresSearchData = require("./Modules/Express/Get/Data/GetComresSearchData.js");
var GetCaseSearchData = require("./Modules/Express/Get/Data/GetCaseSearchData.js");
var GetCaseCommentSearchData = require("./Modules/Express/Get/Data/GetCaseCommentSearchData.js");


// *********************************
// IMPORT REQUEST HANDLERS: MISC GET
// *********************************
var GetMyInfo = require("./Modules/Express/Get/Misc/GetMyInfo.js");
var GetLogout = require("./Modules/Express/Get/Misc/GetLogout.js");



// *********************************
// POST REQUESTS (DB Direct Query)
// *********************************
var PostDBQuery = require("./Modules/Express/Post/PostDBQuery.js");



// *********************************
// POST REQUESTS (General)
// *********************************
var PostLogin               = require("./Modules/Express/Post/PostLogin.js");
var PostProductPurchase     = require("./Modules/Express/Post/PostProductPurchase.js");
var PostCaseSubmit          = require("./Modules/Express/Post/PostCaseSubmit.js");
var PostCaseCommentSubmit   = require("./Modules/Express/Post/PostCaseCommentSubmit.js");
var PostProductComresSubmit = require("./Modules/Express/Post/PostProductComresSubmit.js");


// *********************************
// POST REQUESTS (Search)
// *********************************
var PostEmployeeSearchCase     = require("./Modules/Express/Post/PostEmployeeSearchCase.js");
var PostEmployeeSearchCustomer = require("./Modules/Express/Post/PostEmployeeSearchCustomer.js");
var PostEmployeeSearchComres   = require("./Modules/Express/Post/PostEmployeeSearchComres.js");


// *********************************
// POST REQUESTS (Aggregation)
// *********************************
var PostEmployeeAggCases     = require("./Modules/Express/Post/PostEmployeeAggCases.js");



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
// app.set("listenIP"   , '172.31.20.148'); // For sharing server app with public internet (using private IP)

// app.set("port"       , 80);
// app.set("port"       , 3000);
app.set("port"       , 8080);
app.set("port_secure", 4001); // Inactive.

app.set('trust proxy', 1);

var server = http.createServer(app).listen(app.get('port'), async function () {

	// (DB) Initialize Database Connection.
	client = mysql.createConnection({
		user              : DEF.MYSQL.ID,
		password          : DEF.MYSQL.PS,
		multipleStatements: true
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

/* Init Express Middleware */
// var ddos = new antiddos({
// 	maxcount    : 100,
// 	limit       : 80,
// 	burst       : 40,
// 	maxexpiry   : 20,
// 	errormessage: 'Timeout penalty for attempted dos attack.'
// });
// app.use(ddos.express);                                // DDOS protection middleware.

app.use(bodyParser());                                // POST body parser middleware.
app.use(cookieParser(DEF.COOKIE.signKeys));           // Cookie parser middleware.
app.use(multer({ dest: Settings.uploadPath }).any()); // POST file upload middleware.

app.use(function ipwareMiddleware (req, res, next) {
	var ip_info = ipware(req);
	next();
});


app.use(session({
	store: new fileStore({
		path: '~/.IS2710Sessions'
//		path: '/home/ubuntu/environment/IS2710Sessions'
	}),
	secret: 'My Session Secret String',
	saveUninitialized: false,
	resave: true,
	name: 'loginSessionCookie'
}))


app.use('/css'      ,serveStatic(path.join(__dirname, '/../Web/css')));
app.use('/js'       ,serveStatic(path.join(__dirname, '/../Web/js')));
app.use('/img'      ,serveStatic(path.join(__dirname, '/../Web/img')));
app.use('/api'      ,serveStatic(path.join(__dirname, '/../Web/apidoc')));


// *********************************
// ERROR HANDLING
// *********************************
process.on('rejectionHandled', function (e) {
    error('rejectionHandled:', e);
});
process.on('uncaughtException', async function (e) {
    error('uncaughtException:', e);
	if (e.code && e.code == 'PROTOCOL_CONNECTION_LOST') {

		// Reconnect MySQL client.
		commit('Reconnecting MySQL connection.');
		client = mysql.createConnection({
			user              : DEF.MYSQL.ID,
			password          : DEF.MYSQL.PS,
			multipleStatements: false
		});
		info('MySQL connection established.');

		// (DB) Make client use LonelyDuck DB.
		var useDBResult = await t_db.useDatabase_p(DEF.MYSQL.DB_NAME, client);
		if (useDBResult.errorList.length > 0) {
			error('Failed to make client use DB (%s).', DEF.MYSQL.DB_NAME);
			error(useDBResult.errorList);
			process.exit();
		}
		info('Client now using Database (%s).', DEF.MYSQL.DB_NAME);
	}
});
process.on('unhandledRejection', function (e) {
    error('unhandledRejection:', e);
});
process.on('warning', function (e) {
    error('warning:', e);
});



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
 * @apiName    GetProductPurchaseData
 * @apiGroup   GET_DATA
 * @apiVersion 1.0.0
 */
app.get("/purchase/details/:PUR_ID", function (req, res) { GetProductPurchaseData(req, res, client); });








// *********************************
// GET REQUESTS (DBData)
// *********************************
/**
 * @apiDefine GET_DATA_DB Get (DB Row)
 * GET requests for simple search queries in the database.
 */
/**
 * @api {get} /customer/search/:CUS_ID /customer/search/:CUS_ID
 * 
 * @apiDescription Requests information about a customer.
 * 
 * @apiParam {Number} CUS_ID The PK of the customer row.
 * 
 * @apiSuccess {Object} Customer            Object containing customer information.
 * @apiSuccess {Number} Customer.CUS_ID     PK of the customer.
 * @apiSuccess {String} Customer.name       
 * @apiSuccess {String} Customer.email     
 * @apiSuccess {String} Customer.address     
 * @apiSuccess {Number} Customer.income     Remaining income of the customer (in USD). 
 * 
 * @apiExample {curl} Example usage:
 *		GET http://3.23.28.11/customer/search/1 OR
 *		curl -i http://3.23.28.11/customer/search/1
 * 
 * @apiName    GetCustomerSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/customer/search/:CUS_ID", function (req, res) { GetCustomerSearchData(req, res, client); });
/**
 * @api {get} /product/search/:PD_ID /product/search/:PD_ID
 * 
 * @apiDescription Requests information about a product.
 * 
 * @apiParam {Number} PD_ID The PK of the product row.
 * 
 * @apiSuccess {Object} Product             Object containing product information.
 * @apiSuccess {Number} Product.PD_ID       PK of the product.
 * @apiSuccess {String} Product.name       
 * @apiSuccess {String} Product.description     
 * @apiSuccess {Number} Product.price      
 * 
 * @apiName    GetProductSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/product/search/:PD_ID", function (req, res) { GetProductSearchData(req, res, client); });
/**
 * @api {get} /salesperson/search/:SP_ID /salesperson/search/:SP_ID
 * 
 * @apiDescription Requests information about a salesperson.
 * 
 * @apiParam {Number} SP_ID The PK of the salesperson row.
 * 
 * @apiSuccess {Object} SalesPerson             Object containing salesperson information.
 * @apiSuccess {Number} SalesPerson.SP_ID       PK of the salesperson.
 * @apiSuccess {String} SalesPerson.name       
 * @apiSuccess {String} SalesPerson.address     
 * @apiSuccess {String} SalesPerson.email      
 * @apiSuccess {String} SalesPerson.job      
 * 
 * @apiName    GetSalesPersonSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/salesperson/search/:SP_ID", function (req, res) { GetSalesPersonSearchData(req, res, client); });
/**
 * @api {get} /employee/search/:EMP_ID /employee/search/:EMP_ID
 * 
 * @apiDescription Requests information about an employee.
 * 
 * @apiParam {Number} EMP_ID The PK of the employee row.
 * 
 * @apiSuccess {Object} Employee             Object containing employee information.
 * @apiSuccess {Number} Employee.EMP_ID      PK of the employee.
 * @apiSuccess {String} Employee.name       
 * @apiSuccess {String} Employee.address     
 * @apiSuccess {String} Employee.phone      
 * @apiSuccess {String} Employee.email      
 * 
 * @apiName    GetEmployeeSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/employee/search/:EMP_ID", function (req, res) { GetEmployeeSearchData(req, res, client); });
/**
 * @api {get} /comres/search/:COMRES_ID /comres/search/:COMRES_ID
 * 
 * @apiDescription Requests information about a common resolution.
 * 
 * @apiParam {Number} COMRES_ID The PK of the comres row.
 * 
 * @apiSuccess {Object} CommonResolution             Object containing common resolution information.
 * @apiSuccess {Number} CommonResolution.COMRES_ID   PK of the comres row.
 * @apiSuccess {String} CommonResolution.name        Title of the common resolution.
 * @apiSuccess {String} CommonResolution.guide       Text guide of the common resolution.
 * @apiSuccess {Number} CommonResolution.views       Views of the resolution.
 * @apiSuccess {Number} CommonResolution.PD_ID       Foreign key to the product this resolution is about.
 * @apiSuccess {Number|null} CommonResolution.CUS_ID Foreign key to the customer who posted the resolution.     
 * @apiSuccess {Number|null} CommonResolution.EMP_ID Foreign key to the employee who posted the resolution.  
 * 
 * @apiName    GetComresSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/comres/search/:COMRES_ID", function (req, res) { GetComresSearchData(req, res, client); });
/**
 * @api {get} /case/search/:CAS_ID /case/search/:CAS_ID
 * 
 * @apiDescription Requests information about a case.
 * 
 * @apiParam {Number} CAS_ID The PK of the case row.
 * 
 * @apiSuccess {Object} Case                  Object containing case information.
 * @apiSuccess {Number} Case.CAS_ID           PK of the case row.
 * @apiSuccess {String} Case.summary          Summary of the case made by the customer.
 * @apiSuccess {String} Case.description       
 * @apiSuccess {String} Case.opentime         Date and time the case was first posted.
 * @apiSuccess {String|null} Case.closetime   Date and time the case was finally closed.
 * @apiSuccess {String} Case.status           Status of the case
 * @apiSuccess {Number} Case.PUR_ID           Foreign key to the purchase of this case.
 * @apiSuccess {Number|null} Case.EMP_ID      Foreign key to the employee who is assigned to this case.   
 * @apiSuccess {Number|null} Case.COMRES_ID   Foreign key to the common resolution that can solve this case.
 * 
 * @apiName    GetCaseSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/case/search/:CAS_ID", function (req, res) { GetCaseSearchData(req, res, client); });
/**
 * @api {get} /case/comment/search/:CMT_ID /case/comment/search/:CMT_ID
 * 
 * @apiDescription Requests information about a case comment.
 * 
 * @apiParam {Number} CMT_ID The PK of the case comment row.
 * 
 * @apiSuccess {Object}      CaseComment                  Object containing case comment information.
 * @apiSuccess {Number}      CaseComment.CMT_ID           PK of the case comment row.
 * @apiSuccess {String}      CaseComment.ctime            Date and time the comment was posted.
 * @apiSuccess {String}      CaseComment.ctext            Text of the comment.
 * @apiSuccess {Number}      CaseComment.CAS_ID           Foreign key to the case this comment is posted to.
 * @apiSuccess {Number|null} CaseComment.EMP_ID           Foreign key to the employee who posted this comment.  
 * @apiSuccess {Number|null} CaseComment.CUS_ID           Foreign key to the customer who posted this comment.  
 * 
 * @apiName    GetCaseCommentSearchData
 * @apiGroup   GET_DATA_DB
 * @apiVersion 1.0.0
 */
app.get("/case/comment/search/:CMT_ID", function (req, res) { GetCaseCommentSearchData(req, res, client); });






// *********************************
// GET REQUESTS (Misc)
// *********************************
/**
 * @apiDefine GET_MISC Get (Misc)
 * GET requests for any other purpose.
 */
 /**
 * @api {get} /myinfo /myinfo
 * 
 * @apiDescription Retrieves information about the logged in user.<br />
 * User must by logged in as either a customer or an employee to perform this request.
 * 
 * @apiName    GetMyInfo
 * @apiGroup   GET_MISC
 * @apiVersion 1.0.0
 */
app.get("/myinfo", function (req, res) { GetMyInfo(req, res, client); });
/**
 * @api {get} /logout /logout
 * 
 * @apiDescription Performs a customer or employee logout.<br />
 * The login session cookie will be removed and the login session data will be removed from the server.<br />
 * The user will automatically be redirected back to the main page.
 * 
 * @apiName    GetLogout
 * @apiGroup   GET_MISC
 * @apiVersion 1.0.0
 */
app.get("/logout", function (req, res) { GetLogout(req, res, client); });



// *********************************
// POST REQUESTS (DB Direct Query)
// *********************************
/**
 * @apiDefine POST_DB_DIRECT Post (DB Direct Query)
 * POST requests for direct database querying.
 */
 
 /**
 * @api {post} /db/query /db/query
 * 
 * @apiDescription Performs a direct database query against the database.<br />
 * 
 * Depending on the type of query (SELECT, INSERT, DELETE, UPDATE, etc), your response
 * object may or may not have data, but upon query failure, an error message will always
 * be delivered.<br />
 * 
 * You may chain multiple queries using the semicolon (;).<br />
 * 
 * If the results are from joining tables with overlapping column names, the results will 
 * have the format of {table1_fieldA: ..., table2_fieldA: ..., } and so on.
 * 
 * @apiParam {String}  querySQL                            SQL query string.
 * @apiParam {boolean} [keepDuplicateColumnNames = false]  Allow for the query result to 
 *		not collapse duplicate column names from different tables (in case of joining), 
 *		and concat the table name and the column name to uniquly identify each row.
 * 
 * @apiSuccess {Object}   result         Object containing the rows and fields of the query.
 * @apiSuccess {Object[]} result.rows    Array of returned row objects.
 * @apiSuccess {Object}   result.fields  Object containing information about the fields of the query.
 * 
 * @apiError   {Object} result         Object containing error message if login failed.
 * @apiError   {String} result.error   Error message.
 * 
 * @apiName    PostDBQuery
 * @apiGroup   POST_DB_DIRECT
 * @apiVersion 1.0.0
 */
app.post("/db/query", function (req, res) { PostDBQuery(req, res, client); });




// *********************************
// POST REQUESTS (General)
// *********************************
/**
 * @apiDefine POST_GENERAL Post (General)
 * POST requests for general purposes.
 */
/**
 * @api {post} /login /login
 * 
 * @apiDescription Performs a customer or employee login.<br />
 * Once a user logs in as either a customer or an employee, a login session cookie
 * will be saved and session data will be managed by the server until logout or session expire.<br />
 * The session cookie allows for the user to perform login-specific actions without requiring authentication every time.<br />
 * Note that after a successful login, it will not automatically redirect tha page.
 * 
 * @apiParam {String} loginType     Either "customer" or "employee".
 * @apiParam {String} loginEmail    Email of the customer or employee.
 * @apiParam {String} loginPassword Password of the customer or employee.
 * 
 * @apiSuccess {Object} result    Empty object if login was successful.
 * @apiError   {Object} result    Object containing error message if login failed.
 * @apiError   {String} result.error   Error message.
 * 
 * @apiName    PostLogin
 * @apiGroup   POST_GENERAL
 * @apiVersion 1.0.0
 */
app.post("/login", function (req, res) { PostLogin(req, res, client); });

/**
 * @api {post} /product/purchase /product/purchase
 * 
 * @apiDescription A customer buys a product.<br />
 * User must be logged in as a customer and have enough remaining income to succesfully 
 * purchase the product.<br />
 * Upon successful purchase, a random salesperson will be selected for the person
 * who sold the item to the customer.
 * 
 * @apiParam {Number} productID   The PK of the product the customer is purchasing.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostProductPurchase
 * @apiGroup   POST_GENERAL
 * @apiVersion 1.0.0
 */
app.post("/product/purchase", function (req, res) { PostProductPurchase(req, res, client); });

/**
 * @api {post} /case/submit /case/submit
 * 
 * @apiParam {Number} purchaseID 
 * @apiParam {String} summary
 * @apiParam {String} description
 * 
 * @apiName    PostCaseSubmit
 * @apiGroup   POST_GENERAL
 * @apiVersion 1.0.0
 */
app.post("/case/submit", function (req, res) { PostCaseSubmit(req, res, client); });

/**
 * @api {post} /case/comment/submit /case/comment/submit
 * 
 * @apiDescription A customer or employee posts a comment about a case.<br />
 * User must be logged in as either a customer or an employee in order to post a case comment.
 * 
 * @apiParam {Number} caseID      The PK of the case the comment is about.
 * @apiParam {String} commentText The content of the comment.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostCaseCommentSubmit
 * @apiGroup   POST_GENERAL
 * @apiVersion 1.0.0
 */
app.post("/case/comment/submit", function (req, res) { PostCaseCommentSubmit(req, res, client); });

/**
 * @api {post} /product/comres/submit /product/comres/submit
 * 
 * @apiDescription A customer or employee posts a common resolution about a product.<br />
 * User must be logged in as either a customer or an employee in order to submit a common resolution.
 * 
 * @apiParam {Number} productID   The PK of the product the resolution is about.
 * @apiParam {String} name        The title of the common resolution.
 * @apiParam {String} guide       The text content of this resolution.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostProductComresSubmit
 * @apiGroup   POST_GENERAL
 * @apiVersion 1.0.0
 */
app.post("/product/comres/submit", function (req, res) { PostProductComresSubmit(req, res, client); });




// *********************************
// POST REQUESTS (Search)
// *********************************
/**
 * @apiDefine POST_SEARCH Post (Search)
 * POST requests for employee search purposes.
 */
/**
 * @api {post} /employee/search/case /employee/search/case
 * 
 * @apiDescription An employee searches for a case.<br />
 * User must be logged in as an employee in order to perform this request.
 * 
 * @apiParam {String} searchType  Either "status" or "timeframe".
 * @apiParam {String} searchTerm  The search keyword to search for cases based on the given search type.
 * @apiExample {json} Request Example1
 * {
 *	'searchType': 'status',
 *	'searchTerm': 'SOLVED'
 * } 
 *@apiExample {json} Request Example2
 * {
 *	'searchType': 'timeframe',
 *	'searchTerm': '2020-04-22'
 * }
 * 
 * @apiSuccess {Object[]} ResultList  Array of cases matching the search.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostEmployeeSearchCase
 * @apiGroup   POST_SEARCH
 * @apiVersion 1.0.0
 */
app.post("/employee/search/case", function (req, res) { PostEmployeeSearchCase(req, res, client); });
/**
 * @api {post} /employee/search/customer /employee/search/customer
 * 
 * @apiDescription An employee searches for a customer.<br />
 * User must be logged in as an employee in order to perform this request.
 * 
 * @apiParam {String} searchType  Either "name" or "email".
 * @apiParam {String} searchTerm  The search keyword to search for cases based on the given search type.
 * @apiExample {json} Request Example1
 * {
 *	'searchType': 'name',
 *	'searchTerm': 'John'
 * } 
 * @apiExample {json} Request Example2
 * {
 *	'searchType': 'email',
 *	'searchTerm': 'guy@gmail.com'
 * }
 * 
 * @apiSuccess {Object[]} ResultList  Array of customers matching the search.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostEmployeeSearchCustomer
 * @apiGroup   POST_SEARCH
 * @apiVersion 1.0.0
 */
app.post("/employee/search/customer", function (req, res) { PostEmployeeSearchCustomer(req, res, client); });
/**
 * @api {post} /employee/search/comres /employee/search/comres
 * 
 * @apiDescription An employee searches for common resolutions by the product.<br />
 * User must be logged in as an employee in order to perform this request.
 * 
 * @apiParam {String} searchType  Either "productID" or "productName".
 * @apiParam {String} searchTerm  The search keyword to search for cases based on the given search type.
 * @apiExample {json} Request Example1
 * {
 *	'searchType': 'productID',
 *	'searchTerm': '42'
 * } 
 * @apiExample {json} Request Example2
 * {
 *	'searchType': 'productName',
 *	'searchTerm': 'iPhone11'
 * }
 * 
 * @apiSuccess {Object[]} ResultList  Array of common resolutions for the product matching the search.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostEmployeeSearchComres
 * @apiGroup   POST_SEARCH
 * @apiVersion 1.0.0
 */
app.post("/employee/search/comres", function (req, res) { PostEmployeeSearchComres(req, res, client); });




// *********************************
// POST REQUESTS (Aggregation)
// *********************************
/**
 * @apiDefine POST_AGG Post (Aggregation)
 * POST requests for employee aggregation search purposes.
 */
/**
 * @api {post} /employee/agg/cases /employee/agg/cases
 * 
 * @apiDescription An employee searches for the aggregated results of the cases.<br />
 * User must be logged in as an employee in order to perform this request.<br />
 * Aggregation results will be returned sorted by largest of whatever the standard is.
 * 
 * @apiParam {String} aggType  The type of aggregation to query the cases with.
 * 
 * @apiExample {json} Request Example1
 * { 'aggType': 'product' }
 * @apiExample {json} Request Example2
 * { 'aggType': 'closed' }
 * @apiExample {json} Request Example3
 * { 'aggType': 'customer' }
 * @apiExample {json} Request Example4
 * { 'aggType': 'customer_company' }
 * 
 * @apiSuccess {Object[]} ResultList  Array of aggregation result rows sorted by largest.
 * 
 * @apiError {String} error   Error message.
 * 
 * @apiName    PostEmployeeAggCases
 * @apiGroup   POST_AGG
 * @apiVersion 1.0.0
 */
app.post("/employee/agg/cases", function (req, res) { PostEmployeeAggCases(req, res, client); });

