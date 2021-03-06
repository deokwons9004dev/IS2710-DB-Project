/**
 * Server Settings
 * @module Modules/ServerSettings
 *
 * This file contains various settings and private data for the server.
 *
 * Author : David Song (deokwons9004dev@gmail.com)
 */


/* Import Native Modules */
var path = require("path");

// ---------------------------------
// Server Version
// ---------------------------------
exports.appMode = 'DEV'; // DEV, BETA, RELEASE

// ---------------------------------
// Account Configuration
// ---------------------------------
exports.ACCOUNT = {
    saltRounds: 12
}


// ---------------------------------
// Server Cookie Configuration
// ---------------------------------
exports.COOKIE = {
    signKeys: [
        'b2056c99-37bc-4da3-9761-64c3523dbb71',
        '49229e01-79ad-4813-a090-e68ff4d911d2',
        '0fc165f6-c198-417e-8762-a03130652d5c',
        '939864a2-1343-49ac-a00c-3a73ed7c32b1'
    ]
}

// ---------------------------------
// Server MySQL Configuration
// ---------------------------------
exports.MYSQL = {
    ID     : 'dbuser',
    PS     : 'russ',
    DB_NAME: 'IS2710DB'
}

// ---------------------------------
// Server Path Configuration
// ---------------------------------
exports.PATH = {
    DB: {
        SQL: path.join(__dirname, '/../Database/database.sql')
    },
    PAGES: {
        API                  : path.join(__dirname, '/../../../Web/apidoc/index.html'),
        INDEX                : path.join(__dirname, '/../../../Web/Index.html'),
        LOGIN                : path.join(__dirname, '/../../../Web/Login.html'),
        CUSTOMER_MAIN        : path.join(__dirname, '/../../../Web/CustomerMain.html'),
        EMPLOYEE_MAIN        : path.join(__dirname, '/../../../Web/EmployeeMain.html'),
        
        // CUSTOMER_MYORDERS    : path.join(__dirname, '/../../../Web/CustomerMyOrders.html'),
        // CUSTOMER_CASE_CREATE : path.join(__dirname, '/../../../Web/CustomerCaseCreate.html'),
        // CUSTOMER_CASE        : path.join(__dirname, '/../../../Web/CustomerCase.html'),
        // PRODUCT              : path.join(__dirname, '/../../../Web/Product.html'),
        // 
        // REGISTER             : path.join(__dirname, '/../../../Web/Register.html'),
    },
    TEMPLATES: {
        CUSTOMER_CASE_DETAILS     : path.join(__dirname, '/../../../Web/CustomerCaseDetailsTP.html'),
        CUSTOMER_CASE_NEW         : path.join(__dirname, '/../../../Web/CustomerCaseNewTP.html'),
        CUSTOMER_PURCHASE_DETAILS : path.join(__dirname, '/../../../Web/CustomerPurchaseDetailsTP.html'),
        PRODUCT_RESOLUTIONS       : path.join(__dirname, '/../../../Web/ProductResolutionsTP.html'),
        PRODUCT_COMRES_NEW        : path.join(__dirname, '/../../../Web/ProductCommonResolutionNewTP.html'),
    }
}


// ---------------------------------
// Background Services
// ---------------------------------
exports.SERVICE = {
    intervals: {
        sessionClean: 1000 * 60 // 1 minute
    }
}



/*
 * ============================
 * Time Settings
 * ============================
 */
exports.sessionDuration = 30; // Days
