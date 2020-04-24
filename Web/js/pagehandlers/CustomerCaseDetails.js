var log = console.log;

/*
 * ===========================
 * BUTTON CLICKS
 * ===========================
 */
$(document).ready(function () {
    $('#comment_submit_button').click(async function () {
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                caseID     : Number(getCookie('temp_CAS_ID')),
                commentText: $('#comment_textarea').val(),
            })
        };
        var postRes = await fetch('/case/comment/submit', postOpt);
        var respObj = await postRes.json();
        if (respObj.error) {
            alert('Failed to submit new case comment.');
            return;
        }
        alert('Submitted new case comment!');
        location.reload(true);
        // deleteCookie('temp_PUR_ID');
        // location.href = '/customer';
        return;
    });
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
    // if (idata.CUS_ID == undefined) {
    //     alert('you are logged in as an employee. Redirecting you.');
    //     location.href = '/employee';
    //     return;
    // }
    
    
    // // Populate the navbar info.
    // $('#account_type_text').text('Customer');
    // $('#account_name_text').text(idata.name);

    // Retrieve the product info using the temp cookie.
    var caseID = getCookie('temp_CAS_ID');
    if (caseID == null) {
        alert('No case to see.');
        location.href = '/customer';
        return;
    }

    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL: 'SELECT * from Cases WHERE CAS_ID = ' + caseID,
            keepDuplicateColumnNames: false
        })
    };
    var postRes  = await fetch('/db/query', postOpt);
    var caseObj  = await postRes.json();
    log(caseObj);
    
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL: 'SELECT * from Employee WHERE EMP_ID = ' + caseObj.rows[0].EMP_ID,
            keepDuplicateColumnNames: false
        })
    };
    var postRes      = await fetch('/db/query', postOpt);
    var empObj  = await postRes.json();
    log(empObj);
    
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL: 'SELECT * from Purchases WHERE PUR_ID = ' + caseObj.rows[0].PUR_ID,
            keepDuplicateColumnNames: false
        })
    };
    var postRes      = await fetch('/db/query', postOpt);
    var purchaseObj  = await postRes.json();
    log(purchaseObj);
    
    
    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL: 'SELECT * from Products WHERE PD_ID = ' + purchaseObj.rows[0].PD_ID,
            keepDuplicateColumnNames: false
        })
    };
    var postRes      = await fetch('/db/query', postOpt);
    var prodObj  = await postRes.json();
    log(prodObj);


    var postOpt = {
        method : 'post',
        headers: { 'content-type': 'application/json' },
        body   : JSON.stringify({
            querySQL: 'SELECT * from CaseComments WHERE CAS_ID = ' + caseObj.rows[0].CAS_ID,
            keepDuplicateColumnNames: false
        })
    };
    var postRes      = await fetch('/db/query', postOpt);
    var commentObj  = await postRes.json();
    log(commentObj);

    $('#status_case_id').text(caseObj.rows[0].CAS_ID);
    $('#status_purchase_id').text(purchaseObj.rows[0].PUR_ID);
    $('#status_case_opentime').text(getMomentStringFromMySQLDTString(caseObj.rows[0].opentime) );
    $('#status_case_status').text(caseObj.rows[0].status);
    $('#status_case_closetime').text(caseObj.rows[0].closetime);
    $('#status_emp_name').text(empObj.rows[0].name);

    
    $('#details_product_name').text(prodObj.rows[0].name);
    $('#case_summary').text(caseObj.rows[0].summary);
    $('#case_description').text(caseObj.rows[0].description);
    
    

    for (var i = 0; i < commentObj.rows.length; i++) {
        var commentRow = commentObj.rows[i];
        
        var rowHTML             = $('<div class="chat-bubble"></div>');

        var rowCommentPersonName      = $('<p></p>');
        var rowCommentPersonType      = $('<p></p>');
        var rowCommentTime      = $('<p></p>').text(commentRow.ctime);
        var rowComment          = $('<p></p>').text(commentRow.ctext);
        
        if (commentRow.EMP_ID != null) {
            var postOpt = {
                method : 'post',
                headers: { 'content-type': 'application/json' },
                body   : JSON.stringify({
                    querySQL: 'SELECT * from Employee WHERE EMP_ID = ' + commentRow.EMP_ID,
                    keepDuplicateColumnNames: false
                })
            };
            var postRes      = await fetch('/db/query', postOpt);
            var empObj  = await postRes.json();
            log(empObj);
            rowCommentPersonName.text(empObj.rows[0].name);
            rowCommentPersonType.text('Employee');
        }
        else {
            var postOpt = {
                method : 'post',
                headers: { 'content-type': 'application/json' },
                body   : JSON.stringify({
                    querySQL: 'SELECT * from Customers WHERE CUS_ID = ' + commentRow.CUS_ID,
                    keepDuplicateColumnNames: false
                })
            };
            var postRes      = await fetch('/db/query', postOpt);
            var cusObj  = await postRes.json();
            log(cusObj);
            rowCommentPersonName.text(cusObj.rows[0].name);
            rowCommentPersonType.text('Customer');
        }
        
        rowHTML
            .append(rowCommentPersonName)
            .append(rowCommentPersonType)
            .append(rowCommentTime)
            .append(rowComment)
            
        $('#case_chat_box > #view_box').append(rowHTML);
    }

    
}