var log = console.log;

/*
 * ===========================
 * BUTTON CLICKS
 * ===========================
 */
$(document).ready(function () {
    $('#search_button').click(async function () {
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                searchType: $('#search_selection').val(),
                searchTerm: $('#search_term').val(),
            })
        };
        var postRes = await fetch('/employee/search/case', postOpt);
        var respObj = await postRes.json();
        if (respObj.error) {
            alert('Failed to search cases.');
            return;
        }
        log(respObj);
        
        for (var i = 0; i < respObj.rows.length; i++) {
            var caseRow = respObj.rows[i];
            
            
            var rowHTML             = $('<tr></tr>');
            
            var case_ID            = $('<td></td>').text(caseRow.CAS_ID);
            var case_summary          =$('<td></td>').text(caseRow.summary);
            var case_status        = $('<td></td>').text(caseRow.status);
            var case_opentime = $('<td></td>').text(caseRow.opentime);
            var case_desc      =$('<td></td>').text(caseRow.description);
            var case_closetime            =$('<td></td>').text(caseRow.closetime);
            var case_purID            = $('<td></td>').text(caseRow.PUR_ID);
            var case_empID            = $('<td></td>').text(caseRow.EMP_ID);
            var case_comresID            = $('<td></td>').text(caseRow.COMRES_ID);
    
    
            rowHTML
                .append(case_ID)
                .append(case_summary)
                .append(case_status)
                .append(case_opentime)
                .append(case_desc)
                .append(case_closetime)
                .append(case_purID)
                .append(case_empID)
                .append(case_comresID)
                
            $('#search_cases_box > table').append(rowHTML);
    
        } 
        return;
    });
    
    
    
    $('#agg_button').click(async function () {
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                aggType: $('#agg_selection').val(),
            })
        };
        var postRes = await fetch('/employee/agg/cases', postOpt);
        var respObj = await postRes.json();
        if (respObj.error) {
            alert('Failed to search cases.');
            return;
        }
        log(respObj);
        
        for (var i = 0; i < respObj.rows.length; i++) {
            var caseRow = respObj.rows[i];
            
            
            var rowHTML             = $('<tr></tr>');
            
            var case_ID            = $('<td></td>').text(caseRow.CAS_ID);
            var case_summary          =$('<td></td>').text(caseRow.summary);
            var case_status        = $('<td></td>').text(caseRow.status);
            var case_opentime = $('<td></td>').text(caseRow.opentime);
            var case_desc      =$('<td></td>').text(caseRow.description);
            var case_closetime            =$('<td></td>').text(caseRow.closetime);
            var case_purID            = $('<td></td>').text(caseRow.PUR_ID);
            var case_empID            = $('<td></td>').text(caseRow.EMP_ID);
            var case_comresID            = $('<td></td>').text(caseRow.COMRES_ID);
    
    
            rowHTML
                .append(case_ID)
                .append(case_summary)
                .append(case_status)
                .append(case_opentime)
                .append(case_desc)
                .append(case_closetime)
                .append(case_purID)
                .append(case_empID)
                .append(case_comresID)
                
            $('#search_cases_box > table').append(rowHTML);
    
        } 
        return;
    });
});


async function AssignToEmp(CAS_ID)
{

    var EMP_ID = $('#'+ CAS_ID +'assto').val();
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'update Cases C set C.EMP_ID =' + EMP_ID + ' where C.CAS_ID =' + CAS_ID,
            keepDuplicateColumnNames: false
        })
    };
    
    alert('Assigned to :' + EMP_ID + '. Please refresh');
    
    var postRes  = await fetch('/db/query', postOpt);

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
    log(idata);
    
    
    if (idata.error) {
        alert('You must be logged in first.');
        location.href = '/';
        return;
    }

    // Populate the navbar info.
    $('#account_type_text').text('Employee');
    $('#account_name_text').text(idata.name);
    
    /**
     * Use my information to populate the my info table.
     */
    var myRowHTML        = $('<tr></tr>').data('EMP_ID', idata.CUS_ID);
    var myRowNameHTML    = $('<td></td>').text(idata.name);
    var myRowEmailHTML   = $('<td></td>').text(idata.email);
    var myRowAddressHTML = $('<td></td>').text(idata.address);
    var myRowPhone  = $('<td></td>').text(idata.phone);
 
    myRowHTML
        .append(myRowNameHTML)
        .append(myRowEmailHTML)
        .append(myRowAddressHTML)
        .append(myRowPhone)
    $('#my_info_box > table').append(myRowHTML);
    
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL                : 'select CAS.CAS_ID,CAS.status, CAS.opentime,CAS.closetime,CAS.PUR_ID,EMP.name as AssignedTo, CR.name as CommonRes from Cases CAS left outer join Employee EMP on EMP.EMP_ID = CAS.EMP_ID left outer join CommonResolutions CR on CR.COMRES_ID = CAS.COMRES_ID',
            keepDuplicateColumnNames: false
        })
    };
    var postRes  = await fetch('/db/query', postOpt);
    var resObj   = await postRes.json();
    log(resObj);
    
    for (var i = 0; i < resObj.rows.length; i++) {
        var purRow = resObj.rows[i];
        
        /**
         * We use each returned purchase row to populate the "Cases" table.
         */
        
        var rowHTML             = $('<tr></tr>').data('CAS_ID', purRow.CAS_ID);
        
        var rowIDHTML            = $('<td>' + purRow.CAS_ID + '</td>');
        var rowStatus          = $('<td>' + purRow.status + '</td>');
        var rowOpen        = $('<td>' + purRow.opentime + '</td>');
        var rowClose = $('<td>' + purRow.closetime +  '</td>');
        var rowPurchase = $('<td>' + purRow.PUR_ID + '</td>');
        var rowEmp            = $('<td>' + purRow.AssignedTo + '</td>');
        var rowCR            = $('<td>' + purRow.CommonRes + '</td>');


        rowHTML
            .append(rowIDHTML)
            .append(rowStatus)
            .append(rowOpen)
            .append(rowClose)
            .append(rowPurchase)
            .append(rowEmp)
            .append(rowCR)
            
        $('#cases_box > table').append(rowHTML);
        
        var rowHTMLun  = $('<tr></tr>').data('CAS_ID', purRow.CAS_ID);
        var rowAssto = '<td><input type="text" id="'+ purRow.CAS_ID +'assto" name="fname"><input type="submit" onclick="AssignToEmp(' + purRow.CAS_ID + ')" value="Assign"></td>';
        var rowIDHTMLun = $('<td>' + purRow.CAS_ID + '</td>');
        var rowOpen2        = $('<td>' + purRow.opentime + '</td>');
        var rowCR2            = $('<td>' + purRow.CommonRes + '</td>');
        
        if(purRow.AssignedTo == null)
        {
            rowHTMLun
                .append(rowIDHTMLun)
                .append(rowOpen2)
                .append(rowAssto)
                .append(rowCR2)
    
            $('#un_cases_box > table').append(rowHTMLun);
        }
        
    }    
}