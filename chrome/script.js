'use strict';

var app = 'com.dannyvankooten.gopass';
var content = document.getElementById('content');
var domain = '';
var favicon = '';

content.innerHTML = '<span class="loader"></span>';
chrome.browserAction.setIcon({ path: 'icon.svg' });
chrome.tabs.getSelected(null, init);

function init(tab) {
  favicon = tab.favIconUrl;
  domain = parseDomainFromUrl(tab.url);
  chrome.runtime.sendNativeMessage(app, { "domain": domain }, handleResponse);
}

// handle response received from native binary
function handleResponse(response) {
  content.innerHTML = '';

  // check for communication error
  if( response === undefined ) {
    content.innerHTML = '<div class="status-text">Error talking to pass.</div>';
    return;
  }

  if( response.length === 0 ) {
    // no results
    content.innerHTML = '<div class="status-text">No passwords found for <strong>' + domain + "</strong>.</div>";
    return;
  }

// if just 1, fill right away
  if( response.length === 1 ) {
    return fillLoginForm.call(response[0]);
  }

  var list = document.createElement('div');
  list.className = 'usernames';
  content.appendChild(list);

  for( var i=0; i<response.length; i++ ) {
    var el = document.createElement('div');
    el.className = 'username';
    el.onclick = fillLoginForm.bind(response[i]);

    var html = '';
    html += '<img class="favicon" src="'+ favicon +'" />';
    html += '<span>' + response[i].u + '</span>';
    el.innerHTML = html;
    list.appendChild(el);
  }
}

// fill login form & submit
function fillLoginForm() {
  var code = 'console.log("Filling login form.");';
  code += 'var passwordInput = document.querySelector(\'input[type="password"]\');';
  code += 'var origForm = passwordInput.form; var newForm = origForm.cloneNode(true);';
  code += 'var passwordInput = newForm.querySelector(\'input[type="password"]\');'
  code += "var usernameInput = newForm.querySelector('input[type=email], input[type=text]');";
  code += 'passwordInput.value = '+ JSON.stringify(this.p) +';';
  code += 'usernameInput.value = '+ JSON.stringify(this.u) +';';
  code += 'origForm.parentNode.replaceChild(newForm, origForm);';
  code += 'newForm.submit();';

  chrome.tabs.executeScript({ code: code });
  window.close();
}

// parse domain from a URL & strip WWW
function parseDomainFromUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname.replace('www.', '');
}
