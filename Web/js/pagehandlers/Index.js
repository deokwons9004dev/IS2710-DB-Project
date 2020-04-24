/**
 * @file Page handlers for CustomerMain.html
 * @module Web/js/pagehandlers/Index.js
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
 * 'BUY' link button click.
 */
async function productBuyButtonClick (htmlElem) {
    alert('Log in to buy this product!');
    location.href = '/login';
    return;
}
/**
 * 'SEE RESOLUTIONS' link button click.
 */
function productComresButtonClick (htmlElem) {
    var jqElem = $(htmlElem);
    setCookie('temp_PD_ID', jqElem.parentsUntil('tr').parent().data('PD_ID'));
    location.href = '/product/resolutions';
    return;
}


/*
 * ===========================
 * ONLOAD ROUTINES
 * ===========================
 */
$(document).ready(function () { onloadRoutines_p(); });

async function onloadRoutines_p () {

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
