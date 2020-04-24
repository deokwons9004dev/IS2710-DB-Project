/**
 * @file Page handlers for CustomerCaseNewTP.html
 * @module Web/js/pagehandlers/CustomerCaseNew.js
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
    
    $('#case_create_button').click(async function () {
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                purchaseID: Number(getCookie('temp_PUR_ID')),
                summary: $('#case_summary_input').val(),
                description: $('#case_desc_textarea').val()
            })
        };
        var postRes = await fetch('/case/submit', postOpt);
        var respObj = await postRes.json();
        if (respObj.error) {
            alert('Failed to submit new case.');
            return;
        }
        alert('Submitted new case!');
        deleteCookie('temp_PUR_ID');
        location.href = '/customer';
        return;
    });
    
    $('#cancel_button').click(function () {
        deleteCookie('temp_PUR_ID');
        location.href = '/customer';
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
    if (idata.CUS_ID == undefined) {
        alert('you are logged in as an employee. Redirecting you.');
        location.href = '/employee';
        return;
    }
    
    $('#customer_name_input').val(idata.name);
    
    // Retrieve the product info using the temp cookie.
    var purchaseID = getCookie('temp_PUR_ID');
    if (purchaseID == null) {
        alert('No purchase to open a case.');
        location.href = '/customer';
        return;
    }
    var purchaseGetOpt = {
        method : 'get',
        headers: { 'content-type': 'application/json' },
    };
    var purchaseGetRes  = await fetch('/purchase/details/' + purchaseID, purchaseGetOpt);
    var purchaseDetails = await purchaseGetRes.json();
    
    $('#product_name_input').val(purchaseDetails.ProductName);
}
