var log = console.log;

/*
 * ===========================
 * BUTTON CLICKS
 * ===========================
 */
$(document).ready(function () {

});

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


    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'select PUR.PUR_ID, PD.name as PD_name, PUR.purchase_date, PD.price, SP.name as SoldBy, SP.email SPemail, SP.address as SPaddress from Purchases PUR inner join Products PD on PD.PD_ID = PUR.PD_ID inner join SalesPersons SP on SP.SP_ID = PUR.SP_ID where PUR.CUS_ID = ' + idata.CUS_ID,
            keepDuplicateColumnNames: false
        })
    };
    
    var postRes  = await fetch('/db/query', postOpt);
    var resObj   = await postRes.json();
    log(resObj);

    /**
     * Use my information to populate the purchase info table.
     */
    for (var i = 0; i < resObj.rows.length; i++) {
        var purRow = resObj.rows[i];
        
        var rowHTML             = $('<tr></tr>').data('PUR_ID', purRow.PUR_ID);
        
        var rowPURInfo          = $('<td>' + purRow.PD_name +'</td>');
        var rowPURDate          = $('<td>' + purRow.purchase_date +'</td>');
        var rowPurTotal = $('<td>' + purRow.price + '</td>');
        var rowSoldByHTML        = $('<td>' + purRow.SoldBy + '</td>');
    
    
        rowHTML
            .append(rowPURInfo)
            .append(rowPURDate)
            .append(rowPurTotal)
            .append(rowSoldByHTML)
        $('#my_purchase > table').append(rowHTML);
    
        var rowHTML2             = $('<tr></tr>').data('PUR_ID', purRow.PUR_ID);
        var rowSoldBy        = $('<td>' + purRow.SoldBy + '</td>');
        var rowSPemail          = $('<td>' + purRow.SPemail +'</td>');
        var rowSPaddress          = $('<td>' + purRow.SPaddress +'</td>');
    
        rowHTML2
            .append(rowSoldBy)
            .append(rowSPemail)
            .append(rowSPaddress)
        $('#sales_team_info > table').append(rowHTML2);
    
    }

    
}