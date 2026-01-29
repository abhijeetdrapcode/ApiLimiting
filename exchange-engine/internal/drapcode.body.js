$(document).ready(function () {
  (async () => {
    let textareas = $('textarea');
    let isTextareaFieldExist = textareas.length;

    if (isTextareaFieldExist) {
      initializeSummerNoteWYSIWYGEditor(textareas);
    }
  })();
});

/**
 * Date type field
 */
(async () => {
  let dateField = $('input[type=datetime-local], input[type=date]');
  let isDateFieldExist = dateField.length;
  if (isDateFieldExist) {
    dateField.each(function () {
      let input = $(this);
      let showTime = $(input[0]).attr('type') === 'datetime-local';
      const dateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
      const datenTime = getDateTimeFormat(dateFormat, showTime);
      let placeholder = $(input[0]).attr('placeholder');
      let isProcessed = $(input[0]).attr('isprocessed');
      let inputValue = $(input[0]).val();
      if (!isProcessed) {
        input.attr('autocomplete', 'off');
        input.attr(
          'placeholder',
          showTime ? `${placeholder} (YYYY-MM-DD HH:MM)` : `${placeholder}  ${dateFormat}`,
        );
        input.attr('flat-picker-date-type', showTime ? 'datetime-local' : 'date');
      }

      input.flatpickr({
        enableTime: showTime,
        dateFormat: datenTime,
        time_24hr: true,
        minuteIncrement: 1,
        allowInput: true,
        defaultDate: inputValue,
        disableMobile: true, // For testing purpose
        onOpen: function (selectedDates, dateStr, instance) {
          $(instance.altInput).prop('readonly', true);
        },
        onClose: function (selectedDates, dateStr, instance) {
          $(instance.altInput).prop('readonly', false);
          $(instance.altInput).blur();
        },
      });
    });
  }
})();
/**
 * Phonenumber field
 */
(async () => {
  let phoneNumberFields = $('input[type=tel]');
  phoneNumberFields.each(function () {
    let initialCountry = $(this).attr('defaultcountry') || 'us'; // fallback
    let allowedAttr = $(this).attr('allowedcountries') || ''; // get attribute
    let allowedCountries = allowedAttr
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    let config = {
      initialCountry,
      utilsScript: 'https://asset.drapcode.com/intl-tel-input/utils.js',
    };
    if (allowedCountries.length > 0) config.onlyCountries = allowedCountries;
    $(this).intlTelInput(config);
  });
})();

$(document).ready(function () {
  /***
   * To create custom validation
   */

  /**
   * This function overrides the default checkForm method of jQuery validator
   * to ensure that it checks all elements with the same name, even if they are
   * grouped together.
   * It iterates through all elements in the form, checking each one individually.
   * If multiple elements share the same name, it checks each one to ensure they
   * all pass validation.
   */
  $.validator.prototype.checkForm = function () {
    this.prepareForm();
    for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
      if (
        this.findByName(elements[i].name).length != undefined &&
        this.findByName(elements[i].name).length > 1
      ) {
        for (var cnt = 0; cnt < this.findByName(elements[i].name).length; cnt++) {
          this.check(this.findByName(elements[i].name)[cnt]);
        }
      } else {
        this.check(elements[i]);
      }
    }
    return this.valid();
  };

  $.validator.addMethod('validPhoneNumber', function (value, element) {
    return this.optional(element) || $(element).intlTelInput('isValidNumber');
  });
  $.validator.addMethod('passwordCapitalLetter', function (value, element) {
    return /[A-Z]/.test(value);
  });
  $.validator.addMethod('passwordLowerLetter', function (value, element) {
    return /[a-z]/.test(value);
  });
  $.validator.addMethod('passwordSpecialCharacter', function (value, element) {
    return /\W|_/.test(value);
  });
  $.validator.addMethod('passwordNumber', function (value, element) {
    return /[0-9]/.test(value);
  });
  $.validator.addMethod('pattern_alphabets_only', function (value, element) {
    return /^[A-Za-z]+$/.test(value);
  });
  $.validator.addMethod('pattern_numbers_only', function (value, element) {
    return /^[0-9]+$/.test(value);
  });
  $.validator.addMethod('pattern_alphanumeric', function (value, element) {
    return /^[a-zA-Z0-9)]+$/.test(value);
  });
  $.validator.addMethod('pattern_alphanumeric_whitespaces', function (value, element) {
    return /^[a-zA-Z0-9 ]+$/.test(value);
  });
  $.validator.addMethod('pattern_alphanumeric_underscores', function (value, element) {
    return /^[^\W]+$/.test(value);
  });
  $.validator.addMethod('slug', function (value, element) {
    return /^[a-zA-Z0-9_-]*$/.test(value);
  });

  const notificationSettingString = localStorage.getItem('notificationSetting');
  const notificationSetting = notificationSettingString
    ? JSON.parse(notificationSettingString)
    : '';
  if (notificationSetting && Object.keys(notificationSetting).length) {
    toastr.options = { ...notificationSetting };
  }

  /**
   * Timepicker field
   */
  let timepickerFields = document.querySelectorAll(
    `input[type=text][data-component-type=time_picker]`,
  );
  let isTimepickerFieldExist = !!timepickerFields.length;
  if (isTimepickerFieldExist) {
    timepickerFields.forEach((input) => {
      addTimePickerToElement(input);
    });
  }
  /**
   * Date segregated field
   */
  // Main logic for date-segregated fields
  const dateSegregatedFields = queryElements(DATE_SEGREGATED_FIELD_SELECTOR);
  const isDateSegregateFieldExist = !!dateSegregatedFields.length;

  if (isDateSegregateFieldExist) {
    const daySegregatedFields = queryElements(DAY_SEGREGATED_FIELD_SELECTOR);
    const monthSegregatedFields = queryElements(MONTH_SEGREGATED_FIELD_SELECTOR);
    const yearSegregatedFields = queryElements(YEAR_SEGREGATED_FIELD_SELECTOR);

    // Populate day, month, and year fields
    populateDropdownFields(daySegregatedFields, 'day');
    populateDropdownFields(monthSegregatedFields, 'month');
    populateDropdownFields(yearSegregatedFields, 'year', SEGREGATED_DATE_QNT_YEARS, CURRENT_YEAR);
  }
});

/**
 * Select2 field
 */
(async () => {
  $('.select').on('change', function () {
    const values = $(this).val();
    if (Array.isArray(values) && values.length > 1) {
      const index = values.indexOf('');
      if (index > -1) {
        values.splice(index, 1);
        $(this).val(values);
      }
    } else if (Array.isArray(values) && values.length === 0) {
      $(this).val('');
    }
    $(this).trigger('change.select2'); // Notify only Select2 of changes;
  });
})();

const initializeSummerNoteWYSIWYGEditor = (textareas) => {
  textareas.each(function () {
    let input = $(this);
    let showTextEditor = input[0].hasAttribute('data-show-editor');
    if (showTextEditor) {
      try {
        input.summernote({
          toolbar: [
            ['font', ['fontname', 'fontsize']],
            [
              'style',
              ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'color'],
            ],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'picture']],
            ['view', ['undo', 'redo', 'clear', 'codeview']],
          ],
          height: 200,
          tabsize: 2,
          fontNames: summernoteFontsArray,
          fontNamesIgnoreCheck: summernoteFontsArray,
          fontSizes: summernoteFontsSizeArray,
          focus: false,
          callbacks: {
            onInit: function () {
              input.summernote('fontName', 'Arial');
              input.summernote('fontSize', '16');
              document.activeElement.blur();
              $(window).scrollTop(0);
            },
            onImageUpload: async function (files) {
              const formData = new FormData();
              let endpoint = 'file/editor';
              formData.append('file', files[0]);
              const { data } = await multipartFormDataSecuredCall(formData, endpoint);
              const img = $('<img>').attr({
                src: `${imageServerUrl()}${data.key}`,
              });
              input.summernote('insertNode', img[0]);
            },
          },
        });
      } catch (error) {
        console.error('Failed to initialize Summernote:', error);
      }
    }
  });
};
// Validation rule without message
$.validator.addMethod('select2required', function (value, element) {
  let val = $(element).val();
  if (Array.isArray(val)) {
    val = val.filter((v) => v && v.trim() !== '');
    return val.length > 0;
  }
  return val && val.trim() !== '';
});

// Is User Logged in
const isUserLoggedIn = () => !!window.localStorage.getItem('user');
// Verify Token From Server
const verifyTokenAndHandleLogout = async () => {
  if (!isUserLoggedIn()) return;
  try {
    const tokenResponse = await securedGetCall(`auth/check-token`, true);
    console.log('token response: ', tokenResponse?.data?.message);
  } catch (err) {
    console.log('\n verifyTokenAndHandleLogout err', err);
    await autoLogout();
    throw err;
  }
};

// Auto Logout Code
(async function () {
  const autoLogoutPageEl = document.getElementById('autoLogoutPage');
  const inactivityLimitEl = document.getElementById('inactivityLimit');

  const inActivityLimitInSec = inactivityLimitEl?.textContent?.trim() || '900';
  const inActivityLimit = parseInt(inActivityLimitInSec, 10) * 1000;
  const logoutRedirectPage = autoLogoutPageEl?.textContent?.trim() || '';

  const config = Object.freeze({
    autoLogoutPage: logoutRedirectPage,
    inactivityLimit: inActivityLimit,
  });

  Object.defineProperty(window, 'AUTO_LOGOUT_CONFIG', {
    value: config,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  // Inactivity logic
  let lastActivity = Date.now();
  let timer;
  let logoutInProgress = false;
  let isWatching = false;
  let pendingLogout = false;

  // Auto Logout
  const autoLogout = async () => {
    if (!isUserLoggedIn() || logoutInProgress) return;
    if (document.hidden) {
      pendingLogout = true;
      return;
    }
    logoutInProgress = true;
    console.warn('Logging out due to inactivity...');
    clearTimeout(timer);
    localStorage.setItem('logoutEvent', Date.now().toString());
    await handleLogoutAfterTokenExpire(`/${config.autoLogoutPage}`);
  };
  // Reset Timer
  const resetTimer = () => {
    if (!isUserLoggedIn()) return;
    lastActivity = Date.now();
    localStorage.setItem('lastActivity', lastActivity.toString());
    clearTimeout(timer);
    timer = setTimeout(autoLogout, config.inactivityLimit);
  };

  // Inactivity Watcher
  const startInactivityWatcher = () => {
    if (!isUserLoggedIn() || isWatching) return;
    isWatching = true;

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        const now = Date.now();

        try {
          await verifyTokenAndHandleLogout();
        } catch {
          return;
        }

        if (pendingLogout) {
          pendingLogout = false;
          await autoLogout();
          return;
        }
        if (now - lastActivity >= config.inactivityLimit) {
          await autoLogout();
        } else {
          resetTimer();
          // Check JWT Token expiry
          const accessToken = localStorage.getItem('token');
          try {
            await checkTokenExpiry(accessToken);
          } catch (err) {
            console.error('Error checking token:', err);
          }
        }
      }
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'lastActivity') {
        const otherTabActivity = parseInt(e.newValue, 10);
        if (otherTabActivity && Date.now() - otherTabActivity < config.inactivityLimit) {
          resetTimer();
        }
      }
      if (e.key === 'logoutEvent') {
        console.warn('Detected logout in another tab. Logging out here too.');
        processLogoutUser(`/${config.autoLogoutPage}`);
      }
    });
  };

  if (isUserLoggedIn()) {
    startInactivityWatcher();
    resetTimer();
    await verifyTokenAndHandleLogout();
  }
})();
