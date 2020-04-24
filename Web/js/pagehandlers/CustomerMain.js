/**
 * @file Page handlers for CustomerMain.html
 * @module Web/js/pagehandlers/CustomerMain.js
 *
 * @author Deokwon Song <deokwons9004dev@gmail.com>
 * @version 1.0.0
 */
var log = console.log;

/*
 * ===========================
 * BUTTON CLICKS
 * ===========================
 */
$(document).ready(function () {

});

/**
 * 'SEE PURCHASE DETAILS' link button click.
 * 
 * We set the temp cookie 'temp_PUR_ID' from the parent row element holding it,
 * and once we move to the purchase details template page, we query data using the
 * cookie data and populate the page.
 * 
 * Make sure to remove the cookie once used.
 * 
 * More info in js/tools/CookieTools.js
 */
function purchaseDetailButtonClick (htmlElem) {
    log(htmlElem);
    
    var jqElem = $(htmlElem);
    log(jqElem);
    // log(jqElem.parent());
    // log(jqElem.parent().parent());
    // log(jqElem.parent().parent().data('PUR_ID'));
    // log(jqElem.parents());
    // log(jqElem.parentsUntil('tr').parent());
    log(jqElem.parentsUntil('tr').parent().data('PUR_ID'));
    
    setCookie('temp_PUR_ID', jqElem.parentsUntil('tr').parent().data('PUR_ID'));
    location.href = '/customer/purchase/details';
}
/**
 * 'OPEN NEW CASE' link button click.
 */
function purchaseNewCaseButtonClick (htmlElem) {
    log(htmlElem);
    
    var jqElem = $(htmlElem);
    log(jqElem);
    log(jqElem.parentsUntil('tr').parent().data('PUR_ID'));
    
    setCookie('temp_PUR_ID', jqElem.parentsUntil('tr').parent().data('PUR_ID'));
    location.href = '/customer/case/new';
}
/**
 * 'SEE CASE DETAILS' link button click.
 */
function caseDetailsButtonClick (htmlElem) {
    var jqElem = $(htmlElem);
    setCookie('temp_CAS_ID', jqElem.parentsUntil('tr').parent().data('CAS_ID'));
    location.href = '/customer/case/details';
}
/**
 * 'BUY' link button click.
 */
async function productBuyButtonClick (htmlElem) {
    var jqElem    = $(htmlElem);
    var productID = jqElem.parentsUntil('tr').parent().data('PD_ID')
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            productID: productID
        })
    };
    var postRes = await fetch('/product/purchase', postOpt);
    var respObj = await postRes.json();
    log(respObj);
    if (respObj.error) {
        alert('Failed to purchase product.');
        return;
    }
    location.reload(true);
}
/**
 * 'SEE RESOLUTIONS' link button click.
 */
function productComresButtonClick (htmlElem) {
    var jqElem = $(htmlElem);
    setCookie('temp_PD_ID', jqElem.parentsUntil('tr').parent().data('PD_ID'));
    location.href = '/product/resolutions';
}


/*
 * ===========================
 * ONLOAD ROUTINES
 * ===========================
 */
$(document).ready(function () { onloadRoutines_p(); });

async function onloadRoutines_p () {
    // Retrieve my logged in info first.
    var infoGetOpt = {
        method : 'get',
        headers: { 'content-type': 'application/json' },
    };
    var infoGetRes  = await fetch('/myinfo', infoGetOpt);
    var idata       = await infoGetRes.json();
    log(idata);
    
    if (idata.error) {
        alert('You must be logged in first.');
        location.href = '/';
        return;
    }
    if (idata.CUS_ID == undefined) {
        alert('you are logged in as an employee. Redirecting you.');
        location.href = '/employee';
        return;
    }
    
    
    // Populate the navbar info.
    $('#account_type_text').text('Customer');
    $('#account_name_text').text(idata.name);
    
    
    /**
     * Use my information to populate the my info table.
     */
    var myRowHTML        = $('<tr></tr>').data('CUS_ID', idata.CUS_ID);
    var myRowNameHTML    = $('<td></td>').text(idata.name);
    var myRowEmailHTML   = $('<td></td>').text(idata.email);
    var myRowAddressHTML = $('<td></td>').text(idata.address);
    var myRowIncomeHTML  = $('<td></td>').text('$' + idata.income);
    var myRowCompanyHTML = $('<td></td>').text(idata.company);
    myRowHTML
        .append(myRowNameHTML)
        .append(myRowEmailHTML)
        .append(myRowAddressHTML)
        .append(myRowIncomeHTML)
        .append(myRowCompanyHTML)
    $('#my_info_box > table').append(myRowHTML);
    
    /**
     * Use my information to get all my purchases & cases.
     * NOTE: Since all cases have a non-null PUR_ID tied to it, I can also use this
     *       code to gather all my cases too.
     */
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'SELECT * FROM Purchases WHERE CUS_ID = ' + idata.CUS_ID,
            keepDuplicateColumnNames: false
        })
    };
    var postRes  = await fetch('/db/query', postOpt);
    var resObj   = await postRes.json();
    log(resObj);
    
    for (var i = 0; i < resObj.rows.length; i++) {
        var purRow = resObj.rows[i];
        
        /**
         * First we use each returned purchase row to populate the "My Purchases" table.
         */
        
        var rowHTML             = $('<tr></tr>').data('PUR_ID', purRow.PUR_ID);
        
        var rowIDHTML            = $('<td>' + purRow.PUR_ID + '</td>');
        var rowItemHTML          = $('<td></td>');
        var rowSoldByHTML        = $('<td></td>');
        var rowDetailsButtonHTML = $('<td> <a href="#" onClick=purchaseDetailButtonClick(this)>SEE PURCHASE DETAILS</a> </td>');
        var rowNewCaseButtonHTML = $('<td> <a href="#" onClick=purchaseNewCaseButtonClick(this)>OPEN NEW CASE</a> </td>');
        
        // Get product from FK.
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                querySQL                : 'SELECT * FROM Products WHERE PD_ID = ' + purRow.PD_ID,
                keepDuplicateColumnNames: false
            })
        };
        var postRes               = await fetch('/db/query', postOpt);
        var singleProductQueryObj = await postRes.json();
        log('product:', singleProductQueryObj);
        
        var productRow = singleProductQueryObj.rows[0]
        rowItemHTML.text(productRow.name);
        
        // Get salesperson from FK.
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                querySQL                : 'SELECT * FROM SalesPersons WHERE SP_ID = ' + purRow.SP_ID,
                keepDuplicateColumnNames: false
            })
        };
        var postRes                   = await fetch('/db/query', postOpt);
        var singleSalesPersonQueryObj = await postRes.json();
        log('salesperson:', singleSalesPersonQueryObj);
        
        var salesPersonRow = singleSalesPersonQueryObj.rows[0]
        rowSoldByHTML.text(salesPersonRow.name);
        
        rowHTML
            .append(rowIDHTML)
            .append(rowItemHTML)
            .append(rowSoldByHTML)
            .append(rowDetailsButtonHTML)
            .append(rowNewCaseButtonHTML)
            
        $('#my_purchases_box > table').append(rowHTML);
        
        
        /**
         * Then in the same code block, we can check to see if there's also a 
         * case tied to this purchase. If so, we also populate the "My Cases" table too.
         */
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                querySQL                : 'SELECT * FROM Cases WHERE PUR_ID = ' + purRow.PUR_ID,
                keepDuplicateColumnNames: false
            })
        };
        var postRes      = await fetch('/db/query', postOpt);
        var caseQueryObj = await postRes.json();
        log('cases:', caseQueryObj);
        
        for (var j = 0; j < caseQueryObj.rows.length; j++) {
            var caseRow = caseQueryObj.rows[j];
            
            var caseRowHTML             = $('<tr></tr>').data('CAS_ID', caseRow.CAS_ID);
        
            var caseRowIDHTML            = $('<td>' + caseRow.CAS_ID + '</td>');
            var caseRowItemHTML          = $('<td></td>').text(productRow.name);
            var caseRowOpenTimeHTML      = $('<td></td>').text(getMomentStringFromMySQLDTString(caseRow.opentime));
            var caseRowStatusHTML        = $('<td></td>').text(caseRow.status);
            var caseRowDetailsButtonHTML = $('<td> <a href="#" onClick=caseDetailsButtonClick(this)>SEE CASE DETAILS</a> </td>');
            
            caseRowHTML
                .append(caseRowIDHTML)
                .append(caseRowItemHTML)
                .append(caseRowOpenTimeHTML)
                .append(caseRowStatusHTML)
                .append(caseRowDetailsButtonHTML)

            $('#my_cases_box > table').append(caseRowHTML);
        }
    }

    
    
    
    // Query all available products from the server.
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'SELECT * FROM Products;',
            keepDuplicateColumnNames: false
        })
    };
    var postRes  = await fetch('/db/query', postOpt);
    var resObj   = await postRes.json();
    log(resObj);
    
    /** 
     * Populate the returned query rows into rows in the HTML table.
     * NOTE: jQuery must be initialized before you can do this.
     * 
     * First, create a blank table row <tr> HTML (DOM object), and use the jquery.data() 
     *        method to imbed the product's PD_ID to it. You will need the PD_ID of
     *        the row to do the BUY and SEE RESOLUTION actions.
     * 
     * Second, create each table cell <td> with the appropriate value in order 
     *         of how the table header was defined,
     * 
     * Third, append all the table cells to the blank table row in order.
     * 
     * Finally, append the completed table row to the table that you want to append to.
     */
    for (var i = 0; i < resObj.rows.length; i++) {
        var row = resObj.rows[i];
        
        var rowHTML             = $('<tr></tr>').data('PD_ID', row.PD_ID);
        
        var rowNameHTML         = $('<td>' + row.name + '</td>');
        var rowDescriptionHTML  = $('<td>' + row.description + '</td>');
        var rowpriceHTML        = $('<td>$' + row.price + '</td>');
        var rowBuyButtonHTML    = $('<td> <a href="#"  onClick=productBuyButtonClick(this)>BUY</a> </td>');
        var rowCOMRESButtonHTML = $('<td> <a href="#"  onClick=productComresButtonClick(this)>SEE RESOLUTIONS</a> </td>');
        
        rowHTML
            .append(rowNameHTML)
            .append(rowDescriptionHTML)
            .append(rowpriceHTML)
            .append(rowBuyButtonHTML)
            .append(rowCOMRESButtonHTML)
            
        $('#products_box > table').append(rowHTML);
    }
}
