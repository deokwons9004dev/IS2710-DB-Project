var log = console.log;

/*
 * ===========================
 * BUTTON CLICKS
 * ===========================
 */
// $(document).ready(function () {

// });


async function GetCommonResolutions()
{
    var PD_ID = $('#proddropdown>option:selected').val();
    log(PD_ID)
    
    $("#res_box").find("tr:not(:first)").remove();
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'select CR.COMRES_ID , CR.name,CR.guide  from CommonResolutions CR where CR.PD_ID =' + PD_ID,
            keepDuplicateColumnNames: false
        })
    };
    
    var postRes  = await fetch('/db/query', postOpt);
    var resObj   = await postRes.json();
    log(resObj);
    
    for (var i = 0; i < resObj.rows.length; i++) {
        
        var purRow = resObj.rows[i];
        
        var rowHTML             = $('<tr></tr>').data('PD_ID', purRow.COMRES_ID);
        
        var rowIDHTML            = $('<td>' + purRow.COMRES_ID + '</td>');
        var rowName          = $('<td>' + purRow.name + '</td>');
        var rowDesc        = $('<td>' + purRow.guide + '</td>');
        

        rowHTML
            .append(rowIDHTML)
            .append(rowName)
            .append(rowDesc)
        
        $('#res_box > table').append(rowHTML);
    }
}


$(document).ready(function () { onloadRoutines_p(); });

async function onloadRoutines_p () {
    // Retrieve my logged in info first.
    var infoGetOpt = {
        method : 'get',
        headers: { 'content-type': 'application/json' },
    };
    var infoGetRes  = await fetch('/myinfo', infoGetOpt);
    var idata       = await infoGetRes.json();
    console.log(idata);
    
    
    if (idata.error) {
        alert('You must be logged in first.');
        location.href = '/';
        return;
    }

    // Populate the navbar info.
    $('#account_type_text').text('Employee');
    $('#account_name_text').text(idata.name);
    
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'select * from Products',
            keepDuplicateColumnNames: false
        })
    };
    var postRes  = await fetch('/db/query', postOpt);
    var resObj   = await postRes.json();
    log(resObj);
    
    var dropdown = $("#proddropdown");
    for (var i = 0; i < resObj.rows.length; i++) {
        
        var purRow = resObj.rows[i];
        
        var rowHTML             = $('<tr></tr>').data('PD_ID', purRow.PD_ID);
        
        var rowIDHTML            = $('<td>' + purRow.PD_ID + '</td>');
        var rowName          = $('<td>' + purRow.name + '</td>');
        var rowDesc        = $('<td>' + purRow.description + '</td>');
        var rowPrice = $('<td>' + purRow.price +  '</td>');


        rowHTML
            .append(rowIDHTML)
            .append(rowName)
            .append(rowDesc)
            .append(rowPrice)

        $('#product_box > table').append(rowHTML);
        
        
        
        
        dropdown.append($("<option />").val(purRow.PD_ID).text(purRow.name));
    }
    
}