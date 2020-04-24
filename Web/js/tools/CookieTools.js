/*
 * ===========================
 * COOKIE
 * ===========================
 */
function getCookie (cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length,c.length);
		}
	}
	return null;
}

function setCookie (cookieName, cookieValue, cookieExpire) {

	var expireString = '';
	if (cookieExpire != null) {
		// var d = new Date();
		// d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		expireString = "expires=" + cookieExpire.toUTCString();
	}

	document.cookie = cookieName + "=" + cookieValue + ";" + expireString + ";path=/";
}

function deleteCookie (cookieName) {
	document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
