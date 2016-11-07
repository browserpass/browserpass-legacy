'use strict';

var app = 'com.dannyvankooten.gopass';
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var resultsElement = document.getElementById('results-container');
var activeTab;

resultsElement.innerHTML = '<span class="loader"></span>';
chrome.browserAction.setIcon({ path: 'icon-lock.svg' });
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  init(tabs[0]);
});

searchForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // don't search without input.
  if( ! searchInput.value.length ) {
      return;
  }

  searchPassword(searchInput.value);
});

function init(tab) {

  // do nothing if called from a non-tab context
  if( tab == undefined ) {
    resultsElement.innerHTML = '';
    return;
  }

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
  if(activeTab && activeTab.favIconUrl.indexOf(domain) > -1) {
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
  var code = `
  (function(d) {
    function form() {
      return d.querySelector('input[type=password]').form || document.createElement('form');
    }

    function field(selector) {
      return form().querySelector(selector) || document.createElement('input');
    }

    function update(el, value) {
      el.setAttribute('value', value);
      el.value = value;

      var eventNames = [ 'click', 'focus', 'keyup', 'keydown', 'change', 'blur' ];
      eventNames.forEach(function(eventName) {
        el.dispatchEvent(new Event(eventName, {"bubbles":true}));
      });
    }

    update(field('input[type=password]'), `+ JSON.stringify(this.p) +`);
    update(field('input[type=email], input[type=text]'), `+ JSON.stringify(this.u) +`);
    field('[type=submit]').click();
  })(document);
  `;
  chrome.tabs.executeScript({ code: code });
  window.close();
}

// parse domain from a URL & strip WWW
function parseDomainFromUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname.replace('www.', '');
}
