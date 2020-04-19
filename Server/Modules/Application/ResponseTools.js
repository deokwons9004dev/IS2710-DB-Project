 /**
  * @file Response Tools
  * @module Application/ResponseTools
  *
  * @author Deokwon Song <deokwons9004dev@gmail.com>
  * @version 1.0.0
  *
  */


// *********************************
// IMPORT NPM MODULES
// *********************************
var colors = require("colors");


/**
 * Send a raw response. Data stringified.
 *
 * @param {Object}        response : HTTP Response Object.
 * @param {Object|String} data     : Data that you want to send in the response.
 */
exports.sendResponse = function(response, data) {
      response.writeHead(200, {"Content-Type": "text/html"} );
      response.end(JSON.stringify(data));
}

/**
 * Send a response that supports a result, cause field.
 *
 * @param {Object} response     : HTTP Response Object.
 * @param {String} result       : Result Name. (Usually 'fail' or 'success')
 * @param {String} cause        : Basic Cause Of Output. (Usually for fail responses)
 */
exports.sendResponseSimple = function(response, result, cause){
	response.writeHead(200,{"Content-Type": "text/html"});
	response.end(JSON.stringify({
		result     : result,
		cause      : cause
	}));
}

/**
 * Send a response that supports a result, data field.
 *
 * @param {Object} response     : HTTP Response Object.
 * @param {String} result       : Result Name. (Usually 'fail' or 'success')
 * @param {String} data         : Data that you want to send in the response.
 */
exports.sendResponseSimpleWithData = function(response, result, data){
      response.writeHead(200,{"Content-Type": "text/html"});
      response.end(JSON.stringify({
            result: result,
            data  : data
      }));
}
