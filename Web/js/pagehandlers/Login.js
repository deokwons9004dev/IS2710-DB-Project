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
    $('#loginButton').click(async function () {
        // log('login button clicked!');
        
        var loginEmail    = $('#loginEmailInput').val();
        var loginPassword = $('#loginPasswordInput').val();
        var loginType     = ($('#employeeLoginCheckbox').is(':checked') == true) ? 'employee' : 'customer';
        
        log(loginEmail);
        log(loginPassword);
        log(loginType);
        
        // Login POST request.
        var postOpt = {
            method : 'post',
            headers: { 'content-type': 'application/json' },
            body   : JSON.stringify({
                loginEmail      : loginEmail,
                loginPassword   : loginPassword,
                loginType       : loginType,
            })
        };
        var postRes  = await fetch('/login', postOpt);
        var resObj   = await postRes.json();
        log(resObj);
        
        if (resObj.error) {
            alert('Failed to login. Please try again.');
            return;
        }
        else if (loginType == 'customer') {
            location.href = '/customer';
            return;
        }
        else {
            location.href = '/employee';
            return;
        }
    });
});


/*
 * ===========================
 * ONLOAD ROUTINES
 * ===========================
 */
$(document).ready(function () { onloadRoutines_p(); });

async function onloadRoutines_p () {

}
