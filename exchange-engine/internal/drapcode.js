window.DropzoneInitRegistry = {};

// Token Validation Check
const invalidResponseCodes = new Set([400, 401, 402, 403]);
const invalidTokenMessages = new Set(['Token is invalid', 'Token is Empty']);
const checkTokenValidFromServer = async (response) => {
  let logoutRedirectPage = window?.AUTO_LOGOUT_CONFIG?.autoLogoutPage || '/';
  const code = response?.data?.code;
  const message = response?.data?.message;
  if (invalidResponseCodes.has(code) && invalidTokenMessages.has(message)) {
    await handleLogoutAfterTokenExpire(logoutRedirectPage);
    response.data.status = 401;
    response.data.message = 'Logging out!';
  }
  return response;
};
// Adding Token Validation on Axioss
const applyInterceptor = (axios) => {
  axios.interceptors.response.use(
    async (response) => await checkTokenValidFromServer(response),
    async (error) => {
      if (error.response) {
        await checkTokenValidFromServer(error.response);
      }
      return Promise.reject(error);
    },
  );
  console.log('Axios interceptor applied');
};

if (window.axios) {
  applyInterceptor(window.axios);
} else {
  Object.defineProperty(window, 'axios', {
    configurable: true,
    enumerable: true,
    set(value) {
      delete window.axios;
      window.axios = value;
      applyInterceptor(value);
    },
  });
}

const DATE_REGEX =
  /^[12]\d{3}(-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?)(T| )?(([01][0-9]|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/;

const htmlRegex =
  /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i;
const referenceType = ['reference', 'belongsTo'];
const byType = ['createdBy', 'updatedBy'];
const staticDynamicType = ['static_option', 'dynamic_option'];
const referenceOptionType = [...staticDynamicType, ...referenceType, ...byType];
const referenceDynamicType = ['dynamic_option', ...referenceType, ...byType];
const EQUALS = 'EQUALS';
const IS_NOT_NULL = 'IS_NOT_NULL';
const IS_NULL = 'IS_NULL';
const LIKE = 'LIKE';
const IN_LIST = 'IN_LIST';
const NOT_IN_LIST = 'NOT_IN_LIST';
const LESS_THAN = 'LESS_THAN';
const GREATER_THAN = 'GREATER_THAN';
const LESS_THAN_EQUALS_TO = 'LESS_THAN_EQUALS_TO';
const GREATER_THAN_EQUALS_TO = 'GREATER_THAN_EQUALS_TO';
const BETWEEN = 'BETWEEN';
const NOT_EQUAL = 'NOT_EQUAL';
const CURRENT_USER = 'currentLoggedInUser';
const CURRENT_USER_ROLE = 'currentLoggedInUserRole';
const CURRENT_TIME = 'CURRENT_TIME';
const CURRENT_DATE = 'currentDate';
const CURRENT_DATE_TIME = 'currentDateTime';
const COLLECTION = 'collection';
const IS_LOGGED_IN = 'IS_LOGGED_IN';
const IS_NOT_LOGGED_IN = 'IS_NOT_LOGGED_IN';
const COLLECTION_USER = 'user';
const PARENT_COLLECTION_PROPAGATE_KEY = 'parentCollectionToPropagate';
const TENANT_ID_COOKIE_KEY = '__dc_tId';
const CUSTOM_SEPARATOR = `##@CUSTOM_SEPARATOR@##`;
const APOSTROPHE_REPLACER = `##@apos@##`;

/**
 * Login Type Constants
 */
const LOGIN_WITH_TOKEN = 'LOGIN_WITH_TOKEN';
const LOGIN_WITH_XANO = 'LOGIN_WITH_XANO';
const LOGIN_USER = 'LOGIN_USER';
const LOGIN_ANONYMOUS_USER = 'LOGIN_ANONYMOUS_USER';
/**
 * Modal Collection Item
 */
let MODAL_COLLECTION_ITEM_DATA = '';

/**
 * Dropzone
 */
let DropzoneMap = new Map();
const throttledMap = new Map();
const lastPromiseMap = new Map();
setInterval(
  () => {
    throttledMap.clear();
    lastPromiseMap.clear();
  },
  5 * 60 * 1000,
);

const optionTypes = ['dynamic_option', 'static_option'];
const currentOptions = ['CURRENT_USER', 'CURRENT_TENANT'];
// Constants for URL building strategies
const URL_STRATEGIES = {
  CURRENT_OBJECT: 'sendCurrentObjectID',
  PREVIOUS_STEP: 'sendPreviousStepParentCollectionId',
  CURRENT_PAGE: 'sendCurrentPageItemId',
  CURRENT_USER: 'sendCurrentUserId',
  TARGET_ITEM: 'sendTargetItemID',
  PAGE_REFERENCE: 'sendCurrentPageReferenceItemId',
  BSL_ITEM: 'sendBSLItemId',
};
const BSL_KEYS = {
  SESSION_STORAGE: { key: 'SESSION_STORAGE', value: 'sessionStorageData' },
  LOCAL_STORAGE: { key: 'LOCAL_STORAGE', value: 'localStorageData' },
  COOKIES: { key: 'COOKIES', value: 'cookiesData' },
  INDEXED_DB: { key: 'INDEXED_DB', value: 'indexedDB' },
};
/**
 * Action Log
 */
const ACTION_LOG_PREFIX =
  new Date().getDate() +
  '.' +
  new Date().getMonth() +
  '.' +
  new Date().getFullYear() +
  ' / ' +
  new Date().getHours() +
  ':' +
  new Date().getMinutes() +
  ':' +
  new Date().getSeconds() +
  ' | Action log ~';

/**
 * String Utility Function
 */
const capitalize = function (subject, restToLower) {
  return v.capitalize(subject, restToLower === 'TRUE');
};
const lowerCase = function (subject) {
  return v.lowerCase(subject);
};
const upperCase = function (subject) {
  return v.upperCase(subject);
};
const slugify = function (subject) {
  return v.slugify(subject);
};
const trim = function (subject, whitespace, type) {
  if (type === 'LEFT') {
    return v.trimLeft(subject, whitespace);
  } else if (type === 'RIGHT') {
    return v.trimRight(subject, whitespace);
  } else {
    return v.trim(subject, whitespace);
  }
};
const titleCase = function (subject, noSplitopt) {
  return v.titleCase(subject, [noSplitopt]);
};
const truncate = function (subject, length, endopt) {
  return v.truncate(subject, length, endopt);
};
const substr = function (subject, startLength, endLength) {
  return v.substr(subject, startLength, endLength);
};

const strJoin = function (dataArr, separator, startString, endString) {
  separator = separator ? separator.replace(/##@@##@@##/g, ' ') : ' ';
  dataArr = Array.isArray(dataArr) ? dataArr : [dataArr];
  dataArr = dataArr.filter(Boolean);
  return `${startString ? startString.replace(/##@@##@@##/g, ' ') + separator : ''}${dataArr.join(
    separator,
  )}${endString ? separator + endString.replace(/##@@##@@##/g, ' ') : ''}`;
};

const markdownToHtml = function (subject) {
  const converter = new showdown.Converter({ tables: true });
  const html = converter.makeHtml(subject);
  return html;
};

const splitString = (subject, separator, index, indexNum) => {
  if (!subject) return '';
  separator = separator ? separator.replace(/##@@##@@##/g, ' ') : ' ';
  const stringArr = subject.split(separator);
  if (index === 'FIRST_ITEM') {
    indexNum = 0;
  } else if (index === 'LAST_ITEM') {
    indexNum = stringArr.length - 1;
  } else if (index === 'NTH_ITEM') {
    indexNum = indexNum - 1;
  }
  return stringArr[indexNum];
};

const evaluateCustomSentence = function (
  expression,
  data,
  user,
  projectConstant,
  environments,
  collectionConstant,
  previousActionResponse,
  previousActionFormData,
) {
  expression = expression ? getSpecialCharectorReplacedExpression(expression) : ' ';
  return replaceFieldsValueIntoExpression(
    expression,
    data,
    user,
    projectConstant,
    environments,
    collectionConstant,
    previousActionResponse,
    previousActionFormData,
  );
};

const formatDataOnTable = (
  subject,
  tableStyle,
  theadStyle,
  tbodyStyle,
  trStyle,
  tdStyle,
  thStyle,
  tableRefernceFields,
) => {
  if (!subject || !subject.length) return '';
  tableStyle = tableStyle
    ? getSpecialCharectorReplacedExpression(tableStyle)
    : 'border-collapse: collapse; width: 100%';
  theadStyle = theadStyle
    ? getSpecialCharectorReplacedExpression(theadStyle)
    : 'background-color: #f2f2f2; font-weight: bold;';
  tbodyStyle = tbodyStyle
    ? getSpecialCharectorReplacedExpression(tbodyStyle)
    : 'background-color: #fff;';
  trStyle = trStyle
    ? getSpecialCharectorReplacedExpression(trStyle)
    : 'border-bottom: 1px solid #ddd;';
  tdStyle = tdStyle
    ? getSpecialCharectorReplacedExpression(tdStyle)
    : 'padding: 8px; text-align: left; border: 1px solid #ddd;';
  thStyle = thStyle
    ? getSpecialCharectorReplacedExpression(thStyle)
    : 'padding: 8px; text-align: left; border: 1px solid #ddd;';

  // table element
  const table = document.createElement('table');
  table.style.cssText = tableStyle;

  // table header
  const thead = document.createElement('thead');
  thead.style.cssText = theadStyle;
  const headerRow = document.createElement('tr');
  headerRow.style.cssText = trStyle;

  tableRefernceFields.forEach((item) => {
    const th = document.createElement('th');
    th.style.cssText = thStyle;
    th.innerHTML = item.header;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // table body
  const tbody = document.createElement('tbody');
  tbody.style.cssText = tbodyStyle;

  // Table rowsws
  subject.forEach((obj) => {
    const row = document.createElement('tr');
    row.style.cssText = trStyle;

    tableRefernceFields.forEach((item) => {
      const td = document.createElement('td');
      td.style.cssText = tdStyle;
      td.innerHTML = obj[item.field] || '';
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table.outerHTML;
};

const getSpecialCharectorReplacedExpression = (expression) => {
  return expression
    .replace(/##@@##@@##/g, ' ')
    .replace(/##@@##@@@@/g, '>')
    .replace(/@@@@##@@@@/g, '<')
    .replace(/U\+000A/g, '<br/>')
    .replace(/U\+0022/g, '"')
    .replace(/U\+0027/g, "'");
};

const startsWithOne = (string, values) => {
  return values.some((element) => {
    return string.startsWith(element);
  });
};

const endsWithOne = (string, values) => {
  return values.some((element) => {
    return string.endsWith(element);
  });
};

/**
 * Math Utility Function
 */
const checkAndConvertNumber = (number) => {
  return _.isNumber(number) ? number : Number(number);
};

const validateNumbers = (numbers) => {
  return numbers.map((number) => {
    return checkAndConvertNumber(number);
  });
};

const addition = function (formatType, { numbers }) {
  try {
    if (!Array.isArray(numbers)) {
      numbers = [numbers, 0];
    }
    numbers = numbers.map((number) => (isNaN(number) ? 0 : number));
    const allNumbers = validateNumbers(numbers);
    return numeral(math.add(...allNumbers)).format(formatType ? formatType : '00.00');
  } catch (err) {
    console.error('🚀 ~ file: drapcode.js:166 ~ addition ~ error:', err);
    return '';
  }
};
const average = function (formatType, { numbers }) {
  try {
    if (!Array.isArray(numbers)) {
      numbers = [numbers];
    }
    numbers = numbers.map((number) => (isNaN(number) ? 0 : number));
    const allNumbers = validateNumbers(numbers);
    return numeral(math.mean(...allNumbers)).format(formatType ? formatType : '00.00');
  } catch (err) {
    console.error('🚀 ~ file: drapcode.js:174 ~ average ~ error:', err);
    return '';
  }
};
const multiply = function (formatType, { numbers }) {
  try {
    if (!Array.isArray(numbers)) {
      numbers = [numbers, 1];
    }
    numbers = numbers.map((number) => (isNaN(number) ? 1 : number));
    const allNumbers = validateNumbers(numbers);
    return numeral(math.multiply(...allNumbers)).format(formatType ? formatType : '00.00');
  } catch (err) {
    console.error('🚀 ~ file: drapcode.js:182 ~ multiply ~ error:', err);
    return '';
  }
};
const divide = function (formatType, { number1, number2 }) {
  try {
    const num1 = checkAndConvertNumber(number1);
    const num2 = checkAndConvertNumber(number2);
    return numeral(math.divide(num1, num2)).format(formatType ? formatType : '00.00');
  } catch (err) {
    console.error('🚀 ~ file: drapcode.js:190 ~ divide ~ error:', err);
    return '';
  }
};
const evaluateExpression = function (
  expression,
  data,
  user,
  formatType,
  projectConstant,
  environments,
  collectionConstant,
  previousActionResponse,
  previousActionFormData,
) {
  expression = expression ? getSpecialCharectorReplacedExpression(expression) : ' ';
  const replacedExpression = replaceFieldsValueIntoExpression(
    expression,
    data,
    user,
    projectConstant,
    environments,
    collectionConstant,
    previousActionResponse,
    previousActionFormData,
  );
  try {
    return numeral(math.evaluate(replacedExpression)).format(formatType ? formatType : '00.00');
  } catch (err) {
    return '';
  }
};

const evaluateCurrency = function (formatType, subject, currency, position, maxFraction) {
  try {
    if (!subject) subject = 0;
    if (!maxFraction && maxFraction !== 0) maxFraction = 2;
    const multiplier = Math.pow(10, maxFraction || 0);
    const digit = Math.round(subject * multiplier) / multiplier;
    subject = new Intl.NumberFormat(formatType, { minimumFractionDigits: maxFraction }).format(
      digit,
    );
    if (currency === 'NONE') return `${subject}`;
    if (currency.startsWith('current_user.')) {
      let loggedInUserData = parseLSJSONStrToJSON('user');
      currency = currency.replace('current_user.', '');
      currency = parseValueFromData(loggedInUserData, currency);
    } else if (currency.startsWith('current_tenant.')) {
      let loggedInTenantData = parseLSJSONStrToJSON('tenant');
      currency = currency.replace('current_tenant.', '');
      currency = parseValueFromData(loggedInTenantData, currency);
    }
    switch (position) {
      case 'FRONT':
        return `${currency}${subject}`;
      case 'FRONT_WITH_SPACE':
        return `${currency} ${subject}`;
      case 'BACK':
        return `${subject}${currency}`;
      case 'BACK_WITH_SPACE':
        return `${subject} ${currency}`;
      default:
        return '';
    }
  } catch (error) {
    console.error('error', error);
    return '';
  }
};

const evaluateJSLogic = function (
  expression,
  data,
  user,
  projectConstant,
  environments,
  collectionConstant,
  previousActionResponse,
  previousActionFormData,
) {
  expression = expression ? getSpecialCharectorReplacedExpression(expression) : ' ';
  // Changing <br/> to /n for js code
  expression = expression.replace(/<br\s*\/?>/g, '\n');
  const replacedExpression = replaceFieldsValueIntoExpression(
    expression,
    data,
    user,
    projectConstant,
    environments,
    collectionConstant,
    previousActionResponse,
    previousActionFormData,
  );
  try {
    const replacedExpressionFunction = new Function(replacedExpression.toString());
    return replacedExpressionFunction();
  } catch (err) {
    return '';
  }
};

const replaceFieldsValueIntoExpression = function (
  expression,
  data = {},
  user = {},
  projectConstant = [],
  environments = [],
  collectionConstant = [],
  previousActionResponse,
  previousActionFormData,
  derivedFields = [],
  userCollectionConstants = [],
  userDerivedFields = [],
  pageCollectionItem = {},
) {
  const contentList = expression.match(/{{(.*?)}}/g)?.map((b) => b.replace(/{{(.*?)}}/g, '$1'));
  contentList?.forEach((prop, key) => {
    const needle = `{{${prop}}}`;
    prop = v.trim(prop);
    let dataOfItem = '';
    const isDynamicField = [
      'RF::',
      'PC::',
      'CC::',
      'current_user_reference_field.',
      'createdBy.',
      'environment_variable.',
      'current_session.',
      'form_data_session.',
    ].some((str) => prop.includes(str));
    if (prop.includes('current_user')) {
      prop = prop.replace('current_user.', '');
      if (prop.startsWith('DF::')) {
        const derivedFieldName = prop.replace('DF::', '');
        const derivedField = userDerivedFields.find((derived) => derived.name === derivedFieldName);
        dataOfItem = prepareFunction(
          derivedField,
          user,
          projectConstant,
          environments,
          userCollectionConstants,
        );
      } else {
        if (Object.keys(user).length > 0) {
          dataOfItem = parseValueFromData(user, prop);
        }
      }
    } else if (prop.startsWith('PAGE::')) {
      const pageFieldName = prop.replace('PAGE::', '');
      dataOfItem = parseValueFromData(pageCollectionItem, pageFieldName);
    } else if (prop.startsWith('DF::')) {
      const derivedFieldName = prop.replace('DF::', '');
      const derivedField = derivedFields.find((derived) => derived.name === derivedFieldName);
      dataOfItem = prepareFunction(
        derivedField,
        data,
        projectConstant,
        environments,
        collectionConstant,
      );
    } else if (isDynamicField) {
      dataOfItem = getArgsFromKey(
        prop,
        data,
        user,
        projectConstant,
        environments,
        collectionConstant,
        previousActionResponse,
        previousActionFormData,
      );
    } else {
      if (Object.keys(data).length > 0) {
        dataOfItem = parseValueFromData(data, prop);
      }
    }
    expression = replaceValueInExpression(needle, dataOfItem, expression);
  });
  return expression;
};

const replaceValueInExpression = function (needle, replacement, expression) {
  const match = new RegExp(needle, 'ig');
  replacement = replacement ? replacement : '';
  return expression.replace(match, replacement);
};

const substraction = function (formatType, { numbers1, numbers2 }) {
  try {
    const actNumber1 = Array.isArray(numbers1) ? math.add(...numbers1) : numbers1;
    const actNumber2 = Array.isArray(numbers2) ? math.add(...numbers2) : numbers2;
    return numeral(math.subtract(actNumber1, actNumber2)).format(formatType ? formatType : '00.00');
  } catch (err) {
    console.error('🚀 ~ file: drapcode.js:343 ~ substraction ~ error:', err);
    return '';
  }
};
const count = function (subject, condition, refField, match, refFieldType) {
  if (!subject) return 0;
  const typeCond = optionTypes.includes(refFieldType);
  if (!typeCond) {
    switch (condition) {
      case EQUALS:
        subject = subject.filter((sub) => {
          return sub[refField].includes(match);
        });
        break;
      case NOT_EQUAL:
        subject = subject.filter((sub) => {
          return !sub[refField].includes(match);
        });
        break;
    }
  }
  return subject.length;
};

const percentage = function (subject, condition, refField, match, refFieldType, formatType) {
  let total = subject.length;
  if (!total) return '0';
  let value = subject.filter((sub) => {
    if (optionTypes.includes(refFieldType)) {
      if (condition === EQUALS) {
        return sub[refField].includes(match);
      } else if (condition === NOT_EQUAL) {
        return !sub[refField].includes(match);
      }
    } else return false;
  });
  value = value.length;
  const percentage = formatType.includes('%')
    ? numeral(math.divide(value, total)).format(formatType)
    : `${value}/${total}`;
  return percentage;
};

const findRecord = function (subject, refField, index) {
  if (index === 'FIRST_RECORD') return subject[0][refField];
  if (index === 'LAST_RECORD') return subject[subject.length - 1][refField];
};
/**
 * Date Utility Function
 */
const formatDate = function (formatType, datentime, timezone, unixType, offset = false) {
  let formatDateNTime =
    unixType && unixType === 'SEC' ? moment(datentime * 1000) : moment(datentime);
  if (offset) {
    formatDateNTime = formatDateNTime.utcOffset(timezone);
  }
  if (formatType === 'FROM_NOW') {
    return datentime ? formatDateNTime.fromNow() : '';
  }
  return datentime ? formatDateNTime.format(formatType) : '';
};

const dateDifference = (formatType, datentime1, datentime2, timezone) => {
  let result = '';
  const dateExist = !datentime1 || !datentime2;
  const firstDate =
    datentime1 === 'CURRENT_DATE_TIME'
      ? moment().utcOffset(timezone)
      : moment(datentime1).utcOffset(timezone);

  const secondDate =
    datentime2 === 'CURRENT_DATE_TIME'
      ? moment().utcOffset(timezone)
      : moment(datentime2).utcOffset(timezone);
  const patterns = formatType.split(',');
  patterns.forEach((format, i) => {
    const diff = firstDate.diff(secondDate, format);
    if (diff < 0) {
      firstDate.subtract(diff, format);
    } else {
      secondDate.add(diff, format);
    }
    result =
      result +
      `${Math.abs(dateExist ? 0 : diff)} ${format.charAt(0).toUpperCase() + format.slice(1)}${
        i === patterns.length - 1 ? '' : ','
      } `;
  });
  return result;
};

const dateAdd = (datentime1, unitToAdd, unitTypeToAdd, formatType) => {
  let result = '';
  const dateObj = datentime1 === 'CURRENT_DATE_TIME' ? moment() : moment(datentime1);
  result = dateObj.add(unitToAdd, unitTypeToAdd);
  if (formatType === 'FROM_NOW') {
    result = result.fromNow();
  } else result = result.format(formatType);
  return result;
};

const beautifyList = (subject, positionOfRecords, numberOfRecords, elementToRender) => {
  numberOfRecords = Number(numberOfRecords);
  if (!subject) return '';
  if (!numberOfRecords) numberOfRecords = subject.length;
  if (positionOfRecords === 'FIRST') subject = subject.slice(0, numberOfRecords);
  if (positionOfRecords === 'LAST') subject = subject.slice(-numberOfRecords);
  let element = '';
  if (elementToRender === 'BADGES') {
    element = subject
      .map((sub) => `<span class="badge badge-primary bg-primary blist-badge">${sub}</span>`)
      .join(' ');
  } else if (elementToRender === 'ORDERED_LIST') {
    element = `<ol class="blist-ol">${subject
      .map((sub) => `<li class="blist-li" >${sub}</li>`)
      .join('')}</ol>`;
  } else {
    element = `<ul class="blist-ul">${subject
      .map((sub) => `<li class="blist-li" >${sub}</li>`)
      .join('')}</ul>`;
  }
  return element;
};

const parseValueFromData = (data, fieldName, projectConstant, environments, collectionConstant) => {
  let value = '';
  if (fieldName && fieldName.includes('functionType')) {
    fieldName = fieldName.replaceAll("'", '"');
    const parsedField = JSON.parse(`${fieldName}`);
    value = prepareFunction(parsedField, data, projectConstant, environments, collectionConstant);
    if (!value || value == 'undefined' || value === 'undefined') {
      value = '';
    }
    return value;
  } else {
    if (fieldName && fieldName.includes('.')) {
      let fullNameParts = fieldName.split('.');
      let prefix = '';
      let stack = data || '';
      for (let k = 0; k < fullNameParts.length; k++) {
        prefix = fullNameParts[k];
        if (
          prefix === 'userSettingId' &&
          Array.isArray(stack.userSettingId) &&
          stack.userSettingId.length > 1
        ) {
          const loggedInTenant = fetchCurrentTenantJson();
          stack['userSettingId'] =
            stack.userSettingId.find((item) => item.tenantId[0] === loggedInTenant.uuid) || {};
        }
        if (Array.isArray(stack)) {
          stack[prefix] = stack.map((item) => {
            if (item[prefix]) return item[prefix];
          });
        }
        if (!stack[prefix]) {
          stack[prefix] = '';
        }
        stack = stack[prefix];
      }
      value = stack ? stack : '';
      if (Array.isArray(value)) {
        value = value.filter(() => true);
      }
    } else {
      value = data ? data[fieldName] : '';
    }

    if (value && Array.isArray(value) && value.length === 1) return value[0];
    if (value && Array.isArray(value) && typeof value[0] === 'string') {
      return value.join(',');
    }

    //* Handling bit value for Datasource Type: MYSQL
    if (value && typeof value === 'object' && !Array.isArray(value) && value.type === BUFFER) {
      value = value.data[0] || '';
    }

    if (!value || value == 'undefined' || value === 'undefined') {
      if (value === 0) {
        value = '0';
      } else {
        value = '';
      }
    }
    return value;
  }
};
const getIframeVideoUrlForYoutubeOrVimeo = (iframeSrc, data, videoType) => {
  if (videoType === 'youtube' || videoType === 'youtube-nocookie') {
    const videoId = data.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
    return videoId && videoId[2]
      ? videoType === 'youtube'
        ? iframeSrc.slice(0, 30) + videoId[2] + iframeSrc.slice(30)
        : iframeSrc.slice(0, 39) + videoId[2] + iframeSrc.slice(39)
      : '';
  }
  if (videoType === 'vimeo') {
    const videoId = data.match(
      /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
    );
    return videoId && videoId[3] ? iframeSrc.slice(0, 31) + videoId[3] + iframeSrc.slice(31) : '';
  }
};
const createLoggerDateFormat = () => {
  return moment().format('YYYY-MM-DD');
};
const createLogsDateFormat = () => {
  return moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
};
const nextDayDate = (date) => {
  date = new Date(date);
  return moment(date).add(1, 'days').format('YYYY-MM-DD');
};
const convertTimeStampToDate = (timeStampDate, offset = false) => {
  let timezone = +document.getElementById('project-timezone').innerText || 0;
  if (timeStampDate) {
    const dateFormat =
      timeStampDate.length > 10
        ? 'Do MMM YYYY, h:mm a'
        : document.getElementById('dateTimeFormat').innerText;
    return offset
      ? moment(timeStampDate, [dateFormat, 'YYYY-MM-DDTHH:mm:ss'])
          .utcOffset(timezone)
          .format(dateFormat)
      : moment(timeStampDate, [dateFormat, 'YYYY-MM-DDTHH:mm:ss']).format(dateFormat);
    // return moment(timeStampDate).format('MMMM d, yyyy, h:mm a');
  } else {
    return '';
  }
};

const getFieldPlaceholder = (fieldTitle, placeholderPattern) => {
  switch (placeholderPattern) {
    case 'ONLY_FIELD_NAME':
      return fieldTitle;
    case 'ONLY_SELECT':
      return 'Select';
    default:
      return `Select ${fieldTitle}`;
  }
};

/**
 * Object Utility Function
 */
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

const getIPAddress = async () => {
  let ipAddress = getCookie('userIPAddress');
  if (ipAddress) return ipAddress;
  try {
    const response = await fetch('https://api.ipify.org');
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status} in getIPAddress`);
      return '';
    }
    ipAddress = await response.text();
    setCookie('userIPAddress', ipAddress, 1, false);
    return ipAddress;
  } catch (error) {
    console.error('Failed to fetch IP address:', error);
    return '';
  }
};

/**
 * Page/Event Action Functions
 */

const getPageItemData = async () => {
  let result = {};
  const pageExternalApiData = {};
  const queryString = window.location.search;
  const pathArray = window.location.pathname.split('/');
  const collectionId = pathArray[pathArray.length - 2];
  let collectionItemId = pathArray[pathArray.length - 1];
  let fetchItemDataFrom = 'COLLECTION';
  const pageExternalAPISpan = window.document.getElementById('project-page-external-api');
  if (pageExternalAPISpan) {
    initialiseExternalApiDataFromSpan(pageExternalAPISpan, pageExternalApiData);
  }

  if (pageExternalApiData && pageExternalApiData.id) {
    fetchItemDataFrom = 'EXTERNAL_API';
  }

  switch (fetchItemDataFrom) {
    case 'EXTERNAL_API':
      // Fetch Item Data from External API binded to Page
      console.log('processing for non-persistent item... ');
      result = await doProcessForNonPersistentData(
        collectionItemId,
        collectionId,
        pageExternalApiData,
      );
      break;
    default:
      // Fetch Item Data from Collection binded to Page
      result = await doProcessForCollectionData(collectionItemId, collectionId);
      break;
  }

  return result;
};
const getPageExternalAPIData = async () => {
  let externalAPIData = {};
  const externalApiEndpoint = 'external-api';
  const pageId = getCookie('__pageId');
  const pageExternalApiId = getCookie('__pageExternalAPI');

  if (!pageExternalApiId || pageExternalApiId === 'undefined') return null;

  const hostnameShort = getHostnameShort();
  const externalAPISessionData = sessionStorage.getItem(
    `__pageExternalAPI_${hostnameShort}-${pageId}`,
  );
  externalAPIData = externalAPISessionData ? JSON.parse(externalAPISessionData) : null;

  if (!externalAPIData) {
    const externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${pageExternalApiId}`);
    if (externalAPIResult && externalAPIResult.status === 200) {
      externalAPIData = externalAPIResult.data;
      sessionStorage.setItem(
        `__pageExternalAPI_${hostnameShort}-${pageId}`,
        JSON.stringify(externalAPIData),
      );
      populateBrowserStorageKeyToReset(`__pageExternalAPI_${hostnameShort}-${pageId}`);
      return externalAPIData;
    }
  }
};

const searchQueryStringFromUrl = async function () {
  const urlObj = new URL(window.location.href);
  let searchQuery = urlObj.search;
  return searchQuery;
};
const isLoggedInUser = () => {
  const loggedInUserData = localStorage.getItem('user');
  return !!loggedInUserData;
};

const isLoggedInTenant = () => {
  const loggedInTenantData = localStorage.getItem('tenant');
  return !!loggedInTenantData;
};

const isLoggedInUserSetting = () => {
  const loggedInUserSettingData = localStorage.getItem('userSetting');
  return !!loggedInUserSettingData;
};

const isLoggedInSubTenant = () => {
  const loggedInSubTenantData = localStorage.getItem('subTenant');
  return !!loggedInSubTenantData;
};

const fetchLoggedInUser = () => {
  const loggedInUserData = localStorage.getItem('user');
  return loggedInUserData;
};

const fetchCurrentTenant = () => {
  const loggedInUserData = localStorage.getItem('tenant');
  return loggedInUserData;
};

const fetchCurrentUserSetting = () => {
  const loggedInUserData = localStorage.getItem('userSetting');
  return loggedInUserData;
};

const fetchCurrentSubTenant = () => {
  const loggedInSubTenantData = localStorage.getItem('subTenant');
  return loggedInSubTenantData;
};

const isLoggedInUserRole = (role) => {
  const loggedInUserRoleData = localStorage.getItem('role');
  return loggedInUserRoleData === role;
};

const searchQueryFromURL = async function () {
  const searchQuery = await searchQueryStringFromUrl();
  if (searchQuery.length > 0) {
    const searchParams = new URLSearchParams(searchQuery);
    let genericSearchFormElements = document.querySelectorAll(
      '[data-gjs=' + 'page-search-form' + ']',
    );
    if (genericSearchFormElements) {
      genericSearchFormElements.forEach((element) => {
        for (let searchObj of searchParams.keys()) {
          const searchElement = element.querySelector('[name=' + searchObj + ']');
          if (searchElement) {
            searchElement.value = searchParams.get(searchObj);
          }
        }
      });
    }
  }
};

const renderAutoComplete = async (element, collectionId, finderId, fieldName) => {
  if (collectionId && finderId) {
    const endpoint = `collection-table/${collectionId}/finder/${finderId}/items`;
    //TODO: Test for token
    // const token = validateCookieToken();
    // if (!token) return;
    const headerObj = await getHeaderForServerForPublicRequest();
    const { headers } = headerObj;
    $(`#${element.id}`).select2({
      ajax: {
        url: `${SERVER_URL}${endpoint}`,
        dataType: 'json',
        headers,
        data: function (params) {
          return {
            [fieldName]: params.term,
            offset: (params.page || 0) * 10,
            limit: 10,
          };
        },
        processResults: function (data, params) {
          let autoCompleteData = [];
          if (data.length > 0) {
            data.forEach((item, index) => {
              if (item) {
                if (Object.keys(item).length > 0) {
                  if (item.uuid) {
                    autoCompleteData.push({ id: item.uuid, text: item[fieldName] });
                  } else {
                    autoCompleteData.push({ id: item[fieldName], text: item[fieldName] });
                  }
                } else {
                  autoCompleteData.push({ id: item, text: item });
                }
              }
            });
          }
          params.page = params.page || 0;
          return {
            results: autoCompleteData,
            pagination: {
              more: params.page * 10 < autoCompleteData.length,
            },
          };
        },
        cache: true,
      },
      placeholder: 'Search ...',
      minimumInputLength: 2,
    });
  }
};

const renderAutoCompleteInput = async (element, collectionId, finderId, fieldName) => {
  console.log('🚀 ~ rendering AutoCompleteInput...');
  if (collectionId && finderId && fieldName) {
    const endpoint = `collection-table/${collectionId}/finder/${finderId}/items`;
    const response = await securedGetCall(endpoint);
    if (response && response.status === 200) {
      const { data: itemData } = response || '';
      let autoCompleteData = [];
      if (itemData && itemData.length > 0) {
        itemData.forEach((item, index) => {
          if (item) {
            if (Object.keys(item).length > 0) {
              autoCompleteData.push(item[fieldName]);
            }
          }
        });
        if (autoCompleteData && autoCompleteData.length) {
          /**
           * Initiate the autocompleteInput function on the component INPUT element,
           * and pass along the autoCompleteData array as possible autocomplete values:
           * */
          let automCompleteInputElem = element.querySelector(
            'input[gjs-type="autocomplete-input"]',
          );
          if (!automCompleteInputElem) {
            automCompleteInputElem = element.querySelector('input');
          }
          if (automCompleteInputElem) {
            autocompleteInput(automCompleteInputElem, autoCompleteData);
          }
        }
      }
    }
  }
};

const renderPageListComponent = async (element) => {
  console.log('*** rendering Page List component...');
  const endpoint = `projects/pages`;
  try {
    const placeholderItem = createContentPlaceholder(1, element.id, element.className);
    element.innerHTML = placeholderItem;
    const response = await securedGetCall(endpoint);
    if (response && response.status === 200) {
      const { data: pages } = response || '';
      element.innerHTML = '';
      const pageNavUlElem = document.createElement('ul');
      pages.map((page, index) => {
        const { name, slug } = page;
        let pageNumber = index + 1;
        let pageNavLiElem = document.createElement('li');
        pageNavLiElem.classList.add('page-nav-li', 'list-inline-item');
        let pageNavLinkElem = document.createElement('a');
        pageNavLinkElem.href = `/${slug}`;
        pageNavLinkElem.classList.add('page-nav-link');
        pageNavLinkElem.classList.add(`link-${pageNumber}`);
        pageNavLinkElem.textContent = name;
        pageNavLiElem.appendChild(pageNavLinkElem);
        pageNavUlElem.appendChild(pageNavLiElem);
      });
      element.appendChild(pageNavUlElem);
    }
  } catch (e) {
    console.error('Error: ', e);
  }
};

const addExternalQueryParamInUrl = (endpoint, element, itemData) => {
  const checkItContainsParam = endpoint.includes('?');
  let endpointParam = '';
  if (!checkItContainsParam) {
    endpoint = `${endpoint}?`;
  }
  const attr = element.attributes;
  const externalQueryParam = [];
  for (const key in attr) {
    const el = attr[key];
    if (typeof el === 'object' && el.name.includes('external-params-')) {
      externalQueryParam.push({ [el.name.replace('external-params-', '')]: el.value });
    }
  }
  if (externalQueryParam && externalQueryParam.length > 0) {
    externalQueryParam.forEach((param) => {
      const key = Object.keys(param);
      const paramKey = param[key];
      if (paramKey && itemData) {
        const extParamValue = itemData[paramKey];
        if (extParamValue) {
          endpointParam += `&${key}=${extParamValue}`;
        }
      }
    });
  }
  endpoint = checkItContainsParam
    ? `${endpoint}${endpointParam}`
    : `${endpoint}${endpointParam.substr(1, endpointParam.length + 1)}`;
  return endpoint;
};

const loadDynamicFilterDataIntoElements = async (isModal = false, modalHasExternalApi = false) => {
  let filterElements = window.document.querySelectorAll('[data-filter-collection]');
  if (isModal) {
    filterElements = modalHasExternalApi
      ? []
      : document.querySelectorAll('[id^=modal-container] [data-filter-collection]');
  }
  if (filterElements && filterElements.length) {
    const { itemData } = await getPageItemData();
    filterElements.forEach(async (element) => {
      const filterId = element.getAttribute('data-filter-id');
      const collection = element.getAttribute('data-filter-collection');
      let endpoint = `collection-table/${collection}/finder/${filterId}/items`;
      endpoint = addExternalQueryParamInUrl(endpoint, element, itemData);
      endpoint = await addEntityQueryToUrl(endpoint, collection, filterId);
      const response = await securedGetCall(endpoint);
      const filterResult = response.data;
      if (response) {
        if (typeof filterResult !== 'object') {
          element.textContent = filterResult;
          element.style.display = 'block';
        }
      }
    });
  }
};
const loadDynamicSelectOptions = (
  select,
  collectionField,
  finderUuid,
  workflowUuid,
  isModal = false,
  dropdownDataFrom = 'FILTER',
  currentUserCollectionField = '',
  collectionItemData = null,
  currentTenantCollectionField = '',
) => {
  if (select) {
    // if Page size dropdown
    if (select.classList.contains('pageSizeSelect') || !!select.closest('.paginationPageSize'))
      return '';
    initializeSelect2(select);
  }
  const { field, currentUserField } = loadCollectionFieldAndUserField(
    collectionField,
    currentUserCollectionField,
  );
  const currentTenantField = loadTenantField(currentTenantCollectionField);
  let storageField = '';
  if (currentUserField) {
    storageField = currentUserField;
  } else if (currentTenantField) storageField = currentTenantField;

  if (referenceOptionType.includes(field.type)) {
    if (storageField) {
      const { meta } = storageField;
      const metaFrom = meta?.from;
      if (currentOptions.includes(metaFrom)) {
        const selectElemName = select.getAttribute('name');
        if (selectElemName.startsWith(`${metaFrom}.`)) {
          const nameArr = selectElemName.split(`${metaFrom}.`);
          let customSelectName = nameArr[1];
          select.setAttribute('name', `${customSelectName}`);
        }
      }
      if (field.isMultiSelect) {
        if (!meta) {
          select.setAttribute('name', `${field.fieldName}[]`);
        }
        select.setAttribute('multiple', 'multiple');
      }
      select.setAttribute('placeholder', `Select ${field.fieldTitle.en}`);
    }
  }

  if (!isModal) {
    const formEl = select.closest('form');
    const isModalForm = formEl.closest('div[id^=modal-container-]');
    isModal = isModalForm ? true : false;
  }

  if (field) {
    if (field.type === 'static_option') {
      if (workflowUuid) {
        applyWorkflowForStaticOptions(select, workflowUuid, field, collectionItemData, isModal);
      } else {
        const staticOptionsDataMap = {
          field: field,
          select: select,
          isModal: isModal,
          collectionItemData: collectionItemData,
          workflowData: '',
          dropdownDataFrom: dropdownDataFrom,
          currentUserField: currentUserField,
        };
        staticOptions(staticOptionsDataMap);
      }
    } else if (referenceDynamicType.includes(field.type)) {
      const referenceAndDynamicOptionsDataMap = {
        field: field,
        select: select,
        finderUuid: finderUuid,
        isModal: isModal,
        collectionItemData: collectionItemData,
        queryParams: '',
        isRadioType: false,
        isSetEmpty: false,
        dropdownDataFrom: dropdownDataFrom,
        storageField,
      };
      referenceAndDynamicOptions(referenceAndDynamicOptionsDataMap);
    } else if (['template_option'].includes(field.type)) {
      tenantTemplateOptions(field, select);
    }
  }
};

const loadCollectionFieldAndUserField = (collectionField = '', currentUserCollectionField = '') => {
  let collectionFieldString = collectionField
    ? collectionField.replaceAll("'", '"').replaceAll('\\"', '"')
    : '';
  const field = collectionFieldString ? JSON.parse(collectionFieldString) : '';
  let currentUserCollectionFieldString = currentUserCollectionField
    ? currentUserCollectionField.replaceAll("'", '"').replaceAll('\\"', '"')
    : '';
  const currentUserField = currentUserCollectionFieldString
    ? JSON.parse(currentUserCollectionFieldString)
    : '';
  return { field, currentUserField };
};

const loadTenantField = (currentTenantCollectionField) => {
  let currentUserCollectionFieldString = currentTenantCollectionField
    ? currentTenantCollectionField.replaceAll("'", '"').replaceAll('\\"', '"')
    : '';
  const currentTenantField = currentUserCollectionFieldString
    ? JSON.parse(currentUserCollectionFieldString)
    : '';
  return currentTenantField;
};

const loadDynamicSelectOptionsForRadio = async (
  select,
  collectionField,
  finderUuid,
  workflowUuid,
  isModal = false,
  collectionItemData = null,
) => {
  let collectionFieldString = collectionField
    ? collectionField.replaceAll("'", '"').replaceAll('\\"', '"')
    : '';
  const field = collectionFieldString ? JSON.parse(collectionFieldString) : '';
  if (!field) return;
  if (!isModal) {
    const formEl = select.closest('form');
    const isModalForm = formEl.closest('div[id^=modal-container-]');
    isModal = isModalForm ? true : false;
  }

  if (field.type === 'static_option') {
    if (workflowUuid) {
      await applyWorkflowForStaticOptions(select, workflowUuid, field, collectionItemData, isModal);
    } else {
      staticOptionsForRadio(field, select, isModal, collectionItemData);
    }
  } else if (referenceDynamicType.includes(field.type)) {
    const referenceAndDynamicOptionsDataMap = {
      field: field,
      select: select,
      finderUuid: finderUuid,
      isModal: isModal,
      collectionItemData: collectionItemData,
      queryParams: '',
      isRadioType: true,
      isSetEmpty: true,
      dropdownDataFrom: '',
      storageField: '',
    };
    referenceAndDynamicOptions(referenceAndDynamicOptionsDataMap);
  } else if (field.type === 'boolean') {
    await booleanFieldValue(field, select, isModal, collectionItemData);
  }
};

const loadSearchFormDynamicSelectOptions = (
  select,
  collectionField,
  finderUuid,
  dropdownDataFrom = 'FILTER',
  currentUserCollectionField = '',
  currentTenantCollectionField = '',
) => {
  initializeSelect2(select);

  const field = collectionField ? JSON.parse(collectionField) : '';
  const currentUserField = currentUserCollectionField ? JSON.parse(currentUserCollectionField) : '';
  const currentTenantField = loadTenantField(currentTenantCollectionField);
  let storageField = '';
  if (currentUserField) {
    storageField = currentUserField;
  } else if (currentTenantField) storageField = currentTenantField;
  if (referenceOptionType.includes(field.type)) {
    select.setAttribute('placeholder', `Select ${field.fieldTitle.en}`);
  }

  if (field) {
    if (field.type === 'static_option') {
      const staticOptionsDataMap = {
        field: field,
        select: select,
        isModal: false,
        collectionItemData: null,
        workflowData: '',
        dropdownDataFrom: dropdownDataFrom,
        currentUserField: currentUserField,
      };
      staticOptions(staticOptionsDataMap);
    } else if (referenceDynamicType.includes(field.type)) {
      const referenceAndDynamicOptionsDataMap = {
        field: field,
        select: select,
        finderUuid: finderUuid,
        isModal: false,
        collectionItemData: null,
        queryParams: '',
        isRadioType: false,
        isSetEmpty: false,
        dropdownDataFrom: dropdownDataFrom,
        storageField,
      };
      referenceAndDynamicOptions(referenceAndDynamicOptionsDataMap);
    }
  } else if (select && select.length > 0) {
    $('#' + select.id)
      .select2({ selectionCssClass: ':all:', width: 'resolve' })
      .val('')
      .trigger('change');
  }
};

const staticOptionsForRadio = (
  field,
  select,
  isModal = false,
  collectionItemData = null,
  workflowData = null,
) => {
  let options = [`<option value="">- Select ${field.fieldTitle.en} -</option>`];
  //TODO:change this for radio
  if (workflowData) {
    const { workflowRule, itemCurrentValue } = workflowData;
    if (itemCurrentValue) {
      options = options.concat(`<option value="${itemCurrentValue}">${itemCurrentValue}</option>`);
    }
    if (workflowRule) {
      options = options.concat(
        workflowRule.nextValue.map((item) => {
          return `<option value="${item.label}">${item.label}</option>`;
        }),
      );
    }
  } else {
    const wrapElement = document.createElement('div');
    const elementId = select.parentNode.getAttribute('id');
    const idOfElement = elementId ? elementId : 'radio';
    field.staticOptions.map((item) => {
      const cloneParentElement = select.parentNode.cloneNode(true);
      cloneParentElement.setAttribute('id', `${idOfElement}-${item}`);
      const radioInputElement = cloneParentElement.getElementsByTagName('input');
      const labelElement = cloneParentElement.getElementsByTagName('label');
      const idOfRadioElement = radioInputElement[0].getAttribute('id');
      const idOfLabelElement = labelElement[0].getAttribute('id');
      const labelElemId =
        idOfLabelElement !== '' || !idOfLabelElement
          ? 'label-' + idOfRadioElement + '-' + item
          : idOfLabelElement;
      radioInputElement[0].setAttribute('value', item);
      radioInputElement[0].setAttribute('id', `${idOfRadioElement}-${item}`);
      labelElement[0].setAttribute('for', `${idOfRadioElement}-${item}`);
      labelElement[0].setAttribute('id', `${labelElemId}`);
      labelElement[0].innerText = item;
      wrapElement.appendChild(cloneParentElement);
    });
    select.parentNode.replaceWith(...wrapElement.childNodes);
  }
};

const staticOptions = async ({
  field,
  select,
  isModal,
  collectionItemData,
  workflowData,
  dropdownDataFrom,
  currentUserField,
}) => {
  const removeFieldnameInDropdownPlaceholder =
    select && select.hasAttribute('removeFieldnameInDropdownPlaceholder');
  const hasPlaceholderPattern = select && select.hasAttribute('placeholderPattern');
  const placeholderPattern =
    select && hasPlaceholderPattern ? select.getAttribute('placeholderPattern') : '';
  const fieldTitle = field.fieldTitle.en;
  let fieldPlaceholder = getFieldPlaceholder(fieldTitle, placeholderPattern);

  //Fallback to removeFieldnameInDropdownPlaceholder if placeholderPattern is not set
  if (removeFieldnameInDropdownPlaceholder) {
    fieldPlaceholder = 'Select';
  }

  let options = [`<option value="">- ${fieldPlaceholder} -</option>`];
  if (workflowData) {
    const { workflowRule, itemCurrentValue } = workflowData;
    if (itemCurrentValue) {
      options = options.concat(`<option value="${itemCurrentValue}">${itemCurrentValue}</option>`);
    }

    if (workflowRule) {
      options = options.concat(
        workflowRule.nextValue.map((item) => {
          return `<option value="${item.label}">${item.label}</option>`;
        }),
      );
    }
  } else {
    if (dropdownDataFrom !== 'NONE') {
      select.removeAttribute('data-placeholder');
      let externalApiId = '';
      let { dataset: selectDataset } = select;
      if (selectDataset && selectDataset.hasOwnProperty('externalApiId')) {
        externalApiId = selectDataset['externalApiId'];
      }
      const loadOptionsFrom = externalApiId ? 'EXTERNAL_API' : 'STATIC_OPTION';
      switch (loadOptionsFrom) {
        case 'EXTERNAL_API':
          {
            // Dropdown from External API Starts
            await loadOptionsFromExternalApiData(select, options);
          }
          break;
        default:
          {
            // Load Static Options
            options = loadOptionsFromStaticData(options, field);
          }
          break;
      }
    }
  }
  select.innerHTML = options.join('');
  await setPredefinedValuesInSelect(select, field, isModal, collectionItemData);
};

const loadTenantRoleMappingSelectOptions = (select, isModal) => {
  if (select) {
    initializeSelect2(select);
    const roles = [];
    const componentDataSet = select.dataset;
    if (componentDataSet && Object.entries(componentDataSet).length) {
      Object.entries(componentDataSet).map(([key, value], index) => {
        if (key.startsWith('role-')) {
          const order = key.replace(/role-(.*?)/g, '$1');
          roles.push({ order: Number(order), value: value });
        }
      });
    }
    select.setAttribute('placeholder', `Select Tenant Role Mapping`);
    let options = [`<option value="">- Select Role -</option>`];
    if (roles && roles.length) {
      roles
        .sort((a, b) => a.order - b.order)
        .map((role) => {
          options = options.concat(`<option value="${role.value}">${role.value}</option>`);
        });
    }
    select.innerHTML = options.join('');

    $(`#${select.id}`)
      .select2({ selectionCssClass: ':all:', width: 'resolve' })
      .val('')
      .trigger('change');

    // Swapping Select & Select2 elements to fix Validation error message alignment.
    let selectElem = document.getElementById(select.id);
    if (selectElem) {
      let select2Elem = selectElem.nextSibling;
      swapNodeElements(selectElem, select2Elem);
      validateSelectElement(select);
    }
  }
};

const addDynamicDataIntoFormElements = async (
  itemData = null,
  isModal = false,
  parentElem = '',
) => {
  if (!itemData) {
    let response = {};
    if (isModal) {
      response = await getModalItemData(itemData);
    } else {
      response = await getPageItemData();
    }
    itemData = response.itemData;
  }
  const loggedInUser = fetchLoggedInUserJson();
  const previousActionResponse = JSON.parse(sessionStorage.getItem('previousActionResponse'));
  const previousActionFormData = JSON.parse(sessionStorage.getItem('previousActionFormData'));
  const tenantItem = fetchCurrentTenantJson();
  const userSettingItem = fetchCurrentUserSettingsJson();
  const subTenantItem = fetchCurrentSubTenantJson();

  let forms = '';
  if (isModal) {
    forms = parentElem
      ? parentElem.querySelectorAll('[id^=modal-container] form')
      : document.querySelectorAll('[id^=modal-container] form');
  } else {
    forms = parentElem ? parentElem.querySelectorAll('form') : document.querySelectorAll('form');
  }
  const responseKey = 'data-form-element-previous-action-response';
  const formDataKey = 'data-form-element-previous-action-formdata';
  const collectionKey = 'data-form-element-collection';
  const sessionKey = 'data-form-element-session';
  const browserStorageFieldKey = 'data-form-element-browser-storage';
  const tenantFieldKey = 'data-form-element-session-tenant';
  const userSettingFieldKey = 'data-form-element-session-user-settings';
  const subTenantFieldKey = 'data-form-element-session-sub-tenant';
  const queryParamsFieldKey = 'data-form-element-query-params';
  const bslKey = 'data-form-element-bsl';
  const bslPathKey = 'data-form-element-bslp';
  for (const form of forms) {
    const collectionFormElements = form.querySelectorAll(`[${collectionKey}]`);
    const sessionFormElements = form.querySelectorAll(`[${sessionKey}]`);
    const prevActionResponseFormElements = form.querySelectorAll(`[${responseKey}]`);
    const prevActionFormDataFormElements = form.querySelectorAll(`[${formDataKey}]`);
    const browserStorageElems = form.querySelectorAll(`[${browserStorageFieldKey}]`);
    const tenantFieldElems = form.querySelectorAll(`[${tenantFieldKey}]`);
    const userSettingFieldElems = form.querySelectorAll(`[${userSettingFieldKey}]`);
    const subTenantFieldElems = form.querySelectorAll(`[${subTenantFieldKey}]`);
    const queryParamsFieldElems = form.querySelectorAll(`[${queryParamsFieldKey}]`);
    const bslFieldElems = form.querySelectorAll(`[${bslKey}]`);
    sessionFormElements.forEach((sessionElement) => {
      const fieldName = sessionElement.getAttribute(sessionKey);
      const fieldValue =
        loggedInUser && fieldName ? parseValueFromData(loggedInUser, fieldName) : '';
      insertFormElementValue(fieldValue, sessionElement);
    });
    for (const collectionElement of collectionFormElements) {
      let fieldName = collectionElement.getAttribute(collectionKey);
      //Override Field name based on Response Mapping for Non-Persistent Data
      // fieldName = checkAndOverrideFieldForNonPersistentCollection(itemData, fieldName);
      let fieldValue = itemData && fieldName ? parseValueFromData(itemData, fieldName) : '';
      if (!fieldValue && collectionElement.type === 'number') {
        fieldValue = '0';
      }
      if (fieldValue && fieldValue !== 'undefined') {
        insertFormElementValue(fieldValue, collectionElement);
        if (isModal) {
          if (collectionElement.tagName === 'SELECT') {
            setPredefinedValuesInSelect(collectionElement, '', isModal, itemData);
          } else {
            const collectionFieldObj = collectionElement.getAttribute('data-collection-field')
              ? collectionElement.getAttribute('data-collection-field')
              : '';
            const field = collectionFieldObj ? JSON.parse(collectionFieldObj) : '';
            if (field && field.type === 'boolean') {
              await booleanFieldValue(field, collectionElement, isModal, itemData);
            }
          }
        }
      }
    }
    tenantFieldElems.forEach((tenantFieldElement) => {
      const fieldName = tenantFieldElement.getAttribute(tenantFieldKey);
      const fieldValue = tenantItem && fieldName ? parseValueFromData(tenantItem, fieldName) : '';
      insertFormElementValue(fieldValue, tenantFieldElement);
    });
    userSettingFieldElems.forEach((userSettingFieldElement) => {
      const fieldName = userSettingFieldElement.getAttribute(userSettingFieldKey);
      const fieldValue =
        userSettingItem && fieldName ? parseValueFromData(userSettingItem, fieldName) : '';
      insertFormElementValue(fieldValue, userSettingFieldElement);
    });
    subTenantFieldElems.forEach((subTenantFieldElement) => {
      const fieldName = subTenantFieldElement.getAttribute(subTenantFieldKey);
      const fieldValue =
        subTenantItem && fieldName ? parseValueFromData(subTenantItem, fieldName) : '';
      insertFormElementValue(fieldValue, subTenantFieldElement);
    });
    replaceSessionDataIntoForm(prevActionResponseFormElements, previousActionResponse, responseKey);
    replaceSessionDataIntoForm(prevActionFormDataFormElements, previousActionFormData, formDataKey);
    replaceBrowserStorageDataIntoForm(browserStorageElems, browserStorageFieldKey);
    replaceQueryParamsDataIntoForm(queryParamsFieldElems);
    renderBSLDataIntoFormElements(bslFieldElems, bslKey, bslPathKey);
  }
};

const replaceSessionDataIntoForm = (sessionResponseFormData, previousActionFormData, key) => {
  sessionResponseFormData.forEach((element) => {
    const fieldName = element.getAttribute(key);
    let fieldNamesArr = fieldName ? fieldName.trim().split('|') : [];
    let isSessionValueEmpty = true;
    fieldNamesArr.forEach((fieldName) => {
      if (fieldName && isSessionValueEmpty) {
        let fieldValue = previousActionFormData
          ? _.get(previousActionFormData, fieldName.trim())
          : '';
        if (fieldValue && fieldValue !== 'undefined' && fieldValue !== 'null') {
          isSessionValueEmpty = false;
          insertFormElementValue(fieldValue, element);
        }
      }
    });
  });
};

const replaceBrowserStorageDataIntoForm = (browserStorageElems, key) => {
  browserStorageElems.forEach((element) => {
    const fieldName = element.getAttribute(key);
    let storageData = getEntityItemFromElem(element);
    if (fieldName) {
      let fieldValue = storageData ? parseValueFromData(storageData, fieldName.trim()) : '';
      if (fieldValue && fieldValue !== 'undefined' && fieldValue !== 'null') {
        insertFormElementValue(fieldValue, element);
      }
    }
  });
};
const getEntityItemFromElem = (element) => {
  const browserStorageKey = 'data-storage-key';
  const storageKey = element.getAttribute(browserStorageKey);
  if (!storageKey) return '';
  let storageData = parseLSJSONStrToJSON(storageKey);
  return storageData;
};

const replaceQueryParamsDataIntoForm = (queryParamsElement) => {
  try {
    if (!queryParamsElement || !queryParamsElement.length) {
      return;
    }
    const urlParams = getURLParams();
    if (!urlParams) return;
    queryParamsElement.forEach((queryElement) => {
      const paramName = queryElement.getAttribute('data-form-element-query-params');
      if (paramName) {
        const trimmedParamName = paramName.trim();
        if (trimmedParamName && urlParams.hasOwnProperty(trimmedParamName)) {
          let paramValue = urlParams[trimmedParamName];
          if (paramValue && paramValue !== 'undefined' && paramValue !== 'null') {
            insertFormElementValue(paramValue, queryElement);
          } else {
            console.warn('Param value is invalid:', paramValue);
          }
        } else {
          console.warn('Param name not found in URL:', trimmedParamName);
        }
      } else {
        console.warn(
          'Element does not have the expected data-form-element-query-params attribute.',
        );
      }
    });
  } catch (error) {
    console.error('Error in replaceQueryParamsDataIntoForm:', error);
  }
};

const getURLParams = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const paramObject = {};
    for (let [key, value] of params.entries()) {
      paramObject[key] = value;
    }
    return paramObject;
  } catch (error) {
    console.error('Error while getting URL Params', error);
    return null;
  }
};

const insertFormElementValue = (data, element) => {
  let formEl = element.closest('form');
  let isModal = false;
  const isModalForm = formEl.closest('[id^=modal-container]');
  isModal = isModalForm ? true : false;
  let field = '';
  if (isModal) {
    const collectionFieldObj = element.getAttribute('data-collection-field')
      ? element.getAttribute('data-collection-field')
      : '';
    field = collectionFieldObj ? JSON.parse(collectionFieldObj) : '';
  }
  if (isCheckbox(element)) {
    if (data && Array.isArray(data) && data.length && typeof data[0] === 'string')
      data = data.join(',');
    if (data && !['boolean', 'object'].includes(typeof data) && data.includes(',')) {
      const dataArr = data.split(',');
      if (dataArr && dataArr.includes(element.value)) {
        element.checked = true;
      }
    } else if (data && truthyValues.includes(element.value) === data) {
      element.checked = true;
    } else if (isModal) {
      if (field && field.type === 'reference') {
        let itemDataValue = data.uuid;
        if (data && Array.isArray(data)) {
          itemDataValue = data.find((dataValue) => dataValue.uuid === element.value);
          if (itemDataValue && element.value === itemDataValue.uuid) {
            element.checked = true;
          }
        } else {
          if (itemDataValue && element.value === itemDataValue) {
            element.checked = true;
          }
        }
      }
    }
  } else if (isRadio(element)) {
    if (data && Array.isArray(data) && data.length === 1) data = data[0];
    if (data && element.value === data) {
      element.checked = true;
    } else if (isModal) {
      if (field && field.type === 'reference') {
        let itemDataValue = data.uuid;
        if (data && Array.isArray(data)) {
          itemDataValue = data.find((dataValue) => dataValue.uuid === element.value);
          if (itemDataValue && element.value === itemDataValue.uuid) {
            element.checked = true;
          }
        } else {
          if (itemDataValue && element.value === itemDataValue) {
            element.checked = true;
          }
        }
      }
    }
  } else if (element.type === 'file') {
    let fileDisplay = element.parentElement.getElementsByClassName('file-list-display')[0];
    if (data && typeof data === 'object') {
      fileDisplay.innerHTML = data.originalName;
    }
    if (data && Array.isArray(data)) {
      const fileNameList = data.map((file) => {
        return file.originalName ? file.originalName : '';
      });
      fileDisplay.innerHTML = fileNameList.join(',');
    }
    const hiddenElement = element.parentElement.querySelector(
      `input[name="${element.name}"][type='hidden']`,
    );
    hiddenElement.value = typeof data === 'object' ? JSON.stringify(data) : '';
  } else if (['date', 'datetime-local'].includes(element.type)) {
    const isDate = element.type === 'date';
    const sourceDateFormat = element.getAttribute('sourcedateformat');
    if (isDate) {
      element.type = 'text';
    }
    element.value = data;
    addFlatPickerToElement(element, sourceDateFormat);
  } else if (element.tagName === 'SELECT') {
    let value = setSelectedOnDropdown(data);
    const selectOptions = { selectionCssClass: ':all:', width: 'resolve' };
    const formElem = element.closest('form');
    const isSearchForm = formElem.getAttribute('data-gjs') === 'search-form';
    if (isSearchForm) {
      selectOptions['multiple'] = false;
    } else if (field) {
      selectOptions['multiple'] = field.isMultiSelect;
    } else if (element.type === 'select-multiple') {
      selectOptions['multiple'] = true;
    } else if (value && Array.isArray(value)) {
      selectOptions['multiple'] = value.length > 1;
    } else if (value && value.includes(',') && Array.isArray(value.split(','))) {
      selectOptions['multiple'] = value.split(',').length > 0;
    }

    if (!element.hasAttribute('date-segregated')) {
      value = processSelectOptionValue(selectOptions['multiple'], value);
      $(element).select2(selectOptions).val(value).trigger('change');
    } else if (
      element.hasAttribute('date-segregated') &&
      element.hasAttribute('data-component-type') &&
      element.getAttribute('data-component-type') === 'date'
    ) {
      const formSegregateDateElements = formEl.querySelectorAll(
        'select[data-component-type=date][date-segregated]',
      );
      value = processSelectOptionValue(selectOptions['multiple'], value);

      const dateFormat = 'YYYY-MM-DD';
      const datenTime = getDateTimeFormat(dateFormat, false);
      let dateValue = value || '';
      const projectDateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
      if (projectDateFormat !== dateFormat)
        dateValue = moment(dateValue, projectDateFormat).format(dateFormat);
      const parsedDateValue = dateValue ? flatpickr.parseDate(dateValue, datenTime) : '';
      const day = parsedDateValue ? parsedDateValue.getDate() : '';
      const month = parsedDateValue ? parsedDateValue.getMonth() + 1 : '';
      const year = parsedDateValue ? parsedDateValue.getFullYear() : '';

      // Set the value based on the date-segregated attribute
      // If date-segregated is not set, use the original dateValue
      if (element.getAttribute('date-segregated') === 'day') {
        value = day;
      } else if (element.getAttribute('date-segregated') === 'month') {
        value = month;
      } else if (element.getAttribute('date-segregated') === 'year') {
        value = year;
      } else {
        value = dateValue;
      }
      element.setAttribute('data-date-segregated-value', value);
      $(element).select2(selectOptions).val(value).trigger('change');
    }

    // value = processSelectOptionValue(selectOptions['multiple'], value);
    // $(element).select2(selectOptions).val(value).trigger('change');
  } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('data-show-editor')) {
    $(element).summernote('code', data);
  } else if ($(element).attr('type') === 'tel') {
    $(element).intlTelInput();
    $(element).intlTelInput('setNumber', data);
  } else if (
    element.getAttribute('type') === 'text' &&
    element.getAttribute('flat-picker-date-type') === 'datetime-local'
  ) {
    element.type = 'datetime-local';
    element.value = data;
    addFlatPickerToElement(element);
  } else if (
    element.getAttribute('type') === 'text' &&
    element.getAttribute('flat-picker-date-type') === 'date'
  ) {
    const sourceDateFormat = element.getAttribute('sourcedateformat');
    element.value = data;
    addFlatPickerToElement(element, sourceDateFormat);
  } else if (
    element.getAttribute('type') === 'text' &&
    element.getAttribute('data-component-type') === 'time_picker'
  ) {
    element.value = data;
    addTimePickerToElement(element, data);
  } else {
    if (!data || data == 'undefined' || data === 'undefined') {
      data = data === 0 ? 0 : '';
    }
    element.value = data;
  }
};

// Browser Storage Location Data Into Form Elements
const renderBSLDataIntoFormElements = (sessionAttrElems, bslKey, bslPath) => {
  if (sessionAttrElems) {
    (async () => {
      for (const element of sessionAttrElems) {
        //TODO: this style is temporary solution to show hidden element which we hide on project build->
        const isParentDataGroup = !!element.closest(`[data-js="data-group"]`);
        if (!isParentDataGroup) {
          let bslDataValue = '';
          const bslKeyValue = element.getAttribute(bslKey);
          const bslPathValue = element.getAttribute(bslPath);
          let browserStorageData = await getBSLData(bslKeyValue);
          if (browserStorageData) {
            bslDataValue =
              browserStorageData && bslPathValue
                ? _.get(browserStorageData, bslPathValue.trim())
                : '';
          }
          if (bslDataValue && bslDataValue !== 'undefined' && bslDataValue !== 'null') {
            insertFormElementValue(bslDataValue, element);
          }
        }
      }
    })();
  }
};

const collectionFormDetailForUpdate = (form, item) => {
  form.method = 'put';
  form.setAttribute('action', form.getAttribute('action') + '/' + item.uuid);
};
const isCheckbox = (element) => element.type === 'checkbox';
const isRadio = (element) => element.type === 'radio';
const isMultiSelect = (element) => element.options && element.multiple;
const timestampToDatetimeInputString = (timestamp) => {
  const date = new Date(timestamp + _getTimeZoneOffsetInMs());
  // slice(0, 19) includes seconds
  return date.toISOString().slice(0, 19);
};

const applyWorkflowForStaticOptions = async (
  select,
  workflowUuid,
  field,
  collectionItemData,
  isModal,
) => {
  let selectedWorkflow;
  let workflowData = {};
  let { collectionItemId, collectionId } = extractCollectionAndItemIdFromPath();
  const response = await getPageItemData();
  let itemData = response.itemData;
  collectionItemId = response.collectionItemId;
  collectionId = response.collectionId;
  if (!collectionId) {
    collectionId = select.closest('form').getAttribute('data-form-collection');
  }

  const workflowUrl = `collection-details/${collectionId}/name`;
  await publicGetCall(workflowUrl).then((response) => {
    if (response.data && response.data.workflows) {
      const { workflows } = response.data;
      selectedWorkflow = workflows.filter((wf) => wf.uuid === workflowUuid)[0];
      if (selectedWorkflow) {
        workflowData.selectedWorkflow = selectedWorkflow;
        const { workflowRules } = selectedWorkflow;
        const itemCurrentValue =
          itemData && itemData[selectedWorkflow.keyField.value]
            ? itemData[selectedWorkflow.keyField.value].join('')
            : '';

        if (itemCurrentValue) {
          fetchWorkflowRuleForItemValue(workflowData, workflowRules, itemCurrentValue);
        } else {
          fetchWorkflowRuleForEmptyItemValue(workflowData, workflowRules);
        }
        workflowData.itemCurrentValue = itemCurrentValue;
      }
    }
  });
  const staticOptionsDataMap = {
    field: field,
    select: select,
    isModal: isModal,
    collectionItemData: collectionItemData,
    workflowData: workflowData,
    dropdownDataFrom: '',
    currentUserField: '',
  };
  staticOptions(staticOptionsDataMap);
};

const fetchWorkflowRuleForItemValue = (workflowData, workflowRules, itemCurrentValue) => {
  workflowData.workflowRule = workflowRules.filter(
    (wfr) =>
      wfr.currentValue &&
      wfr.currentValue.label === itemCurrentValue &&
      wfr.role &&
      isLoggedInUserRole(`${wfr.role.value}`),
  )[0];
  if (!workflowData.workflowRule) {
    workflowData.workflowRule = workflowRules.filter(
      (wfr) => !wfr.role && wfr.currentValue && wfr.currentValue.label === itemCurrentValue,
    )[0];
  }
};

const fetchWorkflowRuleForEmptyItemValue = (workflowData, workflowRules) => {
  workflowData.workflowRule = workflowRules.filter(
    (wfr) => !wfr.currentValue && wfr.role && isLoggedInUserRole(`${wfr.role.value}`),
  )[0];

  if (!workflowData.workflowRule) {
    workflowData.workflowRule = workflowRules.filter((wfr) => !wfr.currentValue && !wfr.role)[0];
  }
};

const extractCollectionAndItemIdFromPath = () => {
  let collectionId = '';
  let collectionItemId = '';
  const pathArray = window.location.pathname.split('/');
  collectionId = pathArray[pathArray.length - 2];
  collectionItemId = pathArray[pathArray.length - 1];
  if (collectionItemId && collectionItemId.includes('_')) {
    collectionItemId = collectionItemId.split('_')[1];
  }
  return { collectionItemId, collectionId };
};

const doProcessForCollectionData = async (collectionItemId, collectionId) => {
  let result = {};
  const derivedFieldMapping = getCookie('derivedFieldMapping');
  if (collectionId && collectionItemId) {
    if (collectionItemId.includes('_')) {
      collectionItemId = collectionItemId.split('_')[1];
    }
    let itemData = {};
    if (collectionId !== 'reset-password') {
      const collectionItemData = await getCollectionItemByIdDetailsPage(
        collectionId,
        collectionItemId,
        true,
        derivedFieldMapping,
      );
      itemData = collectionItemData ? { ...collectionItemData } : {};
    }
    result = { itemData, collectionId, collectionItemId };
  }
  return result;
};

const doProcessForNonPersistentData = async (collectionItemId, collectionId, externalApiData) => {
  let result = {};
  let data = {};
  let response = {};
  let itemData = {};
  let externalApiEndpoint = 'external-api';
  const {
    id: externalApiId,
    uniqueKey,
    itemPath,
    dataFrom,
    responseMapping,
    requestMapping,
  } = externalApiData;

  //Passing Item Id in External API URL
  if (collectionItemId) {
    let itemId = collectionId ? collectionItemId : uuidv4(16);
    itemId = replaceUnderscoreWithSlash(itemId);

    data['externalApiItem'] = {
      id: itemId,
      uuid: itemId,
      _data_source_rest_api_primary_id: itemId,
      uniqueKey: uniqueKey,
      pageCollectionName: collectionId,
      nonPersistentCollectionItemId: itemId,
    };
    if (requestMapping && requestMapping.length > 0) {
      requestMapping.forEach((reqMap) => {
        if (reqMap.value == 'uuid') {
          data['externalApiItem'][reqMap.key] = itemId;
        }
      });
    }
  }

  // Get Browser Storage Data Object
  const browserData = await getBrowserData();
  let body = {
    data,
    externalApiId: externalApiId,
    browserStorageDTO: browserData,
  };
  try {
    response = await unSecuredPostCall(body, externalApiEndpoint);
    if (response.status === 200 || response.status == 'success') {
      if (response.data) {
        const isItemPathExist = _.has(response.data, itemPath);
        const responseData = isItemPathExist ? response.data[itemPath] : response.data;
        if (responseData && !Array.isArray(responseData)) {
          let responseDataArr = [];
          responseDataArr.push(responseData);

          itemData =
            responseDataArr && responseDataArr.length
              ? responseDataArr.find((responseData) => responseData[uniqueKey] == collectionItemId)
              : {};

          //Fallback check #1
          if (typeof itemData === 'undefined') {
            //Handling response in case of JSON Objects
            const isNested = Object.keys(responseData).some(function (key) {
              return responseData[key] && typeof responseData[key] === 'object';
            });

            if (isNested) {
              responseDataArr = Object.keys(responseData).map((key) => {
                return responseData[key] ? responseData[key] : '';
              });

              itemData =
                responseDataArr && responseDataArr.length
                  ? responseDataArr.find(
                      (responseData) => responseData[uniqueKey] == collectionItemId,
                    )
                  : {};
            }
          }
          //Fallback check #2
          if (typeof itemData === 'undefined') {
            itemData = responseDataArr && responseDataArr.length ? responseData : {};
          }
        } else {
          itemData =
            responseData && responseData.length
              ? responseData.find((responseData) => responseData[uniqueKey] == collectionItemId)
              : {};
        }
      }
    }
  } catch (error) {
    console.error('%c==> error :>> ', 'color:red', error);
  }

  const newItemData = buildItemData(itemData, responseMapping, collectionItemId, uniqueKey);
  result = { itemData: newItemData, collectionId, collectionItemId };
  return result;
};

const initialiseExternalApiData = (externalAPIData, externalApiData) => {
  const { uuid, responseDataMapping, bodyDataFrom, collectionMapping } = externalAPIData;
  const { itemPath } = responseDataMapping ? responseDataMapping : '';
  const { selectedMapping } = responseDataMapping ? responseDataMapping : '';
  let uniqueItemKey = '';

  if (selectedMapping) {
    uniqueItemKey = selectedMapping['_data_source_rest_api_primary_id']
      ? selectedMapping['_data_source_rest_api_primary_id']
      : '';
  }

  externalApiData['id'] = uuid;
  externalApiData['uniqueKey'] = uniqueItemKey ? uniqueItemKey : 'id';
  externalApiData['itemPath'] = itemPath;
  externalApiData['dataFrom'] = bodyDataFrom;
  externalApiData['responseMapping'] = responseDataMapping;
  externalApiData['requestMapping'] = collectionMapping;
};

const initialiseExternalApiDataFromSpan = (externalAPISpan, externalApiData) => {
  let externalApiId = '';
  let externalApiUniqueKey = '';
  let externalApiItemPath = '';
  let externalApiDataFrom = '';
  let externalApiResponseMapping = '';
  let externalApiResponseMappingJson = '';
  let externalApiRequestMapping = '';
  let externalApiRequestMappingJson = '';

  externalApiId = externalAPISpan.getAttribute('data-external-api-id')
    ? externalAPISpan.getAttribute('data-external-api-id').trim()
    : '';
  externalApiUniqueKey = externalAPISpan.getAttribute('data-external-api-unique-key')
    ? externalAPISpan.getAttribute('data-external-api-unique-key').trim()
    : '';
  externalApiItemPath = externalAPISpan.getAttribute('data-external-api-item-path')
    ? externalAPISpan.getAttribute('data-external-api-item-path').trim()
    : '';
  externalApiDataFrom = externalAPISpan.getAttribute('data-external-api-data-from')
    ? externalAPISpan.getAttribute('data-external-api-data-from').trim()
    : '';

  externalApiResponseMapping = externalAPISpan.getAttribute('data-external-api-response-mapping')
    ? externalAPISpan.getAttribute('data-external-api-response-mapping').trim()
    : '';
  externalApiRequestMapping = externalAPISpan.getAttribute('data-external-api-request-mapping')
    ? externalAPISpan.getAttribute('data-external-api-request-mapping').trim()
    : '';

  externalApiResponseMapping = externalApiResponseMapping
    ? externalApiResponseMapping.replace(/'/g, '"')
    : '';

  externalApiRequestMapping = externalApiRequestMapping
    ? externalApiRequestMapping.replace(/'/g, '"')
    : '';

  externalApiResponseMappingJson = externalApiResponseMapping
    ? JSON.parse(externalApiResponseMapping)
    : '';

  externalApiRequestMappingJson = externalApiRequestMapping
    ? JSON.parse(externalApiRequestMapping)
    : '';

  externalApiData['id'] = externalApiId;
  externalApiData['uniqueKey'] = externalApiUniqueKey;
  externalApiData['itemPath'] = externalApiItemPath;
  externalApiData['dataFrom'] = externalApiDataFrom;
  externalApiData['responseMapping'] = externalApiResponseMappingJson;
  externalApiData['requestMapping'] = externalApiRequestMappingJson;
};

const buildItemData = (itemData, responseMapping, collectionItemId, uniqueKey) => {
  let newItemData = {};
  let responseMappingTranspose = [];

  responseMapping &&
    Object.keys(responseMapping).map((obj) => {
      const key = obj;
      const value = responseMapping[obj];
      if (value && typeof value === 'object') {
        if (responseMappingTranspose[key]) {
          responseMappingTranspose[key].push(value);
        } else {
          responseMappingTranspose[key] = value;
        }
      } else {
        if (responseMappingTranspose[value]) {
          responseMappingTranspose[value].push(key);
        } else {
          responseMappingTranspose[value] = [key];
        }
      }
    });

  if (responseMappingTranspose) {
    if (itemData) {
      Object.keys(itemData).map((itemKey) => {
        if (responseMappingTranspose[itemKey]) {
          let transposedData = responseMappingTranspose[itemKey];
          if (transposedData && transposedData.length > 1) {
            transposedData.map((transposedDataKey) => {
              newItemData[transposedDataKey] = itemData[itemKey];
            });
          } else {
            if (
              transposedData &&
              typeof transposedData === 'object' &&
              !Array.isArray(transposedData)
            ) {
              const { dataSourceField, refCollectionField } = transposedData || {};

              if (dataSourceField) {
                const itemDatasourceFieldObjKey = `${itemKey}.${dataSourceField}`;
                const isDatasourceFieldPropExist = _.has(itemData, itemDatasourceFieldObjKey);
                const itemRefCollectionFieldObjKey = `${itemKey}.${refCollectionField}`;
                const isRefCollectionPropExist = _.has(itemData, itemRefCollectionFieldObjKey);
                if (isDatasourceFieldPropExist) {
                  const itemKeyValue = itemData[itemKey];
                  newItemData[itemKey] = itemKeyValue;
                  const itemDatasourcePropKeyValue = _.get(itemData, itemDatasourceFieldObjKey);
                  if (!isRefCollectionPropExist) {
                    itemKeyValue[refCollectionField] = itemDatasourcePropKeyValue;
                    newItemData[itemKey] = itemKeyValue;
                  }
                } else {
                  newItemData[itemKey] = '';
                }
              } else {
                newItemData[transposedData[0]] = itemData[itemKey];
              }
            } else {
              newItemData[transposedData[0]] = itemData[itemKey];
            }
          }
        }
      });
      //Handling Reference Fields in Non-Persistent Data
      Object.keys(responseMappingTranspose)
        .filter((responseMapKey) => responseMapKey.includes('.') || responseMapKey.includes('['))
        .map((responseMapKey) => {
          let transposedRefData = responseMappingTranspose[responseMapKey];
          if (transposedRefData && transposedRefData.length > 1) {
            transposedRefData.map((transposedRefDataKey) => {
              let value = _.get(itemData, responseMapKey);
              newItemData[transposedRefDataKey] = value;
            });
          } else {
            let value = _.get(itemData, responseMapKey);
            newItemData[transposedRefData[0]] = value;
          }
        });
    }
  } else {
    newItemData = itemData;
  }

  if (!newItemData['uuid']) {
    newItemData['uuid'] =
      uniqueKey && itemData && itemData.hasOwnProperty(uniqueKey)
        ? itemData[uniqueKey]
        : collectionItemId;
  }
  if (!newItemData['_data_source_rest_api_primary_id']) {
    newItemData['_data_source_rest_api_primary_id'] =
      uniqueKey && itemData && itemData.hasOwnProperty(uniqueKey)
        ? itemData[uniqueKey]
        : collectionItemId;
  }
  if (!newItemData['isNonPersistentCollection']) {
    newItemData['isNonPersistentCollection'] = true;
  }
  if (!newItemData['nonPersistentCollectionResponseMapping']) {
    newItemData['nonPersistentCollectionResponseMapping'] = responseMapping;
  }

  return newItemData;
};

const checkAndOverrideFieldForNonPersistentCollection = (itemData, fieldName) => {
  if (itemData.hasOwnProperty('isNonPersistentCollection') && itemData.isNonPersistentCollection) {
    if (itemData.hasOwnProperty('nonPersistentCollectionResponseMapping')) {
      let externalAPIResponseMapField = itemData.nonPersistentCollectionResponseMapping[fieldName];
      if (externalAPIResponseMapField && externalAPIResponseMapField.includes('.')) {
        fieldName = externalAPIResponseMapField;
      }
    }
  }
  return fieldName;
};

async function loadOptionsFromExternalApiData(select, options) {
  // Dropdown from External API Starts
  let externalApiId = '';
  let externalApiField = '';
  let externalApiFieldLabel = '';
  let externalAPIData = {};
  let result = {};
  let response = {};
  let data = {};
  let finalSessionValue = {};
  let previousFormData = {};
  let collectionItemId = '';
  let fromTargetElem = false;
  let sessionStorageValue = {};
  let localStorageValue = {};
  let cookiesValue = {};

  let { dataset: selectDataset } = select;
  if (selectDataset && selectDataset.hasOwnProperty('externalApiId')) {
    externalApiId = selectDataset['externalApiId'];
  }
  if (selectDataset && selectDataset.hasOwnProperty('externalApiField')) {
    externalApiField = selectDataset['externalApiField'];
  }
  if (selectDataset && selectDataset.hasOwnProperty('externalApiFieldLabel')) {
    externalApiFieldLabel = selectDataset['externalApiFieldLabel'];
  }

  let externalApiEndpoint = 'external-api';
  const externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${externalApiId}`);
  if (externalAPIResult && externalAPIResult.status === 200) {
    externalAPIData = externalAPIResult.data;
    fromTargetElem = !!collectionItemId;
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    if (previousActionResponse) {
      previousActionResponse = JSON.parse(previousActionResponse);

      if (Object.keys(previousActionResponse).length > 0) {
        finalSessionValue = getFinalSessionValues(
          finalSessionValue,
          previousActionResponse,
          externalAPIData,
          'current_session',
        );
      }
    }
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    if (previousActionFormData) {
      previousActionFormData = JSON.parse(previousActionFormData);

      if (Object.keys(previousActionFormData).length > 0) {
        previousFormData = getFinalSessionValues(
          previousFormData,
          previousActionFormData,
          externalAPIData,
          'form_data_session',
        );
      }
    }

    sessionStorageValue = await getBrowserStorageValuesForExternalAPI(
      sessionStorageValue,
      externalAPIData,
      'SESSION_STORAGE',
    );
    localStorageValue = await getBrowserStorageValuesForExternalAPI(
      localStorageValue,
      externalAPIData,
      'LOCAL_STORAGE',
    );
    cookiesValue = await getBrowserStorageValuesForExternalAPI(
      cookiesValue,
      externalAPIData,
      'COOKIES',
    );

    const browserStorageData = {
      sessionStorageData: sessionStorageValue,
      localStorageData: localStorageValue,
      cookiesData: cookiesValue,
    };

    checkAndLoadNonPersistentItemIdForSelect(data, externalAPIData, fromTargetElem);

    let body = {
      data,
      externalApiId: externalApiId,
      sessionValue: finalSessionValue,
      sessionFormValue: previousFormData,
      browserStorageDTO: browserStorageData,
    };
    result = await unSecuredPostCall(body, externalApiEndpoint);
    response.status = 'success';
    let externalApiResponseData = null;
    if (result && result.status === 200) {
      externalApiResponseData = result.data;
    }
    if (externalApiResponseData) {
      const { responseDataMapping } = externalAPIData || {};
      const { selectedMapping } = responseDataMapping || {};
      let mappedFieldName = extractNameFromExternalApiResponseMapping(
        selectedMapping,
        externalApiField,
      );
      let mappedFieldLabelName = extractNameFromExternalApiResponseMapping(
        selectedMapping,
        externalApiFieldLabel,
      );

      const isResponseInArray = Array.isArray(externalApiResponseData);
      if (!isResponseInArray) {
        const isPropertyExist = _.has(externalApiResponseData[0], mappedFieldName);
        const externalAPIDropdownOptions =
          isPropertyExist &&
          Object.values(externalApiResponseData).map((item) => {
            if (_.has(item, mappedFieldName)) {
              let itemData = _.get(item, mappedFieldName);
              let itemLabelData = itemData;
              if (externalApiFieldLabel && _.has(item, mappedFieldName)) {
                itemLabelData = _.get(item, mappedFieldLabelName);
              }
              let itemValue = itemData;
              let itemLabel = itemLabelData;

              if (itemData && typeof itemData === 'string' && itemData.includes('::')) {
                const itemArr = itemData.split('::');
                if (itemArr && itemArr.length === 2) {
                  itemValue = itemArr[0].trim();
                  itemLabel = itemArr[1].trim();
                }
              }
              if (itemLabel) {
                return `<option value="${itemValue}">${itemLabel}</option>`;
              }
            }
          });
        if (externalAPIDropdownOptions && externalAPIDropdownOptions.length) {
          options.push(externalAPIDropdownOptions);
        }
      } else {
        const isPropertyExist = _.has(externalApiResponseData[0], mappedFieldName);
        const externalAPIDropdownOptions =
          isPropertyExist &&
          externalApiResponseData &&
          externalApiResponseData.length &&
          externalApiResponseData.map((item) => {
            if (_.has(item, mappedFieldName)) {
              let itemData = _.get(item, mappedFieldName);
              let itemLabelData = itemData;
              if (externalApiFieldLabel && _.has(item, mappedFieldName)) {
                itemLabelData = _.get(item, mappedFieldLabelName);
              }
              let itemValue = itemData;
              let itemLabel = itemLabelData;

              if (itemData && typeof itemData === 'string' && itemData.includes('::')) {
                const itemArr = itemData.split('::');
                if (itemArr && itemArr.length === 2) {
                  itemValue = itemArr[0].trim();
                  itemLabel = itemArr[1].trim();
                }
              }
              if (itemLabel) {
                return `<option value="${itemValue}">${itemLabel}</option>`;
              }
            }
          });
        if (externalAPIDropdownOptions && externalAPIDropdownOptions.length) {
          options.push(externalAPIDropdownOptions);
        }
      }
    }
  }
}

function loadOptionsFromStaticData(options, field) {
  options = options.concat(
    field.staticOptions.map((item) => {
      let itemValue = item;
      let itemLabel = item;

      if (item && item.includes('::')) {
        const itemArr = item.split('::');
        if (itemArr && itemArr.length === 2) {
          itemValue = itemArr[0].trim();
          itemLabel = itemArr[1].trim();
        }
      }
      return `<option value="${itemValue}">${itemLabel}</option>`;
    }),
  );
  return options;
}

function _getTimeZoneOffsetInMs() {
  return new Date().getTimezoneOffset() * -60 * 1000;
}

const setPredefinedValuesInSelect = async (
  select,
  field,
  isModal = false,
  collectionItemData = null,
) => {
  let currentUserField = '';
  let fieldName = select.getAttribute('data-form-element-collection');
  const isAutocomplete = select.getAttribute('data-select-autocomplete');
  let hasExternalAPI = false;
  hasExternalAPI = select.dataset && select.dataset.hasOwnProperty('externalApiId');

  if (hasExternalAPI) {
    if (select.dataset && select.dataset.hasOwnProperty('externalApiField')) {
      fieldName = select.dataset['externalApiField'];
    }
  }

  if (isAutocomplete) {
    return;
  }
  if (!field) {
    const collectionFieldObj = select.getAttribute('data-collection-field')
      ? select.getAttribute('data-collection-field')
      : '';
    field = collectionFieldObj ? JSON.parse(collectionFieldObj) : '';
    const currentUserFieldObj = select.getAttribute('data-user-collection-field')
      ? select.getAttribute('data-user-collection-field')
      : '';
    currentUserField = currentUserFieldObj ? JSON.parse(currentUserFieldObj) : '';
  }

  let fieldValue = '';
  if (fieldName) {
    let response = {};
    if (isModal) {
      response['itemData'] = collectionItemData
        ? collectionItemData
        : MODAL_COLLECTION_ITEM_DATA
          ? MODAL_COLLECTION_ITEM_DATA
          : '';
    } else {
      response = await getPageItemData();
    }

    const itemData = MODAL_COLLECTION_ITEM_DATA
      ? MODAL_COLLECTION_ITEM_DATA
      : collectionItemData
        ? collectionItemData
        : response.itemData;
    if (itemData) {
      fieldValue = field.fieldName ? parseValueFromData(itemData, field.fieldName) : '';
      if (['reference', 'belongsTo'].includes(field.type)) {
        if (Array.isArray(fieldValue)) {
          fieldValue = fieldValue ? fieldValue.map((item) => item.uuid) : '';
        } else if (typeof fieldValue === 'object') {
          fieldValue = fieldValue ? fieldValue.uuid : '';
        }
      } else if (field.type === 'static_option' || field.type === 'dynamic_option') {
        fieldValue = processSelectOptionValue(field.isMultiSelect, fieldValue);
      }
    }

    const { meta } = currentUserField ? currentUserField : '';
    if (meta && meta.from === 'CURRENT_USER') {
      const userObjString = localStorage.getItem('user') ? localStorage.getItem('user') : '';

      if (!userObjString) {
        fieldValue = ''; // Reset option value if User is Not Logged In
      }
    }
  }

  const userFieldName = select.getAttribute('data-form-element-session');
  if (userFieldName) {
    const loggedInUser = fetchLoggedInUserJson();
    const userValue =
      loggedInUser && userFieldName ? parseValueFromData(loggedInUser, userFieldName) : '';
    fieldValue = setSelectedOnDropdown(userValue);
  }
  const tenantFieldName = select.getAttribute('data-form-element-session-tenant');
  ``;
  if (tenantFieldName) {
    const tenantItem = fetchCurrentTenantJson();
    const tenantValue =
      tenantItem && tenantFieldName ? parseValueFromData(tenantItem, tenantFieldName) : '';
    fieldValue = setSelectedOnDropdown(tenantValue);
  }
  const userSettingFieldName = select.getAttribute('data-form-element-session-user-settings');
  if (userSettingFieldName) {
    const userSettingItem = fetchCurrentUserSettingsJson();
    const userSettingValue =
      userSettingItem && userSettingFieldName
        ? parseValueFromData(userSettingItem, userSettingFieldName)
        : '';
    fieldValue = setSelectedOnDropdown(userSettingValue);
  }
  const subTenantFieldName = select.getAttribute('data-form-element-session-sub-tenant');
  if (subTenantFieldName) {
    const subTenantItem = fetchCurrentSubTenantJson();
    const subTenantValue =
      subTenantItem && subTenantFieldName
        ? parseValueFromData(subTenantItem, subTenantFieldName)
        : '';
    fieldValue = setSelectedOnDropdown(subTenantValue);
  }

  const selectOptions = { selectionCssClass: ':all:', width: 'resolve' };
  const formElem = select.closest('form');
  const isSearchForm = formElem.getAttribute('data-gjs') === 'search-form';
  if (isSearchForm) {
    selectOptions['multiple'] = false;
  } else if (field) {
    selectOptions['multiple'] = field.isMultiSelect;
  } else if (select.type === 'select-multiple') {
    selectOptions['multiple'] = true;
  } else if (fieldValue && Array.isArray(fieldValue)) {
    selectOptions['multiple'] = fieldValue.length > 1;
  } else if (fieldValue && fieldValue.includes(',') && Array.isArray(fieldValue.split(','))) {
    selectOptions['multiple'] = fieldValue.split(',').length > 0;
  }
  const { extraFieldSetting = {} } = field;
  const staticDefaultValue = Array.isArray(extraFieldSetting.staticDefaultValue)
    ? extraFieldSetting.staticDefaultValue
    : [];

  if ((!Array.isArray(fieldValue) || fieldValue.length === 0) && staticDefaultValue.length > 0) {
    fieldValue = staticDefaultValue;
  }
  $(`#${select.id}`).select2(selectOptions).val(fieldValue).trigger('change');

  // Swapping Select & Select2 elements to fix Validation error message alignment.
  let selectElem = document.getElementById(select.id);
  if (selectElem) {
    let select2Elem = selectElem.nextSibling;
    swapNodeElements(selectElem, select2Elem);
    validateSelectElement(select);
  }
};

const setSelectedOnDropdown = (data) => {
  let values = [];
  if (data) {
    if (Array.isArray(data) && data.length > 1) {
      data.forEach((value) => {
        values = getSelectedDropdownData(value, values);
      });
    } else if (typeof data === 'object') {
      values = getSelectedDropdownData(data, values);
    } else if (typeof data === 'string' && data && data.includes(',')) {
      const dataArr = data.split(',');
      values.push(...dataArr);
    } else values.push(data);
  } else values = [''];
  return values;
};

const getSelectedDropdownData = (data, values) => {
  if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
    values.push(data?.uuid);
  } else if (Array.isArray(data)) {
    values = [...values, ...data];
  } else values.push(data);
  return values;
};

const swapNodeElements = (nodeA, nodeB) => {
  const parentA = nodeA.parentNode;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;
  // Move `nodeA` before `nodeB`
  nodeB.parentNode.insertBefore(nodeA, nodeB);
  // Move `nodeB` before the sibling of `nodeA`
  parentA.insertBefore(nodeB, siblingA);
};

const validateSelectElement = (select) => {
  if (select && select.id) {
    $(`#${select.id}`).on('select2:select', function (e) {
      // let selectElem = document.getElementById(select.id);
      // let isMultiSelect = select.hasAttribute('multiple');
      let selectErrorElem = document.getElementById(`${select.id}-error`);
      if (selectErrorElem) {
        $(`#${select.id}`).valid();
      }
    });
  }
};

const dependentDropDownPopulateOnChange = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters } = args;
    const { collection, onChangeElementName, valuesToChangeElementName, field } = parameters;
    const valuesToChangeField = JSON.parse(valuesToChangeElementName);
    const valuesToChangeFieldName = valuesToChangeField.fieldName;
    const collectionFormOfElement = $(element).closest('form');
    const valuesToChangeElement =
      $(collectionFormOfElement[0]).find(`select[name='${valuesToChangeFieldName}[]']`)[0] ||
      $(collectionFormOfElement[0]).find(`select[name='${valuesToChangeFieldName}']`)[0];

    const finderUuid = valuesToChangeElement.getAttribute('data-select-finder-id');
    const queryParams = `${field}=${element.value}`;
    const referenceAndDynamicOptionsDataMap = {
      field: valuesToChangeField,
      select: valuesToChangeElement,
      finderUuid: finderUuid,
      isModal: false,
      collectionItemData: null,
      queryParams: queryParams,
      isRadioType: false,
      isSetEmpty: element.value ? false : true,
      dropdownDataFrom: '',
      currentUserField: '',
    };
    referenceAndDynamicOptions(referenceAndDynamicOptionsDataMap);
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const referenceAndDynamicOptions = async ({
  field,
  select,
  finderUuid,
  isModal,
  collectionItemData,
  queryParams,
  isRadioType,
  isSetEmpty,
  dropdownDataFrom,
  storageField,
}) => {
  let selectExternalParams = select.getAttribute('data-select-external-params');
  const labelField = select.getAttribute('label-field');
  if (isModal && !collectionItemData) {
    collectionItemData = MODAL_COLLECTION_ITEM_DATA;
  }
  let itemData = '';
  itemData = getEntityItemFromElem(select);
  if (!itemData) {
    const itemObj = await getItemDataForElement(select); //Get Item of the collection binded with page or modal
    itemData = itemObj.itemData;
  }
  let extQueryParams = '';
  if (itemData && selectExternalParams && selectExternalParams.length > 0) {
    const queryParamKeys = new Set();
    if (queryParams) {
      queryParams.split('&').forEach((param) => {
        const [key] = param.split('=');
        if (key) queryParamKeys.add(key);
      });
    }
    selectExternalParams = selectExternalParams.split(',');
    selectExternalParams.forEach((extKey) => {
      if (!queryParamKeys.has(extKey)) {
        const keyForValue = select.getAttribute(extKey.toLowerCase());
        let paramValue = parseValueFromData(itemData, keyForValue);
        extQueryParams += `&${extKey}=${paramValue}`;
      }
    });
  }

  const { refCollection } = field;
  const { collectionName } = refCollection || '';
  let refCollectionName = collectionName;
  let collItemUrl = `collection-table/${refCollectionName}/`;
  if (finderUuid) {
    collItemUrl += `finder/${finderUuid}/`;
  }
  collItemUrl += 'items/';
  if (queryParams && extQueryParams) {
    collItemUrl += `?${queryParams}${extQueryParams}`;
  } else if (queryParams) {
    collItemUrl += `?${queryParams}`;
  } else if (extQueryParams) {
    collItemUrl += `?${extQueryParams.substring(1, extQueryParams.length)}`;
  }
  collItemUrl += `${collItemUrl.includes('?') ? '&' : '?'}max=2000`;
  collItemUrl = await addEntityQueryToUrl(collItemUrl, refCollectionName, finderUuid);
  if (dropdownDataFrom !== 'NONE') {
    const response = await throttledPublicGetCall(collItemUrl);
    if (isRadioType) {
      referenceOptionsForRadio(select, field, response.data, itemData);
    } else {
      select.removeAttribute('data-placeholder');

      if (storageField) {
        const { meta } = storageField;
        if (meta && currentOptions.includes(meta.from)) {
          field.isMultiSelect = meta.hasOwnProperty('isMultiSelect')
            ? meta.isMultiSelect
            : field.isMultiSelect;

          if (!field.isMultiSelect) select.removeAttribute('multiple');
        }
      }
      const referenceOptionsDataMap = {
        field: field,
        itemOptions:
          isSetEmpty || (dropdownDataFrom && dropdownDataFrom === 'NONE') ? [] : response.data,
        storageField,
        labelField,
        select,
      };
      select.innerHTML = referenceOptions(referenceOptionsDataMap);

      if (isModal) {
        if (!collectionItemData) {
          collectionItemData = MODAL_COLLECTION_ITEM_DATA;
        }
        if (collectionItemData) {
          setPredefinedValuesInSelect(select, field, isModal, collectionItemData);
        } else {
          setPredefinedValuesInSelect(select, field, isModal);
        }
      } else {
        setPredefinedValuesInSelect(select, field, isModal, collectionItemData);
      }
    }
  }
};

const throttledPublicGetCall = (url) => {
  const key = url;
  if (!throttledMap.has(key)) {
    throttledMap.set(
      key,
      _.throttle(
        async (endpoint) => {
          const promise = publicGetCall(endpoint);
          lastPromiseMap.set(key, promise);
          return promise;
        },
        500,
        { leading: true, trailing: false },
      ),
    );
  }
  throttledMap.get(key)(url);
  return lastPromiseMap.get(key);
};

const referenceOptionsForRadio = (select, field, itemOptions, itemData) => {
  const wrapElement = document.createElement('div');
  const idOfElement = select.parentNode.getAttribute('id');
  itemOptions.map((item) => {
    const cloneParentElement = select.parentNode.cloneNode(true);
    cloneParentElement.setAttribute('id', `${idOfElement}-${item.uuid}`);
    const radioInputElement = cloneParentElement.getElementsByTagName('input');
    const labelElement = cloneParentElement.getElementsByTagName('label');
    const idOfRadioElement = radioInputElement[0].getAttribute('id');
    const idOfLabelElement = labelElement[0].getAttribute('id');

    let itemDataValue = '';
    if (itemData) {
      itemDataValue = itemData[field.fieldName];
    } else if (MODAL_COLLECTION_ITEM_DATA) {
      itemDataValue = MODAL_COLLECTION_ITEM_DATA[field.fieldName];
    }

    const labelElemId = !idOfLabelElement
      ? 'label-' + idOfRadioElement + '-' + item.uuid
      : idOfLabelElement;

    const itemValue = item[field.refCollection.collectionField];
    if (field.type === 'dynamic_option') {
      radioInputElement[0].setAttribute('value', itemValue);
      if (isRadio(radioInputElement[0]) || isCheckbox(radioInputElement[0])) {
        if (itemDataValue && itemDataValue.length && itemDataValue.includes(itemValue)) {
          radioInputElement[0].checked = true;
        }
      }
    } else {
      radioInputElement[0].setAttribute('value', item.uuid);
      if (itemDataValue && Array.isArray(itemDataValue)) {
        itemDataValue = itemDataValue.find((dataValue) => dataValue.uuid === item.uuid);
      }
      if (isRadio(radioInputElement[0]) || isCheckbox(radioInputElement[0])) {
        if (itemDataValue && item.uuid === itemDataValue.uuid) {
          radioInputElement[0].checked = true;
        }
      }
    }
    radioInputElement[0].setAttribute('id', `${idOfRadioElement}-${item.uuid}`);
    labelElement[0].setAttribute('for', `${idOfRadioElement}-${item.uuid}`);
    labelElement[0].setAttribute('id', `${labelElemId}`);
    labelElement[0].innerText = itemValue;
    wrapElement.appendChild(cloneParentElement);
  });
  select.parentNode.replaceWith(...wrapElement.childNodes);
};

const referenceOptions = ({ field, itemOptions, storageField, labelField, select }) => {
  const hasReferenceLabelField =
    labelField && !labelField.includes('functionType') && labelField.includes('.');
  const labelFieldArr = hasReferenceLabelField ? labelField.split('.') : [];
  let storageRefItemValue = [];
  const { meta } = storageField ? storageField : '';
  const isCurrentTenantOrUser = meta && currentOptions.includes(meta.from);
  if (isCurrentTenantOrUser) {
    let storageKey = '';
    if (meta.from === 'CURRENT_USER') {
      storageKey = 'user';
    } else if (meta.from === 'CURRENT_TENANT') {
      storageKey = 'tenant';
    }
    if (storageKey) {
      const storageItemData = parseLSJSONStrToJSON(storageKey);
      const refFieldArr = storageField.fieldName ? storageField.fieldName.split('.') : [];
      let storageRefField = '';
      if (refFieldArr.length === 2) {
        storageRefField = `${refFieldArr[0]}.[0].${refFieldArr[1]}`;
      } else if (refFieldArr.length === 1) {
        storageRefField = `${refFieldArr[0]}`;
      }
      storageRefItemValue = getContentFromSessionObject(storageItemData, storageRefField);
    }
  }
  const removeFieldnameInDropdownPlaceholder =
    select && select.hasAttribute('removeFieldnameInDropdownPlaceholder');
  const hasPlaceholderPattern = select && select.hasAttribute('placeholderPattern');
  const placeholderPattern =
    select && hasPlaceholderPattern ? select.getAttribute('placeholderPattern') : '';
  const fieldTitle = field.fieldTitle.en;
  let fieldPlaceholder = getFieldPlaceholder(fieldTitle, placeholderPattern);

  //Fallback to removeFieldnameInDropdownPlaceholder if placeholderPattern is not set
  if (removeFieldnameInDropdownPlaceholder) {
    fieldPlaceholder = 'Select';
  }

  let options = [`<option value="">- ${fieldPlaceholder} -</option>`];
  options = options.concat(
    Array.isArray(itemOptions)
      ? itemOptions.map((item) => {
          let itemValue = '';
          if (labelField && !hasReferenceLabelField) {
            itemValue = parseValueFromData(item, labelField);
          } else if (labelField && hasReferenceLabelField) {
            let refCollectionFieldName = labelFieldArr[0];
            refCollectionFieldName = getLvl1CollRefFieldName(field, item, refCollectionFieldName);
            itemValue = _.get(item, refCollectionFieldName);
          } else {
            let refCollectionFieldName = field.refCollection.collectionField;
            refCollectionFieldName = getLvl1CollRefFieldName(field, item, refCollectionFieldName);
            itemValue = _.get(item, refCollectionFieldName);
          }

          let optionValue = '';
          switch (field.type) {
            case 'dynamic_option':
              optionValue = itemValue;
              break;
            case 'reference':
              optionValue = hasReferenceLabelField ? itemValue : item.uuid;
              break;
            default:
              optionValue = item.uuid;
              break;
          }

          if (itemValue && optionValue) {
            if (isCurrentTenantOrUser) {
              if (storageRefItemValue && Array.isArray(storageRefItemValue)) {
                let storageRefItem = '';
                storageRefItem = storageRefItemValue.find(
                  (storageRef) =>
                    storageRef[
                      field.type === 'dynamic_option' ? field.refCollection.collectionField : 'uuid'
                    ] === optionValue,
                );
                if (!storageRefItem) storageRefItem = storageRefItemValue.includes(item.uuid);

                if (storageRefItem) {
                  return `<option value="${optionValue}">${itemValue}</option>`;
                } else {
                  if (storageRefItemValue && storageRefItemValue.includes(optionValue)) {
                    return `<option value="${optionValue}">${itemValue}</option>`;
                  }
                }
              }
            } else {
              switch (field.type) {
                case 'dynamic_option':
                  let optionItemLabel = itemValue;
                  let optionItemValue = optionValue;
                  if (optionItemValue && optionItemValue.includes('::')) {
                    const itemArr = optionItemValue.split('::');
                    if (itemArr && itemArr.length === 2) {
                      optionItemValue = itemArr[0].trim();
                      optionItemLabel = itemArr[1].trim();
                    }
                  }
                  return `<option value="${optionItemValue}">${optionItemLabel}</option>`;
                case 'reference':
                  if (hasReferenceLabelField && optionValue && Array.isArray(optionValue)) {
                    let optionsArr = [];
                    optionValue.map((opV) => {
                      optionsArr.push(
                        `<option value="${opV.uuid}">${_.get(opV, labelFieldArr[1])}</option>`,
                      );
                    });
                    return optionsArr;
                  } else {
                    return `<option value="${optionValue}">${itemValue}</option>`;
                  }
                default:
                  return `<option value="${optionValue}">${itemValue}</option>`;
              }
            }
          }
        })
      : '',
  );
  if (isCurrentTenantOrUser) {
    let newOptions = []; // To remove undefined option values
    options.forEach((option) => {
      if (option) {
        newOptions.push(option);
      }
    });
    options = [...newOptions];
  }
  let mergedUniqueOptionsArr = [...new Set(options)];
  return mergedUniqueOptionsArr.filter(() => true).join('');
};

const loadDropzoneField = async (
  element,
  collectionForm,
  collectionField,
  isFileTrackerPluginInstalled,
  getContentFromData,
) => {
  Dropzone.autoDiscover = false;
  if (element && element.id && collectionField) {
    const parentForm = getClosest(element, '[data-js=collection-form], [data-js=sign-up-form]');
    let isModal = false;
    let isSubpage = false;
    const isModalForm = parentForm.closest('[id^=modal-container]');
    const isSubpageForm = parentForm.closest('[data-subpage-id]');
    isModal = isModalForm ? true : false;
    isSubpage = isSubpageForm ? true : false;
    let collectionId = parentForm ? parentForm.getAttribute('data-form-collection') : 'master';
    if (getClosest(element, '[data-js=sign-up-form]')) {
      collectionId = 'user';
    }

    const pageExternalApiId = getCookie('__pageExternalAPI');
    const fromPageExternalAPI = pageExternalApiId ? true : false;
    const modalExternalApiId = sessionStorage.getItem('__modalExternalAPI');
    const fromModalExternalAPI = isModal && modalExternalApiId;
    const subpageExternalApiId = sessionStorage.getItem('__subpageExternalAPI');
    const fromSubpageExternalAPI = isSubpage && subpageExternalApiId;

    let sessionCollectionId = '';
    let sessionCollectionItemId = '';
    let collectionItems = '';
    let sessionStorageKeyCollection = `__ssr_dp_colId`;
    let sessionStorageKeyItem = `__ssr_dp_colItemId`;
    if (isModal) {
      sessionStorageKeyCollection = `__ssr_dm_colId`;
      sessionStorageKeyItem = `__ssr_dm_colItemId`;
    } else if (isSubpage) {
      sessionStorageKeyCollection = `__ssr_ds_colId`;
      sessionStorageKeyItem = `__ssr_ds_colItemId`;
    }

    sessionCollectionId = sessionStorage.getItem(sessionStorageKeyCollection);
    sessionCollectionItemId = sessionStorage.getItem(sessionStorageKeyItem);

    if (
      sessionCollectionId &&
      sessionCollectionItemId &&
      !(fromPageExternalAPI || fromModalExternalAPI || fromSubpageExternalAPI)
    ) {
      // Fetch Item Data from DB
      const collectionItemResult = await doProcessForCollectionData(
        sessionCollectionItemId,
        sessionCollectionId,
      );
      const { itemData } = collectionItemResult || {};
      if (itemData && Object.entries(itemData).length) {
        collectionItems = { ...itemData };
      }
    }

    console.log(
      '🚀 ~ loadDropzoneField ~ isModal:',
      isModal,
      '~ isSubpage:',
      isSubpage,
      '~ fromPageExternalAPI:',
      fromPageExternalAPI,
      '~ fromModalExternalAPI:',
      fromModalExternalAPI,
      '~ fromSubpageExternalAPI:',
      fromSubpageExternalAPI,
    );
    if (!(isModal && isSubpage) && fromPageExternalAPI) {
      const { itemData } = await getPageItemData();
      if (itemData && Object.entries(itemData).length) {
        collectionItems = { ...itemData };
      }
    } else if ((isSubpage || isModal) && (fromModalExternalAPI || fromSubpageExternalAPI)) {
      const modalParent = findModalParent(element);
      console.log('🚀 ~ loadDropzoneField ~ modalParent:', modalParent);

      if (modalParent) {
        let elementCollectionId = modalParent ? modalParent.getAttribute('data-collection-id') : '';
        let elementItemId = modalParent ? modalParent.getAttribute('data-item-id') : '';
        elementItemId = replaceSlashWithUnderscore(elementItemId);
        const isModalItem = [null, undefined, 'null', 'undefined'].some((val) =>
          [elementCollectionId, elementItemId].includes(val),
        );
        console.log('🚀 ~ loadDropzoneField ~ isModalItem:', isModalItem);
        if (!isModalItem) {
          const collectionItemData = { collectionId: elementCollectionId, itemId: elementItemId };
          const { itemData } = await getModalItemData(collectionItemData, true);
          console.log('🚀 ~ loadDropzoneField ~ itemData:', itemData);
          if (itemData && Object.entries(itemData).length) {
            collectionItems = { ...itemData };
          }
        }
      }
    }

    let {
      name: fieldName,
      title: fieldTitle,
      validation,
      refCollection,
      refCollectionField,
      required,
      maxSize,
      requiredErrorMessage,
    } = collectionField;
    let { noAllowedFiles, allowedFileTypes } = validation;
    const fieldId = fieldName;
    noAllowedFiles = Number(noAllowedFiles);
    noAllowedFiles = noAllowedFiles ? noAllowedFiles : 1;
    const isMultiple = noAllowedFiles > 1;
    allowedFileTypes = allowedFileTypes ? allowedFileTypes.split(',') : '';

    let endpoint = SERVER_URL;
    endpoint += `file/upload/${collectionId}/${fieldId}`;
    //TODO: Test for token
    // const token = validateCookieToken();
    // if (!token) return;
    const headerObj = await getHeaderForServerForPublicRequest();
    let { headers } = headerObj || '';
    let dropzoneHeader = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, X-File-Name, Cache-Control',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, OPTIONS',
    };
    delete headers['Content-Type'];

    headers = { ...headers, ...dropzoneHeader };

    const inputElem = document.createElement('input');
    inputElem.type = 'hidden';
    inputElem.id = fieldId;
    inputElem.name = fieldId;
    inputElem.value = '';
    collectionForm.appendChild(inputElem);

    //For Displaying Validation Error Message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'text-danger mt-1';
    errorContainer.style.display = 'none';
    errorContainer.textContent = requiredErrorMessage || `${fieldTitle} is required`;
    element.parentNode.appendChild(errorContainer);

    let completedFiles = [];
    const myDropzone = new Dropzone(`div#${element.id}`, {
      url: endpoint,
      paramName: 'file', // The name that will be used to transfer the file
      uploadMultiple: false,
      parallelUploads: noAllowedFiles,
      autoProcessQueue: true,
      addRemoveLinks: true,
      maxFilesize: maxSize || 500, // MB
      maxFiles: noAllowedFiles,
      headers,
      dictDefaultMessage: `
      <div class="d-flex flex-column justify-content-center align-items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
      <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z"/>
      </svg>
      
      <b>Drag ${fieldTitle ? fieldTitle : 'Files'} or Click to Browse</b>
      <p class="pt-2">Only ${allowedFileTypes.join(', ')} files are supported</p>
      </div>
      `,
      accept: function (file, done) {
        if (!endsWithOne(file.name, allowedFileTypes)) {
          done(`Only ${allowedFileTypes.join(', ')} files are allowed!`);
        } else {
          done();
        }
      },
    });
    const dzInitKey = element.id;
    const dzMapKey = `dz_${collectionForm.id}_${dzInitKey}`;
    DropzoneMap[dzMapKey] = myDropzone;
    mockExistingFile(
      collectionItems,
      fieldId,
      myDropzone,
      completedFiles,
      refCollectionField,
      getContentFromData,
      inputElem,
    );
    window.DropzoneInitRegistry[dzInitKey] = {
      element,
      collectionForm,
      collectionField,
      isFileTrackerPluginInstalled,
      getContentFromData,
    };
    //Overriding Dropzone default style dynamically.
    let elementStyle = `.dropzone .dz-preview{width:min-content}.dropzone .dz-preview .dz-error-message{font-size:10px !important}.dropzone .dz-preview .dz-error-message::after{top:40px;border-bottom:none;border-top:6px solid #be2626}.dropzone .dz-preview .dz-error-message{top:0}.dropzone .dz-preview .dz-remove{text-align:left;word-wrap:anywhere}`;
    if (isMultiple) {
      elementStyle += `div[id="${element.id}"].dropzone.dz-started .dz-message {
      display: revert;}`;
    }
    addStyle(elementStyle);

    myDropzone.on('success', (file) => {
      completedFiles.push(file.xhr['response']);
    });
    let refUpdate = false;
    if (completedFiles.length > 0 && refCollection) {
      refUpdate = true;
    }
    if (refUpdate === true) {
      completedFiles.splice(0, completedFiles.length);
    }
    myDropzone.on('complete', (file) => {
      updateDropzoneRemoveFileText(myDropzone, file.name);
      if (file._removeLink) {
        file._removeLink.innerHTML = myDropzone.options.dictRemoveFile;
      }
      //Removing Error message and classes when passes validation
      errorContainer.style.display = 'none';
      element.classList.remove('form-control', 'error');
      if (isMultiple) {
        inputElem.name = `${fieldId}[]`;
        inputElem.setAttribute('multiple', true);
        if (refCollection) {
          inputElem.setAttribute('data-file-upload-component', `[${completedFiles}]`);
          if (refUpdate) {
            inputElem.setAttribute('ref-field-file-upload-component', fieldId);
          }
        } else {
          inputElem.value = `[${completedFiles}]`;
        }
      } else {
        if (refCollection) {
          inputElem.setAttribute('data-file-upload-component', completedFiles);
          if (refUpdate) {
            inputElem.setAttribute('ref-field-file-upload-component', fieldId);
          }
        } else {
          inputElem.value = `[${completedFiles}]`;
        }
      }
    });
    let removedFileRefUuid = [];
    myDropzone.on('removedfile', (file) => {
      const existingFileCount = completedFiles.length;
      completedFiles = completedFiles.filter(
        (compFile) => JSON.parse(compFile).originalName !== file.name,
      );
      let remainingUUIDs;
      if (refUpdate === true) {
        removedFileRefUuid.push(file.refFieldUuid);
        let fieldItem = collectionItems[fieldId];
        console.log('🚀 ~ loadDropzoneField ~ fieldItem:', fieldItem);
        if (fieldItem && Array.isArray(fieldItem)) {
          fieldItem = fieldItem.filter((item) => {
            return !removedFileRefUuid.includes(item.uuid);
          });
        }
        remainingUUIDs = fieldItem.map((file) => file.uuid);
      }
      if (isMultiple) {
        inputElem.name = `${fieldId}[]`;
        inputElem.setAttribute('multiple', true);
        if (refCollection) {
          inputElem.setAttribute('data-file-upload-component', `[${completedFiles}]`);
          if (refUpdate) {
            inputElem.setAttribute('ref-field-file-upload-component', fieldId);
          }
          inputElem.value = remainingUUIDs;
        } else {
          inputElem.value = `[${completedFiles}]`;
        }
      } else {
        if (refCollection) {
          inputElem.setAttribute('data-file-upload-component', completedFiles);
          if (refUpdate) {
            inputElem.setAttribute('ref-field-file-upload-component', fieldId);
          }
          inputElem.value = remainingUUIDs;
        } else {
          inputElem.value = `[${completedFiles}]`;
        }
      }
      // Adjusting maxFiles to the correct amount:
      let fileCountOnServer = completedFiles.length; // The number of files already uploaded
      if (fileCountOnServer) {
        fileCountOnServer = noAllowedFiles - fileCountOnServer;
      } else {
        fileCountOnServer = noAllowedFiles;
      }
      myDropzone.options.maxFiles = fileCountOnServer;
      if (isFileTrackerPluginInstalled === 'true' && collectionItems) {
        fileActivityTracker(file.name, 'Delete', collectionId, fieldId);
      }
    });
    //For Validation
    parentForm.querySelector('button[type=submit]').addEventListener('click', function (e) {
      if (required === 'true' && completedFiles.length === 0) {
        e.preventDefault();
        e.stopPropagation();
        errorContainer.style.display = 'block';
        element.classList.add('form-control', 'error');
        return false;
      }
    });
    myDropzone.on('canceled', (file) => {
      completedFiles = completedFiles.filter(
        (compFile) => JSON.parse(compFile).originalName !== file.name,
      );
      if (isMultiple) {
        inputElem.name = `${fieldId}[]`;
        inputElem.setAttribute('multiple', true);
        inputElem.value = `[${completedFiles}]`;
      } else {
        inputElem.value = `[${completedFiles}]`;
      }
    });

    myDropzone.on('queuecomplete', () => {
      console.log('🚀 ~ file: drapcode.js:2107 ~ loadDropzoneField ~ queuecomplete...');
    });
  }
};

/**
 * Tenant Template
 */
const tenantTemplateOptions = (field, select) => {
  let templatesUrl = `projects/templates/`;
  publicGetCall(templatesUrl).then((response) => {
    select.innerHTML = templateOptions(field, response.data);
    // Initialise Select2
    $('#' + select.id)
      .select2({ selectionCssClass: ':all:', width: 'resolve' })
      .val('')
      .trigger('change');
  });
};

const templateOptions = (field, templateOptions) => {
  let options = [`<option value="">- Select ${field.fieldTitle.en} -</option>`];
  options = options.concat(
    Array.isArray(templateOptions)
      ? templateOptions.map((template) => {
          const templateValue = template['name'];
          let optionValue = template['uuid'];

          if (templateValue && optionValue) {
            return `<option value="${optionValue}">${templateValue}</option>`;
          }
        })
      : '',
  );
  return options.filter(() => true).join('');
};

const saveTenantTemplate = async (ev) => {
  let element, targetElement, formID;
  if (ev) {
    element = ev.target || ev.srcElement;
    targetElement = ev.currentTarget;
    ev.preventDefault();
    formID = element.id ? $('#' + element.id) : '';
  }

  const loggedInUser = isLoggedInUser() ? fetchLoggedInUserJson() : '';
  const ifValidToProcess =
    ev && ev.type === 'submit'
      ? formID &&
        formID.valid() &&
        formID.validate().pendingRequest === 0 &&
        loggedInUser &&
        loggedInUser.tenantId.length > 0
      : true;
  let formSubmitBtn;
  let formSubmitBtnText;
  if (formID) {
    formSubmitBtn = formID.find(':button[type=submit]');
    formSubmitBtnText = formSubmitBtn.html();
  }

  let response = {};
  if (ifValidToProcess) {
    formSubmitBtn && formSubmitBtn.prop('disabled', true);
    formSubmitBtn && formSubmitBtn.empty().append("<i class='fa fa-spinner fa-spin'></i>");
    const formData = await serializeFormData(targetElement.elements);
    formData.tenants = [...loggedInUser.tenantId];
    try {
      let endpoint = 'projects/templates/create';
      let apiCallResult = await unSecuredPostCall(formData, endpoint);
      response.data = apiCallResult;
      response.status = 'success';
      formSubmitBtn && formSubmitBtn.prop('disabled', false);
      formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);
      resetCollectionForm(targetElement);
      toastr.success(`Created Template Successfully.`, 'Success!');
    } catch (error) {
      console.error('error', error);
      formSubmitBtn && formSubmitBtn.prop('disabled', false);
      formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
        toastr.error(error.response.data.message, 'Failed!');
      }
    }
  } else {
    console.info('I am submit event and not valid');
    toastr.error(`You are not authorized to submit form.`, 'Submission Denied!');
    formSubmitBtn && formSubmitBtn.prop('disabled', false);
    formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);
  }
  return response;
};

/**
 * this method also getting used for normal page file render
 */
const replaceContentOfFileLinkElements = (item, htmlElement, dataURLField = null) => {
  let fieldName;
  if (dataURLField) {
    fieldName = htmlElement.getAttribute(dataURLField);
  } else {
    fieldName = htmlElement.getAttribute('data-text-content');
  }
  const type = htmlElement.getAttribute('data-field-type');
  if (fieldName) {
    const value = parseValueFromData(item, fieldName);
    if (type === 'file') {
      let imageUrl = '';
      let fileName = '';
      let data = '';
      if (typeof value === 'object' && !Array.isArray(value)) {
        imageUrl = imageServerUrl() + value.key;
        fileName = value.originalName;
        if (value.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(htmlElement, value, item.uuid);
        } else {
          htmlElement.href = imageUrl ? imageUrl : '';
        }
        htmlElement.innerText = fileName ? fileName : imageUrl;
      } else if (value && Array.isArray(value)) {
        data = value.map((record) => {
          const imageUrl = record && record.key ? imageServerUrl() + record.key : '';
          const fileName = record && record.originalName ? record.originalName : '';
          const anchorLink = document.createElement('a');
          if (record.isPrivate === true) {
            addDownloadAttributeForPrivateFiles(anchorLink, record, item.uuid);
          } else {
            anchorLink.href = imageUrl;
          }
          anchorLink.innerText = fileName ? fileName : imageUrl;
          //anchorLink.id = uuidv4();
          anchorLink.id = htmlElement.id;
          anchorLink.classList = htmlElement.classList;
          return anchorLink;
        });
        htmlElement.replaceWith(...data);
      }
      return;
    }
  }
};

const getConjunctionSymbol = (conjunctionType) => {
  if (conjunctionType === 'AND') {
    return '&&';
  } else if (conjunctionType === 'OR') {
    return '||';
  } else {
    return '';
  }
};
const getCurrentUserStatementCode = (query, conjunctionSymbol) => {
  if (query.key === IS_LOGGED_IN) {
    return `${conjunctionSymbol} isLoggedInUser()`;
  } else {
    return `${conjunctionSymbol} !isLoggedInUser()`;
  }
};
const getCurrentUserRoleStatementCode = (query, conjunctionSymbol) => {
  const { key, value } = query;
  if (key === EQUALS) {
    return `${conjunctionSymbol} isLoggedInUserRole('${value}')`;
  } else {
    return `${conjunctionSymbol} !isLoggedInUserRole('${value}')`;
  }
};
const getKeySymbol = (key) => {
  if (key === EQUALS) {
    return '===';
  } else if (key === LESS_THAN) {
    return '<';
  } else if (key === LESS_THAN_EQUALS_TO) {
    return '<==';
  } else if (key === GREATER_THAN) {
    return '>';
  } else if (key === GREATER_THAN_EQUALS_TO) {
    return '>==';
  } else if (key === NOT_EQUAL) {
    return '!==';
  }
};
const getCurrentDateStatementCode = (query, idx, conjunctionSymbol) => {
  return `${conjunctionSymbol} dateComparison(${query.key},value${idx})`;
};
let checkDate = (queryValue) => {
  return ('' + queryValue).match(DATE_REGEX);
};

function dateComparison(key, date) {
  if (checkDate(date)) {
    if (key === EQUALS) {
      return moment().isSame(date); // true
    } else if (key === LESS_THAN) {
      return moment().isAfter(date); // true
    } else if (key === LESS_THAN_EQUALS_TO) {
      return moment().isSameOrAfter(date); // true
    } else if (key === GREATER_THAN) {
      return moment().isBefore(date); // true
    } else if (key === GREATER_THAN_EQUALS_TO) {
      return moment().isSameOrBefore(date); // true
    } else if (key === NOT_EQUAL) {
    }
  } else {
    console.log('Not Valid date in elemnet');
    return 'true';
  }
}
const showAlertMessage = function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const previousActionResponse = args.response;
    const form = args.element;
    let response = {};
    response.data = previousActionResponse;
    if (previousActionResponse) {
      if (previousActionResponse.status === 201 || previousActionResponse.status === 200) {
        toastr.success(args.parameters.successMessage, 'Success');
        response.status = 'success';
      } else if (previousActionResponse.status === 409) {
        toastr.error(
          previousActionResponse.data || 'Validation Failed',
          `Error: ${previousActionResponse.status}`,
        );
        response.status = 'error';
      } else if (previousActionResponse.status === 404) {
        toastr.error(
          previousActionResponse.data.error || 'This collection does not found',
          `Error: ${previousActionResponse.status}`,
        );
        response.status = 'error';
      } else if (previousActionResponse.status === 403) {
        toastr.error(
          args.parameters.errorMessage || 'Forbidden Access',
          `Error: ${previousActionResponse.status}`,
        );
        response.status = 'error';
      } else {
        toastr.error(
          previousActionResponse.data.error || 'Some Internal error',
          `Error: ${previousActionResponse.status}`,
        );
        response.status = 'error';
      }
    } else {
      toastr.error('Sorry, We are not able get response from previous actions', 'Error');
      response.status = 'error';
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};
const exportCollectionItem = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { collection, filterId, successMessage, errorMessage } = args.parameters;
    let endpoint = `collection-table/${collection}/finder/${filterId}/export-data`;
    endpoint = await addEntityQueryToUrl(endpoint, collection, filterId);
    await downloadFile(endpoint);
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const importCollectionItem = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, element } = args;
    const { collection, successMessage, errorMessage, collectionRequest } = parameters;
    let isSecuredCall = true;
    if (!collectionRequest || collectionRequest == 'Open') {
      isSecuredCall = false;
    }
    const file = element.file;
    Papa.parse(element.file.files[0], {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete(results) {
        const { meta, errors, data } = results;
        if (errors.length > 0) {
          toastr.error('Please check the file and try again!', 'CSV Import');
        } else {
          showCSVContentOnUI(
            meta.fields,
            data,
            element,
            isSecuredCall,
            collection,
            successMessage,
            errorMessage,
          );
          actionCompleted(args);
        }
      },
    });
  } else {
    return disabledActionResponse(args);
  }
};
const showCSVContentOnUI = (
  headers,
  items,
  form,
  isSecuredCall,
  collection,
  successMessage,
  errorMessage,
) => {
  let headerRowHTML = '<tr>';
  for (let i = 0; i < headers.length; i++) {
    headerRowHTML += '<th>' + headers[i] + '</th>';
  }
  headerRowHTML += '</tr>';
  let allRecordsHTML = '';
  for (let i = 0; i < items.length; i++) {
    allRecordsHTML += '<tr>';
    for (let j = 0; j < headers.length; j++) {
      let header = headers[j];
      allRecordsHTML += '<td>' + items[i][header] + '</td>';
    }
    allRecordsHTML += '</tr>';
  }
  let endpoint = '';
  const dialog = bootbox.dialog({
    title: 'Records',
    message: `<div style="overflow-y: scroll;max-height:400px;"><table class="table table-bordered table-striped">${headerRowHTML}${allRecordsHTML}</table></div>`,
    size: 'large',
    buttons: {
      cancel: {
        label: 'Cancel',
        className: 'btn-danger',
        callback: function () {
          form.reset();
          dialog.modal('hide');
        },
      },
      ok: {
        label: 'Upload Record',
        className: 'btn-info',
        callback: function () {
          //Write code to send data on server
          form.reset();
          dialog.modal('hide');
          const finalData = { fields: headers, items };
          let endpoint = `collection-form/import-from-csv/${collection}`;
          let apiCallResult;
          const successToast = (response) => {
            const { data } = response;
            if (data) {
              toastr.success(
                successMessage
                  ? successMessage
                  : `Total ${
                      data.insertedCount ? data.insertedCount : 'few'
                    } records has been imported `,
                'CSV Imported',
              );
            }
          };

          const errorToast = () => {
            toastr.error(
              errorMessage ? errorMessage : 'Failed to import item. Please contact Admin.',
              'CSV Import',
            );
          };
          if (isSecuredCall) {
            endpoint = `${endpoint}`;
            securedPostCall(finalData, endpoint)
              .then((response) => successToast(response))
              .catch((err) => errorToast());
          } else {
            endpoint = `open/${endpoint}`;
            unSecuredPostCall(finalData, endpoint)
              .then((response) => successToast(response))
              .catch((err) => errorToast());
          }
        },
      },
    },
  });
};
const saveCollection = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = getFormElement(args);
    return saveCollectionData(args, form, false);
  } else {
    return disabledActionResponse(args);
  }
};

const saveCollectionDraft = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = getFormElement(args);
    return saveCollectionData(args, form, true);
  } else {
    return disabledActionResponse(args);
  }
};

const saveUserWithCollectionReference = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const {
      // constructor,
      // collectionRequest,
      userRefField,
      userRole,
      successMessage,
      errorMessage,
      passPreviousActionFormData,
      collection,
      redirectUrl,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      enableLoginUser,
      enableConsoleLog,
      startConsoleLog,
      endConsoleLog,
    } = args.parameters;
    let form = getFormElement(args);
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const data = await serializeFormData(form.elements);
    data['userRoles'] = data['userRoles'] ? data['userRoles'] : [userRole];

    if (enableLoginUser) {
      showErrorOnField(form, data, 'userName', 'Please enter username');
      showErrorOnField(form, data, 'password', 'Please enter password');
    }

    const { data: refCollectionItem } = await saveEmptyItemToCollection(collection);
    data[userRefField] = [refCollectionItem.uuid];
    let cleanFormDataForSession = clearDataForSessionStorage(data);

    // Need this for Request Type support
    // let isSecuredCall = true;
    // if (!collectionRequest || collectionRequest == 'Open') isSecuredCall = false;
    if (
      passPreviousActionFormData &&
      (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
    ) {
      if (formDataBrowserStorageLocation && formDataSessionKey) {
        setDataInSessionStorageLocation(
          formDataBrowserStorageLocation,
          formDataSessionKey,
          cleanFormDataForSession,
        );
      } else {
        // Fallback handling
        // TODO: Ali -> Remove after complete migration
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          sessionStorage.setItem(
            'previousActionFormData',
            JSON.stringify({ ...previousActionFormData, ...cleanFormDataForSession }),
          );
        } else {
          sessionStorage.setItem('previousActionFormData', JSON.stringify(cleanFormDataForSession));
        }
      }
    }

    // Need this for Constructor support
    //   if (collection && constructor) {
    //     const ipAddress = await getIPAddress();
    //     let navigator = {};
    //     _.merge(navigator, window.navigator);

    //     let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    //     previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    //     let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    //     previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    //     data['constructorMetaObj'] = {
    //       collectionName: collection,
    //       constructorId: constructor,
    //       ipAddress: ipAddress ?? '',
    //       navigator: navigator,
    //       previousActionResponse,
    //       previousActionFormData,
    //     };
    //   }
    let endpoint = '';
    if (form.hasAttribute('action')) {
      endpoint = form.getAttribute('action');
      endpoint = 'open/' + endpoint;
    } else {
      endpoint = 'auth/user';
    }
    // Need this for Constructor support
    // endpoint = constructor ? endpoint + '/constructor/' + constructor : endpoint;
    let response = {};
    let apiCallResult;
    try {
      // Need this for Request Type support
      // if (isSecuredCall) {
      //   apiCallResult = await securedPostCall(data, endpoint);
      // } else {
      //   endpoint = 'open/' + endpoint;
      //   apiCallResult = await unSecuredPostCall(data, endpoint);
      // }
      apiCallResult = await unSecuredPostCall(data, endpoint);
      response.data = apiCallResult;
      response.data.collectionSaveOrUpdateResponse = apiCallResult;
      response.data.collectionFormData = cleanFormDataForSession;
      response.status = 'success';
      const { collectionSaveOrUpdateResponse } = response.data;
      const { config, data: collectionItemData } = collectionSaveOrUpdateResponse;
      let collectionName = '';
      if (form.hasAttribute('action')) {
        collectionName = config.url;
        collectionName = collectionName.split('collection-form/')[1];
        collectionName = collectionName.split('/items')[0];
      } else collectionName = 'user';
      const collectionItemId = collectionItemData.uuid;
      const collectionKey = `collection_${collectionName}`;
      const collectionItemUuidKey = 'uuid';
      const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };

      if (
        passPreviousActionResponse &&
        (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
      ) {
        setDataInSessionStorageLocation(
          responseDataSessionStorageLocation,
          responseDataSessionKey,
          collectionData,
        );
      } else {
        // Fallback handling
        // TODO: Ali -> Remove after complete migration
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...collectionData }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
        }
      }
      response.data = { ...response.data, ...collectionData };
      resetCollectionForm(form);
      if (successMessage) {
        toastr.success(successMessage, 'Success');
      }

      if (enableLoginUser) {
        if (!data.password) {
          data.password = generateTemporaryPassword();
        }
        if (!data.userName) {
          data.userName = 'anonymous-user-login';
        }
        const loginFormData = {
          userName: data.userName,
          password: data.password,
        };
        if (data.hasOwnProperty('email') && data.email !== '') {
          loginFormData.email = data.email;
          validateLoginFormData(data, loginFormData);
        }
        await loginIntoApplication(args, loginFormData, redirectUrl, null, null);
      }
    } catch (error) {
      console.error('error :>> ', error);
      if (error.response) {
        response.data = error.response;
        response.data.collectionSaveOrUpdateResponse = error.response;
        response.status = 'error';
      }
      if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      } else if (error.response.data) {
        toastr.error(error.response.data, 'Error');
      }
    } finally {
      actionCompleted(args);
    }
    // Action Exit Custom Log
    if (enableConsoleLog) {
      const endLog = cleanConsoleLogArgs(endConsoleLog);
      logActionMessage(endLog);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const saveCollectionWithReferenceItems = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = getFormElement(args);
    let data = await serializeFormData(form.elements);
    const {
      constructor,
      // collectionRequest,
      createReferenceFields,
      collectionRefFields,
      passPreviousActionFormData,
      saveReferenceItemsToSession,
      successMessage,
      errorMessage,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      referenceItemSessionKey,
      referenceItemSessionStorageLocation,
      enableConsoleLog,
      startConsoleLog,
      endConsoleLog,
    } = args.parameters;
    const config = {
      constructor,
      createReferenceFields,
      collectionRefFields,
      passPreviousActionFormData,
      saveReferenceItemsToSession,
      successMessage,
      errorMessage,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      referenceItemSessionKey,
      referenceItemSessionStorageLocation,
      enableConsoleLog,
      endConsoleLog,
    };
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    if (form.hasAttribute('action')) {
      let endpoint = form.getAttribute('action');
      endpoint = 'open/' + endpoint;
      let collectionName = '';
      collectionName = endpoint;
      collectionName = collectionName.split('collection-form/')[1];
      collectionName = collectionName.split('/items')[0];
      const { data: collectionItem, fields } = await saveEmptyItemToCollection(
        collectionName,
        '',
        data,
      );
      resetCollectionForm(form);
      return await saveDataWithReferenceField(args, data, config, endpoint, collectionItem, fields);
    }
  } else {
    return disabledActionResponse(args);
  }
};

const updateCollectionWithReferenceItems = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = getFormElement(args);
    let data = await serializeFormData(form.elements);
    const {
      constructor,
      // collectionRequest,
      createReferenceFields,
      collectionRefFields,
      passPreviousActionFormData,
      saveReferenceItemsToSession,
      successMessage,
      errorMessage,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      referenceItemSessionKey,
      referenceItemSessionStorageLocation,
      enableConsoleLog,
      startConsoleLog,
      endConsoleLog,
    } = args.parameters;
    const config = {
      constructor,
      createReferenceFields,
      collectionRefFields,
      passPreviousActionFormData,
      saveReferenceItemsToSession,
      successMessage,
      errorMessage,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      referenceItemSessionKey,
      referenceItemSessionStorageLocation,
      enableConsoleLog,
      endConsoleLog,
    };
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    if (form.hasAttribute('action')) {
      let endpoint = form.getAttribute('action');
      const { itemId } = await checkAndUpdateItemId(form);
      if (itemId) endpoint = getNewEndPointUrl(itemId, endpoint);
      endpoint = 'open/' + endpoint;
      let collectionName = '';
      let collectionItemId = '';
      collectionName = endpoint;
      const formUrl = collectionName.split('collection-form/')[1];
      collectionName = formUrl.split('/items/')[0];
      collectionItemId = formUrl.split('/items/')[1];
      const collectionItem = await getCollectionItemById(collectionName, collectionItemId);
      resetCollectionForm(form);
      const { fields } = await getCollectionDetails(collectionName);
      return await saveDataWithReferenceField(
        args,
        data,
        config,
        endpoint,
        collectionItem,
        fields,
        'PUT',
      );
    }
  } else {
    return disabledActionResponse(args);
  }
};

const saveDataWithReferenceField = async (
  args,
  data,
  config,
  endpoint,
  collectionItem = {},
  collectionFields,
  apiCallType = 'POST',
) => {
  const {
    constructor,
    createReferenceFields,
    collectionRefFields,
    passPreviousActionFormData,
    saveReferenceItemsToSession,
    successMessage,
    errorMessage,
    formDataSessionKey,
    formDataBrowserStorageLocation,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    referenceItemSessionKey,
    referenceItemSessionStorageLocation,
    enableConsoleLog,
    endConsoleLog,
  } = config;
  const itemId = collectionItem && collectionItem?.uuid ? collectionItem.uuid : '';
  if (createReferenceFields) {
    console.log('we are inside save reference field');
    data = await setDataWithEmptyReferenceField(
      data,
      collectionRefFields,
      collectionItem,
      collectionFields,
      saveReferenceItemsToSession,
      referenceItemSessionKey,
      referenceItemSessionStorageLocation,
    );
  }
  let cleanFormDataForSession = clearDataForSessionStorage(data);

  // Need this for Request Type support
  // let isSecuredCall = true;
  // if (!collectionRequest || collectionRequest == 'Open') isSecuredCall = false;
  if (
    passPreviousActionFormData &&
    (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
  ) {
    if (formDataBrowserStorageLocation && formDataSessionKey) {
      setDataInSessionStorageLocation(
        formDataBrowserStorageLocation,
        formDataSessionKey,
        cleanFormDataForSession,
      );
    } else {
      // Fallback handling
      // TODO: Ali -> Remove after complete migration
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      if (previousActionFormData) {
        previousActionFormData = JSON.parse(previousActionFormData);
        sessionStorage.setItem(
          'previousActionFormData',
          JSON.stringify({ ...previousActionFormData, ...cleanFormDataForSession }),
        );
      } else {
        sessionStorage.setItem('previousActionFormData', JSON.stringify(cleanFormDataForSession));
      }
    }
  }

  let collectionName = '';
  collectionName = endpoint;
  collectionName = collectionName.split('collection-form/')[1];
  collectionName = collectionName.split('/items')[0];

  // Need this for Constructor support
  if (collectionName && constructor) {
    const ipAddress = await getIPAddress();
    let navigator = {};
    _.merge(navigator, window.navigator);

    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    // Get Browser Storage Data Object
    const browserData = await getBrowserData();

    data['constructorMetaObj'] = {
      collectionName,
      constructorId: constructor,
      ipAddress: ipAddress ?? '',
      navigator: navigator,
      ...browserData,
      previousActionResponse,
      previousActionFormData,
    };
  }

  // let method = form.getAttribute('method');
  let response = {};
  let apiCallResult;
  try {
    // Need this for Request Type support
    // if (isSecuredCall) {
    //   apiCallResult = await securedPostCall(data, endpoint);
    // } else {
    //   endpoint = 'open/' + endpoint;
    //   apiCallResult = await unSecuredPostCall(data, endpoint);
    // }
    if (apiCallType === 'POST') {
      // Need this for Constructor support
      endpoint += '/' + itemId;
      apiCallResult = await unSecuredPutCall(data, endpoint);
    } else if (apiCallType === 'PUT') {
      apiCallResult = await unSecuredPutCall(data, endpoint);
    }
    response.data = apiCallResult;
    response.data.collectionSaveOrUpdateResponse = apiCallResult;
    response.data.collectionFormData = cleanFormDataForSession;
    response.status = 'success';
    const { collectionSaveOrUpdateResponse } = response.data;
    const { data: collectionItemData } = collectionSaveOrUpdateResponse;
    const collectionData = saveItemsToPreviousActionResponse(
      collectionName,
      collectionItemData?.uuid,
      'uuid',
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
    );
    response.data = { ...response.data, ...collectionData };
    if (successMessage) toastr.success(successMessage, 'Success');
  } catch (error) {
    console.error('error :>> ', error);
    if (error.response) {
      response.data = error.response;
      response.data.collectionSaveOrUpdateResponse = error.response;
      response.status = 'error';
    }
    if (errorMessage) {
      toastr.error(errorMessage, 'Error');
    } else if (error.response.data) {
      toastr.error(error.response.data, 'Error');
    }
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const setDataWithEmptyReferenceField = async (
  data,
  referenceFields,
  collectionItem,
  collectionFields,
  saveReferenceItemsToSession = false,
  referenceItemSessionKey,
  referenceItemSessionStorageLocation,
) => {
  const promises = referenceFields.map(async (item) => {
    const [field, collectionName] = item.split(':');
    const { data } = await saveEmptyItemToCollection(collectionName, collectionItem?.uuid);
    return { field, collectionName, item: data };
  });
  const items = await Promise.all(promises);
  items.forEach(({ field, collectionName, item }) => {
    const collectionField = collectionFields.find((fld) => fld.fieldName === field);
    if (item) {
      if (collectionField.isMultiSelect) {
        const oldRefItemIds = collectionItem[field].map((ref) => ref?.uuid).filter(Boolean);
        data[field] = [...oldRefItemIds, item.uuid];
      } else data[field] = [item.uuid];
      if (saveReferenceItemsToSession) {
        saveItemsToPreviousActionResponse(
          collectionName,
          item.uuid,
          'uuid',
          saveReferenceItemsToSession,
          referenceItemSessionKey,
          referenceItemSessionStorageLocation,
        );
      }
    }
  });
  return data;
};

const saveEmptyItemToCollection = async (collectionName, itemId = '', userData = {}) => {
  const DefaultSystemCreatedFields = [
    'uuid',
    'createdBy',
    'isDeleted',
    'updatedAt',
    'createdAt',
    'tenantId',
  ];
  const arrayFields = ['reference', 'static_option', 'dynamic_option'];
  const collectionData = {};
  const { fields } = await getCollectionDetails(collectionName);
  fields.forEach((field) => {
    if (!DefaultSystemCreatedFields.includes(field.fieldName)) {
      let value = '';
      if (arrayFields.includes(field.type)) {
        value = [];
      } else if (field.type === 'belongsTo') {
        value = itemId ? [itemId] : [];
      }
      collectionData[field.fieldName] = value;
    }
  });
  const endpoint = `open/collection-form/${collectionName}/items/`;
  try {
    if (collectionName === 'user') {
      collectionData['userName'] = userData['userName'];
      collectionData['password'] = userData['password'];
      collectionData['userRoles'] = userData['userRoles'];
    }
    const { data } = await unSecuredPostCall(collectionData, endpoint);
    return { data, fields };
  } catch (error) {
    console.error('\n error :>> ', error);
    if (error.response) {
      response.data = error.response;
      response.data.collectionSaveOrUpdateResponse = error.response;
      response.status = 'error';
    }
  }
};

const saveItemsToPreviousActionResponse = (
  collectionName,
  collectionItemId,
  collectionItemUuidKey,
  passPreviousActionResponse,
  responseDataSessionKey,
  responseDataSessionStorageLocation,
) => {
  const collectionKey = `collection_${collectionName}`;
  const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };

  if (
    passPreviousActionResponse &&
    (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
  ) {
    if (responseDataSessionStorageLocation && responseDataSessionKey) {
      setDataInSessionStorageLocation(
        responseDataSessionStorageLocation,
        responseDataSessionKey,
        collectionData,
      );
    } else {
      // Fallback handling
      // TODO: Ali -> Remove after complete migration
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ ...previousActionResponse, ...collectionData }),
        );
      } else {
        sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
      }
    }
  }
  return collectionData;
};

//TODO: Refactoring needed
const sendDataToExternalApiAndFileDownload = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement, element: target } = args;
    const {
      webhookId,
      passPreviousActionResponse,
      passPreviousActionFormData,
      bodyDataFrom,
      sendFormData,
      sessionValue,
    } = parameters;
    let collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    const previousResponse = args.response;
    // collectionItemId = previousResponse ? previousResponse.data['uuid'] : collectionItemId;
    collectionItemId = collectionItemId ? collectionItemId : '';

    let data = {};
    let response = {};
    let downloadResponse = {};
    let externalAPIResult = {};
    let externalAPIData = {};
    let fromTargetElem = false;

    try {
      if (webhookId) {
        fromTargetElem = !!collectionItemId;
        let externalApiEndpoint = 'external-api';

        externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${webhookId}`);

        if (externalAPIResult && externalAPIResult.status === 200) {
          externalAPIData = externalAPIResult.data;
        }

        let bodyDataFrom = 'noDynamicData';
        let requestDataJsonType = '';

        if (externalAPIData) {
          bodyDataFrom = externalAPIData.bodyDataFrom;
          requestDataJsonType = externalAPIData.requestDataJsonType;
        }

        if (
          bodyDataFrom &&
          ['formData', 'formDataUrlEncoded', 'NON_PERSISTENT_COLLECTION'].includes(bodyDataFrom)
        ) {
          if (targetElement && targetElement.tagName === 'FORM') {
            data = await serializeFormData(args.element.elements, true, true);
          }
        }
        if (bodyDataFrom && bodyDataFrom === 'urlQueryParams') {
          //TODO:handle query params
        }

        const { sendFormData } = externalAPIData ? externalAPIData : false;

        let finalSessionValue = {};
        let previousFormData = {};
        if (!collectionItemId) {
          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          if (previousActionResponse) {
            previousActionResponse = JSON.parse(previousActionResponse);
            let collectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
            if (!collectionItemId && previousActionResponse[collectionKey]) {
              let collectionName = previousActionResponse[collectionKey].name;
              collectionItemId = previousActionResponse[collectionKey].uuid;
            }
          }
          if (!collectionItemId && previousResponse) {
            const { collectionSaveOrUpdateResponse } = previousResponse;
            if (collectionSaveOrUpdateResponse) {
              const { data: collectionItemData } = collectionSaveOrUpdateResponse;
              collectionItemId = collectionItemData.uuid;
            }
          }
          if (collectionItemId) {
            fromTargetElem = false;
          }
        }

        if (
          (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
          collectionItemId &&
          !sendFormData
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        } else if (
          collectionItemId &&
          bodyDataFrom === 'NON_PERSISTENT_COLLECTION' &&
          ['CUSTOM', 'FORM_DATA', 'FORM_URL_ENCODED'].includes(requestDataJsonType) &&
          !sendFormData
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        } else if (
          collectionItemId &&
          (bodyDataFrom === 'collectionItemAndFormData' ||
            (bodyDataFrom === 'collectionItem' && sendFormData))
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
          let formData = await loadFormData(targetElement, data, args, true);
          if (previousResponse['collectionFormData']) {
            data = {
              ...formData,
              ...previousResponse['collectionFormData'],
            };
          } else {
            data = formData;
          }
        }

        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);

          if (Object.keys(previousActionResponse).length > 0) {
            finalSessionValue = getFinalSessionValues(
              finalSessionValue,
              previousActionResponse,
              externalAPIData,
              'current_session',
            );
          }
        }
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);

          if (Object.keys(previousActionFormData).length > 0) {
            previousFormData = getFinalSessionValues(
              previousFormData,
              previousActionFormData,
              externalAPIData,
              'form_data_session',
            );
          }
        }
        const targetElemObj = { targetElement, target };
        checkAndLoadNonPersistentItemId(
          bodyDataFrom,
          collectionItemId,
          targetElemObj,
          data,
          externalAPIData,
          fromTargetElem,
        );

        let body = {
          data,
          externalApiId: webhookId,
          sessionValue: finalSessionValue,
          sessionFormValue: previousFormData,
        };
        downloadResponse = await downloadFile(externalApiEndpoint, body);
        if (downloadResponse.failed) {
          response.status = 'error';
          response.data = {
            ...previousResponse,
            errorResponse: { ...previousResponse.errorResponse, ...downloadResponse.data },
          };
          response.data.externalApiResponse = downloadResponse.data;
          let downloadError = 'Failed to process Request';
          if (downloadResponse.data) {
            downloadError = downloadResponse.data.message || downloadResponse.data;
          }
          toastr.error(downloadError, 'Error');
          if (passPreviousActionResponse || passPreviousActionResponse === 'true') {
            let previousActionResponse = sessionStorage.getItem('previousActionResponse');
            if (previousActionResponse) {
              previousActionResponse = JSON.parse(previousActionResponse);
              sessionStorage.setItem(
                'previousActionResponse',
                JSON.stringify({
                  ...previousActionResponse,
                  errorResponse: {
                    ...previousActionResponse.errorResponse,
                    ...downloadResponse.data,
                  },
                }),
              );
            } else {
              sessionStorage.setItem(
                'previousActionResponse',
                JSON.stringify({ errorResponse: downloadResponse.data }),
              );
            }
          }
          if (passPreviousActionFormData || passPreviousActionFormData === 'true') {
            let previousActionFormData = sessionStorage.getItem('previousActionFormData');
            if (previousActionFormData) {
              previousActionFormData = JSON.parse(previousActionFormData);
              sessionStorage.setItem(
                'previousActionFormData',
                JSON.stringify({ ...previousActionFormData, ...data }),
              );
            } else {
              sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
            }
          }
        } else {
          response.data = { ...previousResponse };
          response.status = 'success';
        }
      }
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
        toastr.error(errorMsg, 'Error');
        response.data = error.response;
        response.data.externalApiResponse = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};
const getSessionValueFromString = (jsonString, finalSessionValue, sessionData, currentDataKey) => {
  jsonString.match(/{{(.*?)}}/g)?.forEach((key) => {
    let keyArr = key.split(/{{(.*?)}}/g);
    let currentDataKeyValueArr =
      keyArr &&
      keyArr.length > 0 &&
      keyArr.filter((keyObj) => !!keyObj && keyObj.startsWith(currentDataKey));

    currentDataKeyValueArr &&
      currentDataKeyValueArr.length > 0 &&
      currentDataKeyValueArr.forEach((currentDataKeyValue) => {
        currentDataKeyValue = currentDataKeyValue.replace(/{{(.*?)}}/g, '$1');
        if (currentDataKeyValue.startsWith(currentDataKey)) {
          currentDataKeyValue = currentDataKeyValue.replace(currentDataKey + '.', '');
          _.merge(
            finalSessionValue,
            _.zipObjectDeep([currentDataKeyValue], [_.get(sessionData, currentDataKeyValue)]),
          );
        }
      });
  });
  return finalSessionValue;
};

const getSessionValueFromObject = (
  currentDataObjArray,
  finalSessionValue,
  sessionData,
  currentDataKey,
) => {
  currentDataObjArray.forEach((obj) => {
    let { value } = obj;
    if (value) {
      let valueArr = value.split(/{{(.*?)}}/g);
      let currentDataKeyValueArr =
        valueArr &&
        valueArr.length > 0 &&
        valueArr.filter((valObj) => !!valObj && valObj.startsWith(currentDataKey));
      currentDataKeyValueArr &&
        currentDataKeyValueArr.length > 0 &&
        currentDataKeyValueArr.forEach((currentDataKeyValue) => {
          value = currentDataKeyValue.replace(/{{(.*?)}}/g, '$1');
          if (currentDataKeyValue.startsWith(currentDataKey)) {
            currentDataKeyValue = currentDataKeyValue.replace(currentDataKey + '.', '');
            _.merge(
              finalSessionValue,
              _.zipObjectDeep([currentDataKeyValue], [_.get(sessionData, currentDataKeyValue)]),
            );
          }
        });
    }
  });
  return finalSessionValue;
};

const getFinalSessionValues = (
  finalSessionValue,
  previousResponse,
  externalAPIData,
  currentDataKey,
) => {
  const { bodyCustomJSON, bodyRawJSON, setting } = externalAPIData || {};
  const { url, headers, params } = setting || {};
  // Get Session Value to send from Custom Body
  if (bodyCustomJSON) {
    finalSessionValue = getSessionValueFromString(
      bodyCustomJSON,
      finalSessionValue,
      previousResponse,
      currentDataKey,
    );
  }
  // Get Session Value to send from Raw Body
  if (bodyRawJSON) {
    finalSessionValue = getSessionValueFromString(
      bodyRawJSON,
      finalSessionValue,
      previousResponse,
      currentDataKey,
    );
  }
  // Get Session Value to send from Url
  if (url) {
    finalSessionValue = getSessionValueFromString(
      url,
      finalSessionValue,
      previousResponse,
      currentDataKey,
    );
  }
  if (headers && Object.keys(headers).length > 0) {
    finalSessionValue = getSessionValueFromObject(
      headers,
      finalSessionValue,
      previousResponse,
      currentDataKey,
    );
  }
  if (params && Object.keys(params).length > 0) {
    finalSessionValue = getSessionValueFromObject(
      params,
      finalSessionValue,
      previousResponse,
      currentDataKey,
    );
  }
  return finalSessionValue;
};
//TODO: Refactoring needed
const sendDataToExternalApi = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement, element: target } = args;
    const {
      webhookId: externalApiId,
      passPreviousActionResponse,
      passPreviousActionFormData,
      successMessage,
      overrideBrowserSessionValuesKey,
      overrideBrowserSessionFormDataValuesKey,
      overriddenSessionKeyRules,
      overriddenSessionFormDataKeyRules,
      overrideResponseDataKey,
      overrideFormDataKey,
      overriddenCustomJsonKey,
      overriddenFormCustomJsonKey,
      sendPreviousActionResponseItemId,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      enableConsoleLog,
      startConsoleLog,
      endConsoleLog,
    } = parameters;

    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }

    let collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';

    if (targetElement && targetElement.tagName === 'FORM') {
      let action = targetElement.getAttribute('action');
      collectionItemId = action ? action.split('collection-form/')[1] : '';
      collectionItemId = collectionItemId ? collectionItemId.split('/items/')[1] : '';
    }

    const previousResponse = args.response;
    collectionItemId = collectionItemId ? collectionItemId : '';

    let data = {};
    let response = {};
    let result = {};
    let externalAPIResult = {};
    let externalAPIData = {};
    let fromTargetElem = false;

    try {
      if (externalApiId) {
        fromTargetElem = !!collectionItemId;
        let externalApiEndpoint = 'external-api';
        externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${externalApiId}`);

        if (externalAPIResult && externalAPIResult.status === 200) {
          externalAPIData = externalAPIResult.data;
        }

        let bodyDataFrom = 'noDynamicData';
        let requestDataJsonType = '';

        if (externalAPIData) {
          bodyDataFrom = externalAPIData.bodyDataFrom;
          requestDataJsonType = externalAPIData.requestDataJsonType;
        }
        const { sendFormData } = externalAPIData ? externalAPIData : false;
        if (
          bodyDataFrom &&
          ['formData', 'formDataUrlEncoded', 'NON_PERSISTENT_COLLECTION'].includes(bodyDataFrom)
        ) {
          const formElem = targetElement ? targetElement.closest('FORM') : '';
          if (formElem && formElem.tagName === 'FORM') {
            // Handle Form Data with Form Submit
            data = await serializeFormData(formElem.elements, false, true);
          } else {
            data = await loadFormData(targetElement, data, args, true);
          }
        }
        if (bodyDataFrom && bodyDataFrom === 'urlQueryParams') {
          //TODO:handle query params
        }

        let finalSessionValue = {};
        let previousFormData = {};
        let sessionStorageValue = {};
        let localStorageValue = {};
        let cookiesValue = {};

        //? Assign/override collectionItemId with Previous Action Response Item ID
        if (sendPreviousActionResponseItemId && previousResponse) {
          const { collectionSaveOrUpdateResponse } = previousResponse;
          if (collectionSaveOrUpdateResponse) {
            const { data: collectionItemData } = collectionSaveOrUpdateResponse;
            collectionItemId = collectionItemData.uuid;
          }
        }

        if (!collectionItemId) {
          if (!collectionItemId && previousResponse) {
            const { collectionSaveOrUpdateResponse } = previousResponse;
            if (collectionSaveOrUpdateResponse) {
              const { data: collectionItemData } = collectionSaveOrUpdateResponse;
              collectionItemId = collectionItemData.uuid;
            }
          }

          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          if (previousActionResponse) {
            previousActionResponse = JSON.parse(previousActionResponse);
            let collectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
            if (!collectionItemId && previousActionResponse[collectionKey]) {
              let collectionName = previousActionResponse[collectionKey].name;
              collectionItemId = previousActionResponse[collectionKey].uuid;
            }
          }
          if (collectionItemId) {
            fromTargetElem = false;
          }
        }

        if (
          (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
          collectionItemId &&
          !sendFormData
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        } else if (
          collectionItemId &&
          bodyDataFrom === 'NON_PERSISTENT_COLLECTION' &&
          ['CUSTOM', 'FORM_DATA', 'FORM_URL_ENCODED'].includes(requestDataJsonType) &&
          !sendFormData
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        } else if (
          collectionItemId &&
          (bodyDataFrom === 'collectionItemAndFormData' ||
            (bodyDataFrom === 'collectionItem' && sendFormData))
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
          let formData = await loadFormData(targetElement, data, args, true);
          if (previousResponse['collectionFormData']) {
            data = {
              ...formData,
              ...previousResponse['collectionFormData'],
            };
          } else {
            data = formData;
          }
        }

        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);

          if (Object.keys(previousActionResponse).length > 0) {
            finalSessionValue = getFinalSessionValues(
              finalSessionValue,
              previousActionResponse,
              externalAPIData,
              'current_session',
            );
          }
        }
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);

          if (Object.keys(previousActionFormData).length > 0) {
            previousFormData = getFinalSessionValues(
              previousFormData,
              previousActionFormData,
              externalAPIData,
              'form_data_session',
            );
          }
        }
        sessionStorageValue = await getBrowserStorageValuesForExternalAPI(
          sessionStorageValue,
          externalAPIData,
          'SESSION_STORAGE',
        );
        localStorageValue = await getBrowserStorageValuesForExternalAPI(
          localStorageValue,
          externalAPIData,
          'LOCAL_STORAGE',
        );
        cookiesValue = await getBrowserStorageValuesForExternalAPI(
          cookiesValue,
          externalAPIData,
          'COOKIES',
        );
        const targetElemObj = { targetElement, target };
        checkAndLoadNonPersistentItemId(
          bodyDataFrom,
          collectionItemId,
          targetElemObj,
          data,
          externalAPIData,
          fromTargetElem,
        );

        const browserStorageData = {
          sessionStorageData: sessionStorageValue,
          localStorageData: localStorageValue,
          cookiesData: cookiesValue,
        };

        let body = {
          data,
          externalApiId: externalApiId,
          sessionValue: finalSessionValue,
          sessionFormValue: previousFormData,
          browserStorageDTO: browserStorageData,
        };
        result = await unSecuredPostCall(body, externalApiEndpoint);
        response.data = { ...previousResponse, ...result };
        response.data.externalApiResponse = result;
        response.status = 'success';

        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      }
      if (
        passPreviousActionResponse &&
        (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
      ) {
        if (responseDataSessionStorageLocation && responseDataSessionKey) {
          setDataInSessionStorageLocation(
            responseDataSessionStorageLocation,
            responseDataSessionKey,
            result && result.data ? { ...result.data } : {},
          );
        } else {
          // Fallback handling
          // TODO: Ali -> Remove after complete migration
          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          let externalApiResponseData = {};
          //Save Response in Custom JSON Key
          if (overrideResponseDataKey && overriddenCustomJsonKey && result.data) {
            externalApiResponseData[overriddenCustomJsonKey.toString()] = {
              ...result.data,
            };
          } else {
            externalApiResponseData = result && result.data ? { ...result.data } : {};
          }

          //Override Response Each Record JSON Key
          if (overrideBrowserSessionValuesKey && overriddenSessionKeyRules && result.data) {
            let keysToRemove = [];
            overriddenSessionKeyRules.map((overriddenSessionKeyRule) => {
              let originalSessionKey =
                overrideResponseDataKey && overriddenCustomJsonKey
                  ? `${overriddenCustomJsonKey.toString()}.${
                      overriddenSessionKeyRule.originalSessionKey
                    }`
                  : overriddenSessionKeyRule.originalSessionKey;
              addCustomKeyInObj(
                externalApiResponseData,
                originalSessionKey,
                overriddenSessionKeyRule.overriddenSessionKey,
              );
              keysToRemove.push(originalSessionKey);
            });
            externalApiResponseData = _.omit(externalApiResponseData, keysToRemove);
          }

          if (previousActionResponse) {
            previousActionResponse = JSON.parse(previousActionResponse);
            sessionStorage.setItem(
              'previousActionResponse',
              JSON.stringify({ ...previousActionResponse, ...externalApiResponseData }),
            );
          } else {
            sessionStorage.setItem(
              'previousActionResponse',
              JSON.stringify(externalApiResponseData),
            );
          }
        }
      }
      if (
        passPreviousActionFormData &&
        (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
      ) {
        if (formDataBrowserStorageLocation && formDataSessionKey) {
          setDataInSessionStorageLocation(
            formDataBrowserStorageLocation,
            formDataSessionKey,
            data ? { ...data } : {},
          );
        } else {
          // Fallback handling
          // TODO: Ali -> Remove after complete migration
          let previousActionFormData = sessionStorage.getItem('previousActionFormData');
          let formData = {};
          //Save Form Data in Custom JSON Key
          if (overrideFormDataKey && overriddenFormCustomJsonKey && data) {
            formData[overriddenFormCustomJsonKey.toString()] = {
              ...data,
            };
          } else {
            formData = data ? { ...data } : {};
          }

          //Override Form Data Each Record JSON Key
          if (
            overrideBrowserSessionFormDataValuesKey &&
            overriddenSessionFormDataKeyRules &&
            result.data
          ) {
            let keysToRemove = [];
            overriddenSessionFormDataKeyRules.map((overriddenSessionKeyRule) => {
              let originalSessionKey =
                overrideFormDataKey && overriddenFormCustomJsonKey
                  ? `${overriddenFormCustomJsonKey.toString()}.${
                      overriddenSessionKeyRule.originalSessionKey
                    }`
                  : overriddenSessionKeyRule.originalSessionKey;
              addCustomKeyInObj(
                formData,
                originalSessionKey,
                overriddenSessionKeyRule.overriddenSessionKey,
              );
              keysToRemove.push(originalSessionKey);
            });
            formData = _.omit(formData, keysToRemove);
          }

          if (previousActionFormData) {
            previousActionFormData = JSON.parse(previousActionFormData);
            sessionStorage.setItem(
              'previousActionFormData',
              JSON.stringify({ ...previousActionFormData, ...formData }),
            );
          } else {
            sessionStorage.setItem('previousActionFormData', JSON.stringify(formData));
          }
        }
      }
    } catch (error) {
      console.error('%c==> External API error :>> ', 'color:red', error);
      if (error.response) {
        const { data } = error.response;
        const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
        toastr.error(errorMsg, 'Error');
        response.data = error.response;
        response.data.externalApiResponse = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }

    // Action Exit Custom Log
    if (enableConsoleLog) {
      const endLog = cleanConsoleLogArgs(endConsoleLog);
      logActionMessage(endLog);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const triggerZap = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const {
      webhookId,
      passPreviousActionResponse,
      passPreviousActionFormData,
      sessionValue,
      successMessage,
    } = parameters;
    let collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    const previousResponse = args.response;

    let data = {};
    let response = {};
    let result = {};
    let externalAPIResult = {};
    let externalAPIData = {};

    try {
      if (webhookId) {
        let externalApiEndpoint = 'external-api';
        externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${webhookId}`);

        if (externalAPIResult && externalAPIResult.status === 200) {
          externalAPIData = externalAPIResult.data;
        }
        const zapStatus = externalAPIData ? externalAPIData.setting.enabled : false;
        if (!zapStatus) {
          toastr.error('Zap is not Active');
          throw Error('Zap is not Active');
        }
        if (collectionItemId) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
          data =
            targetElement && targetElement.hasAttribute('data-collection-item')
              ? targetElement.getAttribute('data-collection-item')
              : '';
          data = data ? JSON.parse(data) : {};
        } else if (previousResponse) {
          collectionItemId = previousResponse.data['uuid'];
          if (collectionItemId) {
            externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
            data = previousResponse.data;
          }
        } else {
          data = await loadFormData(targetElement, data, args, true);
        }

        let finalSessionValue = {};
        if (!collectionItemId) {
          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          if (previousActionResponse) {
            previousActionResponse = JSON.parse(previousActionResponse);
            let collectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
            if (previousActionResponse[collectionKey]) {
              let collectionName = previousActionResponse[collectionKey].name;
              collectionItemId = previousActionResponse[collectionKey].uuid;
            }
            if (sessionValue && Object.keys(previousActionResponse).length > 0) {
              sessionValue
                .split(',')
                .forEach((key) => (finalSessionValue[key] = _.get(previousActionResponse, key)));
            }
          }
          if (!collectionItemId && previousResponse) {
            const { collectionSaveOrUpdateResponse } = previousResponse;
            if (collectionSaveOrUpdateResponse) {
              const { data: collectionItemData } = collectionSaveOrUpdateResponse;
              collectionItemId = collectionItemData.uuid;
            }
          }
        }

        if (sessionValue) {
          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          if (previousActionResponse) {
            previousActionResponse = JSON.parse(previousActionResponse);

            if (Object.keys(previousActionResponse).length > 0) {
              sessionValue
                .split(',')
                .forEach((key) => (finalSessionValue[key] = _.get(previousActionResponse, key)));
            }
          }
        }
        let body = { data, externalApiId: webhookId, sessionValue: finalSessionValue };
        result = await unSecuredPostCall(body, externalApiEndpoint);
        response.data = { ...previousResponse, ...result };
        response.data.externalApiResponse = result;
        response.status = 'success';

        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }

        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          sessionStorage.setItem(
            'previousActionFormData',
            JSON.stringify({ ...previousActionFormData, ...data }),
          );
        } else {
          sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
        }
      }
      if (
        passPreviousActionResponse &&
        (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
      ) {
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...result.data }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(result.data));
        }
      }
      if (
        passPreviousActionFormData &&
        (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
      ) {
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          sessionStorage.setItem(
            'previousActionFormData',
            JSON.stringify({ ...previousActionFormData, ...data }),
          );
        } else {
          sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('%c==> triggerZap error :>> ', 'color:red', error);
      if (error.response) {
        const { data } = error.response;
        const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
        toastr.error(errorMsg, 'Error');
        response.data = error.response;
        response.data.externalApiResponse = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const startNewGptConversation = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    return await chatGPTConversation(args, false);
  } else {
    return disabledActionResponse(args);
  }
};

const continueGptConversation = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    return await chatGPTConversation(args, true);
  } else {
    return disabledActionResponse(args);
  }
};

const chatGPTConversation = async (args, continuePrompt = false) => {
  const { parameters, targetElement } = args;
  const {
    chatGptId,
    collectionFields,
    conversationIdField,
    pageCollection,
    successMessage,
    passPreviousActionResponse,
    passPreviousActionFormData,
  } = parameters;
  let { getIdFrom } = parameters;
  let collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
  const previousResponse = args.response;

  let data = {};
  let response = {};
  let result = {};
  let externalAPIResult = {};
  let externalAPIData = {};
  let sessionStorageValue = {};
  let localStorageValue = {};
  let cookiesValue = {};

  try {
    if (chatGptId) {
      let externalApiEndpoint = 'external-api';
      externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${chatGptId}`);
      if (externalAPIResult && externalAPIResult.status === 200) {
        externalAPIData = externalAPIResult.data;
      }
      // TODO: Handling of older events
      if (!getIdFrom) {
        if (pageCollection) {
          getIdFrom = 'pageCollection';
        } else if (collectionItemId) {
          getIdFrom = 'collectionUuid';
        } else if (previousResponse) {
          getIdFrom = 'previousResponse';
        }
      }
      if (getIdFrom) {
        switch (getIdFrom) {
          case 'previousResponse':
            collectionItemId = previousResponse.data['uuid'];
            if (collectionItemId) data = previousResponse.data;
            break;
          case 'pageCollection':
            const pageCollectionData = await getPageItemData();
            collectionItemId = pageCollectionData.collectionItemId;
            break;
          case 'collectionUuid':
          default:
            if (collectionItemId) {
              data =
                targetElement && targetElement.hasAttribute('data-collection-item')
                  ? targetElement.getAttribute('data-collection-item')
                  : '';
              data = data ? JSON.parse(data) : {};
            } else {
              collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
              data = await loadFormData(targetElement, data, args, true);
            }
            break;
        }
      }
      let finalSessionValue = {};
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);

        if (Object.keys(previousActionResponse).length > 0) {
          finalSessionValue = getFinalSessionValues(
            finalSessionValue,
            previousActionResponse,
            externalAPIData,
            'current_session',
          );
        }
      }

      let previousFormData = {};
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      if (previousActionFormData) {
        previousActionFormData = JSON.parse(previousActionFormData);

        if (Object.keys(previousActionFormData).length > 0) {
          previousFormData = getFinalSessionValues(
            previousFormData,
            previousActionFormData,
            externalAPIData,
            'form_data_session',
          );
        }
      }

      sessionStorageValue = await getBrowserStorageValuesForExternalAPI(
        sessionStorageValue,
        externalAPIData,
        'current_session',
      );
      sessionStorageValue = await getBrowserStorageValuesForExternalAPI(
        sessionStorageValue,
        externalAPIData,
        'form_data_session',
      );
      sessionStorageValue = await getBrowserStorageValuesForExternalAPI(
        sessionStorageValue,
        externalAPIData,
        'SESSION_STORAGE',
      );
      localStorageValue = await getBrowserStorageValuesForExternalAPI(
        localStorageValue,
        externalAPIData,
        'LOCAL_STORAGE',
      );
      cookiesValue = await getBrowserStorageValuesForExternalAPI(
        cookiesValue,
        externalAPIData,
        'COOKIES',
      );

      const chatGPTEndPoint = 'chatGPT/prompt';
      const assistantEndpoint = 'assistant' + '/' + chatGPTEndPoint + '/' + collectionItemId;
      let body = {
        data,
        eventData: { collectionFields, pageCollection, conversationIdField, continuePrompt },
        externalApiId: chatGptId,
        sessionValue: finalSessionValue,
        sessionFormValue: previousFormData,
        sessionStorageData: sessionStorageValue,
        localStorageData: localStorageValue,
        cookiesData: cookiesValue,
      };
      result = await unSecuredPostCall(body, assistantEndpoint);
      response.data = { ...previousResponse, ...result };
      response.data.externalApiResponse = result;
      response.status = 'success';

      if (successMessage) {
        toastr.success(successMessage, 'Success');
      }

      if (
        passPreviousActionResponse &&
        (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
      ) {
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...result.data }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(result.data));
        }
      }

      if (
        passPreviousActionFormData &&
        (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
      ) {
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          sessionStorage.setItem(
            'previousActionFormData',
            JSON.stringify({ ...previousActionFormData, ...data }),
          );
        } else {
          sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
        }
      }
    }
  } catch (error) {
    console.error('%c==> chatGPTConversation error :>> ', 'color:red', error);
    if (error.response) {
      const { data } = error.response;
      const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
      toastr.error(errorMsg, 'Error');
      response.data = error.response;
      response.data.externalApiResponse = error.response;
      response.status = 'error';
    }
  } finally {
    actionCompleted(args);
  }
  return response;
};

//TODO: Refactoring needed
const sendDataToExternalApiAndAuthorize = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const {
      webhookId,
      passPreviousActionResponse,
      passPreviousActionFormData,
      bodyDataFrom,
      sendFormData,
      userRole,
      successMessage,
      redirectUrl,
      sessionValue,
    } = parameters;
    let collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    const previousResponse = args.response;
    collectionItemId = previousResponse ? previousResponse.data['uuid'] : collectionItemId;
    let data = {};
    if (bodyDataFrom && bodyDataFrom === 'formData') {
      data = await serializeFormData(args.element.elements, true, true);
    }
    let response = {};
    let result = {};
    if (webhookId && userRole) {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
      }
      let externalApiEndpoint = 'external-api';
      if (!collectionItemId) {
        if (previousActionResponse && Object.keys(previousActionResponse).length > 0) {
          let collectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
          if (previousActionResponse[collectionKey]) {
            let collectionName = previousActionResponse[collectionKey].name;
            collectionItemId = previousActionResponse[collectionKey].uuid;
          }
        }
        if (!collectionItemId && previousResponse) {
          const { collectionSaveOrUpdateResponse } = previousResponse;
          if (collectionSaveOrUpdateResponse) {
            const { data: collectionItemData } = collectionSaveOrUpdateResponse;
            collectionItemId = collectionItemData.uuid;
          }
        }
      }
      if (
        (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
        collectionItemId &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
      } else if (
        collectionItemId &&
        (bodyDataFrom === 'collectionItemAndFormData' ||
          (bodyDataFrom === 'collectionItem' && sendFormData))
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        data = previousResponse['collectionFormData'];
      }
      let finalSessionValue = {};
      if (
        sessionValue &&
        previousActionResponse &&
        Object.keys(previousActionResponse).length > 0
      ) {
        sessionValue
          .split(',')
          .forEach((key) => (finalSessionValue[key] = _.get(previousActionResponse, key)));
      }
      const endpoint = `/login/otp/${externalApiEndpoint}`;
      let response = {};
      try {
        let body = {
          data,
          externalApiId: webhookId,
          userRole,
          userName: 'sdsd',
          password: 'csdcs',
          sessionValue: finalSessionValue,
        };
        let response = await axios.post(endpoint, body, {});
        const loggedInUser = response.data;
        if (response && response.status === 200) {
          let localStorage = window.localStorage;
          localStorage.setItem('token', loggedInUser.token);
          setJsonInLocalStorage('user', loggedInUser.userDetails);
          localStorage.setItem('projectId', loggedInUser.projectId);
          localStorage.setItem('role', loggedInUser.role);
          redirectUrl && (window.location = redirectUrl);
          toastr.success(successMessage, 'Success');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
        }
      } finally {
        actionCompleted(args);
      }
      return response;
    } else {
      toastr.error(`Issue with configuration contact owner`, 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

/**
 * Actions to handle External Source API like: Supabase, Xano, etc
 */

const sendDataToExternalSource = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement, externalSource, element: target } = args;
    const { webhookId, successMessage, sessionKey } = parameters;
    let collectionItemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    let collectionId = '';

    if (targetElement && targetElement.tagName === 'FORM') {
      let action = targetElement.getAttribute('action');
      collectionItemId = action ? action.split('collection-form/')[1] : '';
      collectionItemId = collectionItemId ? collectionItemId.split('/items/')[1] : '';
    }

    const previousResponse = args.response;
    collectionItemId = collectionItemId ? collectionItemId : '';

    let data = {};
    let response = {};
    let result = {};
    let externalAPIResult = {};
    let externalAPIData = {};
    let fromTargetElem = false;

    try {
      if (webhookId) {
        fromTargetElem = !!collectionItemId;
        let externalApiEndpoint = 'external-api';
        externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${webhookId}`);

        if (externalAPIResult && externalAPIResult.status === 200) {
          externalAPIData = externalAPIResult.data;
        }

        let bodyDataFrom = 'noDynamicData';
        let requestDataJsonType = '';

        if (externalAPIData) {
          bodyDataFrom = externalAPIData.bodyDataFrom;
          requestDataJsonType = externalAPIData.requestDataJsonType;
          const { responseDataMapping, collectionName } = externalAPIData || '';
          const { selectedCollectionName } = responseDataMapping || '';
          collectionId = selectedCollectionName; // Response Body Collection
          if (!collectionId) {
            collectionId = collectionName; // Request Body Collection
          }
        }
        if (bodyDataFrom && ['formData', 'NON_PERSISTENT_COLLECTION'].includes(bodyDataFrom)) {
          data = await loadFormData(targetElement, data, args, true);
        }
        if (bodyDataFrom && bodyDataFrom === 'urlQueryParams') {
          //TODO:handle query params
        }

        const { sendFormData } = externalAPIData ? externalAPIData : false;
        let finalSessionValue = {};
        let previousFormData = {};
        let sessionStorageValue = {};
        let localStorageValue = {};
        let cookiesValue = {};

        //* Assign/override collectionItemId with Previous Action Response Item ID
        if (previousResponse) {
          const { collectionSaveOrUpdateResponse } = previousResponse;
          if (collectionSaveOrUpdateResponse) {
            const { data: collectionItemData } = collectionSaveOrUpdateResponse;
            collectionItemId = collectionItemData.uuid;
          }
        }

        if (!collectionItemId) {
          if (!collectionItemId && previousResponse) {
            const { collectionSaveOrUpdateResponse } = previousResponse;
            if (collectionSaveOrUpdateResponse) {
              const { data: collectionItemData } = collectionSaveOrUpdateResponse;
              collectionItemId = collectionItemData.uuid;
            }
          }

          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          if (previousActionResponse) {
            previousActionResponse = JSON.parse(previousActionResponse);
            let collectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
            if (!collectionItemId && previousActionResponse[collectionKey]) {
              let collectionName = previousActionResponse[collectionKey].name;
              collectionItemId = previousActionResponse[collectionKey].uuid;
            }
          }
          if (collectionItemId) {
            fromTargetElem = false;
          }
        }

        if (
          collectionItemId &&
          (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
          !sendFormData
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        } else if (
          collectionItemId &&
          bodyDataFrom === 'NON_PERSISTENT_COLLECTION' &&
          ['CUSTOM', 'FORM_DATA', 'FORM_URL_ENCODED'].includes(requestDataJsonType) &&
          !sendFormData
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        } else if (
          collectionItemId &&
          (bodyDataFrom === 'collectionItemAndFormData' ||
            (bodyDataFrom === 'collectionItem' && sendFormData))
        ) {
          externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
          let formData = await loadFormData(targetElement, data, args, true);
          if (previousResponse['collectionFormData']) {
            data = {
              ...formData,
              ...previousResponse['collectionFormData'],
            };
          } else {
            data = formData;
          }
        }

        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);

          if (Object.keys(previousActionResponse).length > 0) {
            finalSessionValue = getFinalSessionValues(
              finalSessionValue,
              previousActionResponse,
              externalAPIData,
              'current_session',
            );
          }
        }
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);

          if (Object.keys(previousActionFormData).length > 0) {
            previousFormData = getFinalSessionValues(
              previousFormData,
              previousActionFormData,
              externalAPIData,
              'form_data_session',
            );
          }
        }

        sessionStorageValue = await getBrowserStorageValuesForExternalAPI(
          sessionStorageValue,
          externalAPIData,
          'SESSION_STORAGE',
        );
        localStorageValue = await getBrowserStorageValuesForExternalAPI(
          localStorageValue,
          externalAPIData,
          'LOCAL_STORAGE',
        );
        cookiesValue = await getBrowserStorageValuesForExternalAPI(
          cookiesValue,
          externalAPIData,
          'COOKIES',
        );

        const targetElemObj = { targetElement, target };
        checkAndLoadNonPersistentItemId(
          bodyDataFrom,
          collectionItemId,
          targetElemObj,
          data,
          externalAPIData,
          fromTargetElem,
        );

        const browserStorageData = {
          sessionStorageData: sessionStorageValue,
          localStorageData: localStorageValue,
          cookiesData: cookiesValue,
        };

        let body = {
          data,
          externalApiId: webhookId,
          sessionValue: finalSessionValue,
          sessionFormValue: previousFormData,
          browserStorageDTO: browserStorageData,
        };
        result = await unSecuredPostCall(body, externalApiEndpoint);
        response.data = { ...previousResponse, ...result };
        response.data.externalApiResponse = result;
        response.status = 'success';

        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      }
      const externalSourceKey = sessionKey ? `${externalSource}_${sessionKey}` : externalSource;
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      let externalApiResponseData = {};
      //Save API Response Data in Custom JSON Key
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        if (externalSource) {
          if (sessionKey) {
            if (_.get(previousActionResponse, externalSourceKey)) {
              externalApiResponseData[externalSourceKey] =
                result && result.data
                  ? { ..._.get(previousActionResponse, externalSourceKey), ...result.data }
                  : {};
            } else {
              externalApiResponseData[externalSourceKey] =
                result && result.data ? { ...result.data } : {};
            }
          } else if (collectionId) {
            const externalSourceCollectionKey = `${externalSource}_${collectionId}`;
            if (_.get(previousActionResponse, externalSourceCollectionKey)) {
              externalApiResponseData[externalSourceCollectionKey] =
                result && result.data
                  ? {
                      ..._.get(previousActionResponse, externalSourceCollectionKey),
                      ...result.data,
                    }
                  : {};
            } else {
              externalApiResponseData[externalSourceCollectionKey] =
                result && result.data ? { ...result.data } : {};
            }
          } else {
            if (_.get(previousActionResponse, externalSource)) {
              externalApiResponseData[externalSource] =
                result && result.data
                  ? { ..._.get(previousActionResponse, externalSource), ...result.data }
                  : {};
            } else {
              externalApiResponseData[externalSource] =
                result && result.data ? { ...result.data } : {};
            }
          }
        } else {
          externalApiResponseData = result && result.data ? { ...result.data } : {};
        }
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ ...previousActionResponse, ...externalApiResponseData }),
        );
      } else {
        if (externalSource) {
          if (sessionKey) {
            externalApiResponseData[externalSourceKey] =
              result && result.data ? { ...result.data } : {};
          } else if (collectionId) {
            const externalSourceCollectionKey = `${externalSource}_${collectionId}`;
            externalApiResponseData[externalSourceCollectionKey] =
              result && result.data ? { ...result.data } : {};
          } else {
            externalApiResponseData[externalSource] =
              result && result.data ? { ...result.data } : {};
          }
        } else {
          externalApiResponseData = result && result.data ? { ...result.data } : {};
        }
        sessionStorage.setItem('previousActionResponse', JSON.stringify(externalApiResponseData));
      }

      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      let formData = {};
      //Save Form Data in Custom JSON Key
      if (previousActionFormData) {
        previousActionFormData = JSON.parse(previousActionFormData);
        if (externalSource) {
          if (sessionKey) {
            if (_.get(previousActionFormData, externalSourceKey)) {
              formData[externalSourceKey] = data
                ? { ..._.get(previousActionFormData, externalSourceKey), ...data }
                : {};
            } else {
              formData[externalSourceKey] = data ? { ...data } : {};
            }
          } else {
            if (_.get(previousActionFormData, externalSource)) {
              formData[externalSource] = data
                ? { ..._.get(previousActionFormData, externalSource), ...data }
                : {};
            } else {
              formData[externalSource] = data ? { ...data } : {};
            }
          }
        } else {
          formData = data ? { ...data } : {};
        }
        sessionStorage.setItem(
          'previousActionFormData',
          JSON.stringify({ ...previousActionFormData, ...formData }),
        );
      } else {
        if (externalSource) {
          formData[externalSourceKey] = data ? { ...data } : {};
        } else {
          formData = data ? { ...data } : {};
        }
        sessionStorage.setItem('previousActionFormData', JSON.stringify(formData));
      }
    } catch (error) {
      console.error('%c==> External Source External API error :>> ', 'color:red', error);
      if (error.response) {
        const { data } = error.response;
        const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
        toastr.error(errorMsg, 'Error');
        response.data = error.response;
        response.data.externalApiResponse = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const authorizeWithExternalDataSource = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement, externalSource } = args;
    const {
      webhookId,
      bodyDataFrom,
      sendFormData,
      successMessage,
      redirectUrl,
      redirectRules,
      sessionKey,
    } = parameters;
    let { userRole } = parameters;
    let collectionItemId = targetElement.getAttribute('data-item-id');
    const previousResponse = args.response;
    collectionItemId = previousResponse ? previousResponse.data['uuid'] : collectionItemId;
    let data = {};
    if (bodyDataFrom && bodyDataFrom === 'formData') {
      data = await serializeFormData(args.element.elements, true, true);
    }
    if (bodyDataFrom && bodyDataFrom === 'urlQueryParams') {
      //TODO:handle query params
    }

    let response = {};
    let result = {};
    if (webhookId) {
      let externalApiEndpoint = 'external-api';
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
      }
      if (!collectionItemId) {
        if (previousActionResponse && Object.keys(previousActionResponse).length > 0) {
          let collectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
          if (previousActionResponse[collectionKey]) {
            let collectionName = previousActionResponse[collectionKey].name;
            collectionItemId = previousActionResponse[collectionKey].uuid;
          }
        }
        if (!collectionItemId && previousResponse) {
          const { collectionSaveOrUpdateResponse } = previousResponse;
          if (collectionSaveOrUpdateResponse) {
            const { data: collectionItemData } = collectionSaveOrUpdateResponse;
            collectionItemId = collectionItemData.uuid;
          }
        }
      }
      if (
        (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
        collectionItemId &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
      } else if (
        collectionItemId &&
        (bodyDataFrom === 'collectionItemAndFormData' ||
          (bodyDataFrom === 'collectionItem' && sendFormData))
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
        data = previousResponse['collectionFormData'];
      }
      const externalSourceKey = sessionKey ? `${externalSource}_${sessionKey}` : externalSource;
      let finalSessionValue = {};
      let sessionDTS = [];
      switch (externalSource) {
        case 'SUPABASE':
          sessionDTS = [
            `${externalSourceKey}.access_token`,
            `${externalSourceKey}.user.user_metadata.user_role`,
          ];
          break;
        default:
          break;
      }

      if (sessionDTS && previousActionResponse && Object.keys(previousActionResponse).length > 0) {
        sessionDTS.forEach((key) => {
          finalSessionValue = setNestedProp(
            finalSessionValue,
            key.split('.'),
            _.get(previousActionResponse, key),
          );
          return finalSessionValue;
        });
      }
      let userRoleSessionKey = '';
      switch (externalSource) {
        case 'SUPABASE':
          userRoleSessionKey = `${externalSourceKey}.user.user_metadata.user_role`;
          userRole = _.get(finalSessionValue, userRoleSessionKey);
          break;
        default:
          break;
      }

      const endpoint = `/login/otp/${externalApiEndpoint}`;
      let response = {};
      try {
        let body = {
          data,
          externalApiId: webhookId,
          userRole,
          userName: 'sdsd',
          password: 'csdcs',
          sessionValue: finalSessionValue,
        };
        let response = await axios.post(endpoint, body, {});
        const loggedInUser = response.data;
        if (response && response.status === 200) {
          let localStorage = window.localStorage;
          localStorage.setItem('token', loggedInUser.token);
          setJsonInLocalStorage('user', loggedInUser.userDetails);
          localStorage.setItem('projectId', loggedInUser.projectId);
          localStorage.setItem('role', loggedInUser.role);
          toastr.success(successMessage, 'Success');
          redirectUrl && (window.location = redirectUrl);

          if (redirectRules && redirectRules.length) {
            handlePageRedirection(loggedInUser, '', redirectRules);
          }
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
        }
      } finally {
        actionCompleted(args);
      }
      return response;
    } else {
      toastr.error(`Issue with configuration contact owner`, 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const createLoanRepayments = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, response } = args;
    let form = args.element;
    return sendToCreateRepayment(args, form);
  } else {
    return disabledActionResponse(args);
  }
};

const sendToCreateRepayment = async (args, form) => {
  const { parameters } = args;
  const { interestTypes } = parameters;
  let isSecuredCall = true;

  const { data } = args.response;
  let endpoint = 'loan-manage/generate-repayment';
  let collectionItemId = data.uuid;

  const body = {
    loanApplicationId: collectionItemId,
    interestTypes: interestTypes,
  };
  let response = {};
  let apiCallResult;
  try {
    apiCallResult = await unSecuredPostCall(body, endpoint);
    response.data = apiCallResult;
    response.data.collectionSaveOrUpdateResponse = apiCallResult;
    response.status = 'success';
  } catch (error) {
    console.error('\n error :>> ', error);
    if (error.response) {
      response.data = error.response;
      response.status = 'error';
    }
    if (error.response.data) {
      toastr.error(error.response.data, 'Error');
    }
  } finally {
    actionCompleted(args);
  }
  return response;
};

const updateCollection = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = args.element;
    return updateCollectionData(args, form, false);
  } else {
    return disabledActionResponse(args);
  }
};

const updateCollectionDraft = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = getFormElement(args);
    return updateCollectionData(args, form, true);
  } else {
    return disabledActionResponse(args);
  }
};
const getInputElement = (args) => {
  const { element, targetElement } = args;
  let input = element;
  if (input.tagName !== 'INPUT') {
    input = targetElement
      ? targetElement.closest('INPUT')
      : element
        ? element.closest('INPUT')
        : '';
  }
  return input;
};
const updateCellData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  const element = args.element;
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let input = getInputElement(args);
    return updateCellCollectionData(args, input);
  } else {
    return disabledActionResponse(args);
  }
};

const updateCellCollectionData = async (args, input) => {
  const { parameters } = args;
  const { collectionRequest, successMessage, errorMessage, collection } = parameters;
  let isSecuredCall = true;
  if (args.parameters && (!collectionRequest || collectionRequest == 'Open')) {
    isSecuredCall = false;
  }

  let itemId = input.getAttribute('data-id');
  let endpoint;

  let response = {};
  let apiCallResult;
  const column = input.getAttribute('data-column-name');
  const data = {};
  data[column] = input.value;
  try {
    if (itemId) {
      endpoint = `collection-form/${collection}/items/${itemId}`;
      if (isSecuredCall) {
        apiCallResult = await securedPutCall(data, endpoint);
      } else {
        apiCallResult = await unSecuredPutCall(data, endpoint);
      }
    }
    response.data = apiCallResult;
    response.data.collectionSaveOrUpdateResponse = apiCallResult;
    response.status = 'success';

    const { collectionSaveOrUpdateResponse } = response.data;
    const { config, data: collectionItemData } = collectionSaveOrUpdateResponse;
    let collectionName = config.url;
    collectionName = collectionName.split('/items')[0];
    const collectionItemId = collectionItemData.uuid;

    const collectionKey = `collection_${collectionName}`;
    const collectionItemUuidKey = 'uuid';
    const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    if (previousActionResponse) {
      previousActionResponse = JSON.parse(previousActionResponse);
      sessionStorage.setItem(
        'previousActionResponse',
        JSON.stringify({ ...previousActionResponse, ...collectionData }),
      );
    } else {
      sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
    }
    response.data = { ...response.data, ...collectionData };

    if (successMessage) {
      toastr.success(successMessage, 'Success');
    }
  } catch (error) {
    console.error('\n error :>> ', error);
    if (error.response) {
      response.data = error.response;
      response.data.collectionSaveOrUpdateResponse = error.response;
      response.status = 'error';
    }
    if (errorMessage) {
      toastr.error(errorMessage, 'Error');
    } else if (error.response.data) {
      toastr.error(error.response.data, 'Error');
    }
  }
  return response;
};

const updateCollectionData = async (args, form, isDraft = false) => {
  let data = await serializeFormData(form.elements);
  const { baseURI } = args.targetElement;
  const slug = extractSlugFromUrl(baseURI, true);
  data.slug = slug;
  const { parameters } = args;
  const {
    collectionRequest,
    successMessage,
    errorMessage,
    passPreviousActionFormData,
    constructor,
    collection,
    resetFormData,
    formDataSessionKey,
    formDataBrowserStorageLocation,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  // Action Entry Custom Log
  if (enableConsoleLog) {
    const startLog = cleanConsoleLogArgs(startConsoleLog);
    logActionMessage(startLog);
  }
  let isSecuredCall = true;
  if (args.parameters && (!collectionRequest || collectionRequest == 'Open')) {
    isSecuredCall = false;
  }

  if (
    passPreviousActionFormData &&
    (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
  ) {
    if (formDataBrowserStorageLocation && formDataSessionKey) {
      setDataInSessionStorageLocation(formDataBrowserStorageLocation, formDataSessionKey, data);
    } else {
      // Fallback handling
      // TODO: Ali -> Remove after complete migration
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      if (previousActionFormData) {
        previousActionFormData = JSON.parse(previousActionFormData);
        sessionStorage.setItem(
          'previousActionFormData',
          JSON.stringify({ ...previousActionFormData, ...data }),
        );
      } else {
        sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
      }
    }
  }

  if (collection && constructor) {
    const ipAddress = await getIPAddress();
    let navigator = {};
    _.merge(navigator, window.navigator);

    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    // Get Browser Storage Data Object
    const browserData = await getBrowserData();

    data['constructorMetaObj'] = {
      collectionName: collection,
      constructorId: constructor,
      ipAddress: ipAddress ?? '',
      navigator: navigator,
      ...browserData,
      previousActionResponse,
      previousActionFormData,
    };
  }

  removeEmptyDropzoneFields(form, data);

  let endpoint = form.getAttribute('action');
  const { itemId, parentItemId, parentItemCollection } = await checkAndUpdateItemId(form);
  let itemIdField = form.getAttribute('itemidfield');
  let response = {};
  let apiCallResult;
  let redirectTo = null;
  data['isDraft'] = isDraft;
  data['sendDecryptedResponse'] = true;
  try {
    if (itemId) {
      endpoint = getNewEndPointUrl(itemId, endpoint);
      if (isSecuredCall) {
        apiCallResult = await securedPutCall(data, endpoint);
      } else {
        endpoint = 'open/' + endpoint;
        apiCallResult = await unSecuredPutCall(data, endpoint);
      }
    } else if (itemIdField && itemIdField.includes('.')) {
      if (isSecuredCall) {
        apiCallResult = await securedPostCall(data, endpoint);
      } else {
        endpoint = 'open/' + endpoint;
        apiCallResult = await unSecuredPostCall(data, endpoint);
      }
      const { data: refCollectionItemData } = apiCallResult;
      let parentItemEndpoint = `collection-form/${parentItemCollection}/items/${parentItemId}`;
      let itemIdFieldArr = itemIdField.split('.');
      itemIdField = itemIdFieldArr[0] ? itemIdFieldArr[0] : '';
      const parentItem = { [itemIdField]: refCollectionItemData.uuid };
      let parentResult = '';
      if (isSecuredCall) {
        parentResult = await securedPutCall(parentItem, parentItemEndpoint);
      } else {
        parentItemEndpoint = 'open/' + parentItemEndpoint;
        parentResult = await unSecuredPutCall(parentItem, parentItemEndpoint);
      }
    } else {
      if (isSecuredCall) {
        apiCallResult = await securedPutCall(data, endpoint);
      } else {
        endpoint = 'open/' + endpoint;
        apiCallResult = await unSecuredPutCall(data, endpoint);
        console.log('----update apiCallResult-->', apiCallResult);
        if (apiCallResult.data.redirectTo != '' && apiCallResult.data.redirectTo != null) {
          redirectTo = apiCallResult.data.redirectTo;
        }
      }
    }
    console.log('---redirectTo--->', redirectTo);
    response.data = apiCallResult;
    response.data.collectionSaveOrUpdateResponse = apiCallResult;
    response.status = 'success';

    const { collectionSaveOrUpdateResponse } = response.data;
    const { config, data: collectionItemData } = collectionSaveOrUpdateResponse;
    let collectionName = config.url;
    collectionName = collectionName.split('collection-form/')[1];
    collectionName = collectionName.split('/items')[0];
    const collectionItemId = collectionItemData.uuid;

    const collectionKey = `collection_${collectionName}`;
    const collectionItemUuidKey = 'uuid';
    const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
    const refCollectionFile = {
      refCollectionFile: { file: data.refFile || '', refField: data.refField || '' },
    };
    if (
      passPreviousActionResponse &&
      (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
    ) {
      setDataInSessionStorageLocation(responseDataSessionStorageLocation, responseDataSessionKey, {
        ...collectionItemData,
        ...collectionData,
        ...refCollectionFile,
      });
    } else {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ ...previousActionResponse, ...collectionData, ...refCollectionFile }),
        );
      } else {
        sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
      }
    }
    response.data = { ...response.data, ...collectionData, ...refCollectionFile };
    if (response && response.data && response.data.data) {
      setDataInSessionStorageLocation(
        'session',
        `__dp_colItem_${collectionName}_${response.data.data.uuid}`,
        response.data.data,
      );
      setDataInSessionStorageLocation(
        'session',
        `__ssr_dp_colItem_${collectionName}_${response.data.data.uuid}`,
        response.data.data,
      );
    }
    if (resetFormData) resetCollectionForm(form);
    if (successMessage) {
      toastr.success(successMessage, 'Success');
    }
  } catch (error) {
    console.error('\n error :>> ', error);
    if (error.response) {
      response.data = error.response;
      response.data.collectionSaveOrUpdateResponse = error.response;
      response.status = 'error';
    }
    if (errorMessage) {
      toastr.error(errorMessage, 'Error');
    } else if (error.response.data) {
      toastr.error(error.response.data, 'Error');
    }
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }

  if (redirectTo) {
    window.location.href = `/${redirectTo}`;
  }
  return response;
};

const bulkUpdateCollection = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let data = await serializeFormData(args.element.elements);
    let form = args.element;
    const {
      collectionRequest,
      successMessage,
      errorMessage,
      skipEmptyValues,
      passPreviousActionFormData,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
    } = args.parameters;

    let isSecuredCall = true;
    if (args.parameters && (!collectionRequest || collectionRequest == 'Open')) {
      isSecuredCall = false;
    }

    if (
      passPreviousActionFormData &&
      (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
    ) {
      if (formDataBrowserStorageLocation && formDataSessionKey) {
        setDataInSessionStorageLocation(formDataBrowserStorageLocation, formDataSessionKey, data);
      } else {
        // Fallback handling
        // TODO: Ali -> Remove after complete migration
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          sessionStorage.setItem(
            'previousActionFormData',
            JSON.stringify({ ...previousActionFormData, ...data }),
          );
        } else {
          sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
        }
      }
    }

    let endpoint = form.getAttribute('action');
    const method = form.getAttribute('method');
    endpoint += '/bulk/update';
    let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
    let successMessageDiv = form.getElementsByClassName('success-message')[0];
    let response = {};
    let apiCallResult;
    data = { ...data, skipEmptyValues };
    try {
      if (isSecuredCall) {
        apiCallResult = await securedPutCall(data, endpoint);
      } else {
        endpoint = 'open/' + endpoint;
        apiCallResult = await unSecuredPutCall(data, endpoint);
      }
      response.data = apiCallResult;
      response.data.collectionSaveOrUpdateResponse = apiCallResult;
      response.status = 'success';

      const { collectionSaveOrUpdateResponse } = response.data;
      const { config, data: collectionItemData } = collectionSaveOrUpdateResponse;
      let collectionName = config.url;
      collectionName = collectionName.split('collection-form/')[1];
      collectionName = collectionName.split('/items')[0];
      const collectionItemId = collectionItemData.uuid;

      const collectionKey = `collection_${collectionName}`;
      const collectionItemUuidKey = 'uuid';
      const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
      if (
        passPreviousActionResponse &&
        (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
      ) {
        setDataInSessionStorageLocation(
          responseDataSessionStorageLocation,
          responseDataSessionKey,
          collectionItemData,
        );
      } else {
        // Fallback handling
        // TODO: Ali -> Remove after complete migration
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...collectionData }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
        }
      }
      response.data = { ...response.data, ...collectionData };

      if (successMessage) {
        toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('\n ==error', error);
      if (error.response) {
        response.data = error.response;
        response.data.collectionSaveOrUpdateResponse = error.response;
        response.status = 'error';
      }
      if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      } else if (error.response.data) {
        toastr.error(error.response.data, 'Error');
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const updateCollectionOnPageLoad = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response: previousResponse, targetElement, url_params } = args;
    const {
      collection,
      collectionUpdateFields,
      updateFindBy,
      updateFindByResponseKeyForValue,
      successMessage,
      errorMessage,
    } = parameters;
    const previousResponseData = previousResponse ? previousResponse.data : '';
    const collectionSaveOrUpdateResponse = previousResponse
      ? previousResponse.collectionSaveOrUpdateResponse
      : '';

    let itemId = '';
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');

    if (previousActionResponse) {
      previousActionResponse = JSON.parse(previousActionResponse);
    }
    if (previousActionFormData) {
      previousActionFormData = JSON.parse(previousActionFormData);
    }

    switch (updateFindBy) {
      case 'collectionUuid':
        itemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
        if (!itemId) {
          //Handling for Form Submit
          const submitBtnElem = targetElement.querySelector('button[type=submit]');
          itemId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
        }
        break;
      case 'previousResponse':
        itemId = previousResponseData ? previousResponseData['uuid'] : '';
        break;
      case 'previousActionResponse':
        if (previousActionResponse) {
          itemId = updateFindByResponseKeyForValue
            ? _.get(previousActionResponse, updateFindByResponseKeyForValue)
            : '';
        }
        break;
      case 'previousActionFormData':
        if (previousActionFormData) {
          itemId = updateFindByResponseKeyForValue
            ? _.get(previousActionFormData, updateFindByResponseKeyForValue)
            : '';
        }
        break;
      case 'SESSION_STORAGE':
      case 'LOCAL_STORAGE':
      case 'COOKIES':
        let browserStorageData = await getBSLData(updateFindBy);
        if (browserStorageData) {
          itemId =
            browserStorageData && updateFindByResponseKeyForValue
              ? _.get(browserStorageData, updateFindByResponseKeyForValue.trim())
              : '';
        }
        break;
      case 'currentLoggedInUser':
        if (isLoggedInUser()) {
          const loggedInUser = fetchLoggedInUserJson();
          if (updateFindByResponseKeyForValue) {
            itemId = _.get(loggedInUser, updateFindByResponseKeyForValue);
          } else {
            itemId = loggedInUser ? loggedInUser.uuid : '';
          }
        }
        break;
      case 'currentLoggedInUserTenant':
        if (isLoggedInUser()) {
          const currentTenant = fetchCurrentTenantJson();
          if (updateFindByResponseKeyForValue) {
            itemId = _.get(currentTenant, updateFindByResponseKeyForValue);
          } else {
            itemId = currentTenant ? currentTenant.uuid : '';
          }
        }
        break;
      default:
        if (url_params && url_params.id) {
          itemId = url_params.id;
        }
        break;
    }

    let data = {};
    let response = {};
    let collectionItemResponse = {};
    let collectionItem = {};
    try {
      if (itemId) {
        const collectionItemEndpoint = `collection-table/${collection}/item/${itemId}`;
        collectionItemResponse = await securedGetCall(collectionItemEndpoint);
        if (collectionItemResponse && collectionItemResponse.status === 200) {
          collectionItem = collectionItemResponse.data;
          if (collectionItem) {
            const collectionItemId = collectionItem.uuid;
            const currentEnvironment = localStorage.getItem('environment');
            const filteredCollectionUpdateFields = collectionUpdateFields.filter((field) => {
              const needsEnvCheck = ['dynamic_option', 'reference'].includes(field.fieldType);
              if (!needsEnvCheck) return true;
              return !field.environment || field.environment === currentEnvironment;
            });
            for (const collectionUpdateField of filteredCollectionUpdateFields) {
              switch (collectionUpdateField.valueFrom) {
                case 'previousActionResponse':
                  if (previousActionResponse) {
                    let fieldValue =
                      collectionUpdateField.value && previousActionResponse
                        ? _.get(previousActionResponse, collectionUpdateField.value)
                        : '';
                    processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data);
                  }
                  break;
                case 'browserSessionFormData':
                  if (previousActionFormData) {
                    let fieldValue =
                      collectionUpdateField.value && previousActionFormData
                        ? _.get(previousActionFormData, collectionUpdateField.value)
                        : '';
                    processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data);
                  }
                  break;
                case 'derived-field':
                  let fieldValue = previousResponseData
                    ? getDerivedFieldData(collectionUpdateField.value, previousResponseData)
                    : collectionItem
                      ? getDerivedFieldData(collectionUpdateField.value, collectionItem)
                      : '';
                  processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data);
                  break;
                case 'currentLoggedInUser':
                  if (isLoggedInUser()) {
                    const loggedInUser = fetchLoggedInUserJson();
                    let fieldValue =
                      collectionUpdateField.value && loggedInUser
                        ? _.get(loggedInUser, collectionUpdateField.value)
                        : '';
                    processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data);
                  } else {
                    data[collectionUpdateField.key] = '';
                  }
                  break;
                case 'currentLoggedInUserTenant':
                  if (isLoggedInUser()) {
                    const currentTenant = fetchCurrentTenantJson();
                    let fieldValue =
                      collectionUpdateField.value && currentTenant
                        ? _.get(currentTenant, collectionUpdateField.value)
                        : '';
                    processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data);
                  } else {
                    data[collectionUpdateField.key] = '';
                  }
                  break;
                case 'SESSION_STORAGE':
                case 'LOCAL_STORAGE':
                case 'COOKIES':
                case 'INDEXED_DB':
                  let browserStorageData = await getBSLData(collectionUpdateField.valueFrom);
                  if (browserStorageData) {
                    itemId =
                      browserStorageData && updateFindByResponseKeyForValue
                        ? _.get(browserStorageData, updateFindByResponseKeyForValue.trim())
                        : '';

                    let fieldValue =
                      collectionUpdateField.value && browserStorageData
                        ? _.get(browserStorageData, collectionUpdateField.value)
                        : '';
                    processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data);
                  }
                  break;
                default:
                  processFieldValueData(
                    collectionUpdateField,
                    collectionUpdateField.value,
                    collectionItem,
                    data,
                  );
                  break;
              }
            }
            if (url_params && url_params.token) {
              let endpoint = `collection-form/${collection}/items/${url_params.id}`;
              response.data = await securedPutCallWithToken(data, endpoint, url_params.token);
            } else {
              let endpoint = 'collection-form/' + collection + '/items/' + collectionItemId;
              endpoint = 'open/' + endpoint;
              response.data = await unSecuredPutCall(data, endpoint);
            }

            if (collectionSaveOrUpdateResponse) {
              response.data = { ...response.data, ...collectionSaveOrUpdateResponse };
            }

            response.status = 'success';
            if (successMessage) {
              toastr.success(successMessage, 'Success');
            }
          }
        }
      }
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
      }
      if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      } else if (error.response.data) {
        toastr.error(error.response.data, 'Error');
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const swalAlert = async (
  confirmationMessage,
  confirmButtonText = 'Delete',
  focusConfirm = false,
  focusCancel = true,
  cancelBtnText = 'Cancel',
) => {
  return await Swal.fire({
    text: confirmationMessage,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelBtnText,
    confirmButtonColor: '#ff0055',
    cancelButtonColor: '#999999',
    reverseButtons: false,
    focusConfirm,
    focusCancel,
  });
};

const deleteCollectionItem = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const itemId = args.targetElement.getAttribute('data-item-id');
    const {
      collection: collectionName,
      confirmationMessage,
      successMessage,
      collectionRequest,
      errorMessage,
    } = args.parameters;

    const isSecuredCall = !collectionRequest || collectionRequest === 'Open' ? false : true;

    let response = {};
    const message = confirmationMessage || 'Are you sure about deleting this item?';
    await swalAlert(message).then(async (willDelete) => {
      if (willDelete.isConfirmed) {
        let endpoint = `collection-form/${collectionName}/items/${itemId}`;
        try {
          if (isSecuredCall) {
            response.data = await securedDeleteCall(endpoint);
          } else {
            endpoint = 'open/' + endpoint;
            response.data = await unSecuredDeleteCall(endpoint);
          }

          if (response.data.status === 200) {
            toastr.success(successMessage || 'Poof! Your item been deleted!', 'Success');
          }
          response.status = 'success';
        } catch (error) {
          if (error.response) {
            response.data = error.response;
            response.status = 'error';
            toastr.error(errorMessage || 'This item could not be deleted right now.', 'Error');
          }
        }
      } else {
        response.status = 'error';
      }
    });
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const resetTextArea = (form) => {
  let textarea = $(form).find('.textarea');
  let isTextareaFieldExist = textarea.length;
  if (isTextareaFieldExist) {
    textarea.each(function () {
      let input = $(this);
      let showTextEditor = input[0].hasAttribute('data-show-editor');
      if (showTextEditor) {
        input.summernote('reset');
      }
    });
  }
};

const resetDropzone = (form) => {
  let dropzone = $(form).find('.dropzone');
  let formId = form ? form.id : '';
  let isDropzoneFieldExist = dropzone && dropzone.length;
  if (isDropzoneFieldExist && formId) {
    dropzone.each(function () {
      let dropzoneElem = $(this);
      let dropzoneElemId = dropzoneElem[0] ? dropzoneElem[0].id : '';
      if (dropzoneElemId) {
        let dropzoneMapKey = `dz_${formId}_${dropzoneElemId}`;
        let myDropzoneObj = DropzoneMap[dropzoneMapKey];
        if (myDropzoneObj) {
          myDropzoneObj.removeAllFiles();
        }
      }
    });
  }
};

const resetTimeslot = (form) => {
  let timeslotElem = $(form).find('[data-timeslot]');
  let formId = form ? form.id : '';
  let isTimeslotFieldExist = timeslotElem && timeslotElem.length;
  if (isTimeslotFieldExist && formId) {
    timeslotElem.each(function () {
      this.value = '';
      // $(this).remove();
    });
  }
};

const resetCollectionForm = (form) => {
  // Check if the form has the 'persistdata' attribute
  // If it does, do not reset the form
  if (form && form.hasAttribute('persistdata')) {
    return;
  }
  // Check if the form has elements
  // If it does, filter the elements that have the 'persistvalue' attribute
  // and reset only the elements that do not have the 'persistvalue' attribute
  if (form && form.elements && form.elements.length) {
    const formElements = Array.from(form.elements);
    // Filter elements that have the 'persistvalue' attribute
    const filteredElements = Array.from(formElements).filter((element) =>
      element.hasAttribute('persistvalue'),
    );
    if (filteredElements && filteredElements.length) {
      // Exclude elements with the 'persistvalue' attribute
      const elementsToReset = Array.from(formElements).filter(
        (element) => !element.hasAttribute('persistvalue'),
      );

      // Reset only the filtered elements
      elementsToReset.forEach((element) => {
        if (element.type === 'checkbox' || element.type === 'radio') {
          element.checked = false;
        } else if (element.tagName === 'SELECT') {
          element.selectedIndex = -1;
        } else {
          element.value = '';
        }
      });

      // Reset other form-specific elements
      Array.from(form.getElementsByClassName('file-list-display')).forEach((e) => {
        e.innerHTML = 'Select file';
      });
      $(form).find('.select').val('').trigger('change');
      resetTextArea(form);
      resetDropzone(form);
      resetTimeslot(form);
      return;
    }
  }
  // Reset the form if no elements with 'persistvalue' attribute are found
  // or if the form doesn't have the 'persistdata' attribute
  form.reset();
  Array.from(form.getElementsByClassName('file-list-display')).forEach(function (e) {
    e.innerHTML = 'Select file';
  });
  $(form).find('.select').val('').trigger('change');
  resetTextArea(form);
  resetDropzone(form);
  resetTimeslot(form);
};

const addToCollectionItem = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let data = await serializeFormData(args.element.elements);
    let form = args.element;
    let { collectionRequest } = args.parameters;
    const { itemId, dataItemId } = data;
    const {
      formCollection,
      formElementCollection,
      formElementCollectionId: collectionFieldId,
      formParentCollection: collectionName,
      itemId: dataTableItemId,
    } = args.element.dataset;
    const isSecuredCall = !collectionRequest || collectionRequest === 'Open' ? false : true;
    let formData = {};
    formData[formElementCollection] = dataItemId ? dataItemId : dataTableItemId;

    if (!dataItemId) {
      data.dataItemId = dataTableItemId;
    }

    Object.assign(data, formData);
    let endpoint = `collection-form/${collectionName}/items/${itemId}/fields/${collectionFieldId}`;
    let method = form.getAttribute('method');

    let response = {};
    try {
      if (isSecuredCall) {
        response.data = await securedPostCall(data, endpoint);
      } else {
        endpoint = 'open/' + endpoint;
        response.data = await unSecuredPostCall(data, endpoint);
      }
      response.status = 'success';
      response.data.forNextStep = 'ADD'; //It will be used to Add Item without refresh
      resetCollectionForm(form);
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const removeFromCollectionItem = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let data = await serializeFormData(args.element.elements);
    let form = args.element;
    let { collectionRequest, confirmationMessage } = args.parameters;
    const { itemId, dataItemId } = data;
    const {
      formCollection,
      formElementCollection,
      formElementCollectionId: collectionFieldId,
      formParentCollection: collectionName,
      itemId: dataTableItemId,
    } = args.element.dataset;

    const isSecuredCall = !collectionRequest || collectionRequest === 'Open' ? false : true;
    let formData = {};
    formData[formElementCollection] = dataItemId ? dataItemId : dataTableItemId;
    if (!dataItemId) {
      data.dataItemId = dataTableItemId;
    }

    Object.assign(data, formData);
    let endpoint = `collection-form/${collectionName}/items/${itemId}/fields/${collectionFieldId}`;
    let method = form.getAttribute('method');

    let response = {};
    const message = confirmationMessage || 'Are you sure about removing this item?';
    await swalAlert(message).then(async (willDelete) => {
      if (willDelete.isConfirmed) {
        try {
          if (isSecuredCall) {
            response.data = await securedPutCall(data, endpoint);
          } else {
            endpoint = 'open/' + endpoint;
            response.data = await unSecuredPutCall(data, endpoint);
          }
          response.status = 'success';
          response.data.forNextStep = 'REMOVE'; //It will be used to remove Item without refresh
          resetCollectionForm(form);
        } catch (error) {
          if (error.response) {
            response.data = error.response;
            response.status = 'error';
          }
        }
      } else {
        response.data = willDelete;
        response.status = 'cancel';
      }
    });
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};
const checkAndLoadNonPersistentItemId = (
  bodyDataFrom,
  collectionItemId,
  targetElemObj,
  data,
  selectedExternalAPIData,
  fromTargetElem = false,
) => {
  if (bodyDataFrom === 'NON_PERSISTENT_COLLECTION') {
    let nonPersistentCollectionItemId = collectionItemId;
    let pageCollectionName = '';
    let modalContainerExternalAPISpan = '';
    const { targetElement, target } = targetElemObj || {};
    if ((targetElement && !targetElement.getAttribute('data-item-id')) || !collectionItemId) {
      if (target && !target.getAttribute('data-item-id')) {
        const pathArray = window.location.pathname.split('/');
        nonPersistentCollectionItemId = pathArray[pathArray.length - 1];
        pageCollectionName = pathArray[pathArray.length - 2];
      } else {
        nonPersistentCollectionItemId = target ? target.getAttribute('data-item-id') : '';
      }
      const modalContainer = targetElement ? targetElement.closest('div[id^=modal-container]') : '';
      modalContainerExternalAPISpan = modalContainer
        ? modalContainer.querySelector('[id=project-modal-external-api]')
        : '';
      if (modalContainerExternalAPISpan) {
        //Handling for Modal Popup
        const submitBtnElem = targetElement.querySelector('button[type=submit]');
        const actionSubmitBtnElem = targetElement.querySelector('button[data-gjs=action-submit]');
        if (submitBtnElem) {
          nonPersistentCollectionItemId = submitBtnElem
            ? submitBtnElem.getAttribute('data-item-id')
            : '';
        } else if (actionSubmitBtnElem) {
          nonPersistentCollectionItemId = actionSubmitBtnElem
            ? actionSubmitBtnElem.getAttribute('data-item-id')
            : '';
        }
      }
    }

    const externalAPISpan = modalContainerExternalAPISpan
      ? modalContainerExternalAPISpan
      : getExternalAPISpan();
    const externalApiData = {};

    if (selectedExternalAPIData) {
      initialiseExternalApiData(selectedExternalAPIData, externalApiData);
    } else if (externalAPISpan) {
      initialiseExternalApiDataFromSpan(externalAPISpan, externalApiData);
    }

    const { requestMapping, uniqueKey } = externalApiData ? externalApiData : '';
    let itemId = pageCollectionName
      ? nonPersistentCollectionItemId
      : nonPersistentCollectionItemId
        ? nonPersistentCollectionItemId
        : uuidv4(16);

    itemId = replaceUnderscoreWithSlash(itemId);

    data['externalApiItem'] = {
      id: itemId,
      uuid: itemId,
      _data_source_rest_api_primary_id: itemId,
      nonPersistentCollectionItemId: itemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
      fromTargetElem,
    };

    if (requestMapping && requestMapping.length > 0) {
      requestMapping.forEach((reqMap) => {
        if (reqMap.value == 'uuid') {
          data['externalApiItem'][reqMap.key] = itemId;
        }
      });
    }
  }
};

const checkAndLoadNonPersistentItemIdForSelect = (
  data,
  selectedExternalAPIData,
  fromTargetElem = false,
) => {
  const { bodyDataFrom } = selectedExternalAPIData || {};
  if (bodyDataFrom && bodyDataFrom === 'NON_PERSISTENT_COLLECTION') {
    let nonPersistentCollectionItemId = '';
    let pageCollectionName = '';
    const externalApiData = {};
    if (selectedExternalAPIData) {
      initialiseExternalApiData(selectedExternalAPIData, externalApiData);
    }

    const { requestMapping, uniqueKey } = externalApiData ? externalApiData : '';
    let itemId = pageCollectionName
      ? nonPersistentCollectionItemId
      : nonPersistentCollectionItemId
        ? nonPersistentCollectionItemId
        : uuidv4(16);

    itemId = replaceUnderscoreWithSlash(itemId);

    data['externalApiItem'] = {
      id: itemId,
      uuid: itemId,
      _data_source_rest_api_primary_id: itemId,
      nonPersistentCollectionItemId: itemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
      fromTargetElem,
    };

    if (requestMapping && requestMapping.length > 0) {
      requestMapping.forEach((reqMap) => {
        if (reqMap.value == 'uuid') {
          data['externalApiItem'][reqMap.key] = itemId;
        }
      });
    }
  }
};

const loadFormData = async (targetElement, data, args, processSourceDateFormat = false) => {
  if (targetElement && targetElement.tagName === 'FORM') {
    data = await serializeFormData(args.element.elements, true, processSourceDateFormat);
  }
  return data;
};

const logoutUser = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const afterLogoutRedirectUrl = args.parameters.redirectUrl;
    actionCompleted(args);
    await processLogoutUser(afterLogoutRedirectUrl);
  } else {
    return disabledActionResponse(args);
  }
};

const processLogoutUser = async (afterLogoutRedirectUrl) => {
  try {
    let loggedInUser = fetchLoggedInUser();
    if (loggedInUser) {
      loggedInUser = JSON.parse(loggedInUser);
    }
    // const token = validateCookieToken();
    // if (!token) return;
    const header = await getHeaderForServerForPublicRequest();
    const response = await axios.post('/logout', {}, header);
    extractCookieToken(response.headers);
    if (response.status === 200) {
      window.localStorage.clear();
      window.sessionStorage.clear();
      await loginActivityTracker('Logout', loggedInUser?.userName, loggedInUser?.tenant?.uuid);
      removeCookie(TENANT_ID_COOKIE_KEY);
      removeCookie('oAuthAccessToken');
      if (afterLogoutRedirectUrl) window.location = afterLogoutRedirectUrl;
    }
  } catch (e) {
    console.error('error logout', e);
  }
};

const extractSlugFromUrl = (baseURI, isUpdate = false) => {
  const url = new URL(baseURI);
  if (isUpdate) {
    let slug = url.pathname.substring(1);
    const parts = slug.split('/');
    return parts[0];
  }
  return url.pathname.replace('/', '');
};

const saveCollectionData = async (args, form, isDraft = false) => {
  const { parameters } = args;
  const { baseURI } = args.targetElement;
  // console.log("---->baseURI-->",baseURI)
  const slug = extractSlugFromUrl(baseURI);
  // console.log("---->slug-->",slug)
  const {
    constructor,
    collectionRequest,
    successMessage,
    errorMessage,
    passPreviousActionFormData,
    resetFormData,
    collection,
    formDataSessionKey,
    formDataBrowserStorageLocation,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  // Action Entry Custom Log
  if (enableConsoleLog) {
    const startLog = cleanConsoleLogArgs(startConsoleLog);
    logActionMessage(startLog);
  }
  const data = await serializeFormData(form.elements);

  // Adding slug into data
  data.slug = slug;

  //TODO: Safari --need to find why merely using object destructured or assignd value makes arg undefined
  let isSecuredCall = true;
  if (args.parameters && (!collectionRequest || collectionRequest == 'Open')) {
    isSecuredCall = false;
  }
  if (
    passPreviousActionFormData &&
    (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
  ) {
    if (formDataBrowserStorageLocation && formDataSessionKey) {
      setDataInSessionStorageLocation(formDataBrowserStorageLocation, formDataSessionKey, data);
    } else {
      // Fallback handling
      // TODO: Ali -> Remove after complete migration
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      if (previousActionFormData) {
        previousActionFormData = JSON.parse(previousActionFormData);
        sessionStorage.setItem(
          'previousActionFormData',
          JSON.stringify({ ...previousActionFormData, ...data }),
        );
      } else {
        sessionStorage.setItem('previousActionFormData', JSON.stringify(data));
      }
    }
  }

  if (collection && constructor) {
    const ipAddress = await getIPAddress();
    let navigator = {};
    _.merge(navigator, window.navigator);

    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    // Get Browser Storage Data Object
    const browserData = await getBrowserData();

    data['constructorMetaObj'] = {
      collectionName: collection,
      constructorId: constructor,
      ipAddress: ipAddress ?? '',
      navigator: navigator,
      ...browserData,
      previousActionResponse,
      previousActionFormData,
    };
  }

  let endpoint = form.getAttribute('action');
  endpoint = endpoint + '/constructor/' + constructor;
  let response = {};
  let apiCallResult;
  let redirectTo = null;
  data['isDraft'] = isDraft;
  try {
    if (isSecuredCall) {
      apiCallResult = await securedPostCall(data, endpoint);
    } else {
      endpoint = 'open/' + endpoint;
      apiCallResult = await unSecuredPostCall(data, endpoint);
      console.log('----apiCallResult-->', apiCallResult);
      if (apiCallResult.data.redirectTo != '' && apiCallResult.data.redirectTo != null) {
        redirectTo = apiCallResult.data.redirectTo;
      }
    }
    console.log('---redirectTo--->', redirectTo);
    response.data = apiCallResult;
    response.data.collectionSaveOrUpdateResponse = apiCallResult;
    response.data.collectionFormData = data;
    response.status = 'success';

    const { collectionSaveOrUpdateResponse } = response.data;
    const { config, data: collectionItemData } = collectionSaveOrUpdateResponse;
    let collectionName = config.url;
    collectionName = collectionName.split('collection-form/')[1];
    collectionName = collectionName.split('/items')[0];
    const collectionItemId = collectionItemData.uuid;
    const collectionKey = `collection_${collectionName}`;
    const collectionItemUuidKey = 'uuid';
    const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
    const refCollectionFile = {
      refCollectionFile: { file: data.refFile || '', refField: data.refField || '' },
    };
    if (
      passPreviousActionResponse &&
      (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
    ) {
      setDataInSessionStorageLocation(responseDataSessionStorageLocation, responseDataSessionKey, {
        ...collectionItemData,
        ...collectionData,
        ...refCollectionFile,
      });
    } else {
      // Fallback handling
      // TODO: Ali -> Remove after complete migration
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ ...previousActionResponse, ...collectionData, ...refCollectionFile }),
        );
      } else {
        sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
      }
    }
    response.data = { ...response.data, ...collectionData, ...refCollectionFile };
    // Handling form reset based on the action configuration
    if (isDraft) {
      if (resetFormData) resetCollectionForm(form);
    } else {
      resetCollectionForm(form);
    }
    if (successMessage) {
      toastr.success(successMessage, 'Success');
    }
  } catch (error) {
    if (error.response) {
      response.data = error.response;
      response.data.collectionSaveOrUpdateResponse = error.response;
      response.status = 'error';
    }
    if (errorMessage) {
      toastr.error(errorMessage, 'Error');
    } else if (error.response.data) {
      toastr.error(error.response.data, 'Error');
    }
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  actionCompleted(args);

  if (redirectTo) {
    window.location.href = redirectTo;
  }

  return response;
};

async function loginUser(args) {
  const actionEnabled = isActionEnabled(args);
  const { element, parameters } = args;
  const { authErrorMessage, notFoundErrorMessage, othersErrorMessage } = parameters;
  const errorMessages = {
    authErrorMessage: authErrorMessage || '',
    notFoundErrorMessage: notFoundErrorMessage || '',
    othersErrorMessage: othersErrorMessage || '',
  };
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = element;
    const loginFormData = await serializeFormData(form.elements);
    let alertMessageDiv = form.getElementsByClassName('alert-message')[0];

    if (
      (loginFormData.hasOwnProperty('email') && loginFormData.email !== '') ||
      (loginFormData.hasOwnProperty('phone_number') && loginFormData.phone_number !== '')
    ) {
      validateLoginFormData(loginFormData, loginFormData);
    }

    if (args.response && args.response.status !== 201) {
      args.response.data.status;
      actionCompleted(args);
      return;
    }
    await loginIntoApplication(
      args,
      loginFormData,
      null,
      alertMessageDiv,
      parameters.redirectRules,
      LOGIN_USER,
      errorMessages,
    );
  } else {
    return disabledActionResponse(args);
  }
}

const loginWithOAuth2 = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    let successRedirectRules = parameters.successRedirectRules
      ? parameters.successRedirectRules
      : '';
    let errorRedirectUrl = parameters.errorRedirectUrl ? parameters.errorRedirectUrl : '';
    let successMessage = parameters.successMessage ? parameters.successMessage : '';
    let errorMessage = parameters.errorMessage ? parameters.errorMessage : '';
    let obj = {
      type: 'LOGIN',
      successRedirectRules,
      errorRedirectUrl,
      successMessage,
      errorMessage,
    };
    sendOAuth2Call(obj);
  } else {
    return disabledActionResponse(args);
  }
};

const signUpWithOAuth2 = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    let userRole = parameters.userRole ? parameters.userRole : '';
    let successRedirectUrl = parameters.successRedirectUrl ? parameters.successRedirectUrl : '';
    let errorRedirectUrl = parameters.errorRedirectUrl ? parameters.errorRedirectUrl : '';
    let successMessage = parameters.successMessage ? parameters.successMessage : '';
    let errorMessage = parameters.errorMessage ? parameters.errorMessage : '';
    let obj = {
      type: 'SIGNUP',
      role: userRole,
      successRedirectUrl,
      errorRedirectUrl,
      successMessage,
      errorMessage,
    };
    sendOAuth2Call(obj);
  } else {
    return disabledActionResponse(args);
  }
};

const sendOAuth2Call = (obj) => {
  let endpoint = '/login-oauth2';
  obj = JSON.stringify(obj);
  const params = btoa(obj);
  endpoint = `${endpoint}/?params=${params}`;
  window.open(endpoint, '_self');
};

const loginWithFacebook = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const {
      successRedirectRules = '',
      errorRedirectUrl = '',
      successMessage = '',
      errorMessage = '',
    } = parameters;
    let obj = {
      type: 'LOGIN',
      successRedirectRules,
      errorRedirectUrl,
      successMessage,
      errorMessage,
    };
    sendSocialLoginOauthCall(obj, 'facebook');
  } else {
    return disabledActionResponse(args);
  }
};

const signUpWithFacebook = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const {
      userRole = '',
      successRedirectUrl = '',
      errorRedirectUrl = '',
      successMessage = '',
      errorMessage = '',
    } = parameters;
    let obj = {
      type: 'SIGNUP',
      role: userRole,
      successRedirectUrl,
      errorRedirectUrl,
      successMessage,
      errorMessage,
    };
    sendSocialLoginOauthCall(obj, 'facebook');
  } else {
    return disabledActionResponse(args);
  }
};

const loginWithTwitter = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const {
      successRedirectRules = '',
      errorRedirectUrl = '',
      successMessage = '',
      errorMessage = '',
    } = parameters;
    let obj = {
      type: 'LOGIN',
      successRedirectRules,
      errorRedirectUrl,
      successMessage,
      errorMessage,
    };
    sendSocialLoginOauthCall(obj, 'twitter');
  } else {
    return disabledActionResponse(args);
  }
};

const signUpWithTwitter = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const {
      userRole = '',
      successRedirectUrl = '',
      errorRedirectUrl = '',
      successMessage = '',
      errorMessage = '',
    } = parameters;
    let obj = {
      type: 'SIGNUP',
      role: userRole,
      successRedirectUrl,
      errorRedirectUrl,
      successMessage,
      errorMessage,
    };
    sendSocialLoginOauthCall(obj, 'twitter');
  } else {
    return disabledActionResponse(args);
  }
};

const sendSocialLoginOauthCall = (obj, socialApp) => {
  let endpoint = `/auth/${socialApp}`;
  obj = JSON.stringify(obj);
  const params = btoa(obj);
  endpoint = `${endpoint}/?params=${params}`;
  window.open(endpoint, '_self');
};

async function loginUserWithXano(args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = args.element;
    let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
    const loginFormData = {
      userName: form.elements['userName'].value,
      password: form.elements['password'].value,
    };
    if (args.response && args.response.status !== 201) {
      args.response.data.status;
      return;
    }
    await loginIntoApplication(
      args,
      loginFormData,
      null,
      alertMessageDiv,
      args.parameters.redirectRules,
      LOGIN_WITH_XANO,
    );
  } else {
    return disabledActionResponse(args);
  }
}

const loginUserWithToken = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const url_params = args.url_params;
    const data = {
      token: url_params.token,
    };
    await loginIntoApplication(
      args,
      data,
      null,
      null,
      args.parameters.redirectRules,
      LOGIN_WITH_TOKEN,
    );
  } else {
    return disabledActionResponse(args);
  }
};
const signUpUser = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters } = args;
    const formData = await serializeFormData(element.elements);
    formData.userRoles = parameters.userRole;
    const multiTenantPlugin = await fetchInstalledPluginByCode('MULTI_TENANT_SAAS');
    const currentUserSettingCollection = await fetchUserSettingCollection(multiTenantPlugin);
    if (formData.tenantId && currentUserSettingCollection) {
      const itemData = {
        tenantId: formData.tenantId,
      };
      const endpoint = `open/collection-form/${currentUserSettingCollection.collectionName}/items/`;
      const response = await unSecuredPostCall(itemData, endpoint);
      if (response.data.uuid) {
        formData.userSettingId = [response.data.uuid];
      }
    }
    let response = {};

    if (formData.hasOwnProperty('password') && formData.password === '') {
      const passwordField = element.elements.password;
      passwordField.classList.add('error');
      const errorLabelElement = document.createElement('label');
      errorLabelElement.setAttribute('id', `${passwordField.id}-error`);
      errorLabelElement.setAttribute('class', `error`);
      errorLabelElement.setAttribute('for', `${passwordField.id}`);
      errorLabelElement.innerHTML = passwordField.placeholder
        ? passwordField.placeholder
        : 'Please enter password';
      passwordField.insertAdjacentElement('afterend', errorLabelElement);
      response.data = passwordField.placeholder
        ? passwordField.placeholder
        : 'Please enter password';
      response.status = 'error';
      return response;
    }

    if (!formData.hasOwnProperty('password') && !formData.password) {
      formData.password = generateTemporaryPassword();
    }

    response = await processSignUpUser(formData, 'auth/user', element, parameters);

    // Add current Signed-up user UUID in response
    if (response.data.data.uuid) {
      response.data.userSignupId = response.data.data.uuid;
      // Propagate Current User Id in Session
      propagateCollectionItemIdInSession(response.data.data.uuid, COLLECTION_USER);
      if (formData.userSettingId) {
        const itemData = {
          userId: response.data.data.uuid,
        };
        const endpoint = `open/collection-form/${currentUserSettingCollection.collectionName}/items/${formData.userSettingId}`;
        await unSecuredPutCall(itemData, endpoint);
      }
    }

    return response;
  } else {
    return disabledActionResponse(args);
  }
};
const processSignUpUser = async function (
  formData,
  endpoint,
  element,
  parameters,
  AUTH_CALL = true,
) {
  let alertMessageDiv = element.getElementsByClassName('alert-message')[0];
  const { successMessage, errorMessage } = parameters;
  let response = {};
  try {
    if (AUTH_CALL) {
      response.data = await publicPostCall(formData, endpoint);
    } else response.data = await securedPostCall(formData, endpoint);
    response.status = 'success';
    if (alertMessageDiv) {
      alertMessageDiv.style.display = 'none';
    }
    if (successMessage) {
      toastr.success(successMessage, 'Success');
    }
  } catch (error) {
    if (alertMessageDiv) {
      if (errorMessage) {
        alertMessageDiv.innerHTML = errorMessage;
      } else if (error.response && error.response.data) {
        alertMessageDiv.innerHTML = error.response.data;
      } else {
        alertMessageDiv.innerHTML = 'Username or Email already exists';
      }
      alertMessageDiv.style.display = 'block';
      alertMessageDiv.classList.add('mt-3');
    } else {
      if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      } else if (error.response && error.response.data) {
        toastr.error(error.response.data, 'Error');
      } else {
        toastr.error('Username or Email already exists', 'Error');
      }
    }

    if (error.response) {
      response.data = error.response;
      response.status = 'error';
    }
  }
  return response;
};

const signUpUserWithXano = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters } = args;
    const formData = await serializeFormData(element.elements);
    formData.userRoles = parameters.userRole;
    const response = await processSignUpUser(formData, 'auth/user/xano', element, parameters);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const showErrorOnField = (form, formData, fieldName, message) => {
  if (formData.hasOwnProperty(fieldName) && formData[fieldName] === '') {
    const formFieldElem = form.elements[fieldName];
    formFieldElem.classList.add('error');
    const errorLabelElement = document.createElement('label');
    errorLabelElement.setAttribute('id', `${formFieldElem.id}-error`);
    errorLabelElement.setAttribute('class', `error`);
    errorLabelElement.setAttribute('for', `${formFieldElem.id}`);
    errorLabelElement.innerHTML = formFieldElem.placeholder ? formFieldElem.placeholder : message;
    formFieldElem.insertAdjacentElement('afterend', errorLabelElement);
    return;
  }
};

const signupAndLoginAnonymousUser = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = args.element;
    const formData = await serializeFormData(form.elements);
    const { userRole, redirectUrl } = args.parameters;
    formData.userRoles = userRole;
    const endpoint = 'auth/anonymous-user';
    showErrorOnField(form, formData, 'userName', 'Please enter username');
    showErrorOnField(form, formData, 'password', 'Please enter password');

    if (!formData.password) {
      formData.password = generateTemporaryPassword();
    }
    if (!formData.userName) {
      formData.userName = 'anonymous-user-login';
    }
    const loginFormData = {
      userName: formData.userName,
      password: formData.password,
    };

    if (formData.hasOwnProperty('email') && formData.email !== '') {
      loginFormData.email = formData.email;
      validateLoginFormData(formData, loginFormData);
    }

    let response = {};
    try {
      response.data = await publicPostCall(formData, endpoint);
      let cleanFormDataForSession = clearDataForSessionStorage(formData);

      // Add current Signed-up user UUID in response
      if (response.data.data.uuid) {
        response.data.userSignupId = response.data.data.uuid;
        loginFormData.userName = response.data.data.userName;
        response.data.collectionSaveOrUpdateResponse = response.data;
      }

      response.data.collectionFormData = cleanFormDataForSession;
      await loginIntoApplication(
        args,
        loginFormData,
        redirectUrl,
        null,
        args.parameters.redirectRules,
        LOGIN_ANONYMOUS_USER,
      );
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
        if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        } else {
          toastr.error('Username or Email already exists', 'Error');
        }
      }
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const signupAndLoginUser = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = args.element;
    const formData = await serializeFormData(form.elements);
    const { userRole, redirectUrl } = args.parameters;
    formData.userRoles = userRole;
    const endpoint = 'auth/user';

    if (formData.hasOwnProperty('password') && formData.password === '') {
      const passwordField = form.elements.password;
      passwordField.classList.add('error');
      const errorLabelElement = document.createElement('label');
      errorLabelElement.setAttribute('id', `${passwordField.id}-error`);
      errorLabelElement.setAttribute('class', `error`);
      errorLabelElement.setAttribute('for', `${passwordField.id}`);
      errorLabelElement.innerHTML = passwordField.placeholder
        ? passwordField.placeholder
        : 'Please enter password';
      passwordField.insertAdjacentElement('afterend', errorLabelElement);
      return;
    }

    if (!formData.hasOwnProperty('password') && !formData.password) {
      formData.password = generateTemporaryPassword();
    }

    const loginFormData = {
      userName: formData.userName,
      password: formData.password,
    };

    if (formData.hasOwnProperty('email') && formData.email !== '') {
      loginFormData.email = formData.email;
      validateLoginFormData(formData, loginFormData);
    }

    let response = {};
    try {
      response.data = await publicPostCall(formData, endpoint);
      let cleanFormDataForSession = clearDataForSessionStorage(formData);

      // Add current Signed-up user UUID in response
      if (response.data.data.uuid) {
        response.data.userSignupId = response.data.data.uuid;
        response.data.collectionSaveOrUpdateResponse = response.data;
      }

      response.data.collectionFormData = cleanFormDataForSession;
      await loginIntoApplication(
        args,
        loginFormData,
        redirectUrl,
        null,
        args.parameters.redirectRules,
        LOGIN_USER,
      );
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
        if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        } else {
          toastr.error('Username or Email already exists', 'Error');
        }
      }
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const resetNewPassword = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = args.element;
    const { element, parameters } = args;

    let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
    let successMessageDiv = form.getElementsByClassName('success-message')[0];
    const { password, confirmPassword } = parameters;

    const formPasswordFieldValue = password
      ? form.elements[password]
        ? form.elements[password].value
        : ''
      : form.elements['password'].value;
    const formConfirmPasswordFieldValue = password
      ? form.elements[confirmPassword]
        ? form.elements[confirmPassword].value
        : ''
      : form.elements['confirmPassword'].value;
    const formData = {
      password: formPasswordFieldValue,
      confirmPassword: formConfirmPasswordFieldValue,
    };

    if (formData.password === '' && formData.confirmPassword === '') {
      toastr.error('Please fill this field', 'Error');
    } else if (formData.password !== formData.confirmPassword) {
      alertMessageDiv.innerHTML = 'password and confirm password does not match';
      successMessageDiv.style.display = 'none';
      alertMessageDiv.style.display = 'block';
      alertMessageDiv.classList.add('mt-3');
    } else {
      const endPoint = `auth/reset-password/`;
      try {
        const url_params = Object.fromEntries(new URLSearchParams(window.location.search));
        let accessToken = url_params.token || '';
        //Fallback to fetch token from local storage
        if (!url_params.token) {
          accessToken = localStorage.getItem('token');
          accessToken = accessToken ? accessToken.split(' ')[1].trim() : '';
        }
        await securedPostCallWithToken(formData, endPoint, accessToken);
        form.reset();
        successMessageDiv.innerHTML = 'Your password has been successfully updated';
        successMessageDiv.style.display = 'block';
        successMessageDiv.classList.add('mt-3');
        alertMessageDiv.style.display = 'none';
        window.location = '/login';
      } catch (error) {
        if ([400, 401, 403].includes(error.response.status)) {
          alertMessageDiv.innerHTML = error.response.data['message']
            ? error.response.data['message']
            : error.response.data;
          successMessageDiv.style.display = 'none';
          alertMessageDiv.style.display = 'block';
          alertMessageDiv.classList.add('mt-3');
          if (error.response.status !== 400) window.location = '/forgot-password';
        }
      }
    }
  } else {
    return disabledActionResponse(args);
  }
};

const chnageOldPassword = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = args.element;
    const { element, parameters } = args;

    let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
    let successMessageDiv = form.getElementsByClassName('success-message')[0];
    const { oldPassword, password, confirmPassword } = parameters;

    const formOldPasswordFieldValue = password
      ? form.elements[oldPassword]
        ? form.elements[oldPassword].value
        : ''
      : form.elements['oldPassword'].value;

    const formPasswordFieldValue = password
      ? form.elements[password]
        ? form.elements[password].value
        : ''
      : form.elements['password'].value;
    const formConfirmPasswordFieldValue = password
      ? form.elements[confirmPassword]
        ? form.elements[confirmPassword].value
        : ''
      : form.elements['confirmPassword'].value;
    const formData = {
      oldPassword: formOldPasswordFieldValue,
      password: formPasswordFieldValue,
      confirmPassword: formConfirmPasswordFieldValue,
    };

    if (formData.password === '' && formData.confirmPassword === '') {
      toastr.error('Please fill this field', 'Error');
    } else if (formData.password !== formData.confirmPassword) {
      alertMessageDiv.innerHTML = 'Password and Confirm password does not match';
      successMessageDiv.style.display = 'none';
      alertMessageDiv.style.display = 'block';
      alertMessageDiv.classList.add('mt-3');
    } else {
      const endPoint = `auth/change-passoword/`;
      try {
        const response = await securedPostCall(formData, endPoint);
        if (response && response.status && [400, 401].includes(response.status)) {
          const errMsg = response?.data?.['message']
            ? response.data['message']
            : response?.data
              ? response.data
              : 'Failed to update your password. Please try again.';
          alertMessageDiv.innerHTML = errMsg;
          successMessageDiv.style.display = 'none';
          alertMessageDiv.style.display = 'block';
          alertMessageDiv.classList.add('mt-3');
        } else {
          form.reset();
          successMessageDiv.innerHTML = 'Your password has been successfully updated.';
          successMessageDiv.style.display = 'block';
          successMessageDiv.classList.add('mt-3');
          alertMessageDiv.style.display = 'none';
        }
      } catch (error) {
        if ([400, 401].includes(error.response.status)) {
          alertMessageDiv.innerHTML = error.response.data['message']
            ? error.response.data['message']
            : error.response.data;
          successMessageDiv.style.display = 'none';
          alertMessageDiv.style.display = 'block';
          alertMessageDiv.classList.add('mt-3');
        }
      }
    }
  } else {
    return disabledActionResponse(args);
  }
};
const handlePageRedirection = (loggedInUser, redirectPage, redirectRules) => {
  let localStorage = window.localStorage;
  const { token, projectId, role, userDetails, tenant, userSetting, subTenant } =
    loggedInUser || '';

  localStorage.setItem('token', token);
  setJsonInLocalStorage('user', userDetails);
  localStorage.setItem('projectId', projectId);
  localStorage.setItem('role', role);

  //Remove cookie if exist
  removeCookie(TENANT_ID_COOKIE_KEY);
  if (tenant) {
    setJsonInLocalStorage('tenant', tenant);
    //Set cookie to use it in jsDom at server side
    setCookie(TENANT_ID_COOKIE_KEY, tenant.uuid, 1);
  } else localStorage.removeItem('tenant');
  if (userSetting) {
    setJsonInLocalStorage('userSetting', userSetting);
  } else localStorage.removeItem('userSetting');
  if (subTenant) {
    setJsonInLocalStorage('subTenant', subTenant);
  } else localStorage.removeItem('subTenant');

  const { userRoles } = userDetails || {};
  if (redirectRules) {
    const redirectUrl = redirectRules.find((redirectRule) => {
      if (Array.isArray(userRoles)) {
        return userRoles.includes(redirectRule.role);
      } else {
        return redirectRule.role === userRoles;
      }
    });
    redirectPage = redirectUrl ? redirectUrl.page : '';
  }
  //TODO:for now explicitly have to give redirect page
  if (redirectPage) {
    window.location = redirectPage;
  }
};

async function verifyTwoFactorAuthentication(args) {
  const actionEnabled = isActionEnabled(args);
  const { element, parameters } = args;
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let form = element;
    const formData = await serializeFormData(form.elements);
    let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
    const redirectRules = parameters.redirectRules;
    try {
      let url = '/authorize-secret-code';
      let header = {};
      let response = await axios.post(url, formData, header);
      const loggedInUser = response.data;
      if (response && response.status === 200) {
        await loginActivityTracker(
          'Login',
          loggedInUser?.userDetails?.userName,
          loggedInUser?.tenant?.uuid,
        );
        handlePageRedirection(loggedInUser, null, redirectRules);
        const { userRoles } = loggedInUser.userDetails || {};
        if (redirectRules) {
          const redirectUrl = redirectRules.find((redirectRule) => {
            if (Array.isArray(userRoles)) {
              return userRoles.includes(redirectRule.role);
            } else {
              return redirectRule.role === userRoles;
            }
          });
          if (redirectUrl && redirectUrl.successMessage) {
            toastr.success(redirectUrl.successMessage, 'Success');
          }
        }
      }
    } catch (error) {
      const { response } = error;
      if (response) {
        const { status, data } = response;
        let errorMsg = '';
        if (data) {
          const { message, error } = data;
          if (message || error) {
            errorMsg = message || error;
          }
        }
        if (!errorMsg) {
          if (status === 403) {
            errorMsg = 'Verification Code is wrong. Please try again';
          } else if (status === 404 || status === 400) {
            errorMsg = 'This user does not exists.';
          } else {
            errorMsg = 'Some Internal error. Please contact support.';
          }
        }
        if (alertMessageDiv) {
          alertMessageDiv.style.display = 'block';
          alertMessageDiv.classList.add('mt-3');
          alertMessageDiv.innerHTML = errorMsg;
        } else {
          toastr.error(errorMsg, 'Error');
        }
      }
    }
  }
}

const loginIntoApplication = async function (
  args,
  data,
  redirectPage,
  alertMessageDiv = null,
  redirectRules = null,
  loginType = LOGIN_USER,
  errorMessages = {},
) {
  try {
    let url = '';
    let header = {};
    if (loginType === LOGIN_WITH_TOKEN) {
      // const ctoken = validateCookieToken();
      // if (!ctoken) return;
      header = await getHeaderForSeverForSecuredRequestWithToken(data.token);
      url = '/login-with-token';
    } else if (loginType === LOGIN_WITH_XANO) {
      url = '/login/xano';
    } else if (loginType === LOGIN_ANONYMOUS_USER) {
      url = '/login?authType=anonymous';
    } else {
      url = '/login';
    }
    let response = await axios.post(url, data, header);
    // extractCookieToken(response.headers);
    const loggedInUser = response.data;
    if (response && response.status === 200) {
      await loginActivityTracker(
        'Login',
        loggedInUser?.userDetails?.userName,
        loggedInUser?.tenant?.uuid,
      );
      if (loggedInUser.redirectTo) {
        const redirectUrlForAuth = redirectRules
          ? redirectRules.find((redirect) => redirect.role === 'TWO_FACTOR_AUTH')
          : [];
        if (loggedInUser.redirectTo === 'VERIFY') {
          window.location = '/verification-step';
        } else if (loggedInUser.redirectTo === 'REGISTER') {
          const { userDetails } = loggedInUser || '';
          if (loginType === LOGIN_ANONYMOUS_USER)
            return handlePageRedirection(loggedInUser, redirectPage);
          setJsonInLocalStorage('user', userDetails);
          window.location = redirectUrlForAuth['registerTwoFactorAuthPage'];
        }
      } else {
        handlePageRedirection(loggedInUser, redirectPage, redirectRules);
        const { userRoles } = loggedInUser.userDetails || {};
        if (redirectRules) {
          const redirectUrl = redirectRules.find((redirectRule) => {
            if (Array.isArray(userRoles)) {
              return userRoles.includes(redirectRule.role);
            } else {
              return redirectRule.role === userRoles;
            }
          });
          if (redirectUrl && redirectUrl.successMessage) {
            toastr.success(redirectUrl.successMessage, 'Success');
          }
        }
      }
    }
  } catch (error) {
    const { response } = error;
    if (response) {
      const { status, data } = response;
      let errorMsg = '';
      if (data) {
        const { message, error } = data;
        if (message || error) {
          errorMsg = message || error;
        }
        handleLoginErrorMessage(alertMessageDiv, errorMsg, status, errorMessages);
      }
    }
  } finally {
    actionCompleted(args);
  }
};

const handleLoginErrorMessage = (alertMessageDiv, errorMsg, status, errorMessages = {}) => {
  const { authErrorMessage, notFoundErrorMessage, othersErrorMessage } = errorMessages;
  let errMessage = '';
  if (authErrorMessage || notFoundErrorMessage || othersErrorMessage) {
    if (status === 401) {
      errMessage = authErrorMessage ? authErrorMessage : '';
    } else if (status === 404 || status === 400) {
      errMessage = notFoundErrorMessage ? notFoundErrorMessage : '';
    } else {
      errMessage = othersErrorMessage ? othersErrorMessage : '';
    }
  }
  if (!errMessage) {
    if (!errorMsg) {
      if (status === 401) {
        errMessage = 'Username or password does not match. Please try again';
      } else if (status === 404 || status === 400) {
        errMessage = 'This user does not exists.';
      } else {
        errMessage = 'Some Internal error. Please contact support.';
      }
    } else errMessage = errorMsg;
  }
  if (alertMessageDiv) {
    alertMessageDiv.style.display = 'block';
    alertMessageDiv.classList.add('mt-3');
    alertMessageDiv.innerHTML = errMessage;
  } else {
    toastr.error(errMessage, 'Error');
  }
};

const urlFromCurrentPageRef = async (urlToRedirect, referenceField) => {
  if (referenceField) {
    const { itemData } = await getPageItemData();
    const [field, collectionName] = referenceField.split(':');
    const fieldValue = itemData[field];
    let refItemID = '';
    if (Array.isArray(fieldValue) && fieldValue.length > 0 && typeof fieldValue[0] === 'string') {
      refItemID = fieldValue.join(',');
    } else {
      refItemID = parseValueFromData(itemData, field + '.uuid');
    }
    urlToRedirect += `/${collectionName}/${refItemID}`;
  }
  return urlToRedirect;
};

// Helper to build collection URL segment
const buildCollectionUrlSegment = (collectionName, itemId) => {
  return collectionName && itemId ? `/${collectionName}/${itemId}` : '';
};

// Helper to handle current object URL building
const handleCurrentObjectUrl = (response) => {
  if (!response || response === 'undefined') return {};

  const { status, data, collectionSaveOrUpdateResponse, externalApiResponse, userSignupId } =
    response;
  if (status === 'error') return { error: response };

  const { config } = collectionSaveOrUpdateResponse || externalApiResponse || response;
  let collectionName = config.url.split('collection-form/')[1]?.split('/items')[0] || '';
  let itemId = data.uuid;

  // Handle special cases
  if (!collectionName && userSignupId) {
    collectionName = COLLECTION_USER;
    itemId = userSignupId;
  } else if (!itemId && collectionName) {
    const previousResponse = JSON.parse(sessionStorage.getItem('previousActionResponse') || '{}');
    itemId = previousResponse[`collection_${collectionName}`]?.uuid;
  }

  return { collectionName, itemId };
};

// Helper to handle previous step URL building
const handlePreviousStepUrl = (response, targetElement, fallbackToCurrentObject = false) => {
  if (!response || response === 'undefined') return {};

  const previousResponse = JSON.parse(sessionStorage.getItem('previousActionResponse') || '{}');
  let collectionName = previousResponse[PARENT_COLLECTION_PROPAGATE_KEY]?.name;
  let itemId = previousResponse[PARENT_COLLECTION_PROPAGATE_KEY]?.uuid;

  // Fallback to Current Object from response
  if (fallbackToCurrentObject && (!collectionName || !itemId)) {
    const { collectionName: responseCollectionName, itemId: responseItemId } =
      handleCurrentObjectUrl(response);
    if (responseCollectionName && responseItemId) {
      collectionName = responseCollectionName;
      itemId = responseItemId;
    }
  }

  // Fallback to target element if needed
  if (!collectionName || !itemId) {
    collectionName = targetElement?.getAttribute('data-collection-id');
    itemId = targetElement?.getAttribute('data-item-id');
  }

  return { collectionName, itemId };
};

// Helper to update session storage
const updateSessionStorage = (collectionName, itemId) => {
  const parentCollectionData = {
    [PARENT_COLLECTION_PROPAGATE_KEY]: {
      uuid: itemId,
      name: collectionName,
    },
  };

  const existingData = JSON.parse(sessionStorage.getItem('previousActionResponse') || '{}');
  sessionStorage.setItem(
    'previousActionResponse',
    JSON.stringify({ ...existingData, ...parentCollectionData }),
  );
};

// Main URL builder function
const buildRedirectUrl = async (args) => {
  const {
    parameters: {
      sendItemIdFrom,
      destination,
      referenceField,
      bslCollection,
      browserStorageLocation,
      itemIdBSLKey,
      sendExternalApiMiddlewareId,
    },
    response,
    targetElement,
  } = args;

  let baseUrl = destination;

  // Handle modern strategy-based routing
  if (sendItemIdFrom) {
    switch (sendItemIdFrom) {
      case URL_STRATEGIES.CURRENT_OBJECT: {
        const { collectionName, itemId, error } = handleCurrentObjectUrl(response);
        if (error) return { error };
        if (collectionName && itemId) {
          updateSessionStorage(collectionName, itemId);
          baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        }
        break;
      }

      case URL_STRATEGIES.PREVIOUS_STEP: {
        const { collectionName, itemId } = handlePreviousStepUrl(response, targetElement);
        if (collectionName && itemId) {
          baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        }
        break;
      }

      case URL_STRATEGIES.CURRENT_PAGE: {
        baseUrl = urlFromCurrentPage(baseUrl);
        break;
      }

      case URL_STRATEGIES.CURRENT_USER: {
        const currentUser = fetchLoggedInUserJson();
        if (currentUser?.uuid) {
          baseUrl += buildCollectionUrlSegment(COLLECTION_USER, currentUser.uuid);
        }
        break;
      }

      case URL_STRATEGIES.TARGET_ITEM: {
        const collectionName = targetElement?.getAttribute('data-collection-id');
        const itemId = targetElement?.getAttribute('data-item-id');
        baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        break;
      }

      case URL_STRATEGIES.PAGE_REFERENCE: {
        baseUrl = await urlFromCurrentPageRef(baseUrl, referenceField);
        break;
      }

      case URL_STRATEGIES.BSL_ITEM: {
        const browserStorageData = await getBSLData(browserStorageLocation);
        const bslDataValue =
          browserStorageData && itemIdBSLKey ? _.get(browserStorageData, itemIdBSLKey.trim()) : '';
        if (bslCollection && bslDataValue) {
          baseUrl += buildCollectionUrlSegment(bslCollection, bslDataValue);
        }
        break;
      }
    }
  } else {
    // Handle legacy parameters when there is response data
    if (response && response !== 'undefined') {
      const { status, data } = response;

      if (status === 'error') return { error: response };

      if (sendExternalApiMiddlewareId) {
        const externalApiMiddlewareId = data.externalApiMiddlewareId;
        baseUrl += `?externalId=${externalApiMiddlewareId}`;
      }

      // Handle various legacy conditions
      if (
        args.parameters.sendCurrentObjectID === true ||
        args.parameters.sendCurrentObjectID === 'true'
      ) {
        const { collectionName, itemId } = handleCurrentObjectUrl(response);
        if (collectionName && itemId) {
          updateSessionStorage(collectionName, itemId);
          baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        }
      } else if (
        args.parameters.sendPreviousStepParentCollectionId === true ||
        args.parameters.sendPreviousStepParentCollectionId === 'true'
      ) {
        const { collectionName, itemId } = handlePreviousStepUrl(response, targetElement);
        if (collectionName && itemId) {
          baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        }
      } else if (
        args.parameters.sendCurrentUserId === true ||
        args.parameters.sendCurrentUserId === 'true'
      ) {
        const currentUser = fetchLoggedInUserJson();
        if (currentUser?.uuid) {
          baseUrl += buildCollectionUrlSegment(COLLECTION_USER, currentUser.uuid);
        }
      } else if (
        args.parameters.sendCurrentPageItemId === true ||
        args.parameters.sendCurrentPageItemId === 'true'
      ) {
        baseUrl = urlFromCurrentPage(baseUrl);
      } else if (
        args.parameters.sendCurrentPageReferenceItemId === true ||
        args.parameters.sendCurrentPageReferenceItemId === 'true'
      ) {
        baseUrl = await urlFromCurrentPageRef(baseUrl, referenceField);
      } else if (
        args.parameters.sendTargetItemID === true ||
        args.parameters.sendTargetItemID === 'true'
      ) {
        const collectionName = targetElement?.getAttribute('data-collection-id');
        const itemId = targetElement?.getAttribute('data-item-id');
        if (collectionName && itemId) {
          baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        }
      }
    } else {
      // Handle other options separately as they doesn't depend on the response
      if (
        args.parameters.sendCurrentUserId === true ||
        args.parameters.sendCurrentUserId === 'true'
      ) {
        const currentUser = fetchLoggedInUserJson();
        if (currentUser?.uuid) {
          baseUrl += buildCollectionUrlSegment(COLLECTION_USER, currentUser.uuid);
        }
      } else if (
        args.parameters.sendCurrentPageItemId === true ||
        args.parameters.sendCurrentPageItemId === 'true'
      ) {
        baseUrl = urlFromCurrentPage(baseUrl);
      } else if (
        args.parameters.sendCurrentPageReferenceItemId === true ||
        args.parameters.sendCurrentPageReferenceItemId === 'true'
      ) {
        baseUrl = await urlFromCurrentPageRef(baseUrl, referenceField);
      } else if (
        args.parameters.sendTargetItemID === true ||
        args.parameters.sendTargetItemID === 'true'
      ) {
        const collectionName = targetElement?.getAttribute('data-collection-id');
        const itemId = targetElement?.getAttribute('data-item-id');
        if (collectionName && itemId) {
          baseUrl += buildCollectionUrlSegment(collectionName, itemId);
        }
      }
    }
  }

  return { url: baseUrl };
};

const goToPage = async (args) => {
  if (!isActionEnabled(args)) {
    return disabledActionResponse(args);
  }
  try {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise((resolve) => resolve(args));

    const { url, error } = await buildRedirectUrl(args);
    if (error) return error;
    const {
      parameters: { isNewTab },
    } = args;
    if (isNewTab) {
      // Support Safari browser
      setTimeout(() => {
        window.open(url, '_blank').focus();
      });
    } else {
      window.location = url;
    }
  } catch (error) {
    console.error('Error in goToPage:', error);
    return { status: 'error', message: error.message };
  } finally {
    actionCompleted(args);
  }
};

const dynamicPageRedirect = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters, response, targetElement } = args ? args : '';
    const form = element && element.tagName === 'FORM' ? element : '';
    const { collectionFrom, fieldName, redirectRules, collectionName } = parameters;
    let collectionItem = '';
    if (!['session', 'page', 'sessionActionResponse'].includes(collectionFrom)) {
      collectionItem = element.dataset.collectionItem
        ? JSON.parse(element.dataset.collectionItem)
        : {};
    }
    let itemDataForFieldValue = {};

    if (collectionFrom === 'collections') {
      if ((!collectionItem || !Object.keys(collectionItem).length) && form) {
        const submitBtnElem = form.querySelector('button[type=submit]');
        const collectionItemId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
        if (collectionItemId) {
          const collectionItemData = await getCollectionItemById(collectionName, collectionItemId);
          if (collectionItemData) {
            collectionItem = { ...collectionItemData };
          }
        }
      }
      itemDataForFieldValue = collectionItem;
    } else if (collectionFrom === 'collectionForm') {
      collectionItem =
        response && response.collectionSaveOrUpdateResponse
          ? response.collectionSaveOrUpdateResponse.data
          : {};
      itemDataForFieldValue = collectionItem;
    } else if (collectionFrom === 'page') {
      const { itemData } = await getPageItemData();
      itemDataForFieldValue = itemData;
    } else if (collectionFrom === 'session') {
      const loggedInUser = fetchLoggedInUserJson();
      itemDataForFieldValue = loggedInUser || {};
    }

    let fieldValueOfItem = '';
    if (collectionFrom === 'sessionActionResponse') {
      fieldValueOfItem = parseSessionObject(fieldName);
      if (fieldValueOfItem) {
        fieldValueOfItem = fieldValueOfItem.toString();
      }
    } else {
      fieldValueOfItem = parseValueFromData(itemDataForFieldValue, fieldName);
    }

    let urlToRedirect = '';
    let applyDefaultRedirectRule = true;

    await Promise.all(
      redirectRules.map(async (redirectRule) => {
        // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
        new Promise(function (resolve, reject) {
          resolve(redirectRule);
        });
        const { fieldValue, page, pathField, seoField, target, fieldCollectionSource } =
          redirectRule;
        if (fieldValue === fieldValueOfItem) {
          let pathId = '';
          let pathCollection = '';
          let pathSeo = '';
          if (pathField) {
            const pathIdAndCollection = await getUrlWithSeoAndPathField(
              pathField,
              null,
              collectionFrom,
              collectionItem,
              parameters,
              targetElement,
            );
            pathId = pathIdAndCollection.pathId;
            pathCollection = pathIdAndCollection.pathCollection;

            switch (fieldCollectionSource) {
              case 'formCollection':
                if (form) {
                  const collectionItemData =
                    response && response.collectionSaveOrUpdateResponse
                      ? response.collectionSaveOrUpdateResponse.data
                      : '';
                  pathId = collectionItemData ? collectionItemData.uuid : '';
                  pathCollection = form.dataset.formCollection;
                }
                break;
              case 'cmsCollection':
                if (form) {
                  const submitBtnElem = form.querySelector('button[type=submit]');
                  pathCollection = submitBtnElem
                    ? submitBtnElem.getAttribute('data-collection-id')
                    : '';
                  pathId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
                } else {
                  pathCollection = targetElement
                    ? targetElement.getAttribute('data-collection-id')
                    : '';
                  pathId = targetElement ? targetElement.getAttribute('data-item-id') : '';
                }
                break;
              default:
                break;
            }
          }
          if (seoField) {
            pathSeo = await getUrlWithSeoAndPathField(
              null,
              seoField,
              collectionFrom,
              collectionItem,
              parameters,
              targetElement,
            );
          }
          urlToRedirect = '/' + page;
          if (pathId && pathCollection) {
            urlToRedirect = `${urlToRedirect}/${pathCollection}/${pathSeo ? pathSeo : ''}${pathId}`;
          }
          if (urlToRedirect) {
            applyDefaultRedirectRule = false;
          }

          actionCompleted(args);
          if (target) {
            //Support Safari browser
            setTimeout(() => {
              window.open(urlToRedirect, '_blank').focus();
            });
          } else {
            window.location = urlToRedirect;
          }
        }
      }),
    );

    if (applyDefaultRedirectRule) {
      const defaultRedirectKeywords = ['null', 'NULL', 'DEFAULT', 'EMPTY'];
      const defaultRedirectRule =
        redirectRules && redirectRules.length
          ? redirectRules.find((redirectRule) =>
              defaultRedirectKeywords.includes(redirectRule.fieldValue.trim()),
            )
          : '';

      actionCompleted(args);
      if (defaultRedirectRule) {
        const { page, target } = defaultRedirectRule;
        urlToRedirect = '/' + page;

        if (target) {
          //Support Safari browser
          setTimeout(() => {
            window.open(urlToRedirect, '_blank').focus();
          });
        } else {
          window.location = urlToRedirect;
        }
      }
    }
  } else {
    return disabledActionResponse(args);
  }
};

const getUrlWithSeoAndPathField = async (
  pathField,
  seoField,
  collectionFrom,
  collectionItem,
  parameters,
  targetElement,
) => {
  let { fieldFrom, collectionName, fieldName } = pathField
    ? JSON.parse(pathField)
    : JSON.parse(seoField);
  const { collectionName: paramCollectionName } = parameters ?? '';

  let itemDataForUrl = {};
  if (fieldFrom === 'eventCollection' && collectionFrom === 'page') {
    const { itemData } = await getPageItemData();
    itemDataForUrl = itemData;
  } else if (fieldFrom === 'eventCollection') {
    itemDataForUrl = collectionItem;
  } else if (fieldFrom === 'session') {
    if (collectionName === 'PAGE_COLLECTION') {
      const { itemData, collectionId } = await getPageItemData();
      itemDataForUrl = itemData;
      collectionName = collectionId;
      fieldName = 'uuid';
    } else {
      const loggedInUserData = fetchLoggedInUserJson();
      itemDataForUrl = loggedInUserData;
    }
  }
  if (pathField) {
    if (fieldFrom === 'previousStepCollectionItemId') {
      collectionName = paramCollectionName;
      let sessionValue = parseSessionObject(`collection_${collectionName}`);
      pathId = sessionValue ? sessionValue.uuid : '';

      //?INFO: Second pass to handle Item Id from target element
      if (!pathId) {
        pathId = targetElement ? targetElement.getAttribute('data-item-id') : '';
      }
    } else if (fieldFrom === 'currentCollectionItem' && collectionName === 'PARENT_COLLECTION') {
      const form = targetElement && targetElement.tagName === 'FORM' ? targetElement : '';
      if (form) {
        const submitBtnElem = form.querySelector('button[type=submit]');
        collectionName = submitBtnElem ? submitBtnElem.getAttribute('data-collection-id') : '';
        pathId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
      } else {
        collectionName = targetElement ? targetElement.getAttribute('data-collection-id') : '';
        pathId = targetElement ? targetElement.getAttribute('data-item-id') : '';
      }
      fieldName = 'uuid';
    } else {
      pathId = parseValueFromData(itemDataForUrl, fieldName);
    }
    return { pathId, pathCollection: collectionName };
  }
  if (seoField) {
    const seoHref = parseValueFromData(itemDataForUrl, fieldName);
    return slugify(seoHref);
  }
};

const reloadPage = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    actionCompleted(args);
    window.location.reload();
  } else {
    return disabledActionResponse(args);
  }
};

const refreshSection = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let refreshComponent = args.parameters.refreshComponent;
    let refreshComponentPosition = args.parameters.refreshComponentPosition;
    let refreshComponentType = refreshComponent.split(':')[0];
    let refreshComponentId = refreshComponent.split(':')[1];

    const element = document.getElementById(refreshComponentId);
    await handleRefreshComponent(
      refreshComponentPosition,
      refreshComponentType,
      refreshComponentId,
      element,
      args.response,
    );
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const updateCurrentLoggedInUserData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters, targetElement } = args || '';
    const { elements } = element || '';
    const data = await serializeFormData(elements);
    const { successMessage, errorMessage, constructor } = parameters || '';
    const collection = COLLECTION_USER;

    if (collection && constructor) {
      const ipAddress = await getIPAddress();
      let navigator = {};
      _.merge(navigator, window.navigator);

      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
      // Get Browser Storage Data Object
      const browserData = await getBrowserData();

      data['constructorMetaObj'] = {
        collectionName: collection,
        constructorId: constructor,
        ipAddress: ipAddress ?? '',
        navigator: navigator,
        ...browserData,
        previousActionResponse,
        previousActionFormData,
      };
    }

    let response = {};
    let apiCallResult;
    if (isLoggedInUser()) {
      const loggedInUser = fetchLoggedInUserJson();
      let endpoint = `collection-form/${collection}/items/${loggedInUser.uuid}`;

      try {
        apiCallResult = await securedPutCall(data, endpoint);
        response.data = apiCallResult;
        response.data.collectionSaveOrUpdateResponse = apiCallResult;
        response.status = 'success';

        const { collectionSaveOrUpdateResponse } = response.data;
        const { data: collectionItemData } = collectionSaveOrUpdateResponse;
        const collectionItemId = collectionItemData.uuid;

        const collectionKey = `collection_${collection}`;
        const collectionItemUuidKey = 'uuid';
        const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...collectionData }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
        }

        response.data = { ...response.data, ...collectionData };
        await resetCurrentUserInLocalStorage();
        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.data.collectionSaveOrUpdateResponse = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      } finally {
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'User not logged in!', 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const updateCurrentTenantData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters, targetElement } = args || '';
    const { elements } = element || '';
    const data = await serializeFormData(elements);
    const { successMessage, errorMessage, constructor } = parameters || '';
    const multiTenantPlugin = await fetchInstalledPluginByCode('MULTI_TENANT_SAAS');
    const multiTenantCollectionDetail = await fetchMultiTenantCollection(multiTenantPlugin);
    const collection = multiTenantCollectionDetail.collectionName;

    if (collection && constructor) {
      const ipAddress = await getIPAddress();
      let navigator = {};
      _.merge(navigator, window.navigator);

      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
      // Get Browser Storage Data Object
      const browserData = await getBrowserData();

      data['constructorMetaObj'] = {
        collectionName: collection,
        constructorId: constructor,
        ipAddress: ipAddress ?? '',
        navigator: navigator,
        ...browserData,
        previousActionResponse,
        previousActionFormData,
      };
    }

    let response = {};
    let apiCallResult;
    if (isLoggedInTenant()) {
      const currentTenant = fetchCurrentTenantJson();
      let endpoint = `collection-form/${collection}/items/${currentTenant.uuid}`;

      try {
        apiCallResult = await securedPutCall(data, endpoint);
        response.data = apiCallResult;
        response.data.collectionSaveOrUpdateResponse = apiCallResult;
        response.status = 'success';

        const { collectionSaveOrUpdateResponse } = response.data;
        const { data: collectionItemData } = collectionSaveOrUpdateResponse;
        const collectionItemId = collectionItemData.uuid;

        const collectionKey = `collection_${collection}`;
        const collectionItemUuidKey = 'uuid';
        const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...collectionData }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
        }

        response.data = { ...response.data, ...collectionData };
        await resetCurrentTenantInLocalStorage();

        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.data.collectionSaveOrUpdateResponse = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      } finally {
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'Tenant not logged in!', 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const updateCurrentUserSettingData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters, targetElement } = args || '';
    const { elements } = element || '';
    const data = await serializeFormData(elements);
    const { successMessage, errorMessage, constructor } = parameters || '';
    const multiTenantPlugin = await fetchInstalledPluginByCode('MULTI_TENANT_SAAS');
    const userSettingCollectionDetail = await fetchUserSettingCollection(multiTenantPlugin);
    const collection = userSettingCollectionDetail.collectionName;
    if (collection && constructor) {
      const ipAddress = await getIPAddress();
      let navigator = {};
      _.merge(navigator, window.navigator);
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
      let previousActionFormData = sessionStorage.getItem('previousActionFormData');
      previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
      // Get Browser Storage Data Object
      const browserData = await getBrowserData();

      data['constructorMetaObj'] = {
        collectionName: collection,
        constructorId: constructor,
        ipAddress: ipAddress ?? '',
        navigator: navigator,
        ...browserData,
        previousActionResponse,
        previousActionFormData,
      };
    }
    let response = {};
    let apiCallResult;
    if (isLoggedInUserSetting()) {
      const currentUserSetting = fetchCurrentUserSettingsJson();
      let endpoint = `collection-form/${collection}/items/${currentUserSetting.uuid}`;
      try {
        apiCallResult = await securedPutCall(data, endpoint);
        response.data = apiCallResult;
        response.data.collectionSaveOrUpdateResponse = apiCallResult;
        response.status = 'success';
        const { collectionSaveOrUpdateResponse } = response.data;
        const { data: collectionItemData } = collectionSaveOrUpdateResponse;
        const collectionItemId = collectionItemData.uuid;
        const collectionKey = `collection_${collection}`;
        const collectionItemUuidKey = 'uuid';
        const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...collectionData }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
        }
        response.data = { ...response.data, ...collectionData };
        //user setting reset is also handled in this function only
        await resetCurrentTenantInLocalStorage();
        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.data.collectionSaveOrUpdateResponse = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      } finally {
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'Tenant not logged in!', 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

//TODO: Ali -> Check & Remove
const addUserToTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters } = args;
    const { successMessage, errorMessage, confirmationMessage } = parameters;
    const itemId = args.targetElement.getAttribute('data-item-id');
    let form = element && element.tagName === 'FORM' ? element : '';
    const formData = form ? await serializeFormData(form.elements) : '';
    let response = {};
    let apiCallResult;

    if (isLoggedInUser()) {
      try {
        const multiTenantPlugin = await fetchInstalledPluginByCode('MULTI_TENANT_SAAS');
        if (multiTenantPlugin) {
          const loggedInUser = fetchLoggedInUserJson();
          const currentTenant = fetchCurrentTenantJson();
          let currentTenantId = '';
          const currentUserSettingCollection = await fetchUserSettingCollection(multiTenantPlugin);
          if (currentTenant) {
            currentTenantId = currentTenant.uuid;
          } else {
            toastr.error('Tenant not found!', 'Error');
          }

          let userItemEndpoint = `collection-table/${COLLECTION_USER}/items/`;
          const userApiResponse = await securedGetCall(userItemEndpoint);
          if (userApiResponse.status === 200) {
            const { data: users } = userApiResponse;
            let userFindByKey = 'uuid';
            if (form && formData) {
              if (formData.hasOwnProperty('userName')) {
                userFindByKey = 'userName';
              } else if (formData.hasOwnProperty('email')) {
                userFindByKey = 'email';
              }
            }

            if (userFindByKey) {
              let selectedUser = '';
              if (form && formData) {
                selectedUser =
                  users && users.find((user) => user[userFindByKey] === formData[userFindByKey]);
              } else {
                selectedUser = users && users.find((user) => user[userFindByKey] === itemId);
              }

              if (selectedUser) {
                const multiTenantCollectionDetail =
                  await fetchMultiTenantCollection(multiTenantPlugin);

                if (multiTenantCollectionDetail) {
                  if (confirmationMessage) {
                    await swalAlert(confirmationMessage, 'Proceed', true, false).then(
                      async (willProceed) => {
                        if (willProceed.isConfirmed) {
                          response = await addTenantReferenceToUser(
                            apiCallResult,
                            response,
                            loggedInUser,
                            selectedUser,
                            currentTenantId,
                            currentUserSettingCollection,
                            successMessage,
                          );
                          response.confirmation = willProceed;
                          return response;
                        } else {
                          response.confirmation = willProceed;
                          response.status = 'cancel';
                          return response;
                        }
                      },
                    );
                  } else {
                    response = await addTenantReferenceToUser(
                      apiCallResult,
                      response,
                      loggedInUser,
                      selectedUser,
                      currentTenantId,
                      currentUserSettingCollection,
                      successMessage,
                    );
                  }
                }
              }
            }
          }
        } else {
          toastr.error('Multi Tenant SaaS plugin not found!', 'Error');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.data.collectionSaveOrUpdateResponse = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      } finally {
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'User not logged in!', 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const addNewUserToTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters, targetElement } = args;
    const {
      successMessage,
      errorMessage,
      userRole,
      confirmationMessage,
      userSettings,
      passPreviousActionFormData,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
    } = parameters;

    let itemId = targetElement.getAttribute('data-item-id');
    let form = element && element.tagName === 'FORM' ? element : '';
    const formData = form ? await serializeFormData(form.elements) : '';
    let cleanFormDataForSession = clearDataForSessionStorage(formData);
    if (
      passPreviousActionFormData &&
      (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
    ) {
      if (formDataBrowserStorageLocation && formDataSessionKey) {
        setDataInSessionStorageLocation(
          formDataBrowserStorageLocation,
          formDataSessionKey,
          cleanFormDataForSession,
        );
      }
    }
    let response = {};
    let apiCallResult;

    if (!itemId) {
      //Handling for Form Submit
      const submitBtnElem = targetElement.querySelector('button[type=submit]');
      itemId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
    }

    if (isLoggedInUser()) {
      try {
        const multiTenantPlugin = await fetchInstalledPluginByCode('MULTI_TENANT_SAAS');
        if (multiTenantPlugin) {
          const loggedInUser = fetchLoggedInUserJson();
          const currentTenant = fetchCurrentTenantJson();
          let currentTenantId = '';
          const currentUserSettingCollection = await fetchUserSettingCollection(multiTenantPlugin);

          if (currentTenant) {
            currentTenantId = currentTenant.uuid;
          } else {
            toastr.error('Tenant not found!', 'Error');
          }
          let userFindByKey = 'uuid';
          let userFindValue = '';
          let hasTenantRoleMapping = false;
          let tenantRoleMappingValue = '';
          if (form && formData) {
            if (formData.hasOwnProperty('tenantRoleMapping')) {
              hasTenantRoleMapping = true;
              tenantRoleMappingValue = formData.tenantRoleMapping;
            }
            if (formData.hasOwnProperty('userName')) {
              userFindByKey = 'userName';
            } else if (formData.hasOwnProperty('email')) {
              userFindByKey = 'email';
            }
            if (userFindByKey) {
              userFindValue = formData[userFindByKey] || itemId;
              let userItemEndpoint = `auth/userDetails/${userFindValue}`;
              let selectedUser = '';
              const userApiResponse = await securedGetCall(userItemEndpoint, true);
              if (userApiResponse?.status === 200) {
                selectedUser = userApiResponse.data;
              } else if (userApiResponse?.response?.status !== 404) throw Error(userApiResponse);
              if (selectedUser) {
                const multiTenantCollectionDetail =
                  await fetchMultiTenantCollection(multiTenantPlugin);
                if (multiTenantCollectionDetail) {
                  if (confirmationMessage) {
                    await swalAlert(confirmationMessage, 'Proceed', true, false).then(
                      async (willProceed) => {
                        if (willProceed.isConfirmed) {
                          response = await addTenantReferenceToUser(
                            apiCallResult,
                            response,
                            loggedInUser,
                            selectedUser,
                            currentTenantId,
                            userSettings ? currentUserSettingCollection : null,
                            successMessage,
                            hasTenantRoleMapping,
                            tenantRoleMappingValue,
                          );
                          response.confirmation = willProceed;
                          return response;
                        } else {
                          response.confirmation = willProceed;
                          response.status = 'cancel';
                          return response;
                        }
                      },
                    );
                  } else {
                    response = await addTenantReferenceToUser(
                      apiCallResult,
                      response,
                      loggedInUser,
                      selectedUser,
                      currentTenantId,
                      userSettings ? currentUserSettingCollection : null,
                      successMessage,
                      hasTenantRoleMapping,
                      tenantRoleMappingValue,
                    );
                  }
                }
              } else {
                response = await createUserWithTenantReference(
                  element,
                  parameters,
                  response,
                  userRole,
                  formData,
                  currentTenantId,
                  userSettings ? currentUserSettingCollection : null,
                  confirmationMessage,
                  hasTenantRoleMapping,
                  tenantRoleMappingValue,
                );
              }
            }
          }
        } else {
          toastr.error('Multi Tenant SaaS plugin not found!', 'Error');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.data.collectionSaveOrUpdateResponse = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      } finally {
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'User not logged in!', 'Error');
    }
    let userSetting = response?.userSetting;
    let resData = response?.data?.data ?? response?.data ?? response;
    if (resData) {
      resData = userSetting ? { ...resData, userSetting } : resData;
    }
    if (
      passPreviousActionResponse &&
      (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
    ) {
      setDataInSessionStorageLocation(
        responseDataSessionStorageLocation,
        responseDataSessionKey,
        resData,
      );
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const removeUserFromTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters, targetElement } = args;
    const { successMessage, errorMessage, confirmationMessage, removeUserSettings } = parameters;
    let itemId = args.targetElement.getAttribute('data-item-id');
    let form = element && element.tagName === 'FORM' ? element : '';
    const formData = form ? await serializeFormData(form.elements) : '';
    let response = {};
    let apiCallResult;

    if (!itemId) {
      //Handling for Form Submit
      const submitBtnElem = targetElement.querySelector('button[type=submit]');
      itemId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
    }

    if (isLoggedInUser()) {
      try {
        const multiTenantPlugin = await fetchInstalledPluginByCode('MULTI_TENANT_SAAS');
        if (multiTenantPlugin) {
          const loggedInUser = fetchLoggedInUserJson();
          const currentTenant = fetchCurrentTenantJson();
          const currentUserSettings = fetchCurrentUserSettingsJson();
          let currentTenantId = '';
          let currentUserSettingsId = '';

          if (currentTenant) {
            currentTenantId = currentTenant.uuid;
          } else {
            toastr.error('Tenant not found!', 'Error');
          }

          if (removeUserSettings && currentUserSettings) {
            currentUserSettingsId = currentUserSettings.uuid;
          }

          let userItemEndpoint = `collection-table/${COLLECTION_USER}/items/`;
          const userApiResponse = await securedGetCall(userItemEndpoint);

          if (userApiResponse.status === 200) {
            const { data: users } = userApiResponse;
            let userFindByKey = 'uuid';

            if (form && formData) {
              if (formData.hasOwnProperty('userName')) {
                userFindByKey = 'userName';
              } else if (formData.hasOwnProperty('email')) {
                userFindByKey = 'email';
              }
            }

            if (userFindByKey) {
              let selectedUser = '';
              if (form && formData && formData[userFindByKey]) {
                selectedUser =
                  users && users.find((user) => user[userFindByKey] === formData[userFindByKey]);
              } else {
                selectedUser = users && users.find((user) => user[userFindByKey] === itemId);
              }

              if (selectedUser) {
                const multiTenantCollectionDetail =
                  await fetchMultiTenantCollection(multiTenantPlugin);
                const userSettingsCollection = await fetchUserSettingCollection(multiTenantPlugin);

                if (multiTenantCollectionDetail) {
                  if (confirmationMessage) {
                    await swalAlert(confirmationMessage, 'Proceed', true, false).then(
                      async (willProceed) => {
                        if (willProceed.isConfirmed) {
                          response = await removeTenantReferenceFromUser(
                            selectedUser,
                            currentTenantId,
                            apiCallResult,
                            response,
                            loggedInUser,
                            successMessage,
                            removeUserSettings,
                            currentUserSettingsId,
                            userSettingsCollection,
                          );
                          response.confirmation = willProceed;
                          return response;
                        } else {
                          response.confirmation = willProceed;
                          response.status = 'cancel';
                          return response;
                        }
                      },
                    );
                  } else {
                    response = await removeTenantReferenceFromUser(
                      selectedUser,
                      currentTenantId,
                      apiCallResult,
                      response,
                      loggedInUser,
                      successMessage,
                      removeUserSettings,
                      currentUserSettingsId,
                      userSettingsCollection,
                    );
                  }
                }
              }
            }
          }
        } else {
          toastr.error('Multi Tenant SaaS plugin not found!', 'Error');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.data.collectionSaveOrUpdateResponse = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      } finally {
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'User not logged in!', 'Error');
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const appendPrepend = async (dtPaginateMapData, response, refreshComponentPosition) => {
  if (!response || Object.keys(response).length === 0) {
    console.log('No response came from server');
    return;
  }

  let { data, forNextStep } = response;
  if (forNextStep) {
    if (forNextStep === 'REMOVE') {
      // Remove From Collection
      const { dataItemId } = data;
      if (dataItemId) {
        const removedForm = document.querySelector(`tr>td>form[data-item-id="${dataItemId}"]`);
        let actualParent = removedForm.parentNode;
        if (actualParent.nodeName === 'TR') {
          actualParent.remove();
          return;
        }
        actualParent = actualParent.parentNode;
        if (actualParent.nodeName === 'TR') {
          actualParent.remove();
          return;
        }
        actualParent = actualParent.parentNode;
        if (actualParent.nodeName === 'TR') {
          actualParent.remove();
          return;
        }
      }
      //refresh
    } else if (forNextStep === 'ADD') {
      // Add to Collection
      const { itemData } = data;
      if (dtPaginateMapData && dtPaginateMapData !== 'undefined') {
        const { fieldName, dataTable } = dtPaginateMapData;
        const dataId = data[fieldName][0];
        if (dataTable && dataTable.innerHTML && dataTable.innerHTML.includes(dataId)) {
          return;
        }
        data = itemData[fieldName].find((item) => item.uuid === dataId);
        await processPrependAndAppend(data, dtPaginateMapData, refreshComponentPosition);
      }
    }
  } else {
    await processPrependAndAppend(data, dtPaginateMapData, refreshComponentPosition);
  }
};

const processPrependAndAppend = async (data, dtPaginateMapData, refreshComponentPosition) => {
  const { firstRowElements, columnsMap, tbodyElement, dataTable } = dtPaginateMapData;
  const columns = getTableColumns(data, columnsMap, firstRowElements);
  const orgTrElement = firstRowElements.tagName === 'TR' ? firstRowElements : '';
  let orgTrElementTagId = '';
  if (orgTrElement) {
    const sourceElement = orgTrElement.cloneNode(true);
    orgTrElementTagId = elementAttribute(orgTrElement, 'id');
    applyUserDefinedStyles(sourceElement, orgTrElement, dataTableStylesMap);
  }

  const finalRow = `<tr ${setIdAttribute(orgTrElementTagId)}>${columns}</tr>`;
  const tableBodyHtmlContent = tbodyElement.innerHTML;
  tbodyElement.innerHTML = '';
  if (refreshComponentPosition === 'End') {
    tbodyElement.innerHTML = `${tableBodyHtmlContent}${finalRow}`;
  } else if (refreshComponentPosition === 'Beginning') {
    tbodyElement.innerHTML = `${finalRow}${tableBodyHtmlContent}`;
  }

  //to remove no more record row from table
  const dataTableId = dataTable.getAttribute('id');
  const dataTableNode = document.getElementById(dataTableId);
  const noRecordnode = $(dataTableNode).find('.no-record-data-table');
  noRecordnode.remove();
};

const modifyPaginationDataForRefresh = async function (paginationData) {
  paginationData.numberPerPage = paginationData.currentPage * paginationData.numberPerPage;
  paginationData.currentPage = 1;

  const placeholderItem = createContentPlaceholder(
    paginationData.replacedElement.childElementCount || 1,
    paginationData.dataGroupChildren[0].id,
    paginationData.dataGroupChildren[0].className,
  );
  paginationData.replacedElement.innerHTML = placeholderItem;
};
resetPaginationData = async function (paginationData, orgNumberPerPage, orgCurrentPage) {
  paginationData.numberPerPage = orgNumberPerPage;
  paginationData.currentPage = orgCurrentPage;
};

/** Rest API **/
const SERVER_URL = getBackendServerUrl();
const PROTOCOL = window.location.protocol;
let localStorage = window.localStorage;

const getHeaderForSeverForSecuredRequest = async (token = '') => {
  const accessToken = localStorage.getItem('token');
  const projectId = localStorage.getItem('projectId');
  const currentTenant = isLoggedInUser() ? fetchCurrentTenantJson() : '';
  const currentTenantId = currentTenant ? currentTenant.uuid : '';
  const currentSubTenant = isLoggedInUser() ? fetchCurrentSubTenantJson() : '';
  const currentSubTenantId = currentSubTenant ? currentSubTenant.uuid : '';
  const ipAddress = await getIPAddress();
  const data = await checkTokenExpiry(accessToken);
  const { status, message } = data;
  if (status === 200) {
    let apiConfig = {
      headers: {
        'Content-Type': 'application/json',
        'x-project-id': projectId,
        // JSESSIONID: token,
        authorization: accessToken,
        'x-user-ip': ipAddress,
      },
    };
    if (currentTenantId) apiConfig.headers['x-tenant-id'] = currentTenantId;
    if (currentSubTenantId) apiConfig.headers['x-sub-tenant-id'] = currentSubTenantId;
    return apiConfig;
  }
};
const getHeaderForSeverForSecuredRequestWithToken = async (token, cToken = '') => {
  const data = await checkTokenExpiry(token);
  const ipAddress = await getIPAddress();
  const { status, message } = data;
  if (status === 200) {
    return {
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${token}`,
        // JSESSIONID: cToken,
        'x-user-ip': ipAddress,
      },
    };
  }
};
const getHeaderForServerForPublicRequest = async (token = '') => {
  const projectId = localStorage.getItem('projectId');
  const accessToken = localStorage.getItem('token');
  const currentTenant = isLoggedInUser() ? fetchCurrentTenantJson() : '';
  const currentTenantId = currentTenant ? currentTenant.uuid : '';
  const currentSubTenant = isLoggedInUser() ? fetchCurrentSubTenantJson() : '';
  const currentSubTenantId = currentSubTenant ? currentSubTenant.uuid : '';
  const ipAddress = await getIPAddress();
  let apiConfig = {
    headers: {
      'Content-Type': 'application/json',
      'x-project-id': projectId,
      // JSESSIONID: token,
      'x-user-ip': ipAddress,
    },
  };
  if (accessToken) {
    try {
      const data = await checkTokenExpiry(accessToken);
      const { status, message } = data;
      if (status === 200) {
        apiConfig.headers['authorization'] = accessToken;
        if (currentTenantId) {
          apiConfig.headers['x-tenant-id'] = currentTenantId;
        }
        if (currentSubTenantId) apiConfig.headers['x-sub-tenant-id'] = currentSubTenantId;
      }
    } catch (error) {
      console.error('error: ', error);
    }
  }
  return apiConfig;
};

const headerMultipartFormDataForPublicRequest = async (token = '') => {
  const ipAddress = await getIPAddress();
  const accessToken = localStorage.getItem('token');
  const currentTenant = isLoggedInUser() ? fetchCurrentTenantJson() : '';
  const currentTenantId = currentTenant ? currentTenant.uuid : '';
  const currentSubTenant = isLoggedInUser() ? fetchCurrentSubTenantJson() : '';
  const currentSubTenantId = currentSubTenant ? currentSubTenant.uuid : '';
  let apiConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-hostname': window.location.hostname,
      // JSESSIONID: token,
      'x-user-ip': ipAddress,
    },
  };
  if (accessToken) {
    try {
      const data = await checkTokenExpiry(accessToken);
      const { status } = data;
      if (status === 200) {
        apiConfig.headers['authorization'] = accessToken;
        if (currentTenantId) apiConfig.headers['x-tenant-id'] = currentTenantId;
        if (currentSubTenantId) apiConfig.headers['x-sub-tenant-id'] = currentSubTenantId;
      }
    } catch (error) {
      console.error('error in headerMultipartFormDataForPublicRequest: ', error);
    }
  }
  return apiConfig;
};

const headerJsonDataForPublicRequest = async (token = '') => {
  const ipAddress = await getIPAddress();
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-hostname': window.location.hostname,
      // JSESSIONID: token,
      'x-user-ip': ipAddress,
    },
  };
};

const fetchValidCookie = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; JSESSIONID=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// const validateCookieToken = () => {
// const token = fetchValidCookie();
// if (!token) {
//   toastr.error('Failed to authorize request. Please reload the page.', 'Error');
//   return '';
// }
// return token;
// };
const saveCookieToken = (value) => {
  const date = new Date();
  date.setTime(date.getTime() + 1800000);
  document.cookie = `JSESSIONID=${value}; expires=${date.toUTCString()}; path=/`;
};
const extractCookieToken = (resHeaders) => {
  const token = resHeaders.jsessionid;
  if (token) {
    saveCookieToken(token);
  }
};
const publicPostCall = async (data, endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;

  const header = await headerJsonDataForPublicRequest();
  const response = await axios.post(getBackendServerUrl() + endpoint, data, header);
  extractCookieToken(response.headers);
  return response;
};
const publicGetCall = async (endpoint) => {
  try {
    // const token = validateCookieToken();
    // if (!token) return;
    console.log("I don't have token, don't make call");
    const header = await getHeaderForServerForPublicRequest();
    const response = await axios.get(getBackendServerUrl() + endpoint, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    if (error.response) {
      let { status } = error.response;
      if (status == 401 && endpoint.includes('finder')) {
        let isCount = endpoint.includes('count');
        return { data: isCount ? 0 : [], _$isPrivateFilter: true };
      }
    }
    throw Error(error);
  }
};
const unSecuredPostCall = async (data, endpoint) => {
  // console.log("This unSecuredPostCall is called: data is -->",data)
  // console.log("This unSecuredPostCall is called: endpoint is -->",endpoint)
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await getHeaderForServerForPublicRequest();
  const response = await axios.post(SERVER_URL + endpoint, data, header);
  extractCookieToken(response.headers);
  return response;
};
const securedPostCall = async (data, endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  // console.log("This securedPostCall is called: data is -->",data)
  //   console.log("This securedPostCall is called: endpoint is -->",endpoint)
  const header = await getHeaderForSeverForSecuredRequest();
  let response = {};
  try {
    response = await axios.post(SERVER_URL + endpoint, data, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    throw error;
  }
};
const securedGetCall = async (endpoint, returnError = false) => {
  try {
    // const token = validateCookieToken();
    // if (!token) return;
    const header = await getHeaderForSeverForSecuredRequest();
    const response = await axios.get(SERVER_URL + endpoint, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    if (error.response) {
      let { status } = error.response;
      if (status == 401 && endpoint.includes('finder')) {
        let isCount = endpoint.includes('count');
        return { data: isCount ? 0 : [], _$isPrivateFilter: true };
      }
    }
    if (returnError) return error;
    throw Error(error);
  }
};
const securedPutCall = async (data, endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await getHeaderForSeverForSecuredRequest();
  let response = {};
  try {
    response = await axios.put(SERVER_URL + endpoint, data, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    throw error;
  }
};
const unSecuredPutCall = async (data, endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  // console.log("This unSecuredPutCall is called: data is -->",data)
  // console.log("This unSecuredPutCall is called: endpoint is -->",endpoint)
  const header = await getHeaderForServerForPublicRequest();
  const response = await axios.put(SERVER_URL + endpoint, data, header);
  extractCookieToken(response.headers);
  return response;
};
const securedDeleteCall = async (endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await getHeaderForSeverForSecuredRequest();
  let response = {};
  try {
    response = await axios.delete(SERVER_URL + endpoint, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    throw error;
  }
};
const unSecuredDeleteCall = async (endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await getHeaderForServerForPublicRequest();
  const response = await axios.delete(SERVER_URL + endpoint, header);
  extractCookieToken(response.headers);
  return response;
};
const multipartFormDataPublicCall = async (data, endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await headerMultipartFormDataForPublicRequest();
  const response = await axios.post(SERVER_URL + endpoint, data);
  extractCookieToken(response.headers);
  return response;
};
const multipartFormDataSecuredCall = async (data, endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await headerMultipartFormDataForPublicRequest();
  let response = {};
  try {
    response = await axios.post(SERVER_URL + endpoint, data, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    throw error;
  }
};
const getCall = async (endpoint) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await getHeaderForSeverForSecuredRequest();
  let response = {};
  try {
    response = await axios.get(SERVER_URL + endpoint, header);
    extractCookieToken(response.headers);
  } catch (error) {
    if (error.response) response = error.response;
  }
  return response;
};
const downloadFile = async (endpoint, body = {}) => {
  // const token = validateCookieToken();
  // if (!token) return;
  const header = await getHeaderForServerForPublicRequest();
  try {
    let response = null;
    if (Object.keys(body).length > 0) {
      response = await axios({
        url: `${SERVER_URL}${endpoint}`,
        method: 'POST',
        data: body,
        responseType: 'blob',
        headers: header.headers,
      });
    } else {
      response = await axios({
        url: `${SERVER_URL}${endpoint}`,
        method: 'POST',
        responseType: 'blob',
        headers: header.headers,
      });
    }
    if (response) {
      const { data, headers } = response;
      extractCookieToken(headers);
      if (headers['content-disposition']) {
        const fileName = headers['content-disposition'].replace(/\w+; filename="(.*)"/, '$1');
        if (data) {
          const url = window.URL.createObjectURL(
            new Blob([data], { type: headers['content-type'] }),
          );
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        toastr.warning('Export data setting is not configured.', 'Configuration required!');
      }
    }
    return { failed: false, data: { message: 'PDF Downloaded Successfully', status: 200 } };
  } catch (error) {
    if (error.response) {
      let errorString = error.response.data;
      console.error('%c error.response.data.type', 'color:red', error.response.data.type);
      if (error.request.responseType === 'blob' && error.response.data instanceof Blob) {
        errorString = await error.response.data.text();
        if (
          error.response.data.type &&
          error.response.data.type.toLowerCase().indexOf('json') != -1
        ) {
          errorString = JSON.parse(errorString);
        }
      }
      console.error('%c errorString', 'color:red', errorString);
      return { failed: true, data: { message: errorString, status: error.response.status } };
    } else {
      return { failed: true, data: { message: error.message, status: error.status } };
    }
  }
};

const securedPostCallWithToken = async (data, endpoint, token) => {
  // const ctoken = validateCookieToken();
  // if (!ctoken) return;
  const header = await getHeaderForSeverForSecuredRequestWithToken(token);
  let response = {};
  try {
    response = await axios.post(SERVER_URL + endpoint, data, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    throw error;
  }
};

const securedPutCallWithToken = async (data, endpoint, token) => {
  // const ctoken = validateCookieToken();
  // if (!ctoken) return;
  const header = await getHeaderForSeverForSecuredRequestWithToken(token);
  let response = {};
  try {
    response = await axios.put(SERVER_URL + endpoint, data, header);
    extractCookieToken(response.headers);
    return response;
  } catch (error) {
    throw error;
  }
};

/** Show/Hide Component **/
const system_show_component = async function (args) {
  console.log('system_show_component');
  const actionEnabled = isActionEnabled(args);
  console.log('actionEnabled :>> ', actionEnabled);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let showComponents = args.parameters.showComponents;
    let showComponentsId = showComponents.split(':')[1];

    const element = document.getElementById(showComponentsId);

    if (element) {
      if (element.classList.contains('d-none')) {
        element.classList.remove('d-none');
      }
      //Check for CSS property
      let elementStyleDisplayValue = element.style.display;
      element.style.display =
        elementStyleDisplayValue && elementStyleDisplayValue !== 'none'
          ? elementStyleDisplayValue
          : 'block';
      element.style.visibility = 'visible';
      actionCompleted(args);
    } else {
      actionCompleted(args);
      return null;
    }
  } else {
    return disabledActionResponse(args);
  }
};

const system_hide_component = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let hideComponents = args.parameters.hideComponents;
    let hideComponentsId = hideComponents.split(':')[1];

    const element = document.getElementById(hideComponentsId);

    if (element) {
      if (!element.classList.contains('d-none')) {
        element.classList.add('d-none');
      }
      //Check for CSS property
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      actionCompleted(args);
    } else {
      actionCompleted(args);
      return null;
    }
  } else {
    return disabledActionResponse(args);
  }
};

/** Utils.js **/
const getFormDataOfElement = (formElement) => {
  let formData = {};
  Object.values(formElement.elements).map((el) => {
    if (el.name) {
      if (el.type === 'hidden') {
        formData[el.name] = el.value;
      } else {
        if (el.tagName === 'SELECT') {
          const selected = [...el.selectedOptions].map((option) => option.value);
          formData[el.name] = selected.length === 1 ? selected.join('') : selected;
        } else {
          formData[el.name] = el.value;
        }
      }
    }
  });
  return formData;
};

const serializeFormData = async (
  elements = [],
  processFile = false,
  processSourceDateFormat = false,
) => {
  let data = {};
  let segregatedDateOrderMap = new Map();
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const sourceDateFormat = el.getAttribute('sourcedateformat');
    let val;
    if (el.type === 'file' && processFile) {
      const files = el.files;
      const fileData = await createFileInServerLocal(files, el, val);
      if (fileData) {
        val = fileData.path ? fileData.path : '';
      } else {
        val = el.value ? el.value : '';
      }
    } else if (el.type === 'radio') {
      val = el.checked ? el.value : '';
    } else if (el.type === 'checkbox' && $(el).attr('data-component-type') === 'select') {
      val = el.checked ? el.value : '';
    } else if (el.type === 'checkbox') {
      val = el.checked;
    } else if (el.tagName === 'SELECT') {
      if (!el.hasAttribute('date-segregated')) {
        // For normal select
        const selected = [...el.selectedOptions].map((option) => option.value);
        val = selected.length === 1 ? selected.join('') : selected.filter((val) => val !== '');
      } else if (
        el.hasAttribute('date-segregated') &&
        el.hasAttribute('data-component-type') &&
        el.getAttribute('data-component-type') === 'date'
      ) {
        const projectDateFormat =
          document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
        const dateFormat = 'YYYY-MM-DD';
        const datenTime = getDateTimeFormat(dateFormat, false);
        const dateValue = el.value || '';
        segregatedDateOrderMap.set(el.getAttribute('date-segregated'), dateValue);
        const month = segregatedDateOrderMap.get('month') || '';
        const day = segregatedDateOrderMap.get('day') || '';
        const year = segregatedDateOrderMap.get('year') || '';

        const parsedDateValue =
          month && day && year ? flatpickr.parseDate(`${year}-${month}-${day}`, datenTime) : '';
        let formattedDateValue =
          parsedDateValue && moment(parsedDateValue).isValid()
            ? moment(parsedDateValue).format('YYYY-MM-DD')
            : '';
        if (formattedDateValue && projectDateFormat !== dateFormat)
          formattedDateValue = moment(formattedDateValue).format(projectDateFormat);
        val = formattedDateValue;
      }
    } else if ($(el).attr('type') === 'tel') {
      val = $(el).intlTelInput('getNumber');
    } else if (el.type === 'number') {
      val = el.value === '' ? '' : Number(el.value);
    } else if ($(el).attr('flat-picker-date-type') === 'datetime-local') {
      val = el.value ? flatpickr.parseDate(el.value, 'Z') : '';
      val = moment(val).isValid() ? moment(val).format('YYYY-MM-DDTHH:mm:ss') : '';
    } else if (
      el.getAttribute('flat-picker-date-type') === 'date' &&
      sourceDateFormat &&
      processSourceDateFormat
    ) {
      let showTime = false;
      const dateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
      const datenTime = getDateTimeFormat(dateFormat, showTime);
      const sourceDateTimeFormat = getDateTimeFormat(sourceDateFormat, showTime);
      const dateValue = el.value ? flatpickr.parseDate(el.value, datenTime) : '';
      const sourceDateValue = moment(dateValue).isValid()
        ? moment(dateValue).format(sourceDateFormat)
        : '';
      // val = el.value ? flatpickr.parseDate(el.value, 'Z') : '';
      // val = moment(val).isValid() ? moment(val).format('YYYY-MM-DDTHH:mm:ss') : '';
      val = sourceDateValue;
    } else if (
      el.type === 'text' &&
      el.hasAttribute('data-component-type') &&
      el.getAttribute('data-component-type') === 'time_picker'
    ) {
      if (el.value && (el.value.includes('AM') || el.value.includes('PM'))) {
        val = el.value ? moment(el.value, 'hh:mm A') : '';
        val = moment(val).isValid() ? moment(val).format('HH:mm') : '';
      } else {
        val = trim(el.value);
      }
    } else if (el.type === 'hidden' && el.hasAttribute('data-file-upload-component')) {
      data.refFile = JSON.parse(el.getAttribute('data-file-upload-component'));
      if (el.hasAttribute('ref-field-file-upload-component')) {
        data.refField = el.getAttribute('ref-field-file-upload-component');
      }
      val = el.value ? trim(el.value).split(',') : data.refFile.length ? '' : [];
    } else {
      val = trim(el.value);
    }
    if (el.type === 'file' && val.includes('fakepath')) {
      val = '';
    }
    let fullName = el.getAttribute('name');
    if (!fullName) continue;
    let fullNameParts = fullName.split('.');
    let prefix = '';
    let stack = data;
    for (let k = 0; k < fullNameParts.length - 1; k++) {
      prefix = fullNameParts[k];
      //Used to remove [] from multiselect
      if (prefix.includes('[')) {
        prefix = prefix.replace('[]', '');
      }
      if (!stack[prefix]) {
        stack[prefix] = {};
      }
      stack = stack[prefix];
    }
    prefix = fullNameParts[fullNameParts.length - 1];
    //Used to remove [] from multiselect
    if (prefix.includes('[')) {
      prefix = prefix.replace('[]', '');
    }
    if (stack[prefix]) {
      const newVal = stack[prefix] + ',' + val;
      stack[prefix] = val ? newVal.split(',') : stack[prefix];
    } else {
      stack[prefix] = val;
    }
  }
  return data;
};

const findFieldValueFromFormData = (formElement, fieldName) => {
  let formData = {};
  Object.values(formElement.elements).map((el) => {
    if (el.name) {
      if (el.type === 'hidden') {
        formData[el.name] = el.value;
      } else {
        if (el.tagName === 'SELECT') {
          const selected = [...el.selectedOptions].map((option) => option.value);
          formData[el.name] = selected.length === 1 ? selected.join('') : selected;
        } else {
          formData[el.name] = el.value;
        }
      }
    }
  });
  return formData;
};

const sortTableColumn = (n, tableId) => {
  if (tableId) {
    let table = document.getElementById(tableId);
    let headerRow,
      rows,
      i,
      x,
      y,
      count = 0;
    let switching = true;
    let Switch = false;

    // Order is set as ascending
    let direction = 'ascending';

    // Run loop until no switching is needed
    while (switching) {
      switching = false;
      rows = table.rows;

      headerRow = rows[0].getElementsByTagName('TH')[n];

      //Loop to go through all rows
      for (i = 1; i < rows.length - 1; i++) {
        Switch = false;

        // Fetch 2 elements that need to be compared
        x = rows[i].getElementsByTagName('TD')[n];
        y = rows[i + 1].getElementsByTagName('TD')[n];

        let row1Value = x.textContent.toLowerCase();
        let row2Value = y.textContent.toLowerCase();

        if (row1Value && !isNaN(row1Value)) {
          row1Value = Number(row1Value);
        }

        if (row2Value && !isNaN(row2Value)) {
          row2Value = Number(row2Value);
        }

        // Check the direction of order
        if (direction == 'ascending') {
          // Check if 2 rows need to be switched

          headerRow.children[0].classList.remove('sortable-desc');
          headerRow.children[0].classList.add('sortable-asc');
          if (row1Value > row2Value) {
            // If yes, mark Switch as needed and break loop
            Switch = true;
            break;
          }
        } else if (direction == 'descending') {
          // Check direction

          headerRow.children[0].classList.remove('sortable-asc');
          headerRow.children[0].classList.add('sortable-desc');
          if (row1Value < row2Value) {
            // If yes, mark Switch as needed and break loop
            Switch = true;
            break;
          }
        }
      }
      if (Switch) {
        // Function to switch rows and mark switch as completed
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;

        // Increase count for each switch
        count++;
      } else {
        // Run while loop again for descending order
        if (count == 0 && direction == 'ascending') {
          direction = 'descending';
          switching = true;
        }
      }
    }
  }
};

const customPageRedirect = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const {
      parameters: {
        redirectValueFrom,
        destination,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      },
      response,
    } = args;

    let urlToRedirect = destination;
    actionCompleted(args);
    switch (redirectValueFrom) {
      case 'SESSION':
        if (redirectValueFrom === 'SESSION') {
          urlToRedirect = customPageRedirectFromSessionValue(destination, urlToRedirect);
        }
        if (urlToRedirect) {
          window.location = urlToRedirect;
        }
        break;
      case 'BASE64_FORM_SUBMIT_SESSION_VALUE':
        customPageRedirectBase64SessionValue(destination);
        break;
      case 'FORM_SUBMIT_SESSION_VALUE':
        customPageRedirectHtmlSessionValue(destination);
        break;
      case 'BROWSER_STORAGE':
        urlToRedirect = getValueFromBrowserStorage(
          responseDataSessionStorageLocation,
          responseDataSessionKey,
          destination,
        );
        if (urlToRedirect) {
          window.location = urlToRedirect;
        }
        break;
      default:
        if (urlToRedirect) {
          window.location = urlToRedirect;
        }
        break;
    }
  } else {
    return disabledActionResponse(args);
  }
};

const getContentFromSessionObject = (sessionObj, sessionKey) => {
  let sessionValue = _.get(sessionObj, sessionKey);

  return sessionValue;
};

const createFileInServerLocal = async (files, el, val) => {
  const formData = new FormData();
  let endpoint = 'file/upload/local';
  let response = '';
  if (files && files.length > 0) {
    formData.append('file', files[0]);
    const { data } = await multipartFormDataSecuredCall(formData, endpoint);
    response = data ? data : '';
  }
  return response;
};

const registerServiceWorker = async () => {
  console.log('Checking to enable PWA...');

  const projectDetail = await getProjectDetail();
  if (projectDetail) {
    const { enablePWA } = projectDetail;
    if (enablePWA) {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
            scope: './',
          });
          if (registration.installing) {
            console.log('%c==> Service worker installing', 'color:yellow');
          } else if (registration.waiting) {
            console.log('%c==> Service worker installed', 'color:cyan');
          } else if (registration.active) {
            console.log('%c==> Service worker active', 'color: yellowGreen');
          }
        } catch (error) {
          console.error(`%c==> Registration failed with ${error}`, 'color:red');
        }
      }
    }
  }
};

const getProjectDetail = async () => {
  const endpoint = 'projects/detail/';
  const hostnameShort = getHostnameShort();
  let projectDetails = JSON.parse(sessionStorage.getItem(`__projD_${hostnameShort}`));

  if (!projectDetails) {
    const { data } = await publicGetCall(endpoint);
    projectDetails = { ...data };
    sessionStorage.setItem(`__projD_${hostnameShort}`, JSON.stringify(data));
    populateBrowserStorageKeyToReset(`__projD_${hostnameShort}`);
  }
  const isProjectIdExist = localStorage.getItem('projectId');
  if (!isProjectIdExist && projectDetails) {
    localStorage.setItem('projectId', projectDetails.uuid);
  }
  return projectDetails;
};
const getCollectionDetails = async (collectionName) => {
  const endpoint = `collection-details/${collectionName}/name`;
  let collectionDetails = JSON.parse(sessionStorage.getItem(`__colD_${collectionName}`));

  if (!collectionDetails) {
    const { data } = await publicGetCall(endpoint);
    collectionDetails = { ...data };
    sessionStorage.setItem(`__colD_${collectionName}`, JSON.stringify(data));
    populateBrowserStorageKeyToReset(`__colD_${collectionName}`);
  }

  return collectionDetails;
};
const getCollectionDetailsById = async (uuid) => {
  const endpoint = `collection-details/${uuid}/id`;
  let collectionDetails = JSON.parse(sessionStorage.getItem(`__colD_${uuid}`));

  if (!collectionDetails) {
    const { data } = await publicGetCall(endpoint);
    collectionDetails = { ...data };
    sessionStorage.setItem(`__colD_${uuid}`, JSON.stringify(data));
    populateBrowserStorageKeyToReset(`__colD_${uuid}`);
  }

  return collectionDetails;
};
const getCollectionItems = async (collectionName) => {
  const endpoint = `items/${collectionName}/collection`;
  let collectionItems = JSON.parse(sessionStorage.getItem(`__colItems_${collectionName}`));

  if (!collectionItems) {
    const { data } = await publicGetCall(endpoint);
    collectionItems = { ...data };
    sessionStorage.setItem(`__colItems_${collectionName}`, JSON.stringify(data));
    populateBrowserStorageKeyToReset(`__colItems_${collectionName}`);
  }

  return collectionItems;
};
const getCollectionItemById = async (collectionName, collectionItemUuid, isSecured = false) => {
  const endpoint = `collection-table/${collectionName}/item/${collectionItemUuid}`;
  let collectionItems = JSON.parse(
    sessionStorage.getItem(`__colItem_${collectionName}_${collectionItemUuid}`),
  );

  if (!collectionItems) {
    let data = '';

    if (isSecured) {
      const { data: responseData } = await securedGetCall(endpoint);
      data = { ...responseData };
    } else {
      const { data: responseData } = await publicGetCall(endpoint);
      data = { ...responseData };
    }

    collectionItems = { ...data };
    sessionStorage.setItem(
      `__colItem_${collectionName}_${collectionItemUuid}`,
      JSON.stringify(data),
    );
    populateBrowserStorageKeyToReset(`__colItem_${collectionName}_${collectionItemUuid}`);
  }

  return collectionItems;
};
const getCollectionItemByIdDetailsPage = async (
  collectionName,
  collectionItemUuid,
  isSecured = false,
  derivedFieldMapping = null,
) => {
  const baseUrl = `collection-table/${collectionName}/item/${collectionItemUuid}`;
  const endpoint = derivedFieldMapping
    ? `${baseUrl}?derivedFieldMapping=${derivedFieldMapping}`
    : baseUrl;
  let collectionItems = JSON.parse(
    sessionStorage.getItem(`__dp_colItem_${collectionName}_${collectionItemUuid}`),
  );
  if (!collectionItems) {
    let data = '';

    if (isSecured) {
      const { data: responseData } = await securedGetCall(endpoint);
      data = { ...responseData };
    } else {
      const { data: responseData } = await publicGetCall(endpoint);
      data = { ...responseData };
    }

    collectionItems = { ...data };
    sessionStorage.setItem(
      `__dp_colItem_${collectionName}_${collectionItemUuid}`,
      JSON.stringify(data),
    );
    populateBrowserStorageKeyToReset(`__dp_colItem_${collectionName}_${collectionItemUuid}`, true);
  }

  return collectionItems;
};
const parseSessionObject = (destination, sessionKey = 'previousActionResponse') => {
  let sessionValue = '';
  let previousActionResponse = sessionStorage.getItem(sessionKey);
  if (previousActionResponse) {
    previousActionResponse = JSON.parse(previousActionResponse);
    sessionValue = getContentFromSessionObject(previousActionResponse, destination);
  }
  return sessionValue;
};

const customPageRedirectFromSessionValue = (destination, urlToRedirect) => {
  let sessionValue = parseSessionObject(destination);
  urlToRedirect = sessionValue ? sessionValue : '';
  return urlToRedirect;
};

const customPageRedirectBase64SessionValue = (destination) => {
  let sessionValue = parseSessionObject(destination);

  if (sessionValue) {
    const decodedData = window.atob(sessionValue); // decode the string
    const winHtml = decodedData;

    const winUrl = URL.createObjectURL(
      new Blob([winHtml], {
        type: 'text/html',
      }),
    );

    window.open(winUrl, '_self', `width=800,height=400,screenX=200,screenY=200`);
  }
  return;
};

const customPageRedirectHtmlSessionValue = (destination) => {
  let sessionValue = parseSessionObject(destination);

  if (sessionValue) {
    const winHtml = sessionValue;

    const winUrl = URL.createObjectURL(
      new Blob([winHtml], {
        type: 'text/html',
      }),
    );

    window.open(winUrl, '_self', `width=800,height=400,screenX=200,screenY=200`);
  }
  return;
};

const getValueFromBrowserStorage = (storageType, storageKey, objPath) => {
  if (!storageType) return '';
  if (!storageKey) return '';
  let storageValue = '';
  switch (storageType) {
    case 'LOCAL_STORAGE':
      storageValue = localStorage.getItem(storageKey);
      break;
    case 'COOKIES':
      storageValue = getCookie(storageKey);
      storageValue = decodeURIComponent(storageValue);
      break;
    default:
      storageValue = sessionStorage.getItem(storageKey);
      break;
  }
  if (objPath) {
    storageValue = getBrowserStorageValue(storageValue, objPath);
  }
  return storageValue;
};

const getBrowserStorageValue = (storageValue, objPath) => {
  let finalValue = '';
  if (storageValue) {
    storageValue = JSON.parse(storageValue);
    finalValue = getContentFromSessionObject(storageValue, objPath);
  }
  return finalValue;
};

const toggleAllDataTableItems = (args, tableId) => {
  const selectAllItemCheckboxElem = args.target;

  if (selectAllItemCheckboxElem && tableId) {
    const tableElem = document.getElementById(tableId);
    const itemCheckboxes = tableElem.querySelectorAll('[data-gjs=' + 'dt-item-check' + ']');

    for (let index = 0; index < itemCheckboxes.length; index++) {
      if (itemCheckboxes[index].type == 'checkbox') {
        itemCheckboxes[index].checked = selectAllItemCheckboxElem.checked;
      }
    }
  }
};

const setModalCollectionItemData = (itemData = null, isModal = false) => {
  resetModalCollectionItemData();
  if (itemData && isModal) {
    MODAL_COLLECTION_ITEM_DATA = Object.assign({}, itemData);
  }
};

const resetModalCollectionItemData = () => {
  MODAL_COLLECTION_ITEM_DATA = '';
};

const booleanFieldValue = async (field, element, isModal = false, data = null) => {
  if (!data) {
    const { itemData } = isModal ? '' : await getPageItemData();
    if (itemData) {
      data = itemData;
    } else if (MODAL_COLLECTION_ITEM_DATA) {
      data = MODAL_COLLECTION_ITEM_DATA;
    }
  }
  if (isCheckbox(element)) {
    let value = false;
    const elementName = element.name;
    const dataFormAttr = element.getAttribute('data-form-element-collection');
    if (elementName && data) {
      value =
        dataFormAttr && elementName !== dataFormAttr && dataFormAttr.includes('.')
          ? parseValueFromData(data, dataFormAttr)
          : parseValueFromData(data, elementName);
      value = Array.isArray(value) && value.length === 0 ? false : value;
    }
    if (value) element.checked = true;
  }
};

const validateLoginFormData = (formData, loginFormData) => {
  if (
    !formData.hasOwnProperty('userName') ||
    (formData.hasOwnProperty('userName') && formData.userName === '')
  ) {
    if (formData.email) {
      loginFormData.userName = formData.email;
      loginFormData.queryType = 'OR';
    } else if (formData.phone_number) {
      loginFormData.userName = formData.phone_number;
      loginFormData.queryType = 'OR';
    }
  }
};

const resetFormFields = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, targetElement, parameters } = args;
    const { enableResetForm, componentPage, formComponent, overrideResetWaitTime } = parameters
      ? parameters
      : '';
    let formComponentId = formComponent ? formComponent.split(':')[1] : '';
    let formElem = '';

    if (enableResetForm) {
      formElem = formComponentId ? document.getElementById(formComponentId) : '';
    } else {
      formElem = targetElement
        ? targetElement.closest('FORM')
        : element
          ? element.closest('FORM')
          : '';
    }
    const formElements = formElem ? formElem.elements : '';

    if (formElem) {
      if (!targetElement) {
        //Handling On Page Load Event
        setTimeout(
          () => {
            for (let i = 0; i < 2; i++) {
              // Run twice to reset all select values
              resetFormFieldElements(formElements, formElem);
            }
            formElem.reset();
          },
          overrideResetWaitTime ? overrideResetWaitTime : 500,
        );
      } else {
        for (let i = 0; i < 2; i++) {
          // Run twice to reset all select values
          resetFormFieldElements(formElements, formElem);
        }
        formElem.reset();
      }
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const resetFormFieldElements = (formElements, formElem) => {
  if (formElements) {
    for (i = 0; i < formElements.length; i++) {
      const field = formElements[i];
      const fieldType = formElements[i].type.toLowerCase();

      switch (fieldType) {
        case 'text':
        case 'password':
        case 'textarea':
        case 'hidden':
          formElements[i].value = '';
          resetTextArea(formElem);
          break;
        case 'radio':
        case 'checkbox':
          if (formElements[i].checked) {
            formElements[i].checked = false;
          }
          break;
        case 'select-one':
        case 'select-multi':
        case 'select-multiple':
          const selectId = field.id;
          if (selectId) $(`#${selectId}`).val(null).trigger('change');
          break;
        default:
          break;
      }
    }
  }
};

const getExternalAPISpan = () => {
  let externalAPISpan = '';
  const pageExternalAPISpan = window.document.getElementById('project-page-external-api');
  const modalExternalAPISpan = window.document.getElementById('project-modal-external-api');

  if (pageExternalAPISpan) {
    externalAPISpan = pageExternalAPISpan;
  } else if (modalExternalAPISpan) {
    externalAPISpan = modalExternalAPISpan;
  }

  return externalAPISpan;
};

const submitSelectedForm = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, targetElement, parameters } = args;
    const { enableSubmitForm, componentPage, formComponent, overrideSubmitWaitTime } = parameters
      ? parameters
      : '';
    let formComponentId = formComponent ? formComponent.split(':')[1] : '';
    let formElem = '';

    if (enableSubmitForm) {
      formElem = formComponentId ? document.getElementById(formComponentId) : '';
    } else {
      formElem = targetElement
        ? targetElement.closest('FORM')
        : element
          ? element.closest('FORM')
          : '';
    }

    if (formElem) {
      const formSubmitElem = formElem.querySelector('[type=submit]');
      actionCompleted(args);
      if (formSubmitElem) {
        if (!targetElement) {
          //Handling On Page Load Event
          setTimeout(
            () => {
              formSubmitElem.click();
            },
            overrideSubmitWaitTime ? overrideSubmitWaitTime : 500,
          );
        } else {
          formSubmitElem.click();
        }
      }
    }
  } else {
    return disabledActionResponse(args);
  }
};

const showConfirmationMessage = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, previousActionResponse } = args;
    const { confirmationMessage, confirmBtnText, cancelBtnText, destinationAfterCancel } =
      parameters ? parameters : '';
    let response = {};
    if (previousActionResponse) response.data = previousActionResponse;
    const message = confirmationMessage || 'Are you sure?';
    actionCompleted(args);
    await swalAlert(
      message,
      confirmBtnText || 'Proceed',
      true,
      false,
      cancelBtnText || 'Cancel',
    ).then(async (willProceed) => {
      if (willProceed.isConfirmed) {
        response.confirmation = willProceed;
        response.status = 'success';
        return response;
      } else {
        response.confirmation = willProceed;
        response.status = 'cancel';
        window.location.href = destinationAfterCancel;
        return Promise.reject(response);
      }
    });
  } else {
    return disabledActionResponse(args);
  }
};

const clearBrowserSessionData = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const isParamEmpty = isEmpty(parameters);

    if (!isParamEmpty) {
      const {
        clearAllResponseData,
        clearAllFormData,
        clearResponseSelectedKeys,
        clearFormSelectedKeys,
      } = parameters;
      let previousActionResponse = JSON.parse(sessionStorage.getItem('previousActionResponse'));
      let previousActionFormData = JSON.parse(sessionStorage.getItem('previousActionFormData'));

      if (previousActionFormData) {
        if (clearAllFormData) {
          sessionStorage.removeItem('previousActionFormData');
        }
        if (clearFormSelectedKeys) {
          previousActionFormData = JSON.parse(sessionStorage.getItem('previousActionFormData'));
          if (previousActionFormData) {
            let updatedFormData = previousActionFormData;
            let formKeysArr = clearFormSelectedKeys.split(',');
            updatedFormData = _.omit(updatedFormData, formKeysArr);
            sessionStorage.setItem('previousActionFormData', JSON.stringify(updatedFormData));
          }
        }
      }

      if (previousActionResponse) {
        if (clearAllResponseData) {
          sessionStorage.removeItem('previousActionResponse');
        }
        if (clearResponseSelectedKeys) {
          previousActionResponse = JSON.parse(sessionStorage.getItem('previousActionResponse'));
          if (previousActionResponse) {
            let updatedResponseData = previousActionResponse;
            let originalSessionKeysArr = clearResponseSelectedKeys.split(',');
            updatedResponseData = _.omit(updatedResponseData, responseKeysArr);
            sessionStorage.setItem('previousActionResponse', JSON.stringify(updatedResponseData));
          }
        }
      }
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const refreshCurrentLoggedInUser = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    await resetCurrentUserInLocalStorage();
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const refreshCurrentTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    await resetCurrentTenantInLocalStorage();
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const refreshCurrentUserSettings = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    await resetCurrentTenantInLocalStorage();
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const switchLocalizationLang = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const { language } = parameters;

    if (language) {
      localStorage.setItem('lang', language);
      let location = window.location;
      let urlToRedirect = location.href;
      let queryString = window.location.search;

      actionCompleted(args);
      if (queryString && queryString.includes('lang=')) {
        const urlObj = new URL(urlToRedirect);
        let searchQuery = urlObj.search;

        if (searchQuery.length > 0) {
          const searchParams = new URLSearchParams(searchQuery);
          let oldLang = searchParams.get('lang');
          let oldKey = `lang=${oldLang}`;
          let newKey = `lang=${language}`;
          urlToRedirect = replaceValueInExpression(oldKey, newKey, urlToRedirect);
        }
        window.location = urlToRedirect;
      } else {
        window.location = `${urlToRedirect}?lang=${language}`;
      }
    }
  } else {
    return disabledActionResponse(args);
  }
};

const switchUserTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const { confirmationMessage, successMessage, errorMessage, skipPageReload, redirectRules } =
      parameters;
    let selectedTenantId = '';
    if (targetElement) {
      if (targetElement.hasAttribute('data-tenant-id')) {
        selectedTenantId = targetElement.getAttribute('data-tenant-id');
      } else if (targetElement.hasAttribute('data-item-id')) {
        selectedTenantId = targetElement.getAttribute('data-item-id');
      }
    }

    if (isLoggedInUser()) {
      let selectedTenant = '';
      const currentUser = fetchLoggedInUserJson();
      if (currentUser.tenantId && currentUser.tenantId.length && selectedTenantId) {
        selectedTenant = currentUser.tenantId.find(
          (tenantObj) => tenantObj.uuid === selectedTenantId,
        );
        selectedTenant = selectedTenant ? selectedTenant.uuid : '';
      }
      if (confirmationMessage) {
        let response = {};
        await swalAlert(confirmationMessage, 'Proceed', true, false).then(async (willProceed) => {
          if (willProceed.isConfirmed) {
            if (selectedTenant) {
              await switchEntityProcess(
                selectedTenant,
                response,
                redirectRules,
                skipPageReload,
                successMessage,
                errorMessage,
                'tenant',
              );
            }
            response.confirmation = willProceed;
            actionCompleted(args);
            return response;
          } else {
            response.confirmation = willProceed;
            response.status = 'cancel';
            return Promise.reject(response);
          }
        });
      } else {
        if (selectedTenant) {
          let response = {};
          await switchEntityProcess(
            selectedTenant,
            response,
            redirectRules,
            skipPageReload,
            successMessage,
            errorMessage,
            'tenant',
          );
          actionCompleted(args);
        }
      }
    } else {
      toastr.error(errorMessage || 'User not logged in!', 'Error');
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const switchEntity = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response: previousResponse, targetElement, url_params } = args;
    const {
      collection,
      updateEntityBy,
      storageCustomKey,
      page,
      successMessage,
      errorMessage,
      storageCustomKeyLocation,
    } = parameters;
    const previousResponseData = previousResponse ? previousResponse.data : '';
    let itemId = '';
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');

    switch (updateEntityBy) {
      case 'collectionUuid':
        itemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
        if (!itemId) {
          //Handling for Form Submit
          const submitBtnElem = targetElement.querySelector('button[type=submit]');
          itemId = submitBtnElem ? submitBtnElem.getAttribute('data-item-id') : '';
        }
        break;
      case 'previousResponse':
        itemId = previousResponseData ? previousResponseData['uuid'] : '';
        break;
      case 'previousActionResponse':
        {
          if (storageCustomKeyLocation) {
            let browserStorageData = await getBSLData(storageCustomKeyLocation);
            if (browserStorageData) {
              itemId =
                browserStorageData && storageCustomKey
                  ? _.get(browserStorageData, storageCustomKey.trim())
                  : '';
            }
          } else {
            // Fallback handling
            // TODO: Ali -> Remove after complete migration
            if (previousActionResponse) {
              previousActionResponse = JSON.parse(previousActionResponse);
              itemId = storageCustomKey ? _.get(previousActionResponse, storageCustomKey) : '';
            }
          }
        }
        break;
      case 'previousActionFormData':
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          itemId = storageCustomKey ? _.get(previousActionFormData, storageCustomKey) : '';
        }
        break;
      case 'currentLoggedInUser':
        if (isLoggedInUser()) {
          const loggedInUser = fetchLoggedInUserJson();
          if (storageCustomKey) {
            itemId = _.get(loggedInUser, storageCustomKey);
          } else {
            itemId = loggedInUser ? loggedInUser.uuid : '';
          }
        }
        break;
      case 'currentLoggedInUserTenant':
        if (isLoggedInUser()) {
          const currentTenant = fetchCurrentTenantJson();
          if (storageCustomKey) {
            itemId = _.get(currentTenant, storageCustomKey);
          } else {
            itemId = currentTenant ? currentTenant.uuid : '';
          }
        }
        break;
      default:
        break;
    }
    let storageData = {};
    let collectionItemResponse = {};
    let collectionItem = {};
    let urlToRedirect = '';
    try {
      if (itemId) {
        const collectionItemEndpoint = `collection-table/${collection}/item/${itemId}`;
        collectionItemResponse = await securedGetCall(collectionItemEndpoint);
        if (collectionItemResponse && collectionItemResponse.status === 200) {
          collectionItem = collectionItemResponse.data;
          if (collectionItem) {
            const storageKey = `entity_${collection}`;
            setJsonInLocalStorage(storageKey, collectionItem);
            if (successMessage) toastr.success(successMessage, 'Success');
            actionCompleted(args);
            // Redirecting Page
            urlToRedirect = page ? `/${page}` : '';
            if (urlToRedirect) window.location.reload();
            window.location = urlToRedirect;
          }
        }
      }
    } catch (error) {
      if (errorMessage) toastr.error(errorMessage, 'Error');
    } finally {
      actionCompleted(args);
    }
    return storageData;
  } else {
    return disabledActionResponse(args);
  }
};

const removeCollectionFieldData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response: previousResponse, targetElement } = args;
    const { collection, fields, successMessage, errorMessage } = parameters;
    let data = {};
    let response = {};
    let result = {};
    let itemId = '';

    if (targetElement && targetElement.tagName === 'FORM') {
      let action = targetElement.getAttribute('action');
      itemId = action ? action.split('collection-form/')[1] : '';
      itemId = itemId ? itemId.split('/items/')[1] : '';
    } else {
      itemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    }

    fields &&
      fields.forEach((field) => {
        data[field] = '';
      });

    if (collection && fields && itemId) {
      try {
        let endpoint = 'collection-form/' + collection + '/items/' + itemId;
        endpoint = 'open/' + endpoint;
        result = await unSecuredPutCall(data, endpoint);
        response.data = { ...previousResponse, ...result };
        response.status = 'success';

        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      } catch (error) {
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
        }
        if (errorMessage) {
          toastr.error(errorMessage, 'Error');
        } else if (error.response.data) {
          toastr.error(error.response.data, 'Error');
        }
      }
    } else {
      if (!collection) {
        toastr.error('Please select a collection in action', 'Collection missing!');
      } else if (!fields) {
        toastr.error('Please select a collection field in action', 'Field missing!');
      } else if (!itemId) {
        toastr.error('Collection item id not found', 'Item missing!');
      } else {
        toastr.error('Unable to remove item data', 'Error');
      }
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const setBrowserSessionData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response: previousResponse, targetElement, url_params } = args;
    const { customSessionKey } = parameters;
    const { itemData, collectionId } = await getPageItemData();

    if (collectionId && itemData) {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      const storageKey = customSessionKey ? customSessionKey : `collection_${collectionId}`;
      delete itemData._id;
      const collectionItemData = {
        [storageKey]: itemData,
      };
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ ...previousActionResponse, ...collectionItemData }),
        );
      } else {
        sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionItemData));
      }
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const actionSubmit = (ev) => {
  ev.preventDefault();
  let element, targetElement, formElem;
  if (ev) {
    element = ev.target || ev.srcElement;
    targetElement = ev.currentTarget;
    if (targetElement || element) {
      formElem = targetElement
        ? targetElement.closest('FORM')
        : element
          ? element.closest('FORM')
          : '';
      const { dataset } = targetElement || {};
      const { itemId, createmethod, updatemethod, oncreate, onupdate } = dataset || {};
      const hasItemId = !!itemId;
      let onSubmitFormAction = '';
      let onSubmitFormMethod = '';

      if (formElem) {
        let formAction = formElem.attributes['action'];
        let formActionValue = formAction.value;
        let hasValidItemId = false;
        if (hasItemId) {
          hasValidItemId = formActionValue.includes(itemId);
        }
        if (hasValidItemId) {
          const onUpdateAction = `return ${onupdate}`;
          onSubmitFormAction = onUpdateAction;
          onSubmitFormMethod = updatemethod;
        } else {
          const onCreateAction = `return ${oncreate}`;
          onSubmitFormAction = onCreateAction;
          onSubmitFormMethod = createmethod;
        }

        if (!hasValidItemId) {
          let actionValues = formActionValue.split('collection-form/')[1];
          let actionList = actionValues.split('/');
          //   Change action URL string
          if (actionList && actionList.length > 2) {
            actionList.pop();
            let actionURL = `collection-form/` + actionList.join('/');
            formElem.action = actionURL;
          }
        }
        if (onSubmitFormAction) {
          formElem.setAttribute('onsubmit', onSubmitFormAction);
        }
        if (onSubmitFormMethod) {
          formElem.setAttribute('method', onSubmitFormMethod);
        }
        const formSubmitElem = formElem.querySelector('[type=submit]');
        if (formSubmitElem) {
          // Click submit button if exist in a form to submit form
          formSubmitElem.click();
        } else {
          // Create hidden submit button and click it to submit form
          const btnDivElem = targetElement.closest('div');
          const btnElem = document.createElement('button');
          btnElem.setAttribute('class', 'dc-button dc-btn--blue d-none');
          btnElem.setAttribute('type', 'submit');
          if (itemId) {
            btnElem.setAttribute('data-item-id', itemId);
          }
          btnElem.style.display = 'none';
          btnElem.innerText = hasValidItemId ? 'Update' : 'Save';
          btnDivElem.appendChild(btnElem);

          const targetElementContent = targetElement.innerHTML;
          targetElement.setAttribute('disabled', true);
          targetElement.innerHTML = `${targetElementContent} <i class='fa fa-spinner fa-spin'></i>`;
          setTimeout(() => {
            btnElem.click();
            btnElem.remove();
            targetElement.innerHTML = targetElementContent;
            targetElement.removeAttribute('disabled');
          }, 500);
        }
      }
    }
  }
};

const setBrowserStorageData = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response } = args;
    const isParamEmpty = isEmpty(parameters);
    if (!isParamEmpty) {
      const {
        browserStorageLocation,
        customJsonKey,
        customJsonValue,
        enableConsoleLog,
        startConsoleLog,
        endConsoleLog,
      } = parameters;
      // Action Entry Custom Log
      if (enableConsoleLog) {
        const startLog = cleanConsoleLogArgs(startConsoleLog);
        logActionMessage(startLog);
      }

      if (browserStorageLocation && customJsonKey) {
        setDataInSessionStorageLocation(
          browserStorageLocation,
          customJsonKey,
          customJsonValue || '',
          false,
        );
      }

      // Action Exit Custom Log
      if (enableConsoleLog) {
        const endLog = cleanConsoleLogArgs(endConsoleLog);
        logActionMessage(endLog);
      }
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const clearBrowserStorageData = (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response } = args;
    const isParamEmpty = isEmpty(parameters);
    if (!isParamEmpty) {
      const {
        browserStorageLocation,
        removeAllData,
        removeSelectedKeys,
        enableConsoleLog,
        startConsoleLog,
        endConsoleLog,
      } = parameters;
      // Action Entry Custom Log
      if (enableConsoleLog) {
        const startLog = cleanConsoleLogArgs(startConsoleLog);
        logActionMessage(startLog);
      }
      if (removeAllData) {
        clearAllBSLData(browserStorageLocation);
      } else if (removeSelectedKeys) {
        const keysArray = removeSelectedKeys
          ? removeSelectedKeys.split(',').map((key) => key.trim())
          : [];
        removeBSLData(browserStorageLocation, keysArray);
      }
      // Action Exit Custom Log
      if (enableConsoleLog) {
        const endLog = cleanConsoleLogArgs(endConsoleLog);
        logActionMessage(endLog);
      }
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

// Helper functions Begins
const addCustomKeyInObj = (obj, oldKey, newKey) => {
  const orgKeyValue = getContentFromSessionObject(obj, oldKey);
  let tempObject = {};
  if (oldKey.includes('.')) {
    let container = tempObject;
    oldKey.split('.').map((key, index, values) => {
      if (index == values.length - 1) {
        container = container[newKey] = index == values.length - 1 ? orgKeyValue : {};
      } else {
        container = container[key] = index == values.length - 1 ? orgKeyValue : {};
      }
    });
  } else {
    tempObject[newKey] = orgKeyValue;
  }
  _.merge(obj, tempObject);
};

const propagateCollectionItemIdInSession = (uuid, collectionName) => {
  const parentCollectionKey = PARENT_COLLECTION_PROPAGATE_KEY;
  const parentCollectionData = {
    [parentCollectionKey]: {
      ['uuid']: uuid,
      ['name']: collectionName,
    },
  };
  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  if (previousActionResponse) {
    previousActionResponse = JSON.parse(previousActionResponse);
    sessionStorage.setItem(
      'previousActionResponse',
      JSON.stringify({ ...previousActionResponse, ...parentCollectionData }),
    );
  } else {
    sessionStorage.setItem('previousActionResponse', JSON.stringify(parentCollectionData));
  }
};

function fetchCurrentTenantJson() {
  let tenantObjString = fetchCurrentTenant();
  tenantObjString = tenantObjString ? tenantObjString : '';
  let currentTenant = '';

  try {
    currentTenant = tenantObjString ? JSON.parse(tenantObjString) : '';
  } catch (error) {
    tenantObjString = tenantObjString ? tenantObjString.replaceAll("'", APOSTROPHE_REPLACER) : '';
    currentTenant = tenantObjString ? JSON.parse(tenantObjString.replace(/##@apos@##/g, "'")) : '';
  }

  return currentTenant;
}

function fetchCurrentUserSettingsJson() {
  let userSettingObjString = fetchCurrentUserSetting();

  userSettingObjString = userSettingObjString ? userSettingObjString : '';
  let currentUserSetting = '';

  try {
    currentUserSetting = userSettingObjString ? JSON.parse(userSettingObjString) : '';
  } catch (error) {
    userSettingObjString = userSettingObjString
      ? userSettingObjString.replaceAll("'", APOSTROPHE_REPLACER)
      : '';
    currentUserSetting = userSettingObjString
      ? JSON.parse(userSettingObjString.replace(/##@apos@##/g, "'"))
      : '';
  }

  return currentUserSetting;
}

function fetchCurrentSubTenantJson() {
  let subTenantObjString = fetchCurrentSubTenant();

  subTenantObjString = subTenantObjString ? subTenantObjString : '';
  let currentSubTenant = '';

  try {
    currentSubTenant = subTenantObjString ? JSON.parse(subTenantObjString) : '';
  } catch (error) {
    subTenantObjString = subTenantObjString
      ? subTenantObjString.replaceAll("'", APOSTROPHE_REPLACER)
      : '';
    currentSubTenant = subTenantObjString
      ? JSON.parse(subTenantObjString.replace(/##@apos@##/g, "'"))
      : '';
  }

  return currentSubTenant;
}

function fetchLoggedInUserJson() {
  let userObjString = fetchLoggedInUser();
  userObjString = userObjString ? userObjString : '';
  let loggedInUser = '';

  try {
    loggedInUser = userObjString ? JSON.parse(userObjString) : '';
  } catch (error) {
    userObjString = userObjString ? userObjString.replaceAll("'", APOSTROPHE_REPLACER) : '';
    loggedInUser = userObjString ? JSON.parse(userObjString.replace(/##@apos@##/g, "'")) : '';
  }

  return loggedInUser;
}

async function fetchMultiTenantCollection(multiTenantPlugin) {
  const { setting } = multiTenantPlugin || '';
  const { multiTenantCollection } = setting || '';
  const multiTenantCollectionDetail = multiTenantCollection
    ? await getCollectionDetailsById(multiTenantCollection)
    : '';
  return multiTenantCollectionDetail;
}

async function fetchUserSettingCollection(multiTenantPlugin) {
  const { setting } = multiTenantPlugin || '';
  const { userSettingsCollection } = setting || '';
  const userSettingCollectionDetail = userSettingsCollection
    ? await getCollectionDetailsById(userSettingsCollection)
    : '';
  return userSettingCollectionDetail;
}

async function fetchInstalledPluginByCode(code) {
  let installedPlugin = '';
  if (code) {
    let pluginsEndpoint = `plugins/`;
    const pluginApiCallResult = await securedGetCall(pluginsEndpoint);
    const installedPlugins = pluginApiCallResult ? pluginApiCallResult.data : '';
    installedPlugin = installedPlugins && installedPlugins.find((plugin) => plugin.code === code);
  }
  return installedPlugin;
}

async function isSocketIOPluginInstalled() {
  const cached = localStorage.getItem('socketIoPlugin');
  if (['true', true].includes(cached)) {
    return true;
  }
  try {
    const response = await securedGetCall('plugins/');
    const plugins = response?.data || [];
    const isInstalled = plugins.some((plugin) => plugin.code === 'SOCKET_IO');
    if (isInstalled) {
      localStorage.setItem('socketIoPlugin', 'true');
    } else {
      localStorage.removeItem('socketIoPlugin');
    }
    return isInstalled;
  } catch (error) {
    console.error('Error checking socket IO plugin:', error);
    return false;
  }
}

function urlFromCurrentPage(urlToRedirect) {
  const pathArray = window.location.pathname.split('/');
  const collectionName = pathArray[pathArray.length - 2];
  const collectionItemId = pathArray[pathArray.length - 1];
  if (collectionName && collectionItemId) {
    urlToRedirect += `/${collectionName}/${collectionItemId}`;
  }
  return urlToRedirect;
}

function isActionEnabled(args) {
  // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
  new Promise(function (resolve) {
    resolve(args);
  });

  const { enabledEnvironments } = args;
  let { defaultEnabled, actionLabel } = args;

  console.groupCollapsed(`%cAction: ${actionLabel}`, 'color:cyan');
  console.groupCollapsed(`Action: ${actionLabel} - details`);
  console.log('Details:', args);
  console.groupEnd();
  console.groupCollapsed(`%cAction: ${actionLabel} - trace`, 'color:orange');
  console.trace('Triggered by');
  console.groupEnd();

  if (typeof defaultEnabled === 'undefined') {
    defaultEnabled = true;
  }
  let actionEnabled = true;

  if (!defaultEnabled) {
    let currentEnv = localStorage.getItem('environment');
    if (!currentEnv) {
      const timezoneElem = document.getElementById('project-timezone');
      currentEnv = timezoneElem && timezoneElem.getAttribute('data-projectenv');
    }

    actionEnabled = !!(
      enabledEnvironments &&
      enabledEnvironments.length &&
      enabledEnvironments.includes(currentEnv)
    );
    console.log(
      `🚀 ~ ${actionLabel} ~ isActionEnabled ~ Default Enabled:`,
      defaultEnabled,
      '~ Action Enabled:',
      actionEnabled,
      '~ Current Env:',
      currentEnv,
      '~ Enabled Environments:',
      enabledEnvironments,
    );
    console.groupEnd();
    appendActionLoader(args, actionEnabled);
    return actionEnabled;
  }
  if (actionLabel) console.log(`🚀 ~ ${actionLabel} ~ isActionEnabled:`, actionEnabled);
  console.groupEnd();
  appendActionLoader(args, actionEnabled);
  return actionEnabled;
}

async function resetCurrentUserInLocalStorage() {
  if (isLoggedInUser()) {
    const loggedInUser = fetchLoggedInUserJson();
    if (loggedInUser) {
      let response = {};
      try {
        const endpoint = `/refresh-user`;
        response = await axios.get(endpoint, {});
        if (response && response.status === 200) {
          const userObj = response.data;
          const { userDetails } = userObj || '';
          if (userDetails) {
            delete userDetails._id;
            delete userDetails.password;
            setJsonInLocalStorage('user', userDetails);
            localStorage.setItem('token', userDetails.token);
          }
        }
      } catch (error) {
        console.error(
          '🚀 ~ file: drapcode.js:5853 ~ resetCurrentUserInLocalStorage ~ error:',
          error,
        );
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
        }
      }
      return response;
    }
  }
}

async function resetCurrentTenantInLocalStorage() {
  if (isLoggedInTenant()) {
    const loggedInTenant = fetchCurrentTenantJson();
    const loggedInUserSetting = fetchCurrentUserSettingsJson();
    if (loggedInTenant) {
      const tenantUuid = loggedInTenant.uuid;
      let userSettingUuid = '';
      if (loggedInUserSetting) {
        userSettingUuid = loggedInUserSetting.uuid;
      }
      let response = {};
      try {
        const endpoint = `/refresh-user-tenant/${tenantUuid}/${userSettingUuid}`;
        response = await axios.get(endpoint, {});
        if (response && response.status === 200) {
          const userObj = response.data;
          const { userDetails, tenant: tenantObj, userSetting: userSettingObj } = userObj || '';
          if (userDetails) {
            delete userDetails._id;
            delete userDetails.password;
            setJsonInLocalStorage('user', userDetails);
          }
          if (tenantObj) {
            delete tenantObj._id;
            setJsonInLocalStorage('tenant', tenantObj);
          }
          if (userSettingObj) {
            delete userSettingObj._id;
            setJsonInLocalStorage('userSetting', userSettingObj);
          }
        }
      } catch (error) {
        console.error(
          '🚀 ~ file: drapcode.js:5982 ~ resetCurrentTenantInLocalStorage ~ error:',
          error,
        );
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
        }
      }
      return response;
    }
  }
}

function removeTenantFromLocalStorage(tenantId) {
  if (isLoggedInUser()) {
    const currentTenant = fetchCurrentTenantJson();
    if (currentTenant) {
      const currentTenantId = currentTenant.uuid;
      if (currentTenantId === tenantId) {
        localStorage.removeItem('tenant');
      }
    }
  }
}

function removeUserSettingsFromLocalStorage(userSettingId) {
  if (isLoggedInUser()) {
    const currentUserSetting = fetchCurrentUserSettingsJson();
    if (currentUserSetting) {
      const currentUserSettingId = currentUserSetting.uuid;
      if (currentUserSettingId === userSettingId) {
        localStorage.removeItem('userSetting');
      }
    }
  }
}

async function addTenantReferenceToUser(
  apiCallResult,
  response,
  loggedInUser,
  selectedUser,
  currentTenantId,
  currentUserSettingCollection,
  successMessage,
  hasTenantRoleMapping = false,
  tenantRoleMappingValue = '',
) {
  let endpoint = `collection-form/${COLLECTION_USER}/items/${selectedUser.uuid}`;

  let tenantIdSet = new Set();
  let tenantIds = [];
  let userSettingIdSet = new Set();
  let userSettingIds = [];
  if (selectedUser.tenantId && selectedUser.tenantId.length) {
    selectedUser.tenantId.forEach((tenantObj) => {
      tenantIdSet.add(tenantObj.uuid);
    });
  }
  if (selectedUser.userSettingId && selectedUser.userSettingId.length) {
    selectedUser.userSettingId.forEach((userSettingObj) => {
      userSettingIdSet.add(userSettingObj.uuid);
    });
  }
  if (currentTenantId) {
    tenantIdSet.add(currentTenantId);
  }
  tenantIds = [...tenantIdSet];
  let data = {
    tenantId: tenantIds,
  };
  let userSetting = '';
  if (currentTenantId && currentUserSettingCollection && selectedUser.uuid) {
    const itemData = {
      tenantId: currentTenantId,
      userId: selectedUser.uuid,
    };
    if (hasTenantRoleMapping && tenantRoleMappingValue) {
      itemData['userRoles'] = tenantRoleMappingValue;
    }
    const userSettingsEndpoint = `open/collection-form/${currentUserSettingCollection.collectionName}/items/`;
    const response = await unSecuredPostCall(itemData, userSettingsEndpoint);
    if (response.data.uuid) {
      userSetting = response.data;
      userSettingIdSet.add(userSetting.uuid);
      userSettingIds = [...userSettingIdSet];
      data.userSettingId = userSettingIds;
    }
  }

  apiCallResult = await securedPutCall(data, endpoint);
  response.data = apiCallResult;
  response.data.collectionSaveOrUpdateResponse = apiCallResult;
  response.status = 'success';

  const { collectionSaveOrUpdateResponse } = response.data;
  const { data: collectionItemData } = collectionSaveOrUpdateResponse;
  const collectionItemId = collectionItemData.uuid;

  const collectionKey = `collection_${COLLECTION_USER}`;
  const collectionItemUuidKey = 'uuid';
  const collectionData = {
    [collectionKey]: { [collectionItemUuidKey]: collectionItemId },
  };
  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  if (previousActionResponse) {
    previousActionResponse = JSON.parse(previousActionResponse);
    sessionStorage.setItem(
      'previousActionResponse',
      JSON.stringify({ ...previousActionResponse, ...collectionData }),
    );
  } else {
    sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
  }

  response.data = { ...response.data, ...collectionData };

  if (loggedInUser && loggedInUser.uuid === selectedUser.uuid) {
    await resetCurrentUserInLocalStorage();
  }

  if (successMessage) {
    toastr.success(successMessage, 'Success');
  }
  if (userSetting) response = { ...response, userSetting };
  return response;
}

async function removeTenantReferenceFromUser(
  selectedUser,
  currentTenantId,
  apiCallResult,
  response,
  loggedInUser,
  successMessage,
  removeUserSettings,
  currentUserSettingsId,
  userSettingsCollection,
) {
  let endpoint = `collection-form/${COLLECTION_USER}/items/${selectedUser.uuid}`;
  let tenantIds = [];
  let userSettingIds = [];
  if (selectedUser.tenantId) {
    selectedUser.tenantId.forEach((tenantObj) => {
      tenantIds.push(tenantObj.uuid);
    });
  }
  if (currentTenantId) {
    tenantIds = tenantIds && tenantIds.filter((tId) => tId !== currentTenantId);
  }
  let data = {
    tenantId: tenantIds,
  };
  if (removeUserSettings && selectedUser.userSettingId) {
    for (const settingObj of selectedUser.userSettingId) {
      if (settingObj.tenantId?.[0] === currentTenantId) {
        if (userSettingsCollection) {
          const endpoint = `collection-form/${userSettingsCollection.collectionName}/items/${settingObj.uuid}`;
          await unSecuredDeleteCall(endpoint);
        }
      } else {
        userSettingIds.push(settingObj.uuid);
      }
    }
    if (currentUserSettingsId) {
      userSettingIds = userSettingIds.filter((id) => id !== currentUserSettingsId);
    }
    data.userSettingId = userSettingIds;
  }
  apiCallResult = await securedPutCall(data, endpoint);
  response.data = apiCallResult;
  response.data.collectionSaveOrUpdateResponse = apiCallResult;
  response.status = 'success';

  const { collectionSaveOrUpdateResponse } = response.data;
  const { data: collectionItemData } = collectionSaveOrUpdateResponse;
  const collectionItemId = collectionItemData.uuid;

  const collectionKey = `collection_${COLLECTION_USER}`;
  const collectionItemUuidKey = 'uuid';
  const collectionData = {
    [collectionKey]: { [collectionItemUuidKey]: collectionItemId },
  };
  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  if (previousActionResponse) {
    previousActionResponse = JSON.parse(previousActionResponse);
    sessionStorage.setItem(
      'previousActionResponse',
      JSON.stringify({ ...previousActionResponse, ...collectionData }),
    );
  } else {
    sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
  }

  response.data = { ...response.data, ...collectionData };

  if (loggedInUser && loggedInUser.uuid === selectedUser.uuid) {
    await resetCurrentUserInLocalStorage();
    removeTenantFromLocalStorage(currentTenantId);
    if (removeUserSettings && currentUserSettingsId) {
      removeUserSettingsFromLocalStorage(currentUserSettingsId);
    }
  }

  if (successMessage) {
    toastr.success(successMessage, 'Success');
  }
  return response;
}

async function createUserWithTenantReference(
  element,
  parameters,
  response,
  userRole,
  formData,
  currentTenantId,
  currentUserSettingCollection,
  confirmationMessage,
  hasTenantRoleMapping,
  tenantRoleMappingValue,
) {
  let userSetting = '';
  if (userRole) {
    formData.userRoles = userRole;
  } else {
    toastr.error('Please provide a user role!', 'Error');
  }
  let endPoint = `collection-form/${COLLECTION_USER}/items`;
  formData.tenantId = [currentTenantId];
  if (formData.hasOwnProperty('password') && formData.password === '') {
    const passwordField = element.elements.password;
    passwordField.classList.add('error');
    const errorLabelElement = document.createElement('label');
    errorLabelElement.setAttribute('id', `${passwordField.id}-error`);
    errorLabelElement.setAttribute('class', `error`);
    errorLabelElement.setAttribute('for', `${passwordField.id}`);
    errorLabelElement.innerHTML = passwordField.placeholder
      ? passwordField.placeholder
      : 'Please enter password';
    passwordField.insertAdjacentElement('afterend', errorLabelElement);
    response.data = passwordField.placeholder ? passwordField.placeholder : 'Please enter password';
    response.status = 'error';
    return response;
  }

  if (!formData.hasOwnProperty('password') && !formData.password) {
    formData.password = generateTemporaryPassword();
  }

  if (confirmationMessage) {
    return await swalAlert(confirmationMessage, 'Proceed', true, false).then(
      async (willProceed) => {
        if (willProceed.isConfirmed) {
          response = await processSignUpUser(formData, endPoint, element, parameters, false);
          // Add current Signed-up user UUID in response
          if (response && response.data && response.data.data && response.data.data.uuid) {
            response.data.collectionSaveOrUpdateResponse = response.data;
            response.data.userSignupId = response.data.data.uuid;
            // Propagate Current User Id in Session
            propagateCollectionItemIdInSession(response.data.data.uuid, COLLECTION_USER);
            if (currentUserSettingCollection) {
              userSetting = await createUserSettingsForAddNewUserToTenant(
                currentUserSettingCollection,
                response.data.data.uuid,
                currentTenantId,
                hasTenantRoleMapping,
                tenantRoleMappingValue,
                response,
              );
            }
          }

          response.confirmation = willProceed;
          response.status = 'success';
          if (userSetting) response = { ...response, userSetting };
          return response;
        } else {
          response.confirmation = willProceed;
          response.status = 'cancel';
          return response;
        }
      },
    );
  } else {
    response = await processSignUpUser(formData, endPoint, element, parameters, false);
    // Add current Signed-up user UUID in response
    if (response && response.data && response.data.data && response.data.data.uuid) {
      response.data.collectionSaveOrUpdateResponse = response.data;
      response.data.userSignupId = response.data.data.uuid;
      // Propagate Current User Id in Session
      propagateCollectionItemIdInSession(response.data.data.uuid, COLLECTION_USER);
      if (currentUserSettingCollection) {
        userSetting = await createUserSettingsForAddNewUserToTenant(
          currentUserSettingCollection,
          response.data.data.uuid,
          currentTenantId,
          hasTenantRoleMapping,
          tenantRoleMappingValue,
          response,
        );
      }
    }
    if (userSetting) response = { ...response, userSetting };
    return response;
  }
}

function disabledActionResponse(args) {
  const { response } = args;
  return response;
}

function processFieldValueData(collectionUpdateField, fieldValue, collectionItem, data) {
  if (collectionUpdateField.fieldType && !!collectionUpdateField.isMultiSelect) {
    let fieldItemValue = collectionItem[collectionUpdateField.key];
    switch (collectionUpdateField.fieldType) {
      case 'static_option':
      case 'dynamic_option':
        let fieldItemValueSet = new Set();
        let fieldItemValues = [];
        if (
          collectionUpdateField.hasOwnProperty('valueAction') &&
          collectionUpdateField.valueAction === 'APPEND'
        ) {
          if (fieldItemValue && fieldItemValue.length) {
            fieldItemValue.forEach((fieldItemValueObj) => {
              fieldItemValueSet.add(fieldItemValueObj);
            });
          }
        }
        if (fieldValue) {
          // Handling Key:Value pair joined by "::"
          let optionItemLabel = fieldValue;
          let optionItemValue = fieldValue;
          const covertToArray =
            fieldValue && !Array.isArray(fieldValue) && fieldValue.includes(',');
          if (covertToArray) {
            optionItemValue = fieldValue.split(',');
            optionItemValue.forEach((oiv) => {
              if (oiv && oiv.includes('::')) {
                const itemArr = oiv.split('::');
                if (itemArr && itemArr.length === 2) {
                  optionItemValue = itemArr[0].trim();
                  optionItemLabel = itemArr[1].trim();
                }
                fieldItemValueSet.add(optionItemValue);
              } else {
                fieldItemValueSet.add(oiv);
              }
            });
          } else if (optionItemValue && Array.isArray(optionItemValue)) {
            optionItemValue.forEach((oiv) => {
              if (oiv && oiv.includes('::')) {
                const itemArr = oiv.split('::');
                if (itemArr && itemArr.length === 2) {
                  optionItemValue = itemArr[0].trim();
                  optionItemLabel = itemArr[1].trim();
                }
                fieldItemValueSet.add(optionItemValue);
              } else {
                fieldItemValueSet.add(oiv);
              }
            });
          } else {
            if (optionItemValue && optionItemValue.includes('::')) {
              const itemArr = optionItemValue.split('::');
              if (itemArr && itemArr.length === 2) {
                optionItemValue = itemArr[0].trim();
                optionItemLabel = itemArr[1].trim();
              }
            }
            fieldItemValueSet.add(optionItemValue);
          }
        }
        fieldItemValues = [...fieldItemValueSet];
        data[collectionUpdateField.key] = fieldItemValues;
        break;
      default:
        let fieldItemIdSet = new Set();
        let fieldItemIds = [];
        if (
          collectionUpdateField.hasOwnProperty('valueAction') &&
          collectionUpdateField.valueAction === 'APPEND'
        ) {
          if (fieldItemValue && fieldItemValue.length) {
            fieldItemValue.forEach((fieldItemValueObj) => {
              fieldItemIdSet.add(fieldItemValueObj.uuid);
            });
          }
        }
        if (fieldValue) {
          fieldItemIdSet.add(fieldValue);
        }
        fieldItemIds = [...fieldItemIdSet];
        data[collectionUpdateField.key] = fieldItemIds;
        break;
    }
  } else {
    if (fieldValue && Array.isArray(fieldValue)) {
      fieldValue.forEach((oiv) => {
        data[collectionUpdateField.key] = oiv;
      });
    } else {
      data[collectionUpdateField.key] = fieldValue;
    }
  }
}

function removeEmptyDropzoneFields(form, data) {
  if (form && data) {
    const formDropzoneFieldElems = form.querySelectorAll(`[data-gjs="collection-file-dropzone"]`);

    if (formDropzoneFieldElems && formDropzoneFieldElems.length) {
      let formDropzoneFieldNames = [];
      formDropzoneFieldElems.forEach((elem) => {
        formDropzoneFieldNames.push(elem.getAttribute('name'));
      });

      if (data && Object.entries(data).length) {
        let emptyFields = [];
        Object.entries(data).map(([key, value]) => {
          if (!value) {
            emptyFields.push(key);
          }
        });

        if (emptyFields && Object.entries(emptyFields).length) {
          emptyFields.forEach((emptyFieldName) => {
            if (formDropzoneFieldNames.includes(emptyFieldName)) {
              delete data[emptyFieldName];
            }
          });
        }
      }
    }
  }
}

function clearDataForSessionStorage(data) {
  let cleanFormDataForSession = {};
  cleanFormDataForSession = { ...data };
  if (data.password) {
    delete cleanFormDataForSession.password;
  }
  return cleanFormDataForSession;
}

function getFormElement(args) {
  const { element, targetElement } = args;
  let form = element;
  if (form.tagName !== 'FORM') {
    form = targetElement ? targetElement.closest('FORM') : element ? element.closest('FORM') : '';
  }
  return form;
}

function mockExistingFile(
  collectionItems,
  fieldId,
  myDropzone,
  completedFiles,
  refCollectionField,
  getContentFromData,
  inputElem,
) {
  let fieldItem;
  if (
    getContentFromData &&
    getContentFromData.getDropZoneDataFrom &&
    getContentFromData.getDropZoneDataFrom !== 'NONE'
  ) {
    const source = getContentFromData.getDropZoneDataFrom;
    const {
      currentTenantField,
      currentUserField,
      currentUserSettingsField,
      formCollectionField,
      currentSubTenantField,
    } = getContentFromData;
    switch (source) {
      case 'CURRENT_TENANT': {
        const tenant = fetchCurrentTenantJson();
        fieldItem = tenant?.[currentTenantField];
        break;
      }
      case 'CURRENT_USER': {
        const user = fetchLoggedInUserJson();
        fieldItem = user?.[currentUserField];
        break;
      }
      case 'CURRENT_USER_SETTINGS': {
        const settings = fetchCurrentUserSettingsJson();
        fieldItem = settings?.[currentUserSettingsField];
        break;
      }
      case 'CURRENT_SUB_TENANT': {
        const subTenant = fetchCurrentSubTenantJson();
        fieldItem = subTenant?.[currentSubTenantField];
        break;
      }
      case 'FORM_COLLECTION': {
        fieldItem = collectionItems?.[formCollectionField];
        fieldItem = parseMySqlBlobData(fieldItem);
        break;
      }
    }
    inputElem.value = [JSON.stringify(fieldItem)];
  } else if (collectionItems && Object.keys(collectionItems).length) {
    fieldItem = collectionItems?.[fieldId];
    if (refCollectionField) {
      fieldItem = fieldItem.flatMap((item) => {
        const refCollectionData = item?.[refCollectionField] || [];
        return refCollectionData.map((data) => ({
          ...data,
          refFieldUuid: item.uuid,
        }));
      });
    }
  }
  if (fieldItem) {
    if (!Array.isArray(fieldItem)) {
      fieldItem = [fieldItem];
    }
    if (fieldItem.length) {
      fieldItem.forEach((item) => {
        let fileUrl;
        if (
          item.isPrivate === false &&
          [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/heif',
            'image/heic',
          ].includes(item.mimeType)
        ) {
          fileUrl = imageServerUrl() + item.key;
        } else if (item.hasOwnProperty('smallIcon')) {
          fileUrl = item.smallIcon;
        } else {
          fileUrl = generateFileURL(item);
        }
        const fileName = item.originalName;
        const fileSize = item.size;
        if (fileName) {
          const mockFile = {
            name: fileName,
            size: fileSize,
            ...(item.refFieldUuid ? { refFieldUuid: item.refFieldUuid } : {}),
          };
          let callback = null; // Optional callback when it's done
          let crossOrigin = true; // Added to the `img` tag for crossOrigin handling
          let resizeThumbnail = false; // Tells Dropzone whether it should resize the image first
          updateDropzoneRemoveFileText(myDropzone, fileName);
          myDropzone.displayExistingFile(mockFile, fileUrl, callback, crossOrigin, resizeThumbnail);
          completedFiles.push(JSON.stringify(item));
        }
      });
      // If you use the maxFiles option, make sure adjusting it to the correct amount:
      const fileCountOnServer = fieldItem.length; // The number of files already uploaded
      myDropzone.options.maxFiles = myDropzone.options.maxFiles - fileCountOnServer;
    }
  }
}

function parseMySqlBlobData(fieldItem) {
  if (fieldItem && !Array.isArray(fieldItem) && fieldItem.type === 'Buffer') {
    const bufferData = fieldItem.data;
    const jsonString = new TextDecoder().decode(new Uint8Array(bufferData));
    try {
      fieldItem = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON from buffer data:', error);
      fieldItem = null;
    }
  }
  return fieldItem;
}

function getCookie(cookieName, decrypt = false) {
  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [key, value] = el.split('=');
    if (decrypt && value) {
      // Decode the String
      cookie[key.trim()] = atob(value.toString());
    } else {
      cookie[key.trim()] = value;
    }
  });
  return cookie[cookieName];
}

function setCookie(cname, cvalue, exdays, encrypt = true, urlEncoded = false) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  let cookieVal = cvalue;
  if (encrypt && cvalue) {
    // Encode the String
    cookieVal = btoa(cvalue.toString());
  } else if (urlEncoded && cvalue) {
    // URL Encode the String
    cookieVal = encodeURIComponent(cvalue.toString());
  }
  document.cookie = cname + '=' + cookieVal + ';' + expires + ';path=/';
}

function removeCookie(cookieName) {
  const cookieValue = getCookie(cookieName);
  if (cookieValue) {
    setCookie(cookieName, '', -1);
  }
}

function removeAllCookies() {
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }
}

function getLvl1CollRefFieldName(field, item, refCollectionFieldName) {
  const isChildRefField = field.refCollection.collectionField
    ? field.refCollection.collectionField.includes(CUSTOM_SEPARATOR)
    : false;

  /**
   * Handling Level 1 Child Reference Field Property Value
   * isChildRefField is TRUE
   * Field Type: Dynamic Option
   * field.refCollection.collectionField value includes ##@CUSTOM_SEPARATOR@##
   * Values separated by ##@CUSTOM_SEPARATOR@##
   * Value[0] -> Level 1 Collection Name
   * Value[1] -> Reference_Field.fieldName
   * */
  if (isChildRefField) {
    let refChildColField = field.refCollection.collectionField.split(CUSTOM_SEPARATOR);
    refChildColField = refChildColField[1].split('.');
    const refItemValue = _.get(item, refChildColField[0]);

    if (refItemValue && Array.isArray(refItemValue)) {
      refCollectionFieldName = refChildColField.join('.0.');
    } else {
      refCollectionFieldName = refChildColField[1];
    }
  }
  return refCollectionFieldName;
}

function autocompleteInput(inputElement, suggestionsArray) {
  /* The autocomplete function takes two arguments:
     the text field element and an array of possible autocompleted values. */
  let currentFocusIndex;

  /* Execute a function when someone writes in the text field: */
  inputElement.addEventListener('input', function (event) {
    let autocompleteContainer,
      suggestionItem,
      inputValue = this.value;

    /* Close any already open lists of autocompleted values */
    closeAllLists();
    if (!inputValue) {
      return false;
    }
    currentFocusIndex = -1;

    /* Create a DIV element that will contain the items (values): */
    autocompleteContainer = document.createElement('DIV');
    autocompleteContainer.setAttribute('id', this.id + 'autocomplete-list');
    autocompleteContainer.setAttribute('class', 'autocomplete-items');

    /* Append the DIV element as a child of the autocomplete container: */
    this.parentNode.appendChild(autocompleteContainer);

    /* For each item in the array... */
    for (let i = 0; i < suggestionsArray.length; i++) {
      /* Check if the item starts with the same letters as the text field value: */
      if (
        suggestionsArray[i].substr(0, inputValue.length).toUpperCase() === inputValue.toUpperCase()
      ) {
        /* Create a DIV element for each matching element: */
        suggestionItem = document.createElement('DIV');

        /* Make the matching letters bold: */
        suggestionItem.innerHTML =
          '<strong>' + suggestionsArray[i].substr(0, inputValue.length) + '</strong>';
        suggestionItem.innerHTML += suggestionsArray[i].substr(inputValue.length);

        /* Insert a hidden input field that will hold the current array item's value: */
        suggestionItem.innerHTML += "<input type='hidden' value='" + suggestionsArray[i] + "'>";

        /* Execute a function when someone clicks on the item value (DIV element): */
        suggestionItem.addEventListener('click', function (event) {
          /* Insert the value for the autocomplete text field: */
          inputElement.value = this.getElementsByTagName('input')[0].value;

          /* Close the list of autocompleted values, or any other open lists of autocompleted values: */
          closeAllLists();
        });

        autocompleteContainer.appendChild(suggestionItem);
      }
    }
  });

  /* Execute a function when a key is pressed on the keyboard: */
  inputElement.addEventListener('keydown', function (event) {
    let autocompleteItems = document.getElementById(this.id + 'autocomplete-list');
    if (autocompleteItems) {
      autocompleteItems = autocompleteItems.getElementsByTagName('div');
    }

    if (event.keyCode === 40) {
      /* If the arrow DOWN key is pressed, increase the currentFocusIndex variable: */
      currentFocusIndex++;
      /* And make the current item more visible: */
      addActive(autocompleteItems);
    } else if (event.keyCode === 38) {
      // Arrow UP
      /* If the arrow UP key is pressed, decrease the currentFocusIndex variable: */
      currentFocusIndex--;
      /* And make the current item more visible: */
      addActive(autocompleteItems);
    } else if (event.keyCode === 13) {
      /* If the ENTER key is pressed, prevent the form from being submitted: */
      event.preventDefault();
      if (currentFocusIndex > -1) {
        /* Simulate a click on the "active" item: */
        if (autocompleteItems) {
          autocompleteItems[currentFocusIndex].click();
        }
      }
    }
  });

  function addActive(autocompleteItems) {
    /* A function to classify an item as "active": */
    if (!autocompleteItems) return false;

    /* Start by removing the "active" class on all items: */
    removeActive(autocompleteItems);

    if (currentFocusIndex >= autocompleteItems.length) currentFocusIndex = 0;
    if (currentFocusIndex < 0) currentFocusIndex = autocompleteItems.length - 1;

    /* Add class "autocomplete-active": */
    autocompleteItems[currentFocusIndex].classList.add('autocomplete-active');
  }

  function removeActive(autocompleteItems) {
    /* A function to remove the "active" class from all autocomplete items: */
    for (let i = 0; i < autocompleteItems.length; i++) {
      autocompleteItems[i].classList.remove('autocomplete-active');
    }
  }

  function closeAllLists(exceptElement) {
    /* Close all autocomplete lists in the document, except the one passed as an argument: */
    const autocompleteItems = document.getElementsByClassName('autocomplete-items');
    for (let i = 0; i < autocompleteItems.length; i++) {
      if (exceptElement !== autocompleteItems[i] && exceptElement !== inputElement) {
        autocompleteItems[i].parentNode.removeChild(autocompleteItems[i]);
      }
    }
  }

  /* Execute a function when someone clicks in the document: */
  document.addEventListener('click', function (event) {
    closeAllLists(event.target);
  });
}

async function checkAndUpdateItemId(form) {
  let method = form.getAttribute('method');
  let getDataItemIdFrom = form.getAttribute('getdataitemidfrom');
  let itemIdField = form.getAttribute('itemidfield');
  const tenantCollection = form.getAttribute('data-tenant-collection');
  const userSettingsCollection = form.getAttribute('data-user-settings-collection');
  const subTenantCollection = form.getAttribute('data-sub-tenant-collection');
  const entityCollection = form.getAttribute('data-entity-key');
  const browserstorageType = form.getAttribute('browser-storage-type');
  let itemId,
    parentItemId,
    parentItemCollection = '';
  if (method && method.toUpperCase() === 'PUT' && getDataItemIdFrom) {
    switch (getDataItemIdFrom) {
      case 'PARENT_COLLECTION':
        let parentComponentItem = form.getAttribute('data-item');
        parentComponentItem = parentComponentItem ? JSON.parse(parentComponentItem) : {};
        parentItemCollection = form.getAttribute('data-collection-id');
        if (itemIdField) {
          if (itemIdField.includes('.')) {
            let itemIdFieldArr = itemIdField.split('.');
            itemIdField = itemIdFieldArr.join('.0.');
          }
          itemId = _.get(parentComponentItem, itemIdField);
        }
        parentItemId = _.get(parentComponentItem, 'uuid');
        break;
      case 'PAGE_COLLECTION':
        const { itemData: pageItem, collectionId: pageCollection } = await getPageItemData();
        parentItemCollection = pageCollection;
        if (itemIdField) {
          if (itemIdField.includes('.')) {
            let itemIdFieldArr = itemIdField.split('.');
            itemIdField = itemIdFieldArr.join('.0.');
          }
          itemId = _.get(pageItem, itemIdField);
        }
        parentItemId = _.get(pageItem, 'uuid');
        break;
      case 'CURRENT_USER_FIELD':
        parentItemCollection = 'user';
        if (isLoggedInUser()) {
          const loggedInUser = fetchLoggedInUserJson();
          if (itemIdField) {
            if (itemIdField.includes('.')) {
              let itemIdFieldArr = itemIdField.split('.');
              itemIdField = itemIdFieldArr.join('.0.');
            }
            itemId = _.get(loggedInUser, itemIdField);
          }
          parentItemId = _.get(loggedInUser, 'uuid');
        }
        break;
      case 'CURRENT_USER_SETTINGS_FIELD':
        parentItemCollection = userSettingsCollection;
        if (isLoggedInUserSetting()) {
          const currentUserSetting = fetchCurrentUserSettingsJson();
          if (itemIdField) {
            if (itemIdField.includes('.')) {
              let itemIdFieldArr = itemIdField.split('.');
              itemIdField = itemIdFieldArr.join('.0.');
            }
            itemId = _.get(currentUserSetting, itemIdField);
          }
          parentItemId = _.get(currentUserSetting, 'uuid');
        }
        break;
      case 'CURRENT_TENANT_FIELD':
        parentItemCollection = tenantCollection;
        if (isLoggedInTenant()) {
          const currentTenant = fetchCurrentTenantJson();
          if (itemIdField) {
            if (itemIdField.includes('.')) {
              let itemIdFieldArr = itemIdField.split('.');
              itemIdField = itemIdFieldArr.join('.0.');
            }

            itemId = _.get(currentTenant, itemIdField);
          }
          parentItemId = _.get(currentTenant, 'uuid');
        }
        break;
      case 'CURRENT_SUB_TENANT_FIELD':
        parentItemCollection = subTenantCollection;
        if (isLoggedInSubTenant()) {
          const currentSubTenant = fetchCurrentSubTenantJson();
          if (itemIdField) {
            if (itemIdField.includes('.')) {
              let itemIdFieldArr = itemIdField.split('.');
              itemIdField = itemIdFieldArr.join('.0.');
            }
            itemId = _.get(currentSubTenant, itemIdField);
          }
          parentItemId = _.get(currentSubTenant, 'uuid');
        }
        break;
      case 'BROWSER_SESSION_STORAGE':
        if (itemIdField) itemId = parseSessionObject(itemIdField);
        break;
      case 'ENTITY_COLLECTION':
        let storageKey = `entity_${entityCollection}`;
        let storageData = parseLSJSONStrToJSON(storageKey);
        itemId = _.get(storageData, itemIdField);
        break;
      case 'BROWSER_STORAGE':
        let browserStorageData = await getBSLData(browserstorageType);
        if (browserStorageData)
          itemId = itemIdField ? _.get(browserStorageData, itemIdField.trim()) : '';
        break;
      default:
        break;
    }
  }
  return { itemId, parentItemId, parentItemCollection };
}

function getItemIdFromDataForFormElement(
  form,
  formCollectionName,
  responseData,
  externalAPIResponseDataMapping,
) {
  let method = form.getAttribute('method');
  let getDataItemIdFrom = form.getAttribute('getdataitemidfrom');
  let itemIdField = form.getAttribute('itemidfield');
  const tenantCollection = form.getAttribute('data-tenant-collection');
  const userSettingsCollection = form.getAttribute('data-user-settings-collection');
  const subTenantCollection = form.getAttribute('data-sub-tenant-collection');
  const entityCollection = form.getAttribute('data-entity-key');
  // const browserstorageType = form.getAttribute('browser-storage-type');
  let itemId,
    parentItemId,
    parentItemCollection = '';

  const itemIdFieldName = extractNameFromExternalApiResponseMapping(
    externalAPIResponseDataMapping,
    itemIdField,
  );

  console.log(
    '🚀 ~ getItemIdFromDataForFormElement ~ form:',
    form,
    '~ formCollectionName:',
    formCollectionName,
    '~ itemIdFieldName:',
    itemIdFieldName,
    '~ responseData:',
    responseData,
    '~ externalAPIResponseDataMapping:',
    externalAPIResponseDataMapping,
  );

  if (method && method.toUpperCase() === 'PUT' && getDataItemIdFrom) {
    switch (getDataItemIdFrom) {
      case 'PARENT_COLLECTION':
      case 'PAGE_COLLECTION':
        let parentComponentItem = responseData || {};
        parentItemCollection = formCollectionName;
        if (itemIdFieldName) {
          if (itemIdFieldName.includes('.')) {
            let itemIdFieldNameArr = itemIdFieldName.split('.');
            itemIdFieldName = itemIdFieldNameArr.join('.0.');
          }
          itemId = _.get(parentComponentItem, itemIdFieldName);
        }
        parentItemId = _.get(parentComponentItem, 'uuid');
        break;
      case 'CURRENT_USER_FIELD':
        parentItemCollection = 'user';
        if (isLoggedInUser()) {
          const loggedInUser = fetchLoggedInUserJson();
          if (itemIdFieldName) {
            if (itemIdFieldName.includes('.')) {
              let itemIdFieldNameArr = itemIdFieldName.split('.');
              itemIdFieldName = itemIdFieldNameArr.join('.0.');
            }
            itemId = _.get(loggedInUser, itemIdFieldName);
          }
          parentItemId = _.get(loggedInUser, 'uuid');
        }
        break;
      case 'CURRENT_USER_SETTINGS_FIELD':
        parentItemCollection = userSettingsCollection;
        if (isLoggedInUserSetting()) {
          const currentUserSetting = fetchCurrentUserSettingsJson();
          if (itemIdFieldName) {
            if (itemIdFieldName.includes('.')) {
              let itemIdFieldNameArr = itemIdFieldName.split('.');
              itemIdFieldName = itemIdFieldNameArr.join('.0.');
            }
            itemId = _.get(currentUserSetting, itemIdFieldName);
          }
          parentItemId = _.get(currentUserSetting, 'uuid');
        }
        break;
      case 'CURRENT_TENANT_FIELD':
        parentItemCollection = tenantCollection;
        if (isLoggedInTenant()) {
          const currentTenant = fetchCurrentTenantJson();
          if (itemIdFieldName) {
            if (itemIdFieldName.includes('.')) {
              let itemIdFieldNameArr = itemIdFieldName.split('.');
              itemIdFieldName = itemIdFieldNameArr.join('.0.');
            }

            itemId = _.get(currentTenant, itemIdFieldName);
          }
          parentItemId = _.get(currentTenant, 'uuid');
        }
        break;
      case 'CURRENT_SUB_TENANT_FIELD':
        parentItemCollection = subTenantCollection;
        if (isLoggedInSubTenant()) {
          const currentSubTenant = fetchCurrentSubTenantJson();
          if (itemIdFieldName) {
            if (itemIdFieldName.includes('.')) {
              let itemIdFieldNameArr = itemIdFieldName.split('.');
              itemIdFieldName = itemIdFieldNameArr.join('.0.');
            }
            itemId = _.get(currentSubTenant, itemIdFieldName);
          }
          parentItemId = _.get(currentSubTenant, 'uuid');
        }
        break;
      case 'BROWSER_SESSION_STORAGE':
        if (itemIdFieldName) itemId = parseSessionObject(itemIdFieldName);
        break;
      case 'ENTITY_COLLECTION':
        let storageKey = `entity_${entityCollection}`;
        let storageData = parseLSJSONStrToJSON(storageKey);
        itemId = _.get(storageData, itemIdFieldName);
        break;
      // case 'BROWSER_STORAGE':
      //   let browserStorageData = await getBSLData(browserstorageType);
      //   if (browserStorageData)
      //     itemId = itemIdFieldName ? _.get(browserStorageData, itemIdFieldName.trim()) : '';
      //   break;
      default:
        break;
    }
  }
  return { itemId, parentItemId, parentItemCollection };
}

const getNewEndPointUrl = (itemId, endpoint) => {
  if (itemId) {
    let oldItemIdKey = endpoint.split('collection-form/')[1];
    oldItemIdKey = oldItemIdKey.split('/items')[1];
    let newItemIdKey = `/${itemId}`;
    if (oldItemIdKey) {
      endpoint = replaceValueInExpression(oldItemIdKey, newItemIdKey, endpoint);
    } else {
      endpoint += `/${itemId}`;
    }
  }
  return endpoint;
};

const setNestedProp = (obj = {}, [first, ...rest], value) => ({
  ...obj,
  [first]: rest.length ? setNestedProp(obj[first], rest, value) : value,
});

const addTimePickerToElement = (element, data = '') => {
  const { dataset } = element || {};
  const { timeformat } = dataset || {};
  const is24Hours = timeformat === '24_HOURS';
  const timepickerFormat = is24Hours ? 'H:i' : 'h:i A';
  $(element).timepicker({
    timeFormat: timepickerFormat,
    interval: 15,
    minTime: '00:00',
    maxTime: '23:59',
    defaultTime: data || '10:00',
    startTime: '00:00',
    dynamic: false,
    dropdown: true,
    scrollbar: true,
    show2400: is24Hours,
  });
};

function processSelectOptionValue(isMultiSelect = false, fieldValue) {
  // Handling value based on Select type
  if (isMultiSelect) {
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue && fieldValue.length > 0 ? fieldValue : [];
    } else {
      if (fieldValue) {
        if (typeof fieldValue === 'string') {
          fieldValue = fieldValue.split(',');
        } else {
          fieldValue = fieldValue.toString().split(',');
        }
      } else {
        fieldValue = [];
      }
    }
  } else {
    if (Array.isArray(fieldValue)) {
      fieldValue = fieldValue && fieldValue.length > 0 ? fieldValue.join('') : '';
    } else {
      fieldValue = fieldValue ? fieldValue : '';
    }
  }
  return fieldValue;
}

function setJsonInLocalStorage(key, data, processApostrophe = true) {
  if (key) {
    if (data && Object.keys(data).length) {
      if (processApostrophe) {
        const jsonStr = JSON.stringify(data).replace(/'/g, APOSTROPHE_REPLACER);
        localStorage.setItem(key, jsonStr.replace(/##@apos@##/g, "'"));
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
}

function parseLSJSONStrToJSON(storageKey) {
  let storageData = {};

  if (storageKey) {
    let storageDataString = localStorage.getItem(storageKey)
      ? localStorage.getItem(storageKey)
      : '';
    storageDataString = storageDataString ? storageDataString : '';

    try {
      storageData = storageDataString ? JSON.parse(storageDataString) : {};
    } catch (error) {
      storageDataString = storageDataString
        ? storageDataString.replaceAll("'", APOSTROPHE_REPLACER)
        : '';
      storageData = storageDataString
        ? JSON.parse(storageDataString.replace(/##@apos@##/g, "'"))
        : {};
    }
  }

  return storageData;
}

function generateFileURL(fileItem) {
  const { mimeType } = fileItem || {};
  let fileIconUrl;
  switch (mimeType) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'image/heif':
    case 'image/webp':
    case 'image/heic':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png';
      break;
    case 'application/zip':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/zip.png';
      break;
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': //xlsx
    case 'application/vnd.ms-excel': //xls
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/excel.png';
      break;
    case 'application/pdf':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/pdf-file.png';
      break;
    case 'text/csv':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/csv.png';
      break;
    case 'application/msword': //doc
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': //docx
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/google-docs.png';
      break;
    case 'text/plain':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/txt.png';
      break;
    case 'application/rtf':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/rtf-file-symbol.png';
      break;
    case 'text/html':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/html.png';
      break;
    case 'audio/mpeg':
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/placeholder-audio.png';
      break;
    case 'video/mpeg': //mpg
    case 'video/x-flv': //flv
    case 'video/x-msvideo': //avi
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/video.png';
      break;
    case 'application/vnd.ms-powerpoint': //ppt
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': //pptx
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/powerpoint.png';
      break;
    default:
      fileIconUrl = 'https://drapcode-static.s3.amazonaws.com/img/google-docs.png';
      break;
  }
  return fileIconUrl;
}

function updateDropzoneRemoveFileText(myDropzone, fileName) {
  myDropzone.options.dictRemoveFile = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" style="cursor:pointer">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" style="cursor:pointer"/>
          </svg><span class="dz-remove-filename" style="cursor:pointer">
          ${truncateString(fileName, 21, 6, 3)}</span>`;
}

function truncateString(str, firstCharCount = str.length, endCharCount = 0, dotCount = 3) {
  if (str.length <= firstCharCount + endCharCount) {
    return str; // No truncation needed
  }

  const firstPortion = str.slice(0, firstCharCount);
  const endPortion = str.slice(-endCharCount);
  const dots = '.'.repeat(dotCount);

  return `${firstPortion}${dots}${endPortion}`;
}

function loadElementChildList(element, elementChildList = []) {
  if (element) {
    if (element.tagName) {
      elementChildList.push(element);
    }
    if (element.hasChildNodes()) {
      let children = element.childNodes;
      for (const node of children) {
        loadElementChildList(node, elementChildList);
      }
    }
  }
  return elementChildList;
}

const addStylesForSummerNoteEditor = () => {
  const style = document.createElement('style');
  const fontOptionsDropdownStyles = `
    .note-dropdown-menu {
        overflow-y: auto;
        max-height: 200px;
    }

    .note-dropdown-menu::-webkit-scrollbar {
        width: 8px;
    }

    .note-dropdown-menu::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .note-dropdown-menu::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    .note-dropdown-menu::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    .note-icon-caret {
        display: none;
    }
`;

  style.innerHTML = fontOptionsDropdownStyles;
  document.head.appendChild(style);
};

const containsHTML = (str) => {
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlPattern.test(str);
};

function isValidJSONString(data) {
  let isJSON = false;
  try {
    if (data && JSON.parse(data)) {
      const jsonObj = JSON.parse(data);
      if (jsonObj && typeof jsonObj === 'object') {
        isJSON = true;
      }
    }
  } catch (error) {
    isJSON = false;
  }
  return isJSON;
}

function prepareBSLDataJSON(isJSONString, valueString, obj, key) {
  try {
    if (isJSONString) {
      let valueJSON = JSON.parse(valueString);
      if (valueJSON && typeof valueJSON === 'object') {
        obj[key] = valueJSON;
      }
    } else {
      if (valueString && typeof valueString === 'string') {
        obj[key] = valueString;
      }
    }
  } catch (error) {}
}

const getBrowserLocalStorageData = (excludedKeys = []) => {
  let localStorageObj = Object.keys(localStorage).reduce(function (obj, key) {
    let valueString = !excludedKeys.includes(key) ? localStorage.getItem(key) : '';
    const isJSONString = isValidJSONString(valueString);
    prepareBSLDataJSON(isJSONString, valueString, obj, key);
    return obj;
  }, {});
  return localStorageObj;
};

const getBrowserSessionStorageData = (excludedKeys = ['__resetK']) => {
  let sessionStorageObj = Object.keys(sessionStorage).reduce(function (obj, key) {
    let valueString = !excludedKeys.includes(key) ? sessionStorage.getItem(key) : '';
    const isJSONString = isValidJSONString(valueString);
    prepareBSLDataJSON(isJSONString, valueString, obj, key);
    return obj;
  }, {});
  return sessionStorageObj;
};

const getBrowserCookieData = (excludedKeys = []) => {
  let cookie = {};
  document.cookie.split(';').forEach(function (el) {
    let [key, value] = el.split('=');
    if (!excludedKeys.includes(key.trim())) {
      let decryptedValue = '';
      let urlEncoded = true;
      try {
        // Handling encoded data
        decryptedValue = value ? atob(value.toString()) : '';
        urlEncoded = false;
      } catch (error) {
        // Not Base64, proceed to URL decoding
      }
      // Try to decode URL-encoded value
      try {
        if (urlEncoded) {
          decryptedValue = decodeURIComponent(value);
          urlEncoded = false;
        }
      } catch (e) {
        // Not URL-encoded, keep the value as-is
      }

      // Try to parse as JSON, return as string if parsing fails
      try {
        // Handling simple strings
        const isJSONString = isValidJSONString(decryptedValue);
        prepareBSLDataJSON(isJSONString, decryptedValue, cookie, key.trim());
      } catch (e) {
        // Handling simple strings
        decryptedValue = value;
        cookie[key.trim()] = decryptedValue;
      }
    }
  });
  return cookie;
};

const getBrowserStorageValuesForExternalAPI = async (
  finalSessionValue,
  externalAPIData,
  currentDataKey,
) => {
  const { bodyCustomJSON, bodyRawJSON, bodyCollectionMapping, setting } = externalAPIData;
  const { url, headers, params } = setting || {};
  let browserStorageData;
  switch (currentDataKey) {
    case 'LOCAL_STORAGE':
    case 'current_user':
      browserStorageData = getBrowserLocalStorageData();
      break;
    case 'COOKIES':
      browserStorageData = getBrowserCookieData();
      break;
    case 'INDEXED_DB':
      browserStorageData = await getIndexedDBData();
      break;
    default:
      browserStorageData = getBrowserSessionStorageData();
      break;
  }

  // Get Session Value to send from Custom Body
  if (bodyCustomJSON) {
    finalSessionValue = getSessionValueFromString(
      bodyCustomJSON,
      finalSessionValue,
      browserStorageData,
      currentDataKey,
    );
  }
  // Get Session Value to send from Raw Body
  if (bodyRawJSON) {
    finalSessionValue = getSessionValueFromString(
      bodyRawJSON,
      finalSessionValue,
      browserStorageData,
      currentDataKey,
    );
  }
  // Get Session Value for URL
  if (url) {
    finalSessionValue = getSessionValueFromString(
      url,
      finalSessionValue,
      browserStorageData,
      currentDataKey,
    );
  }
  // Get Session Value for Headers
  if (headers && Object.keys(headers).length > 0) {
    finalSessionValue = getSessionValueFromObject(
      headers,
      finalSessionValue,
      browserStorageData,
      currentDataKey,
    );
  }
  // Get Session Value for Params
  if (params && Object.keys(params).length > 0) {
    finalSessionValue = getSessionValueFromObject(
      params,
      finalSessionValue,
      browserStorageData,
      currentDataKey,
    );
  }
  // Get Session Value for Form-Data
  if (bodyCollectionMapping && Object.keys(bodyCollectionMapping).length > 0) {
    finalSessionValue = getSessionValueFromObject(
      bodyCollectionMapping,
      finalSessionValue,
      browserStorageData,
      currentDataKey,
    );
  }
  return finalSessionValue;
};

async function setDataInSessionStorageLocation(
  browserStorageLocation,
  dataSessionKey,
  data,
  isJSON = true,
) {
  const shouldStringify = browserStorageLocation !== 'INDEXED_DB';
  const dataInString = shouldStringify && isJSON ? JSON.stringify(data) : data;
  switch (browserStorageLocation) {
    case 'LOCAL_STORAGE':
      localStorage.setItem(dataSessionKey, dataInString);
      break;
    case 'COOKIES':
      setCookie(dataSessionKey, dataInString, 1, false, true);
      break;
    case 'INDEXED_DB':
      await setIndexedDBItem(dataSessionKey, data, false);
      break;
    default:
      sessionStorage.setItem(dataSessionKey, dataInString);
      break;
  }
}

async function removeBSLData(bslKeyValue, keysArray) {
  if (bslKeyValue) {
    switch (bslKeyValue) {
      case 'LOCAL_STORAGE':
        if (keysArray && keysArray.length) {
          keysArray.forEach((key) => {
            localStorage.removeItem(key);
          });
        }
        break;
      case 'COOKIES':
        if (keysArray && keysArray.length) {
          keysArray.forEach((key) => {
            removeCookie(key);
          });
        }
        break;
      case 'INDEXED_DB':
        await removeIndexedDBKeys(keysArray);
        break;
      default:
        if (keysArray && keysArray.length) {
          keysArray.forEach((key) => {
            sessionStorage.removeItem(key);
          });
        }
        break;
    }
  }
}

async function clearAllBSLData(bslKeyValue) {
  if (bslKeyValue) {
    switch (bslKeyValue) {
      case 'LOCAL_STORAGE':
        localStorage.clear();
        break;
      case 'COOKIES':
        removeAllCookies();
        break;
      case 'INDEXED_DB':
        await clearIndexedDB();
        break;
      default:
        sessionStorage.clear();
        break;
    }
  }
}

async function getBSLData(bslKeyValue) {
  let browserStorageData = '';
  if (bslKeyValue) {
    switch (bslKeyValue) {
      case 'LOCAL_STORAGE':
        browserStorageData = getBrowserLocalStorageData();
        break;
      case 'COOKIES':
        browserStorageData = getBrowserCookieData();
        break;
      case 'INDEXED_DB':
        browserStorageData = await getIndexedDBData();
        break;
      default:
        browserStorageData = getBrowserSessionStorageData();
        break;
    }
  }

  return browserStorageData;
}

async function getBrowserData() {
  const sessionStorageDataObj = getBrowserSessionStorageData();
  const localStorageDataObj = getBrowserLocalStorageData();
  const cookieDataObj = getBrowserCookieData();
  const indexedDbObj = await getIndexedDBData();

  return {
    sessionStorageData: sessionStorageDataObj,
    localStorageData: localStorageDataObj,
    cookiesData: cookieDataObj,
    indexedDB: indexedDbObj,
  };
}

function actionLog() {
  // Convert args to a normal array
  const args = Array.prototype.slice.call(arguments);
  // Prepend log prefix log string
  args.unshift(ACTION_LOG_PREFIX + ' '); // Unable to support specifier directives like %c, %s
  // Pass along arguments to console.log
  console.log.apply(console, args);
}

function logActionMessage(message, args, enableArgs) {
  if (message.trim()) {
    if (enableArgs) {
      // actionLog(message, args); // Unable to support specifier directives like %c, %s
      console.log(`${ACTION_LOG_PREFIX} ${message}`, args);
    } else {
      // actionLog(message); // Unable to support specifier directives like %c, %s
      console.log(`${ACTION_LOG_PREFIX} ${message}`);
    }
  }
}

function cleanConsoleLogArgs(argsString) {
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm;
  const cleanedArgs = argsString ? argsString.replace(scriptRegex, '') : '';
  return cleanedArgs ? cleanedArgs.trim() : '';
}

function initializeSelect2(select) {
  if (select && select.length > 0) {
    const selectOptions = { selectionCssClass: ':all:', width: 'resolve' };
    $(`#${select.id}`).select2(selectOptions).val('');
  }
}

const addFlatPickerToElement = (input, sourceDateFormat = '') => {
  let showTime = input.getAttribute('type') === 'datetime-local';
  const dateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
  const datenTime = getDateTimeFormat(dateFormat, showTime);
  let placeholder = input.getAttribute('placeholder');
  let isProcessed = input.getAttribute('isprocessed');
  let inputValue = $(input).val();
  let dateValue = '';
  if (sourceDateFormat) {
    const sourceDateTimeFormat = getDateTimeFormat(sourceDateFormat, showTime);
    const sourceDateValue = inputValue
      ? flatpickr.formatDate(new Date(inputValue), sourceDateTimeFormat)
      : '';
    dateValue = sourceDateValue ? flatpickr.formatDate(new Date(sourceDateValue), datenTime) : '';
  } else {
    dateValue = inputValue;
  }

  if (!isProcessed) {
    input.setAttribute('autocomplete', 'off');
    input.setAttribute(
      'placeholder',
      showTime ? `${placeholder} (YYYY-MM-DD HH:MM)` : `${placeholder}  ${dateFormat}`,
    );
    input.setAttribute('flat-picker-date-type', showTime ? 'datetime-local' : 'date');
  }

  input.flatpickr({
    enableTime: showTime,
    dateFormat: datenTime,
    time_24hr: true,
    minuteIncrement: 1,
    allowInput: true,
    defaultDate: dateValue,
    disableMobile: true, // For testing purpose
    onOpen: function (selectedDates, dateStr, instance) {
      $(instance.altInput).prop('readonly', true);
    },
    onClose: function (selectedDates, dateStr, instance) {
      $(instance.altInput).prop('readonly', false);
      $(instance.altInput).blur();
    },
  });
};

/**
 * Populates a dropdown field with options based on the type (day, month, year).
 */
function populateDropdownFields(
  fields,
  type,
  qntYears = SEGREGATED_DATE_QNT_YEARS,
  currentYear = CURRENT_YEAR,
) {
  fields.forEach((select) => {
    const removeFieldnameInDropdownPlaceholder =
      select && select.hasAttribute('removeFieldnameInDropdownPlaceholder');
    const hasPlaceholderPattern = select && select.hasAttribute('placeholderPattern');
    const placeholderPattern =
      select && hasPlaceholderPattern ? select.getAttribute('placeholderPattern') : '';
    const selectDataset = select.dataset;
    const fieldTitle = selectDataset['fieldTitle'] || '';
    let fieldPlaceholder = getFieldPlaceholder(fieldTitle, placeholderPattern);

    // Fallback to removeFieldnameInDropdownPlaceholder if placeholderPattern is not set
    if (removeFieldnameInDropdownPlaceholder) {
      fieldPlaceholder = 'Select';
    }

    let options = [`<option value="">- ${fieldPlaceholder} -</option>`];

    if (type === 'day') {
      for (let day = 1; day <= 31; day++) {
        options.push(`<option value="${day}">${day}</option>`);
      }
    } else if (type === 'month') {
      for (let m = 0; m < 12; m++) {
        options.push(`<option value="${m + 1}">${monthNames[m]}</option>`);
      }
    } else if (type === 'year') {
      for (let year = currentYear + qntYears; year >= SEGREGATED_DATE_BASE_YEAR; year--) {
        const isSelected = year === currentYear ? 'selected' : '';
        options.push(`<option value="${year}" ${isSelected}>${year}</option>`);
      }
    }

    select.innerHTML = options.join('');
    const value = select.getAttribute('data-date-segregated-value') || '';
    $(`#${select.id}`)
      .select2({ selectionCssClass: ':all:', width: 'resolve' })
      .val(value)
      .trigger('change');

    // Swapping Select & Select2 elements to fix Validation error message alignment.
    let selectElem = document.getElementById(select.id);
    if (selectElem) {
      let select2Elem = selectElem.nextSibling;
      swapNodeElements(selectElem, select2Elem);
      validateSelectElement(select);
    }
  });
}

function filteredBSLDataPayload(bslPayload, bslData) {
  const bslPayloadKeys = [];
  if (bslPayload && Array.isArray(bslPayload) && bslPayload.length) {
    // If bslPayload is provided, collect its keys
    bslPayload.forEach((bslpKey) => {
      switch (bslpKey) {
        case BSL_KEYS.SESSION_STORAGE.key:
          bslPayloadKeys.push(BSL_KEYS.SESSION_STORAGE.value);
          break;
        case BSL_KEYS.LOCAL_STORAGE.key:
          bslPayloadKeys.push(BSL_KEYS.LOCAL_STORAGE.value);
          break;
        case BSL_KEYS.COOKIES.key:
          bslPayloadKeys.push(BSL_KEYS.COOKIES.value);
          break;
        case BSL_KEYS.INDEXED_DB.key:
          bslPayloadKeys.push(BSL_KEYS.INDEXED_DB.value);
          break;
        default:
          break;
      }
    });
  }
  const filteredBSLData =
    bslData &&
    Object.keys(bslData).length &&
    Object.keys(bslData)
      .filter((key) => bslPayloadKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = bslData[key];
        return obj;
      }, {});
  return filteredBSLData;
}

/**
 * Returns the correct trigger element for action loader/spinner operations.
 */
function getActionTriggerElem(triggerElem) {
  if (!triggerElem) return null;
  switch (triggerElem.tagName) {
    case 'FORM':
    case 'SELECT':
    case 'DIV':
      return null;
    default:
      return triggerElem;
  }
}

function appendActionLoader(args, actionEnabled) {
  if (actionEnabled) {
    const { element, targetElement, actionLabel } = args;
    const excludeActionLabels = [
      'Run JavaScript Code',
      'Display Tooltip',
      'Create Dependent Dropdown',
    ];
    const isExcludedAction = actionLabel ? excludeActionLabels.includes(actionLabel.trim()) : false;
    if (actionLabel && !isExcludedAction) {
      let triggerElem = targetElement ? targetElement : element;
      triggerElem = getActionTriggerElem(triggerElem);
      appendLoaderToElement(triggerElem, false);
    }
  }
}

function removeActionLoader(triggerElem) {
  if (triggerElem && triggerElem.hasAttribute('show-action-loader')) {
    const triggerElemOrgContent = triggerElem.getAttribute('org-content') || '';

    // Remove the spinner <i> element if present
    let spinnerElem = triggerElem.querySelector('i.fa.fa-spinner.fa-spin');
    if (!spinnerElem) {
      // Remove the spinner <svg> element if present
      spinnerElem = triggerElem.querySelector('svg.fa-spinner.fa-spin');
    }
    if (spinnerElem) {
      spinnerElem.remove();
    }
    // Re-enable the button and restore its original content
    triggerElem.removeAttribute('show-action-loader');
    triggerElem.removeAttribute('action-start-time');
    triggerElem.removeAttribute('org-content');
    if (triggerElemOrgContent) {
      triggerElem.innerHTML = triggerElemOrgContent;
    }
    const triggerElemContent = triggerElem.innerHTML;
    triggerElem.innerHTML = `${triggerElemContent}`;
    return triggerElem;
  }
}

function actionCompleted(args) {
  const { element, targetElement, actionLabel } = args;
  let triggerElem = targetElement ? targetElement : element;
  triggerElem = getActionTriggerElem(triggerElem);
  removeLoaderFromElement(triggerElem, actionLabel, false);
}

function compressToBase64(obj) {
  if (obj === null || obj === undefined) return '';
  // Convert → Gzip
  const json = JSON.stringify(obj);
  console.log('🚀 ~ compressToBase64 ~ json:', json);
  const gzip = pako.gzip(json);

  // Convert → Base64
  const base64 = btoa(String.fromCharCode(...gzip));

  // Make it slash-free
  const b64 = base64.replace(/\//g, '_');
  return b64;
}

function decompressFromBase64(b64) {
  const restored = b64 ? b64.replace(/_/g, '/') : '';
  const binary = restored
    ? atob(restored)
        .split('')
        .map((c) => c.charCodeAt(0))
    : '';

  const decompressed = binary ? pako.ungzip(new Uint8Array(binary), { to: 'string' }) : '';

  return decompressed ? JSON.parse(decompressed) : null;
}

// Helper functions Ends

const displayCustomComponent = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { targetElement, parameters } = args;
    const { pageCustomComponentComponents, customComponent } = parameters;
    const customComponentElementId = pageCustomComponentComponents.split(':')[1];
    const customComponentElement = document.getElementById(customComponentElementId);
    const customComponentId = customComponent ? customComponent : '';
    const placeholderItem = createContentPlaceholder(
      1,
      customComponentElementId,
      customComponentElement.className,
    );
    customComponentElement.innerHTML = placeholderItem;
    if (customComponentId) {
      const endpoint = `custom-component/${customComponentId}`;
      try {
        const response = await publicGetCall(endpoint);
        if (response && response.status === 200 && response.data) {
          await renderCustomComponentIntoElem(response.data, customComponentElement, targetElement);
        }
      } catch (e) {
        console.error('Error: ', e);
      } finally {
        actionCompleted(args);
      }
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const renderCustomComponentIntoElem = async (
  customComponent,
  customComponentElement,
  targetElement,
) => {
  const {
    content: { htmlContent, customCSS, customJS },
    customCssCdns,
    customJsCdns,
    collectionName,
  } = customComponent;
  const collectionItem = await getComponentItem(
    customComponentElement,
    targetElement,
    collectionName,
  );
  const user = fetchLoggedInUserJson();
  let collectionConstants = [];
  let utilities = [];
  const { constants: projectConstant, environments } = await getProjectDetail();
  if (collectionName) {
    const collectionDetails = await getCollectionDetails(collectionName);
    collectionConstants = collectionDetails?.constants || [];
    utilities = collectionDetails?.utilities || [];
  }
  const userDetails = await getCollectionDetails('user');
  const { constants: userCollectionConstants, utilities: userUtilities } = userDetails;
  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
  let previousActionFormData = sessionStorage.getItem('previousActionFormData');
  previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
  const componentDataObj = {
    collectionItem,
    projectConstant,
    environments,
    collectionConstants,
    utilities,
    previousActionResponse,
    previousActionFormData,
    user,
    userCollectionConstants,
    userUtilities,
  };
  const customComponentHtml = replaceNbsps(htmlContent);
  customComponentElement.innerHTML = '';
  let scriptUrlArr = [];
  if (customCssCdns && customCssCdns.length) {
    customCssCdns.forEach((CssCdn) => {
      if (CssCdn.urlOrTag.startsWith('<link')) {
        customComponentElement.innerHTML += CssCdn.urlOrTag;
      } else if (CssCdn.urlOrTag.startsWith('http') || CssCdn.urlOrTag.startsWith('ftp')) {
        customComponentElement.innerHTML += `<link rel="stylesheet" href='${CssCdn.urlOrTag}' crossorigin/>`;
      }
    });
  }
  if (customJsCdns && customJsCdns.length) {
    customJsCdns.forEach((JsCdn) => {
      if (JsCdn.urlOrTag.startsWith('<script')) {
        const regex = /<script.*?src="(.*?)"/gim;
        const url = regex.exec(JsCdn.urlOrTag)[1];
        if (url.startsWith('http') || url.startsWith('https')) {
          scriptUrlArr.push(url);
        } else {
          const script = createScriptFromUrl(url);
          customComponentElement.appendChild(script);
        }
      } else if (JsCdn.urlOrTag.startsWith('http') || JsCdn.urlOrTag.startsWith('ftp')) {
        scriptUrlArr.push(JsCdn.urlOrTag);
      }
    });
  }
  if (scriptUrlArr && scriptUrlArr.length) {
    Promise.all(scriptUrlArr.map((u) => fetch(u)))
      .then((responses) => Promise.all(responses.map((res) => res.text())))
      .then((texts) => {
        texts.forEach((text) => {
          const script = createScriptFromText(text);
          customComponentElement.appendChild(script);
        });
        addComponentToElem(
          customCSS,
          customComponentHtml,
          customJS,
          customComponentElement,
          componentDataObj,
        );
      });
  } else
    addComponentToElem(
      customCSS,
      customComponentHtml,
      customJS,
      customComponentElement,
      componentDataObj,
    );
};

const createScriptFromUrl = (url) => {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  script.setAttribute('async', true);
  script.setAttribute('defer', true);
  return script;
};

const createScriptFromText = (text) => {
  const script = document.createElement('script');
  const inlineCode = document.createTextNode(text);
  script.appendChild(inlineCode);
  return script;
};

const addComponentToElem = (
  customCSS,
  customComponentHtml,
  customJS,
  element,
  componentDataObj,
) => {
  let { jsStr, htmlStr } = replaceFuncAndVarName(customJS, customComponentHtml);
  htmlStr = replaceComponentDynamicValues(htmlStr, componentDataObj);
  jsStr = replaceComponentDynamicValues(jsStr, componentDataObj);
  if (customCSS) element.innerHTML += `<style>${customCSS}</style>`;
  const dcMetaExists = document.getElementById('dcmeta') !== null;
  if (htmlStr) {
    element.innerHTML += htmlStr;
    const content = {};
    content['nocode-html'] = htmlStr;
    if (!dcMetaExists) {
      addEventsScriptForSnippet(content, element);
    }
  }
  if (jsStr) {
    const script = createScriptFromText(jsStr);
    element.appendChild(script);
    const content = {};
    content['nocode-html'] = jsStr;
    if (!dcMetaExists) {
      addEventsScriptForSnippet(content, element);
    }
  }
};

const getComponentItem = async (customComponentElement, targetElement, componentCollection) => {
  const collectionItem = {
    collectionId: '',
    collectionItemId: '',
    itemData: {},
    pageCollectionItem: {},
  };
  const pageItem = await getPageItemData();
  collectionItem.pageCollectionItem = pageItem?.itemData || {};
  if (componentCollection) {
    const pageCollection = customComponentElement.getAttribute('get-page-collection');
    if (pageCollection) {
      const pathArray = window.location.pathname.split('/');
      const pageCollectionName = pathArray[pathArray.length - 2];
      if (pageCollectionName && pageCollectionName !== componentCollection) {
        console.error(
          "\n The collection linked to the custom component does not match the page's collection.",
        );
        return collectionItem;
      }
      collectionItem.itemData = pageItem?.itemData || {};
      collectionItem.collectionId = pageItem?.collectionId || '';
      collectionItem.collectionItemId = pageItem?.collectionItemId || '';
    } else if (targetElement) {
      let element = targetElement;
      let elementCollectionId = element ? element.getAttribute('data-collection-id') : '';
      const elementItemId = element ? element.getAttribute('data-item-id') : '';
      if (elementCollectionId) {
        const collectionItemData = { collectionId: elementCollectionId, itemId: elementItemId };
        if (elementCollectionId !== componentCollection) {
          console.error(
            "\n The collection linked to the custom component does not match the items' collection.",
          );
          return collectionItem;
        }
        const componentItem = await getModalItemData(collectionItemData, false);
        collectionItem.itemData = componentItem?.itemData || {};
        collectionItem.collectionId = componentItem?.collectionId || '';
        collectionItem.collectionItemId = componentItem?.collectionItemId || '';
      }
    }
  }
  return collectionItem;
};

const replaceComponentDynamicValues = (content, componentDataObj) => {
  const {
    collectionItem,
    projectConstant,
    environments,
    collectionConstants,
    utilities,
    previousActionResponse,
    previousActionFormData,
    user,
    userCollectionConstants,
    userUtilities,
  } = componentDataObj;
  const { itemData, pageCollectionItem } = collectionItem;
  content = content.replaceAll('https://{{APPLICATION_URL}}/', SERVER_URL);
  content = replaceFieldsValueIntoExpression(
    content,
    itemData,
    user,
    projectConstant,
    environments,
    collectionConstants,
    previousActionResponse,
    previousActionFormData,
    utilities,
    userCollectionConstants,
    userUtilities,
    pageCollectionItem,
  );
  return content;
};

const replaceFuncAndVarName = (customJS, customHtml) => {
  const neddleArr = getAllFuncAndVarNameFromStr(customJS);
  neddleArr.forEach((neddle) => {
    const newFuncName = neddle + new Date().valueOf();
    customJS = customJS.replaceAll(neddle, newFuncName);
    customHtml = customHtml.replaceAll(neddle, newFuncName);
  });
  return { jsStr: customJS, htmlStr: customHtml };
};

const getAllFuncAndVarNameFromStr = (str) => {
  const funRegex = /function\s+(\w+)\s*\(/g;
  const asyncFunRegex = /async\s+function\s+(\w+)\s*\(/g;
  const arrFunRegex = /(\w+)\s*=\s*\(.*\)\s*=>/g;
  const variableRegex = /\b(?:const|let|var)\s+(\w+)\b/g;

  const functionNames = getRegexValueFromStr(funRegex, str);
  const arrowFunctionNames = getRegexValueFromStr(arrFunRegex, str);
  const asyncFunctionNames = getRegexValueFromStr(asyncFunRegex, str);
  const variableNames = getRegexValueFromStr(variableRegex, str);

  return [
    ...new Set([...functionNames, ...arrowFunctionNames, ...asyncFunctionNames, ...variableNames]),
  ];
};

const getRegexValueFromStr = (regex, str) => {
  const functionNames = [];
  let match;
  while ((match = regex.exec(str)) !== null) {
    const functionName = match[1];
    functionNames.push(functionName);
  }
  return functionNames;
};

const generatePdfFromSnippet = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { targetElement, parameters } = args;
    const {
      pdfTemplate,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      printBackground,
      format,
      saveToCollection,
      collection,
      collectionField,
      landscape,
      displayHeader,
      displayFooter,
      headerTemplate,
      footerTemplate,
      generatePDFName,
      pdfNameField,
    } = parameters;
    const projectId = localStorage.getItem('projectId');
    const lang = localStorage.getItem('lang');
    const pdfTemplateId = pdfTemplate ? pdfTemplate : '';
    if (pdfTemplateId) {
      const endpoint = `projects/${projectId}/pdf-templates/${pdfTemplateId}/download/${
        lang ? '?' + lang : ''
      }`;
      const pdfDownloadOptions = {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        printBackground: printBackground || false,
        format,
        landscape,
        displayHeader,
        displayFooter,
        headerTemplate,
        footerTemplate,
        generatePDFName,
        pdfNameField,
      };
      return await PDFfromTemplate(
        args,
        targetElement,
        endpoint,
        pdfDownloadOptions,
        saveToCollection,
        collection,
        collectionField,
      );
    }
  } else {
    return disabledActionResponse(args);
  }
};

const generatePdfFromSection = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { targetElement, parameters } = args;
    let {
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      format,
      showComponents,
      source,
      saveToCollection,
      collection,
      collectionField,
      landscape,
    } = parameters;

    let element = targetElement;
    let collectionName = element ? element.getAttribute('data-collection-id') : '';
    //Handling for Modal
    if (!collectionName) {
      let parentElem = element ? element.closest('[data-collection-id]') : '';
      if (parentElem) {
        collectionName = parentElem ? parentElem.getAttribute('data-collection-id') : '';
      }
    }
    const itemId = element ? element.getAttribute('data-item-id') : '';

    let showComponentElement = '';
    if (showComponents) {
      let showComponentsId = showComponents.split(':')[1];
      const component = document.getElementById(showComponentsId);
      showComponentElement = component.cloneNode(true);
    } else if (source === 'MODAL') {
      const modal = element.closest('[id^=modal-container-]');
      const modalBody = modal.querySelector('.modal-body');
      showComponentElement = modalBody.cloneNode(true);
    } else if (source === 'SUB_PAGE') {
      const subpageElem = element.closest('[data-subpage-id]');
      showComponentElement = subpageElem.cloneNode(true);
    } else if (source === 'PAGE') {
      const bodyClone = document.body.cloneNode(true);
      const scriptAndIframeTags = bodyClone.querySelectorAll('script, iframe');
      scriptAndIframeTags.forEach((script) => script.remove());
      showComponentElement = bodyClone;
    }

    marginTop = marginTop || 0;
    marginLeft = marginLeft || 0;
    marginBottom = marginBottom || 0;
    marginRight = marginRight || 0;
    const margin = [marginTop, marginLeft, marginBottom, marginRight]; // Margin in cm

    let filename = `${collectionName}_${itemId}`;
    if (!collectionName && !itemId) filename = window.location.pathname.split('/')[1];

    format = format || 'A4:21.0:29.7';
    const [formatType, width, height] = format.split(':');
    try {
      showComponentElement.style.maxWidth = `${width}cm`;
      showComponentElement.style.margin = '0 auto';
      showComponentElement.style.width = `${width}cm`;

      const wrapper = document.createElement('div');
      wrapper.style.maxWidth = `${width}cm`;

      wrapper.appendChild(showComponentElement);
      await addImagesForPDFUsingProxy(wrapper);
      // Style for page break
      let style = document.createElement('style');
      style.innerHTML = ` h1, h2, h3, p, img, table {
        break-inside: avoid;
        page-break-inside: avoid; /* Ensure compatibility */
      }
      .page-break {
        page-break-before: always;
      }
      div, section {
        break-inside: avoid;
      }`;
      wrapper.appendChild(style);

      if (saveToCollection) {
        const pdfBuffer = await html2pdf().from(wrapper).toPdf().outputPdf('arraybuffer');
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        filename += '.pdf';
        const formData = new FormData();
        formData.append('file', pdfBlob, filename);
        try {
          const fileUploadEndpoint = `file/upload/${collection}/${collectionField}`;
          const fileUploadResponse = await unSecuredPostCall(formData, fileUploadEndpoint);
          if (fileUploadResponse.status === 200 && fileUploadResponse.data) {
            const endpoint = `open/collection-form/${collection}/items/${itemId}`;
            const itemData = {
              [collectionField]: fileUploadResponse.data,
            };
            const response = await unSecuredPutCall(itemData, endpoint);
            if (response.status === 201 || response.status === 200) {
              toastr.success('PDF successfully saved to collection.', 'Success');
              return response;
            } else {
              console.error('Failed to save PDF metadata to collection.');
            }
          } else {
            console.error('Failed to upload PDF:', response.data);
          }
        } catch (uploadError) {
          console.error('Error saving PDF to collection:', uploadError.message);
          toastr.error('Failed to save PDF to collection.', 'Error');
          return uploadError;
        }
      } else {
        html2pdf()
          .from(wrapper)
          .set({
            margin,
            filename,
            html2canvas: { scale: 2, scrollX: 0, scrollY: 0, useCORS: true },
            jsPDF: {
              unit: 'cm',
              format: [width, height],
              orientation: landscape ? 'landscape' : 'portrait',
              autoPaging: 'text',
            },
          })
          .save();
      }
    } catch (e) {
      console.error('Error: ', e);
    } finally {
      actionCompleted(args);
    }
  } else {
    return disabledActionResponse(args);
  }
};

const generatePdfFromAgreementTemplate = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { targetElement, parameters } = args;
    const {
      agreementTemplate,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      format,
      saveToCollection,
      collection,
      collectionField,
    } = parameters;
    const projectId = localStorage.getItem('projectId');
    const agreementTemplateId = agreementTemplate ? agreementTemplate : '';

    if (agreementTemplateId) {
      const endpoint = `projects/${projectId}/agreement-templates/${agreementTemplateId}/download`;
      const pdfDownloadOptions = {
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        format,
      };
      return await PDFfromTemplate(
        args,
        targetElement,
        endpoint,
        pdfDownloadOptions,
        saveToCollection,
        collection,
        collectionField,
      );
    }
  } else {
    return disabledActionResponse(args);
  }
};

const PDFfromTemplate = async (
  args,
  element,
  endpoint,
  pdfDownloadOptions,
  saveToCollection = false,
  collection = '',
  collectionField = '',
) => {
  let collectionName = element ? element.getAttribute('data-collection-id') : '';
  if (!collectionName) {
    let parentElem = element ? element.closest('[data-collection-id]') : '';
    if (parentElem) {
      collectionName = parentElem ? parentElem.getAttribute('data-collection-id') : '';
    }
  }
  const itemId = element ? element.getAttribute('data-item-id') : '';

  try {
    let response;
    if (saveToCollection) {
      response = await unSecuredPostCall(
        {
          collectionName,
          itemId,
          pdfDownloadOptions,
          collection,
          collectionField,
          saveToCollection,
        },
        endpoint,
      );
      if (response.status === 200) {
        toastr.success('PDF successfully saved to collection.', 'Success');
      } else {
        toastr.error('Failed to save PDF to collection.', 'Error');
      }
    } else {
      response = await downloadFile(endpoint, {
        collectionName,
        itemId,
        pdfDownloadOptions,
      });
    }
    return response;
  } catch (e) {
    console.error('Error: ', e);
  } finally {
    actionCompleted(args);
  }
};

const generatePDFWithBrowserAPI = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });

    const { targetElement, parameters } = args;
    let { source, showComponents } = parameters;

    let element = targetElement;
    let collectionName = element ? element.getAttribute('data-collection-id') : '';
    //Handling for Modal
    if (!collectionName) {
      let parentElem = element ? element.closest('[data-collection-id]') : '';
      if (parentElem) {
        collectionName = parentElem ? parentElem.getAttribute('data-collection-id') : '';
      }
    }
    const itemId = element ? element.getAttribute('data-item-id') : '';

    let showComponentElement = '';
    if (showComponents) {
      let showComponentsId = showComponents.split(':')[1];
      const component = document.getElementById(showComponentsId);
      showComponentElement = component.cloneNode(true);
    } else if (source === 'MODAL') {
      const modal = element.closest('[id^=modal-container-]');
      const modalBody = modal.querySelector('.modal-body');
      showComponentElement = modalBody.cloneNode(true);
    } else if (source === 'SUB_PAGE') {
      const subpageElem = element.closest('[data-subpage-id]');
      showComponentElement = subpageElem.cloneNode(true);
    } else if (source === 'PAGE') {
      const bodyClone = document.body.cloneNode(true);
      const scriptAndIframeTags = bodyClone.querySelectorAll('script, iframe');
      scriptAndIframeTags.forEach((script) => script.remove());
      showComponentElement = bodyClone;
    }

    let filename = `${collectionName}_${itemId}`;
    if (!collectionName && !itemId) filename = window.location.pathname.split('/')[1];

    try {
      const wrapper = document.createElement('div');
      wrapper.id = 'print-wrapper';

      wrapper.appendChild(showComponentElement);
      await addImagesForPDFUsingProxy(wrapper);
      printWrapperElement(wrapper);
    } catch (e) {
      console.error('Error: ', e);
    } finally {
      actionCompleted(args);
    }
  } else {
    return disabledActionResponse(args);
  }
};

const printWrapperElement = (wrapper) => {
  if (!wrapper) {
    console.error('Print Component is missing');
    return;
  }

  const printStyle = document.createElement('style');
  printStyle.id = 'dynamic-print-style';

  printStyle.innerHTML = `
    @media print {
      body * {
        visibility: hidden !important;
      }
      #print-wrapper, #print-wrapper * {
        visibility: visible !important;
      }
      #print-wrapper {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
      }
    }

    @page {
      margin: 0;
    }

    h1, h2, h3, p, img, table {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    div, section {
      break-inside: avoid;
    }
    .page-break {
      page-break-before: always;
    }
  `;

  document.head.appendChild(printStyle);

  document.body.appendChild(wrapper);

  setTimeout(() => {
    window.print();
    wrapper.remove();
    printStyle.remove();
  }, 150);
};

const fetchImagesAsBase64 = async (imageUrls) => {
  const response = await fetch('/proxy-images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrls }),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch images');
  }
  return response.json();
};

const addImagesForPDFUsingProxy = async (element) => {
  const images = element.querySelectorAll('img');
  const imageUrls = Array.from(images).map((img) => img.src);

  const base64Images = await fetchImagesAsBase64(imageUrls);
  base64Images.forEach(({ url, base64 }) => {
    const img = Array.from(images).find((img) => img.src === url);
    if (img) {
      img.src = base64;
    }
  });
};

const pdfToText = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const {
      collection,
      fieldForPdf,
      fieldForText,
      successMessage,
      errorMessage,
      sendItemIdFrom,
      bslCollection,
      browserStorageLocation,
      itemIdBSLKey,
    } = parameters || {};
    const previousResponse = args.response;
    let response = {};
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    const parsedJson = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    let finalItemId = '';

    // Handle modern strategy-based routing
    if (sendItemIdFrom) {
      switch (sendItemIdFrom) {
        case URL_STRATEGIES.CURRENT_OBJECT: {
          const { collectionName, itemId, error } = handleCurrentObjectUrl(previousResponse);
          if (error) return { error };
          if (collectionName && itemId) {
            finalItemId = itemId;
          }
          break;
        }

        case URL_STRATEGIES.PREVIOUS_STEP: {
          const { collectionName, itemId } = handlePreviousStepUrl(
            previousResponse,
            targetElement,
            true,
          );
          if (collectionName && itemId) {
            finalItemId = itemId;
          }
          break;
        }

        case URL_STRATEGIES.CURRENT_PAGE: {
          let { collectionItemId, collectionId } = extractCollectionAndItemIdFromPath();
          if (collectionId && collectionItemId) {
            finalItemId = collectionItemId;
          }
          break;
        }

        case URL_STRATEGIES.CURRENT_USER: {
          const currentUser = fetchLoggedInUserJson();
          if (currentUser?.uuid) {
            finalItemId = currentUser.uuid;
          }
          break;
        }

        case URL_STRATEGIES.TARGET_ITEM: {
          const collectionName = targetElement?.getAttribute('data-collection-id');
          const itemId = targetElement?.getAttribute('data-item-id');
          if (collectionName && itemId) {
            finalItemId = itemId;
          }
          break;
        }
        case URL_STRATEGIES.BSL_ITEM: {
          const browserStorageData = await getBSLData(browserStorageLocation);
          const bslDataValue =
            browserStorageData && itemIdBSLKey
              ? _.get(browserStorageData, itemIdBSLKey.trim())
              : '';
          if (bslCollection && bslDataValue) {
            finalItemId = bslDataValue;
          }
          break;
        }
      }
    } else {
      // Handle legacy parameters when there is response data
      finalItemId = targetElement.getAttribute('data-item-id');
      if (
        typeof finalItemId === 'undefined' ||
        ['', 'undefined', 'null', undefined, null].includes(finalItemId)
      ) {
        finalItemId = '';
      }
      if (!finalItemId && previousResponse) {
        const { collectionSaveOrUpdateResponse } = previousResponse;
        if (collectionSaveOrUpdateResponse) {
          const { data: collectionItemData } = collectionSaveOrUpdateResponse;
          finalItemId = collectionItemData.uuid;
        }
      }
      const dynamicKey = Object.keys(parsedJson)[0];
      if (!finalItemId && dynamicKey) {
        const { [dynamicKey]: collectionValue } = parsedJson;
        finalItemId = collectionValue.uuid;
      }
    }

    try {
      const endpoint = `open/collection-form/${collection}/items/${finalItemId}/pdf-text/${fieldForPdf}/${fieldForText}`;
      const result = await unSecuredPostCall({}, endpoint);
      if (result.status === 'success')
        toastr.success(successMessage || 'Set Text in Field', 'Success');
      response.data = { ...previousResponse, ...result };
      response.data.collectionSaveOrUpdateResponse = result;
      response.data.pdfTotext = result;
      response.status = 'success';
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
        toastr.error(errorMessage || `Cannot Set Pdf's text now., Error `);
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const amazonTextract = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    const previousResponse = args.response;
    let response = {};
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    const parsedJson = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    let itemId = args.targetElement.getAttribute('data-item-id');
    if (!itemId && previousResponse) {
      const { collectionSaveOrUpdateResponse } = previousResponse;
      if (collectionSaveOrUpdateResponse) {
        const { data: collectionItemData } = collectionSaveOrUpdateResponse;
        itemId = collectionItemData.uuid;
      }
    }
    const dynamicKey = Object.keys(parsedJson)[0];
    if (!itemId && dynamicKey) {
      const { [dynamicKey]: collectionValue } = parsedJson;
      itemId = collectionValue.uuid;
    }
    const { collection, fieldForDocument, fieldForText, successMessage, errorMessage } = parameters;
    try {
      const endpoint = `ocr-to-text/${collection}/items/${itemId}/ocr-text/${fieldForDocument}/${fieldForText}`;
      const result = await unSecuredPostCall({}, endpoint);
      if (result.status === 200) toastr.success(successMessage || 'Set Text in Field', 'Success');
      response.data = { ...previousResponse, ...result };
      response.data.collectionSaveOrUpdateResponse = result;
      response.data.amazonTextract = result;
      response.status = 'success';
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
        toastr.error(errorMessage || `Cannot Set Pdf's text now., Error `);
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const referenceDropDownOnChange = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters } = args;
    const { collection, mapping } = parameters;
    if (collection && mapping.length) {
      mapping.forEach(async (obj) => {
        const { key, value, type, refField } = obj;
        const finalValue = await getValueFromDropdown(
          element.value,
          collection,
          key,
          type,
          refField,
        );
        const [elementType, id] = value.split(':');
        const elem = document.getElementById(id);
        if (finalValue && elem) setValueInElement(elem, elementType, finalValue);
      });
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const setValueInElement = (element, elementType, value) => {
  if (['input', 'select'].includes(elementType)) {
    insertFormElementValue(value, element);
  } else if (elementType === 'textarea' && element.hasAttribute('data-show-editor')) {
    element.summernote('reset');
  } else {
    element.innerHTML = value;
  }
};

const getValueFromDropdown = async (
  elementValue,
  collectionName,
  collectionField,
  collectionFieldType,
  refField,
) => {
  let finalValue = '';
  if (elementValue) {
    const collectionItemData = await getCollectionItemById(collectionName, elementValue);
    finalValue = parseValueFromData(collectionItemData, collectionField);
    if (collectionFieldType === 'reference') {
      finalValue = parseValueFromData(finalValue, refField);
    }
  }
  return finalValue;
};

const createFormForPermission = async (projectId, element) => {
  const formElement = element.querySelector('.form-container');
  const attr = element.attributes;
  let attrKeys = Object.values(attr);
  attrKeys = attrKeys.filter(
    (key) => key.name.includes('permission-') && key.name !== 'load-permission-from',
  );

  let inputElement = ``;
  let permissions = [];
  const loadPermissionFrom = attr['load-permission-from'].value;
  permissions = await getPermissionsItemData(
    attr,
    loadPermissionFrom,
    permissions,
    'permissions',
    formElement,
  );
  attrKeys.forEach((attrKey) => {
    const permVal = attrKey.value;
    const divElem = document.createElement('div');
    divElem.setAttribute('class', 'form-group col-12 col-md-12 d-flex flex-column');

    const inputElem = document.createElement('input');
    inputElem.setAttribute('class', 'form-check-input dc-checkbox');
    inputElem.setAttribute('id', permVal);
    inputElem.setAttribute('value', permVal);
    inputElem.setAttribute('type', 'checkbox');
    inputElem.setAttribute('name', permVal);
    if (permissions && permissions.includes(permVal)) {
      inputElem.setAttribute('checked', true);
    }

    divElem.appendChild(inputElem);

    const labelElem = document.createElement('label');
    labelElem.setAttribute('class', 'form-check-label');
    labelElem.setAttribute('for', permVal);
    labelElem.innerText = permVal;

    divElem.appendChild(labelElem);
    formElement.appendChild(divElem);
  });

  const btnDivElem = document.createElement('div');
  btnDivElem.setAttribute('class', 'form-group p-t-10 no-border-bottom col-12 col-md-12');

  const btnElem = document.createElement('button');
  btnElem.setAttribute('class', 'btn btn-primary');
  btnElem.setAttribute('type', 'submit');
  btnElem.innerText = 'Update Permission';
  btnDivElem.appendChild(btnElem);

  formElement.appendChild(btnDivElem);
};

const getPermissionsItemData = async (
  attr,
  loadPermissionFrom,
  fieldData,
  fieldName = 'permissions',
  element = '',
) => {
  let pageCollection,
    tenantCollection,
    userSettingCollection = '';
  pageCollection = attr['page-collection'];
  pageCollection = pageCollection ? pageCollection?.value : '';
  if (pageCollection && pageCollection === 'true') {
    tenantCollection = attr['tenant-collection'];
    userSettingCollection = attr['user-setting-collection'];
    tenantCollection = tenantCollection ? tenantCollection?.value : '';
    userSettingCollection = userSettingCollection ? userSettingCollection?.value : '';
    const { itemData, collectionId } = await getItemDataForElement(element);
    if (loadPermissionFrom === 'tenant') {
      fieldData = collectionId === tenantCollection ? itemData[fieldName] : [];
    } else if (loadPermissionFrom === 'user') {
      fieldData = collectionId === 'user' ? itemData[fieldName] : [];
    } else if (loadPermissionFrom === 'user-settings') {
      fieldData = collectionId === userSettingCollection ? itemData[fieldName] : [];
    } else fieldData = [];
  } else {
    if (loadPermissionFrom === 'tenant') {
      const tenantItem = fetchCurrentTenantJson();
      fieldData = tenantItem[fieldName];
    } else if (loadPermissionFrom === 'user') {
      const user = fetchLoggedInUserJson();
      fieldData = user[fieldName];
    } else if (loadPermissionFrom === 'user-settings') {
      const userSettings = fetchCurrentUserSettingsJson();
      fieldData = userSettings[fieldName];
    } else if (loadPermissionFrom === 'sub-tenant') {
      const subTenant = fetchCurrentSubTenantJson();
      fieldData = subTenant[fieldName];
    } else {
      fieldData = [];
    }
  }
  return fieldData;
};

const changePermissionInTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let response = {};
    let apiCallResult;
    try {
      let form = args.element;
      const attr = form.attributes;
      const loadPermissionFrom = attr['load-permission-from'].value;
      let pageCollection = '';
      pageCollection = attr['page-collection'];
      pageCollection = pageCollection ? pageCollection?.value : '';
      let uuid = '';
      uuid = await getPermissionsItemData(attr, loadPermissionFrom, uuid, 'uuid', form);
      const formData = await serializeFormData(form.elements);
      apiCallResult = await securedPostCall(formData, `auth/tenant/${uuid}/permissions`);
      const { data } = apiCallResult;
      if (pageCollection !== 'true') {
        setJsonInLocalStorage('tenant', data);
      }
      response.data = apiCallResult;
      response.status = 'success';
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};
const changePermissionInUser = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let response = {};
    let apiCallResult;
    try {
      let form = args.element;
      const attr = form.attributes;
      const loadPermissionFrom = attr['load-permission-from'].value;
      let pageCollection = '';
      pageCollection = attr['page-collection'];
      pageCollection = pageCollection ? pageCollection?.value : '';
      let uuid = '';
      uuid = await getPermissionsItemData(attr, loadPermissionFrom, uuid, 'uuid', form);
      const formData = await serializeFormData(form.elements);
      apiCallResult = await securedPostCall(formData, `auth/user/${uuid}/permissions`);
      const { data } = apiCallResult;
      if (pageCollection !== 'true') {
        setJsonInLocalStorage('user', data);
      }
      response.data = apiCallResult;
      response.status = 'success';
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};
const changePermissionInUserSettings = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    let response = {};
    let apiCallResult;
    try {
      let form = args.element;
      const attr = form.attributes;
      const loadPermissionFrom = attr['load-permission-from'].value;
      let pageCollection = '';
      pageCollection = attr['page-collection'];
      pageCollection = pageCollection ? pageCollection?.value : '';
      let uuid = '';
      uuid = await getPermissionsItemData(attr, loadPermissionFrom, uuid, 'uuid', form);
      const formData = await serializeFormData(form.elements);
      apiCallResult = await securedPostCall(formData, `auth/user-settings/${uuid}/permissions`);
      const { data } = apiCallResult;
      if (pageCollection !== 'true') {
        setJsonInLocalStorage('userSetting', data);
        await resetCurrentUserInLocalStorage();
      }
      response.data = apiCallResult;
      response.status = 'success';
    } catch (error) {
      if (error.response) {
        response.data = error.response;
        response.status = 'error';
      }
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const displayToolTip = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { element, parameters } = args;
    const {
      toolTip,
      placement,
      theme,
      animation,
      interactive,
      followCursor,
      showDelay,
      hideDelay,
      maxWidth,
    } = parameters;
    const attributes = element.attributes;
    if (attributes['tooltip-active']) return '';
    const content = await getToolTipContent(element, toolTip);
    const extraStyle = [];
    const toolTipOptions = {
      allowHTML: true,
      showOnCreate: true,
      content,
      maxWidth: maxWidth ? maxWidth : 'none',
    };
    if (attributes['onclick']) toolTipOptions['trigger'] = 'click';
    if (placement) toolTipOptions['placement'] = placement;
    if (interactive) toolTipOptions['interactive'] = interactive;
    if (followCursor) toolTipOptions['followCursor'] = followCursor;
    if (showDelay || hideDelay) {
      let show = showDelay ? showDelay : null;
      let hide = hideDelay ? hideDelay : null;
      toolTipOptions['delay'] = [show, hide];
    }
    if (theme) {
      toolTipOptions['theme'] = theme;
      const query = document.body.querySelectorAll(`[id^='tippy-${theme}']`);
      if (!query.length) {
        extraStyle.push({ link: `https://unpkg.com/tippy.js@6/themes/${theme}.css`, id: theme });
      }
    }
    if (animation) {
      toolTipOptions['animation'] = animation;
      const query = document.body.querySelectorAll(`[id^='tippy-${theme}']`);
      if (!query.length) {
        extraStyle.push({
          link: `https://unpkg.com/tippy.js@6/animations/${animation}.css`,
          id: animation,
        });
      }
    }
    Promise.all(extraStyle.map((style) => fetch(style.link)))
      .then((responses) => Promise.all(responses.map((res) => res.text())))
      .then((texts) => {
        texts.forEach((text, index) => {
          const link = document.createElement('style');
          link.innerHTML = text;
          link.setAttribute('rel', 'stylesheet');
          link.setAttribute('id', `tippy-${extraStyle[index].id}`);
          element.appendChild(link);
        });
      });
    tippy(element, {
      ...toolTipOptions,
      onShow() {
        element.setAttribute('tooltip-active', true);
      },
      onHidden(instance) {
        element.removeAttribute('tooltip-active');
        instance.destroy();
      },
    });
  } else {
    return disabledActionResponse(args);
  }
};

const getToolTipContent = async (element, toolTipId) => {
  let content = '';
  if (toolTipId) {
    const toolTipData = await getToolTipComponent(toolTipId);
    let itemData = element.getAttribute('data-item');
    itemData = itemData ? JSON.parse(itemData) : '';
    let collectionName = element.getAttribute('data-collection-id');
    collectionName = collectionName ? collectionName : '';
    if (element.tagName === 'svg') {
      collectionName = element.parentElement.getAttribute('data-collection-id');
      itemData = element.parentElement.getAttribute('data-item');
      itemData = itemData ? JSON.parse(itemData) : '';
    }
    const user = fetchLoggedInUserJson();
    let collectionConstants = [];
    let utilities = [];
    const { constants: projectConstant, environments } = await getProjectDetail();
    if (collectionName) {
      const collectionDetails = await getCollectionDetails(collectionName);
      collectionConstants = collectionDetails?.constants || [];
      utilities = collectionDetails?.utilities || [];
    }
    const userDetails = await getCollectionDetails('user');
    const { constants: userCollectionConstants, utilities: userUtilities } = userDetails;
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    content = replaceFieldsValueIntoExpression(
      toolTipData.content,
      itemData,
      user,
      projectConstant,
      environments,
      collectionConstants,
      previousActionResponse,
      previousActionFormData,
      utilities,
      userCollectionConstants,
      userUtilities,
      {},
    );
  }
  return content;
};

const getToolTipComponent = async (toolTipId) => {
  let toolTipData = {};
  const toolTipSessionKey = `__DT_tooltip:${toolTipId}`;
  if (toolTipId) {
    toolTipData = sessionStorage.getItem(toolTipSessionKey);
    toolTipData = toolTipData ? JSON.parse(toolTipData) : '';
    if (!toolTipData) {
      const endpoint = `projects/template/${toolTipId}`;
      try {
        const response = await publicGetCall(endpoint);
        toolTipData = response.data;
        sessionStorage.setItem(toolTipSessionKey, JSON.stringify(toolTipData));
      } catch (e) {
        console.error('Error: ', e);
      }
    }
    populateBrowserStorageKeyToReset(toolTipSessionKey);
    return toolTipData;
  }
};

const saveCollectionAssets = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response } = args;
    const { collection, collectionField, belongsToField, singleAssets } = parameters;
    const { data, refCollectionFile } = response;
    await addingAssets(
      refCollectionFile,
      data,
      collection,
      collectionField,
      belongsToField,
      singleAssets,
    );
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

const updateCollectionAssets = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, response } = args;
    const { collection, collectionField, belongsToField } = parameters;
    const { data, refCollectionFile } = response;
    const endpoint = `items/${collection}/collection`;
    const { data: getCallData } = await publicGetCall(endpoint);
    const uuidData = getCallData.filter((item) => {
      let belongValue = item[belongsToField];
      if (!belongValue || belongValue === 'undefined') {
        return false;
      }
      belongValue = belongValue[0];
      if (!belongValue || belongValue === 'undefined') {
        return false;
      }
      return belongValue && belongValue === data.uuid;
    });
    const { refField } = refCollectionFile;
    if (refField && uuidData && uuidData.length > 0) {
      const refFieldUuids = data[refField];
      const remainingFilesData = uuidData.filter((item) => !refFieldUuids.includes(item.uuid));
      const uuids =
        remainingFilesData && remainingFilesData.length > 0
          ? remainingFilesData.map((item) => item.uuid)
          : [];
      if (uuids && uuids.length) {
        const url = `open/collection-form/${collection}/items/bulkDelete`;
        const itemData = {
          ids: uuids,
        };
        await unSecuredPostCall(itemData, url);
      }
    }
    await addingAssets(refCollectionFile, data, collection, collectionField, belongsToField, false);
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};
const addingAssets = async (
  refCollectionFile,
  data,
  collection,
  collectionField,
  belongsToField,
  singleAssets,
) => {
  if (!refCollectionFile || !refCollectionFile.file || !refCollectionFile.file.length) {
    console.log('No refCollectionFile present. Terminating function.');
    return;
  }
  const fileData = refCollectionFile.file || [];
  const uuid = data.uuid || '';
  let urlEndpoint = `open/collection-form/${collection}/items`;
  if (singleAssets === true) {
    const itemData = {
      [collectionField]: fileData,
      [belongsToField]: [uuid],
    };
    try {
      await unSecuredPostCall(itemData, urlEndpoint);
    } catch (error) {
      console.error('error', error);
    }
  } else {
    for (let i = 0; i < fileData.length; i++) {
      const itemData = {
        [collectionField]: fileData[i],
        [belongsToField]: [uuid],
      };
      try {
        await unSecuredPostCall(itemData, urlEndpoint);
      } catch (error) {
        console.error(`API call ${i + 1} failed`, error);
      }
    }
  }
};

const fileActivityTracker = (fileName, activity, collectionName, collectionField) => {
  const itemData = {
    fileName: fileName,
    activity: activity,
    collName: collectionName,
    collField: collectionField,
  };
  const urlEndpoint = `open/collection-form/file_activity_tracker/items`;
  try {
    unSecuredPostCall(itemData, urlEndpoint);
  } catch (error) {
    console.error('Activity Tracking failed', error);
  }
};

const loginActivityTracker = async (activity, userName, tenantId) => {
  try {
    const userActivityTrackerPlugin = await fetchInstalledPluginByCode('USER_ACTIVITY_TRACKER');
    if (userActivityTrackerPlugin) {
      const itemData = {
        activity: activity,
        userId: userName ? userName : '',
        tenantId,
      };
      const urlEndpoint = `open/collection-form/user_activity_tracker/items`;
      await unSecuredPostCall(itemData, urlEndpoint);
    }
  } catch (error) {
    console.error('Login Activity Tracking failed', error);
  }
};

const openPDFViewer = async (event) => {
  event.preventDefault();
  const targetData = event.target;
  targetData.disabled = true;
  const parentElem = targetData ? targetData.closest('[data-pdf-viewer-component]') : '';
  const collectionField = parentElem ? parentElem.getAttribute('data-pdf-viewer-field') : '';
  const collectionFieldValue = collectionField || '';
  const collectionName = targetData.attributes['data-collection-id'];
  const collectionNameValue = collectionName ? collectionName.value : '';
  const itemUuid = targetData.attributes['data-item-id'];
  const itemUuidValue = itemUuid ? itemUuid.value : '';
  const fileUuid = targetData.attributes['data-file-id'];
  const fileUuidValue = fileUuid ? fileUuid.value : '';
  const fileOriginalName = targetData.attributes['data-file-original-name'];
  const fileOriginalNameValue = fileOriginalName ? fileOriginalName.value : '';
  const fileType = targetData.attributes['data-file-type'];
  const fileTypeValue = fileType ? fileType.value : '';
  if (!collectionField) {
    toastr.error('Please bind Collection Field', 'Error');
    targetData.disabled = false;
    return;
  }
  if (!collectionFieldValue) {
    toastr.error('Collection Field is blank', 'Error');
    targetData.disabled = false;
    return;
  }
  if (!fileUuidValue) {
    toastr.error(`${collectionFieldValue} has no PDF File`, 'Error');
    targetData.disabled = false;
    return;
  }
  // Handling for Modal
  if (!collectionName) {
    if (parentElem) {
      collectionName = parentElem ? parentElem.getAttribute('data-collection-id') : '';
      collectionNameValue = collectionName || '';
    }
  }
  if (fileTypeValue !== 'application/pdf' && !fileTypeValue.includes('image/')) {
    toastr.error('Only PDF and Image type files can be viewed!', 'Error');
    targetData.disabled = false;
    return;
  }
  let fileTypeTitle = 'PDF';
  if (fileTypeValue.includes('image/')) fileTypeTitle = 'Image';
  toastr.info(`Opening the ${fileTypeTitle}`, 'Info');
  const modalHTML = `
  <div id="pdfModal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000;">
    <div class="modal-content" style="position: relative; width: 80%; height: 80%; background: white; overflow: hidden; padding: 20px;">
      <div class="modal-header" style="position: relative; padding-bottom: 10px; border-bottom: 1px solid #ddd;">
        <h2 style="margin: 0; font-size: 20px;">${fileOriginalNameValue}</h2>
        <div class="modal-close" style="position: absolute; top: 10px; right: 10px; z-index: 1000; color: #333; font-size: 30px; cursor: pointer;">&times;</div>
      </div>
      <div id="pdfLoader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <div class="spinner" style="border: 6px solid #f3f3f3; border-radius: 50%; border-top: 6px solid #3498db; width: 40px; height: 40px; animation: spin 2s linear infinite;"></div>
      </div>
      <iframe id="pdf-iframe" style="width: 100%; height: calc(100% - 50px);" frameborder="0" hidden></iframe>
    </div>
  </div>
`;
  const loaderCSS = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = loaderCSS;
  document.head.appendChild(styleSheet);
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  const modal = document.getElementById('pdfModal');
  const closeButton = modal.querySelector('.modal-close');
  const loader = modal.querySelector('#pdfLoader');
  const iframe = modal.querySelector('#pdf-iframe');
  let pdfUrl;

  console.log('🚀 ~ openPDFViewer ~ targetData:', targetData);
  // Non-persistent File Data
  const parentTableElement = targetData.closest('table');
  console.log('🚀 ~ openPDFViewer ~ parentTableElement:', parentTableElement);
  const pageExternalApiId = getCookie('__pageExternalAPI');
  const parentModalElem = targetData.closest('.modal');
  const modalExternalApiId = sessionStorage.getItem('__modalExternalAPI');
  const parentFloatingModalElem = targetData.closest('.lm-modal');
  let hasExternalAPI = false;

  if (parentTableElement) {
    hasExternalAPI = parentTableElement?.hasAttribute('data-external-api-id');
    console.log('🚀 ~ openPDFViewer ~ table hasExternalAPI #1:', hasExternalAPI);
  } else if (parentModalElem && modalExternalApiId) {
    hasExternalAPI = parentModalElem && modalExternalApiId;
    console.log('🚀 ~ openPDFViewer ~ modal hasExternalAPI #2:', hasExternalAPI);
  } else if (parentFloatingModalElem && modalExternalApiId) {
    hasExternalAPI = parentFloatingModalElem && modalExternalApiId;
    console.log('🚀 ~ openPDFViewer ~ floating modal hasExternalAPI #2:', hasExternalAPI);
  } else if (pageExternalApiId) {
    hasExternalAPI = pageExternalApiId ? true : false;
    console.log('🚀 ~ openPDFViewer ~ page hasExternalAPI #3:', hasExternalAPI);
  }

  let decompressedNpf = '';
  if (hasExternalAPI) {
    const npf = targetData.attributes['data-npf'];
    const npfValue = npf ? npf.value : '';
    console.log('🚀 ~ openPDFViewer ~ npfValue:', npfValue);
    decompressedNpf = npfValue ? decompressFromBase64(npfValue) : null;
    console.log('🚀 ~ openPDFViewer ~ decompressedNpf:', decompressedNpf);
  }

  try {
    if (hasExternalAPI && decompressedNpf) {
      console.log('🚀 ~ openPDFViewer ~ Non-persistent data from External API');
      pdfUrl = imageServerUrl() + decompressedNpf.key;
    } else {
      const buffer = await fetchFile(
        itemUuidValue,
        fileUuidValue,
        collectionNameValue,
        collectionFieldValue,
        fileOriginalNameValue,
        true,
      );
      const pdfBlob = new Blob([buffer], { type: fileTypeValue });
      pdfUrl = URL.createObjectURL(pdfBlob);
    }

    loader.style.display = 'none';
    iframe.src = pdfUrl;
    iframe.hidden = false;
    closeButton.onclick = function () {
      closePDFViewerModal(modal, pdfUrl, targetData);
    };
    window.onclick = function (event) {
      if (event.target === modal) {
        closePDFViewerModal(modal, pdfUrl, targetData);
      }
    };
  } catch (error) {
    console.error('Error fetching or rendering the PDF:', error);
    toastr.error('Failed to load PDF', 'Error');
    closePDFViewerModal(modal, pdfUrl, targetData);
  }
};

const closePDFViewerModal = (modal, pdfUrl, targetData) => {
  modal.style.display = 'none';
  modal.remove();
  if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
  }
  targetData.disabled = false;
};

const generateEmailOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const {
      otpVerificationPage,
      successMessage,
      errorMessage,
      emailTemplate,
      otpAuthenticationType,
      emailServicePlugin,
    } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.emailTemplate = emailTemplate;
      formData.otpAuthenticationType = otpAuthenticationType || 'login';
      formData.emailServicePlugin = emailServicePlugin;
      const generateOtpUrl = 'auth/send-email-otp';
      const generateOtpResponse = await unSecuredPostCall(formData, generateOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { emailOtpToken } = generateOtpResponse.data;
        response.data = generateOtpResponse;
        response.status = 'success';
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?emailOtpToken=${emailOtpToken}`;
        }
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Error in generating Email OTP. Please Try Again', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const verifyEmailOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { successRedirectRules, successMessage, errorMessage, errorRedirectUrl } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      const verifyEmailOtpUrl = '/authorize-email-otp';
      const verifyOtpResponse = await axios.post(verifyEmailOtpUrl, formData);
      if (verifyOtpResponse && verifyOtpResponse.status === 200) {
        const loggedInUser = verifyOtpResponse.data;
        await loginActivityTracker(
          'Login',
          loggedInUser?.userDetails?.userName,
          loggedInUser?.tenant?.uuid,
        );
        const { role, token, userDetails, tenant, userSetting, projectId, subTenant } =
          loggedInUser || {};
        setJsonInLocalStorage('user', userDetails);
        localStorage.setItem('role', role);
        localStorage.setItem('token', token);
        localStorage.setItem('projectId', projectId);
        if (tenant) {
          setJsonInLocalStorage('tenant', tenant);
        } else localStorage.removeItem('tenant');
        if (userSetting) {
          setJsonInLocalStorage('userSetting', userSetting);
        }
        if (subTenant) {
          setJsonInLocalStorage('subTenant', subTenant);
        } else localStorage.removeItem('subTenant');
        if (successRedirectRules) {
          const environment = localStorage.getItem('environment');
          const hasEnvironmentField = successRedirectRules.some((rule) =>
            Object.prototype.hasOwnProperty.call(rule, 'environment'),
          );
          const environmentRedirectRules = hasEnvironmentField
            ? successRedirectRules.filter((rule) => rule.environment === environment)
            : successRedirectRules;
          const redirectUrl = environmentRedirectRules.find((redirectRule) => {
            if (Array.isArray(role)) {
              return role.includes(redirectRule.key);
            } else {
              return redirectRule.key === role;
            }
          });
          response.data = verifyOtpResponse;
          response.status = 'success';
          if (redirectUrl) window.location.href = redirectUrl.value;
          if (successMessage) toastr.success(successMessage, 'Success');
        }
      }
    } catch (error) {
      console.error('Invalid OTP. Please Try Again', error);
      response.data = error?.response;
      response.status = 'failure';
      if (errorRedirectUrl) window.location.href = errorRedirectUrl;
      if (errorMessage) toastr.error(errorMessage, 'Error');
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const generateSmsOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const {
      otpVerificationPage,
      successMessage,
      errorMessage,
      smsTemplate,
      otpAuthenticationType,
      smsServicePlugin,
      dltTemplateId,
      smsType,
    } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.smsTemplate = smsTemplate;
      formData.otpAuthenticationType = otpAuthenticationType || 'login';
      formData.smsServicePlugin = smsServicePlugin;
      if (dltTemplateId) formData.dltTemplateId = dltTemplateId;
      if (smsType) formData.smsType = smsType;
      const generateOtpUrl = 'auth/send-sms-otp';
      const generateOtpResponse = await unSecuredPostCall(formData, generateOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { smsOtpToken } = generateOtpResponse.data;
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?smsOtpToken=${smsOtpToken}`;
        }
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = generateOtpResponse;
        response.status = 'success';
      }
    } catch (error) {
      console.error('Error in generating SMS OTP. Please Try Again', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const verifySmsOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { successRedirectRules, successMessage, errorMessage, errorRedirectUrl } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      const verifySmsOtpUrl = '/authorize-sms-otp';
      const verifyOtpResponse = await axios.post(verifySmsOtpUrl, formData);
      if (verifyOtpResponse && verifyOtpResponse.status === 200) {
        const loggedInUser = verifyOtpResponse.data;
        await loginActivityTracker(
          'Login',
          loggedInUser?.userDetails?.userName,
          loggedInUser?.tenant?.uuid,
        );
        const { role, token, userDetails, tenant, userSetting, projectId, subTenant } =
          loggedInUser || {};
        setJsonInLocalStorage('user', userDetails);
        localStorage.setItem('role', role);
        localStorage.setItem('token', token);
        localStorage.setItem('projectId', projectId);
        if (tenant) {
          setJsonInLocalStorage('tenant', tenant);
        } else localStorage.removeItem('tenant');
        if (subTenant) {
          setJsonInLocalStorage('subTenant', subTenant);
        } else localStorage.removeItem('subTenant');
        if (userSetting) {
          setJsonInLocalStorage('userSetting', userSetting);
        } else localStorage.removeItem('userSetting');
        if (successRedirectRules) {
          const environment = localStorage.getItem('environment');
          const hasEnvironmentField = successRedirectRules.some((rule) =>
            Object.prototype.hasOwnProperty.call(rule, 'environment'),
          );
          const environmentRedirectRules = hasEnvironmentField
            ? successRedirectRules.filter((rule) => rule.environment === environment)
            : successRedirectRules;
          const redirectUrl = environmentRedirectRules.find((redirectRule) => {
            if (Array.isArray(role)) {
              return role.includes(redirectRule.key);
            } else {
              return redirectRule.key === role;
            }
          });
          response.data = verifyOtpResponse;
          response.status = 'success';
          if (redirectUrl) window.location.href = redirectUrl.value;
          if (successMessage) toastr.success(successMessage, 'Success');
        }
      }
    } catch (error) {
      console.error('Invalid OTP. Please Try Again', error);
      response.data = error?.response;
      response.status = 'failure';
      if (errorRedirectUrl) window.location.href = errorRedirectUrl;
      if (errorMessage) toastr.error(errorMessage, 'Error');
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const generateUserConsentEmailOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const {
      otpVerificationPage,
      userEmailField,
      successMessage,
      errorMessage,
      emailTemplate,
      collection,
      dataOperationType,
      getItemIdFrom,
      emailServicePlugin,
    } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.collection = collection;
      setJsonInLocalStorage('tempData', formData);
      let userItemId = fetchLoggedInUserJson()?.uuid || '';
      if (getItemIdFrom) {
        const { itemId } = await getItemIdForSnippet('', args, element);
        userItemId = itemId;
      }
      const itemData = {
        userEmailField,
        emailTemplate,
        collection,
        dataOperationType,
        userItemId,
        emailServicePlugin,
        formData,
      };
      if (dataOperationType === 'update') {
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          const itemId = previousActionResponse?.[`collection_${collection}`]?.uuid;
          itemData.itemId = itemId;
        }
      }
      const generateUserConsentOtpUrl = 'user-consent/send-consent-email-otp';
      const generateOtpResponse = await unSecuredPostCall(itemData, generateUserConsentOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { emailOtpToken } = generateOtpResponse.data;
        response.data = generateOtpResponse;
        response.status = 'success';
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?emailOtpToken=${emailOtpToken}`;
        }
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Error in generating OTP. Please Try Again', error);
      localStorage.removeItem('tempData');
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const verifyUserConsentEmailOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { collection, successMessage, errorMessage, errorRedirectUrl, successRedirectUrl } =
      parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.collection = collection;
      formData.itemData = localStorage.getItem('tempData');
      const { itemId } = await getItemIdForSnippet(collection, args, element);
      formData.itemId = itemId;
      const verifyUserConsentEmailOtpUrl = 'user-consent/verify-consent-email-otp';
      const verifyOtpResponse = await unSecuredPostCall(formData, verifyUserConsentEmailOtpUrl);
      if (verifyOtpResponse && verifyOtpResponse.status === 200) {
        localStorage.removeItem('tempData');
        response.data = verifyOtpResponse;
        response.status = 'success';
        if (successRedirectUrl) window.location.href = successRedirectUrl;
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Invalid OTP. Please Try Again', error);
      response.data = error?.response;
      response.status = 'failure';
      if (errorRedirectUrl) window.location.href = errorRedirectUrl;
      if (errorMessage) toastr.error(errorMessage, 'Error');
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const generateUserConsentSmsOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const {
      otpVerificationPage,
      userMobileField,
      successMessage,
      errorMessage,
      smsTemplate,
      collection,
      dataOperationType,
      dltTemplateId,
      smsType,
      getItemIdFrom,
      smsServicePlugin,
    } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.collection = collection;
      setJsonInLocalStorage('tempData', formData);
      let userItemId = fetchLoggedInUserJson()?.uuid || '';
      if (getItemIdFrom) {
        const { itemId } = await getItemIdForSnippet('', args, element);
        userItemId = itemId;
      }
      const itemData = {
        userMobileField,
        smsTemplate,
        collection,
        dataOperationType,
        userItemId,
        smsServicePlugin,
        formData,
      };
      if (dltTemplateId) itemData.dltTemplateId = dltTemplateId;
      if (smsType) itemData.smsType = smsType;
      if (dataOperationType === 'update') {
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          const itemId = previousActionResponse?.[`collection_${collection}`]?.uuid;
          itemData.itemId = itemId;
        }
      }
      const generateUserConsentOtpUrl = 'user-consent/send-consent-sms-otp';
      const generateOtpResponse = await unSecuredPostCall(itemData, generateUserConsentOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { smsOtpToken } = generateOtpResponse.data;
        response.data = generateOtpResponse;
        response.status = 'success';
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?smsOtpToken=${smsOtpToken}`;
        }
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Error in generating OTP. Please Try Again', error);
      localStorage.removeItem('tempData');
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const verifyUserConsentSmsOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { collection, successMessage, errorMessage, errorRedirectUrl, successRedirectUrl } =
      parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.collection = collection;
      formData.itemData = localStorage.getItem('tempData');
      const { itemId } = await getItemIdForSnippet(collection, args, element);
      formData.itemId = itemId;
      const verifyUserConsentSmsOtpUrl = 'user-consent/verify-consent-sms-otp';
      const verifyOtpResponse = await unSecuredPostCall(formData, verifyUserConsentSmsOtpUrl);
      if (verifyOtpResponse && verifyOtpResponse.status === 200) {
        localStorage.removeItem('tempData');
        response.data = verifyOtpResponse;
        response.status = 'success';
        if (successRedirectUrl) window.location.href = successRedirectUrl;
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Invalid OTP. Please Try Again', error);
      response.data = error?.response;
      response.status = 'failure';
      if (errorRedirectUrl) window.location.href = errorRedirectUrl;
      if (errorMessage) toastr.error(errorMessage, 'Error');
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const runOnce = (fn) => {
  let executed = false;
  const func = (...args) => {
    if (!executed) {
      executed = true;
      return fn(...args);
    }
  };
  return func;
};

const handleLogoutAfterTokenExpire = runOnce(async (url) => {
  toastr.error('User has been logged out!', 'Invalid Token');
  await processLogoutUser(url);
});

const checkTokenExpiry = async (token) => {
  return new Promise(async (resolve, reject) => {
    let response = { status: '', message: '', error: '' };
    if (!token || token === 'undefined' || token === 'null') {
      response.message = 'Token is not provided.';
      return resolve(response);
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;
    if (timeUntilExpiry > 0) {
      response.status = 200;
      response.message = 'Token is still active';
      return resolve(response);
    } else {
      try {
        await handleLogoutAfterTokenExpire(`/login`);
        response.status = 401;
        response.message = 'Logging out!';
        return resolve(response);
      } catch (error) {
        console.error('error', error);
        response.status = 500;
        response.message = 'Error';
        response.error = error;
        return reject(response);
      }
    }
  });
};

const openLinkInNewWindow = (element) => {
  const url = element.href;
  window.open(url, '_blank', 'width=' + screen.width + ',height=' + screen.height);
  return false;
};

const runJavaScriptCode = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const { successMessage, errorMessage, runJavaScript } = parameters;
    let response = {};
    if (parameters && typeof runJavaScript === 'string' && runJavaScript.trim()) {
      try {
        const codeToExecute = `(function() {
          "use strict";
          ${runJavaScript}
        })();`;
        new Function(codeToExecute)();
        response.status = 'success';
        if (successMessage) {
          toastr.success(successMessage, 'Success');
        }
      } catch (error) {
        response.status = 'error';
        console.error('Error executing JavaScript code:', error);
        toastr.error(errorMessage ? errorMessage : 'Error executing JavaScript code:', 'Error');
      }
    } else {
      console.warn('No valid JavaScript code provided.');
      toastr.error('No valid JavaScript code provided.', 'Error');
    }

    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const renderTypesenseSearch = async (element) => {
  try {
    const typesenseCollection = elementAttribute(element, 'data-typesense-collection');
    const typesenseTemplate = elementAttribute(element, 'data-typesense-template');
    const typesenseRedirectPage = elementAttribute(element, 'data-typesense-redirect-page');
    const typesenseRedirectCollection = elementAttribute(
      element,
      'data-typesense-redirect-collection',
    );
    const typesenseRedirectItemId = elementAttribute(element, 'data-typesense-redirect-item-id');
    const typesenseFilter = elementAttribute(element, 'data-typesense-filter');
    const viewType = elementAttribute(element, 'data-typesense-view-type');
    const searchBy = elementAttribute(element, 'data-typesense-search-by') || 'default';
    const sortBy = elementAttribute(element, 'data-typesense-sort-by');
    const sortOrder = elementAttribute(element, 'data-typesense-sort-order');
    const searchInput = element.querySelector('#typesense-search');
    const resultsContainer = element.querySelector('#typesense-results');
    const listElement = element.querySelector('#typesense-list');
    const anchorElement = element.querySelector('#typesense-anchor');
    const cardElement = element.querySelector('#typesense-results-card');
    const cardBodyElement = element.querySelector('#typesense-results-card-body');
    const paginationContainer = element.querySelector('#typesense-pagination');
    const prevButton = element.querySelector('#typesensePrevPage');
    const nextButton = element.querySelector('#typesenseNextPage');
    const currentPageElement = element.querySelector('#typesenseCurrentPage');
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    paginationContainer.style.display = 'none';
    if (!searchInput || !resultsContainer) {
      console.error('Typesense search elements not found');
    }
    if (!typesenseCollection || !typesenseRedirectPage) {
      console.error('Typesense Collection or Redirect Page Missing.');
    }
    const initializeTypesenseCollectionUrl = 'typesense-search/initialize';
    const initializeTypesenseCollectionResponse = await unSecuredPostCall(
      { typesenseCollection },
      initializeTypesenseCollectionUrl,
    );
    const { data } = initializeTypesenseCollectionResponse;
    const { collectionDetails } = data;
    const { fields } = collectionDetails;
    let templateContent = null;
    if (typesenseTemplate) {
      const fetchTypesenseTemplateUrl = `projects/template/${typesenseTemplate}`;
      const fetchTypesenseTemplateResponse = await publicGetCall(fetchTypesenseTemplateUrl);
      if (fetchTypesenseTemplateResponse?.data && fetchTypesenseTemplateResponse?.data?.content) {
        templateContent = fetchTypesenseTemplateResponse?.data?.content;
      }
    }
    const resultsLimit =
      element && element.hasAttribute('data-typesense-results-limit')
        ? parseInt(element.getAttribute('data-typesense-results-limit'))
        : 20;
    let externalQueryParamKeys =
      element && element.hasAttribute('externalQueryParamKeys')
        ? element.getAttribute('externalQueryParamKeys')
        : '';
    if (externalQueryParamKeys) externalQueryParamKeys = externalQueryParamKeys.split(',');
    const { itemData } = await getItemDataForElement(element);
    let searchUrl = 'typesense-search/search';
    if (itemData) {
      searchUrl = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        searchUrl,
        itemData,
        element,
      );
    }
    let currentPage = 1;
    let totalPages = 1;
    let latestSearchQuery = '';
    const fetchResults = async (searchQuery, page = 1) => {
      if (!searchQuery.trim() || searchQuery === '') {
        latestSearchQuery = '';
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        paginationContainer.style.display = 'none';
        return;
      }
      latestSearchQuery = searchQuery.trim();
      try {
        const response = await unSecuredPostCall(
          {
            typesenseCollection,
            searchQuery,
            typesenseFilter,
            resultsLimit,
            sortBy,
            sortOrder,
            page,
            searchBy,
          },
          searchUrl,
        );
        if (searchQuery !== latestSearchQuery) return;
        if (response && response.data && response.data.data.length) {
          resultsContainer.innerHTML = '';
          resultsContainer.style.display = 'block';
          renderResultsForTypesense(
            element,
            viewType,
            templateContent,
            response.data.data,
            resultsContainer,
            listElement,
            cardElement,
            cardBodyElement,
            anchorElement,
            fields,
            typesenseCollection,
            typesenseRedirectPage,
            typesenseRedirectCollection,
            typesenseRedirectItemId,
          );
          totalPages = response.data.totalPages;
          currentPage = page;
          updateTypesensePagination();
        } else {
          resultsContainer.innerHTML = `<div class="alert alert-warning">No results found</div>`;
          paginationContainer.style.display = 'none';
        }
      } catch (error) {
        console.error('Error in fetching results:', error);
        resultsContainer.innerHTML = `<div class="alert alert-danger">Error fetching results</div>`;
        paginationContainer.style.display = 'none';
      }
    };
    const updateTypesensePagination = () => {
      currentPageElement.textContent = `Page ${currentPage} of ${totalPages}`;
      prevButton.disabled = currentPage <= 1;
      nextButton.disabled = currentPage >= totalPages;
      paginationContainer.style.display = totalPages > 1 ? 'block' : 'none';
    };
    searchInput.addEventListener(
      'input',
      debounce((event) => {
        currentPage = 1;
        fetchResults(event.target.value.trim(), currentPage);
      }, 100),
    );
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) fetchResults(searchInput.value.trim(), currentPage - 1);
    });
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) fetchResults(searchInput.value.trim(), currentPage + 1);
    });
  } catch (error) {
    console.error('Error in rendering Typesense Search', error);
    toastr.error('Error in rendering Typesense Search', 'Error');
  }
};

const reindexDataForTypesenseCollection = async (args) => {
  const actionEnabled = isActionEnabled(args);
  let response = {};
  if (actionEnabled) {
    const { parameters } = args;
    const { typesenseCollection, reIndexOnTheBasisOfTenant, errorMessage, successMessage } =
      parameters;
    try {
      const reindexDataUrl = 'typesense-search/reindex-data';
      const reindexDataResponse = await unSecuredPostCall(
        { typesenseCollection, reIndexOnTheBasisOfTenant },
        reindexDataUrl,
      );
      if (reindexDataResponse && [200, 204].includes(reindexDataResponse.status)) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = reindexDataResponse;
        response.status = 'success';
      } else {
        console.error('Error in reindexing data');
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = reindexDataResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in reindexing data', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
  }
  return response;
};

const deleteTypesenseCollection = async (args) => {
  const actionEnabled = isActionEnabled(args);
  let response = {};
  if (actionEnabled) {
    const { parameters } = args;
    const { typesenseCollection, errorMessage, successMessage } = parameters;
    try {
      const deleteTypesenseCollectionUrl = `typesense-search/delete-collection/${typesenseCollection}`;
      const deleteTypesenseCollectionResponse = await unSecuredDeleteCall(
        deleteTypesenseCollectionUrl,
      );
      if (deleteTypesenseCollectionResponse && deleteTypesenseCollectionResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = deleteTypesenseCollectionResponse;
        response.status = 'success';
      } else {
        console.error('Error in deleting typesense collection');
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = deleteTypesenseCollectionResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in deleting typesense collection', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
  }
  return response;
};

const renderImagesForTypesense = (imageField) => {
  if (!imageField) return '';
  if (Array.isArray(imageField)) {
    return imageField
      .map(
        (imgUrl) =>
          `<img id="typesense-image" class="typesense-results-image" src="${imgUrl}" alt="File">`,
      )
      .join('&nbsp;&nbsp;');
  }
  return `<img id="typesense-image" class="typesense-results-image" src="${imageField}" alt="File">`;
};

const renderResultsForTypesense = (
  element,
  viewType,
  templateContent,
  data,
  resultsContainer,
  listElement,
  cardElement,
  cardBodyElement,
  anchorElement,
  fields,
  typesenseCollection,
  typesenseRedirectPage,
  typesenseRedirectCollection,
  typesenseRedirectItemId,
) => {
  const listItemClasses = listElement ? listElement.classList.value : '';
  const anchorElementClasses = anchorElement ? anchorElement.classList.value : '';
  const cardElementClasses = cardElement ? cardElement.classList.value : '';
  const cardBodyElementClasses = cardBodyElement ? cardBodyElement.classList.value : '';
  const newTab = element ? element.hasAttribute('data-newtab') : false;
  const recordsPerRow =
    element && element.hasAttribute('data-typesense-recordsperrow')
      ? parseInt(element.getAttribute('data-typesense-recordsperrow'))
      : 3;
  const colClass = `col-md-${Math.floor(12 / recordsPerRow)}`; // Dynamic column width
  const anchorTarget = newTab ? '_blank' : '_self';
  const cleanedTemplate = templateContent
    ? templateContent
        .replace(/<\/?pre>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
    : null;
  resultsContainer.innerHTML =
    viewType === 'card'
      ? `<div class="row g-3">` +
        data
          .map((item) => {
            const content = cleanedTemplate
              ? cleanedTemplate.replace(/{{(.*?)}}/g, (_, field) => {
                  const trimmedField = field.trim();
                  return fields.some((f) => f.fieldName === trimmedField && f.type === 'file')
                    ? renderImagesForTypesense(item[trimmedField])
                    : item[trimmedField] || '';
                })
              : `<div class="card-text">
                    ${Object.entries(item)
                      .filter(([key]) => !['projectId', 'id', 'priority'].includes(key))
                      .map(([key, value]) => {
                        if (!value) return '';
                        return `<div><strong>${titleCase(key)}:</strong> ${
                          typeof value === 'object' ? JSON.stringify(value) : value
                        }</div>`;
                      })
                      .join('')}
                </div>`;

            return `<div class="${colClass}">
                      <div class="${cardElementClasses}">
                        <div class="${cardBodyElementClasses}">
                           <a href="${redirectLinkForTypesense(
                             item,
                             typesenseCollection,
                             typesenseRedirectPage,
                             typesenseRedirectCollection,
                             typesenseRedirectItemId,
                           )}" target="${anchorTarget}" 
                             rel="noopener noreferrer" class="${anchorElementClasses}">
                            ${content}
                          </a>
                        </div>
                      </div>
                    </div>`;
          })
          .join('') +
        `</div>`
      : `<ul class="list-group">` +
        data
          .map((item) => {
            const content = cleanedTemplate
              ? cleanedTemplate.replace(/{{(.*?)}}/g, (_, field) => {
                  const trimmedField = field.trim();
                  return fields.some((f) => f.fieldName === trimmedField && f.type === 'file')
                    ? renderImagesForTypesense(item[trimmedField])
                    : item[trimmedField] || '';
                })
              : Object.entries(item)
                  .filter(([key]) => !['projectId', 'id', 'priority'].includes(key))
                  .map(([key, value]) => {
                    if (!value) return '';
                    return `<div><strong>${titleCase(key)}:</strong> ${
                      typeof value === 'object' ? JSON.stringify(value) : value
                    }</div>`;
                  })
                  .join('');

            return `<li class="${listItemClasses}">
                      <a href="${redirectLinkForTypesense(
                        item,
                        typesenseCollection,
                        typesenseRedirectPage,
                        typesenseRedirectCollection,
                        typesenseRedirectItemId,
                      )}" target="${anchorTarget}" 
                         rel="noopener noreferrer" class="${anchorElementClasses}">
                        ${content}
                      </a>
                    </li>
                   `;
          })
          .join('') +
        `</ul>`;
};

const redirectLinkForTypesense = (
  item,
  typesenseCollection,
  typesenseRedirectPage,
  typesenseRedirectCollection,
  typesenseRedirectItemId,
) => {
  const redirectCollection = typesenseRedirectCollection || typesenseCollection;
  const redirectItemId = Array.isArray(item[typesenseRedirectItemId])
    ? item[typesenseRedirectItemId][0]
    : item[typesenseRedirectItemId] || item.uuid;
  return `${typesenseRedirectPage}/${redirectCollection}/${redirectItemId}`;
};

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const switchSubTenant = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const { confirmationMessage, successMessage, errorMessage, skipPageReload, redirectRules } =
      parameters;
    let selectedSubTenantId = '';
    if (targetElement) {
      if (targetElement.hasAttribute('data-sub-tenant-id')) {
        selectedSubTenantId = targetElement.getAttribute('data-sub-tenant-id');
      } else if (targetElement.hasAttribute('data-item-id')) {
        selectedSubTenantId = targetElement.getAttribute('data-item-id');
      }
    }
    if (isLoggedInUser()) {
      let selectedSubTenant = '';
      const currentUser = fetchLoggedInUserJson();
      if (currentUser.subTenantId && currentUser.subTenantId.length && selectedSubTenantId) {
        selectedSubTenant = currentUser.subTenantId.find(
          (subTenantObj) => subTenantObj.uuid === selectedSubTenantId,
        );
        selectedSubTenant = selectedSubTenant ? selectedSubTenant.uuid : '';
      }
      if (confirmationMessage) {
        let response = {};
        await swalAlert(confirmationMessage, 'Proceed', true, false).then(async (willProceed) => {
          if (willProceed.isConfirmed) {
            if (!selectedSubTenant) {
              localStorage.removeItem('subTenant');
              if (!skipPageReload) {
                setTimeout(() => {
                  actionCompleted(args);
                  window.location.reload();
                }, 500);
              }
            } else if (selectedSubTenant) {
              await switchEntityProcess(
                selectedSubTenant,
                response,
                redirectRules,
                skipPageReload,
                successMessage,
                errorMessage,
                'subTenant',
              );
            }
            response.confirmation = willProceed;
            actionCompleted(args);
            return response;
          } else {
            response.confirmation = willProceed;
            response.status = 'cancel';
            return Promise.reject(response);
          }
        });
      } else {
        let response = {};
        if (!selectedSubTenant) {
          localStorage.removeItem('subTenant');
          if (!skipPageReload) {
            setTimeout(() => {
              actionCompleted(args);
              window.location.reload();
            }, 500);
          }
        } else if (selectedSubTenant) {
          await switchEntityProcess(
            selectedSubTenant,
            response,
            redirectRules,
            skipPageReload,
            successMessage,
            errorMessage,
            'subTenant',
          );
        }
        actionCompleted(args);
      }
    } else {
      toastr.error(errorMessage || 'User not logged in!', 'Error');
    }
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};

//For switching Tenant and Sub Tenant
const switchEntityProcess = async (
  selectedEntity,
  response,
  redirectRules,
  skipPageReload,
  successMessage,
  errorMessage,
  switchingEntity,
) => {
  try {
    let endpoint = `/switch-tenant/${selectedEntity}`;
    if (switchingEntity === 'subTenant') {
      endpoint = `/switch-sub-tenant/${selectedEntity}`;
    }
    response = await axios.get(endpoint, {});
    if (response && response.status === 200) {
      const userObj = response.data;
      if (userObj.userDetails) {
        delete userObj.userDetails._id;
        setJsonInLocalStorage('user', userObj.userDetails);
      }
      const {
        tenant: tenantObj,
        userDetails,
        userSetting: userSettingObj,
        subTenant: subTenantObj,
      } = userObj || '';
      if (tenantObj) {
        delete tenantObj._id;
        setJsonInLocalStorage('tenant', tenantObj);
      } else {
        if (switchingEntity === 'tenant') localStorage.removeItem('tenant');
      }
      if (userSettingObj) {
        delete userSettingObj._id;
        setJsonInLocalStorage('userSetting', userSettingObj);
      } else {
        if (switchingEntity === 'tenant') localStorage.removeItem('userSetting');
      }
      if (subTenantObj) {
        delete subTenantObj._id;
        setJsonInLocalStorage('subTenant', subTenantObj);
      } else {
        if (switchingEntity === 'tenant') localStorage.removeItem('subTenant');
      }
      if (successMessage) toastr.success(successMessage, 'Success');
      const hasValidRoles =
        userSettingObj && userSettingObj.userRoles && userSettingObj.userRoles.length;
      if (
        ((switchingEntity === 'tenant' && tenantObj) ||
          (switchingEntity === 'subTenant' && subTenantObj)) &&
        hasValidRoles &&
        redirectRules &&
        redirectRules.length
      ) {
        let redirectPage = '';
        handlePageRedirection(userObj, redirectPage, redirectRules);
      } else if (!skipPageReload) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  } catch (error) {
    console.error(`🚀 ~ file: drapcode.js:15588 ~ switch${switchingEntity}Process ~ error:`, error);
    if (errorMessage) toastr.error(errorMessage, 'Error');
    if (error.response) {
      response.data = error.response;
      response.status = 'error';
    }
  }
};

const createUserSettingsForAddNewUserToTenant = async (
  currentUserSettingCollection,
  userId,
  currentTenantId,
  hasTenantRoleMapping,
  tenantRoleMappingValue,
  response,
) => {
  const itemData = {
    userId: userId,
  };
  if (currentTenantId) {
    itemData.tenantId = currentTenantId;
  }
  if (hasTenantRoleMapping && tenantRoleMappingValue) {
    itemData.userRoles = tenantRoleMappingValue;
  }
  const userSettingsEndpoint = `open/collection-form/${currentUserSettingCollection.collectionName}/items/`;
  const userSettingsResponse = await unSecuredPostCall(itemData, userSettingsEndpoint);
  if (userSettingsResponse && userSettingsResponse.data && userSettingsResponse.data.uuid) {
    response.data.data.userSettingId = [userSettingsResponse.data.uuid];
    const data = {
      userSettingId: [userSettingsResponse.data.uuid],
    };
    const userEndpoint = `open/collection-form/user/items/${userId}`;
    await unSecuredPutCall(data, userEndpoint);
    return userSettingsResponse.data;
  }
};

const customFunctionItemId = async (args) => {
  const {
    parameters: {
      sendItemIdFrom,
      referenceField,
      bslCollection,
      browserStorageLocation,
      itemIdBSLKey,
    },
    response,
    targetElement,
  } = args;

  let itemId = null;

  if (sendItemIdFrom) {
    switch (sendItemIdFrom) {
      case URL_STRATEGIES.CURRENT_OBJECT: {
        const { itemId: currentItemId, error } = handleCurrentObjectUrl(response);
        if (error) return { error };
        itemId = currentItemId || null;
        break;
      }

      case URL_STRATEGIES.PREVIOUS_STEP: {
        const { itemId: previousStepItemId } = handlePreviousStepUrl(response, targetElement);
        itemId = previousStepItemId || null;
        break;
      }

      case URL_STRATEGIES.CURRENT_PAGE: {
        const currentPageInfo = urlFromCurrentPage();
        itemId = currentPageInfo?.itemId || null;
        break;
      }

      case URL_STRATEGIES.CURRENT_USER: {
        const currentUser = fetchLoggedInUserJson();
        itemId = currentUser?.uuid || null;
        break;
      }

      case URL_STRATEGIES.TARGET_ITEM: {
        itemId = targetElement?.getAttribute('data-item-id') || null;
        break;
      }

      case URL_STRATEGIES.PAGE_REFERENCE: {
        const pageRefUrl = await urlFromCurrentPageRef(window.location.pathname, referenceField);
        itemId = pageRefUrl?.split('/').pop() || null;
        break;
      }

      case URL_STRATEGIES.BSL_ITEM: {
        const browserStorageData = await getBSLData(browserStorageLocation);
        const bslDataValue =
          browserStorageData && itemIdBSLKey ? _.get(browserStorageData, itemIdBSLKey.trim()) : '';
        itemId = bslDataValue || null;
        break;
      }

      default:
        itemId = null;
    }
  }

  return { itemId };
};

let isProcessing = false;
const requestQueue = [];
const triggerCustomFunction = async (args) => {
  const actionEnabled = isActionEnabled(args);

  if (isProcessing) {
    return new Promise((resolve) => {
      requestQueue.push({ args, resolve });
    });
  }
  isProcessing = true;
  try {
    if (actionEnabled) {
      const { targetElement, parameters } = args;

      let {
        url,
        successMessage,
        errorMessage,
        customFunctionUuid,
        customFunctionActionName,
        passPreviousActionResponse,
        passPreviousActionFormData,
        formDataSessionKey,
        formDataBrowserStorageLocation,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
        bslPayload,
      } = parameters || {};
      let response = {};
      let resolvedItemId = null;
      const currentEnv = localStorage.getItem('environment');
      try {
        const sendItemIDresult = await customFunctionItemId({
          ...args,
          targetElement,
          parameters,
        });
        const { itemId } = sendItemIDresult;
        resolvedItemId = itemId;
      } catch (err) {
        console.error('Failed to resolve itemId using customFunctionItemId:', err);
      }

      if (!resolvedItemId) {
        resolvedItemId = targetElement?.getAttribute('data-item-id') || null;
      }

      let errorInCustomFunction = false;

      if (url && typeof url === 'string' && url.trim()) {
        try {
          const loggedInUser = isLoggedInUser() ? fetchLoggedInUserJson() : {};
          const previousResponse = args.response || {};
          let formData = {};
          const formElem = targetElement ? targetElement.closest('FORM') : '';
          if (formElem && formElem.tagName === 'FORM') {
            // Handle Form Data with Form Submit
            formData = await serializeFormData(formElem.elements, false, true);
          } else {
            formData = await loadFormData(targetElement, formData, args, true);
          }

          // Get Browser Storage Data Object
          const browserData = await getBrowserData();

          // Filter Browser Data based on bslPayloadKeys
          const filteredBSLData = filteredBSLDataPayload(bslPayload, browserData);

          let previousActionResponse = sessionStorage.getItem('previousActionResponse');
          let parsedPreviousResponse = {};

          if (previousActionResponse) {
            try {
              parsedPreviousResponse = JSON.parse(previousActionResponse);
            } catch (error) {
              console.warn('Failed to parse previousActionResponse:', error);
            }
          }

          // Prepare deprecated keys and message
          const deprecated = {
            keys: ['itemID'],
            message: 'The itemID key is deprecated. Please use itemId instead.',
          };

          const postData = {
            ...loggedInUser,
            itemID: resolvedItemId,
            itemId: resolvedItemId,
            currentEnv,
            formData,
            browserStorageDTO: filteredBSLData,
            ...parsedPreviousResponse,
            __deprecated: deprecated,
          };

          // Uncomment the below line for https to http conversion if needed
          // url = url.startsWith('https://') ? url.replace('https://', 'http://') : url;

          let customFunctionResponse = {};
          try {
            const apiResponse = await axios.post(url, postData, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (successMessage) {
              toastr.success(successMessage, 'Success');
            }
            response.status = 'success';

            if (
              passPreviousActionResponse &&
              (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
            ) {
              if (responseDataSessionStorageLocation && responseDataSessionKey) {
                setDataInSessionStorageLocation(
                  responseDataSessionStorageLocation,
                  responseDataSessionKey,
                  apiResponse && apiResponse.data ? { ...apiResponse.data } : {},
                );
              }
            }
            if (
              passPreviousActionFormData &&
              (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
            ) {
              if (formDataBrowserStorageLocation && formDataSessionKey) {
                setDataInSessionStorageLocation(
                  formDataBrowserStorageLocation,
                  formDataSessionKey,
                  formData ? { ...formData } : {},
                );
              }
            }
            customFunctionResponse = apiResponse && apiResponse.data ? { ...apiResponse.data } : {};
            response.data = { customFunctionResponse };
          } catch (error) {
            console.error('This is the error: ', error);
            if (errorMessage) toastr.error(errorMessage, 'Error');
            if (error.response) {
              response.data = error.response;
              customFunctionResponse = error.response;
              response.data = { customFunctionResponse };
              response.status = 'error';
            }
            errorInCustomFunction = true;
          }

          const data = {
            actionName: customFunctionActionName,
            currentEnv: currentEnv,
          };
          const endpoint = `custom-function/${customFunctionUuid}`;
          const logsEntryResponse = await unSecuredPostCall(data, endpoint);

          if (errorInCustomFunction) {
            logsEntryResponse.status = 'error';
          }
          response.data = { ...previousResponse, customFunctionResponse };
        } catch (error) {
          response.status = 'error';
          response.data = error;
          console.error('Error making API call:', error);
          toastr.error(errorMessage || 'Error making API call', 'Error');
        }
      } else {
        console.warn('No valid URL provided.');
        toastr.error('No valid URL provided.', 'Error');
      }

      actionCompleted(args);
      return response;
    } else {
      return disabledActionResponse(args);
    }
  } finally {
    isProcessing = false;
    if (requestQueue.length > 0) {
      const nextRequest = requestQueue.shift();
      triggerCustomFunction(nextRequest.args).then(nextRequest.resolve);
    }
  }
};

//indexeddb
const DB_NAME = 'drapCodeDB';
let STORE_NAME = getCookie('projectSeoName');
const DB_VERSION = 1;
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      STORE_NAME = getCookie('projectSeoName');
      if (STORE_NAME && !db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = (event) => {
      reject(`IndexedDB Error: ${event.target.errorCode}`);
    };
  });
}
async function setIndexedDBItem(key, value, isJSON = true) {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data = {
        key,
        value,
        isJSON,
      };
      const request = store.put(data);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(`Set failed: ${e.target.error}`);
      tx.oncomplete = () => db.close();
      tx.onerror = () => {
        db.close();
        reject('Transaction failed');
      };
    });
  } catch (err) {
    if (db) db.close();
    throw err;
  }
}
async function getIndexedDBData(excludedKeys = ['isJSON']) {
  const db = await openIndexedDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    const result = {};
    request.onsuccess = () => {
      request.result.forEach(({ key, value, isJSON }) => {
        if (!excludedKeys.includes(key)) {
          try {
            result[key] = isJSON ? JSON.parse(value) : value;
          } catch (err) {
            console.warn(`❌ Error parsing key "${key}"`, err);
            result[key] = value;
          }
        }
      });
      resolve(result);
    };

    request.onerror = (event) => {
      reject(`IndexedDB read error: ${event.target.errorCode}`);
    };

    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject('Transaction failed');
    };
  });
}
async function removeIndexedDBKeys(keys = []) {
  const db = await openIndexedDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  keys.forEach((key) => store.delete(key));

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve(true);
    };
    tx.onerror = () => {
      db.close();
      console.error('❌ Failed to delete keys from INDEXED_DB');
      reject(false);
    };
  });
}
async function clearIndexedDB() {
  const db = await openIndexedDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve(true);
    };
    tx.onerror = () => {
      db.close();
      console.error('❌ Failed to clear INDEXED_DB');
      reject(false);
    };
  });
}

const sendSocketMessage = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const eventItemConfig = { dataItemId: '', previousStepId: '' };
    let itemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    eventItemConfig['dataItemId'] = itemId || '';
    const previousResponse = args.response;
    if (previousResponse) {
      const { collectionSaveOrUpdateResponse } = previousResponse;
      if (collectionSaveOrUpdateResponse) {
        const { data: collectionItemData } = collectionSaveOrUpdateResponse;
        eventItemConfig['previousStepId'] = collectionItemData?.uuid || '';
      }
    }
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    if (previousActionResponse) {
      let collectionKey = `parentCollectionToPropagate`;
      if (previousActionResponse[collectionKey]) {
        let collectionItemId = previousActionResponse[collectionKey].uuid;
        eventItemConfig['propagateItemId'] = collectionItemId;
      }
    }
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    // Get Browser Storage Data Object
    const browserData = await getBrowserData();
    const formData = {
      eventItemConfig,
      templatesRules: parameters.templatesRules,
      previousActionResponse,
      previousActionFormData,
      ...browserData,
    };
    let response = {};
    let result = {};
    if (parameters) {
      try {
        const endpoint = 'socket-io/send-dynamic-socket';
        result = await unSecuredPostCall(formData, endpoint);
        response.data = { ...previousResponse, ...result };
        response.status = 'success';
      } catch (error) {
        console.error('%c==> Error :>> ', 'color:yellow', error);
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
        }
      }
    }
    actionCompleted(args);
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const saveItemInMetaDataTable = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters, response } = args;
    const {
      metaDataCollection,
      metaDataMapping,
      targetDataCollection,
      errorMessage,
      successMessage,
    } = parameters;
    try {
      const { data } = response;
      const formCollectionName = elementAttribute(element, 'data-form-collection');
      const itemData = {
        metaDataCollection,
        metaDataMapping,
        targetDataCollection,
        formCollectionName,
        saveItemResponse: data,
      };
      const saveItemInMetaDataUrl = 'meta-data-mapping/save-item';
      const saveItemInMetaDataResponse = await unSecuredPostCall(itemData, saveItemInMetaDataUrl);
      if (saveItemInMetaDataResponse) {
        if (saveItemInMetaDataResponse.status === 201) {
          if (successMessage) toastr.success(successMessage, 'Success');
          response.data = saveItemInMetaDataResponse;
        } else {
          console.error('Error in Saving in Meta Data Table');
          if (errorMessage) toastr.error(errorMessage, 'Error');
          response.data = saveItemInMetaDataResponse;
        }
      }
    } catch (error) {
      console.error('Error in Saving in Meta Data Table', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
    } finally {
      actionCompleted(args);
    }
    return response;
  }
};

const updateItemInMetaDataTable = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters, response } = args;
    const {
      metaDataCollection,
      metaDataMapping,
      targetDataCollection,
      errorMessage,
      successMessage,
    } = parameters;
    try {
      const { data } = response;
      const formCollectionName = elementAttribute(element, 'data-form-collection');
      const itemData = {
        metaDataCollection,
        metaDataMapping,
        targetDataCollection,
        formCollectionName,
        items: data,
      };
      const updateItemInMetaDataUrl = `meta-data-mapping/update-item/${metaDataCollection}`;
      const updateItemInMetaDataResponse = await unSecuredPutCall(
        itemData,
        updateItemInMetaDataUrl,
      );
      if (updateItemInMetaDataResponse) {
        if (updateItemInMetaDataResponse.status === 200) {
          if (successMessage) toastr.success(successMessage, 'Success');
          response.data = updateItemInMetaDataResponse;
        } else {
          console.error('Error in Updating in Meta Data Table');
          if (errorMessage) toastr.error(errorMessage, 'Error');
          response.data = updateItemInMetaDataResponse;
        }
      }
    } catch (error) {
      console.error('Error in Updating in Meta Data Table', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const deleteItemInMetaDataTable = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters, response } = args;
    const {
      metaDataCollection,
      metaDataMapping,
      targetDataCollection,
      errorMessage,
      successMessage,
    } = parameters;
    try {
      const { config } = response;
      const { url } = config;
      const deletedItemId = url.split('/').pop();
      const formCollectionName = elementAttribute(element, 'data-collection-id');
      const itemData = {
        metaDataCollection,
        metaDataMapping,
        targetDataCollection,
        formCollectionName,
        deletedItemId,
      };
      const deleteItemInMetaDataUrl = 'meta-data-mapping/delete-item';
      const deleteItemInMetaDataResponse = await unSecuredPostCall(
        itemData,
        deleteItemInMetaDataUrl,
      );
      if (deleteItemInMetaDataResponse) {
        if (deleteItemInMetaDataResponse.status === 200) {
          if (successMessage) toastr.success(successMessage, 'Success');
          response.data = deleteItemInMetaDataResponse;
        } else {
          console.error('Error in Deleting from Meta Data Table');
          if (errorMessage) toastr.error(errorMessage, 'Error');
          response.data = deleteItemInMetaDataResponse;
        }
      }
    } catch (error) {
      console.error('Error in Deleting from Meta Data Table', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const mapAllDataInMetaDataTable = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const {
      metaDataCollection,
      metaDataMapping,
      targetDataCollection,
      errorMessage,
      successMessage,
    } = parameters;
    let response = {};
    try {
      const itemData = {
        metaDataCollection,
        metaDataMapping,
        targetDataCollection,
      };
      const mapAllDataUrl = 'meta-data-mapping/map-all-data';
      const mapAllDataResponse = await unSecuredPostCall(itemData, mapAllDataUrl);
      if (mapAllDataResponse) {
        if (mapAllDataResponse.status === 200) {
          if (successMessage) toastr.success(successMessage, 'Success');
          response.data = mapAllDataResponse;
          response.status = 'success';
        } else {
          console.error('Error in Mapping all data in Meta Data Table');
          if (errorMessage) toastr.error(errorMessage, 'Error');
          response.data = mapAllDataResponse;
          response.status = 'error';
        }
      }
    } catch (error) {
      console.error('Error in Mapping All Data in Meta Data Table', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const renderSocketAlert = (element, socketAlertAction) => {
  element.style.display = 'none';
  element.addEventListener('click', async () => {
    if (socketAlertAction === 'refresh') {
      const refreshComponent = elementAttribute(element, 'data-socket-alert-target-component');
      const refreshComponentPosition = elementAttribute(element, 'data-socket-alert-target-append');
      const refreshComponentType = refreshComponent.split(':')[0];
      const refreshComponentId = refreshComponent.split(':')[1];
      const targetElement = document.getElementById(refreshComponentId);
      const socketDataRaw = elementAttribute(element, 'data-socket-alert-data');
      let socketData = [];
      try {
        socketData = JSON.parse(socketDataRaw);
      } catch (e) {
        socketData = [];
      }
      if (Array.isArray(socketData)) {
        for (const singleData of socketData) {
          await handleRefreshComponent(
            refreshComponentPosition,
            refreshComponentType,
            refreshComponentId,
            targetElement,
            { data: singleData },
          );
        }
      } else {
        await handleRefreshComponent(
          refreshComponentPosition,
          refreshComponentType,
          refreshComponentId,
          targetElement,
          { data: socketData },
        );
      }
      element.style.display = 'none';
    } else {
      window.location.reload();
    }
  });
};

const handleRefreshComponent = async (
  refreshComponentPosition,
  refreshComponentType,
  refreshComponentId,
  targetElement,
  data,
) => {
  if (
    targetElement &&
    targetElement.attributes.getNamedItem('data-js') &&
    targetElement.attributes['data-js'].value === refreshComponentType
  ) {
    let paginationData = {};
    let dataTablePaginationData = {};
    if (paginationDataMap.get('pdata_' + refreshComponentId)) {
      paginationData = paginationDataMap.get('pdata_' + refreshComponentId);
    }
    let dtPaginateMapData = dataTablePaginationDataMap.get('ptdata_' + refreshComponentId);
    if (refreshComponentPosition === 'End' || refreshComponentPosition === 'Beginning') {
      await appendPrepend(dtPaginateMapData, data, refreshComponentPosition);
    } else {
      if (dtPaginateMapData) {
        dataTablePaginationData = dtPaginateMapData;
        if (dataTablePaginationData.fieldName) {
          const { itemData } = await getPageItemData();
          let itemIds = parseValueFromData(itemData, dataTablePaginationData.fieldName);
          itemIds = Array.isArray(itemIds)
            ? itemIds
            : Object.keys(itemIds).length > 0
              ? [itemIds]
              : [];
          dataTablePaginationData.itemIds = itemIds;
        }
      }
      if (paginationData && typeof paginationData.replacedElement !== 'undefined') {
        let orgNumberPerPage = paginationData.numberPerPage;
        let orgCurrentPage = paginationData.currentPage;
        if (paginationData.fieldName) {
          const { itemData } = await getPageItemData();
          let itemIds = parseValueFromData(itemData, paginationData.fieldName);
          itemIds = Array.isArray(itemIds)
            ? itemIds
            : Object.keys(itemIds).length > 0
              ? [itemIds]
              : [];
          paginationData.itemIds = itemIds;
        }
        modifyPaginationDataForRefresh(paginationData);
        loadGroupData(paginationData);
        resetPaginationData(paginationData, orgNumberPerPage, orgCurrentPage);
      }
      if (dataTablePaginationData && typeof dataTablePaginationData.dataTable !== 'undefined') {
        loadDataList(dataTablePaginationData);
      }
    }
  }
};

const createConsentRequest = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const {
      userMobileField,
      consentType,
      errorMessage,
      successMessage,
      openInNewTab,
      redirectUrl,
      retainUrlParams,
    } = parameters;
    let response = {};
    try {
      const consentRequestUrl = 'signzy/account-aggregator/create-consent-request';
      const { itemId: dataItemId } = await getItemIdForSnippet('', args, targetElement);
      const finalPath = retainUrlParams ? retainURLParamsHashQuery() : '';
      const consentData = {
        userMobileField,
        consentType,
        dataItemId,
        redirectUrl: redirectUrl
          ? new URL(redirectUrl + finalPath, window.location.origin).href
          : undefined,
      };
      const consentRequestResponse = await unSecuredPostCall(consentData, consentRequestUrl);
      if (consentRequestResponse && consentRequestResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        const { redirectUrl } = consentRequestResponse.data.data;
        await resetCurrentUserInLocalStorage();
        response.data = consentRequestResponse;
        response.status = 'success';
        openInNewTab ? window.open(redirectUrl, '_blank') : (window.location.href = redirectUrl);
      } else {
        console.error('Error in create Consent Request', consentRequestResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = consentRequestResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in createConsentRequest', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const fetchFinancialInformation = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, accountHolderField, fiTransactionsField } = parameters;
    let response = {};
    try {
      const fetchFIUrl = 'signzy/account-aggregator/fetch-fi';
      const { itemId, collectionId } = await getItemIdForSnippet('', args, targetElement, '', true);
      let data = { itemId };
      if (collectionId) {
        data.collectionName = collectionId;
      }
      const { itemId: saveItemId } = await getItemIdForSnippet('', args, targetElement);
      if (accountHolderField) {
        data.accountHolderField = accountHolderField;
      }
      if (fiTransactionsField) {
        data.fiTransactionsField = fiTransactionsField;
      }
      if (saveItemId) {
        data.saveItemId = saveItemId;
      }
      const fetchFIResponse = await unSecuredPostCall(data, fetchFIUrl);
      if (fetchFIResponse && fetchFIResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = fetchFIResponse;
        response.status = 'success';
      } else {
        console.error('Error in fetching Financial Information', fetchFIResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = fetchFIResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in fetchFinancialInformation', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const generateTemporaryPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const specialChars = '!@#$';
  const password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    digits[Math.floor(Math.random() * digits.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];
  const allChars = lowercase + uppercase + digits + specialChars;
  while (password.length < 8) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  return password.join('');
};

const signzyDigitalDocSign = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const {
      errorMessage,
      successMessage,
      openInNewTab = false,
      signerIdentifierValueFrom = 'default',
      redirect = false,
      retainUrlParams,
    } = parameters;
    let response = {};
    try {
      const eSignUrl = 'signzy/document-signing/esign-document';
      const itemId = elementAttribute(targetElement, 'data-item-id');
      const signerIdentifierId =
        signerIdentifierValueFrom === 'loggedInUser' ? fetchLoggedInUserJson()?.uuid : itemId;
      const finalPath = retainUrlParams ? retainURLParamsHashQuery() : '';
      const eSignData = {
        ...parameters,
        itemId,
        signerIdentifierId,
        successRedirectUrl: parameters.successRedirectUrl
          ? new URL(parameters.successRedirectUrl + finalPath, window.location.origin).href
          : undefined,
        failureRedirectUrl: parameters.failureRedirectUrl
          ? new URL(parameters.failureRedirectUrl + finalPath, window.location.origin).href
          : undefined,
      };
      const eSignResponse = await unSecuredPostCall(eSignData, eSignUrl);
      if (eSignResponse && eSignResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = eSignResponse;
        response.status = 'success';
        if (
          redirect &&
          Array.isArray(eSignResponse?.data?.data?.signerdetail) &&
          eSignResponse.data.data.signerdetail.length === 1
        ) {
          const esignUrl = eSignResponse.data.data.signerdetail[0]?.esignUrl || '';
          if (esignUrl) {
            openInNewTab ? window.open(esignUrl, '_blank') : (window.location.href = esignUrl);
          }
        }
      } else {
        console.error('Error in eSigning Document', eSignResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = eSignResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in signzyDigitalDocSign', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const fetchContractDetails = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const {
      getContractIdFrom,
      errorMessage,
      successMessage,
      signerIdentifierField,
      signerIdentifierValueFrom = 'default',
      contractsField,
    } = parameters;
    let response = {};
    try {
      const fetchContractDetailsUrl = 'signzy/document-signing/fetch-contract';
      const signerIdentifierId =
        signerIdentifierValueFrom === 'loggedInUser'
          ? fetchLoggedInUserJson()?.uuid
          : elementAttribute(targetElement, 'data-item-id');
      let data = {
        itemId:
          getContractIdFrom === 'default'
            ? elementAttribute(targetElement, 'data-item-id')
            : fetchLoggedInUserJson()?.uuid,
        signerIdentifierField,
        signerIdentifierId,
      };
      if (getContractIdFrom === 'default') {
        data.collectionName = elementAttribute(targetElement, 'data-collection-id');
      }
      const { itemId: saveItemId } = await getItemIdForSnippet('', args, targetElement);
      if (contractsField) {
        data.contractsField = contractsField;
      }
      if (saveItemId) {
        data.saveItemId = saveItemId;
      }
      const fetchContractResponse = await unSecuredPostCall(data, fetchContractDetailsUrl);
      if (fetchContractResponse && fetchContractResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = fetchContractResponse;
        response.status = 'success';
        const { finalSignedContract, contractName } = fetchContractResponse?.data?.data || {};
        if (finalSignedContract) {
          try {
            const response = await fetch(finalSignedContract, {
              mode: 'cors',
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = contractName || 'SignedContract.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } catch (err) {
            console.error('Failed to download file:', err);
          }
        }
      } else {
        console.error('Error in fetching Contract Details', fetchContractResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = fetchContractResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in fetchContractDetails', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const initiateGoogleCalendarAuth = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const { errorMessage, successMessage, errorRedirectUrl, successRedirectUrl, retainUrlParams } =
      parameters;
    let response = {};
    try {
      const authUrl = 'google/google-calendar/auth';
      const finalPath = retainUrlParams ? retainURLParamsHashQuery() : '';
      const itemData = {
        successRedirectUrl: successRedirectUrl
          ? new URL(successRedirectUrl + finalPath, window.location.origin).href
          : undefined,
        errorRedirectUrl: errorRedirectUrl
          ? new URL(errorRedirectUrl + finalPath, window.location.origin).href
          : undefined,
      };
      const authUrlResponse = await unSecuredPostCall(itemData, authUrl);
      if (authUrlResponse && authUrlResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = authUrlResponse;
        response.status = 'success';
        window.location.href = authUrlResponse?.data?.authUrl;
      } else {
        console.error('Error in initiating Google Calendar Auth', authUrlResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = authUrlResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in initiateGoogleCalendarAuth', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const fetchGoogleCalendarEvents = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const {
      errorMessage,
      successMessage,
      collection,
      userIdentifierField,
      fetchOnlyFutureEvents,
      fetchEventsTill,
    } = parameters;
    let response = {};
    try {
      const fetchCalendarEventsUrl = 'google/google-calendar/events';
      const fetchCalendarEventsResponse = await unSecuredPostCall(
        { collection, userIdentifierField, fetchOnlyFutureEvents, fetchEventsTill },
        fetchCalendarEventsUrl,
      );
      if (fetchCalendarEventsResponse && fetchCalendarEventsResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = fetchCalendarEventsResponse;
        response.status = 'success';
      } else {
        console.error('Error in fetching Calendar Events', fetchCalendarEventsResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = fetchCalendarEventsResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in fetchCalendarEvents', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const syncGoogleCalendarEvents = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const {
      errorMessage,
      successMessage,
      collection,
      userIdentifierField,
      fetchOnlyFutureEvents,
      fetchEventsTill,
    } = parameters;
    let response = {};
    try {
      const syncCalendarEventsUrl = 'google/google-calendar/sync-events';
      const syncCalendarEventsResponse = await unSecuredPostCall(
        { collection, userIdentifierField, fetchOnlyFutureEvents, fetchEventsTill },
        syncCalendarEventsUrl,
      );
      if (syncCalendarEventsResponse && syncCalendarEventsResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = syncCalendarEventsResponse;
        response.status = 'success';
      } else {
        console.error('Error in syncing Calendar Events', syncCalendarEventsResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = syncCalendarEventsResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in syncCalendarEvents', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const initiateGoogleMeetAuth = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const { errorMessage, successMessage, errorRedirectUrl, successRedirectUrl, retainUrlParams } =
      parameters;
    let response = {};
    try {
      const authUrl = 'google/google-meet/auth';
      const finalPath = retainUrlParams ? retainURLParamsHashQuery() : '';
      const itemData = {
        successRedirectUrl: successRedirectUrl
          ? new URL(successRedirectUrl + finalPath, window.location.origin).href
          : undefined,
        errorRedirectUrl: errorRedirectUrl
          ? new URL(errorRedirectUrl + finalPath, window.location.origin).href
          : undefined,
      };
      const authUrlResponse = await unSecuredPostCall(itemData, authUrl);
      if (authUrlResponse && authUrlResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = authUrlResponse;
        response.status = 'success';
        window.location.href = authUrlResponse?.data?.authUrl;
      } else {
        console.error('Error in initiating Google Meet Auth', authUrlResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = authUrlResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in initiateGoogleMeetAuth', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const createInstantGoogleMeet = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, collection, summaryField, descriptionField, duration } =
      parameters;
    let response = {};
    try {
      const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
      const createMeetUrl = 'google/google-meet/create-instant-meeting';
      const createMeetResponse = await unSecuredPostCall(
        { collection, summaryField, descriptionField, duration, itemId },
        createMeetUrl,
      );
      if (createMeetResponse && createMeetResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = createMeetResponse;
        response.status = 'success';
        window.open(createMeetResponse?.data?.meetLink, '_blank');
      } else {
        console.error('Error in creating instant Google Meet', createMeetResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = createMeetResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in createInstantGoogleMeet', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const scheduleGoogleCalendarEvent = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, collection } = parameters;
    let response = {};
    try {
      const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
      const scheduleEventUrl = 'google/google-calendar/schedule-calendar-event';
      const scheduleEventResponse = await unSecuredPostCall(
        { ...parameters, itemId },
        scheduleEventUrl,
      );
      if (scheduleEventResponse && scheduleEventResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = scheduleEventResponse;
        response.status = 'success';
      } else {
        console.error('Error in scheduling Google Calendar Event', scheduleEventResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = scheduleEventResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in scheduleCalendarEvent', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const deleteGoogleCalendarEvent = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, collection, eventIdField, sendNotification } = parameters;
    let response = {};
    try {
      const itemId = elementAttribute(targetElement, 'data-item-id');
      const deleteEventUrl = 'google/google-calendar/delete-calendar-event';
      const deleteEventResponse = await unSecuredPostCall(
        { collection, eventIdField, itemId, sendNotification },
        deleteEventUrl,
      );
      if (deleteEventResponse && deleteEventResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = deleteEventResponse;
        response.status = 'success';
      } else {
        console.error('Error in deleting Google Calendar Event', deleteEventResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = deleteEventResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in deleteCalendarEvent', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const addDataKnowledgeBase = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, response: previousResponse } = args;
    const { errorMessage, successMessage, collection, fieldForDoc } = parameters;
    const data = previousResponse?.data || {};
    const itemId = data?.uuid;
    let response = {};
    try {
      if (!collection || !fieldForDoc || !itemId) {
        throw new Error('All Fields is Required(collection,itemId,fieldForContext,fieldForQuery)');
      }
      const addDataKnowledgeBaseUrl = 'pinecone/upload-data';
      const addDataKnowledgeBaseResponse = await securedPostCall(
        { collection, fieldForDoc, itemId },
        addDataKnowledgeBaseUrl,
      );
      if (addDataKnowledgeBaseResponse && addDataKnowledgeBaseResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = addDataKnowledgeBaseResponse;
        response.status = 'success';
      } else {
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = addDataKnowledgeBaseResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in Add Data In Knowledge base ', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const queryFromKnowledgeBase = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, response: previousResponse } = args;
    const { errorMessage, successMessage, collection, fieldForQuery, fieldForContext } = parameters;
    const data = previousResponse?.data || {};
    const itemId = data?.uuid;
    const query = data?.[fieldForQuery] || 'i cant have any question From user';
    const chatbotRef = document.querySelector('.chatbox-message-content');
    if (query) {
      addMessage(chatbotRef, query, true);
    } else {
      return;
    }
    const typingDiv = showTyping(chatbotRef);
    let response = {};
    try {
      if (!collection || !fieldForQuery || !fieldForContext || !itemId) {
        removeTyping(typingDiv);
        throw new Error('All Fields is Required(collection,itemId,fieldForContext,fieldForQuery)');
      }
      const queryFromKnowledgeBaseUrl = 'pinecone/query-from-knowledge-base';
      const queryFromKnowledgeBaseResponse = await securedPostCall(
        { collection, fieldForQuery, fieldForContext, itemId },
        queryFromKnowledgeBaseUrl,
      );
      if (queryFromKnowledgeBaseResponse && queryFromKnowledgeBaseResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = queryFromKnowledgeBaseResponse;
        response.status = 'success';
        removeTyping(typingDiv);
      } else {
        if (errorMessage) toastr.error(errorMessage, 'Error');
        removeTyping(typingDiv);
        response.data = queryFromKnowledgeBaseResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in query from Knowledge base ', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      removeTyping(typingDiv);
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const answerFromChatbot = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, response: previousResponse } = args;
    const {
      errorMessage,
      successMessage,
      fieldForQuery,
      fieldForContext,
      collectionForAiChatbot,
      fieldForQueryContext,
      fieldForAnswer,
    } = parameters;
    const data = previousResponse?.data?.data || {};
    let response = {};
    const chatbotRef = document.querySelector('.chatbox-message-content');
    const typingDiv = showTyping(chatbotRef);
    try {
      if (
        !fieldForQuery ||
        !fieldForContext ||
        !collectionForAiChatbot ||
        !fieldForQueryContext ||
        !fieldForAnswer
      ) {
        throw new Error(
          'All Fields is Required collectionForAiChatbot,fieldForQueryContext ,fieldForAnswer',
        );
      }
      const query = data?.[fieldForQuery] || '';
      const context = data?.[fieldForContext] || '';
      if (!context || !query) {
        const answer = 'Sorry, I could not find the answer in my knowledge base';
        const chatHistory = localStorage.getItem('chatHistory');
        if (chatHistory) {
          const existingChatHistory = JSON.parse(chatHistory);
          existingChatHistory.push({ query, answer });
          localStorage.setItem('chatHistory', JSON.stringify(existingChatHistory));
        } else {
          localStorage.setItem('chatHistory', JSON.stringify([{ query, answer }]));
        }
        removeTyping(typingDiv);
        addMessage(chatbotRef, answer, false);
        return;
      }
      const answerFromChatbotUrl = 'pinecone/answer-from-chatbot';
      const answerFromChatbotResponse = await securedPostCall(
        {
          query,
          context,
          collectionForAiChatbot,
          fieldForQueryContext,
          fieldForAnswer,
        },
        answerFromChatbotUrl,
      );
      if (answerFromChatbotResponse && answerFromChatbotResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = answerFromChatbotResponse;
        const answer =
          answerFromChatbotResponse?.data?.data?.message?.[fieldForAnswer] ||
          'I am unable to fetch the answer from the chatbot.';
        removeTyping(typingDiv);
        addMessage(chatbotRef, answer, false);
        const chatHistory = localStorage.getItem('chatHistory');
        if (chatHistory) {
          const existingChatHistory = JSON.parse(chatHistory);
          existingChatHistory.push({ query, answer });
          localStorage.setItem('chatHistory', JSON.stringify(existingChatHistory));
        } else {
          localStorage.setItem('chatHistory', JSON.stringify([{ query, answer }]));
        }
        response.status = 'success';
      } else {
        console.error('Error in answerFromChatbot', answerFromChatbotResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        const answer =
          'I am unable to fetch the answer from the Chatbot check your api key and billing.';
        removeTyping(typingDiv);
        addMessage(chatbotRef, answer, false);
        response.data = answerFromChatbotResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in answerFromChatbot  ', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      const answer = 'Failed in fetching answer from the Ai Chatbot';
      removeTyping(typingDiv);
      addMessage(chatbotRef, answer, false);
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
  } else {
    return disabledActionResponse(args);
  }
};

const continueConversation = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const { errorMessage, successMessage } = parameters;
    let response = {};
    const chatbotRef = document.querySelector('.chatbox-message-content');
    try {
      const chatbox = localStorage.getItem('chatbox');
      const cachedChat = localStorage.getItem('chatHistory');
      if (cachedChat && chatbox === 'true') {
        chatbotRef.innerHTML = '';
        const parsedChat = JSON.parse(cachedChat);
        const lastChatbotUser = localStorage.getItem('ChatbotUser') || '';
        const currentUser = fetchLoggedInUserJson()?.userName || '';
        if (lastChatbotUser !== currentUser) {
          localStorage.removeItem('chatHistory');
          localStorage.removeItem('chatbox');
        } else if (!Array.isArray(parsedChat)) {
        } else if (parsedChat.length > 0) {
          parsedChat.forEach((msg) => {
            if (msg.query) {
              addMessage(chatbotRef, msg.query, true);
            }
            if (msg.answer) {
              addMessage(chatbotRef, msg.answer, false);
            }
          });
          response.data = parsedChat;
          response.status = 'success';
          return response;
        }
      }
      const continueFromChatUrl = 'pinecone/continue-conversation';
      const continueFromChatResponse = await securedPostCall('', continueFromChatUrl);
      if (continueFromChatResponse && continueFromChatResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        const messages = continueFromChatResponse?.data?.chatHistory || [];
        if (messages.length > 0) {
          chatbotRef.innerHTML = '';
          messages.forEach((msg) => {
            if (msg?.query) {
              addMessage(chatbotRef, msg.query, true);
            }
            if (msg?.answer) {
              addMessage(chatbotRef, msg.answer, false);
            }
          });
          localStorage.setItem('chatHistory', JSON.stringify(messages));
          localStorage.setItem('chatbox', 'true');
        } else {
          const { intialMessage, username } = await getIntialMessage();
          localStorage.setItem('ChatbotUser', username);
          addMessage(chatbotRef, intialMessage, false);
          localStorage.setItem('chatHistory', JSON.stringify([]));
          localStorage.setItem('chatbox', 'true');
        }
        response.status = 'success';
      } else {
        console.error('Error in continueConversation ', continueFromChatResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = continueFromChatResponse;
        response.status = 'error';
      }
      return response;
    } catch (error) {
      console.error('Error in continueConversation  ', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      const answer = 'Error in fetching old conversation  the Ai.';
      addMessage(chatbotRef, answer, false);
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
  } else {
    return disabledActionResponse(args);
  }
};

const addMessage = (chatbotRef, text, isUser = false) => {
  if (!chatbotRef) return;
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chatbox-message-item');
  if (isUser) {
    messageDiv.classList.add('sent');
  } else {
    messageDiv.classList.add('received');
  }
  messageDiv.textContent = text;
  chatbotRef.appendChild(messageDiv);
  chatbotRef.scrollTop = chatbotRef.scrollHeight;
};

const showTyping = (chatbotRef) => {
  if (!chatbotRef) return null;
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('chatbox-message-item', 'received', 'typing');
  typingDiv.innerHTML = `<span></span><span></span><span></span>`;
  chatbotRef.appendChild(typingDiv);
  chatbotRef.scrollTop = chatbotRef.scrollHeight;
  return typingDiv;
};

const removeTyping = (typingDiv) => {
  if (typingDiv && typingDiv.parentNode) {
    typingDiv.parentNode.removeChild(typingDiv);
  }
};

const getIntialMessage = async () => {
  const aiChatbot = await fetchInstalledPluginByCode('AI_CHATBOT');
  const { setting } = aiChatbot || {};
  const initialMessage = setting?.initial_message || 'How can I assist you today?';
  const user = fetchLoggedInUserJson() || {};
  let displayName = 'there';
  if (user?.userName) {
    if (user.userName.includes('@')) {
      displayName = user.userName.split('@')[0];
    } else {
      displayName = user.userName;
    }
  }
  return {
    username: user?.userName || '',
    intialMessage: `Hello ${displayName}, ${initialMessage}`,
  };
};

const generateOnlyEmailOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { successMessage, errorMessage, otpAuthenticationType, otpVerificationPage } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.otpAuthenticationType = otpAuthenticationType || 'login';
      const generateOtpUrl = 'auth/generate-email-otp';
      const generateOtpResponse = await unSecuredPostCall(formData, generateOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { emailOtpToken } = generateOtpResponse.data;
        response.data = generateOtpResponse;
        response.status = 'success';
        if (successMessage) toastr.success(successMessage, 'Success');
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?emailOtpToken=${emailOtpToken}`;
        }
      }
    } catch (error) {
      console.error('Error in generating Email OTP. Please Try Again', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const generateOnlySMSOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { successMessage, errorMessage, otpAuthenticationType, otpVerificationPage } = parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.otpAuthenticationType = otpAuthenticationType || 'login';
      const generateOtpUrl = 'auth/generate-sms-otp';
      const generateOtpResponse = await unSecuredPostCall(formData, generateOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { smsOtpToken } = generateOtpResponse.data;
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = generateOtpResponse;
        response.status = 'success';
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?smsOtpToken=${smsOtpToken}`;
        }
      }
    } catch (error) {
      console.error('Error in generating SMS OTP. Please Try Again', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const initiateZoomAuth = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters } = args;
    const { errorMessage, successMessage, errorRedirectUrl, successRedirectUrl, retainUrlParams } =
      parameters;
    let response = {};
    try {
      const authUrl = 'zoom/auth';
      const finalPath = retainUrlParams ? retainURLParamsHashQuery() : '';
      const itemData = {
        successRedirectUrl: successRedirectUrl
          ? new URL(successRedirectUrl + finalPath, window.location.origin).href
          : undefined,
        errorRedirectUrl: errorRedirectUrl
          ? new URL(errorRedirectUrl + finalPath, window.location.origin).href
          : undefined,
      };
      const authUrlResponse = await unSecuredPostCall(itemData, authUrl);
      if (authUrlResponse && authUrlResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = authUrlResponse;
        response.status = 'success';
        window.location.href = authUrlResponse?.data?.authUrl;
      } else {
        console.error('Error in initiating Zoom Auth', authUrlResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = authUrlResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in initiateZoomAuth', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const createInstantZoomMeet = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, collection, summaryField, descriptionField, duration } =
      parameters;
    let response = {};
    try {
      const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
      const createMeetUrl = 'zoom/create-instant-meeting';
      const createMeetResponse = await unSecuredPostCall(
        { collection, summaryField, descriptionField, duration, itemId },
        createMeetUrl,
      );
      if (createMeetResponse && createMeetResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = createMeetResponse;
        response.status = 'success';
        window.open(createMeetResponse?.data?.joinUrl, '_blank');
      } else {
        console.error('Error in creating instant Zoom Meet', createMeetResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = createMeetResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in createInstantZoomMeet', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const cibilConsumerReport = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { successMessage, errorMessage, collection } = parameters;
    let response = {};
    try {
      const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
      const cibilConsumerReportUrl = 'cibil/consumer-report';
      const cibilConsumerReportResponse = await unSecuredPostCall(
        { ...parameters, itemId },
        cibilConsumerReportUrl,
      );
      if (cibilConsumerReportResponse && cibilConsumerReportResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = cibilConsumerReportResponse;
        response.status = 'success';
      }
    } catch (error) {
      console.error('Error in cibilConsumerReport', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const initiateBoxAuth = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters } = args;
  const { errorMessage, successMessage, errorRedirectUrl, successRedirectUrl, retainUrlParams } =
    parameters;
  let response = {};
  try {
    const finalPath = retainUrlParams ? retainURLParamsHashQuery() : '';
    const itemData = {
      successRedirectUrl: successRedirectUrl
        ? new URL(successRedirectUrl + finalPath, window.location.origin).href
        : undefined,
      errorRedirectUrl: errorRedirectUrl
        ? new URL(errorRedirectUrl + finalPath, window.location.origin).href
        : undefined,
    };
    const authUrlResponse = await unSecuredPostCall(itemData, 'box/auth');
    if (authUrlResponse && authUrlResponse.status === 200) {
      if (successMessage) toastr.success(successMessage, 'Success');
      response.data = authUrlResponse;
      response.status = 'success';
      window.location.href = authUrlResponse?.data?.authUrl;
    } else {
      console.error('Error in initiating Box Auth', authUrlResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = authUrlResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in initiateBoxAuth', error);
    if (errorMessage) toastr.error(errorMessage, 'Error');
    response.data = error?.response;
    response.status = 'error';
  } finally {
    actionCompleted(args);
  }
  return response;
};

const uploadFileToBox = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, fileField, folderField, collection } = parameters;
    let response = {};
    try {
      const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
      const boxUploadUrl = 'box/upload';
      const boxUploadResponse = await unSecuredPostCall(
        { fileField, folderField, itemId, collection },
        boxUploadUrl,
      );
      if (boxUploadResponse && boxUploadResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = boxUploadResponse;
        response.status = 'success';
      } else {
        console.error('Error in uploading File to Box', boxUploadResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = boxUploadResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in uploadFileToBox', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    disabledActionResponse(args);
  }
};

const generateQR = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { errorMessage, successMessage, dataField, collection, saveQRField, codeType } =
      parameters;
    let response = {};
    try {
      const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
      const generateQRUrl = 'qr/generate';
      const generateQRResponse = await unSecuredPostCall(
        { dataField, itemId, collection, saveQRField, codeType },
        generateQRUrl,
      );
      if (generateQRResponse && generateQRResponse.status === 200) {
        if (successMessage) toastr.success(successMessage, 'Success');
        response.data = generateQRResponse;
        response.status = 'success';
      } else {
        console.error('Error in generating QR', generateQRResponse);
        if (errorMessage) toastr.error(errorMessage, 'Error');
        response.data = generateQRResponse;
        response.status = 'error';
      }
    } catch (error) {
      console.error('Error in generateQR', error);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = error?.response;
      response.status = 'error';
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    disabledActionResponse(args);
  }
};

const retainURLParamsHashQuery = () => {
  try {
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/').filter(Boolean).slice(1).join('/');
    const appendedPath = pathSegments ? `/${pathSegments}` : '';
    const appendedQuery = url.search || '';
    const appendedHash = url.hash || '';
    return `${appendedPath}${appendedQuery}${appendedHash}`;
  } catch (error) {
    console.error('Error in retainURLParamsHashQuery:', error);
    return '';
  }
};

const forceLogoutUser = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { parameters, targetElement } = args;
    const { getItemIdFrom } = parameters;
    let response = {};
    let itemId = '';
    try {
      switch (getItemIdFrom) {
        case 'sendPreviousStepParentCollectionId':
          const responseObj = handleCurrentObjectUrl(args?.response);
          itemId = responseObj.itemId;
          break;
        case 'sendCurrentPageItemId':
          const pathArray = window.location.pathname.split('/');
          itemId = pathArray[pathArray.length - 1];
          break;
        case 'currentUser':
          const loggedInUser = fetchLoggedInUserJson();
          itemId = loggedInUser?.uuid;
          break;
        default:
          //Extract Collection ID from CMS list Link/Button
          itemId = elementAttribute(targetElement, 'data-item-id');
          break;
      }
      if (!itemId) {
        toastr.error('Item id not Found', 'Error');
        return response;
      }
      const endpoint = `/logout-all/${itemId}`;
      const header = await getHeaderForServerForPublicRequest();
      const response = await axios.post(endpoint, header);
      if (response.status === 200) {
        const { userSub, message } = response.data;
        await loginActivityTracker('Logout', userSub);
        toastr.success(message, 'Success');
        response.data = response;
        response.status = 'success';
        if (getItemIdFrom === 'currentUser') await processLogoutUser(`/login`);
      }
    } catch (error) {
      console.error('Error in forceLogoutUser', error);
      response.data = error?.response;
      response.status = 'error';
      const msg = response?.data?.data?.message;
      toastr.error(msg, 'Error');
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const initiateQRCodeReader = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters } = args;
  const { errorMessage, successMessage } = parameters;
  let response = {};
  try {
    const overlay = document.createElement('div');
    overlay.style = `
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.85);
      z-index: 9999; display: flex;
      flex-direction: column; align-items: center;
      justify-content: center; color: #fff;
      padding: 20px; box-sizing: border-box;
    `;
    overlay.innerHTML = `
      <h2 style="margin-bottom:20px;text-align:center;">Scan QR Code</h2>
      <div id="qr-buttons" style="display:flex; flex-direction:column; align-items:center;">
        <button id="qr-camera-btn" 
          style="background:#1e90ff;padding:12px 20px;border:none;color:#fff;border-radius:6px;margin-bottom:15px;font-size:16px;cursor:pointer;">
          Scan Using Camera
        </button>
        <button id="qr-upload-btn" 
          style="background:#4CAF50;padding:12px 20px;border:none;color:#fff;border-radius:6px;margin-bottom:15px;font-size:16px;cursor:pointer;">
          Upload QR Image
        </button>
      </div>
      <div id="qr-reader" style="width:300px; max-width:90%; margin-top:20px; display:none;"></div>
      <button id="qr-close-btn" 
        style="background:red;padding:10px 20px;border:none;color:#fff;border-radius:6px;font-size:15px;cursor:pointer;margin-top:20px;">
        Close
      </button>
    `;
    document.body.appendChild(overlay);
    const cameraBtn = overlay.querySelector('#qr-camera-btn');
    const uploadBtn = overlay.querySelector('#qr-upload-btn');
    const closeBtn = overlay.querySelector('#qr-close-btn');
    const qrButtonsDiv = overlay.querySelector('#qr-buttons');
    const qrReaderDiv = overlay.querySelector('#qr-reader');
    if (!window.Html5Qrcode) {
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/html5-qrcode@2.3.10/minified/html5-qrcode.min.js';
        s.onload = resolve;
        document.head.appendChild(s);
      });
    }
    let html5QrCode = null;
    const handleResult = (decodedText) => {
      console.log('QR Detected:', decodedText);
      if (html5QrCode) html5QrCode.stop().catch(() => {});
      overlay.remove();
      if (decodedText.startsWith('http')) {
        window.location.href = decodedText;
      } else {
        alert(`QR Code: ${decodedText}`);
      }
    };
    cameraBtn.onclick = async () => {
      try {
        qrButtonsDiv.style.display = 'none';
        qrReaderDiv.style.display = 'block';
        qrReaderDiv.style.width = '80vw';
        qrReaderDiv.style.maxWidth = '800px';
        qrReaderDiv.style.height = 'auto';
        html5QrCode = new Html5Qrcode('qr-reader');
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 500 },
          (decodedText) => handleResult(decodedText),
          (errorMessage) => console.warn(errorMessage),
        );
        toastr.success(successMessage || 'Camera started. Point it at a QR code.', 'Success');
      } catch (err) {
        console.error('Camera error:', err);
        toastr.error(errorMessage || 'Failed to access camera.', 'Error');
      }
    };
    uploadBtn.onclick = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const qrCode = new Html5Qrcode('qr-reader');
          const result = await qrCode.scanFile(file, true);
          handleResult(result);
        } catch (err) {
          console.error('QR Scan Failed:', err);
          toastr.error('Could not detect QR in selected image.', 'Error');
        }
      };
      fileInput.click();
    };
    closeBtn.onclick = () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
      overlay.remove();
    };
    response = {
      status: 'success',
      data: {
        success: true,
        message: successMessage || 'QR Code reader ready.',
      },
    };
  } catch (error) {
    console.error('QR Reader Error:', error);
    response = {
      status: 'error',
      data: {
        success: false,
        message: errorMessage || 'Failed to initialize QR reader.',
        error,
      },
    };
    toastr.error(errorMessage || 'Failed to start QR reader.', 'Error');
  } finally {
    actionCompleted(args);
  }
  return response;
};

const generateOnlyUserConsentEmailOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { otpVerificationPage, successMessage, errorMessage, collection, dataOperationType } =
      parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.collection = collection;
      setJsonInLocalStorage('tempData', formData);
      const itemData = {
        collection,
        dataOperationType,
        formData,
      };
      if (dataOperationType === 'update') {
        const { itemId } = await getItemIdForSnippet(collection, args, element);
        itemData.itemId = itemId;
      }
      const generateUserConsentOtpUrl = 'user-consent/generate-consent-email-otp';
      const generateOtpResponse = await unSecuredPostCall(itemData, generateUserConsentOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { emailOtpToken } = generateOtpResponse.data;
        response.data = generateOtpResponse;
        response.status = 'success';
        response.data.collectionSaveOrUpdateResponse = generateOtpResponse?.data?.response;
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?emailOtpToken=${emailOtpToken}`;
        }
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Error in generating User Consent Email OTP. Please Try Again', error);
      localStorage.removeItem('tempData');
      if (
        error?.response?.data?.message &&
        error?.response?.data?.message.includes('is not a valid')
      ) {
        toastr.error(error.response.data.message, 'Error');
      } else if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      }
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const generateOnlyUserConsentSmsOTP = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    const { element, parameters } = args;
    const { otpVerificationPage, successMessage, errorMessage, collection, dataOperationType } =
      parameters;
    let response = {};
    try {
      const form = element;
      const formData = await serializeFormData(form.elements);
      formData.collection = collection;
      setJsonInLocalStorage('tempData', formData);
      const itemData = {
        collection,
        dataOperationType,
        formData,
      };
      if (dataOperationType === 'update') {
        const { itemId } = await getItemIdForSnippet(collection, args, element);
        itemData.itemId = itemId;
      }
      const generateUserConsentOtpUrl = 'user-consent/generate-consent-sms-otp';
      const generateOtpResponse = await unSecuredPostCall(itemData, generateUserConsentOtpUrl);
      if (generateOtpResponse && generateOtpResponse.status === 200) {
        const { smsOtpToken } = generateOtpResponse.data;
        response.data = generateOtpResponse;
        response.status = 'success';
        response.data.collectionSaveOrUpdateResponse = generateOtpResponse?.data?.response;
        if (otpVerificationPage) {
          window.location.href = `${otpVerificationPage}?smsOtpToken=${smsOtpToken}`;
        }
        if (successMessage) toastr.success(successMessage, 'Success');
      }
    } catch (error) {
      console.error('Error in generating User Consent Sms OTP. Please Try Again', error);
      localStorage.removeItem('tempData');
      console.log('error.response', error.response);
      if (
        error?.response?.data?.message &&
        error?.response?.data?.message.includes('is not a valid')
      ) {
        toastr.error(error.response.data.message, 'Error');
      } else if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      }
      response.data = error?.response;
      response.status = 'failure';
      throw Error(error);
    } finally {
      actionCompleted(args);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const initiateMPesaC2BPayment = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters, targetElement } = args;
  const {
    errorMessage,
    successMessage,
    collection,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  let response = {};
  try {
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    const mPesaUrl = 'mpesa/c2b/stkpush';
    const mPesaResponse = await unSecuredPostCall({ ...parameters, itemId }, mPesaUrl);
    if (mPesaResponse && mPesaResponse.status === 200) {
      const message = successMessage || mPesaResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      processActionResponse(
        response,
        mPesaResponse,
        'mpesa_callback_responses',
        passPreviousActionResponse,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      );
    } else {
      console.error('Error in initating MPesa C2B Payment:', mPesaResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = mPesaResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in initiateMPesaC2BPayment:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const initiateMPesaB2CPayout = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters, targetElement } = args;
  const {
    errorMessage,
    successMessage,
    collection,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  let response = {};
  try {
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    const mPesaUrl = 'mpesa/b2c/initiate';
    const mPesaResponse = await unSecuredPostCall({ ...parameters, itemId }, mPesaUrl);
    if (mPesaResponse && mPesaResponse.status === 200) {
      const message = successMessage || mPesaResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      processActionResponse(
        response,
        mPesaResponse,
        'mpesa_callback_responses',
        passPreviousActionResponse,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      );
    } else {
      console.error('Error in initating MPesa B2C Payout:', mPesaResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = mPesaResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in initiateMPesaB2CPayout:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const registerMpesaC2BUrls = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters } = args;
  const { errorMessage, successMessage } = parameters;
  let response = {};
  try {
    const mPesaUrl = 'mpesa/c2b/register-url';
    const mPesaResponse = await unSecuredPostCall({}, mPesaUrl);
    if (mPesaResponse && mPesaResponse.status === 200) {
      const message = successMessage || mPesaResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      response.data = mPesaResponse;
      response.status = 'success';
    } else {
      console.error('Error in registering MPesa C2B Urls:', mPesaResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = mPesaResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in registerMpesaC2bUrls:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  return response;
};

const iprsKenya = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters, targetElement } = args;
  const {
    errorMessage,
    successMessage,
    collection,
    identifierField,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  let response = {};
  try {
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    const iprsUrl = 'spin-mobile/iprs-kenya';
    const iprsResponse = await unSecuredPostCall({ collection, identifierField, itemId }, iprsUrl);
    if (iprsResponse && iprsResponse.status === 200) {
      const message = successMessage || iprsResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      processActionResponse(
        response,
        iprsResponse,
        'iprs_kenya_data',
        passPreviousActionResponse,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      );
    } else {
      console.error('Error in IPRS - Kenya:', iprsResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = iprsResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in iprsKenya:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const metropolCreditReport = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters, targetElement } = args;
  const {
    errorMessage,
    successMessage,
    collection,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  let response = {};
  try {
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    const metropolUrl = 'spin-mobile/credit-report/metropol';
    const metropolResponse = await unSecuredPostCall({ ...parameters, itemId }, metropolUrl);
    if (metropolResponse && metropolResponse.status === 200) {
      const message = successMessage || metropolResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      processActionResponse(
        response,
        metropolResponse,
        'metropol_credit_reports',
        passPreviousActionResponse,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      );
    } else {
      console.error('Error in Metropol Credit Report:', metropolResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = metropolResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in metropolCreditReport:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const masking = (subject, visibleCharCount = 2, maskPosition = 'END', maskCharacter = '*') => {
  if (subject === null || subject === undefined) return '';
  if (subject === 0) return '0';
  const str = String(subject);
  const visibleCount = parseInt(visibleCharCount, 10);
  if (isNaN(visibleCount) || visibleCount <= 0) return str;
  const maskChar = maskCharacter || '*';
  const length = str.length;
  if (visibleCount >= length) return str;
  const maskedPart = maskChar.repeat(length - visibleCount);
  if (maskPosition === 'START') {
    return str.slice(0, visibleCount) + maskedPart;
  } else if (maskPosition === 'END') {
    return maskedPart + str.slice(-visibleCount);
  } else {
    const start = Math.floor((length - visibleCount) / 2);
    const end = start + visibleCount;
    return str.slice(0, start) + maskChar.repeat(length - visibleCount) + str.slice(end);
  }
};

const kraPinChecker = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters, targetElement } = args;
  const {
    errorMessage,
    successMessage,
    collection,
    identifierField,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  let response = {};
  try {
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    const kraPinCheckerUrl = 'spin-mobile/kra-pin-checker';
    const kraPinCheckerResponse = await unSecuredPostCall(
      { collection, identifierField, itemId },
      kraPinCheckerUrl,
    );
    if (kraPinCheckerResponse && kraPinCheckerResponse.status === 200) {
      const message = successMessage || kraPinCheckerResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      processActionResponse(
        response,
        kraPinCheckerResponse,
        'kra_pin_checks',
        passPreviousActionResponse,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      );
    } else {
      console.error('Error in kraPinChecker', kraPinCheckerResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = kraPinCheckerResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in kraPinChecker:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const saveUserWithTenantsAndUserSetting = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const {
      userRole,
      createTenant,
      createSubTenant,
      createUserSetting,
      enableLoginUser,
      redirectUrl,
      successMessage,
      errorMessage,
      passPreviousActionFormData,
      formDataSessionKey,
      formDataBrowserStorageLocation,
      passPreviousActionResponse,
      responseDataSessionKey,
      responseDataSessionStorageLocation,
      enableConsoleLog,
      startConsoleLog,
      endConsoleLog,
    } = args.parameters;
    const eventConfig = { createTenant, createSubTenant, createUserSetting };
    let form = getFormElement(args);
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const data = await serializeFormData(form.elements);
    data['userRoles'] = data['userRoles'] ? data['userRoles'] : [userRole];

    if (enableLoginUser) {
      showErrorOnField(form, data, 'userName', 'Please enter username');
      showErrorOnField(form, data, 'password', 'Please enter password');
    }

    let cleanFormDataForSession = clearDataForSessionStorage(data);

    // Need this for Request Type support
    // let isSecuredCall = true;
    // if (!collectionRequest || collectionRequest == 'Open') isSecuredCall = false;
    if (
      passPreviousActionFormData &&
      (passPreviousActionFormData == true || passPreviousActionFormData === 'true')
    ) {
      if (formDataBrowserStorageLocation && formDataSessionKey) {
        setDataInSessionStorageLocation(
          formDataBrowserStorageLocation,
          formDataSessionKey,
          cleanFormDataForSession,
        );
      } else {
        // Fallback handling
        // TODO: Ali -> Remove after complete migration
        let previousActionFormData = sessionStorage.getItem('previousActionFormData');
        if (previousActionFormData) {
          previousActionFormData = JSON.parse(previousActionFormData);
          sessionStorage.setItem(
            'previousActionFormData',
            JSON.stringify({ ...previousActionFormData, ...cleanFormDataForSession }),
          );
        } else {
          sessionStorage.setItem('previousActionFormData', JSON.stringify(cleanFormDataForSession));
        }
      }
    }

    let endpoint = 'auth/create-user-with-multi-tenant-fields';
    let response = {};
    let apiCallResult;
    try {
      apiCallResult = await unSecuredPostCall({ userData: data, eventConfig }, endpoint);
      response.data = apiCallResult;
      response.data.collectionSaveOrUpdateResponse = apiCallResult;
      response.data.collectionFormData = cleanFormDataForSession;
      response.status = 'success';
      const { collectionSaveOrUpdateResponse } = response.data;
      const { config, data: collectionItemData } = collectionSaveOrUpdateResponse;
      let collectionName = 'user';
      const collectionItemId = collectionItemData.uuid;
      const collectionKey = `collection_${collectionName}`;
      const collectionItemUuidKey = 'uuid';
      const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };

      if (
        passPreviousActionResponse &&
        (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
      ) {
        setDataInSessionStorageLocation(
          responseDataSessionStorageLocation,
          responseDataSessionKey,
          collectionData,
        );
      } else {
        // Fallback handling
        // TODO: Ali -> Remove after complete migration
        let previousActionResponse = sessionStorage.getItem('previousActionResponse');
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ ...previousActionResponse, ...collectionData }),
          );
        } else {
          sessionStorage.setItem('previousActionResponse', JSON.stringify(collectionData));
        }
      }
      response.data = { ...response.data, ...collectionData };
      resetCollectionForm(form);
      if (successMessage) {
        toastr.success(successMessage, 'Success');
      }

      if (enableLoginUser) {
        if (!data.password) {
          data.password = generateTemporaryPassword();
        }
        if (!data.userName) {
          data.userName = 'anonymous-user-login';
        }
        const loginFormData = {
          userName: data.userName,
          password: data.password,
        };
        if (data.hasOwnProperty('email') && data.email !== '') {
          loginFormData.email = data.email;
          validateLoginFormData(data, loginFormData);
        }
        await loginIntoApplication(args, loginFormData, redirectUrl, null, null);
      }
    } catch (error) {
      if (errorMessage) {
        toastr.error(errorMessage, 'Error');
      } else if (error.response.data) {
        toastr.error(error.response.data, 'Error');
      }
    } finally {
      actionCompleted(args);
    }
    // Action Exit Custom Log
    if (enableConsoleLog) {
      const endLog = cleanConsoleLogArgs(endConsoleLog);
      logActionMessage(endLog);
    }
    return response;
  } else {
    return disabledActionResponse(args);
  }
};

const eStatementAnalysis = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (!actionEnabled) return disabledActionResponse(args);
  const { parameters, targetElement } = args;
  const {
    errorMessage,
    successMessage,
    collection,
    passPreviousActionResponse,
    responseDataSessionKey,
    responseDataSessionStorageLocation,
    enableConsoleLog,
    startConsoleLog,
    endConsoleLog,
  } = parameters;
  let response = {};
  try {
    // Action Entry Custom Log
    if (enableConsoleLog) {
      const startLog = cleanConsoleLogArgs(startConsoleLog);
      logActionMessage(startLog);
    }
    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    const eStatementAnalysisUrl = 'spin-mobile/e-statement-analysis';
    const eStatementAnalysisResponse = await unSecuredPostCall(
      { ...parameters, itemId },
      eStatementAnalysisUrl,
    );
    if (eStatementAnalysisResponse && eStatementAnalysisResponse.status === 200) {
      const message = successMessage || eStatementAnalysisResponse?.data?.message || 'Success';
      toastr.success(message, 'Success');
      processActionResponse(
        response,
        eStatementAnalysisResponse,
        'e_statement_analysis',
        passPreviousActionResponse,
        responseDataSessionKey,
        responseDataSessionStorageLocation,
      );
    } else {
      console.error('Error in eStatementAnalysis', eStatementAnalysisResponse);
      if (errorMessage) toastr.error(errorMessage, 'Error');
      response.data = eStatementAnalysisResponse;
      response.status = 'error';
    }
  } catch (error) {
    console.error('Error in eStatementAnalysis:', error);
    const message = errorMessage || error?.response?.data?.message || 'Something went wrong';
    toastr.error(message, 'Error');
    response.data = error?.response;
    response.status = 'failure';
    throw Error(error);
  } finally {
    actionCompleted(args);
  }
  // Action Exit Custom Log
  if (enableConsoleLog) {
    const endLog = cleanConsoleLogArgs(endConsoleLog);
    logActionMessage(endLog);
  }
  return response;
};

const processActionResponse = (
  response,
  apiCallResult,
  collectionName,
  passPreviousActionResponse,
  responseDataSessionKey,
  responseDataSessionStorageLocation,
) => {
  response.data = apiCallResult;
  response.data.collectionSaveOrUpdateResponse = apiCallResult?.data;
  response.status = 'success';
  const { collectionSaveOrUpdateResponse } = response.data;
  const { data: collectionItemData } = collectionSaveOrUpdateResponse;
  const collectionItemId = collectionItemData.uuid;
  const collectionKey = `collection_${collectionName}`;
  const collectionItemUuidKey = 'uuid';
  const collectionData = { [collectionKey]: { [collectionItemUuidKey]: collectionItemId } };
  const parentCollectionData = {
    [PARENT_COLLECTION_PROPAGATE_KEY]: {
      uuid: collectionItemId,
      name: collectionName,
    },
  };
  if (
    passPreviousActionResponse &&
    (passPreviousActionResponse == true || passPreviousActionResponse === 'true')
  ) {
    setDataInSessionStorageLocation(responseDataSessionStorageLocation, responseDataSessionKey, {
      ...collectionItemData,
      ...collectionData,
      ...parentCollectionData,
    });
  }
  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  if (previousActionResponse) {
    previousActionResponse = JSON.parse(previousActionResponse);
    sessionStorage.setItem(
      'previousActionResponse',
      JSON.stringify({ ...previousActionResponse, ...collectionData, ...parentCollectionData }),
    );
  } else {
    sessionStorage.setItem(
      'previousActionResponse',
      JSON.stringify({ ...collectionData, ...parentCollectionData }),
    );
  }
  response.data = { ...response.data, ...collectionData };
};
