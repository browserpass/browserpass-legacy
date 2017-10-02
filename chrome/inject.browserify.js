window.browserpassFillForm = function(login, autoSubmit) {
  const USERNAME_FIELDS = {
    selectors: [
      "input[name*=user i]",
      "input[name*=login i]",
      "input[name*=email i]",
      "input[id*=user i]",
      "input[id*=login i]",
      "input[id*=email i]",
      "input[class*=user i]",
      "input[class*=login i]",
      "input[class*=email i]",
      "input[type=email i]",
      "input[type=text i]",
      "input[type=tel i]"
    ],
    types: ["email", "text", "tel"]
  };
  const PASSWORD_FIELDS = {
    selectors: ["input[type=password i]"]
  };
  const INPUT_FIELDS = {
    selectors: PASSWORD_FIELDS.selectors.concat(USERNAME_FIELDS.selectors)
  };
  const SUBMIT_FIELDS = {
    selectors: ["[type=submit i]"]
  };

  function queryAllVisible(parent, field, form) {
    var result = [];
    for (var i = 0; i < field.selectors.length; i++) {
      var elems = parent.querySelectorAll(field.selectors[i]);
      for (var j = 0; j < elems.length; j++) {
        var elem = elems[j];
        // We may have a whitelist of acceptable field types. If so, skip elements of a different type.
        if (field.types && field.types.indexOf(elem.type.toLowerCase()) < 0) {
          continue;
        }
        // Elem or its parent has a style 'display: none',
        // or it is just too narrow to be a real field (a trap for spammers?).
        if (elem.offsetWidth < 50 || elem.offsetHeight < 10) {
          continue;
        }
        // Select only elements from specified form
        if (form && form != elem.form) {
          continue;
        }
        // Elem takes space on the screen, but it or its parent is hidden with a visibility style.
        var style = window.getComputedStyle(elem);
        if (style.visibility == "hidden") {
          continue;
        }
        // Elem is outside of the boundaries of the visible viewport.
        var rect = elem.getBoundingClientRect();
        if (
          rect.x + rect.width < 0 ||
          rect.y + rect.height < 0 ||
          (rect.x > window.innerWidth || rect.y > window.innerHeight)
        ) {
          continue;
        }
        // This element is visible, will use it.
        result.push(elem);
      }
    }
    return result;
  }

  function queryFirstVisible(parent, field, form) {
    var elems = queryAllVisible(parent, field, form);
    return elems.length > 0 ? elems[0] : undefined;
  }

  function form() {
    var elem = queryFirstVisible(document, INPUT_FIELDS, undefined);
    return elem && elem.form ? elem.form : undefined;
  }

  function find(field) {
    return queryFirstVisible(document, field, form());
  }

  function update(field, value) {
    if (!value.length) {
      return false;
    }

    // Focus the input element first
    var el = find(field);
    if (!el) {
      return false;
    }
    var eventNames = ["click", "focus"];
    eventNames.forEach(function(eventName) {
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
    });

    // Focus may have triggered unvealing a true input, find it again
    el = find(field);
    if (!el) {
      return false;
    }

    // Now set the value and unfocus
    el.setAttribute("value", value);
    el.value = value;
    var eventNames = [
      "keypress",
      "keydown",
      "keyup",
      "input",
      "blur",
      "change"
    ];
    eventNames.forEach(function(eventName) {
      el.dispatchEvent(new Event(eventName, { bubbles: true }));
    });
    return true;
  }

  update(USERNAME_FIELDS, login.u);
  update(PASSWORD_FIELDS, login.p);

  if (login.digits) {
    alert((login.label || "OTP") + ": " + login.digits);
  }

  var password_inputs = queryAllVisible(document, PASSWORD_FIELDS, form());
  if (password_inputs.length > 1) {
    // There is likely a field asking for OTP code, so do not submit form just yet
    password_inputs[1].select();
  } else {
    window.requestAnimationFrame(function() {
      // Try to submit the form, or focus on the submit button (based on user settings)
      var submit = find(SUBMIT_FIELDS);
      if (submit) {
        if (autoSubmit == "false") {
          submit.focus();
        } else {
          submit.click();
        }
      } else {
        // There is no submit button. We need to keep focus somewhere within the form, so that Enter hopefully submits the form.
        var password = find(PASSWORD_FIELDS);
        if (password) {
          password.focus();
        } else {
          var username = find(USERNAME_FIELDS);
          if (username) {
            username.focus();
          }
        }
      }
    });
  }
};
