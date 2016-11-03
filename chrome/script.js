chrome.browserAction.setIcon({ path: 'icon.svg' });
chrome.tabs.getSelected(null, init);

function init(tab) {
  var domain = parseDomainFromUrl(tab.url);

  fetch("http://localhost:3131/password?domain="+domain)
    .then(function(response) { return response.json(); })
    .then(function(json) {
      var code = '';
      code += 'document.querySelector(\'input[type=\"text\"], input[type=\"email\"]\').value = "' +json.u+'";';
      code += 'document.querySelector(\'input[type=\"password\"]\').value = "'+ json. p +'";';

      chrome.tabs.executeScript({
        code: code
      })
    });
}

function parseDomainFromUrl(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname;
}
