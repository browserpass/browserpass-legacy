'use strict';

var app = 'com.dannyvankooten.gopass';
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var resultsElement = document.getElementById('results-container');
var activeTab;

resultsElement.innerHTML = '<span class="loader"></span>';
chrome.browserAction.setIcon({ path: 'icon-lock.svg' });
chrome.tabs.getSelected(null, init);

searchForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // don't search without input.
  if( ! searchInput.value.length ) {
      return;
  }

  searchPassword(searchInput.value);
});

function init(tab) {
  activeTab = tab;
  var domain = parseDomainFromUrl(tab.url);
  searchPassword(domain);
}

function searchPassword(domain) {
  resultsElement.innerHTML = '<div class="status-text">Searching..</div>';
  chrome.runtime.sendNativeMessage(app, { "domain": domain }, function(response) {
    return handleSearchResponse(domain, response);
  });
}

// handle response received from native binary
function handleSearchResponse(domain, results) {
  // check for communication error
  if( results === undefined ) {
    resultsElement.innerHTML = '<div class="status-text">Error talking to pass.</div>';
    return;
  }

  if( results.length === 0 ) {
    // no results
    resultsElement.innerHTML = '<div class="status-text">No passwords found for <strong>' + domain + "</strong>.</div>";
    return;
  }

  resultsElement.innerHTML = '';
  var list = document.createElement('div');
  list.className = 'usernames';
  resultsElement.appendChild(list);

  for( var i=0; i<results.length; i++ ) {
    var el = document.createElement('button');
    el.className = 'username';
    el.onclick = fillLoginForm.bind(results[i]);

    var html = '';
    html += '<img class="favicon" src="'+ getFaviconUrl(domain) +'" />';
    html += '<span>' + results[i].u + '</span>';
    el.innerHTML = html;
    list.appendChild(el);
  }
}

function getFaviconUrl(domain){

  // use current favicon when searching for current tab
  if(activeTab.favIconUrl.indexOf(domain) > -1) {
    return activeTab.favIconUrl;
  }

  // make a smart guess if search looks like a real domain
  var dot = domain.indexOf('.');
  if( dot > 1 && domain.substring(dot).length > 2) {
    return 'http://' + domain + '/favicon.ico';
  }

  return 'icon-key.png';
}

// fill login form & submit
function fillLoginForm() {
  var code = '(function() { ' + "\n";
  code += 'var passwordInput = document.querySelector(\'input[type="password"]\');' + "\n";
  code += 'if( ! passwordInput ) { return; }' + "\n";
  code += 'var origForm = passwordInput.form; var newForm = origForm.cloneNode(true);' + "\n";
  code += 'var passwordInput = newForm.querySelector(\'input[type="password"]\');' + "\n";
  code += "var usernameInput = newForm.querySelector('input[type=email], input[type=text]');" + "\n";
  code += 'passwordInput.value = '+ JSON.stringify(this.p) +';' + "\n";
  code += 'if( usernameInput ) { usernameInput.value = '+ JSON.stringify(this.u) +'; }' + "\n";
  code += 'origForm.parentNode.replaceChild(newForm, origForm);' + "\n";
  code += 'newForm.submit();' + "\n";
  code += '})();' + "\n";

  chrome.tabs.executeScript({ code: code });
  window.close();
}

// parse domain from a URL & strip WWW
function parseDomainFromUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname.replace('www.', '');
}
