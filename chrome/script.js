chrome.browserAction.setIcon({ path: 'icon.svg' });
chrome.tabs.getSelected(null, init);

function init(tab) {
  var domain = parseDomainFromUrl(tab.url);

  fetch("http://localhost:3131/password?domain="+domain)
    .then(function(response) { return response.json(); })
    .then(function(results) {
        // if just 1 result, fill & close
        if(results.length === 1 ) {
          fill(results[0]);
          window.close();
        }

        // if multiple: offer choice

        // if none: show sad thing
    });
}

function fill(creds) {
  var code = '';
  code += 'document.querySelector(\'input[type=\"text\"], input[type=\"email\"]\').value = "'+ creds.u +'";';
  code += 'document.querySelector(\'input[type=\"password\"]\').value = "'+ creds.p +'";';

  chrome.tabs.executeScript({
    code: code
  })
}

function parseDomainFromUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname;
}
