'use strict';

var m = require('mithril');
var app = 'com.dannyvankooten.browserpass';
var activeTab;
var searching = true;
var logins;
var domain;

m.mount(document.getElementById('mount'), { "view": view });

chrome.browserAction.setIcon({ path: 'icon-lock.svg' });
chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
  init(tabs[0]);
});

function view() {
  var results;

  if( searching ) {
    results = m('div.loader');
  } else if( typeof(logins) === "undefined" ) {
    results = m('div.status-text', "Error talking to Pass");
  } else if( logins.length === 0 ) {
    results = m('div.status-text',  m.trust(`No passwords found for <strong>${domain}</strong>.`));
  } else {
      results = logins.map(function(l) {
        var faviconUrl = getFaviconUrl(domain);
        return m('button.login', {
          "onclick": fillLoginForm.bind(l),
          "style": `background-image: url('${faviconUrl}')`
        }, [
          m('span', l.u),
          m('span.file', l.f)
        ])
      });
  }

  return [
    // search form
    m('div.search', [
      m('form', {
        "onsubmit": submitSearchForm
      }, [
        m('input', {
          "type": "text",
          "name": "s",
          "placeholder": "Search password..",
          "autocomplete": "off",
          "autofocus": "on"
        }),
        m('input', {
          "type": "submit",
          "value": "Search",
          "style": "display: none;"
        })
      ])
    ]),

    // results
    m('div', results)
  ];
}

function submitSearchForm(e) {
  e.preventDefault();

  // don't search without input.
  if( ! this.s.value.length ) {
      return;
  }

  searchPassword(this.s.value);
}

function init(tab) {
  // do nothing if called from a non-tab context
  if( tab == undefined ) {
    return;
  }

  activeTab = tab;
  var domain = parseDomainFromUrl(tab.url);
  searchPassword(domain);
}

function searchPassword(_domain) {
  searching = true;
  logins = null;
  domain = _domain;
  m.redraw();

  chrome.runtime.sendNativeMessage(app, { "domain": _domain }, function(response) {
    searching = false;
    logins = response;
    m.redraw();
  });
}

function getFaviconUrl(domain){

  // use current favicon when searching for current tab
  if(activeTab && activeTab.favIconUrl && activeTab.favIconUrl.indexOf(domain) > -1) {
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

    update(field('input[type=password]'), ${JSON.stringify(this.p)});
    update(field('input[type=email], input[type=text]'), ${JSON.stringify(this.u)});
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
