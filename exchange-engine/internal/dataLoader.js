let paginationDataMap = new Map(),
  replaceTextContent = false,
  renderImgContent = false,
  stylesMap = new Map(),
  dataTablePaginationDataMap = new Map(),
  dataTableStylesMap = new Map(),
  externalAPIDataGroupDataMap = new Map(),
  dataGroupPaginationDataMap = new Map();
const DEFAULT_PAGE_RANGE_NUMBER_PAGINATE = 10;
const SESSION_RESPONSE_KEY = 'previousActionResponse';
const SESSION_FORM_DATA_KEY = 'previousActionFormData';
const SESSION_RESPONSE_ATTR_KEY = 'data-previous-action-response';
const SESSION_FORM_DATA_ATTR_KEY = 'data-previous-action-formdata';
const TEXT_COMPONENTS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'];
const DATA_SOURCE_DEFAULT = 'DEFAULT';
const DATA_SOURCE_SUPABASE = 'SUPABASE';
const DATA_SOURCE_DIRECTUS = 'DIRECTUS';
const DATA_SOURCE_MYSQL = 'MYSQL';
const DATE_SEGREGATED_FIELD_SELECTOR = `select[data-component-type=date][date-segregated]`;
const DAY_SEGREGATED_FIELD_SELECTOR = `${DATE_SEGREGATED_FIELD_SELECTOR}[date-segregated=day]`;
const MONTH_SEGREGATED_FIELD_SELECTOR = `${DATE_SEGREGATED_FIELD_SELECTOR}[date-segregated=month]`;
const YEAR_SEGREGATED_FIELD_SELECTOR = `${DATE_SEGREGATED_FIELD_SELECTOR}[date-segregated=year]`;
const CURRENT_YEAR = new Date().getFullYear();
const SEGREGATED_DATE_QNT_YEARS = 25;
const SEGREGATED_DATE_BASE_YEAR = 1900;
const BUFFER = 'Buffer';

const truthyValues = [
  1,
  '1',
  true,
  'true',
  'True',
  'TRUE',
  'yes',
  'Yes',
  'YES',
  'y',
  'Y',
  't',
  'T',
  'on',
  'On',
  'ON',
  'enable',
  'Enable',
  'ENABLE',
  'enabled',
  'Enabled',
  'ENABLED',
];
const falsyValues = [
  0,
  '0',
  false,
  'false',
  'False',
  'FALSE',
  'no',
  'No',
  'NO',
  'n',
  'N',
  'f',
  'F',
  'off',
  'Off',
  'OFF',
  'disable',
  'Disable',
  'DISABLE',
  'disabled',
  'Disabled',
  'DISABLED',
  '',
  null,
  undefined,
  NaN,
];
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Dynamically queries elements based on a selector and a parent element.
 */
function queryElements(selector, parent = document) {
  if (!parent || !(parent instanceof Element || parent instanceof Document)) {
    console.warn('Invalid parent element provided. Defaulting to document.');
    parent = document;
  }
  return parent.querySelectorAll(selector);
}

const getDateTimeFormat = (dateFormat, showTime) => {
  if (showTime) return 'Y-m-d H:i';
  switch (dateFormat) {
    case 'MM/DD/YY':
      return 'm/d/y';
    case 'MM-DD-YY':
      return 'm-d-y';
    case 'MM/DD/YYYY':
      return 'm/d/Y';
    case 'MM-DD-YYYY':
      return 'm-d-Y';
    case 'DD-MM-YY':
      return 'd-m-y';
    case 'DD/MM/YY':
      return 'd/m/y';
    case 'DD-MM-YYYY':
      return 'd-m-Y';
    case 'DD/MM/YYYY':
      return 'd/m/Y';
    case 'YYYY-MM-DD':
      return 'Y-m-d';
    case 'YYYY/MM/DD':
      return 'Y/m/d';
    case 'YYYY-DD-MM':
      return 'Y-d-m';
    case 'YYYY/DD/MM':
      return 'Y/d/m';
    default:
      return 'Y-m-d';
  }
};

function getNumberOfPages(totalRecords, numberPerPage) {
  return Math.ceil(totalRecords / numberPerPage);
}

function uuidv4(uuidLength = 8) {
  let xString = '';
  for (let index = 0; index < uuidLength; index++) {
    xString += 'x';
  }
  return xString.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Utility function to replace '/' with '____'
function replaceSlashWithUnderscore(value) {
  return value && typeof value === 'string' && value.includes('/')
    ? value.replace(/\//g, '____')
    : value;
}

// Utility function to replace '____' with '/'
function replaceUnderscoreWithSlash(value) {
  return value && typeof value === 'string' && value.includes('____')
    ? value.replace(/____/g, '/')
    : value;
}

function convertToTimestamp(nativeDate) {
  console.log(
    '🚀 ~ convertToTimestamp ~ Date:',
    nativeDate,
    '~ type:',
    typeof nativeDate,
    '~ isDate:',
    nativeDate instanceof Date,
  );
  let timestamp = null;
  if (nativeDate && nativeDate instanceof Date && !isNaN(nativeDate.getTime())) {
    timestamp = nativeDate.getTime();
  } else if (typeof nativeDate === 'string' || typeof nativeDate === 'number') {
    const parsedDate = new Date(nativeDate);
    if (!isNaN(parsedDate.getTime())) {
      timestamp = parsedDate.getTime();
    } else {
      console.warn('Invalid date provided for conversion to timestamp:', nativeDate);
    }
  } else {
    console.warn('Invalid date provided for conversion to timestamp:', nativeDate);
  }
  console.log('🚀 ~ convertToTimestamp ~ timestamp:', timestamp);
  return timestamp;
}

function convertToNativeDate(dateString, dateTimeFormat) {
  const isValid = moment(dateString, dateTimeFormat, true).isValid();
  console.log(
    '🚀 ~ convertToNativeDate ~ date:',
    dateString,
    '~ format:',
    dateTimeFormat,
    '~ isValid:',
    isValid,
  );
  return isValid ? moment(dateString, dateTimeFormat).toDate() : null;
}

const findComponentIndex = (dataGroupChildren, value) => {
  const componentIndex = Object.keys(dataGroupChildren).findIndex((key) => {
    return dataGroupChildren[key].getAttribute('data-gjs') === value;
  });

  return componentIndex;
};

function highlightSelectedTimeslot(timeSlotsContainerId, timeslotElem) {
  if (timeSlotsContainerId) {
    const timeSlotsContainer = document.getElementById(timeSlotsContainerId);
    const timeSlotContainerSlotList = timeSlotsContainer
      ? timeSlotsContainer.querySelectorAll('ul>li>a')
      : [];

    if (timeSlotContainerSlotList && timeSlotContainerSlotList.length) {
      timeSlotContainerSlotList.forEach((timeslotAnchor) =>
        timeslotAnchor.classList.remove('active'),
      );
    }
    if (timeslotElem) {
      timeslotElem.classList.add('active');
    }
  }
}

function selectedTimeSlot(
  timeslotElem,
  timeSlotsContainerId,
  collectionFormElem,
  eventStartTimeField,
  eventEndTimeField,
  selectionInfo,
  slotTime,
  interval,
) {
  console.log(
    '🚀 ~ file: dataLoader.js:6353 ~ selectedTimeSlot ~ selectionInfo:',
    selectionInfo,
    ' ~ slotTime:',
    slotTime,
    ' ~ interval:',
    interval,
    ' ~ collectionFormElem:',
    collectionFormElem,
    ' ~ eventStartTimeField:',
    eventStartTimeField,
    ' ~ eventEndTimeField:',
    eventEndTimeField,
  );

  highlightSelectedTimeslot(timeSlotsContainerId, timeslotElem);

  const startTimeInputElemId = `${eventStartTimeField}-${collectionFormElem.id}`;
  const endTimeInputElemId = `${eventEndTimeField}-${collectionFormElem.id}`;
  let startTimeInputElem = collectionFormElem.querySelector(`[id=${startTimeInputElemId}]`);
  let endTimeInputElem = collectionFormElem.querySelector(`[id=${endTimeInputElemId}]`);

  const dateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
  const datenTime = getDateTimeFormat(dateFormat, true);
  console.log('🚀 ~ file: dataLoader.js:64 ~ datenTime:', datenTime);
  const startTimeWithSlotTime = `${selectionInfo.startStr} ${slotTime}`;
  console.log('🚀 ~ file: dataLoader.js:67 ~ startTimeWithSlotTime:', startTimeWithSlotTime);
  let newStartDatetimeObj = new Date(startTimeWithSlotTime);
  console.log('🚀 ~ file: dataLoader.js:68 ~ newStartDatetimeObj:', newStartDatetimeObj);
  const startTimeSlot = flatpickr.formatDate(newStartDatetimeObj, 'Y-m-d h:i K');
  console.log('🚀 ~ file: dataLoader.js:66 ~ startTimeSlot:', startTimeSlot);

  let newEndDatetimeObj = moment(newStartDatetimeObj).add(interval, 'm').toDate();
  console.log('🚀 ~ file: dataLoader.js:73 ~ newEndDatetimeObj:', newEndDatetimeObj);
  const endTimeSlot = flatpickr.formatDate(newEndDatetimeObj, 'Y-m-d h:i K');
  console.log('🚀 ~ file: dataLoader.js:75 ~ endTimeSlot:', endTimeSlot);

  if (!startTimeInputElem) {
    startTimeInputElem = document.createElement('input');
    startTimeInputElem.type = 'hidden';
    startTimeInputElem.id = startTimeInputElemId;
    startTimeInputElem.name = eventStartTimeField;
    startTimeInputElem.value = startTimeSlot;
    startTimeInputElem.setAttribute('flat-picker-date-type', 'datetime-local');
    startTimeInputElem.setAttribute('data-timeslot', '');
    collectionFormElem.appendChild(startTimeInputElem);
  } else {
    startTimeInputElem.value = startTimeSlot;
    $(startTimeInputElem).valid();
  }
  if (!endTimeInputElem) {
    endTimeInputElem = document.createElement('input');
    endTimeInputElem.type = 'hidden';
    endTimeInputElem.id = endTimeInputElemId;
    endTimeInputElem.name = eventEndTimeField;
    endTimeInputElem.value = endTimeSlot;
    endTimeInputElem.setAttribute('flat-picker-date-type', 'datetime-local');
    endTimeInputElem.setAttribute('data-timeslot', '');
    collectionFormElem.appendChild(endTimeInputElem);
  } else {
    endTimeInputElem.value = endTimeSlot;
    $(endTimeInputElem).valid();
  }
}

const generateHoursInterval = (startHourInMinute, endHourInMinute, interval) => {
  const times = [];

  for (let i = 0; startHourInMinute < 24 * 60; i++) {
    if (startHourInMinute > endHourInMinute) break;
    let hh = Math.floor(startHourInMinute / 60); // getting hours of day in 0-24 format
    let mm = startHourInMinute % 60; // getting minutes of the hour in 0-55 format
    times[i] = ('0' + (hh % 24)).slice(-2) + ':' + ('0' + mm).slice(-2);
    startHourInMinute = startHourInMinute + interval;
  }

  return times;
};

const nthOrdinalNumber = (number) => {
  if (number > 3 && number < 21) return 'th';
  switch (number % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

const createContentPlaceholder = (numberOfItem, elementId, className) => {
  let placeholderItem = '';
  let isDataList = className.includes('list-group-item');
  const loadingIconKey = localStorage.getItem('loadingIconKey');
  if (!loadingIconKey || loadingIconKey === 'PLACEHOLDER') {
    for (let i = 0; i < numberOfItem; i++) {
      if (isDataList) {
        placeholderItem += `<div class="${className} ${elementId}-placeholder"><div class="drapcode-col-12"><div class="drapcode-row"><div class="drapcode-col-4"></div><div class="drapcode-col-4"></div><div class="drapcode-col-6"></div></div></div></div>`;
      } else {
        placeholderItem += `<div class="drapcode-item ${className} ${elementId}-placeholder"><div class="drapcode-col-12"><div class="drapcode-picture"></div><div class="drapcode-row"><div class="drapcode-col-6 big"></div><div class="drapcode-col-4 empty big"></div><div class="drapcode-col-2 big"></div><div class="drapcode-col-4"></div><div class="drapcode-col-8 empty"></div><div class="drapcode-col-6"></div><div class="drapcode-col-6 empty"></div><div class="drapcode-col-12"></div></div></div></div>`;
      }
    }
  } else if (loadingIconKey === 'PLAIN_SPINNER') {
    placeholderItem = `<div class="drapcode-spinner-plane ${elementId}-placeholder"></div>`;
  } else if (loadingIconKey === 'CHASE_SPINNER') {
    placeholderItem = `<div class="sk-chase ${elementId}-placeholder"><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div></div>`;
  } else if (loadingIconKey === 'BAR_SPINNER') {
    placeholderItem = `<div class="drapcode-spinner-bar ${elementId}-placeholder"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>`;
  } else if (loadingIconKey === 'DOT_SPINNER') {
    placeholderItem = `<div class="drapcode-spinner-dot ${elementId}-placeholder"><div class="dot1"></div><div class="dot2"></div></div>`;
  } else if (loadingIconKey === 'FADING_CIRCLE_SPINNER') {
    placeholderItem = `<div class="sk-fading-circle ${elementId}-placeholder"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>`;
  } else if (loadingIconKey === 'BOUNCE_SPINNER') {
    placeholderItem = `<div class="drapcode-spinner-bounce ${elementId}-placeholder"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>`;
  } else if (loadingIconKey === 'NONE') {
    placeholderItem = '';
  }
  return placeholderItem;
};
// TODO: Manish -> Removed unused code
const loadBrowserStorageSetterItems = async (paginationData, originalDataGroup) => {
  const {
    finderId,
    collectionName,
    fieldName,
    numberPerPage,
    dataGroupChildren,
    externalQueryParamKeys,
    searchString,
    sessionStorage,
  } = paginationData;
  const dataset = originalDataGroup.dataset;
  // Convert dataset to a plain JavaScript object if needed
  const browserstorage = Object.assign({}, dataset);
  const searchPluginIndex = findComponentIndex(dataGroupChildren, 'search-form');
  const searchElement = dataGroupChildren[searchPluginIndex];
  const dataGroupChildrenWithoutSearchForm = dataGroupChildren;
  if (searchElement && searchElement.length) {
    dataGroupChildrenWithoutSearchForm[searchPluginIndex].remove(); //Remove Search Form From Placeholder
  }
  const dateRangeFilterIndex = findComponentIndex(dataGroupChildren, 'date-range-filter');
  const dateRangeFilterIndexElement = dataGroupChildren[dateRangeFilterIndex];
  originalDataGroup.innerHTML = '';
  const parentElement = document.createElement('div');
  parentElement.classList.add('data-group-content' + elementAttribute(originalDataGroup, 'id'));
  parentElement.classList.add('row');
  // parentElement.innerHTML = placeholderItem;
  originalDataGroup.style.display = ''; //TODO use hide class
  const mapPluginIndex = findComponentIndex(dataGroupChildren, 'data-group-map');
  const mapElement = dataGroupChildren[mapPluginIndex];
  if (searchElement) originalDataGroup.appendChild(searchElement);
  if (mapElement) {
    originalDataGroup.appendChild(mapElement);
  }
  if (dateRangeFilterIndexElement) originalDataGroup.appendChild(dateRangeFilterIndexElement);
  originalDataGroup.appendChild(parentElement);
  ['pagination', 'pagination-number'].forEach((type) => {
    const index = findComponentIndex(dataGroupChildren, type);
    const dontRepeatElement = dataGroupChildren[index];
    if (dontRepeatElement) originalDataGroup.appendChild(dontRepeatElement);
  });
  paginationData.replacedElement = parentElement;
  paginationData.originalDataGroup = originalDataGroup;
  let isPrivateFilter = false;
  const { itemData } = await getItemDataForElement(originalDataGroup); //Get Item of the collection binded with page or modal
  if (finderId) {
    let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?`;
    const dateRangeQueryParams = getDataRangeQuery(paginationData, 'dataGroup', searchString);
    if (dateRangeQueryParams) countItemsEndpoint += '&' + dateRangeQueryParams;
    countItemsEndpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      countItemsEndpoint,
      itemData,
      originalDataGroup,
    );
    /**
     * This is to get search query from URL and append it to endpoint
     */
    let searchQuery = await searchQueryStringFromUrl();
    if (typeof searchString !== 'undefined' && searchString) {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        countItemsEndpoint = countItemsEndpoint + '&' + searchString + searchQuery;
      } else {
        countItemsEndpoint = countItemsEndpoint + '&' + searchString;
      }
    } else {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        countItemsEndpoint = countItemsEndpoint + searchQuery;
      }
    }
    countItemsEndpoint = await addEntityQueryToUrl(countItemsEndpoint, collectionName, finderId);
    const totalCount = await securedGetCall(countItemsEndpoint);
    paginationData.numberOfPages = getNumberOfPages(totalCount.data, paginationData.numberPerPage);
    isPrivateFilter = totalCount ? totalCount._$isPrivateFilter : null;
  } else if (fieldName) {
    const itemIds = parseValueFromData(itemData, fieldName);
    paginationData.numberOfPages = 1;
    paginationData.filteredItemsUrl = `collection-table/${collectionName}/itemList`;
    paginationData.itemIds = itemIds;
  } else {
    const url_params = Object.fromEntries(new URLSearchParams(window.location.search));
    console.log('::::::searchQuery11:::::::', url_params);
    let externalApiMiddlewareId = '';
    if ('externalId' in url_params) {
      externalApiMiddlewareId = url_params.externalId;
    }
    console.log('::::::::externalApiMiddlewareId:::::', externalApiMiddlewareId);
    paginationData.filteredItemsUrl = `external-api-middleware/${externalApiMiddlewareId}/collection-items`;
  }
  paginationData.finderId = finderId;
  loadBrowserStorageSetter(paginationData, isPrivateFilter, browserstorage);
};

// TODO: Manish -> Removed unused code
const loadBrowserStorageSetterFromExternalAPI = async (paginationData, browserStorage) => {
  const {
    dataGroup: originalDataGroup,
    externalApiId,
    dataGroupChildren,
    externalApiResponse,
  } = paginationData ?? '';
  let data = {};
  let result = {};
  let response = {};
  let externalAPIResult = {};
  let externalAPIData = {};
  let externalAPIResponseDataMapping = {};
  let placeholderItem = '';
  let externalApiEndpoint = 'external-api';
  let isExport = false;
  if (externalApiId) {
    externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${externalApiId}`);
    if (externalAPIResult && externalAPIResult.status === 200) {
      externalAPIData = externalAPIResult.data;
      const { responseDataMapping } = externalAPIData ?? '';
      const { selectedMapping } = responseDataMapping ?? '';
      externalAPIResponseDataMapping = selectedMapping;
    }
  }
  // console.log('externalAPIresult', externalApiResponse);
  let { bodyDataFrom, uniqueKey, sendFormData } = externalAPIData ? externalAPIData : '';
  bodyDataFrom = bodyDataFrom ?? 'noDynamicData';
  uniqueKey = uniqueKey ?? 'id';
  sendFormData = !!sendFormData;
  if (!isExport) {
    //Handling DatGroup External API Placeholder
    originalDataGroup.innerHTML = '';
    // placeholderItem = createContentPlaceholder(
    //   1,
    //   dataGroupChildren[0].id,
    //   dataGroupChildren[0].className,
    // );
  }
  const parentElement = document.createElement('div');
  parentElement.classList.add('data-group-content' + elementAttribute(originalDataGroup, 'id'));
  parentElement.classList.add('row');
  parentElement.innerHTML = placeholderItem;
  originalDataGroup.style.display = '';
  originalDataGroup.appendChild(parentElement);
  ['pagination', 'pagination-number'].forEach((type) => {
    const index = findComponentIndex(dataGroupChildren, type);
    const dontRepeatElement = dataGroupChildren[index];
    if (dontRepeatElement) originalDataGroup.appendChild(dontRepeatElement);
  });
  paginationData.replacedElement = parentElement;
  paginationData.originalDataGroup = originalDataGroup;
  paginationData.numberOfPages = 1;
  if (bodyDataFrom && bodyDataFrom === 'NON_PERSISTENT_COLLECTION') {
    //* Passing Collection Item Id from URL when Non Persistent Collection is Enabled on External API
    const pathArray = window.location.pathname.split('/');
    const nonPersistentCollectionItemId = pathArray[pathArray.length - 1];
    const pageCollectionName = pathArray[pathArray.length - 2];
    const itemId = pageCollectionName ? nonPersistentCollectionItemId : uuidv4(16);
    data['externalApiItem'] = {
      id: itemId,
      uuid: itemId,
      _data_source_rest_api_primary_id: itemId,
      nonPersistentCollectionItemId: itemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
    };
  } else {
    const { collectionItemId, collectionId: pageCollectionName } = await getPageItemData();
    data['externalApiItem'] = {
      ...data.externalApiItem,
      collectionItemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
      id: collectionItemId,
      uuid: collectionItemId,
      _data_source_rest_api_primary_id: collectionItemId,
    };
  }
  if (data.externalApiItem) {
    console.log('the data in line 676 ', data);
    const { nonPersistentCollectionItemId, collectionItemId, pageCollectionName } =
      data.externalApiItem;
    const sendPageCollectionItem = !!pageCollectionName;
    console.log(
      '%c==> DataGroup from External API sendPageCollectionItem :>> ',
      'color:lime',
      sendPageCollectionItem,
    );
    if (sendPageCollectionItem) {
      if (
        collectionItemId &&
        (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
      } else if (
        nonPersistentCollectionItemId &&
        bodyDataFrom === 'NON_PERSISTENT_COLLECTION' &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + nonPersistentCollectionItemId;
      }
    }
  }
  let finalSessionValue = {};
  let previousFormData = {};
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
      console.log(
        '%c==> DataGroup from External API session value :>> ',
        'color:yellow',
        finalSessionValue,
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
      console.log(
        '%c==> DataGroup from External API session form data :>> ',
        'color:yellow',
        previousFormData,
      );
    }
  }
  let body = {
    data,
    externalApiId: externalApiId,
    sessionValue: finalSessionValue,
    sessionFormValue: previousFormData,
  };
  console.log('\n URL: ', externalApiEndpoint);
  console.log('\n Body: ', body);
  if (isExport) {
    await downloadFile(externalApiEndpoint, body);
  } else {
    result = await unSecuredPostCall(body, externalApiEndpoint);
    response.data = { ...result };
    response.externalApiResponse = result;
    response.data.externalApiResponse = result;
    response.status = 'success';
    paginationData.externalApiResponse = result.data;
    paginationData.numberOfPages = 1;
    if (result.status === 200 && result.data) {
      let processedApiResponseData = createDataGroupResponseDataArr(result);
      if (processedApiResponseData && processedApiResponseData !== 'undefined') {
        removeDataGroupPlaceholder(dataGroupChildren);
        Object.keys(processedApiResponseData).forEach((key) => {
          if (!['externalApiMiddlewareId', 'totalRecords'].includes(key)) {
            const responseData = processedApiResponseData[key];
            const validTextBasedData = !Array.isArray(responseData);
            renderExternalApiDataForBrowserStorage(
              validTextBasedData,
              result.data,
              dataGroupChildren,
              key,
              paginationData.replacedElement,
              externalAPIResponseDataMapping,
              browserStorage,
            );
          }
        });
      }
    }
  }
};

const loadDataGroupItems = async (
  paginationData,
  originalDataGroup,
  isTypesenseCollection = false,
) => {
  console.groupCollapsed(
    `%c 🚀 ~ loadDataGroupItems for #${originalDataGroup.id}`,
    'color: mediumpurple',
  );
  const {
    finderId,
    collectionName,
    fieldName,
    dataGroupChildren,
    externalQueryParamKeys,
    searchString,
  } = paginationData;
  paginationData.dataTable = paginationData.dataGroup;
  paginationData.componentType = 'DATA_GROUP';
  const searchPluginIndex = findComponentIndex(dataGroupChildren, 'search-form');
  const searchElement = dataGroupChildren[searchPluginIndex];
  const dateRangeFilterIndex = findComponentIndex(dataGroupChildren, 'date-range-filter');
  const dateRangeFilterIndexElement = dataGroupChildren[dateRangeFilterIndex];
  const placeholderItem = createDataGroupPlaceholder(paginationData);
  originalDataGroup.innerHTML = '';

  const parentElement = document.createElement('div');
  parentElement.classList.add('data-group-content' + elementAttribute(originalDataGroup, 'id'));
  parentElement.classList.add('row');
  parentElement.innerHTML = placeholderItem;
  originalDataGroup.style.display = ''; //TODO use hide class
  const mapPluginIndex = findComponentIndex(dataGroupChildren, 'data-group-map');

  const mapElement = dataGroupChildren[mapPluginIndex];
  if (searchElement) originalDataGroup.appendChild(searchElement);
  if (mapElement) {
    originalDataGroup.appendChild(mapElement);
  }
  if (dateRangeFilterIndexElement) originalDataGroup.appendChild(dateRangeFilterIndexElement);
  originalDataGroup.appendChild(parentElement);

  ['pagination', 'pagination-number'].forEach((type) => {
    const index = findComponentIndex(dataGroupChildren, type);
    const dontRepeatElement = dataGroupChildren[index];
    if (dontRepeatElement) originalDataGroup.appendChild(dontRepeatElement);
  });
  paginationData.replacedElement = parentElement;
  paginationData.originalDataGroup = originalDataGroup;
  let isPrivateFilter = false;
  let totalCount = '';
  const { itemData } = await getItemDataForElement(originalDataGroup); //Get Item of the collection binded with page or modal
  const { pageSizeSessionKey, paginationPageSizeComponent } = getPageSizeForDataComponent(
    paginationData,
    collectionName,
  );
  if (finderId) {
    let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?`;
    const dateRangeQueryParams = getDataRangeQuery(paginationData, 'dataGroup', searchString);
    if (dateRangeQueryParams) countItemsEndpoint += '&' + dateRangeQueryParams;
    countItemsEndpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      countItemsEndpoint,
      itemData,
      originalDataGroup,
    );

    /**
     * This is to get search query from URL and append it to endpoint
     */
    let searchQuery = await searchQueryStringFromUrl();
    if (typeof searchString !== 'undefined' && searchString) {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        countItemsEndpoint = countItemsEndpoint + '&' + searchString + searchQuery;
      } else {
        countItemsEndpoint = countItemsEndpoint + '&' + searchString;
      }
    } else {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        countItemsEndpoint = countItemsEndpoint + searchQuery;
      }
    }
    countItemsEndpoint = await addEntityQueryToUrl(countItemsEndpoint, collectionName, finderId);
    const countResponse = await securedGetCall(countItemsEndpoint);
    if (!countResponse || countResponse.status !== 200) {
      console.error(
        `%c 🚀 ~ loadDataGroupItems ~ Error fetching count from endpoint: ${countItemsEndpoint}`,
        'color: red;',
      );
      totalCount = 0;
    } else if (countResponse.status === 200) {
      totalCount = countResponse.data;
    }
    paginationData.numberOfPages = getNumberOfPages(totalCount, paginationData.numberPerPage);
    isPrivateFilter = countResponse ? countResponse._$isPrivateFilter : null;
  } else if (fieldName) {
    let itemIds = parseValueFromData(itemData, fieldName);
    console.log('🚀 ~ loadDataGroupItems ~ itemIds #1:', itemIds);
    // Ensure itemIds is an array
    itemIds = Array.isArray(itemIds) ? itemIds : Object.keys(itemIds).length > 0 ? [itemIds] : [];
    console.log('🚀 ~ loadDataGroupItems ~ itemIds #2:', itemIds);
    totalCount = itemIds.length;
    paginationData.numberOfPages = getNumberOfPages(totalCount, paginationData.numberPerPage);
    paginationData.filteredItemsUrl = `collection-table/${collectionName}/itemList`;
    paginationData.itemIds = itemIds;
  } else {
    const url_params = Object.fromEntries(new URLSearchParams(window.location.search));
    console.log('::::::searchQuery11:::::::', url_params);
    let externalApiMiddlewareId = '';
    if ('externalId' in url_params) {
      externalApiMiddlewareId = url_params.externalId;
    }
    console.log('::::::::externalApiMiddlewareId:::::', externalApiMiddlewareId);
    paginationData.filteredItemsUrl = `external-api-middleware/${externalApiMiddlewareId}/collection-items`;
  }
  paginationData.finderId = finderId;
  if (isTypesenseCollection)
    paginationData.filteredItemsUrl = `typesense-search/get-all-indexed-data/${collectionName}/${finderId}`;
  // Page Size Selector
  console.log('🚀 ~ loadDataGroupItems ~ totalCount:', totalCount);
  paginationData.totalCount = totalCount;
  paginationData.pageSizeSessionKey = pageSizeSessionKey;
  handlePaginationPageSize(paginationData, paginationPageSizeComponent);
  // Number Pagination
  numberPaginationNav(paginationData);
  await loadGroupData(paginationData, isPrivateFilter);
  console.groupEnd();
};

const createDataGroupPlaceholder = (paginationData) => {
  const { dataGroupChildren, numberPerPage } = paginationData;
  const searchPluginIndex = findComponentIndex(dataGroupChildren, 'search-form');
  const searchElement = dataGroupChildren[searchPluginIndex];
  const dataGroupChildrenWithoutSearchForm = dataGroupChildren;
  if (searchElement && searchElement.length) {
    dataGroupChildrenWithoutSearchForm[searchPluginIndex].remove(); //Remove Search Form From Placeholder
  }
  return createContentPlaceholder(
    numberPerPage,
    dataGroupChildrenWithoutSearchForm[0].id,
    dataGroupChildrenWithoutSearchForm[0].className,
  );
};

const processAndRenderJsonData = (
  validTextBasedData,
  responseData,
  innerChildren,
  key,
  replacedElement,
) => {
  if (validTextBasedData && responseData && typeof responseData === 'object') {
    Object.keys(innerChildren).forEach(async (ickey) => {
      const element = innerChildren[ickey];
      const currentElementAttribute = elementAttribute(element, 'data-gjs');
      const filterComponent = [
        'pagination',
        'search-form',
        'data-group-map',
        'external-api-fallback',
      ];
      if (!filterComponent.includes(currentElementAttribute)) {
        const newHtml = element.cloneNode(true);
        const elementOrgId = elementAttribute(newHtml, 'id');
        if (elementOrgId) {
          newHtml.setAttribute('id', elementOrgId + '-' + ickey + key + '-' + uuidv4());
        }
        applyUserDefinedStyles(element, newHtml, stylesMap);
        const dataJSONField = `data-json-field`;
        const dataJSONFieldForLink = `data-link-json-field`;
        const dataJSONFieldForInput = `data-form-element-previous-action-response`;
        const dataJSONFieldForMedia = `data-media-json-field`;

        if (element.children.length > 0) {
          const orgChildHtml = newHtml.children;
          updateChildrenIds(orgChildHtml, newHtml, stylesMap);

          const textContentElements = newHtml.querySelectorAll(`[${dataJSONField}]`);
          const linkContentElements = newHtml.querySelectorAll(`[${dataJSONFieldForLink}]`);
          const inputContentElements = newHtml.querySelectorAll(`input[${dataJSONFieldForInput}]`);
          const mediaContentElements = newHtml.querySelectorAll(`[${dataJSONFieldForMedia}]`);

          textContentElements.forEach((textElement) => {
            const fieldName = elementAttribute(textElement, dataJSONField);
            let value = _.get(responseData, fieldName) || '';
            textElement.innerHTML = value;
          });

          linkContentElements.forEach((linkElement) => {
            const fieldName = elementAttribute(linkElement, dataJSONFieldForLink);
            let value = _.get(responseData, fieldName) || '';
            linkElement.href = value;
          });
          inputContentElements.forEach((inputElement) => {
            const fieldName = elementAttribute(inputElement, dataJSONFieldForInput);
            let value = _.get(responseData, fieldName) || '';
            inputElement.value = value;
          });
          mediaContentElements.forEach((mediaElement) => {
            const fieldName = elementAttribute(mediaElement, dataJSONFieldForMedia);
            let value = _.get(responseData, fieldName) || '';
            mediaElement.src = value;
          });
        }

        replacedElement.appendChild(newHtml);
      }
    });
  }
};

//Todo: Need to refactor and remove logs after testing
const loadDataGroupExternalAPIItems = async (paginationData) => {
  const {
    originalDataGroup,
    dataGroupChildren,
    replacedElement,
    jsonDataPath: itemsPath,
    fallbackOnLoadEvent,
    dontRepeatFallbackEventElem,
  } = paginationData;
  console.log('🚀 ~ loadDataGroupExternalAPIItems ~ paginationData:', paginationData);

  const sessionStorage = window.sessionStorage;
  const response = sessionStorage.getItem('previousActionResponse');
  const apiResponseData = JSON.parse(response);
  if (apiResponseData && apiResponseData !== 'undefined') {
    const innerChildren = dataGroupChildren;
    let externalApiEndpoint = 'external-api/process/response-data/';
    let body = { apiResponseData, itemsPath };
    result = await unSecuredPostCall(body, externalApiEndpoint);
    if (result.status === 200 && result.data) {
      let processedApiResponseData = [];
      if (Array.isArray(result.data)) {
        processedApiResponseData = [...result.data];
      } else {
        Object.keys(result.data).forEach(async (key) => {
          processedApiResponseData.push(result.data[key]);
        });
      }
      if (processedApiResponseData && processedApiResponseData !== 'undefined') {
        document
          .querySelectorAll(
            `.${
              innerChildren[0] && innerChildren[0] !== 'undefined' ? innerChildren[0].id : ''
            }-placeholder`,
          )
          .forEach((e) => e.remove());
        Object.keys(processedApiResponseData).forEach(async (key) => {
          if (!['externalApiMiddlewareId', 'totalRecords'].includes(key)) {
            const responseData = processedApiResponseData[key];
            const validTextBasedData = !Array.isArray(responseData);
            processAndRenderJsonData(
              validTextBasedData,
              responseData,
              innerChildren,
              key,
              replacedElement,
            );
          }
        });
      }
    }
  } else {
    if (fallbackOnLoadEvent) {
      window.addEventListener('load', function () {
        dontRepeatFallbackEventElem.click();
      });
    }
  }
};

const loadDataGroupExternalAPI = async (paginationData, originalDataGroup) => {
  const jsonDataPath = originalDataGroup.attributes['json-data-path'];
  const jsonDataPathValue = jsonDataPath && jsonDataPath.value ? jsonDataPath.value : '';
  const fallbackOnLoad = originalDataGroup.attributes['data-load-event'];
  const fallbackOnLoadEvent = fallbackOnLoad ? fallbackOnLoad.value : null;
  const { dataGroupChildren } = paginationData;
  const placeholderItem = createContentPlaceholder(
    1,
    dataGroupChildren[0].id,
    dataGroupChildren[0].className,
  );
  originalDataGroup.innerHTML = '';

  const parentElement = document.createElement('div');
  parentElement.classList.add('data-group-content' + elementAttribute(originalDataGroup, 'id'));
  parentElement.classList.add('row');
  parentElement.innerHTML = placeholderItem;
  originalDataGroup.style.display = '';
  originalDataGroup.appendChild(parentElement);
  ['pagination', 'pagination-number'].forEach((type) => {
    const index = findComponentIndex(dataGroupChildren, type);
    const dontRepeatElement = dataGroupChildren[index];
    if (dontRepeatElement) originalDataGroup.appendChild(dontRepeatElement);
  });
  const externalApiFallbackIndex = findComponentIndex(dataGroupChildren, 'external-api-fallback');
  const dontRepeatFallbackEventElem = dataGroupChildren[externalApiFallbackIndex];

  if (dontRepeatFallbackEventElem) {
    dontRepeatFallbackEventElem.setAttribute('onclick', fallbackOnLoadEvent);
    originalDataGroup.appendChild(dontRepeatFallbackEventElem);
  }

  paginationData.replacedElement = parentElement;
  paginationData.originalDataGroup = originalDataGroup;
  paginationData.numberOfPages = 1;
  paginationData.jsonDataPath = jsonDataPathValue;
  paginationData.fallbackOnLoadEvent = fallbackOnLoadEvent;
  paginationData.dontRepeatFallbackEventElem = dontRepeatFallbackEventElem;
  console.log('🚀 ~ loadDataGroupExternalAPI ~ paginationData:', paginationData);
  addExternalAPIDataGroupDataToDataMap(paginationData, originalDataGroup);
  await loadDataGroupExternalAPIItems(paginationData);
};

//TODO: Ali -> Need to add search component support
const loadDataGroupFromExternalAPI = async (paginationData, originalDataGroup) => {
  if (!originalDataGroup) {
    originalDataGroup = paginationData.dataGroup;
  }
  console.groupCollapsed(
    `%c 🚀 ~ loadDataGroupFromExternalAPI for #${originalDataGroup.id}`,
    'color: mediumpurple',
  );
  const { externalApiId, dataGroupChildren } = paginationData ?? '';
  paginationData.dataTable = paginationData.dataGroup;
  paginationData.componentType = 'DATA_GROUP';

  const placeholderItem = createDataGroupPlaceholder(paginationData);
  originalDataGroup.innerHTML = '';

  let externalAPIResult = {};
  let externalAPIData = {};
  let externalAPIResponseDataMapping = {};
  let externalApiEndpoint = 'external-api';

  if (externalApiId) {
    externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${externalApiId}`);
    if (externalAPIResult && externalAPIResult.status === 200) {
      externalAPIData = externalAPIResult.data;
      const { responseDataMapping } = externalAPIData ?? '';
      const { selectedMapping } = responseDataMapping ?? '';
      externalAPIResponseDataMapping = selectedMapping;
    }
  }

  let { bodyDataFrom, uniqueKey, sendFormData } = externalAPIData ? externalAPIData : '';
  bodyDataFrom = bodyDataFrom ?? 'noDynamicData';
  uniqueKey = uniqueKey ?? 'id';
  sendFormData = !!sendFormData;

  const parentElement = document.createElement('div');
  parentElement.classList.add('data-group-content' + elementAttribute(originalDataGroup, 'id'));
  parentElement.classList.add('row');
  parentElement.innerHTML = placeholderItem;
  originalDataGroup.style.display = '';
  originalDataGroup.appendChild(parentElement);

  ['pagination', 'pagination-number'].forEach((type) => {
    const index = findComponentIndex(dataGroupChildren, type);
    const dontRepeatElement = dataGroupChildren[index];
    if (dontRepeatElement) {
      const loadMore = dontRepeatElement.querySelector('.loadMore');
      const next = dontRepeatElement.querySelector('.next');
      const previous = dontRepeatElement.querySelector('.previous');
      const first = dontRepeatElement.querySelector('.first');
      const last = dontRepeatElement.querySelector('.last');
      if (next) {
        next.addEventListener('click', function (ev) {
          ev.preventDefault();
          nextDataGroupPage(paginationData);
        });
      }
      if (first) {
        first.addEventListener('click', function (ev) {
          ev.preventDefault();
          firstDataGroupPage(paginationData);
        });
      }
      if (last) {
        last.addEventListener('click', function (ev) {
          ev.preventDefault();
          lastDataGroupPage(paginationData);
        });
      }
      if (previous) {
        previous.addEventListener('click', function (ev) {
          ev.preventDefault();
          previousDataGroupPage(paginationData);
        });
      }
      if (loadMore) {
        loadMore.addEventListener('click', function (ev) {
          ev.preventDefault();
          loadMoreRecords(paginationData);
        });
      }
      originalDataGroup.appendChild(dontRepeatElement);
    }
  });

  paginationData.replacedElement = parentElement;
  paginationData.originalDataGroup = originalDataGroup;
  paginationData.numberOfPages = 1;
  paginationData.uniqueKey = uniqueKey;
  paginationData.externalAPIResponseDataMapping = externalAPIResponseDataMapping;
  await prepareExternalApiPaginatedDataGroup(paginationData, false);
  console.groupEnd();
};

const prepareExternalApiPaginatedDataGroup = async (paginationData, isPaginate = false) => {
  let data = {};
  let result = {};
  let response = {};
  let externalAPIData = {};
  let externalApiEndpoint = 'external-api';
  let isExport = false;

  const {
    originalDataGroup,
    dataGroupChildren,
    externalApiId,
    bodyDataFrom,
    sendFormData,
    uniqueKey,
    externalAPIResponseDataMapping,
  } = paginationData || {};

  console.groupCollapsed(
    `%c 🚀 ~ prepareExternalApiPaginatedDataGroup for #${originalDataGroup.id}`,
    'color: mediumpurple',
  );
  console.log('🚀 ~ prepareExternalApiPaginatedDataGroup ~ paginationData:', paginationData);

  addPaginationDataToDataMap(paginationData, originalDataGroup);
  let paginationDataSource = DATA_SOURCE_DEFAULT;
  if (!isPaginate) {
    paginationData.numberPerPage = Number(paginationData.numberPerPage);
    const paginateElem = elementSelector(originalDataGroup, '.pagination');
    paginationData['paginationElem'] = paginateElem;
    let offsetKeyAttr = '';
    let pageOffsetKeyAttr = '';
    let overrideLimitKeyAttr = '';

    if (paginateElem) {
      offsetKeyAttr = paginateElem.attributes['data-offset-key'];
      pageOffsetKeyAttr = paginateElem.attributes['data-page-offset-key'];
      overrideLimitKeyAttr = paginateElem.attributes['data-limit-key'];
    }

    const paginationElemDataSet = paginationData['paginationElem']
      ? paginationData['paginationElem'].dataset
      : '';
    if (paginationElemDataSet && paginationElemDataSet.hasOwnProperty('datasource')) {
      paginationDataSource = paginationElemDataSet['datasource'];
    }
    console.log(
      '*** prepareExternalApiPaginatedDataGroup pagination data source:',
      paginationDataSource,
    );

    let offsetKeyAttrValue = offsetKeyAttr ? offsetKeyAttr.value : '';
    let pageOffsetKeyAttrValue = pageOffsetKeyAttr ? pageOffsetKeyAttr.value : '';
    let overrideLimitKeyAttrValue = overrideLimitKeyAttr ? overrideLimitKeyAttr.value : '';

    switch (paginationDataSource) {
      case DATA_SOURCE_SUPABASE:
      case DATA_SOURCE_DIRECTUS:
      case DATA_SOURCE_MYSQL:
        offsetKeyAttrValue = offsetKeyAttrValue || 'offset';
        pageOffsetKeyAttrValue = pageOffsetKeyAttrValue || 'page';
        overrideLimitKeyAttrValue = overrideLimitKeyAttrValue || 'limit';
        break;
      default:
        break;
    }

    console.log(
      '🚀 ~ prepareExternalApiPaginatedDataGroup ~ offsetKeyAttrValue:',
      offsetKeyAttrValue,
      '~ pageOffsetKeyAttrValue:',
      pageOffsetKeyAttrValue,
      '~ overrideLimitKeyAttrValue:',
      overrideLimitKeyAttrValue,
    );

    if (offsetKeyAttrValue || pageOffsetKeyAttrValue) {
      paginationData['enablePagination'] = true;
      if (offsetKeyAttrValue) {
        paginationData['offsetKey'] = offsetKeyAttrValue;
        paginationData['offsetValue'] = 0;
      }

      if (pageOffsetKeyAttrValue) {
        paginationData['pageOffsetKey'] = pageOffsetKeyAttrValue;
        paginationData['pageOffsetValue'] = 0;
      }
    } else {
      paginationData['enablePagination'] = false;
    }
    if (overrideLimitKeyAttrValue) {
      paginationData['overrideLimitKey'] = overrideLimitKeyAttrValue;
    }
  }

  if (bodyDataFrom && bodyDataFrom === 'NON_PERSISTENT_COLLECTION') {
    //* Passing Collection Item Id from URL when Non Persistent Collection is Enabled on External API
    const pathArray = window.location.pathname.split('/');
    const nonPersistentCollectionItemId = pathArray[pathArray.length - 1];
    const pageCollectionName = pathArray[pathArray.length - 2];
    let itemId = pageCollectionName ? nonPersistentCollectionItemId : uuidv4(16);
    itemId = replaceSlashWithUnderscore(itemId);
    data['externalApiItem'] = {
      id: itemId,
      uuid: itemId,
      _data_source_rest_api_primary_id: itemId,
      nonPersistentCollectionItemId: itemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
    };
  } else {
    let { collectionItemId, collectionId: pageCollectionName } = await getPageItemData();
    collectionItemId = replaceSlashWithUnderscore(collectionItemId);
    data['externalApiItem'] = {
      ...data.externalApiItem,
      collectionItemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
      id: collectionItemId,
      uuid: collectionItemId,
      _data_source_rest_api_primary_id: collectionItemId,
    };
  }

  if (paginationData.enablePagination) {
    const paginationElemDataSet = paginationData['paginationElem']
      ? paginationData['paginationElem'].dataset
      : '';
    if (paginationElemDataSet && paginationElemDataSet.hasOwnProperty('datasource')) {
      paginationDataSource = paginationElemDataSet['datasource'];
    }
    console.log(
      '*** prepareExternalApiPaginatedDataGroup ~ pagination data source:',
      paginationDataSource,
      '~ paginationData:',
      paginationData,
    );
    if (data.externalApiItem) {
      data.externalApiItem['recordsOffset'] = {
        offsetKey: paginationData.offsetKey ? paginationData.offsetKey : '',
        offsetValue: isPaginate ? paginationData.offsetValue : 0,
      };
      data.externalApiItem['pageOffset'] = {
        pageOffsetKey: paginationData.pageOffsetKey ? paginationData.pageOffsetKey : '',
        pageOffsetValue: isPaginate ? paginationData.pageOffsetValue : 0,
      };
      data.externalApiItem['recordsLimit'] = {
        limitKey: paginationData.overrideLimitKey ? paginationData.overrideLimitKey : 'limit',
        limitValue: paginationData.numberPerPage,
      };
      data.externalApiItem['dataSource'] = paginationDataSource;
    } else {
      data['externalApiItem'] = {
        recordsOffset: {
          offsetKey: paginationData.offsetKey ? paginationData.offsetKey : '',
          offsetValue: isPaginate ? paginationData.offsetValue : 0,
        },
        pageOffset: {
          pageOffsetKey: paginationData.pageOffsetKey ? paginationData.pageOffsetKey : '',
          pageOffsetValue: isPaginate ? paginationData.pageOffsetValue : 0,
        },
        recordsLimit: {
          limitKey: paginationData.overrideLimitKey ? paginationData.overrideLimitKey : 'limit',
          limitValue: paginationData.numberPerPage,
        },
        dataSource: paginationDataSource,
      };
    }
  } else {
    hidePaginationButton(originalDataGroup);
  }

  // Handling Persistent Pagination
  processDataForPersistentPagination(paginationData, isPaginate, data);

  if (data.externalApiItem) {
    const { nonPersistentCollectionItemId, collectionItemId, pageCollectionName } =
      data.externalApiItem;

    const sendPageCollectionItem = !!pageCollectionName;
    console.log(
      '%c==> prepareExternalApiPaginatedDataGroup DataGroup from External API sendPageCollectionItem :>> ',
      'color:lime',
      sendPageCollectionItem,
    );

    if (sendPageCollectionItem) {
      if (
        collectionItemId &&
        (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
      } else if (
        nonPersistentCollectionItemId &&
        bodyDataFrom === 'NON_PERSISTENT_COLLECTION' &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + nonPersistentCollectionItemId;
      }
    }
  }

  let finalSessionValue = {};
  let previousFormData = {};
  let sessionStorageValue = {};
  let localStorageValue = {};
  let cookiesValue = {};

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
      console.log(
        '%c==> prepareExternalApiPaginatedDataGroup DataGroup from External API session value :>> ',
        'color:yellow',
        finalSessionValue,
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
      console.log(
        '%c==> prepareExternalApiPaginatedDataGroup DataGroup from External API session form data :>> ',
        'color:yellow',
        previousFormData,
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

  let body = {
    data,
    externalApiId: externalApiId,
    sessionValue: finalSessionValue,
    sessionFormValue: previousFormData,
    browserStorageDTO: browserStorageData,
  };

  console.log('🚀 ~ prepareExternalApiPaginatedDataGroup ~ URL:', externalApiEndpoint);
  console.log('🚀 ~ prepareExternalApiPaginatedDataGroup ~ Body:', body);
  if (isExport) {
    await downloadFile(externalApiEndpoint, body);
  } else {
    result = await unSecuredPostCall(body, externalApiEndpoint);
    response.data = { ...result };
    response.externalApiResponse = result;
    response.data.externalApiResponse = result;
    response.status = 'success';
    paginationData.externalApiResponse = result.data;
    paginationData.numberOfPages = 1;
    console.log('🚀 ~ prepareExternalApiPaginatedDataGroup ~ paginationData:', paginationData);

    if (result.status === 200 && result.data) {
      let processedApiResponseData = createDataGroupResponseDataArr(result);
      console.log(
        '🚀 ~ prepareExternalApiPaginatedDataGroup ~ processedApiResponseData:',
        processedApiResponseData,
      );
      if (processedApiResponseData && processedApiResponseData !== 'undefined') {
        removeDataGroupPlaceholder(dataGroupChildren);

        paginationData.numberOfPages =
          paginationData.enablePagination &&
          processedApiResponseData &&
          processedApiResponseData.length
            ? getNumberOfPages(processedApiResponseData.length, paginationData.numberPerPage)
            : 1;

        paginationData['responseDataLength'] =
          processedApiResponseData && processedApiResponseData.length
            ? processedApiResponseData.length
            : 0;

        validatePaginationButtonForNonPersistent(paginationData, originalDataGroup);

        const { numberPerPage, externalApiResponse } = paginationData;
        const { totalRecords } = externalApiResponse ? externalApiResponse : '';
        paginationData.numberOfPages =
          numberPerPage && totalRecords
            ? getNumberOfPages(totalRecords, numberPerPage)
            : paginationData.numberOfPages;

        console.log('🚀 ~ prepareExternalApiPaginatedDataGroup ~ isPaginate:', isPaginate);
        if (!isPaginate) {
          // paginationData.dataTable = paginationData.dataGroup;
          // paginationData.componentType = 'DATA_GROUP';
          // numberPaginationNav(paginationData);
          await addDataGroupDataToMap(paginationData, originalDataGroup, true, !isPaginate);
        }

        Object.keys(processedApiResponseData).forEach((key) => {
          if (
            ![
              'externalApiMiddlewareId',
              'totalRecords',
              'responseSavedCollection',
              'responseSavedItemsUuid',
            ].includes(key)
          ) {
            const responseData = processedApiResponseData[key];
            const validTextBasedData = !Array.isArray(responseData);
            renderExternalApiDataForDataGroup(
              validTextBasedData,
              responseData,
              dataGroupChildren,
              key,
              paginationData.replacedElement,
              externalAPIResponseDataMapping,
            );
          }
        });
      }
    }
  }
  console.groupEnd();
};

const loadDataGroupFromBrowserSession = (paginationData) => {
  console.log(
    '%c==> loadDataGroupFromBrowserSession paginationData :>> ',
    'color:cyan',
    paginationData,
  );
  const {
    browserSessionDataPath,
    dataGroup: originalDataGroup,
    dataGroupChildren,
  } = paginationData ?? '';
  paginationData.loadFromBrowserSession = true;

  if (browserSessionDataPath) {
    let placeholderItem = '';
    let isExport = false;

    if (!isExport) {
      //Handling DatGroup External API Placeholder
      originalDataGroup.innerHTML = '';
      placeholderItem = createContentPlaceholder(
        1,
        dataGroupChildren[0].id,
        dataGroupChildren[0].className,
      );
    }

    const parentElement = document.createElement('div');
    parentElement.classList.add('data-group-content' + elementAttribute(originalDataGroup, 'id'));
    parentElement.classList.add('row');
    parentElement.innerHTML = placeholderItem;
    originalDataGroup.style.display = '';
    originalDataGroup.appendChild(parentElement);

    ['pagination', 'pagination-number'].forEach((type) => {
      const index = findComponentIndex(dataGroupChildren, type);
      const dontRepeatElement = dataGroupChildren[index];
      if (dontRepeatElement) originalDataGroup.appendChild(dontRepeatElement);
    });

    paginationData.replacedElement = parentElement;
    paginationData.originalDataGroup = originalDataGroup;
    paginationData.numberOfPages = 1;

    const sessionStorage = window.sessionStorage;
    const sessionPreviousActionResponse = sessionStorage.getItem(SESSION_RESPONSE_KEY);
    const sessionResponseData = sessionPreviousActionResponse
      ? JSON.parse(sessionPreviousActionResponse)
      : '';

    if (sessionResponseData && sessionResponseData !== 'undefined') {
      const sessionContent = getContentFromSessionObject(
        sessionResponseData,
        browserSessionDataPath,
      );

      console.log(
        '%c==> loadDataGroupFromBrowserSession sessionContent :>> ',
        'color:cyan',
        sessionContent,
      );
      let sessionDataArr = [];
      if (sessionContent && Array.isArray(sessionContent)) {
        sessionDataArr = [...sessionContent];
      } else {
        sessionContent &&
          Object.keys(sessionContent).forEach((key) => {
            if (sessionContent[key]) {
              sessionDataArr.push(sessionContent[key]);
            }
          });
      }
      if (sessionDataArr && sessionDataArr !== 'undefined') {
        removeDataGroupPlaceholder(dataGroupChildren);

        console.log(
          '%c==> loadDataGroupFromBrowserSession sessionDataArr :>> ',
          'color:cyan',
          sessionDataArr,
        );
        Object.keys(sessionDataArr).forEach((key) => {
          const browserSessionData = sessionDataArr[key];
          const validTextBasedData = !Array.isArray(browserSessionData);
          console.log(
            '%c==> loadDataGroupFromBrowserSession processedApiResponseData key :>> ',
            'color:cyan',
            key,
          );
          console.log(
            '%c==> loadDataGroupFromBrowserSession processedApiResponseData browserSessionData :>> ',
            'color:cyan',
            browserSessionData,
          );
          console.log(
            '%c==> loadDataGroupFromBrowserSession processedApiResponseData validTextBasedData :>> ',
            'color:cyan',
            validTextBasedData,
          );

          renderBrowserSessionDataForDataGroup(
            validTextBasedData,
            browserSessionData,
            dataGroupChildren,
            key,
            paginationData.replacedElement,
          );
        });
      }
    }
  } else {
    toastr.error('Data Path is required!', 'Error');
  }

  /* Set the style */
  for (let [key, value] of dataTableStylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);
    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
};

function createDataGroupResponseDataArr(result) {
  let processedApiResponseData = [];
  console.log(
    '*** create DataGroup response arr ~ result data is array:',
    Array.isArray(result.data),
  );
  // Skipping keys that are not part of the data items
  const skipKeys = [
    'externalApiMiddlewareId',
    'responseSavedCollection',
    'responseSavedItemsUuid',
    'totalRecords',
  ];
  if (Array.isArray(result.data)) {
    processedApiResponseData = [...result.data];
  } else {
    console.log(
      '*** create DataGroup response arr ~ result data has data:',
      result.data.hasOwnProperty('data'),
    );
    if (result.data.hasOwnProperty('data')) {
      Object.keys(result.data.data).forEach((key) => {
        if (!skipKeys.includes(key) && result.data.data[key]) {
          processedApiResponseData.push(result.data.data[key]);
        }
      });
    } else {
      Object.keys(result.data).forEach((key) => {
        if (!skipKeys.includes(key) && result.data[key]) {
          processedApiResponseData.push(result.data[key]);
        }
      });
    }
  }
  return processedApiResponseData;
}

function removeDataGroupPlaceholder(dataGroupChildren) {
  document
    .querySelectorAll(
      `.${
        dataGroupChildren[0] && dataGroupChildren[0] !== 'undefined' ? dataGroupChildren[0].id : ''
      }-placeholder`,
    )
    .forEach((e) => e.remove());
}

function renderExternalApiDataForBrowserStorage(
  validTextBasedData,
  responseData,
  innerChildren,
  key,
  replacedElement,
  externalAPIResponseDataMapping,
  browserStorage,
) {
  const dataset = browserStorage.dataset;
  // Convert dataset to a plain JavaScript object if needed
  const browserstorage = Object.assign({}, dataset);
  if (browserstorage) {
    if (responseData) {
      let storage;
      console.log(browserstorage, responseData);
      switch (browserstorage.browserstorage) {
        case 'LOCAL_STORAGE':
          storage = localStorage;
          break;
        case 'SESSION_STORAGE':
          storage = sessionStorage;
          break;
        case 'COOKIES':
          document.cookie = `${browserstorage.storageKey}=${JSON.stringify(responseData)}`;
          return;
        default:
          console.error('Invalid storage type');
          return;
      }
      storage.setItem(browserstorage.storagekey, JSON.stringify(responseData));
    }
    // Set data to the chosen storage
  }
}

function renderExternalApiDataForDataGroup(
  validTextBasedData,
  responseData,
  innerChildren,
  key,
  replacedElement,
  externalAPIResponseDataMapping,
) {
  if (validTextBasedData && responseData && typeof responseData === 'object') {
    Object.keys(innerChildren).forEach((ickey) => {
      const element = innerChildren[ickey];
      const currentElementAttribute = elementAttribute(element, 'data-gjs');
      const filterComponent = [
        'pagination',
        'search-form',
        'data-group-map',
        'external-api-fallback',
      ];
      if (!filterComponent.includes(currentElementAttribute)) {
        const newHtml = element.cloneNode(true);
        const elementOrgId = elementAttribute(newHtml, 'id');
        if (elementOrgId) {
          newHtml.setAttribute('id', elementOrgId + '-' + ickey + key + '-' + uuidv4());
        }
        applyUserDefinedStyles(element, newHtml, stylesMap);
        const dataTextField = `data-text-content`;
        const dataHrefForLink = `data-href-content`;
        const dataHrefForPageLink = `data-path-collection-item-id-from`;
        const dataImage = `data-img-src`;
        const dataFileType = `data-field-type='file'`;
        const dataPathFieldName = `data-path-field-name`;
        const dataUrlField = 'data-url-field';
        const dataFormElementDataGroupField = 'data-form-element-data-group';

        if (element.children.length > 0) {
          const orgChildHtml = newHtml.children;
          updateChildrenIds(orgChildHtml, newHtml, stylesMap);

          const textContentElements = newHtml.querySelectorAll(`[${dataTextField}]`);
          const linkContentElements = newHtml.querySelectorAll(`[${dataHrefForLink}]`);
          const pageLinkContentElements = newHtml.querySelectorAll(`[${dataHrefForPageLink}]`);
          const mediaContentElements = newHtml.querySelectorAll(`[${dataImage}][${dataFileType}]`);
          const collectionFieldLinkContentElements = newHtml.querySelectorAll(`[${dataUrlField}]`);
          const formElements = newHtml.querySelectorAll('form');

          textContentElements.forEach((textElement) => {
            let fieldName = elementAttribute(textElement, dataTextField);
            fieldName = extractNameFromExternalApiResponseMapping(
              externalAPIResponseDataMapping,
              fieldName,
            );
            let value = _.get(responseData, fieldName) || '';
            textElement.innerHTML = value;
          });
          collectionFieldLinkContentElements.forEach((linkElement) => {
            let fieldName = elementAttribute(linkElement, dataUrlField);
            fieldName = extractNameFromExternalApiResponseMapping(
              externalAPIResponseDataMapping,
              fieldName,
            );
            let value = _.get(responseData, fieldName) || '';
            linkElement.href = value;
          });
          linkContentElements.forEach((linkElement) => {
            let fieldName = elementAttribute(linkElement, dataHrefForLink);
            fieldName = extractNameFromExternalApiResponseMapping(
              externalAPIResponseDataMapping,
              fieldName,
            );
            let value = _.get(responseData, fieldName) || '';
            linkElement.href = value;
          });
          pageLinkContentElements.forEach((pageLinkElement) => {
            let fieldName = elementAttribute(pageLinkElement, dataPathFieldName);
            fieldName = extractNameFromExternalApiResponseMapping(
              externalAPIResponseDataMapping,
              fieldName,
            );
            let value = _.get(responseData, fieldName) || '';
            if (!value && fieldName === 'uuid') {
              //Fallback: Fetch Field name from Response Mapping
              let responseMapFieldName = extractNameFromExternalApiResponseMapping(
                externalAPIResponseDataMapping,
                '_data_source_rest_api_primary_id',
              );
              value = _.get(responseData, responseMapFieldName) || '';
            }
            let hrefValue = pageLinkElement.href.replace(fieldName, value);
            pageLinkElement.href = hrefValue;
          });
          mediaContentElements.forEach((mediaElement) => {
            let fieldName = elementAttribute(mediaElement, dataImage);
            fieldName = extractNameFromExternalApiResponseMapping(
              externalAPIResponseDataMapping,
              fieldName,
            );
            let value = _.get(responseData, fieldName) || '';
            value = parseMySqlBlobData(value);
            const previewIcon = mediaElement
              ? elementAttribute(mediaElement, 'data-preview-icon')
              : '';
            const imageData =
              value &&
              value.map((record) => {
                const imageKey = record.key;
                const imageUrl = previewIcon
                  ? record[previewIcon]
                  : record.isExternalUrl
                    ? record.url
                    : record.isPrivate === true
                      ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
                      : imageKey
                        ? imageServerUrl() + imageKey
                        : '';

                // const fileName = record && record.originalName ? record.originalName : '';
                const newImgTag = mediaElement.cloneNode(true);
                imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
                if (record.isPrivate === true) {
                  //Fallback: Fetch Field name from Response Mapping
                  let responseMapFieldName = extractNameFromExternalApiResponseMapping(
                    externalAPIResponseDataMapping,
                    '_data_source_rest_api_primary_id',
                  );
                  let itemUuid = _.get(responseData, responseMapFieldName) || '';
                  addDownloadAttributeForPrivateFiles(newImgTag, record, itemUuid);
                }

                return newImgTag.outerHTML;
              });
            if (imageData && Array.isArray(imageData)) {
              mediaElement.parentNode.innerHTML = imageData.join('');
            } else {
              mediaElement.src = value;
            }
          });
          formElements.forEach((formElement) => {
            const dataGroupFormElements = formElement.querySelectorAll(
              `[${dataFormElementDataGroupField}]`,
            );
            const formElementMethod = formElement.getAttribute('method') || '';
            const formCollectionName = elementAttribute(formElement, 'data-form-collection');

            console.log(
              '🚀 ~ renderExternalApiDataForDataGroup ~ formElementMethod:',
              formElementMethod,
              '~ formCollectionName:',
              formCollectionName,
              '~ dataGroupFormElements:',
              dataGroupFormElements,
              '~ formElement:',
              formElement,
            );

            if (
              formElement.hasAttribute('action') &&
              formElementMethod &&
              formElementMethod.toUpperCase() === 'PUT'
            ) {
              const formIdData = getItemIdFromDataForFormElement(
                formElement,
                formCollectionName,
                responseData,
                externalAPIResponseDataMapping,
              );
              console.log('🚀 ~ renderExternalApiDataForDataGroup ~ formIdData:', formIdData);

              let { itemId, parentItemId, parentItemCollection } = formIdData || {};
              console.log(
                '🚀 ~ renderExternalApiDataForDataGroup ~ itemId:',
                itemId,
                '~ parentItemId:',
                parentItemId,
                '~ parentItemCollection:',
                parentItemCollection,
              );

              if (itemId) {
                let endpoint = formElement.getAttribute('action') || '';
                endpoint = getNewEndPointUrl(itemId, endpoint);
                itemId = endpoint.split('/').pop();
                formElement.setAttribute('action', endpoint);
                formElement.setAttribute('data-item-id', itemId);
                formElement.setAttribute('data-collection-id', parentItemCollection);
              }
            }

            dataGroupFormElements.forEach((formElementField) => {
              let fieldName = elementAttribute(formElementField, dataFormElementDataGroupField);
              fieldName = extractNameFromExternalApiResponseMapping(
                externalAPIResponseDataMapping,
                fieldName,
              );
              let value = _.get(responseData, fieldName) || '';
              insertFormElementValue(value, formElementField);
            });
          });
        }
        replacedElement.appendChild(newHtml);
      }
    });
  }
}

function renderBrowserSessionDataForDataGroup(
  validTextBasedData,
  browserSessionData,
  innerChildren,
  key,
  replacedElement,
) {
  if (validTextBasedData && browserSessionData && typeof browserSessionData === 'object') {
    Object.keys(innerChildren).forEach(async (ickey) => {
      const element = innerChildren[ickey];
      const currentElementAttribute = elementAttribute(element, 'data-gjs');
      const filterComponent = ['pagination', 'search-form', 'data-group-map'];
      if (!filterComponent.includes(currentElementAttribute)) {
        const newHtml = element.cloneNode(true);
        const elementOrgId = elementAttribute(newHtml, 'id');
        if (elementOrgId) {
          newHtml.setAttribute('id', elementOrgId + '-' + ickey + key + '-' + uuidv4());
        }
        applyUserDefinedStyles(element, newHtml, stylesMap);

        if (element.children.length > 0) {
          const orgChildHtml = newHtml.children;
          updateChildrenIds(orgChildHtml, newHtml, stylesMap);

          const textContentElements = newHtml.querySelectorAll(`[${SESSION_RESPONSE_ATTR_KEY}]`);

          textContentElements.forEach((textElement) => {
            let fieldName = elementAttribute(textElement, SESSION_RESPONSE_ATTR_KEY);
            console.log('%c==> TEXT fieldName :>> ', 'color:yellow', `${key} -> ${fieldName}`);
            let value = _.get(browserSessionData, fieldName) || '';
            textElement.innerHTML = value;
          });
        }
        replacedElement.appendChild(newHtml);
      }
    });
  }
}

function extractNameFromExternalApiResponseMapping(externalAPIResponseDataMapping, fieldName) {
  if (externalAPIResponseDataMapping && externalAPIResponseDataMapping.hasOwnProperty(fieldName)) {
    fieldName = externalAPIResponseDataMapping[fieldName] ?? fieldName;
  }
  return fieldName;
}

async function loadBrowserStorageSetter(paginationData, isPrivateFilter, browserstorage) {
  const {
    numberPerPage,
    numberOfPages,
    filteredItemsUrl,
    collectionId,
    dataGroupChildren,
    replacedElement,
    currentPage,
    searchString,
    originalDataGroup,
    itemIds,
    fieldName,
    collectionName,
    externalQueryParamKeys,
    finderId,
  } = paginationData;
  // addPaginationDataToDataMap(paginationData, originalDataGroup);
  let searchQuery = await searchQueryStringFromUrl();
  let endpoint = filteredItemsUrl;
  let offsetValue = '';
  if (!fieldName) {
    const begin = (currentPage - 1) * numberPerPage;
    const end = begin + numberPerPage;
    offsetValue = begin;
    endpoint = `${filteredItemsUrl}?offset=${begin}&limit=${numberPerPage}`;
    const dateRangeQueryParams = getDataRangeQuery(paginationData, 'dataGroup', searchString);
    if (dateRangeQueryParams) endpoint += '&' + dateRangeQueryParams;
    if (typeof searchString !== 'undefined' && searchString !== '') {
      endpoint = endpoint + '&' + searchString;
    } else {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        endpoint = endpoint + searchQuery;
      }
    }
    const { itemData } = await getItemDataForElement(originalDataGroup); //Get Item of the collection binded with page or modal
    endpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      endpoint,
      itemData,
      originalDataGroup,
    );
  }
  endpoint = await addEntityQueryToUrl(endpoint, collectionName, finderId);
  const hasDateRangePaginationContainer = !!elementSelector(
    originalDataGroup,
    '[data-gjs=date-range-filter]',
  );
  if (hasDateRangePaginationContainer) {
    replacedElement.innerHTML = '';
  }
  await renderBrowserStorageSetterItem(
    collectionName,
    endpoint,
    dataGroupChildren,
    replacedElement,
    originalDataGroup,
    itemIds,
    offsetValue,
    stylesMap,
    isPrivateFilter,
    browserstorage,
  );
  /* Initialise the magnificPopup on Images */
  $('.child-data-group-file[data-field-type=image]').each(function () {
    let imgElement = this;
    const elementType = imgElement.tagName;
    if (elementType !== 'IMG') {
      imgElement = elementSelector(this, 'img');
    }
    if (imgElement && imgElement.hasAttribute('data-enable-popup')) {
      const anchorParentElem = imgElement.closest('A');
      const hasAnchorParentElem = !!anchorParentElem;
      if (hasAnchorParentElem) {
        // the containers for all your galleries
        $(this).magnificPopup({
          delegate: 'a', // the selector for gallery item
          type: 'image',
          gallery: {
            enabled: true,
          },
        });
      }
    }
  });
  /* Set the style */
  for (let [key, value] of stylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);
    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
}

async function loadGroupData(
  paginationData,
  isPrivateFilter = false,
  checkPersistentPagination = true,
) {
  const {
    numberPerPage,
    numberOfPages,
    filteredItemsUrl,
    collectionId,
    dataGroupChildren,
    replacedElement,
    searchString,
    originalDataGroup,
    fieldName,
    collectionName,
    externalQueryParamKeys,
    finderId,
    persistentPagination,
  } = paginationData;
  console.groupCollapsed(`%c 🚀 ~ loadGroupData #${originalDataGroup.id}`, 'color: mediumpurple');
  console.log('🚀 ~ loadGroupData ~ paginationData:', paginationData);
  let { currentPage, itemIds } = paginationData;
  addPaginationDataToDataMap(paginationData, originalDataGroup);
  let searchQuery = await searchQueryStringFromUrl();
  let endpoint = filteredItemsUrl;
  let offsetValue = '';

  if (!fieldName) {
    //Handling Persistent Pagination
    if (checkPersistentPagination && persistentPagination) {
      const { sessionCurrentPage } = persistentPagination;
      if (sessionCurrentPage) {
        currentPage = sessionCurrentPage;
      }
    }
    const begin = (currentPage - 1) * numberPerPage;
    const end = begin + numberPerPage;
    offsetValue = begin;
    endpoint = `${filteredItemsUrl}?offset=${begin}&limit=${numberPerPage}`;
    const dateRangeQueryParams = getDataRangeQuery(paginationData, 'dataGroup', searchString);
    if (dateRangeQueryParams) endpoint += '&' + dateRangeQueryParams;
    if (typeof searchString !== 'undefined' && searchString !== '') {
      endpoint = endpoint + '&' + searchString;
    } else {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        endpoint = endpoint + searchQuery;
      }
    }
    const { itemData } = await getItemDataForElement(originalDataGroup); //Get Item of the collection binded with page or modal
    endpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      endpoint,
      itemData,
      originalDataGroup,
    );
  } else {
    itemIds = itemIds ? getPaginatedData(itemIds, currentPage, numberPerPage) : '';
  }
  endpoint = await addEntityQueryToUrl(endpoint, collectionName, finderId);

  const hasDateRangePaginationContainer = !!elementSelector(
    originalDataGroup,
    '[data-gjs=date-range-filter]',
  );

  if (hasDateRangePaginationContainer) {
    replacedElement.innerHTML = '';
  }

  await renderDataGroupItem(
    collectionName,
    endpoint,
    dataGroupChildren,
    replacedElement,
    originalDataGroup,
    itemIds,
    offsetValue,
    stylesMap,
    isPrivateFilter,
  );
  validatePaginationButton(numberOfPages, currentPage, originalDataGroup);
  validateNumberPaginationNav(paginationData);
  showPaginationNumbersByCurrentPage(paginationData);

  /* Initialise the magnificPopup on Images */
  $('.child-data-group-file[data-field-type=image]').each(function () {
    let imgElement = this;
    const elementType = imgElement.tagName;
    if (elementType !== 'IMG') {
      imgElement = elementSelector(this, 'img');
    }
    if (imgElement && imgElement.hasAttribute('data-enable-popup')) {
      const anchorParentElem = imgElement.closest('A');
      const hasAnchorParentElem = !!anchorParentElem;
      if (hasAnchorParentElem) {
        // the containers for all your galleries
        $(this).magnificPopup({
          delegate: 'a', // the selector for gallery item
          type: 'image',
          gallery: {
            enabled: true,
          },
        });
      }
    }
  });

  /* Set the style */
  for (let [key, value] of stylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);

    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
  console.groupEnd();
}

const addPaginationDataToDataMap = async (paginationData, originalDataGroup) => {
  paginationDataMap.set('pdata_' + originalDataGroup.id, paginationData);
};

const addExternalAPIDataGroupDataToDataMap = async (paginationData, originalDataGroup) => {
  externalAPIDataGroupDataMap.set('apiDgData_' + originalDataGroup.id, paginationData);
};

const renderBrowserStorageSetterItem = async (
  collectionName,
  endpoint,
  dataGroupBody,
  renderDataGroupElement,
  originalDataGroup,
  itemIds,
  offsetValue = '',
  stylesMap,
  isPrivateFilter,
  browserstorage,
) => {
  let itemsData = [];
  console.log('browser storage', browserstorage.browserstorage);
  if (endpoint) {
    let response;
    if (itemIds) {
      itemsData = Array.isArray(itemIds)
        ? itemIds
        : Object.keys(itemIds).length > 0
          ? [itemIds]
          : [];
    } else {
      response = await securedGetCall(endpoint);
      itemsData = response.data;
    }
    // renderDataGroupElement.innerHTML = '';
    if (itemsData.length > 0) {
      console.log('items data in collection is stored in browser storage ');
      let storage;
      switch (browserstorage.browserstorage) {
        case 'LOCAL_STORAGE':
          storage = localStorage;
          break;
        case 'SESSION_STORAGE':
          storage = sessionStorage;
          break;
        case 'COOKIES':
          document.cookie = `${browserstorage.storagekey}=${JSON.stringify(itemsData)}`;
          return;
        default:
          console.error('Invalid storage type');
          return;
      }
      // Set data to the chosen storage
      storage.setItem(browserstorage.storagekey, JSON.stringify(itemsData));
    } else {
      if (isPrivateFilter) {
        renderDataGroupElement.innerHTML =
          "<div class='col-md-12 text-center'>This data is private hence cannot be displayed</div>";
        // processLogoutUser('/');
        return;
      }
      renderDataGroupElement.innerHTML = "<div class='col-md-12 text-center'></div>";
    }
  }
};

const renderDataGroupItem = async (
  collectionName,
  endpoint,
  dataGroupBody,
  renderDataGroupElement,
  originalDataGroup,
  itemIds,
  offsetValue = '',
  stylesMap,
  isPrivateFilter,
) => {
  let itemsData = [];

  if (endpoint) {
    let response;
    if (itemIds) {
      itemsData = Array.isArray(itemIds)
        ? itemIds
        : Object.keys(itemIds).length > 0
          ? [itemIds]
          : [];
    } else {
      response = await securedGetCall(endpoint);
      itemsData = response.data;
    }
    // renderDataGroupElement.innerHTML = '';
    const paginationSelectors = ['[data-gjs=pagination-number]', '[data-gjs=paginationPageSize]'];
    // Check if any of the selectors exist inside originalDataGroup
    const hasPaginationElements = paginationSelectors.some((selector) =>
      elementSelector(originalDataGroup, selector),
    );
    // If any pagination-related element is found, clear renderDataGroupElement
    if (hasPaginationElements) renderDataGroupElement.innerHTML = '';

    if (itemsData.length > 0) {
      renderMapData(itemsData, originalDataGroup);
      await renderData(
        collectionName,
        itemsData,
        dataGroupBody,
        renderDataGroupElement,
        offsetValue,
        stylesMap,
      );
    } else {
      if (isPrivateFilter) {
        renderDataGroupElement.innerHTML =
          "<div class='col-md-12 text-center'>This data is private hence cannot be displayed</div>";
        // processLogoutUser('/');
        return;
      }
      renderDataGroupElement.innerHTML = "<div class='col-md-12 text-center'></div>";
    }
  }
};

const elementSelector = (element, key) => {
  return element.querySelector(key);
};

const validatePaginationButton = (numberOfPages, currentPage, element) => {
  const loadMore = elementSelector(element, '.loadMore');
  const next = elementSelector(element, '.next');
  const previous = elementSelector(element, '.previous');
  const first = elementSelector(element, '.first');
  const last = elementSelector(element, '.last');

  loadMore && (loadMore.disabled = currentPage === numberOfPages);
  next && (next.disabled = currentPage === numberOfPages);
  previous && (previous.disabled = currentPage === 1);
  first && (first.disabled = currentPage === 1);
  last && (last.disabled = currentPage === numberOfPages);
};

const renderMapData = (items, originalDataGroup) => {
  Object.keys(originalDataGroup.children).forEach((elementKey) => {
    const element = originalDataGroup.children[elementKey];
    if (elementAttribute(element, 'data-gjs') === 'data-group-map') {
      const fieldLat = elementAttribute(element, 'data-group-map-lat');
      const fieldLong = elementAttribute(element, 'data-group-map-long');
      const fieldHeader = elementAttribute(element, 'data-group-map-header');
      const fieldDescription = elementAttribute(element, 'data-group-map-description');
      const elementId = element.id;

      element.innerHTML = `<div id="map-${elementId}" class="map"></div> <style>.map{
      height:100%;width:100%;
       }</style>`;

      const map = new google.maps.Map(document.getElementById(`map-${elementId}`), {
        zoom: 15,
        center: new google.maps.LatLng(Number(items[0][fieldLat]), Number(items[0][fieldLong])),
      });

      if (items.length > 0) {
        addMarkerInfo(items, map, fieldLat, fieldLong, fieldHeader, fieldDescription);
      }
    }
  });
};

const renderData = async (
  collectionName,
  items,
  originalDataGroup,
  parentElement,
  offsetValue = '',
  stylesMap,
) => {
  const innerChildren = originalDataGroup;
  const originalDtGroup =
    originalDataGroup[0] && originalDataGroup[0] !== 'undefined' ? originalDataGroup[0].id : '';
  document.querySelectorAll(`.${originalDtGroup}-placeholder`).forEach((e) => e.remove());
  const { constants: projectConstant, environments } = await getProjectDetail();
  const { constants: collectionConstant } = await getCollectionDetails(collectionName);
  const elementList = items.forEach((item, index) => {
    replaceContentOfItem(
      collectionName,
      item,
      innerChildren,
      parentElement,
      index,
      offsetValue,
      stylesMap,
      projectConstant,
      environments,
      collectionConstant,
      true,
    );
  });
  return elementList;
};

const loadSessionDataToDataGroup = (html) => {
  loadSessionDataIntoElements(false, '', '', html);
  loadSessionTenantDataIntoElements(false, '', '', html);
  loadSessionUserSettingsDataIntoElements(false, '', '', html);
  loadSessionSubTenantDataIntoElements(false, '', '', html);
};

const addMarkerInfo = (itemData, map, fieldLat, fieldLong, fieldHeader, fieldDescription) => {
  let infoClickObj = [];
  itemData.map((field) => {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng({
        lat: Number(field[fieldLat]),
        lng: Number(field[fieldLong]),
      }),
      map: map,
    });

    let prepareContent = '<div>';
    if (field[fieldHeader]) {
      prepareContent += `<h6>${field[fieldHeader]}</h6>`;
    }
    if (field[fieldDescription]) {
      prepareContent += `<p>${field[fieldDescription]}</p>`;
    }

    prepareContent += '</div>';
    const infoWindow = new google.maps.InfoWindow({
      content: prepareContent,
    });
    marker.addListener('click', function () {
      clearInfoClickReference(infoClickObj);
      infoWindow.open(marker.get('map'), marker);
      infoClickObj[0] = infoWindow;
    });
  });
};

const replaceContentOfItem = (
  collectionName,
  item,
  innerChildren,
  replacedElement,
  index = '',
  offsetValue = '',
  stylesMap,
  projectConstant,
  environments,
  collectionConstant,
  replaceSessionValues = false,
) => {
  Object.keys(innerChildren).forEach(async (key) => {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(key);
    });
    let orgElement = innerChildren[key];
    let element = orgElement.cloneNode(true);
    let visibilityElements = element.querySelectorAll('[data-vis-condition]');

    if (visibilityElements && visibilityElements.length) {
      console.log('🚀 ~ file: dataLoader.js:1585 ~ Process Component Visibility...');
      let compVisibilityDataJson = {
        itemData: { ...item },
      };

      visibilityElements.forEach((visibilityElem) => {
        processComponentVisibilityCondition(visibilityElem, compVisibilityDataJson);
      });
    }

    const currentElementAttribute = elementAttribute(element, 'data-gjs');
    const filterComponent = ['pagination', 'search-form', 'data-group-map', 'date-range-filter'];
    if (!filterComponent.includes(currentElementAttribute)) {
      const newHtml = element.cloneNode(true);
      const elementOrgId = elementAttribute(newHtml, 'id');
      if (elementOrgId && (index || offsetValue)) {
        if (index) {
          newHtml.setAttribute('id', elementOrgId + '-' + key + index + '-' + uuidv4());
        }
        if (offsetValue) {
          const newElementId = elementAttribute(newHtml, 'id');
          newHtml.setAttribute('id', newElementId + '-' + offsetValue);
        }
      }

      applyUserDefinedStyles(element, newHtml, stylesMap);
      const { itemData, collectionId, collectionItemId } = await getPageItemData();

      const pageExternalApiId = getCookie('__pageExternalAPI');
      const fromExternalAPI = pageExternalApiId ? true : false;
      const pageExternalApiData = fromExternalAPI ? await getPageExternalAPIData() : null;
      const { externalApiType } = pageExternalApiData || {};

      const dataField = `data-${collectionId}`;
      const dataURLField = `data-url-${collectionId}`;
      const dataUrlField = 'data-url-field';
      if (element.children.length > 0) {
        const orgChildHtml = newHtml.children;
        updateChildrenIds(orgChildHtml, newHtml, stylesMap);
        const dynamicHtml = newHtml.querySelectorAll('[data-text-content]');
        const imageHtml = newHtml.querySelectorAll('[data-img-src]');
        const hyperLinks = newHtml.querySelectorAll('[data-path-collection-name]');
        const marketplaceFormHtml = newHtml.querySelectorAll('[data-gjs="marketplace-form"]');
        const innerDataList = newHtml.querySelectorAll('[data-gjs="child-data-list"]');
        const progressBarInDataGroupHtml = newHtml.querySelectorAll(`[data-progress-value]`);
        const allButtons = newHtml.querySelectorAll('a, button');
        const collectionURLHtml = newHtml.querySelectorAll('[data-href-content]');
        const formElements = newHtml.querySelectorAll('form');
        const innerDataGroup = newHtml.querySelectorAll('[data-ref-field]');
        const textContentElements = newHtml.querySelectorAll(`[${dataField}], [data-filter-id]`);
        const urlContentElements = newHtml.querySelectorAll(`[${dataURLField}]`);
        const fileLinkElements = newHtml.querySelectorAll(
          '[data-text-content][data-field-type="file"][data-href-content]',
        );
        const childDataGroupFile = newHtml.querySelectorAll('[data-file-field]');
        const collectionFieldLinkContentElements = newHtml.querySelectorAll(`[${dataUrlField}]`);
        const iconElement = newHtml.querySelectorAll('[data-js="drapcode-icons"]');
        const imageElement = newHtml.querySelectorAll('img');
        const pdfViewerElement = newHtml.querySelectorAll('[data-pdf-viewer-component]');

        innerDataGroup.forEach((element) => {
          replaceInnerGroup(
            collectionName,
            item,
            element,
            stylesMap,
            projectConstant,
            environments,
            collectionConstant,
          );
        });
        childDataGroupFile.forEach((element) => {
          replaceInnerGroupFile(
            collectionName,
            item,
            element,
            stylesMap,
            projectConstant,
            environments,
            collectionConstant,
          );
        });
        imageHtml.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) renderImageFromDB(item, element, stylesMap);
        });
        innerDataList.forEach((element) => {
          replaceContentOfStaticDynamic(item, element, stylesMap);
        });
        Object.values(dynamicHtml).map((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) {
            replaceContentOfTextContent(
              item,
              element,
              stylesMap,
              projectConstant,
              environments,
              collectionConstant,
            );
          }
        });
        progressBarInDataGroupHtml.forEach((element) => {
          replaceContentOfProgressBarFromDatagroup(item, element);
        });
        hyperLinks.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceHrefOfHyperLinks(item, element);
        });
        allButtons.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) addItemUuidIntoButtonAndLink(collectionName, item, element);
        });
        collectionURLHtml.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfFieldURL(item, element);
        });
        formElements.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfFormElements(item, element);
        });
        marketplaceFormHtml.forEach((element) => {
          addValueToMarketplaceCheck(collectionName, item, element);
        });
        textContentElements.forEach((textElement) => {
          getTextContentFieldValue(textElement, dataField, itemData);
        });
        urlContentElements.forEach((urlElement) => {
          const fieldName = elementAttribute(urlElement, dataURLField);
          const href = elementAttribute(urlElement, dataURLField);
          const replaceHref = href.replace(fieldName, parseValueFromData(itemData, fieldName));
          urlElement.setAttribute('href', replaceHref);
        });
        fileLinkElements.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfFileLinkElements(item, element);
        });
        collectionFieldLinkContentElements.forEach((linkElement) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceCollectionFieldLink(linkElement, item);
        });
        pdfViewerElement.forEach((element) => {
          const fieldName = element.getAttribute('data-pdf-viewer-field');
          const itemImageData = fieldName ? parseValueFromData(item, fieldName) : '';
          renderPdfViewerElements(
            element,
            itemImageData,
            item?.uuid,
            fromExternalAPI,
            externalApiType,
          );
        });
        [...iconElement, ...imageElement].forEach((elem) => {
          elem.setAttribute('data-item-id', item.uuid);
          elem.setAttribute('data-collection-id', collectionName);
          elem.setAttribute('data-item', JSON.stringify(item));
        });
        formElements.forEach((elem) => {
          if (item) elem.setAttribute('data-item', JSON.stringify(item));
          if (collectionItemId) elem.setAttribute('data-item-id', collectionItemId);
          if (collectionId) elem.setAttribute('data-collection-id', collectionId);
          // TODO: Need to review this and modify this general use case
          // replaceItemAndCollectionInForm(elem, item, itemData, loggedInUser, currentTenant);
        });
      } else {
        replaceContentOfTextContent(
          item,
          newHtml,
          stylesMap,
          projectConstant,
          environments,
          collectionConstant,
        );
        renderImageFromDB(item, newHtml, stylesMap);
        replaceHrefOfHyperLinks(item, newHtml);
        replaceContentOfFieldURL(item, newHtml);
        replaceContentOfFormElements(item, newHtml);
      }
      if (replaceSessionValues) loadSessionDataToDataGroup(newHtml);
      replacedElement.appendChild(newHtml);
      addDynamicDataIntoFormElements(null, false, replacedElement);
    }
  });
};
const getTextContentFieldValue = (textElement, dataField, itemData) => {
  const fieldName = elementAttribute(textElement, dataField);
  let type = textElement.getAttribute('type');
  if (!fieldName) {
    textElement.style.display = 'block';
  } else {
    if (fieldName.includes('"') && 'functionType' in JSON.parse(fieldName)) {
      textElement.innerHTML = getDerivedFieldData(fieldName, itemData);
    } else {
      if (['reference', 'belongsTo'].includes(type)) {
        const { nestedFieldName } = JSON.parse(textElement.getAttribute('metaData'));
        if (!fieldName.includes('.')) {
          fieldName = fieldName + '.' + nestedFieldName;
        }
      }
      const fieldType = elementAttribute(textElement, 'data-field-type');
      let value = parseValueFromData(itemData, fieldName) || '';
      let isHtml = value ? htmlRegex.test(value) : false;
      if (isHtml) {
        textElement.innerHTML = value;
      } else if (fieldType === 'boolean') {
        textElement.textContent = value ? 'Yes' : 'No';
      } else if (fieldType === 'number') {
        textElement.textContent = value ? value : 0;
      } else {
        textElement.textContent = value;
      }
    }
    textElement.style.display = 'block';
  }
};
const replaceContentOfArrayItem = (
  collectionName,
  item,
  innerChildren,
  parentElement,
  index = '',
  offsetValue = '',
  stylesMap,
  projectConstant,
  environments,
  collectionConstant,
) => {
  Object.keys(innerChildren).forEach(async (key) => {
    const element = innerChildren[key];
    const currentElementAttribute = elementAttribute(element, 'data-gjs');
    const filterComponent = ['pagination', 'search-form', 'data-group-map'];
    if (!filterComponent.includes(currentElementAttribute)) {
      const newHtml = element.cloneNode(true);
      const elementOrgId = elementAttribute(newHtml, 'id');
      if (elementOrgId && (index || offsetValue)) {
        if (index) {
          newHtml.setAttribute('id', elementOrgId + '-' + key + index + '-' + uuidv4());
        }
        if (offsetValue) {
          const newElementId = elementAttribute(newHtml, 'id');
          newHtml.setAttribute('id', newElementId + '-' + offsetValue);
        }
      }
      applyUserDefinedStyles(element, newHtml, stylesMap);
      renderImageFromItem(item, newHtml, parentElement, stylesMap);
      renderFileFromItem(item, newHtml, parentElement, stylesMap);
      parentElement.appendChild(newHtml);
    }
  });
};

const clearInfoClickReference = (infoClickObject) => {
  infoClickObject.map((obj) => {
    obj.set('marker', null);
    obj.close();
  });
};

const applyUserDefinedStyles = (source, target, stylesMap) => {
  let sourceId = elementAttribute(source, 'id');
  let sourceIdFull = `#${sourceId}`;
  //TODO: No Use
  let targetId = `#${elementAttribute(target, 'id')}`;
  let sheets = Array.from(document.styleSheets).filter(
    (styleSheet) => !styleSheet.href || styleSheet.href.startsWith(window.location.origin),
  );

  for (let i = 0; i < sheets.length; i++) {
    let rules = sheets[i].cssRules || sheets[i].rules;
    for (let r = 0; r < rules.length; r++) {
      let rule = rules[r];
      if (rule) {
        let selectorText = rule.selectorText;
        if (selectorText === sourceIdFull) {
          let styles = '';
          for (let l = 0; l < rule.style.length; l++) {
            styles += `${rule.style[l]}: ${rule.style[rule.style[l]]} !important;`;
          }
          stylesMap.set(sourceId, `{ ${styles} }`);
        }
      }
    }
  }
};

const updateChildrenIds = (htmlChildren, newHtml, stylesMap) => {
  if (htmlChildren[0].hasAttribute('id')) {
    const orgChildId = htmlChildren[0].getAttribute('id');
    applyUserDefinedStyles(htmlChildren[0], newHtml, stylesMap);
    htmlChildren[0].setAttribute('id', orgChildId + '-' + uuidv4());
  }

  htmlChildren[0].childNodes.forEach((child) => {
    if (child.attributes && child.hasAttribute('id')) {
      updateInnerChildIds(child, newHtml, stylesMap);
    }
  });
};

const replaceInnerGroup = (
  collectionName,
  item,
  htmlElement,
  stylesMap,
  projectConstant,
  environments,
  collectionConstant,
) => {
  const newParentChildDataGroup = htmlElement.cloneNode(true);
  htmlElement.innerHTML = '';
  const fieldName = elementAttribute(newParentChildDataGroup, 'data-ref-field');
  const refCollectionName = elementAttribute(newParentChildDataGroup, 'data-ref-collection');
  let innerItems = fieldName ? parseValueFromData(item, fieldName) : [];
  if (innerItems && Array.isArray(innerItems)) {
    innerItems.forEach((item) => {
      renderItemOfReferenceField(
        collectionName,
        item,
        newParentChildDataGroup,
        htmlElement,
        stylesMap,
        projectConstant,
        environments,
        collectionConstant,
      );
    });
  } else {
    renderItemOfReferenceField(
      collectionName,
      innerItems,
      newParentChildDataGroup,
      htmlElement,
      stylesMap,
      projectConstant,
      environments,
      collectionConstant,
    );
  }
};

const replaceInnerGroupFile = (
  collectionName,
  item,
  htmlElement,
  stylesMap,
  projectConstant,
  environments,
  collectionConstant,
) => {
  const newChildDataGroupFile = htmlElement.cloneNode(true);
  htmlElement.innerHTML = '';

  const fieldName = elementAttribute(newChildDataGroupFile, 'data-file-field');
  let innerItems = fieldName ? parseValueFromData(item, fieldName) : [];
  if (innerItems && Array.isArray(innerItems)) {
    const innerChildrenToReplace = newChildDataGroupFile.children;
    innerItems.forEach((innerItem, index) => {
      replaceContentOfArrayItem(
        collectionName,
        innerItem,
        innerChildrenToReplace,
        htmlElement,
        '',
        '',
        stylesMap,
        projectConstant,
        environments,
        collectionConstant,
      );
    });
  } else {
    const innerChildrenToReplace = newChildDataGroupFile.children;
    replaceContentOfArrayItem(
      collectionName,
      innerItems,
      innerChildrenToReplace,
      htmlElement,
      '',
      '',
      stylesMap,
      projectConstant,
      environments,
      collectionConstant,
    );
  }
};

const fetchFile = async (
  itemId,
  uuid,
  collectionName,
  collectionField,
  originalName,
  isPdfViewer = false,
  isSignedUrl = false,
) => {
  try {
    const data = {
      itemId: itemId,
      fileId: uuid,
      collectionName: collectionName,
      collectionField: collectionField,
    };
    if (isSignedUrl) data['isSignedUrl'] = isSignedUrl;
    // const token = validateCookieToken();
    // if (!token) return;
    const headerObj = await getHeaderForServerForPublicRequest();
    const { headers } = headerObj;
    const endpoint = `${SERVER_URL}file/fetch`;
    const dataParams = {
      headers: headers,
    };
    if (!isSignedUrl) {
      dataParams['responseType'] = 'blob';
    }
    const response = await axios.post(endpoint, data, dataParams);
    extractCookieToken(response.headers);
    if (isSignedUrl) {
      return response;
    }
    if (isPdfViewer) {
      const blob = response.data;
      const buffer = await blob.arrayBuffer();
      return buffer;
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    //TODO: Fix Loading plugin
    const fileActivityTrackerPlugin = await fetchInstalledPluginByCode('FILE_ACTIVITY_TRACKER');
    if (fileActivityTrackerPlugin) {
      fileActivityTracker(originalName, 'Download', collectionName, collectionField);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

const renderImageFromDB = (item, htmlElement, stylesMap) => {
  const fieldName = elementAttribute(htmlElement, 'data-img-src');
  const type = elementAttribute(htmlElement, 'data-field-type');
  const previewIcon = elementAttribute(htmlElement, 'data-preview-icon');
  if (fieldName) {
    let imageSrcUrl = htmlElement.src;
    let itemImageData = fieldName ? parseValueFromData(item, fieldName) : '';
    if (Array.isArray(itemImageData)) {
      itemImageData = itemImageData[0];
    }

    if (itemImageData) {
      if (typeof itemImageData === 'object') {
        const imageKey = itemImageData.key;
        imageSrcUrl = previewIcon
          ? itemImageData[previewIcon]
          : itemImageData.isExternalUrl
            ? itemImageData.url
            : itemImageData.isPrivate === true
              ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
              : imageKey
                ? imageServerUrl() + imageKey
                : imageSrcUrl;
      } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
        imageSrcUrl = itemImageData;
      }
      htmlElement.src = imageSrcUrl;
      if (itemImageData.isPrivate === true) {
        addDownloadAttributeForPrivateFiles(htmlElement, itemImageData, item.uuid);
      }

      const anchorParentElem = htmlElement.closest('A');
      const hasAnchorParentElem = !!anchorParentElem;
      if (hasAnchorParentElem) {
        const hasHrefLink = !!anchorParentElem.getAttribute('href');
        if (!hasHrefLink) {
          if (itemImageData.isPrivate === true) {
            addDownloadAttributeForPrivateFiles(anchorParentElem, itemImageData, item.uuid);
          } else {
            anchorParentElem.setAttribute('href', imageSrcUrl);
          }
          anchorParentElem.setAttribute('target', '_blank');
          anchorParentElem.setAttribute('title', itemImageData.originalName);
        }
      }
    }
  }
};

const renderImageFromItem = (item, htmlElement, parentElement, stylesMap) => {
  const elementType = htmlElement.tagName;
  let imgElement = htmlElement;
  const previewIcon = elementAttribute(htmlElement, 'data-preview-icon');
  if (elementType !== 'IMG') {
    imgElement = elementSelector(htmlElement, 'img');
  }
  let fieldName = imgElement ? elementAttribute(imgElement, 'data-img-src') : '';
  if (!fieldName) {
    fieldName = parentElement ? elementAttribute(parentElement, 'data-file-field') : '';
  }
  if (imgElement && fieldName) {
    let imageSrcUrl = imgElement.src;
    if (Array.isArray(item)) {
      item = item[0];
    }

    if (item) {
      if (typeof item === 'object') {
        const imageKey = item.key;
        imageSrcUrl = previewIcon
          ? item[previewIcon]
          : item.isExternalUrl
            ? item.url
            : item.isPrivate === true
              ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
              : imageKey
                ? imageServerUrl() + imageKey
                : imageSrcUrl;
      } else if (typeof item === 'string' && item.startsWith('http')) {
        imageSrcUrl = item;
      }
      imgElement.src = imageSrcUrl;
      imgElement.alt = item.originalName;
      if (item.isPrivate === true) {
        addDownloadAttributeForPrivateFiles(imgElement, item, item.uuid);
      }

      const anchorParentElem = imgElement.closest('A');
      const hasAnchorParentElem = !!anchorParentElem;
      if (hasAnchorParentElem) {
        const hasHrefLink = !!anchorParentElem.getAttribute('href');
        if (!hasHrefLink) {
          if (item.isPrivate === true) {
            addDownloadAttributeForPrivateFiles(anchorParentElem, item, item.uuid);
          } else {
            anchorParentElem.setAttribute('href', imageSrcUrl);
          }
        }
        anchorParentElem.setAttribute('target', '_blank');
        anchorParentElem.setAttribute('title', item.originalName);
        anchorParentElem.setAttribute('data-item-id', item.uuid);
        anchorParentElem.setAttribute('data-collection-id', item.collectionName);
        const textElem = anchorParentElem.querySelector('DIV');
        const paragraghElem = anchorParentElem.querySelector('p');
        const headerElem = anchorParentElem.querySelector('h1, h2, h3, h4, h5, h6');
        if (textElem) textElem.textContent = item.originalName;
        if (headerElem) headerElem.textContent = item.originalName;
        if (paragraghElem) paragraghElem.textContent = item.originalName;
      }
    }
  }
};

const renderFileFromItem = (item, htmlElement, parentElement, stylesMap) => {
  const elementType = htmlElement.tagName;
  let anchorElement = htmlElement;
  if (elementType !== 'A') {
    anchorElement = elementSelector(htmlElement, 'a');
  }
  let fieldName = anchorElement ? elementAttribute(anchorElement, 'data-file-src') : '';
  if (!fieldName) {
    fieldName = parentElement ? elementAttribute(parentElement, 'data-file-field') : '';
  }
  if (anchorElement && fieldName) {
    let fileSrcUrl = '';
    if (Array.isArray(item)) {
      item = item[0];
    }

    if (item) {
      if (typeof item === 'object') {
        const fileKey = item.key;
        fileSrcUrl = item.isExternalUrl
          ? item.url
          : fileKey
            ? imageServerUrl() + fileKey
            : fileSrcUrl;
      } else if (typeof item === 'string' && item.startsWith('http')) {
        fileSrcUrl = item;
      }
      fileSrcUrl = fileSrcUrl || '#';

      const hasHrefLink = !!anchorElement.getAttribute('href');
      if (!hasHrefLink) {
        if (item.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(anchorElement, item, item.uuid);
        } else {
          anchorElement.setAttribute('href', fileSrcUrl);
        }
      }
      anchorElement.setAttribute('data-item-id', item.uuid);
      anchorElement.setAttribute('data-collection-id', item.collectionName);
      anchorElement.setAttribute('title', item.originalName);
      const textElem = anchorElement.querySelector('DIV');
      const paragraghElem = anchorElement.querySelector('p');
      const headerElem = anchorElement.querySelector('h1, h2, h3, h4, h5, h6');
      if (textElem) textElem.textContent = item.originalName;
      if (headerElem) headerElem.textContent = item.originalName;
      if (paragraghElem) paragraghElem.textContent = item.originalName;
    }
  }
};

const replaceContentOfStaticDynamic = (item, htmlElement, stylesMap) => {
  let fieldName = elementAttribute(htmlElement, 'data-option-field');
  return getColorBadges(htmlElement, fieldName, item);
};
const replaceContentOfTextContent = (
  item,
  htmlElement,
  stylesMap,
  projectConstant,
  environments,
  collectionConstant,
) => {
  if (replaceTextContent) {
    const sourceElement = htmlElement.cloneNode(true);
    const elementOrgId = elementAttribute(htmlElement, 'id');
    const newElementId = elementOrgId;
    htmlElement.setAttribute('id', newElementId);
    applyUserDefinedStyles(sourceElement, htmlElement, stylesMap);
  } else {
    replaceTextContent = true;
  }
  let fieldName = elementAttribute(htmlElement, 'data-text-content');
  const type = elementAttribute(htmlElement, 'data-field-type');
  if (fieldName) {
    if (fieldName.includes('"') && 'functionType' in JSON.parse(fieldName)) {
      console.log('replaceContentOfTextContent 2');
      const derivedFieldValue = getDerivedFieldData(
        fieldName,
        item,
        projectConstant,
        environments,
        collectionConstant,
      );
      /<\/?[a-z][\s\S]*>/i.test(derivedFieldValue)
        ? (htmlElement.innerHTML = derivedFieldValue)
        : (htmlElement.textContent = derivedFieldValue);
    } else {
      if (['reference', 'belongsTo'].includes(type)) {
        const metadata = elementAttribute(htmlElement, 'metaData');
        let { nestedFieldName } = metadata ? JSON.parse(metadata) : {};
        if (!nestedFieldName) {
          let belongsToMetaData = item['_$belongsToMetaData'];
          let { collectionField } = belongsToMetaData ? belongsToMetaData.refCollection : {};
          nestedFieldName = collectionField ? collectionField : undefined;
        }
        if (!fieldName.includes('.')) {
          fieldName = fieldName + '.' + nestedFieldName;
        }
      }
      let value = parseValueFromData(item, fieldName);
      if (['static_option', 'dynamic_option'].includes(type)) {
        const multiValue = value && !Array.isArray(value) ? value.split(',') : [];
        let newHtmlContent = [];
        const parentHtmlElement = htmlElement.cloneNode(true);
        multiValue.forEach((val) => {
          const newContent = parentHtmlElement.cloneNode(true);
          newContent.setAttribute('id', `${newContent.getAttribute('id')}-${val}`);
          newContent.textContent = val;
          newHtmlContent.push(newContent);
        });
        // htmlElement.parentNode.replaceChild(htmlElement, newHtmlContent);
        htmlElement.innerHTML = '';
        newHtmlContent.forEach((it) => {
          if (htmlElement.parentNode) {
            htmlElement.parentNode.insertBefore(it, htmlElement);
          } else htmlElement.innerHTML = it.innerHTML;
        });
        if (htmlElement.parentNode) htmlElement.classList.add('d-none');
      } else {
        let isHtml = value && type === 'large_text' ? htmlRegex.test(value) : false;
        if (isHtml) {
          htmlElement.innerHTML = value;
        } else if (type === 'boolean') {
          htmlElement.textContent = value ? 'Yes' : 'No';
        } else if (type === 'number' && !value) {
          htmlElement.textContent = '0';
        } else {
          htmlElement.textContent = value;
        }
      }
    }
  }
};

const replaceContentOfProgressBarContent = (
  item,
  htmlElement,
  projectConstant,
  environments,
  collectionConstant,
) => {
  htmlElement = htmlElement.parentElement;
  const fieldNow = elementAttribute(htmlElement, 'data-progress-now');
  const fieldMin = elementAttribute(htmlElement, 'data-progress-min');
  const fieldMax = elementAttribute(htmlElement, 'data-progress-max');
  const child = htmlElement.children[0];
  if (fieldNow && item[fieldNow]) {
    if (fieldNow.includes('"') && 'functionType' in JSON.parse(fieldNow)) {
      const derivedFieldData = getDerivedFieldData(
        fieldNow,
        item,
        projectConstant,
        environments,
        collectionConstant,
      );
      htmlElement.setAttribute('data-progress-now', derivedFieldData);
      child.setAttribute('aria-valuenow', derivedFieldData);
      child.style.nowWidth = `${derivedFieldData}%`;
    } else {
      htmlElement.setAttribute('data-progress-now', item[fieldNow]);
      child.setAttribute('aria-valuenow', item[fieldNow]);
      child.style.width = `${item[fieldNow]}%`;
    }
  }
  if (fieldMin && item[fieldMin]) {
    if (fieldMin.includes('"') && 'functionType' in JSON.parse(fieldMin)) {
      const derivedFieldData = getDerivedFieldData(
        fieldMin,
        item,
        projectConstant,
        environments,
        collectionConstant,
      );
      htmlElement.setAttribute('data-progress-min', derivedFieldData);
      child.setAttribute('aria-valuemin', derivedFieldData);
      child.style.minWidth = `${derivedFieldData}%`;
    } else {
      htmlElement.setAttribute('data-progress-min', item[fieldMin]);
      child.setAttribute('aria-valuemin', item[fieldMin]);
      child.style.minWidth = `${item[fieldMin]}%`;
    }
  }
  if (fieldMax && item[fieldMax]) {
    if (fieldMax.includes('"') && 'functionType' in JSON.parse(fieldMax)) {
      const derivedFieldData = getDerivedFieldData(
        fieldMax,
        item,
        projectConstant,
        environments,
        collectionConstant,
      );

      htmlElement.setAttribute('data-progress-max', derivedFieldData);
      child.setAttribute('aria-valuemax', derivedFieldData);
      child.style.maxWidth = `${derivedFieldData}%`;
    } else {
      htmlElement.setAttribute('data-progress-max', item[fieldMax]);
      child.setAttribute('aria-valuemax', item[fieldMax]);
      child.style.maxWidth = `${item[fieldMax]}%`;
    }
  }
};

const replaceContentOfProgressBarFromDatagroup = (item, htmlElement) => {
  const dataProgressValue = elementAttribute(htmlElement, 'data-progress-value');
  const dataProgressTotal = elementAttribute(htmlElement, 'data-progress-total');
  const progressTotal = elementAttribute(htmlElement, 'progress-total');
  let value,
    total = '';
  if (item) {
    value = dataProgressValue ? item[dataProgressValue] : '';
    if (dataProgressTotal) {
      total = item[dataProgressTotal];
    } else if (progressTotal) {
      total = progressTotal;
    }
  }
  replaceContentOfProgressBar(htmlElement, value, total);
};

const replaceHrefOfHyperLinks = async (item, htmlElement) => {
  const fieldName = elementAttribute(htmlElement, 'data-path-field-name');
  const seoName = elementAttribute(htmlElement, 'data-path-field-seo');

  const elementOrgId = elementAttribute(htmlElement, 'id');

  const dataPathCollectionItemIdFrom = elementAttribute(
    htmlElement,
    'data-path-collection-item-id-from',
  );
  if (['pageCollection', 'session'].includes(dataPathCollectionItemIdFrom)) {
    if (dataPathCollectionItemIdFrom === 'session') {
      let loggedInUserData = localStorage.getItem('user');
      item = '';
      if (loggedInUserData && loggedInUserData !== 'undefined') {
        item = parseLSJSONStrToJSON('user');
      }
    } else {
      const { itemData } = await getPageItemData();
      item = itemData;
    }
  }

  if (fieldName) {
    const href = elementAttribute(htmlElement, 'href');
    let fieldHref = fieldName ? parseValueFromData(item, fieldName) : '';

    fieldHref = fieldHref && fieldHref.length ? fieldHref.split(', ') : '';
    fieldHref = fieldHref[0];

    let replaceHref = href.replace(fieldName, fieldHref);
    if (seoName) {
      let seoHref = seoName ? parseValueFromData(item, seoName) : '';
      seoHref = slugify(seoHref);
      replaceHref = replaceHref.replace(seoName, seoHref);
    }

    htmlElement.setAttribute('href', replaceHref);
  }
};

const addItemUuidIntoButtonAndLink = (collectionName, item, htmlElement) => {
  htmlElement.setAttribute('data-item-id', item['uuid']);
  htmlElement.setAttribute('data-collection-id', collectionName);
  const snipCartElem = window.document.getElementById('snipcart');
  const isSnipCartActive = typeof snipCartElem != 'undefined' && snipCartElem != null;
  if (isSnipCartActive && htmlElement.classList.contains('snipcart-add-item')) {
    loadSnipcartItemData(htmlElement, item);
  }
};

const replaceContentOfFieldURL = (item, htmlElement) => {
  const fieldName = elementAttribute(htmlElement, 'data-href-content');
  const elementOrgId = elementAttribute(htmlElement, 'id');
  const type = elementAttribute(htmlElement, 'data-field-type');

  if (fieldName && type !== 'file') {
    const fieldValue = parseValueFromData(item, fieldName);
    const replaceFieldURL = fieldName.replace(fieldName, fieldValue);

    if (
      !type &&
      fieldValue &&
      typeof fieldValue === 'object' &&
      Object.keys(fieldValue).length > 0 &&
      !Array.isArray(fieldValue)
    ) {
      let imageUrl = '';
      let originalFileName = '';
      let hasTextDataContent = !!elementAttribute(htmlElement, 'data-text-content');

      imageUrl = imageServerUrl() + fieldValue['key'];
      originalFileName = fieldValue['originalName'];

      if (fieldValue['isPrivate'] === true) {
        addDownloadAttributeForPrivateFiles(htmlElement, fieldValue, item.uuid);
      } else {
        htmlElement.href = imageUrl ? imageUrl : '';
      }
      if (!hasTextDataContent) {
        htmlElement.innerText = originalFileName ? originalFileName : imageUrl;
      }
    } else {
      if (fieldValue['isPrivate'] === true) {
        addDownloadAttributeForPrivateFiles(htmlElement, fieldValue, item.uuid);
      } else {
        htmlElement.setAttribute('href', replaceFieldURL);
      }
    }
  }
};

const replaceContentOfFormElements = (item, element) => {
  const dataGroupFormElements = element.querySelectorAll('[data-form-element-data-group]');
  dataGroupFormElements.forEach((formElement) => {
    const fieldName = elementAttribute(formElement, 'data-form-element-data-group');
    const fieldValue = parseValueFromData(item, fieldName);
    insertFormElementValue(fieldValue, formElement);
  });
};

const replaceCollectionFieldLink = (linkElement, data) => {
  const fieldName = elementAttribute(linkElement, 'data-url-field');
  const value = parseValueFromData(data, fieldName);
  linkElement.href = value;
  if (value) {
    linkElement.innerText = fieldName.includes('.url')
      ? parseValueFromData(data, fieldName.replace('.url', '.originalName'))
      : value;
  }
};

const addValueToMarketplaceCheck = (collectionName, item, formElement) => {
  const quantityField = elementAttribute(formElement, 'quantityfield');
  const priceField = elementAttribute(formElement, 'pricefield');
  const nameField = elementAttribute(formElement, 'namefield');
  const descriptionField = elementAttribute(formElement, 'descriptionfield');

  formElement.elements['quantity-field'].value = quantityField;
  formElement.elements['price-field'].value = priceField;
  formElement.elements['productId'].value = item.uuid;
  formElement.elements['collectionName'].value = collectionName;
  formElement.elements['name-field'].value = nameField;
  formElement.elements['description-field'].value = descriptionField;
};

const updateInnerChildIds = (htmlChildren, newHtml, stylesMap) => {
  if (elementAttribute(htmlChildren, 'id')) {
    const orgChildId = elementAttribute(htmlChildren, 'id');
    applyUserDefinedStyles(htmlChildren, newHtml, stylesMap);
    htmlChildren.setAttribute('id', orgChildId + '-' + uuidv4());
  }

  htmlChildren.childNodes.forEach((child) => {
    if (child.attributes && child.hasAttribute('id')) {
      updateInnerChildIds(child, newHtml, stylesMap);
    }
  });
};

const renderItemOfReferenceField = (
  collectionName,
  item,
  newParentChildDataGroup,
  htmlElement,
  projectConstant,
  environments,
  collectionConstant,
) => {
  const innerChildren = newParentChildDataGroup.children;
  replaceContentOfItem(
    collectionName,
    item,
    innerChildren,
    htmlElement,
    '',
    '',
    stylesMap,
    projectConstant,
    environments,
    collectionConstant,
  );
};
const getDerivedFieldData = (
  derivedFieldData,
  item,
  projectConstant,
  environments,
  collectionConstant,
) => {
  const functionDef = JSON.parse(derivedFieldData);
  const { parentFieldName } = functionDef;
  let textContent = '';
  if (parentFieldName) {
    textContent =
      item[parentFieldName] &&
      item[parentFieldName]
        .map((innerItem) => {
          return prepareFunction(
            functionDef,
            innerItem,
            projectConstant,
            environments,
            collectionConstant,
          );
        })
        .join(', ');
  } else {
    textContent = prepareFunction(
      functionDef,
      item,
      projectConstant,
      environments,
      collectionConstant,
    );
  }
  return textContent;
};

const getArgsFromKey = (
  key,
  field,
  loggedInUserData,
  projectConstant,
  environments,
  collectionConstant,
  previousActionResponse,
  previousActionFormData,
) => {
  let value = '';
  if (key.includes('current_user.')) {
    const userKey = key.split('.')[1];
    value = parseValueFromData(loggedInUserData, userKey);
  } else if (key.includes('current_user_reference_field.')) {
    const [userRefFieldName, newKey] = key.replace('current_user_reference_field.', '').split('.');
    const userRefField = loggedInUserData?.[userRefFieldName];
    value = userRefField ? userRefField[0]?.[newKey] : '';
  } else if (key.includes('createdBy.')) {
    const newKey = key.split('.')[1];
    const createdBy = field?.createdBy;
    value = createdBy[0]?.[newKey];
  } else if (key.includes('environment_variable.')) {
    const timezoneElem = document.getElementById('project-timezone');
    const currentEnv = timezoneElem && timezoneElem.getAttribute('data-projectenv');
    const envConstantName = key.split('environment_variable.')[1];
    const environment = environments.find((env) => env.envType === currentEnv);
    const env = environment.constants.find((constant) => constant.name === envConstantName);
    value = env?.value;
  } else if (key.includes('RF::')) {
    const refName = key.replace('RF::', '');
    value = parseValueFromData(field, refName);
  } else if (key.includes('PC::')) {
    const projectConstantName = key.split('PC::')[1];
    const projectConst = projectConstant.find((constant) => constant.name === projectConstantName);
    value = projectConst?.value;
  } else if (key.includes('CC::')) {
    const collectionConstantName = key.split('CC::')[1];
    const collectionConst = collectionConstant.find(
      (constant) => constant.name === collectionConstantName,
    );
    value = collectionConst?.value;
  } else if (key.includes('current_session.')) {
    const sessionKey = key.replace('current_session.', '');
    value = parseValueFromData(previousActionResponse, sessionKey);
  } else if (key.includes('form_data_session.')) {
    const sessionKey = key.replace('form_data_session.', '');
    value = parseValueFromData(previousActionFormData, sessionKey);
  } else {
    value = '';
  }
  return value;
};

const prepareFunction = (functionDef, field, projectConstant, environments, collectionConstant) => {
  let formatType,
    restToLower,
    whitespace,
    noSplitopt,
    type,
    length,
    endopt,
    startString,
    endString,
    separator,
    unixType,
    expression,
    currency,
    maxFraction,
    startLength,
    endLength,
    condition,
    refField,
    match,
    refFieldType,
    index,
    positionOfRecords,
    numberOfRecords,
    elementToRender,
    position,
    indexNum,
    tableStyle,
    theadStyle,
    tbodyStyle,
    trStyle,
    tdStyle,
    thStyle,
    tableRefernceFields,
    unitToAdd,
    unitTypeToAdd = '',
    visibleCharCount,
    maskPosition,
    maskCharacter;
  let args = [];
  let offset = false;
  const SPACE_KEYWORD_REGEX = /#SPACE#/g; //Handling Spaces in Date Format
  let loggedInUserData = parseLSJSONStrToJSON('user');
  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
  let previousActionFormData = sessionStorage.getItem('previousActionFormData');
  previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
  functionDef.args.forEach((element) => {
    const { name, key } = element;
    const excludes = [
      'formatType',
      'restToLower',
      'whitespace',
      'type',
      'noSplitopt',
      'length',
      'endopt',
      'startLength',
      'endLength',
      'startString',
      'endString',
      'separator',
      'expression',
      'unixType',
      'currency',
      'maxFraction',
      'position',
      'refField',
      'condition',
      'match',
      'refFieldType',
      'index',
      'positionOfRecords',
      'numberOfRecords',
      'elementToRender',
      'indexNum',
      'tableStyle',
      'theadStyle',
      'tbodyStyle',
      'trStyle',
      'tdStyle',
      'thStyle',
      'tableRefernceFields',
      'unitToAdd',
      'unitTypeToAdd',
      'visibleCharCount',
      'maskPosition',
      'maskCharacter',
    ];
    //TODO: refactor this use switch
    if (name === 'formatType') {
      formatType = key;
    } else if (name === 'restToLower') {
      restToLower = key;
    } else if (name === 'whitespace') {
      whitespace = key;
    } else if (name === 'type') {
      type = key;
    } else if (name === 'noSplitopt') {
      noSplitopt = key;
    } else if (name === 'length') {
      length = key;
    } else if (name === 'endopt') {
      endopt = key;
    } else if (name === 'startLength') {
      startLength = key;
    } else if (name === 'endLength') {
      endLength = key;
    } else if (name === 'startString') {
      startString = key;
    } else if (name === 'endString') {
      endString = key;
    } else if (name === 'separator') {
      separator = key;
    } else if (name === 'expression') {
      expression = key;
    } else if (name === 'unixType') {
      unixType = key;
    } else if (name === 'currency') {
      currency = key;
    } else if (name === 'position') {
      position = key;
    } else if (name === 'maxFraction') {
      maxFraction = key;
    } else if (name === 'refField') {
      refField = key;
    } else if (name === 'condition') {
      condition = key;
    } else if (name === 'match') {
      match = key;
    } else if (name === 'refFieldType') {
      refFieldType = key;
    } else if (name === 'index') {
      index = key;
    } else if (name === 'positionOfRecords') {
      positionOfRecords = key;
    } else if (name === 'numberOfRecords') {
      numberOfRecords = key;
    } else if (name === 'elementToRender') {
      elementToRender = key;
    } else if (name === 'indexNum') {
      indexNum = key;
    } else if (name === 'tableRefernceFields') {
      tableRefernceFields = key;
    } else if (name === 'tableStyle') {
      tableStyle = key;
    } else if (name === 'theadStyle') {
      theadStyle = key;
    } else if (name === 'tbodyStyle') {
      tbodyStyle = key;
    } else if (name === 'trStyle') {
      trStyle = key;
    } else if (name === 'tdStyle') {
      tdStyle = key;
    } else if (name === 'thStyle') {
      thStyle = key;
    } else if (name === 'unitToAdd') {
      unitToAdd = key;
    } else if (name === 'unitTypeToAdd') {
      unitTypeToAdd = key;
    } else if (name === 'visibleCharCount') {
      visibleCharCount = key;
    } else if (name === 'maskPosition') {
      maskPosition = key;
    } else if (name === 'maskCharacter') {
      maskCharacter = key;
    }
    let innerArgs = [];
    if (!excludes.includes(name)) {
      if (Array.isArray(key)) {
        key.forEach((k) => {
          let value = '';
          value = k.includes('.')
            ? getArgsFromKey(
                k,
                field,
                loggedInUserData,
                projectConstant,
                environments,
                collectionConstant,
                previousActionResponse,
                previousActionFormData,
              )
            : field[k];
          innerArgs.push(value);
        });
        args.push(innerArgs);
      } else if (key === 'CURRENT_DATE_TIME') {
        args.push(key);
      } else if (key.includes('.')) {
        const value = getArgsFromKey(
          key,
          field,
          loggedInUserData,
          projectConstant,
          environments,
          collectionConstant,
          previousActionResponse,
          previousActionFormData,
        );
        args.push(value);
      } else {
        if (['updatedAt', 'createdAt'].includes(key)) offset = true;
        args.push(field[key]);
      }
    }
  });
  const timezone = +document.getElementById('project-timezone').innerText || 0;
  switch (functionDef.functionType) {
    case 'CAPITALIZE':
      return capitalize(args[0], restToLower);
    case 'LOWER_CASE':
      return lowerCase(args[0]);
    case 'UPPER_CASE':
      return upperCase(args[0]);
    case 'SLUGIFY':
      return slugify(args[0]);
    case 'TRIM':
      return trim(args[0], whitespace, type);
    case 'TITLE_CASE':
      return titleCase(args[0], noSplitopt);
    case 'TRUNCATE':
      return truncate(args[0], length, endopt);
    case 'SUB_STRING':
      return substr(args[0], startLength, endLength);
    case 'STRING_JOIN':
      return strJoin(args[0], separator, startString, endString);
    case 'SPLIT_STRING':
      return splitString(args[0], separator, index, indexNum);
    case 'CUSTOM_SENTENCE':
      return evaluateCustomSentence(
        expression,
        field,
        loggedInUserData,
        projectConstant,
        environments,
        collectionConstant,
        previousActionResponse,
        previousActionFormData,
      );
    case 'ADDITION':
      return addition(formatType, { numbers: args[0] });
    case 'AVERAGE':
      return average(formatType, { numbers: args[0] });
    case 'MULTIPLY':
      return multiply(formatType, { numbers: args[0] });
    case 'DIVIDE':
      return divide(formatType, { number1: args[0], number2: args[1] });
    case 'CUSTOM_CALCULATION':
      return evaluateExpression(
        expression,
        field,
        loggedInUserData,
        formatType,
        projectConstant,
        environments,
        collectionConstant,
        previousActionResponse,
        previousActionFormData,
      );
    case 'CUSTOM_JS_LOGIC':
    case 'CUSTOM_JAVASCRIPT_LOGIC':
      return evaluateJSLogic(
        expression,
        field,
        loggedInUserData,
        projectConstant,
        environments,
        collectionConstant,
        previousActionResponse,
        previousActionFormData,
      );
    case 'SUBSTRACTION':
      return substraction(formatType, { numbers1: args[0], numbers2: args[1] });
    case 'COUNT':
      return count(args[0], condition, refField, match, refFieldType);
    case 'PERCENTAGE':
      return percentage(args[0], condition, refField, match, refFieldType, formatType);
    case 'FIND_RECORD':
      return findRecord(args[0], refField, index);
    case 'FORMAT_DATE':
      return formatDate(
        formatType.replace(SPACE_KEYWORD_REGEX, ' '),
        args[0],
        timezone,
        unixType,
        offset,
      );
    case 'DATE_DIFFERENCE':
      return dateDifference(formatType, args[0], args[1], timezone);
    case 'DATE_ADD':
      return dateAdd(args[0], unitToAdd, unitTypeToAdd, formatType);
    case 'CURRENCY_FORMAT':
      return evaluateCurrency(formatType, args[0], currency, position, maxFraction);
    case 'BEAUTIFY_LIST':
      return beautifyList(args[0], positionOfRecords, numberOfRecords, elementToRender);
    case 'MARKDOWN_TO_HTML':
      return markdownToHtml(args[0]);
    case 'TABLE_FORMAT':
      return formatDataOnTable(
        args[0],
        tableStyle,
        theadStyle,
        tbodyStyle,
        trStyle,
        tdStyle,
        thStyle,
        tableRefernceFields,
      );
    case 'MASKING':
      return masking(args[0], visibleCharCount, maskPosition, maskCharacter);
    default:
      return '';
  }
};

async function searchInDataGroup(paginationData, forNonPersistentData = false) {
  let typeOfAction = '';
  if (typeof paginationData.event !== 'undefined') {
    const { target, submitter } = paginationData.event;
    typeOfAction = submitter ? submitter.value : '';
    paginationData.searchString = convertQueryStringFromFormElements(target, paginationData);
    appendLoaderToElement(submitter);
  }

  const {
    dataGroupChildren,
    searchString,
    finderId,
    collectionName,
    externalQueryParamKeys,
    originalDataGroup,
  } = paginationData;
  const { itemData } = await getPageItemData();
  const { event } = paginationData || '';
  const { target, submitter } = event || '';

  if (typeOfAction && typeOfAction === 'export') {
    let endpoint = `collection-table/${collectionName}/finder/${finderId}/export-data?${searchString}`;
    endpoint = await addEntityQueryToUrl(endpoint, collectionName, finderId);
    endpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      endpoint,
      itemData,
      originalDataGroup,
    );
    if (forNonPersistentData) {
      //TODO: Need to add support for Non Persistent Data in DataGroup.
    } else {
      await downloadFile(endpoint);
      removeLoaderFromElement(submitter, 'DataGroup Data Search');
    }
  } else if (forNonPersistentData) {
    //TODO: Need to add support for Non Persistent Data in DataGroup.
  } else {
    let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?${searchString}`;
    countItemsEndpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      countItemsEndpoint,
      itemData,
      originalDataGroup,
    );
    countItemsEndpoint = await addEntityQueryToUrl(countItemsEndpoint, collectionName, finderId);
    const totalCount = await securedGetCall(countItemsEndpoint);
    let isPrivateFilter = totalCount ? totalCount._$isPrivateFilter : null;
    paginationData.numberOfPages = getNumberOfPages(totalCount.data, paginationData.numberPerPage);
    paginationData.currentPage = 1;
    paginationData.replacedElement.innerHTML = '';
    paginationData.finderId = finderId;
    loadGroupData(paginationData, isPrivateFilter);
    if (target && target.hasAttribute('data-enableSearchHistory')) {
      sendDataToSearchHistory(collectionName, searchString);
    }
    removeLoaderFromElement(submitter, 'DataGroup Data Search');
  }
}

const sendDataToSearchHistory = async (collectionName, searchString) => {
  const query = queryStringToJson(searchString);
  const endpoint = `open/collection-form/search_history/items`;
  let data = {
    name: collectionName,
    query: query,
  };
  if (isLoggedInUser()) {
    const loggedInUser = fetchLoggedInUserJson();
    data.createdBy = loggedInUser.uuid;
  }
  await unSecuredPostCall(data, endpoint);
};
const queryStringToJson = (queryString) => {
  const pairs = queryString.split('&');
  const result = {};
  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    result[key] = decodeURIComponent(value);
  });
  return result;
};

const convertQueryStringFromFormElements = (formElements, paginationData = null) => {
  const { responseDataMapping, bodyDataFrom } = paginationData ? paginationData : {};
  let isNonPersistent = bodyDataFrom ? bodyDataFrom === 'NON_PERSISTENT_COLLECTION' : false;
  let searchDataSource = DATA_SOURCE_DEFAULT;
  const dataSearchForm = formElements;
  let formDataSet = dataSearchForm ? dataSearchForm.dataset : '';
  if (formDataSet && formDataSet.hasOwnProperty('datasource')) {
    searchDataSource = formDataSet['datasource'];
  }

  return Object.values(formElements)
    .map((el) => {
      if (el && el.type === 'select-multiple') {
        let options = el.selectedOptions;
        let values = Array.from(options).map(({ value }) => value);
        values = values.join(',');
        return prepareQuerySearchString(
          el.name,
          values,
          searchDataSource,
          isNonPersistent,
          responseDataMapping,
        );
      } else if (el && el.name && el.value) {
        return prepareQuerySearchString(
          el.name,
          el.value,
          searchDataSource,
          isNonPersistent,
          responseDataMapping,
        );
      }
    })
    .filter(Boolean)
    .join('&');
};

function prepareQuerySearchString(name, value, dataSource, isNonPersistent, responseDataMapping) {
  let searchKey = name;
  if (isNonPersistent && responseDataMapping) {
    searchKey = responseDataMapping.hasOwnProperty(name) ? responseDataMapping[name] : name;
  }
  switch (dataSource) {
    case DATA_SOURCE_SUPABASE:
      return encodeURIComponent(searchKey) + '=eq.' + encodeURIComponent(value);
    case DATA_SOURCE_DIRECTUS:
      return `filter[${encodeURIComponent(searchKey)}]` + '[_eq]=' + encodeURIComponent(value);
    default:
      return encodeURIComponent(searchKey) + '=' + encodeURIComponent(value);
  }
}

const addDataGroupDataToMap = async (
  paginationData,
  originalDataGroup,
  isNonPersistent = false,
  addNonPersistentToMap = false,
) => {
  if (isNonPersistent) {
    if (addNonPersistentToMap) {
      dataGroupPaginationDataMap.set('nonpersist_pgdata_' + originalDataGroup.id, paginationData);
    }
  } else {
    dataGroupPaginationDataMap.set('pgdata_' + originalDataGroup.id, paginationData);
  }
};

function nextDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage += 1;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dgPaginationDataMapValue = dataGroupPaginationDataMap.get(
      `nonpersist_pgdata_${paginationData.dataGroup.id}`,
    );
    if (paginationData.enablePagination) {
      paginationData.offsetValue += offsetKey ? numberPerPage : '';
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      prepareExternalApiPaginatedDataGroup(paginationData, true);
    }
  } else {
    loadGroupData(paginationData);
  }
}

function firstDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage = 1;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dgPaginationDataMapValue = dataGroupPaginationDataMap.get(
      `nonpersist_pgdata_${paginationData.dataGroup.id}`,
    );
    if (paginationData.enablePagination) {
      paginationData.offsetValue = offsetKey ? 0 : '';
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      prepareExternalApiPaginatedDataGroup(paginationData, true);
    }
  } else {
    loadGroupData(paginationData);
  }
}

function lastDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage = paginationData.numberOfPages;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dgPaginationDataMapValue = dataGroupPaginationDataMap.get(
      `nonpersist_pgdata_${paginationData.dataGroup.id}`,
    );
    if (paginationData.enablePagination) {
      paginationData.offsetValue = offsetKey ? numberPerPage : '';
      paginationData.pageOffsetValue = paginationData.currentPage;
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      prepareExternalApiPaginatedDataGroup(paginationData, true);
    }
  } else {
    loadGroupData(paginationData);
  }
}

function previousDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage -= 1;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dgPaginationDataMapValue = dataGroupPaginationDataMap.get(
      `nonpersist_pgdata_${paginationData.dataGroup.id}`,
    );
    if (paginationData.enablePagination) {
      paginationData.offsetValue -= offsetKey ? numberPerPage : '';
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      prepareExternalApiPaginatedDataGroup(paginationData, true);
    }
  } else {
    loadGroupData(paginationData);
  }
}

function loadMoreRecords(paginationData) {
  paginationData.currentPage += 1;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dgPaginationDataMapValue = dataGroupPaginationDataMap.get(
      `nonpersist_pgdata_${paginationData.dataGroup.id}`,
    );
    if (paginationData.enablePagination) {
      paginationData.offsetValue += offsetKey ? numberPerPage : '';
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      prepareExternalApiPaginatedDataGroup(paginationData, true);
    }
  } else {
    loadGroupData(paginationData);
  }
}

const prepareItemDataAndExternalQueryParam = (
  externalQueryParamKeys,
  endpoint,
  itemData,
  originalDataGroup,
) => {
  let endpointParam = '';
  const checkItContainsParam = endpoint.includes('?');

  if (externalQueryParamKeys && externalQueryParamKeys.length > 0) {
    if (!checkItContainsParam) {
      endpoint = `${endpoint}?`;
    }
    externalQueryParamKeys.forEach((param) => {
      const paramKey = originalDataGroup.getAttribute(param);
      if (paramKey && itemData) {
        const extParamValue = itemData[paramKey];
        if (extParamValue) {
          endpointParam += `&${param}=${extParamValue}`;
        }
      } else {
        console.log('I do not have page item param or param key :>> ', param);
      }
    });
  }

  endpoint = checkItContainsParam
    ? `${endpoint}${endpointParam}`
    : `${endpoint}${endpointParam.substr(1, endpointParam.length + 1)}`;

  return endpoint;
};

const prepareItemDataAndExternalQueryParamForTable = (
  externalQueryParamKeys,
  endpoint,
  itemData,
  dataTable,
) => {
  const checkItContainsParam = endpoint.includes('?');
  let endpointParam = '';
  if (!checkItContainsParam) {
    endpoint = `${endpoint}?`;
  }

  if (externalQueryParamKeys && externalQueryParamKeys.length > 0) {
    externalQueryParamKeys.forEach((param) => {
      const paramKey = dataTable.getAttribute(param);
      if (paramKey && itemData) {
        const extParamValue = parseValueFromData(itemData, paramKey);
        if (extParamValue) {
          endpointParam += `&${param}=${extParamValue}`;
        }
      }
    });
  }

  endpoint = checkItContainsParam
    ? `${endpoint}${endpointParam}`
    : `${endpoint}${endpointParam.substr(1, endpointParam.length + 1)}`;
  return endpoint;
};

const isEntityInCondition = (value) => {
  let isEntity = false;
  if (value && Array.isArray(value)) {
    value.forEach((val) => {
      if (typeof val === 'string' || val instanceof String) isEntity = val.startsWith('ENTITY::');
    });
  } else {
    if (value && (typeof value === 'string' || value instanceof String))
      isEntity = value.startsWith('ENTITY::');
  }
  return isEntity;
};

const getDerivedFieldJSON = (utilities, key) => {
  const utility = utilities.find((utility) => utility.name === key);
  const SPACE_KEYWORD = '#SPACE#';
  const utilityJson = { args: utility.args, functionType: utility.functionType };
  let utilityJsonString = JSON.stringify({
    args: utility.args,
    functionType: utility.functionType,
  })
    .split('"')
    .join("'");

  if (utility.functionType === 'FORMAT_DATE') {
    utilityJsonString = JSON.stringify(utilityJson)
      .split('"')
      .join("'")
      .replace(/ /g, SPACE_KEYWORD); //Handling Spaces in Date Format
  }
  return utilityJsonString;
};

const addEntityQueryToUrl = async (endpoint, collectionName, finderId) => {
  const checkItContainsParam = endpoint.includes('?');
  let endpointParam = '';
  if (!checkItContainsParam) {
    endpoint = `${endpoint}?`;
  }

  const { finders, utilities } = await getCollectionDetails(collectionName);
  const finder = finders.find((finder) => finder.uuid === finderId);
  finder?.conditions.forEach((cond) => {
    if (isEntityInCondition(cond?.query?.value)) {
      const key = cond.query.value.replace('ENTITY::', '');
      const storageKey = `entity_${cond.query?.customEntityKey}`;
      let entityItem = parseLSJSONStrToJSON(storageKey);
      const field = key.startsWith('DF::')
        ? getDerivedFieldJSON(utilities, key.replace('DF::', ''))
        : key;
      const value = parseValueFromData(entityItem, field);
      endpointParam += value ? `&${key}=${value}` : '';
    }
  });
  endpoint = checkItContainsParam
    ? `${endpoint}${endpointParam}`
    : `${endpoint}${endpointParam.substr(1, endpointParam.length + 1)}`;
  console.log('\n endpoint In :>> ', endpoint);
  return endpoint;
};

const addDataGroupMarkerInfo = (
  itemData,
  map,
  fieldLat,
  fieldLong,
  fieldHeader,
  fieldDescription,
) => {
  let infoClickObj = [];
  itemData.map((field) => {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng({
        lat: Number(field[fieldLat]),
        lng: Number(field[fieldLong]),
      }),
      map: map,
    });

    let prepareContent = '<div>';
    if (field[fieldHeader]) {
      prepareContent += `<h6>${field[fieldHeader]}</h6>`;
    }
    if (field[fieldDescription]) {
      prepareContent += `<p>${field[fieldDescription]}</p>`;
    }

    prepareContent += '</div>';
    const infoWindow = new google.maps.InfoWindow({
      content: prepareContent,
    });
    marker.addListener('click', function () {
      clearInfoClickReference(infoClickObj);
      infoWindow.open(marker.get('map'), marker);
      infoClickObj[0] = infoWindow;
    });
  });
};

function appendLoaderToElement(targetElement, checkActionTrigger = true) {
  if (targetElement) {
    let triggerElem = checkActionTrigger ? getActionTriggerElem(targetElement) : targetElement;

    if (triggerElem) {
      const startTime = performance.now();
      const triggerElemContent = triggerElem.innerHTML;
      triggerElem.setAttribute('show-action-loader', true);
      triggerElem.setAttribute('action-start-time', startTime);

      let loaderType = 'defaultloader';
      if (triggerElem.hasAttribute('event-loader-type')) {
        loaderType = triggerElem.getAttribute('event-loader-type');
      }
      switch (loaderType) {
        case 'noloader':
          break;
        case 'onlyloader':
          triggerElem.setAttribute('org-content', triggerElemContent);
          triggerElem.innerHTML = `<i class='fa fa-spinner fa-spin'></i>`;
          break;
        default:
          triggerElem.innerHTML = `${triggerElemContent} <i class='fa fa-spinner fa-spin'></i>`;
          break;
      }
      return triggerElem;
    }
  }
}

function removeLoaderFromElement(targetElement, actionLabel = '', checkActionTrigger = true) {
  if (targetElement) {
    let triggerElem = checkActionTrigger ? getActionTriggerElem(targetElement) : targetElement;

    if (triggerElem) {
      if (triggerElem.hasAttribute('action-start-time')) {
        const startTime = triggerElem.getAttribute('action-start-time')
          ? parseFloat(triggerElem.getAttribute('action-start-time'))
          : null;
        const endTime = performance.now();
        const timeTaken = (endTime - startTime).toFixed(2);
        if (actionLabel) {
          console.log(
            `%c${actionLabel} - Completed in ${timeTaken} ms`,
            'color: green; font-weight: bold;',
          );
        } else {
          console.log(`%cCompleted in ${timeTaken} ms`, 'color: green; font-weight: bold;');
        }
      }
      removeActionLoader(triggerElem);
    }
  }
}

async function searchInDataTable(paginationData, searchQuery = '', forNonPersistentData = false) {
  let typeOfAction = '';
  if (typeof paginationData.event !== 'undefined') {
    const { target, submitter } = paginationData.event;
    typeOfAction = submitter ? submitter.value : '';
    appendLoaderToElement(submitter);
    paginationData.searchString = convertQueryStringFromFormElements(target, paginationData);
  }

  if (
    typeof paginationData.searchString !== 'undefined' &&
    paginationData.searchString &&
    searchQuery
  ) {
    if (searchQuery.startsWith('?')) {
      searchQuery = searchQuery.replace('?', '&');
    }
    paginationData.searchString =
      paginationData.searchString + '&' + paginationData.searchString + searchQuery;
  } else if (typeof paginationData.searchString === 'undefined' && searchQuery) {
    if (searchQuery.startsWith('?')) {
      searchQuery = searchQuery.replace('?', '');
    }
    paginationData.searchString = searchQuery;
  }

  const {
    dataTable,
    searchString,
    finderId,
    collectionName,
    tbodyElement,
    externalQueryParamKeys,
  } = paginationData;
  const { itemData } = await getItemDataForElement(dataTable);
  if (typeOfAction && typeOfAction === 'export') {
    let endpoint = `collection-table/${collectionName}/finder/${finderId}/export-data?${searchString}`;
    endpoint = await addEntityQueryToUrl(endpoint, collectionName, finderId);
    endpoint = prepareItemDataAndExternalQueryParamForTable(
      externalQueryParamKeys,
      endpoint,
      itemData,
      dataTable,
    );
    if (forNonPersistentData) {
      let response = {};
      let { isPaginated } = paginationData;

      await loadExternalApiResponseDataList(
        paginationData,
        response,
        isPaginated ? isPaginated : false,
        true,
      );
    } else {
      await downloadFile(endpoint);
    }
  } else if (forNonPersistentData) {
    let response = {};
    await loadExternalApiResponseDataList(paginationData, response, false);
  } else {
    const theadElement = dataTable.querySelector('thead');
    const columnCount = theadElement.rows[0].cells.length;
    if (validateDataTableProps(finderId, collectionName, columnCount, tbodyElement)) {
      let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?${searchString}`;
      countItemsEndpoint = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        countItemsEndpoint,
        itemData,
        dataTable,
      );
      countItemsEndpoint = await addEntityQueryToUrl(countItemsEndpoint, collectionName, finderId);
      try {
        const totalCount = await securedGetCall(countItemsEndpoint);
        let isPrivateFilter = totalCount ? totalCount._$isPrivateFilter : null;
        if (totalCount && totalCount.data > 0) {
          paginationData.numberOfPages = getNumberOfPages(
            totalCount.data,
            paginationData.numberPerPage,
          );
          paginationData.currentPage = 1;
          paginationData.finderId = finderId;
          loadDataList(paginationData);
        } else {
          if (isPrivateFilter) {
            tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}">This data is private hence cannot be displayed</td></tr>`;
            // processLogoutUser('/');
            validatePaginationButton(1, 1, dataTable);
            return;
          }
          tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}"></td></tr>`;
          validatePaginationButton(1, 1, dataTable);
        }
      } catch (error) {
        console.error('🚀 ~ searchInDataTable ~ error:', error);
      }
    } else {
      validatePaginationButton(1, 1, dataTable);
    }
  }
  const { event } = paginationData || '';
  const { target, submitter } = event || '';
  if (target && target.hasAttribute('data-enableSearchHistory')) {
    sendDataToSearchHistory(collectionName, searchString);
  }
  removeLoaderFromElement(submitter, 'DataTable Data Search');
}

const autoSearchInDataSearch = (enableAutoSearch, search) => {
  if (enableAutoSearch) {
    let searchFormSubmitBtn = search.querySelector('[type=submit]:not([value="export"]');

    //Fallback search button
    if (!searchFormSubmitBtn) {
      let newSearchBtnElem = document.createElement('button');
      newSearchBtnElem.role = 'button';
      newSearchBtnElem.type = 'submit';
      newSearchBtnElem.style.cssText +=
        'height:1px !important;width: 1px !important;overflow: hidden !important;padding: 0 !important;position: absolute !important;border: 0 !important';
      search.appendChild(newSearchBtnElem);
      searchFormSubmitBtn = newSearchBtnElem;
    }

    const allowedElementTags = ['INPUT', 'SELECT', 'DIV'];
    const restrictedKeyCodes = [16, 17, 18, 33, 34, 35, 36, 37, 38, 39, 40, 224, 229];

    if (searchFormSubmitBtn) {
      let searchChildElems = [];
      loadElementChildList(search, searchChildElems);
      if (searchChildElems && searchChildElems.length > 0) {
        searchChildElems.forEach((searchChildNode) => {
          let searchChildNodeTag = searchChildNode.tagName;
          let selectElemId = searchChildNode.id;
          if (allowedElementTags.includes(searchChildNodeTag)) {
            if (searchChildNodeTag === 'INPUT') {
              const isModalParent = !!findModalParent(search);
              if (isModalParent) {
                checkForDateType('[id^=modal-container]');
                checkForDateType('[data-subpage-id]');
              }
              const isFlatpickerDataElem = searchChildNode.hasAttribute('flat-picker-date-type');

              if (isFlatpickerDataElem) {
                searchChildNode.addEventListener('change', function (event) {
                  event.preventDefault();
                  if (searchFormSubmitBtn) {
                    searchFormSubmitBtn.click();
                  }
                  searchChildNode.blur();
                });
              } else {
                searchChildNode.addEventListener('keyup', function (event) {
                  event.preventDefault();
                  if (event.isComposing || restrictedKeyCodes.includes(event.keyCode)) {
                    return;
                  }
                  if (searchFormSubmitBtn) {
                    searchFormSubmitBtn.click();
                  }
                });
              }
            }
            if (searchChildNodeTag === 'SELECT' && selectElemId) {
              $(`#${selectElemId}`).on('select2:select', function (event) {
                event.preventDefault();
                if (searchFormSubmitBtn) {
                  searchFormSubmitBtn.click();
                }
              });
            }
            if (searchChildNodeTag === 'DIV') {
              const searchFormTelElem = searchChildNode.querySelector(
                '[class*=iti--allow-dropdown] input[type=tel]',
              );
              if (searchFormTelElem) {
                searchChildNode.addEventListener('keyup', function (event) {
                  event.preventDefault();
                  if (event.isComposing || restrictedKeyCodes.includes(event.keyCode)) {
                    return;
                  }
                  if (searchFormSubmitBtn) {
                    searchFormSubmitBtn.click();
                  }
                });
              }
            }
          }
        });
      }
    }
  }
};

const validateDataTableProps = (finderId, collectionName, fieldName, columnCount, tbodyElement) => {
  let isValid = true;
  if (!collectionName) {
    tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}"> Please select a valid collection</td></tr>`;
    isValid = false;
  }
  return isValid;
};

async function loadDataList(paginationData, checkPersistentPagination = false) {
  const {
    numberPerPage,
    filteredItemsUrl,
    fieldName,
    searchString,
    externalQueryParamKeys,
    dataTable,
    persistentPagination,
  } = paginationData;
  let { currentPage } = paginationData;
  let endpoint = filteredItemsUrl;
  let searchQuery = await searchQueryStringFromUrl();
  if (!fieldName) {
    const { itemData } = await getItemDataForElement(dataTable);

    //Handling Persistent Pagination
    if (checkPersistentPagination && persistentPagination) {
      const { sessionCurrentPage } = persistentPagination;
      if (sessionCurrentPage) {
        currentPage = sessionCurrentPage;
      }
    }

    const begin = (currentPage - 1) * numberPerPage;
    const end = begin + numberPerPage;
    endpoint = `${endpoint}?offset=${begin}&limit=${numberPerPage}`;
    const dateRangeQueryParams = getDataRangeQuery(paginationData, 'dataTable', searchString);
    if (dateRangeQueryParams) endpoint += '&' + dateRangeQueryParams;
    endpoint = prepareItemDataAndExternalQueryParamForTable(
      externalQueryParamKeys,
      endpoint,
      itemData,
      dataTable,
    );
    if (searchString !== '' && searchString !== undefined) {
      endpoint += `&${searchString}`;
    } else {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        endpoint = endpoint + searchQuery;
      }
    }
  }
  try {
    // Fix Unhandled Promise Rejection on IOS device browsers
    await renderDataTable(endpoint, paginationData);
  } catch (error) {
    console.error('*** loadDataList ~ renderDataTable error:', error);
  }
  validatePaginationButton(paginationData.numberOfPages, currentPage, paginationData.dataTable);
  validateNumberPaginationNav(paginationData);
  showPaginationNumbersByCurrentPage(paginationData);
}

function processComponentVisibilityCondition(visibilityElem, compVisibilityDataJson) {
  const { itemData } = compVisibilityDataJson || '';
  const visConditionJson = parseVisibilityCondition(visibilityElem);
  const visThenCondition = visConditionJson['visThenCondition'];
  const visWhenUserStatus = visConditionJson['visWhenUserStatus'];
  const visWhenCollectionFrom = visConditionJson['visWhenCollectionFrom'];
  const visWhenCollection = visConditionJson['visWhenCollection'];
  const visEnvHide = visConditionJson['visEnvHide'];
  const visThenAddClass = visConditionJson['visThenAddClass'];
  const visThenRemoveClass = visConditionJson['visThenRemoveClass'];
  let componentVisibility = visThenCondition;
  let shouldRenderVisibility = true;
  let compVisExpression = [];

  if (visWhenUserStatus) {
    switch (visWhenUserStatus) {
      case 'LOGGED_IN':
        if (!isLoggedInUser()) {
          compVisExpression.push(false);
        } else {
          compVisExpression.push(true);
        }
        break;
      case 'NOT_LOGGED_IN':
        if (isLoggedInUser()) {
          compVisExpression.push(false);
        } else {
          compVisExpression.push(true);
        }
        break;
      default:
        break;
    }
  }

  if (visWhenCollectionFrom && visWhenCollection) {
    const isSnippetElem = !!visibilityElem.closest('[data-snippet-id]');
    const isSubpageElem = !!visibilityElem.closest('[data-subpage-id]');
    const isModalParent = !!findModalParent(visibilityElem);
    const isSnippetType = isSnippetElem || isSubpageElem || isModalParent;
    switch (visWhenCollectionFrom) {
      case 'PARENT_CMS_COMPONENT':
        processComponentVisibilityConditionExp(visConditionJson, compVisExpression, itemData);
        break;
      case 'SNIPPET_COLLECTION':
        if (isSnippetType) {
          processComponentVisibilityConditionExp(visConditionJson, compVisExpression, itemData);
        }
        break;
      case 'CURRENT_LOGGEDIN_USER':
        processComponentVisibilityConditionExp(
          visConditionJson,
          compVisExpression,
          fetchLoggedInUserJson(),
        );
        break;
      case 'CURRENT_LOGGEDIN_TENANT':
        processComponentVisibilityConditionExp(
          visConditionJson,
          compVisExpression,
          fetchCurrentTenantJson(),
        );
        break;
      case 'CURRENT_LOGGEDIN_USER_SETTINGS':
        processComponentVisibilityConditionExp(
          visConditionJson,
          compVisExpression,
          fetchCurrentUserSettingsJson(),
        );
        break;
      case 'CURRENT_LOGGEDIN_SUB_TENANT':
        processComponentVisibilityConditionExp(
          visConditionJson,
          compVisExpression,
          fetchCurrentSubTenantJson(),
        );
        break;
      case 'BROWSER_STORAGE':
        if (visWhenCollection === 'BROWSER_STORAGE') {
          processComponentVisibilityConditionExp(visConditionJson, compVisExpression, itemData);
        }
        break;
      default:
        break;
    }
  }

  if (compVisExpression && compVisExpression.length) {
    if (compVisExpression.includes(false)) {
      shouldRenderVisibility = false;
    }
  } else {
    shouldRenderVisibility = false;
  }

  if (shouldRenderVisibility || componentVisibility === 'SHOW') {
    renderComponentVisibility(
      componentVisibility,
      visibilityElem,
      shouldRenderVisibility,
      visThenAddClass,
      visThenRemoveClass,
    );
  }
  visibilityElem.removeAttribute('data-vis-condition');
}

const processComponentVisibilityConditionExp = (visConditionJson, compVisExpression, itemData) => {
  const visWhenCollection = visConditionJson['visWhenCollection'];
  const visWhenCollectionField = visConditionJson['visWhenCollectionField'];
  const visWhenCollectionFieldType = visConditionJson['visWhenCollectionFieldType'];
  const visWhenCondition = visConditionJson['visWhenCondition'];
  const visWhenCollectionFieldValue = visConditionJson['visWhenCollectionFieldValue'];
  const visWhenCollectionFieldFixedValue = visConditionJson['visWhenCollectionFieldFixedValue'];
  const visWhenCollectionFrom = visConditionJson['visWhenCollectionFrom'];
  const visWhenBsl = visConditionJson['visWhenBsl'];
  const visWhenBslKey = visConditionJson['visWhenBslKey'];
  const visWhenBslFixedValue = visConditionJson['visWhenBslFixedValue'];

  if (visWhenCondition) {
    if (itemData && Object.keys(itemData).length) {
      const visWhenDTO = {
        visWhenCondition,
        visWhenCollectionField,
        visWhenCollectionFieldFixedValue,
        visWhenCollectionFieldValue,
        visWhenCollectionFieldType,
        visWhenCollectionFrom,
        visWhenBsl,
        visWhenBslKey,
        visWhenBslFixedValue,
      };
      processVisWhenConditionForItem(itemData, visWhenDTO, compVisExpression);
    }
  }
};

function getReferenceFieldValue(itemData, fieldName) {
  const fullNameParts = fieldName.split('.');
  if (fullNameParts.length > 1) {
    let referenceField = fullNameParts[0];
    let nestedField = fullNameParts[1];
    if (Array.isArray(itemData[referenceField])) {
      return itemData[referenceField].length > 0 ? itemData[referenceField][0][nestedField] : null;
    } else if (typeof itemData[referenceField] === 'object' && itemData[referenceField] !== null) {
      return itemData[referenceField][nestedField];
    }
  }
  return null;
}

function processVisWhenConditionForItem(itemData, visWhenDTO, compVisExpression) {
  const {
    visWhenCondition,
    visWhenCollectionField,
    visWhenCollectionFieldFixedValue,
    visWhenCollectionFieldValue,
    visWhenCollectionFieldType,
    visWhenCollectionFrom,
    visWhenBsl,
    visWhenBslKey,
    visWhenBslFixedValue,
  } = visWhenDTO || {};
  let result = false;
  const isStaticOrDynamicOptionField =
    visWhenCollectionFieldType &&
    ['static_option', 'dynamic_option'].includes(visWhenCollectionFieldType);
  const isNumberField = visWhenCollectionFieldType && visWhenCollectionFieldType === 'number';
  // const isBooleanField = visWhenCollectionFieldType && visWhenCollectionFieldType === 'boolean';
  const leftSideValue =
    visWhenCollectionFrom === 'BROWSER_STORAGE'
      ? _.get(itemData, visWhenBslKey)
      : visWhenCollectionField && visWhenCollectionField.includes('.')
        ? getReferenceFieldValue(itemData, visWhenCollectionField)
        : _.get(itemData, visWhenCollectionField);
  let rightSideValue = '';

  switch (visWhenCollectionFieldType) {
    case 'number':
      rightSideValue = Number(
        visWhenCollectionFieldFixedValue
          ? visWhenCollectionFieldFixedValue
          : visWhenCollectionFieldValue || 0,
      );
      break;
    default:
      if (visWhenCollectionFrom === 'BROWSER_STORAGE') {
        rightSideValue = visWhenBslFixedValue || '';
      } else {
        rightSideValue = visWhenCollectionFieldFixedValue
          ? visWhenCollectionFieldFixedValue
          : visWhenCollectionFieldValue || '';
      }
      break;
  }

  switch (visWhenCondition) {
    case 'EQUALS':
      if (isStaticOrDynamicOptionField && leftSideValue && Array.isArray(leftSideValue)) {
        result = leftSideValue.includes(rightSideValue);
      } else {
        result = leftSideValue && leftSideValue === rightSideValue;
      }
      result = Boolean(result);
      break;
    case 'NOT_EQUALS':
      if (isStaticOrDynamicOptionField && leftSideValue && Array.isArray(leftSideValue)) {
        result = !leftSideValue.includes(rightSideValue);
      } else {
        result = leftSideValue && leftSideValue !== rightSideValue;
      }
      result = Boolean(result);
      break;
    case 'IN_LIST':
      if (isStaticOrDynamicOptionField && leftSideValue && Array.isArray(leftSideValue)) {
        result = leftSideValue.includes(rightSideValue);
      }
      result = Boolean(result);
      break;
    case 'NOT_IN_LIST':
      if (isStaticOrDynamicOptionField && leftSideValue && Array.isArray(leftSideValue)) {
        result = !leftSideValue.includes(rightSideValue);
      }
      result = Boolean(result);
      break;
    case 'IS_NULL':
      if (Array.isArray(leftSideValue)) {
        result = leftSideValue.length === 0;
      } else {
        result =
          typeof leftSideValue === 'undefined' ||
          _.isNull(leftSideValue) ||
          _.isEmpty(leftSideValue);
      }
      result = Boolean(result);
      break;
    case 'IS_NOT_NULL':
      if (Array.isArray(leftSideValue)) {
        result = leftSideValue.length > 0;
      } else {
        result = !(
          typeof leftSideValue === 'undefined' ||
          _.isNull(leftSideValue) ||
          _.isEmpty(leftSideValue)
        );
      }
      result = Boolean(result);
      break;
    case 'IS_BOOLEAN_FALSE':
      if (itemData && Object.keys(itemData).length) {
        if (itemData.hasOwnProperty(visWhenCollectionField)) {
          result = typeof leftSideValue === 'undefined' || falsyValues.includes(leftSideValue);
        } else {
          result = typeof leftSideValue === 'undefined' || falsyValues.includes(leftSideValue);
        }
      }
      result = Boolean(result);
      break;
    case 'IS_BOOLEAN_TRUE':
      result = truthyValues.includes(leftSideValue);
      result = Boolean(result);
      break;
    case 'LESS_THAN':
      result =
        !isStaticOrDynamicOptionField &&
        isNumberField &&
        leftSideValue &&
        leftSideValue < rightSideValue;
      result = Boolean(result);
      break;
    case 'GREATER_THAN':
      result =
        !isStaticOrDynamicOptionField &&
        isNumberField &&
        leftSideValue &&
        leftSideValue > rightSideValue;
      result = Boolean(result);
      break;
    case 'LESS_THAN_EQUALS_TO':
      result =
        !isStaticOrDynamicOptionField &&
        isNumberField &&
        leftSideValue &&
        leftSideValue <= rightSideValue;
      result = Boolean(result);
      break;
    case 'GREATER_THAN_EQUALS_TO':
      result =
        !isStaticOrDynamicOptionField &&
        isNumberField &&
        leftSideValue &&
        leftSideValue >= rightSideValue;
      result = Boolean(result);
      break;
    default:
      break;
  }
  compVisExpression.push(result);
}

function renderComponentVisibility(
  componentVisibility,
  visibilityElem,
  shouldRenderVisibility,
  visThenAddClass,
  visThenRemoveClass,
) {
  switch (componentVisibility) {
    case 'SHOW':
      if (shouldRenderVisibility) {
        visibilityElem.classList.remove('d-none');
        visibilityElem.classList.remove('hide');
        visibilityElem.classList.remove('hidden');
        // visibilityElem.classList.add('d-block');

        let elementStyleDisplayValue = visibilityElem.style.display;
        if (
          elementStyleDisplayValue &&
          !['none', 'none !important'].includes(elementStyleDisplayValue)
        ) {
          visibilityElem.style.display = elementStyleDisplayValue;
        } else {
          visibilityElem.style.setProperty('display', 'inline-block');
        }
        visibilityElem.style.visibility = 'visible';
      } else {
        visibilityElem.setAttribute('data-vis-removed', true);
        visibilityElem.remove();
      }
      handleClassChanges(visibilityElem, visThenAddClass, visThenRemoveClass);
      break;
    case 'HIDE':
    case 'DONT_SHOW':
      handleClassChanges(visibilityElem, visThenAddClass, visThenRemoveClass);
      visibilityElem.setAttribute('data-vis-removed', true);
      visibilityElem.remove();
      break;
    case 'DISABLED':
    case 'SHOW_DISABLED':
      visibilityElem.classList.add('disabled');
      visibilityElem.setAttribute('disabled', true);
      handleClassChanges(visibilityElem, visThenAddClass, visThenRemoveClass);
      break;
    case 'READ_ONLY':
    case 'SHOW_READ_ONLY':
      visibilityElem.setAttribute('readonly', true);
      handleClassChanges(visibilityElem, visThenAddClass, visThenRemoveClass);
      break;
    default:
      handleClassChanges(visibilityElem, visThenAddClass, visThenRemoveClass);
      break;
  }
}

function parseVisibilityCondition(element) {
  let conditionString = element.getAttribute('data-vis-condition');
  conditionString = conditionString ? conditionString.replaceAll("'", '"') : '';
  return conditionString ? JSON.parse(conditionString) : '';
}

function handleClassChanges(element, classToAdd, classToRemove) {
  // Handle adding classes
  if (classToAdd) {
    const classesToAdd = classToAdd
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    element.classList.add(...classesToAdd);
  }

  // Handle removing classes
  if (classToRemove) {
    const classesToRemove = classToRemove
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    classesToRemove.forEach((className) => {
      if (element.classList.contains(className)) {
        element.classList.remove(className);
      }
    });
  }
}

const renderDataTable = async (endpoint, paginationData) => {
  const {
    columnsMap,
    firstRowElements,
    tbodyElement,
    itemIds,
    collectionName,
    dataTable,
    finderId,
  } = paginationData;
  const theadElement = dataTable.querySelector('thead');
  const referenceColmunIndexes = [];
  [...theadElement.rows[0].cells].forEach((cell, index) => {
    if (['reference', 'belongsTo'].includes(elementAttribute(cell, 'type'))) {
      referenceColmunIndexes.push({
        fieldName: elementAttribute(cell, 'data-selected-column'),
        index,
      });
    }
  });
  if (tbodyElement) {
    let rows = ``;
    tbodyElement.innerHTML = rows;
    addTablePlaceholder(paginationData.numberPerPage || 1, firstRowElements, tbodyElement);
    let tableData = [];
    if (columnsMap) {
      if (itemIds) {
        const currentPage = paginationData?.currentPage ? paginationData.currentPage : 1;
        const pageData = getPaginatedData(itemIds, currentPage, paginationData.numberPerPage);
        tableData = pageData;
      } else {
        endpoint = await addEntityQueryToUrl(endpoint, collectionName, finderId);
        const response = await securedGetCall(endpoint);
        tableData = response.data;
      }
      rows += await createTableRecords(
        tableData,
        columnsMap,
        firstRowElements,
        collectionName,
        false,
        '',
        referenceColmunIndexes,
      );
      tbodyElement.innerHTML = rows;
    }
  }

  /* Initialise the magnificPopup on Images */
  $(`#${dataTable.id}[data-js=data-table] [data-js=table-body] TR`).each(function () {
    let imgElement = this.querySelector('IMG');
    if (imgElement && imgElement.hasAttribute('data-enable-popup')) {
      const anchorParentElem = imgElement.closest('A');
      const hasAnchorParentElem = !!anchorParentElem;
      if (hasAnchorParentElem) {
        const tdElem = imgElement.closest('TD');
        // the containers for all your galleries
        $(tdElem).magnificPopup({
          delegate: 'a', // the selector for gallery item
          type: 'image',
          gallery: {
            enabled: true,
          },
        });
      }
    }
  });

  /* Set the style */
  for (let [key, value] of dataTableStylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);
    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
};

const createTableRecords = async function (
  items,
  columnsMap,
  firstRowElements,
  collectionName = '',
  isExternalAPI = false,
  responseDataMapping = '',
  referenceColmunIndexes,
  externalApiType = '',
) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    const columnsMapKeys = Object.keys(columnsMap);
    const columnCount = columnsMapKeys.length;
    return `<tr class="no-record-data-table"><td class="text-center" colspan="${columnCount}">No Records</td></tr>`;
  }
  const projectDetails = await getProjectDetail();
  const { constants: projectConstant, environments } = projectDetails;
  const { constants: collectionConstant } = await getCollectionDetails(collectionName);
  const currentTableRows = items.map((item) => {
    const columns = getTableColumns(
      item,
      columnsMap,
      firstRowElements,
      collectionName,
      isExternalAPI,
      responseDataMapping,
      referenceColmunIndexes,
      projectConstant,
      environments,
      collectionConstant,
      externalApiType,
    );
    const orgTrElement = firstRowElements.tagName === 'TR' ? firstRowElements : '';
    let orgTrElementTagId = '';
    if (orgTrElement) {
      const sourceElement = orgTrElement.cloneNode(true);
      orgTrElementTagId = elementAttribute(orgTrElement, 'id');
      applyUserDefinedStyles(sourceElement, orgTrElement, dataTableStylesMap);
    }

    return `<tr ${setIdAttribute(orgTrElementTagId)}>${columns}</tr>`;
  });
  return (await Promise.all(currentTableRows)).join('');
};

const selectorExists = (selector) => {
  let selectors = getAllSelectors();
  for (let i = 0; i < selectors.length; i++) {
    if (selectors[i] == selector) return true;
  }
  return false;
};

const addStyle = (styles) => {
  /* Create style document */
  let css = document.createElement('style');

  if (css.styleSheet) {
    css.styleSheet.cssText = styles;
  } else {
    css.appendChild(document.createTextNode(styles));
  }
  /* Append style to the tag name */
  document.getElementsByTagName('head')[0].appendChild(css);
};

const getTableColumns = (
  item,
  columnsMap,
  firstRowElements,
  collectionName = '',
  isExternalAPI = false,
  responseDataMapping = '',
  referenceColmunIndexes,
  projectConstant,
  environments,
  collectionConstant,
  externalApiType = '',
) => {
  const column = Object.keys(columnsMap).map((fieldName) => {
    const firstRowColumns = firstRowElements.cells;
    let rowColumn = Object.values(firstRowColumns).find((cell) => {
      return (
        elementAttribute(cell, 'data-selected-column') === fieldName ||
        elementAttribute(cell, 'data-selected-response-map-column') === fieldName
      );
    });
    rowColumn = typeof rowColumn !== 'undefined' ? rowColumn : null;
    const orgTdElement = rowColumn && rowColumn.tagName === 'TD' ? rowColumn : '';
    const orgThElement = rowColumn && rowColumn.tagName === 'TH' ? rowColumn : '';
    let orgTdElementTagId = '';
    let orgThElementTagId = '';
    if (orgTdElement) {
      const sourceElement = orgTdElement.cloneNode(true);
      orgTdElementTagId = elementAttribute(orgTdElement, 'id');
      applyUserDefinedStyles(sourceElement, orgTdElement, dataTableStylesMap);
    } else if (orgThElement) {
      const sourceElement = orgThElement.cloneNode(true);
      orgThElementTagId = elementAttribute(orgThElement, 'id');
      applyUserDefinedStyles(sourceElement, orgThElement, dataTableStylesMap);
    }
    const toolTipElement = rowColumn
      ? rowColumn.querySelectorAll('[data-js="drapcode-icons"], img')
      : [];
    toolTipElement.forEach((elem) => {
      elem.setAttribute('data-item-id', item.uuid);
      elem.setAttribute('data-collection-id', collectionName);
      elem.setAttribute('data-item', JSON.stringify(item));
    });
    const pdfViewerElement = rowColumn
      ? rowColumn.querySelector('[data-pdf-viewer-component]')
      : null;
    const cellComponents = rowColumn ? rowColumn.children : '';
    const colMapField = columnsMap[fieldName];

    if (fieldName.includes('"') && 'functionType' in JSON.parse(fieldName)) {
      const textContent = getDerivedFieldData(
        fieldName,
        item,
        projectConstant,
        environments,
        collectionConstant,
      );
      return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
        textContent,
        cellComponents[0],
      )}</td>`;
    } else if (fieldName.includes('.')) {
      let cellComponent = cellComponents[0];
      if (referenceColmunIndexes && referenceColmunIndexes.length) {
        const index = referenceColmunIndexes.find((ref) => ref.fieldName === fieldName).index;
        const rowColumn = Object.values(firstRowColumns)[index];
        cellComponent = rowColumn ? rowColumn.children[0] : cellComponent;
      }
      return renderReferenceTypeData(item, colMapField, fieldName, cellComponent, isExternalAPI);
    } else if (['static_option', 'dynamic_option'].includes(colMapField)) {
      return `<td ${setIdAttribute(orgTdElementTagId)}>${renderStaticAndDynamicData(
        item,
        colMapField,
        fieldName,
        cellComponents[0],
      )}</td>`;
    } else if (colMapField === 'boolean') {
      if (fieldName in item) {
        let textContent = '';
        switch (externalApiType) {
          case DATA_SOURCE_MYSQL:
            textContent = item[fieldName].data[0] ? 'Yes' : 'No';
            break;
          default:
            textContent = item[fieldName] ? 'Yes' : 'No';
            break;
        }
        return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
          textContent,
          cellComponents[0],
        )}</td>`;
      } else {
        return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
          null,
          cellComponents[0],
        )}</td>`;
      }
    } else if (colMapField === 'image' || colMapField === 'file') {
      if (pdfViewerElement) {
        return renderPdfViewerInDataTable(
          item,
          fieldName,
          cellComponents[0],
          isExternalAPI,
          externalApiType,
        );
      } else {
        return renderFileColumnData(item, fieldName, cellComponents[0]);
      }
    } else if (colMapField === 'multi_image' || colMapField === 'multi_file') {
      if (pdfViewerElement) {
        return renderPdfViewerInDataTable(
          item,
          fieldName,
          cellComponents[0],
          isExternalAPI,
          externalApiType,
        );
      } else {
        return renderMultiFileColumnData(item, fieldName, cellComponents[0]);
      }
    } else if (['updatedAt', 'createdAt'].includes(colMapField)) {
      return renderTimestampColumnData(item, fieldName, cellComponents[0], true);
    } else if (['date', 'time_slot'].includes(colMapField)) {
      return renderTimestampColumnData(item, fieldName, cellComponents[0]);
    } else if (typeof colMapField === 'object') {
      let cellComponent = cellComponents[0];
      const isBadge = cellComponent ? cellComponent.attributes['data-gjs'] : false;
      if (isBadge) {
        const badgesList = getColorBadges(cellComponent, fieldName, item);
        return `<td ${setIdAttribute(orgTdElementTagId)}>${badgesList}</td>`;
      } else {
        const column = renderReferenceTypeData(item, colMapField, fieldName, cellComponents[0]);
        return column;
      }
    } else if (colMapField === 'action') {
      return `<td ${setIdAttribute(orgTdElementTagId)}>${renderActionColumnData(
        item,
        fieldName,
        cellComponents,
        collectionName,
        isExternalAPI,
        responseDataMapping,
      )}</td>`;
    } else if (colMapField === 'large_text') {
      return renderTableLargeTextColumn(item, fieldName, cellComponents[0], orgTdElementTagId);
    } else if (colMapField === 'action_select_checkbox_all') {
      return `<td ${setIdAttribute(orgTdElementTagId)}>${renderCheckboxColumnData(
        item,
        fieldName,
        cellComponents,
        collectionName,
      )}</td>`;
    } else if (colMapField === 'url') {
      return renderUrlColumnData(item, fieldName, cellComponents[0]);
    } else {
      return renderTableBodyColumn(
        item,
        fieldName,
        cellComponents[0],
        orgTdElementTagId,
        colMapField,
      );
    }
  });

  let updatedColumn = [];
  if (column) {
    column.map((col) => {
      let domParser = new DOMParser();
      let colElem = domParser.parseFromString(col, 'text/html');
      let colElemHtml = colElem.body;
      let visibilityElements = colElemHtml.querySelectorAll('[data-vis-condition]');

      if (visibilityElements && visibilityElements.length) {
        console.log('🚀 ~ file: dataLoader.js:3686 ~ Processing Component Visibility...');
        let compVisibilityDataJson = {
          itemData: { ...item },
        };
        visibilityElements.forEach((visibilityElem) => {
          let clonedVisibilityElem = visibilityElem.cloneNode(true);
          processComponentVisibilityCondition(clonedVisibilityElem, compVisibilityDataJson);
          let isRemoved = clonedVisibilityElem.hasAttribute('data-vis-removed');
          clonedVisibilityElem.removeAttribute('data-vis-condition');
          col = col.replace(
            visibilityElem.outerHTML,
            isRemoved ? '' : clonedVisibilityElem.outerHTML,
          );
        });
      }
      updatedColumn.push(col);
    });
  }

  return updatedColumn ? updatedColumn.join('') : '';
};

const setIdAttribute = (elementTagId) => {
  if (elementTagId) {
    return `id=${elementTagId}-${uuidv4()}`;
  } else {
    return '';
  }
};

const setColumnDataIntoHtmlElement = (textContent, tableColumnContentTag, isHtml = false) => {
  if (tableColumnContentTag) {
    setAttributeInColumnData(tableColumnContentTag);
    if (isHtml) {
      tableColumnContentTag.innerHTML = textContent ? textContent : '';
    } else {
      tableColumnContentTag.textContent = textContent ? textContent : '';
    }
    return tableColumnContentTag.outerHTML;
  } else {
    let value = textContent;
    if (!value && value !== 0) {
      value = '';
    }
    return value;
  }
};

const renderFileColumnData = (item, column, tableColumnContentTag) => {
  let itemImageData = column ? item[column] : '';
  itemImageData = parseMySqlBlobData(itemImageData);

  const previewIcon = tableColumnContentTag
    ? elementAttribute(tableColumnContentTag, 'data-preview-icon')
    : '';
  let imageUrl = '';
  let fileName = '';
  let data = '';
  if (!itemImageData) {
    return `<td></td>`;
  }
  if (itemImageData && typeof itemImageData === 'object' && !Array.isArray(itemImageData)) {
    if (typeof itemImageData === 'object') {
      const imageKey = itemImageData.key;
      imageUrl = previewIcon
        ? itemImageData[previewIcon]
        : itemImageData.isExternalUrl
          ? itemImageData.url
          : itemImageData.isPrivate === true
            ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
            : imageKey
              ? imageServerUrl() + imageKey
              : imageUrl;
      fileName = itemImageData.originalName;
    } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
      imageUrl = itemImageData;
      fileName = itemImageData;
    }
    const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
    if (innerTag && innerTag === 'IMG') {
      const newImgTag = tableColumnContentTag.cloneNode(true);
      newImgTag.src = imageUrl ? imageUrl : newImgTag.src;
      if (itemImageData.isPrivate === true) {
        addDownloadAttributeForPrivateFiles(newImgTag, itemImageData, item.uuid);
      }
      data = [newImgTag.outerHTML];
    } else {
      const anchorLink = document.createElement('a');
      if (itemImageData.isPrivate === true) {
        addDownloadAttributeForPrivateFiles(anchorLink, itemImageData, item.uuid);
      } else {
        anchorLink.href = imageUrl ? imageUrl : imageUrl;
      }
      anchorLink.innerText = fileName ? fileName : imageUrl;
      if (tableColumnContentTag) {
        const innerChildImgElem = tableColumnContentTag.querySelector('IMG');
        const innerChildIconElem = tableColumnContentTag.querySelector('[data-js=drapcode-icons]');
        if (itemImageData.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(tableColumnContentTag, itemImageData, item.uuid);
        } else {
          tableColumnContentTag.href = anchorLink.href;
        }
        tableColumnContentTag.innerText = anchorLink.innerText;
        tableColumnContentTag.title = fileName;
        if (innerChildImgElem) {
          const newImgTag = innerChildImgElem.cloneNode(true);
          imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
          newImgTag.alt = fileName;
          tableColumnContentTag.innerHTML = newImgTag.outerHTML;
        }
        if (innerChildIconElem) {
          const newIconTag = innerChildIconElem.cloneNode(true);
          newIconTag.title = fileName;
          tableColumnContentTag.innerHTML = newIconTag.outerHTML;
        }
        data = [tableColumnContentTag.outerHTML];
      } else {
        data = [anchorLink.outerHTML];
      }
    }
  } else if (itemImageData && Array.isArray(itemImageData)) {
    data = itemImageData.map((record) => {
      const imageKey = record.key;
      const imageUrl = previewIcon
        ? record[previewIcon]
        : record.isExternalUrl
          ? record.url
          : record.isPrivate === true
            ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
            : imageKey
              ? imageServerUrl() + imageKey
              : '';

      const fileName = record && record.originalName ? record.originalName : '';
      const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
      if (innerTag && innerTag === 'IMG') {
        const newImgTag = tableColumnContentTag.cloneNode(true);
        imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
        if (record.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(newImgTag, record, item.uuid);
        }
        return newImgTag.outerHTML;
      } else {
        const anchorLink = document.createElement('a');
        if (record.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(anchorLink, record, item.uuid);
        } else {
          anchorLink.href = imageUrl;
        }
        anchorLink.innerText = fileName ? fileName : imageUrl;
        if (tableColumnContentTag) {
          const innerChildImgElem = tableColumnContentTag.querySelector('IMG');
          const innerChildIconElem = tableColumnContentTag.querySelector(
            '[data-js=drapcode-icons]',
          );
          if (record.isPrivate === true) {
            addDownloadAttributeForPrivateFiles(tableColumnContentTag, record, item.uuid);
          } else {
            tableColumnContentTag.href = anchorLink.href;
          }
          tableColumnContentTag.innerText = anchorLink.innerText;
          tableColumnContentTag.title = fileName;
          if (innerChildImgElem) {
            const newImgTag = innerChildImgElem.cloneNode(true);
            imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
            newImgTag.alt = fileName;
            tableColumnContentTag.innerHTML = newImgTag.outerHTML;
          }
          if (innerChildIconElem) {
            const newIconTag = innerChildIconElem.cloneNode(true);
            newIconTag.title = fileName;
            tableColumnContentTag.innerHTML = newIconTag.outerHTML;
          }
          return tableColumnContentTag.outerHTML;
        } else {
          return anchorLink.outerHTML;
        }
      }
    });
  }
  return `<td>${data ? data.join(' ') : ''} </td>`;
};

const renderMultiFileColumnData = (item, column, tableColumnContentTag) => {
  let data = '';
  const previewIcon = tableColumnContentTag
    ? elementAttribute(tableColumnContentTag, 'data-preview-icon')
    : '';
  if (item[column] && Array.isArray(item[column])) {
    data = item[column].map((record) => {
      const imageUrl =
        record && previewIcon
          ? record[previewIcon]
          : record && record.isPrivate === true
            ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
            : record && record.key
              ? imageServerUrl() + record.key
              : '';
      const fileName = record && record.originalName ? record.originalName : '';
      const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
      if (innerTag && innerTag === 'IMG') {
        const newImgTag = tableColumnContentTag.cloneNode(true);
        imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
        if (record.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(newImgTag, record, item.uuid);
        }
        return newImgTag.outerHTML;
      } else {
        const anchorLink = document.createElement('a');
        if (record.isPrivate === true) {
          addDownloadAttributeForPrivateFiles(anchorLink, record, item.uuid);
        } else {
          anchorLink.href = imageUrl;
        }
        anchorLink.innerText = fileName ? fileName : imageUrl;
        if (tableColumnContentTag) {
          tableColumnContentTag.innerHTML = anchorLink.outerHTML;
          return tableColumnContentTag.outerHTML;
        } else {
          return anchorLink.outerHTML;
        }
      }
    });
  }
  return `<td>${data ? data.join(' ') : ''} </td>`;
};

const renderTimestampColumnData = (item, column, tableColumnContentTag, offset) => {
  // Removed for Project date time format
  let textContent = item[column] ? convertTimeStampToDate(item[column], offset) : '';
  return `<td>${setColumnDataIntoHtmlElement(textContent, tableColumnContentTag)}</td>`;
};

const createFileAnchorTag = (record, tableColumnContentTag, item) => {
  const imageUrl = record && record.key ? imageServerUrl() + record.key : '';
  const fileName = record && record.originalName ? record.originalName : '';
  const isPrivate = record.isPrivate;
  const anchorLink = document.createElement('a');
  if (isPrivate === true) {
    addDownloadAttributeForPrivateFiles(anchorLink, record, item.uuid);
  } else {
    anchorLink.href = imageUrl;
  }
  anchorLink.innerText = fileName ? fileName : imageUrl;
  if (tableColumnContentTag) {
    tableColumnContentTag.innerHTML = anchorLink.outerHTML;
    return tableColumnContentTag.outerHTML;
  } else {
    return anchorLink.outerHTML;
  }
};

const renderReferenceTypeFileData = (itemImageData, tableColumnContentTag, item) => {
  let data = '';
  const previewIcon = elementAttribute(tableColumnContentTag, 'data-preview-icon');
  if (!itemImageData) {
    return '<td></td>';
  } else if (!Array.isArray(itemImageData)) {
    let imageUrl = '';
    let fileName = '';
    if (typeof itemImageData === 'object') {
      const imageKey = itemImageData.key;
      imageUrl = previewIcon
        ? itemImageData[previewIcon]
        : itemImageData.isExternalUrl
          ? itemImageData.url
          : itemImageData.isPrivate === true
            ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
            : imageKey
              ? imageServerUrl() + imageKey
              : '';
      fileName = itemImageData.originalName;
    } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
      imageUrl = itemImageData;
      fileName = itemImageData;
    } else {
      return '<td></td>';
    }
    const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
    if (innerTag && innerTag === 'IMG') {
      const newImgTag = tableColumnContentTag.cloneNode(true);
      newImgTag.src = imageUrl ? imageUrl : newImgTag.src;
      if (itemImageData.isPrivate === true) {
        addDownloadAttributeForPrivateFiles(newImgTag, itemImageData, item.uuid);
      }
      data = [newImgTag.outerHTML];
    } else {
      const anchorLink = document.createElement('a');
      if (itemImageData.isPrivate === true) {
        addDownloadAttributeForPrivateFiles(anchorLink, itemImageData, item.uuid);
      } else {
        anchorLink.href = imageUrl ? imageUrl : imageUrl;
      }
      anchorLink.innerText = fileName ? fileName : imageUrl;
      if (tableColumnContentTag) {
        tableColumnContentTag.innerHTML = anchorLink.outerHTML;
        data = [tableColumnContentTag.outerHTML];
      } else {
        data = [anchorLink.outerHTML];
      }
    }
    console.log('Data \n', data);
    return `<td>${data}</td>`;
  }
  data = itemImageData.map((record) => {
    if (record && Array.isArray(record)) {
      let arrayData = record.map((e) => createFileAnchorTag(e, tableColumnContentTag, item));
      return arrayData.join(' ');
    }
    return createFileAnchorTag(record, tableColumnContentTag, item);
  });
  return `<td>${data ? data.join(' ') : ''} </td>`;
};

const renderReferenceTypeData = (
  item,
  columnsMap,
  columnName,
  tableColumnContentTag,
  isExternalAPI = false,
) => {
  let { nestedFieldName, fieldType, hasBelongsToParentData } = columnsMap.metaData || {};
  if (!nestedFieldName) {
    let belongsToMetaData = item['_$belongsToMetaData'];
    let { collectionField } = belongsToMetaData ? belongsToMetaData.refCollection : {};
    nestedFieldName = collectionField ? collectionField : undefined;
    if (columnsMap.type === 'createdBy') {
      nestedFieldName = 'userName';
    }
  }
  if (!columnName.includes('.') && !hasBelongsToParentData) {
    columnName = columnName + '.' + nestedFieldName;
  }

  if (hasBelongsToParentData && columnsMap.metaData) {
    item = columnsMap.metaData;
    if (columnName.includes('.')) {
      const columnNameArr = columnName.split('.');
      const columnNameArrSplice = columnNameArr.splice(1);
      columnName = columnNameArrSplice.join('.');
    }
  }

  // Handling for External API response mapping
  let columnData = isExternalAPI ? _.get(item, columnName) : parseValueFromData(item, columnName);

  if (columnData && (fieldType === 'file' || fieldType === 'image')) {
    return renderReferenceTypeFileData(columnData, tableColumnContentTag, item);
  }
  if (fieldType === 'boolean')
    columnData = columnData && typeof columnData === 'boolean' ? 'Yes' : 'No';
  if (columnData) {
    const isHtml = containsHTML(columnData);
    if (isHtml) {
      return `<td>${setColumnDataIntoHtmlElement(columnData, tableColumnContentTag, true)}</td>`;
    }
    return `<td>${setColumnDataIntoHtmlElement(columnData, tableColumnContentTag)}</td>`;
  } else {
    return '<td></td>';
  }
};

const renderStaticAndDynamicData = (item, columnsMap, columnName, tableColumnContentTag) => {
  const columnData = parseValueFromData(item, columnName);
  const isBadge = tableColumnContentTag ? tableColumnContentTag.attributes['data-gjs'] : false;
  if (isBadge) {
    return getColorBadges(tableColumnContentTag, columnName, item);
  } else {
    return setColumnDataIntoHtmlElement(columnData, tableColumnContentTag);
  }
};

const renderLinkColumnData = (
  item,
  children,
  collectionName = '',
  isExternalAPI = false,
  responseDataMapping = '',
) => {
  const actionButtonLink = children.cloneNode(true);
  const elementOrgId = elementAttribute(children, 'id');
  if (elementOrgId) {
    const newElementId = item['uuid'] ? `${elementOrgId}-${item['uuid']}` : `${elementOrgId}-item`;
    actionButtonLink.setAttribute('id', newElementId);
    applyUserDefinedStyles(children, actionButtonLink, dataTableStylesMap);
  }
  if (item['uuid']) {
    actionButtonLink.setAttribute('data-item-id', replaceSlashWithUnderscore(item['uuid']));
  }
  actionButtonLink.setAttribute('data-collection-item', JSON.stringify(item));
  actionButtonLink.setAttribute('data-collection-id', collectionName);

  const snipCartElem = window.document.getElementById('snipcart');
  const isSnipCartActive = typeof snipCartElem != 'undefined' && snipCartElem != null;
  if (isSnipCartActive && actionButtonLink.classList.contains('snipcart-add-item')) {
    loadSnipcartItemData(actionButtonLink, item);
  }

  const fieldName =
    isExternalAPI && responseDataMapping
      ? responseDataMapping['_data_source_rest_api_primary_id'].trim()
      : elementAttribute(actionButtonLink, 'data-path-field-name');

  const seoName = elementAttribute(actionButtonLink, 'data-path-field-seo');
  if (fieldName) {
    if (isExternalAPI) {
      actionButtonLink.setAttribute(
        'data-item-id',
        replaceSlashWithUnderscore(_.get(item, fieldName)),
      );
    }
    const actionElemTagName = actionButtonLink.tagName;
    const isAnchorTag = actionElemTagName === 'A';
    if (isAnchorTag) {
      const href = elementAttribute(actionButtonLink, 'href');
      let fieldHref = fieldName ? parseValueFromData(item, fieldName) : '';

      if (isExternalAPI) {
        fieldHref = fieldHref && typeof fieldHref === 'number' ? fieldHref.toString() : fieldHref;
        fieldHref =
          fieldHref && typeof fieldHref === 'string'
            ? replaceSlashWithUnderscore(fieldHref)
            : fieldHref;
      } else {
        //TODO: this code and break need to find some better solution for [0]
        fieldHref = fieldHref && fieldHref.length ? fieldHref.split(', ') : '';
        fieldHref = fieldHref && fieldHref.length ? fieldHref[0] : '';
      }

      let replaceHref = href.replace(fieldName, fieldHref);
      if (isExternalAPI && fieldName && href.endsWith('uuid')) {
        replaceHref = href.replace('uuid', fieldHref);
      } else {
        replaceHref = href.replace(fieldName, fieldHref);
      }
      /**
       * Changes to replace seo
       */
      if (seoName) {
        let seoHref = seoName ? parseValueFromData(item, seoName) : '';
        seoHref = slugify(seoHref);
        replaceHref = replaceHref.replace(seoName, seoHref);
      }
      actionButtonLink.setAttribute('href', replaceHref);
    }
  }
  return actionButtonLink;
};

const renderNestedActionColumnData = (
  item,
  actionButton,
  collectionName = '',
  isExternalAPI = false,
  responseDataMapping = '',
) => {
  let nestedActionButtonLink = '';
  const linkElem = actionButton ? actionButton.querySelector('[data-gjs="data-table-link"]') : '';
  const buttonElem = actionButton ? actionButton.querySelector('button') : '';
  const linkBoxElem = actionButton ? actionButton.querySelector('a.link-box') : '';

  if (linkElem) {
    nestedActionButtonLink = linkElem;
  } else if (buttonElem) {
    nestedActionButtonLink = buttonElem;
  } else if (linkBoxElem) {
    nestedActionButtonLink = linkBoxElem;
  }

  if (nestedActionButtonLink) {
    if (item['uuid']) {
      nestedActionButtonLink.setAttribute('data-item-id', item['uuid']);
    }
    nestedActionButtonLink.setAttribute('data-collection-item', JSON.stringify(item));
    nestedActionButtonLink.setAttribute('data-collection-id', collectionName);

    const snipCartElem = window.document.getElementById('snipcart');
    const isSnipCartActive = typeof snipCartElem != 'undefined' && snipCartElem != null;
    if (isSnipCartActive && nestedActionButtonLink.classList.contains('snipcart-add-item')) {
      loadSnipcartItemData(nestedActionButtonLink, item);
    }

    const fieldName =
      isExternalAPI && responseDataMapping
        ? responseDataMapping['_data_source_rest_api_primary_id'].trim()
        : elementAttribute(nestedActionButtonLink, 'data-path-field-name');

    const seoName = elementAttribute(nestedActionButtonLink, 'data-path-field-seo');

    if (fieldName) {
      if (isExternalAPI) {
        nestedActionButtonLink.setAttribute('data-item-id', _.get(item, fieldName));
      }
      let href = elementAttribute(nestedActionButtonLink, 'href');
      let fieldHref = fieldName ? parseValueFromData(item, fieldName) : '';
      if (isExternalAPI) {
        fieldHref = fieldHref && typeof fieldHref === 'number' ? fieldHref.toString() : fieldHref;
      } else {
        //TODO: this code and break need to find some better solution for [0]
        fieldHref = fieldHref && fieldHref.length ? fieldHref.split(', ') : '';
        fieldHref = fieldHref && fieldHref.length ? fieldHref[0] : '';
      }

      let replaceHref = '';
      if (isExternalAPI && fieldName && href.endsWith('uuid')) {
        replaceHref = href.replace('uuid', fieldHref);
      } else {
        replaceHref = href.replace(fieldName, fieldHref);
      }
      /**
       * Changes to replace seo
       */
      if (seoName) {
        let seoHref = seoName ? parseValueFromData(item, seoName) : '';
        seoHref = slugify(seoHref);
        replaceHref = replaceHref.replace(seoName, seoHref);
      }
      nestedActionButtonLink.setAttribute('href', replaceHref);
    }
  }
};

const renderCheckboxColumnData = (item, children, cellComponents, collectionName = '') => {
  const newElementId = 'action-select-item-' + item['uuid'];
  const checkboxElem = `<div data-gjs="checkbox-item">
  <input
    type="checkbox"
    value=""
    data-gjs="dt-item-check"
    id=${newElementId}
    data-item-id=${item['uuid']}
    data-collection-id=${collectionName}
    />
  <label class="form-check-label" for=${newElementId}></label>
</div>`;
  return checkboxElem;
};

const renderActionColumnData = (
  item,
  column,
  innerActionChildren,
  collectionName = '',
  isExternalAPI = false,
  responseDataMapping = '',
) => {
  const tdElement = document.createElement('div');
  Object.values(innerActionChildren).map((children) => {
    // data-path-collection-item-id-from to check
    // if href have to be creted using data table item or page/session item
    if (
      !['pageCollection', 'session'].includes(
        children.getAttribute('data-path-collection-item-id-from'),
      )
    ) {
      const dataUrlField = 'data-url-field';
      let actionButtonLink = '';
      if (children.getAttribute(dataUrlField)) {
        const newActionButtonLink = children.cloneNode(true);
        replaceCollectionFieldLink(newActionButtonLink, item);
        actionButtonLink = newActionButtonLink;
      } else {
        actionButtonLink = renderLinkColumnData(
          item,
          children,
          collectionName,
          isExternalAPI,
          responseDataMapping,
        );
        renderNestedActionColumnData(
          item,
          actionButtonLink,
          collectionName,
          isExternalAPI,
          responseDataMapping,
        );
      }
      tdElement.appendChild(actionButtonLink);
    } else {
      tdElement.appendChild(children.cloneNode(true));
    }
  });
  return tdElement.innerHTML;
};

const renderTableLargeTextColumn = (item, column, tableColumnContentTag, orgTdElementTagId) => {
  let isHtml = item[column] ? htmlRegex.test(item[column]) : false;
  let textContent = item[column] ? item[column] : '';
  return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
    textContent,
    tableColumnContentTag,
    isHtml,
  )}</td>`;
};

const renderTableBodyColumn = (
  item,
  column,
  tableColumnContentTag,
  orgTdElementTagId,
  fieldType,
) => {
  const tagName = tableColumnContentTag?.tagName;
  // data-path-collection-item-id-from to check
  // if href have to be creted using data table item or page/session item
  if (
    tagName &&
    tagName === 'A' &&
    !['pageCollection', 'session'].includes(
      element.getAttribute('data-path-collection-item-id-from'),
    )
  ) {
    tableColumnContentTag = renderLinkColumnData(item, tableColumnContentTag);
  }
  let textContent = item[column] ? item[column] : '';
  if (fieldType === 'number' && !textContent) {
    textContent = '0';
  }
  return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
    textContent,
    tableColumnContentTag,
  )}</td>`;
};

const setAttributeInColumnData = (tableColumnContentTag) => {
  const sourceElement = tableColumnContentTag.cloneNode(true);
  let orgTableColumnContentTagId = elementAttribute(tableColumnContentTag, 'id');
  orgTableColumnContentTagId = orgTableColumnContentTagId ? orgTableColumnContentTagId : uuidv4();
  applyUserDefinedStyles(sourceElement, tableColumnContentTag, dataTableStylesMap);
  if (tableColumnContentTag.hasAttribute('data-org-id')) {
    tableColumnContentTag.setAttribute(
      'id',
      elementAttribute(tableColumnContentTag, 'data-org-id') + '-' + uuidv4(),
    );
  } else {
    tableColumnContentTag.setAttribute('id', orgTableColumnContentTagId + '-' + uuidv4());
    tableColumnContentTag.setAttribute('data-org-id', orgTableColumnContentTagId);
  }
  return tableColumnContentTag;
};

const getPaginatedData = (data, currentPage, itemsPerPage) => {
  currentPage = parseInt(currentPage);
  itemsPerPage = parseInt(itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
};

const loadDataTable = async (
  finderId,
  collectionName,
  paginationData,
  isTypesenseCollection = false,
) => {
  const { dataTable, fieldName, externalQueryParamKeys } = paginationData;
  const { pageSizeSessionKey, paginationPageSizeComponent } = getPageSizeForDataComponent(
    paginationData,
    collectionName,
  );
  const hasHideWhenEmpty = dataTable.hasAttribute('hidewhenempty');
  const theadElement = dataTable.querySelector('thead');
  const columnCount = theadElement.rows[0].cells.length;
  const tbodyElement = dataTable.querySelector('[data-js=table-body]');
  if (validateDataTableProps(finderId, collectionName, fieldName, columnCount, tbodyElement)) {
    let totalCount = 0;
    let isPrivateFilter = false;
    const { itemData } = await getItemDataForElement(dataTable);
    if (finderId) {
      let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count`;
      const dateRangeQueryParams = getDataRangeQuery(paginationData, 'dataTable');
      if (dateRangeQueryParams) countItemsEndpoint += '?' + dateRangeQueryParams;
      countItemsEndpoint = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        countItemsEndpoint,
        itemData,
        dataTable,
      );

      /**
       * This is to get search query from URL and append it to endpoint
       */
      let searchQuery = await searchQueryStringFromUrl();
      if (typeof searchString !== 'undefined' && searchString) {
        if (searchQuery) {
          if (searchQuery.startsWith('?') && !countItemsEndpoint.endsWith('/')) {
            searchQuery = searchQuery.replace('?', '&');
          }
          countItemsEndpoint = countItemsEndpoint + '&' + searchString + searchQuery;
        } else {
          countItemsEndpoint = countItemsEndpoint + '&' + searchString;
        }
      } else {
        if (searchQuery) {
          if (searchQuery.startsWith('?') && !countItemsEndpoint.endsWith('/')) {
            searchQuery = searchQuery.replace('?', '&');
          }
          countItemsEndpoint = countItemsEndpoint + searchQuery;
        }
      }
      countItemsEndpoint = await addEntityQueryToUrl(countItemsEndpoint, collectionName, finderId);
      const totalCountResponse = await securedGetCall(countItemsEndpoint);
      totalCount = totalCountResponse.data;
      paginationData.numberOfPages = getNumberOfPages(totalCount, paginationData.numberPerPage);
      isPrivateFilter = totalCountResponse ? totalCountResponse._$isPrivateFilter : null;
    } else if (fieldName) {
      let itemIds = parseValueFromData(itemData, fieldName);
      itemIds = Array.isArray(itemIds) ? itemIds : Object.keys(itemIds).length > 0 ? [itemIds] : [];
      totalCount = itemIds.length;
      paginationData.numberOfPages = getNumberOfPages(totalCount, paginationData.numberPerPage);
      paginationData.filteredItemsUrl = `collection-table/${collectionName}/itemList`;
      paginationData.itemIds = itemIds;
    }
    paginationData.tbodyElement = tbodyElement;
    await setTableMetaData(paginationData, itemData, fieldName);
    numberPaginationNav(paginationData);
    dateRangePaginationNav(paginationData);
    processPaginationPersist(paginationData);
    paginationData.finderId = finderId;
    if (isTypesenseCollection)
      paginationData.filteredItemsUrl = `typesense-search/get-all-indexed-data/${collectionName}/${finderId}`;
    // Page Size Selector
    handlePaginationPageSize(
      { ...paginationData, totalCount, pageSizeSessionKey },
      paginationPageSizeComponent,
    );
    if (hasHideWhenEmpty && totalCount === 0) {
      console.log('🚀 ~ Removing data table:', dataTable);
      dataTable.remove();
    } else {
      if (totalCount > 0) {
        let searchQuery = await searchQueryStringFromUrl();
        if (searchQuery) {
          searchInDataTable(paginationData, searchQuery);
        } else {
          loadDataList(paginationData, true);
        }
      } else {
        if (isPrivateFilter) {
          tbodyElement.innerHTML = `<tr><td class="text-center" colspan="${columnCount}">This data is private hence cannot be displayed</td></tr>`;
          // processLogoutUser('/');
          validatePaginationButton(1, 1, dataTable);
          return;
        }
        tbodyElement.innerHTML = `<tr class="no-record-data-table"><td class="text-center" colspan="${columnCount}"></td></tr>`;
        validatePaginationButton(1, 1, dataTable);
      }
      addDataTableDataToMap(paginationData, paginationData.dataTable);
    }
  } else {
    validatePaginationButton(1, 1, dataTable);
    numberPaginationNav(paginationData);
    dateRangePaginationNav(paginationData);
  }
};

const getPageSizeForDataComponent = (paginationData, collectionName) => {
  const { dataTable, numberPerPage } = paginationData;
  // Getting Page size value from session
  let pageSizeSessionKey = '';
  let paginationPageSizeComponent = '';
  pageSizeSessionKey = `ps__${collectionName}_${dataTable.id}`;
  paginationPageSizeComponent = elementSelector(dataTable, '.paginationPageSize');
  if (paginationPageSizeComponent) {
    const pageSize = localStorage.getItem(pageSizeSessionKey);
    paginationData.numberPerPage = pageSize ? parseInt(pageSize) : numberPerPage;
  }
  return { pageSizeSessionKey, paginationPageSizeComponent };
};

const handlePaginationPageSize = (paginationData, paginationPageSizeComponent) => {
  if (!paginationPageSizeComponent) return '';
  const defaultPageSizeOptions = [5, 10, 20, 30, 40, 50, 100];

  let pageSizeOptions = paginationPageSizeComponent.getAttribute('page-size-options');
  if (pageSizeOptions) {
    pageSizeOptions = pageSizeOptions.split(',').map((pageSize) => {
      const value = parseInt(pageSize.trim());
      if (!isNaN(value)) return value;
    });
  } else pageSizeOptions = defaultPageSizeOptions;

  const { numberPerPage, totalCount, pageSizeSessionKey } = paginationData;
  const paginationPageSelect = elementSelector(paginationPageSizeComponent, 'select');
  initializeSelect2(paginationPageSelect);
  const pageSelect = $(paginationPageSelect);
  pageSelect.empty();
  // Adding an temp options if default is not from existing options
  if (!pageSizeOptions.includes(numberPerPage)) pageSizeOptions.push(parseInt(numberPerPage));

  // Sort the page size list
  pageSizeOptions.sort((a, b) => a - b);
  pageSizeOptions.forEach((opt) => {
    const newOption = new Option(`${opt}`, opt, false, false);
    pageSelect.append(newOption);
  });
  // Set Default value to select component
  pageSelect.val(numberPerPage).trigger('change');
  // Add Event
  pageSelect.on('select2:select', function (event) {
    event.preventDefault();
    const newPageSize = parseInt(this.value);
    // Set new page size to localStorage
    localStorage.setItem(pageSizeSessionKey, newPageSize);
    paginationData.numberPerPage = newPageSize;
    paginationData.numberOfPages = getNumberOfPages(totalCount, newPageSize);
    // Handle Pagination Number component on change of page size
    numberPaginationNav(paginationData, false);
    dateRangePaginationNav(paginationData);
    // Render Data Table with new page size
    loadDataComponent(paginationData, true);
  });
};

const getItemDataForElement = async (element) => {
  // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
  new Promise(function (resolve, reject) {
    resolve(element);
  });
  const modalParent = findModalParent(element);
  let itemData = '';
  let collectionName = '';
  if (modalParent) {
    let elementCollectionId = modalParent ? modalParent.getAttribute('data-collection-id') : '';
    let elementItemId = modalParent ? modalParent.getAttribute('data-item-id') : '';
    elementItemId = replaceSlashWithUnderscore(elementItemId);
    const isModalItem = [null, undefined, 'null', 'undefined'].some((val) =>
      [elementCollectionId, elementItemId].includes(val),
    );
    if (!isModalItem) {
      const collectionItemData = { collectionId: elementCollectionId, itemId: elementItemId };
      const { itemData: modalItem } = await getModalItemData(collectionItemData);
      itemData = modalItem;
    }
    collectionName = elementCollectionId;
  } else {
    const { itemData: pageItem, collectionId } = await getPageItemData();
    itemData = pageItem;
    collectionName = collectionId;
  }
  return { itemData, collectionId: collectionName };
};

const findModalParent = (element) => {
  let parent = element.parentElement;
  while (parent) {
    if (
      (parent.id && parent.id.startsWith('modal-container')) ||
      parent.hasAttribute('data-subpage-id')
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null; // Return null if no matching parent is found
};

const loadDataTableFromExternalAPI = async (paginationData) => {
  const { externalApiId, dataTable } = paginationData;
  paginationData.loadFromExternalAPI = true;
  let response = {};
  try {
    if (externalApiId) {
      const theadElement = dataTable.querySelector('thead');
      const columnCount = theadElement.rows[0].cells.length;
      const tbodyElement = dataTable.querySelector('[data-js=table-body]');
      paginationData.tbodyElement = tbodyElement;
      await setTableMetaData(paginationData);
      processExternalApiDataTablePaginationPersist(paginationData);

      /**
       * Uncomment below to add URL query search support
       * Issue: when the query search key doesn't exist in the API source
       * the API responds with an error
       */
      // let searchQuery = await searchQueryStringFromUrl();
      // if (searchQuery) {
      //   searchInDataTable(paginationData, searchQuery, true);
      // } else {
      //   await loadExternalApiResponseDataList(paginationData, response, false);
      // }
      await loadExternalApiResponseDataList(paginationData, response, false);
    }
  } catch (error) {
    if (error.response) {
      const { data } = error.response;
      const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
      toastr.error(errorMsg, 'Error');
      response.data = error.response;
      response.data.externalApiResponse = error.response;
      response.externalApiResponse = error.response;
      response.status = 'error';
    }
  }
  return response;
};

const loadExternalApiResponseDataList = async (
  paginationData,
  response,
  isPaginate = false,
  isExport = false,
) => {
  const { externalApiId, dataTable, searchString, tbodyElement } = paginationData;
  let data = {};
  let result = {};
  let externalAPIResult = {};
  let externalAPIData = {};
  let externalApiEndpoint = 'external-api';
  let paginationDataSource = DATA_SOURCE_DEFAULT;
  tbodyElement.innerHTML = '';
  try {
    if (externalApiId) {
      externalAPIResult = await publicGetCall(`${externalApiEndpoint}/id/${externalApiId}`);
      console.log(
        '%c==> DataTable from External API externalAPIResult :>> ',
        'color:yellow',
        externalAPIResult,
      );
      if (externalAPIResult && externalAPIResult.status === 200) {
        externalAPIData = externalAPIResult.data;
      }
    }
  } catch (error) {
    console.log('%c==> DataTable from External API error :>> ', 'color:red', error);
    if (error.response) {
      const { data } = error.response;
      const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
      toastr.error(errorMsg, 'Error');
      response.data = error.response;
      response.data.externalApiResponse = error.response;
      response.status = 'error';
    }
  }

  let { bodyDataFrom, uniqueKey, sendFormData, externalApiType } = externalAPIData || {};
  bodyDataFrom = bodyDataFrom ?? 'noDynamicData';
  uniqueKey = uniqueKey ?? 'id';
  sendFormData = !!sendFormData;

  const parentTableElement = tbodyElement.closest('table');
  console.log('🚀 ~ loadExternalApiResponseDataList ~ parentTableElement:', parentTableElement);
  parentTableElement.setAttribute('data-external-api-id', externalApiId);
  parentTableElement.setAttribute('data-external-api-type', externalApiType);

  if (!isExport) {
    //Handling DataTable Placeholder
    addTablePlaceholder(
      paginationData.numberPerPage || 1,
      paginationData.firstRowElements,
      tbodyElement,
    );
  }

  console.log('*** is paginated:', isPaginate);
  if (!isPaginate) {
    paginationData.numberPerPage = Number(paginationData.numberPerPage);
    const paginateElem = elementSelector(dataTable, '.pagination');
    const paginateNumberElem = elementSelector(dataTable, '.pagination-number');
    paginationData['paginationElem'] = paginateNumberElem ? paginateNumberElem : paginateElem;
    console.log('*** pagination element:', paginationData['paginationElem']);
    let offsetKeyAttr = '';
    let pageOffsetKeyAttr = '';
    let overrideLimitKeyAttr = '';

    if (paginateNumberElem) {
      offsetKeyAttr = paginateNumberElem.attributes['data-offset-key'];
      pageOffsetKeyAttr = paginateNumberElem.attributes['data-page-offset-key'];
      overrideLimitKeyAttr = paginateNumberElem.attributes['data-limit-key'];
    } else if (paginateElem) {
      offsetKeyAttr = paginateElem.attributes['data-offset-key'];
      pageOffsetKeyAttr = paginateElem.attributes['data-page-offset-key'];
      overrideLimitKeyAttr = paginateElem.attributes['data-limit-key'];
    }

    const paginationElemDataSet = paginationData['paginationElem']
      ? paginationData['paginationElem'].dataset
      : '';
    if (paginationElemDataSet && paginationElemDataSet.hasOwnProperty('datasource')) {
      paginationDataSource = paginationElemDataSet['datasource'];
    }
    console.log('*** pagination data source:', paginationDataSource);

    let offsetKeyAttrValue = offsetKeyAttr ? offsetKeyAttr.value : '';
    let pageOffsetKeyAttrValue = pageOffsetKeyAttr ? pageOffsetKeyAttr.value : '';
    let overrideLimitKeyAttrValue = overrideLimitKeyAttr ? overrideLimitKeyAttr.value : '';
    console.log(
      '🚀 ~ loadExternalApiResponseDataList ~ offsetKeyAttrValue:',
      offsetKeyAttrValue,
      '~ pageOffsetKeyAttrValue:',
      pageOffsetKeyAttrValue,
      '~ overrideLimitKeyAttrValue:',
      overrideLimitKeyAttrValue,
    );

    switch (paginationDataSource) {
      case DATA_SOURCE_SUPABASE:
      case DATA_SOURCE_DIRECTUS:
      case DATA_SOURCE_MYSQL:
        offsetKeyAttrValue = offsetKeyAttrValue || 'offset';
        pageOffsetKeyAttrValue = pageOffsetKeyAttrValue || 'page';
        overrideLimitKeyAttrValue = overrideLimitKeyAttrValue || 'limit';
        break;
      default:
        break;
    }

    console.log(
      '🚀 ~ loadExternalApiResponseDataList #2 ~ offsetKeyAttrValue:',
      offsetKeyAttrValue,
      '~ pageOffsetKeyAttrValue:',
      pageOffsetKeyAttrValue,
      '~ overrideLimitKeyAttrValue:',
      overrideLimitKeyAttrValue,
    );

    if (offsetKeyAttrValue || pageOffsetKeyAttrValue) {
      paginationData['enablePagination'] = true;
      if (offsetKeyAttrValue) {
        paginationData['offsetKey'] = offsetKeyAttrValue;
        paginationData['offsetValue'] = 0;
      }

      if (pageOffsetKeyAttrValue) {
        paginationData['pageOffsetKey'] = pageOffsetKeyAttrValue;
        paginationData['pageOffsetValue'] = 0;
      }
    } else {
      paginationData['enablePagination'] = false;
    }
    if (overrideLimitKeyAttrValue) {
      paginationData['overrideLimitKey'] = overrideLimitKeyAttrValue;
    }
  }

  if (searchString) {
    if (data.externalApiItem) {
      data.externalApiItem['searchString'] = searchString;
    } else {
      data['externalApiItem'] = {
        searchString: searchString,
      };
    }
  }

  if (bodyDataFrom && bodyDataFrom === 'NON_PERSISTENT_COLLECTION') {
    //* Passing Collection Item Id from URL when Non Persistent Collection is Enabled on External API
    const pathArray = window.location.pathname.split('/');
    const nonPersistentCollectionItemId = pathArray[pathArray.length - 1];
    const pageCollectionName = pathArray[pathArray.length - 2];
    let itemId = pageCollectionName ? nonPersistentCollectionItemId : uuidv4(16);
    itemId = replaceSlashWithUnderscore(itemId);
    data['externalApiItem'] = {
      ...data.externalApiItem,
      nonPersistentCollectionItemId: itemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
      id: itemId,
      uuid: itemId,
      _data_source_rest_api_primary_id: itemId,
    };
  } else {
    let { collectionItemId, collectionId: pageCollectionName } = await getPageItemData();
    collectionItemId = replaceSlashWithUnderscore(collectionItemId);
    data['externalApiItem'] = {
      ...data.externalApiItem,
      collectionItemId,
      pageCollectionName,
      uniqueKey: uniqueKey ? uniqueKey : 'id',
      id: collectionItemId,
      uuid: collectionItemId,
      _data_source_rest_api_primary_id: collectionItemId,
    };
  }
  if (paginationData.enablePagination) {
    const paginationElemDataSet = paginationData['paginationElem']
      ? paginationData['paginationElem'].dataset
      : '';
    if (paginationElemDataSet && paginationElemDataSet.hasOwnProperty('datasource')) {
      paginationDataSource = paginationElemDataSet['datasource'];
    }
    console.log(
      '*** pagination data source #2:',
      paginationDataSource,
      '~ paginationData:',
      paginationData,
    );
    if (data.externalApiItem) {
      data.externalApiItem['recordsOffset'] = {
        offsetKey: paginationData.offsetKey ? paginationData.offsetKey : '',
        offsetValue: isPaginate ? paginationData.offsetValue : 0,
      };
      data.externalApiItem['pageOffset'] = {
        pageOffsetKey: paginationData.pageOffsetKey ? paginationData.pageOffsetKey : '',
        pageOffsetValue: isPaginate ? paginationData.pageOffsetValue : 0,
      };
      data.externalApiItem['recordsLimit'] = {
        limitKey: paginationData.overrideLimitKey ? paginationData.overrideLimitKey : 'limit',
        limitValue: paginationData.numberPerPage,
      };
      data.externalApiItem['dataSource'] = paginationDataSource;
    } else {
      data['externalApiItem'] = {
        recordsOffset: {
          offsetKey: paginationData.offsetKey ? paginationData.offsetKey : '',
          offsetValue: isPaginate ? paginationData.offsetValue : 0,
        },
        pageOffset: {
          pageOffsetKey: paginationData.pageOffsetKey ? paginationData.pageOffsetKey : '',
          pageOffsetValue: isPaginate ? paginationData.pageOffsetValue : 0,
        },
        recordsLimit: {
          limitKey: paginationData.overrideLimitKey ? paginationData.overrideLimitKey : 'limit',
          limitValue: paginationData.numberPerPage,
        },
        dataSource: paginationDataSource,
      };
    }
  } else {
    hidePaginationButton(dataTable);
  }

  // Handling Persistent Pagination
  processDataForPersistentPagination(paginationData, isPaginate, data);

  if (isExport) {
    const searchForm = elementSelector(dataTable, '[data-gjs=search-form]');
    const isDownloadAllRecords = searchForm
      ? searchForm.hasAttribute('data-downloadAllRecords')
      : false;
    if (isDownloadAllRecords) {
      if (paginationData.enablePagination) {
        data['externalApiItem'] = {
          recordsOffset: {
            offsetKey: paginationData.offsetKey ? paginationData.offsetKey : '',
            offsetValue: 0,
          },
          pageOffset: {
            pageOffsetKey: paginationData.pageOffsetKey ? paginationData.pageOffsetKey : '',
            pageOffsetValue: 0,
          },
          recordsLimit: {
            limitKey: paginationData.overrideLimitKey ? paginationData.overrideLimitKey : 'limit',
            limitValue: 'ALL',
          },
        };
        if (searchString) {
          if (data.externalApiItem) {
            data.externalApiItem['searchString'] = searchString;
          }
        }
      }
    }
    if (data.externalApiItem) {
      data.externalApiItem['exportNonPersistentReponse'] = isExport;
    } else {
      data['externalApiItem'] = {
        exportNonPersistentReponse: isExport,
      };
    }
  }

  const numberedPaginationContainer = elementSelector(dataTable, '[data-gjs=pagination-number]');
  if (numberedPaginationContainer) {
    const totalRecordsPath = numberedPaginationContainer
      ? numberedPaginationContainer.getAttribute('data-totalrecordspath')
      : '';

    if (totalRecordsPath) {
      if (data.externalApiItem) {
        data.externalApiItem['totalRecordsPath'] = totalRecordsPath;
      } else {
        data['externalApiItem'] = {
          totalRecordsPath: totalRecordsPath,
        };
      }
    }
  }

  if (data.externalApiItem) {
    const { nonPersistentCollectionItemId, collectionItemId, pageCollectionName } =
      data.externalApiItem;

    const sendPageCollectionItem = !!pageCollectionName;
    console.log(
      '%c==> DataTable from External API sendPageCollectionItem :>> ',
      'color:lime',
      sendPageCollectionItem,
    );

    if (sendPageCollectionItem) {
      if (
        collectionItemId &&
        (!bodyDataFrom || bodyDataFrom === 'collectionItem') &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + collectionItemId;
      } else if (
        nonPersistentCollectionItemId &&
        bodyDataFrom === 'NON_PERSISTENT_COLLECTION' &&
        !sendFormData
      ) {
        externalApiEndpoint = externalApiEndpoint + '/' + nonPersistentCollectionItemId;
      }
    }
  }

  let finalSessionValue = {};
  let previousFormData = {};
  let sessionStorageValue = {};
  let localStorageValue = {};
  let cookiesValue = {};

  const sessionStorage = window.sessionStorage;
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
      console.log(
        '%c==> DataTable from External API session value :>> ',
        'color:yellow',
        finalSessionValue,
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
      console.log(
        '%c==> DataTable from External API session form data :>> ',
        'color:yellow',
        previousFormData,
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

  let body = {
    data,
    externalApiId: externalApiId,
    sessionValue: finalSessionValue,
    sessionFormValue: previousFormData,
    browserStorageDTO: browserStorageData,
  };

  console.log('\n URL: ', externalApiEndpoint);
  console.log('\n Body: ', body);
  if (isExport) {
    await downloadFile(externalApiEndpoint, body);
  } else {
    result = await unSecuredPostCall(body, externalApiEndpoint);
    response.data = { ...result };
    response.externalApiResponse = result;
    response.data.externalApiResponse = result;
    response.status = 'success';
    paginationData.externalApiResponse = result.data;
    paginationData.numberOfPages = 1;
    paginationData.externalApiType = externalApiType || DATA_SOURCE_DEFAULT;
    await renderDataTableForExternalAPI(paginationData, isPaginate);
    validateNumberPaginationNav(paginationData);
    showPaginationNumbersByCurrentPage(paginationData);
    if (isPaginate) {
      return response;
    }
  }
};

//TODO: WIP -> Need to add other sources support and other enhancements
const loadDynamicDataTable = async (dataTable) => {
  console.log('%c==> loadDynamicDataTable dataTable :>> ', 'color:lime', dataTable);

  // let collectionId = '{[ collectionName ]}';
  // const finderId = '{[ finderUuid ]}';
  // const fieldName = '{[ fieldName ]}';
  // const recordsPerPage = '{[ numberPerPage ]}';
  // let collectionFrom = '{[ collectionFrom ]}';
  let collectionName = '';
  let finderId = '';
  let selectedCollection = '';
  let dtColumns = [];
  let dtCollectionFields = [];
  let externalQueryParamKeys = [];
  let totalCountResponse = {};
  let totalCount = 0;
  let numberPerPage = 100;
  let numberOfPages = 1;
  let isPrivateFilter = false;
  let tableData = [];
  let searchString = '';
  let tableHeadingCells = '';
  let tableBodyCells = '';
  const dataTableCompId = dataTable.id;

  const tableElemId = `table-${dataTableCompId}`;
  const tableElm = dataTable.children[0];
  tableElm.setAttribute('id', `${tableElemId}`);
  const componentDataSet = dataTable.dataset;
  if (componentDataSet) {
    collectionName = componentDataSet['csCollectionname'] ?? '';
    finderId = componentDataSet['csFinderuuid'] ?? '';
    recordsPerPage = componentDataSet['csNumberperpage']
      ? Number(componentDataSet['csNumberperpage'])
      : '';

    Object.entries(componentDataSet).map(([key, value], index) => {
      if (key.startsWith('csColumn')) {
        const order = key.replace(/csColumn-(.*?)/g, '$1');
        dtColumns.push({ order: Number(order), column: value });
      }
    });
  }
  if (recordsPerPage) {
    numberPerPage = recordsPerPage;
  }

  try {
    if (collectionName) {
      selectedCollection = await fetchCollectionByName(collectionName);
    }
  } catch (error) {
    if (error.response) {
      let response = {};
      const { data } = error.response;
      const errorMsg = data ? (data.message ? data.message : data) : 'Failed';
      toastr.error(errorMsg, 'Error');
      response.data = error.response;
      response.status = 'error';
      return response;
    }
  }

  if (selectedCollection) {
    if (dtColumns && dtColumns.length) {
      dtColumns.map((dtColumn) => {
        const selectedFieldColumn = selectedCollection.fields.find(
          (field) => field.fieldName === dtColumn.column,
        );
        if (selectedFieldColumn) {
          dtCollectionFields.push({ order: dtColumn.order, field: selectedFieldColumn });
        }
      });
    }
  }

  if (dtCollectionFields) {
    let { itemData } = await getItemDataForElement(dataTable);
    dtCollectionFields
      .sort((a, b) => a.order - b.order)
      .map((dtColField) => {
        tableHeadingCells += `<th data-selected-column=${dtColField.field.fieldName} type=${dtColField.field.type}><div data-gjs-type="text" title=${dtColField.field.fieldTitle.en}>${dtColField.field.fieldTitle.en}</div></th>`;
        tableBodyCells += ` <td data-selected-column=${dtColField.field.fieldName}><div>${dtColField.field.fieldTitle.en}'s value</div></td>`;
      });

    //Add Header Cells
    // tableElm.innerHTML = `<thead>${tableHeadingCells}</thead>`;
    //Add Header and Body Cells
    tableElm.innerHTML = `<thead>${tableHeadingCells}</thead><tbody>${tableBodyCells}</tbody>`;

    if (finderId) {
      let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count`;
      countItemsEndpoint = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        countItemsEndpoint,
        itemData,
        dataTable,
      );

      /**
       * This is to get search query from URL and append it to endpoint
       */
      let searchQuery = await searchQueryStringFromUrl();
      if (typeof searchString !== 'undefined' && searchString) {
        if (searchQuery) {
          if (searchQuery.startsWith('?') && !countItemsEndpoint.endsWith('/')) {
            searchQuery = searchQuery.replace('?', '&');
          }
          countItemsEndpoint = countItemsEndpoint + '&' + searchString + searchQuery;
        } else {
          countItemsEndpoint = countItemsEndpoint + '&' + searchString;
        }
      } else {
        if (searchQuery) {
          if (searchQuery.startsWith('?') && !countItemsEndpoint.endsWith('/')) {
            searchQuery = searchQuery.replace('?', '&');
          }
          countItemsEndpoint = countItemsEndpoint + searchQuery;
        }
      }
      countItemsEndpoint = await addEntityQueryToUrl(countItemsEndpoint, collectionName, finderId);
      totalCountResponse = await securedGetCall(countItemsEndpoint);
      totalCount = totalCountResponse.data;
      numberOfPages = getNumberOfPages(totalCount, numberPerPage);
      isPrivateFilter = totalCountResponse ? !!totalCountResponse._$isPrivateFilter : false;
    }

    if (collectionName && finderId) {
      let collectionItemEndpoint = `collection-table/${collectionName}/finder/${finderId}/items`;
      let currentPage = 1;
      let begin = (currentPage - 1) * numberPerPage;
      collectionItemEndpoint = `${collectionItemEndpoint}?offset=${begin}&limit=${numberPerPage}`;
      collectionItemEndpoint = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        collectionItemEndpoint,
        itemData,
        dataTable,
      );
      if (searchString) {
        collectionItemEndpoint += `&${searchString}`;
      }

      const response = await securedGetCall(collectionItemEndpoint);
      tableData = response.data;
    }
    collectionItemEndpoint = await addEntityQueryToUrl(
      collectionItemEndpoint,
      collectionName,
      finderId,
    );
    const theadElement = dataTable.querySelector('thead');

    if (tableData) {
      tableElm.innerHTML = '';
      tableBodyCells = '';
      tableData.map((itemData) => {
        let columnFieldName = '';
        let itemDataValue = '';
        tableBodyCells += '<tr>';

        [...theadElement.rows[0].cells].forEach((cell, index) => {
          columnFieldName = elementAttribute(cell, 'data-selected-column');
          itemDataValue = itemData[columnFieldName] ?? '';
          tableBodyCells += ` <td data-selected-column=${columnFieldName}><div>${itemDataValue}</div></td>`;
        });
        tableBodyCells += '</tr>';
      });
    }

    //Add Header and Body Cells
    tableElm.innerHTML = `<thead>${tableHeadingCells}</thead><tbody>${tableBodyCells}</tbody>`;
    //Add Body Cells
    // tableElm.innerHTML += `<tbody>${tableBodyCells}</tbody>`;

    //Initialise Dynamic DataTable
    tableData &&
      tableBodyCells &&
      $(`#${tableElemId}`).DataTable({
        responsive: true,
      });
  }
};

const renderDataTableForExternalAPI = async (paginationData, isPaginate = false) => {
  const {
    columnsMap,
    firstRowElements,
    tbodyElement,
    collectionName,
    externalApiResponse,
    responseDataMapping,
    dataTable,
    externalApiType,
  } = paginationData;
  if (tbodyElement) {
    let externalApiResponseData = [];
    if (externalApiResponse.data) {
      externalApiResponseData = [...externalApiResponse.data];
    } else {
      const objectArray = Object.entries(externalApiResponse);
      objectArray.map(([key, value]) => {
        if (
          ![
            'externalApiMiddlewareId',
            'totalRecords',
            'responseSavedCollection',
            'responseSavedItemsUuid',
          ].includes(key) &&
          value
        ) {
          externalApiResponseData.push(value);
        }
      });
    }

    paginationData.numberOfPages =
      paginationData.enablePagination && externalApiResponseData && externalApiResponseData.length
        ? getNumberOfPages(externalApiResponseData.length, paginationData.numberPerPage)
        : 1;

    paginationData['responseDataLength'] =
      externalApiResponseData && externalApiResponseData.length
        ? externalApiResponseData.length
        : 0;

    validatePaginationButtonForNonPersistent(paginationData, dataTable);

    const { numberPerPage } = paginationData;
    const { totalRecords } = externalApiResponse ? externalApiResponse : '';
    paginationData.numberOfPages =
      numberPerPage && totalRecords
        ? getNumberOfPages(totalRecords, numberPerPage)
        : paginationData.numberOfPages;

    if (!isPaginate) {
      numberPaginationNav(paginationData);
      await addDataTableDataToMap(paginationData, dataTable, true, !isPaginate);
    }

    let rows = ``;
    tbodyElement.innerHTML = rows;
    addTablePlaceholder(paginationData.numberPerPage || 1, firstRowElements, tbodyElement);
    let tableData = [];
    if (columnsMap) {
      tableData = externalApiResponseData;
      const theadElement = dataTable.querySelector('thead');
      const referenceColmunIndexes = [];
      [...theadElement.rows[0].cells].forEach((cell, index) => {
        if (['reference', 'belongsTo'].includes(elementAttribute(cell, 'type'))) {
          referenceColmunIndexes.push({
            fieldName: elementAttribute(cell, 'data-selected-column'),
            index,
          });
        }
      });
      rows += await createTableRecords(
        tableData,
        columnsMap,
        firstRowElements,
        collectionName,
        true,
        responseDataMapping,
        referenceColmunIndexes,
        externalApiType,
      );
      tbodyElement.innerHTML = rows;
    }
  }

  /* Set the style */
  for (let [key, value] of dataTableStylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);
    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
};

const hidePaginationButton = (element) => {
  const loadMore = elementSelector(element, '.loadMore');
  const next = elementSelector(element, '.next');
  const previous = elementSelector(element, '.previous');
  const first = elementSelector(element, '.first');
  const last = elementSelector(element, '.last');

  loadMore && (loadMore.disabled = true);
  loadMore && (loadMore.hidden = true);
  loadMore && (loadMore.style.display = 'none');
  next && (next.disabled = true);
  next && (next.hidden = true);
  next && (next.style.display = 'none');
  previous && (previous.disabled = true);
  previous && (previous.hidden = true);
  previous && (previous.style.display = 'none');
  first && (first.disabled = true);
  first && (first.hidden = true);
  first && (first.style.display = 'none');
  last && (last.disabled = true);
  last && (last.hidden = true);
  last && (last.style.display = 'none');
};

const validatePaginationButtonForNonPersistent = (paginationData, element) => {
  const { numberPerPage, responseDataLength, currentPage } = paginationData;
  const next = elementSelector(element, '.next');
  const previous = elementSelector(element, '.previous');
  const first = elementSelector(element, '.first');
  const last = elementSelector(element, '.last');

  next && (next.disabled = !responseDataLength || responseDataLength < numberPerPage);
  previous && (previous.disabled = currentPage === 1);
  first && (first.disabled = currentPage === 1);
  last && (last.disabled = true);

  if (next && next.disabled) {
    next.style.cursor = 'default';
  }
  if (previous && previous.disabled) {
    previous.style.cursor = 'default';
  }
  if (first && first.disabled) {
    first.style.cursor = 'default';
  }
  if (last && last.disabled) {
    last.style.cursor = 'default';
  }
};

const dateRangeDataGroupNav = (paginationData) => {
  let { dataGroup, externalApiId } = paginationData ? paginationData : '';
  const dateRangePaginationContainer = elementSelector(dataGroup, '[data-gjs=date-range-filter]');
  if (!dateRangePaginationContainer) return '';
  const prevDateRangeLink = elementSelector(dateRangePaginationContainer, '.prev-date-range');
  const nextDateRangeLink = elementSelector(dateRangePaginationContainer, '.next-date-range');
  if (!prevDateRangeLink) return '';
  prevDateRangeLink.addEventListener('click', async () => {
    paginationData.currentDateRange -= 1;
    if (externalApiId) {
      await loadDataGroupExternalAPI(paginationData);
    } else {
      loadGroupData(paginationData);
    }
  });
  if (!nextDateRangeLink) return '';
  nextDateRangeLink.addEventListener('click', async () => {
    paginationData.currentDateRange += 1;
    if (externalApiId) {
      await loadDataGroupExternalAPI(paginationData);
    } else {
      loadGroupData(paginationData);
    }
  });
};

const dateRangePaginationNav = (paginationData) => {
  let { dataTable, externalApiId } = paginationData ? paginationData : '';
  const dateRangePaginationContainer = elementSelector(dataTable, '[data-gjs=date-range-filter]');
  if (!dateRangePaginationContainer) return '';
  const prevDateRangeLink = elementSelector(dateRangePaginationContainer, '.prev-date-range');
  const nextDateRangeLink = elementSelector(dateRangePaginationContainer, '.next-date-range');
  if (!prevDateRangeLink) return '';
  prevDateRangeLink.addEventListener('click', async () => {
    paginationData.currentDateRange -= 1;
    if (externalApiId) {
      await loadExternalApiResponseDataList(paginationData, {}, true);
    } else {
      loadDataList(paginationData);
    }
  });
  if (!nextDateRangeLink) return '';
  nextDateRangeLink.addEventListener('click', async () => {
    paginationData.currentDateRange += 1;
    if (externalApiId) {
      await loadExternalApiResponseDataList(paginationData, {}, true);
    } else {
      loadDataList(paginationData);
    }
  });
};

const getDataRangeQuery = (paginationData, componentType, searchString = '') => {
  if (!paginationData) return '';
  const dateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
  let { currentDateRange } = paginationData;
  const component = paginationData[componentType];
  const dateRangePaginationContainer = elementSelector(component, '[data-gjs=date-range-filter]');
  if (!dateRangePaginationContainer) return '';
  const dateField = dateRangePaginationContainer.getAttribute('date-field');
  const rangeType = dateRangePaginationContainer.getAttribute('date-range-type');
  const dateRangeDiv = elementSelector(dateRangePaginationContainer, '.date-range-div');
  if (!dateField) return '';
  if (!rangeType) return '';
  if (searchString) {
    dateRangeDiv.innerText = '';
    return '';
  }

  let start = '';
  let end = '';
  let now = moment();

  now = now.add(currentDateRange, `${rangeType}s`);
  start = now.startOf(rangeType);
  start = start.format(dateFormat);
  end = now.endOf(rangeType);
  end = end.format(dateFormat);

  if (start === end) {
    dateRangeDiv.innerText = start;
  } else dateRangeDiv.innerText = `${start} - ${end}`;

  const startRangeQuery = `start_${dateField}=${start}`;
  const endRangeQuery = `end_${dateField}=${end}`;

  return `${startRangeQuery}&${endRangeQuery}`;
};

const numberPaginationNav = (paginationData, processPersistentPagination = true) => {
  const { dataTable, numberOfPages, numberPerPage, currentPage, externalApiId } = paginationData
    ? paginationData
    : '';
  const externalAPIExist = !!externalApiId;
  const numberedPaginationContainer = elementSelector(dataTable, '[data-gjs=pagination-number]');
  const numberedPaginationNav = elementSelector(dataTable, '[data-gjs=pagination-number-nav]');
  const numberedPagination = elementSelector(dataTable, '.pagination-number-nav-list');

  if (numberedPagination) {
    const numberedPaginationPrev = elementSelector(dataTable, '.page-item-prev');
    const numberedPaginationNext = elementSelector(dataTable, '.page-item-next');
    const showPaginationDropdown = numberedPaginationContainer.hasAttribute(
      'data-showpagepaginationdropdown',
    );
    const persistPagination = numberedPaginationContainer.hasAttribute('data-persistpagination');
    let paginationPrevLink = numberedPaginationPrev ? numberedPaginationPrev.children[0] : '';
    let paginationNextLink = numberedPaginationNext ? numberedPaginationNext.children[0] : '';
    numberedPagination.innerHTML = '';

    if (numberOfPages > 1) {
      numberedPaginationNav.style.display = 'revert';
      numberedPaginationNav.classList.remove('d-none');
      numberedPagination && numberedPagination.appendChild(numberedPaginationPrev);
      for (let i = 0; i < numberOfPages; i++) {
        let pageNumber = i + 1;
        let pageItemElem = document.createElement('li');
        pageItemElem.classList.add('page-item');
        let pageLinkElem = document.createElement('a');
        pageLinkElem.href = 'javascript:void(0)';
        pageLinkElem.classList.add('page-link');
        pageLinkElem.classList.add(`link-${pageNumber}`);
        pageLinkElem.textContent = pageNumber;

        if (showPaginationDropdown && pageNumber > DEFAULT_PAGE_RANGE_NUMBER_PAGINATE) {
          pageItemElem.classList.add(`d-none`);
          pageLinkElem.classList.add(`d-none`);
        }
        pageItemElem.appendChild(pageLinkElem);
        pageLinkElem.addEventListener('click', () => {
          specificDataTablePage(paginationData, pageNumber);
        });
        numberedPagination.appendChild(pageItemElem);
      }
      createEllipses(showPaginationDropdown, numberOfPages, numberedPagination);
      numberedPaginationNext && numberedPagination.appendChild(numberedPaginationNext);

      addPageNumberDropdown(
        showPaginationDropdown,
        numberOfPages,
        numberedPaginationContainer,
        numberedPagination,
        paginationData,
      );

      paginationPrevLink = resetListener(paginationPrevLink, () => {
        previousDataTablePage(paginationData);
      });
      paginationNextLink = resetListener(paginationNextLink, () => {
        nextDataTablePage(paginationData);
      });
      if (processPersistentPagination) processNumberedPaginationPersist(paginationData);
    } else {
      numberedPaginationNav.style.display = 'none';
      numberedPaginationNav.classList.add('d-none');
      numberedPaginationPrev && numberedPagination.appendChild(numberedPaginationPrev);
      let pageNumber = 1;
      let pageItemElem = document.createElement('li');
      pageItemElem.classList.add('page-item');
      let pageLinkElem = document.createElement('a');
      pageLinkElem.href = 'javascript:void(0)';
      pageLinkElem.classList.add('page-link');
      pageLinkElem.classList.add(`link-${pageNumber}`);
      pageLinkElem.textContent = pageNumber;
      pageItemElem.classList.add(`d-none`);
      pageLinkElem.classList.add(`d-none`);
      pageItemElem.appendChild(pageLinkElem);
      numberedPagination.appendChild(pageItemElem);
      numberedPaginationNext && numberedPagination.appendChild(numberedPaginationNext);
    }
  }
};
const resetListener = (element, handler) => {
  if (!element) return null;
  const newElement = element.cloneNode(true);
  element.parentNode.replaceChild(newElement, element);
  newElement.addEventListener('click', handler);
  return newElement;
};

const createEllipses = (showPaginationDropdown, numberOfPages, numberedPagination) => {
  if (showPaginationDropdown && numberOfPages > DEFAULT_PAGE_RANGE_NUMBER_PAGINATE) {
    //Create ellipses
    let pageItemElem = document.createElement('li');
    pageItemElem.classList.add('page-item');
    pageItemElem.classList.add('item-ellipses-last');
    pageItemElem.classList.add('disabled');
    pageItemElem.setAttribute('disabled', true);
    let ellipsesElem = document.createElement('span');
    ellipsesElem.classList.add('page-link');
    ellipsesElem.classList.add('span-ellipses');
    ellipsesElem.setAttribute('disabled', true);
    ellipsesElem.style.cursor = 'default';
    ellipsesElem.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" viewBox="0 0 10 2" focusable="false" aria-hidden="true"><path d="M9 2c-.608 0-1-.425-1-1s.392-1 1-1 1 .448 1 1c0 .575-.392 1-1 1zM5 2c-.608 0-1-.425-1-1s.392-1 1-1 1 .448 1 1c0 .575-.392 1-1 1zM1 2c-.608 0-1-.425-1-1s.392-1 1-1 1 .448 1 1c0 .575-.392 1-1 1z"></path>...</svg>';
    pageItemElem.appendChild(ellipsesElem);
    numberedPagination.appendChild(pageItemElem);
  }
};

const addPageNumberDropdown = (
  showPaginationDropdown,
  numberOfPages,
  numberedPaginationContainer,
  numberedPagination,
  paginationData,
) => {
  if (showPaginationDropdown && numberOfPages > DEFAULT_PAGE_RANGE_NUMBER_PAGINATE) {
    let pageDropdownElem = document.createElement('li');
    pageDropdownElem.classList.add('page-item');
    pageDropdownElem.classList.add('item-page-select-last');
    pageDropdownElem.classList.add('dc-pagination-select');
    pageDropdownElem.style.display = 'inline-block';

    let pageDropdownSelectElem = document.createElement('select');

    let selectElemId = numberedPaginationContainer.id + '-pageSelect';
    let selectElemName = numberedPaginationContainer.id + '-pageSelect';

    pageDropdownSelectElem.id = selectElemId;
    pageDropdownSelectElem.name = selectElemName;
    pageDropdownSelectElem.classList.add('page-link');
    pageDropdownSelectElem.classList.add('select');
    pageDropdownSelectElem.classList.add('form-control');

    let options = [`<option value="">Pages</option>`];
    for (let i = 0; i < numberOfPages; i++) {
      let pageNumber = i + 1;
      options = options.concat(`<option value="${pageNumber}">${pageNumber}</option>`);
    }

    pageDropdownSelectElem.innerHTML = options.join('');
    pageDropdownElem.appendChild(pageDropdownSelectElem);
    numberedPagination.appendChild(pageDropdownElem);

    $(`#${selectElemId}`)
      .select2({
        selectionCssClass: ':all:',
        width: 'resolve',
      })
      .trigger('change');

    specificDataTablePageFromSelect(selectElemId, paginationData);
  }
};

const validateNumberPaginationNav = (paginationData) => {
  const { dataTable, numberOfPages, numberPerPage, currentPage } = paginationData
    ? paginationData
    : '';
  const numberedPagination = elementSelector(dataTable, '.pagination-number-nav-list');
  const numberedPaginationInfo = elementSelector(dataTable, '.pagination-number-info');

  if (numberedPaginationInfo) {
    if (numberOfPages > 1) {
      numberedPaginationInfo.textContent = `Page ${currentPage} of ${numberOfPages}`;
    } else {
      numberedPaginationInfo.innerHTML = ``;
    }
  }
  if (numberedPagination) {
    numberedPagination.childNodes.forEach((childNode, index) => {
      if (
        !(
          childNode.classList.contains('item-ellipses-last') ||
          childNode.classList.contains('item-page-select-last')
        )
      ) {
        if (index <= 1) {
          if (currentPage === 1) {
            childNode.disabled = true;
            childNode.classList.add('disabled');
            childNode.setAttribute('disabled', true);
            childNode.children[0].disabled = true;
            childNode.children[0].classList.add('disabled');
          } else {
            childNode.disabled = false;
            childNode.classList.remove('disabled');
            childNode.setAttribute('disabled', false);
            childNode.children[0].disabled = false;
            childNode.children[0].classList.remove('disabled');
          }
        }
        if (index > 1 && index < numberOfPages) {
          if (currentPage === index) {
            childNode.disabled = true;
            childNode.classList.add('disabled');
            childNode.setAttribute('disabled', true);
            childNode.children[0].disabled = true;
          } else {
            childNode.disabled = false;
            childNode.classList.remove('disabled');
            childNode.setAttribute('disabled', false);
            childNode.children[0].disabled = false;
          }
        }
        if (currentPage === numberOfPages) {
          if (index === numberOfPages || index > numberOfPages) {
            childNode.disabled = true;
            childNode.classList.add('disabled');
            childNode.setAttribute('disabled', true);
            childNode.children[0].disabled = true;
          }
        } else {
          if (index === numberOfPages || index > numberOfPages) {
            childNode.disabled = false;
            childNode.classList.remove('disabled');
            childNode.setAttribute('disabled', false);
            childNode.children[0].disabled = false;
          }
        }
      }
    });
  }
};

const showPaginationNumbersByCurrentPage = (paginationData) => {
  const { dataTable, numberOfPages, numberPerPage, currentPage } = paginationData
    ? paginationData
    : '';
  const numberedPaginationContainer = elementSelector(dataTable, '[data-gjs=pagination-number]');

  if (numberedPaginationContainer) {
    const numberedPagination = elementSelector(dataTable, '.pagination-number-nav-list');
    const showPaginationDropdown = numberedPaginationContainer.hasAttribute(
      'data-showpagepaginationdropdown',
    );

    if (showPaginationDropdown) {
      let rangeDifference = -1;
      let enableHidePaginationNumbers = false;
      let hideUptoIndex = -1;
      let displayUptoIndex = -1;

      if (currentPage >= DEFAULT_PAGE_RANGE_NUMBER_PAGINATE) {
        rangeDifference = currentPage - DEFAULT_PAGE_RANGE_NUMBER_PAGINATE;
      }

      if (rangeDifference > -1) {
        enableHidePaginationNumbers = true;
        hideUptoIndex = rangeDifference + 1;
        displayUptoIndex = DEFAULT_PAGE_RANGE_NUMBER_PAGINATE + rangeDifference + 1;
      }

      if (numberedPagination) {
        numberedPagination.childNodes.forEach((childNode, index) => {
          if (
            !(
              childNode.classList.contains('item-ellipses-last') ||
              childNode.classList.contains('item-page-select-last') ||
              childNode.classList.contains('page-item-prev') ||
              childNode.classList.contains('page-item-next')
            )
          ) {
            if (enableHidePaginationNumbers) {
              if (index <= hideUptoIndex) {
                childNode.classList.add('d-none');
                childNode.children[0].classList.add('d-none');
              } else if (index > hideUptoIndex && index <= displayUptoIndex) {
                childNode.classList.remove('d-none');
                childNode.children[0].classList.remove('d-none');
              } else {
                childNode.classList.add('d-none');
                childNode.children[0].classList.add('d-none');
              }
            } else {
              if (index <= DEFAULT_PAGE_RANGE_NUMBER_PAGINATE) {
                childNode.classList.remove('d-none');
                childNode.children[0].classList.remove('d-none');
              } else if (index > DEFAULT_PAGE_RANGE_NUMBER_PAGINATE) {
                childNode.classList.add('d-none');
                childNode.children[0].classList.add('d-none');
              }
            }
          }
        });
      }
    }
  }
};

const processNumberedPaginationPersist = (paginationData) => {
  const { dataTable } = paginationData;
  const numberedPaginationContainer = elementSelector(dataTable, '[data-gjs=pagination-number]');
  const persistPagination = numberedPaginationContainer
    ? numberedPaginationContainer.hasAttribute('data-persistpagination')
    : '';

  if (numberedPaginationContainer) {
    if (persistPagination) {
      const sessionPreviousActionResponse = sessionStorage.getItem('previousActionResponse');
      const sessionResponseData = sessionPreviousActionResponse
        ? JSON.parse(sessionPreviousActionResponse)
        : '';

      if (paginationData.externalApiId) {
        if (sessionResponseData && sessionResponseData !== 'undefined') {
          const dtPageKey = `dtPage-${numberedPaginationContainer.id}`;
          const dtSessionCurrentPage = sessionResponseData[dtPageKey];
          if (dtSessionCurrentPage) {
            const { pageNumber } = dtSessionCurrentPage;
            specificDataTablePage(paginationData, pageNumber);
          }
        }
      } else {
        if (sessionResponseData && sessionResponseData !== 'undefined') {
          const dtPageKey = `dtPage-${numberedPaginationContainer.id}`;
          const dtSessionCurrentPage = sessionResponseData[dtPageKey];

          if (dtSessionCurrentPage) {
            specificDataTablePage(paginationData, dtSessionCurrentPage);
          }
        }
      }
    } else {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        let updatedResponseData = previousActionResponse;
        const dtPageKey = `dtPage-${numberedPaginationContainer.id}`;
        updatedResponseData = _.omit(updatedResponseData, dtPageKey);
        sessionStorage.setItem('previousActionResponse', JSON.stringify(updatedResponseData));
      }
    }
  }
};

const processPaginationPersist = (paginationData) => {
  const { dataTable } = paginationData;
  const paginationContainer = elementSelector(dataTable, '[data-gjs=pagination]');
  const persistPagination = paginationContainer
    ? paginationContainer.hasAttribute('data-persistpagination')
    : '';

  if (paginationContainer) {
    if (persistPagination) {
      const sessionPreviousActionResponse = sessionStorage.getItem('previousActionResponse');
      const sessionResponseData = sessionPreviousActionResponse
        ? JSON.parse(sessionPreviousActionResponse)
        : '';

      if (sessionResponseData && sessionResponseData !== 'undefined') {
        const dtPageKey = `dtPage-${paginationContainer.id}`;
        const dtSessionCurrentPage = sessionResponseData[dtPageKey];

        if (dtSessionCurrentPage) {
          loadPersistentPagination(paginationData, dtSessionCurrentPage);
        }
      }
    } else {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        let updatedResponseData = previousActionResponse;
        const dtPageKey = `dtPage-${paginationContainer.id}`;
        updatedResponseData = _.omit(updatedResponseData, dtPageKey);
        sessionStorage.setItem('previousActionResponse', JSON.stringify(updatedResponseData));
      }
    }
  }
};

const processExternalApiDataTablePaginationPersist = (paginationData) => {
  const { dataTable } = paginationData;
  const paginationContainer = elementSelector(dataTable, '[data-gjs=pagination]');
  const persistPagination = paginationContainer
    ? paginationContainer.hasAttribute('data-persistpagination')
    : '';
  const numberedPaginationContainer = elementSelector(dataTable, '[data-gjs=pagination-number]');
  const persistNumberedPagination = numberedPaginationContainer
    ? numberedPaginationContainer.hasAttribute('data-persistpagination')
    : '';
  if (paginationContainer) {
    if (persistPagination) {
      const sessionPreviousActionResponse = sessionStorage.getItem('previousActionResponse');
      const sessionResponseData = sessionPreviousActionResponse
        ? JSON.parse(sessionPreviousActionResponse)
        : '';

      if (sessionResponseData && sessionResponseData !== 'undefined') {
        const dtPageKey = `dtPage-${paginationContainer.id}`;
        const dtSessionCurrentPage = sessionResponseData[dtPageKey];
        if (dtSessionCurrentPage) {
          loadExternalApiPersistentPagination(paginationData, dtSessionCurrentPage);
        }
      }
    } else {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        let updatedResponseData = previousActionResponse;
        const dtPageKey = `dtPage-${paginationContainer.id}`;
        updatedResponseData = _.omit(updatedResponseData, dtPageKey);
        sessionStorage.setItem('previousActionResponse', JSON.stringify(updatedResponseData));
      }
    }
  }
  if (numberedPaginationContainer) {
    if (persistNumberedPagination) {
      const sessionPreviousActionResponse = sessionStorage.getItem('previousActionResponse');
      const sessionResponseData = sessionPreviousActionResponse
        ? JSON.parse(sessionPreviousActionResponse)
        : '';

      if (sessionResponseData && sessionResponseData !== 'undefined') {
        const dtPageKey = `dtPage-${numberedPaginationContainer.id}`;
        const dtSessionCurrentPage = sessionResponseData[dtPageKey];
        if (dtSessionCurrentPage) {
          loadExternalApiPersistentPagination(paginationData, dtSessionCurrentPage);
        }
      }
    } else {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        let updatedResponseData = previousActionResponse;
        const dtPageKey = `dtPage-${numberedPaginationContainer.id}`;
        updatedResponseData = _.omit(updatedResponseData, dtPageKey);
        sessionStorage.setItem('previousActionResponse', JSON.stringify(updatedResponseData));
      }
    }
  }
};

const addTablePlaceholder = (numberOfItem, firstRowElements, tbodyRef) => {
  const loadingIconKey = localStorage.getItem('loadingIconKey');
  if (loadingIconKey === 'PLACEHOLDER') {
    const tableCell = firstRowElements.cells.length;
    for (let i = 0; i < numberOfItem; i++) {
      const newRow = tbodyRef.insertRow();
      for (let j = 0; j < tableCell; j++) {
        const newCell = newRow.insertCell();
        newCell.innerHTML = `<div class="drapcode-item-table"><div class="drapcode-col-12"><div class="drapcode-row"><div class="drapcode-col-12"></div></div></div></div>`;
      }
    }
  } else {
    const tableCell = firstRowElements.cells.length;
    const newRow = tbodyRef.insertRow();
    for (let j = 0; j < tableCell; j++) {
      const newCell = newRow.insertCell();
      if (loadingIconKey === 'PLAIN_SPINNER') {
        newCell.innerHTML = `<div class="drapcode-spinner-plane drapcode-item-table"></div>`;
      } else if (loadingIconKey === 'CHASE_SPINNER') {
        newCell.innerHTML = `<div class="sk-chase drapcode-item-table"><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div><div class="sk-chase-dot"></div></div>`;
      } else if (loadingIconKey === 'BAR_SPINNER') {
        newCell.innerHTML = `<div class="drapcode-spinner-bar drapcode-item-table"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>`;
      } else if (loadingIconKey === 'DOT_SPINNER') {
        newCell.innerHTML = `<div class="drapcode-spinner-dot drapcode-item-table"><div class="dot1"></div><div class="dot2"></div></div>`;
      } else if (loadingIconKey === 'FADING_CIRCLE_SPINNER') {
        newCell.innerHTML = `<div class="sk-fading-circle drapcode-item-table"><div class="sk-circle1 sk-circle"></div><div class="sk-circle2 sk-circle"></div><div class="sk-circle3 sk-circle"></div><div class="sk-circle4 sk-circle"></div><div class="sk-circle5 sk-circle"></div><div class="sk-circle6 sk-circle"></div><div class="sk-circle7 sk-circle"></div><div class="sk-circle8 sk-circle"></div><div class="sk-circle9 sk-circle"></div><div class="sk-circle10 sk-circle"></div><div class="sk-circle11 sk-circle"></div><div class="sk-circle12 sk-circle"></div></div>`;
      } else if (loadingIconKey === 'BOUNCE_SPINNER') {
        newCell.innerHTML = `<div class="drapcode-spinner-bounce drapcode-item-table"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>`;
      } else {
        newCell.innerHTML = '';
      }
    }
  }
};

const setTableMetaData = async (paginationData, itemData = {}, collectionName = '') => {
  const { dataTable, tbodyElement } = paginationData;
  const tElementRow = tbodyElement.rows[0].cloneNode(true);
  paginationData.firstRowElements = tElementRow;
  paginationData.columnsMap = getColumnsMetaData(
    dataTable,
    itemData,
    collectionName,
    paginationData,
  );
};

const getColumnsMetaData = (dataTable, itemData = {}, collectionName = '', paginationData = {}) => {
  const { loadFromExternalAPI, loadFromBrowserSession } = paginationData ? paginationData : '';
  let columnsMap = [];
  const tableRows = dataTable.querySelector('[data-custom-js-row=collection-row]');
  if (tableRows) {
    const tableHeadingCells = tableRows ? tableRows.cells : [];
    Object.values(tableHeadingCells).map((column) => {
      let columnKey = elementAttribute(column, 'data-selected-column');
      let columnResponseMapKey = elementAttribute(column, 'data-selected-response-map-column');
      let columnSessionMapKey = elementAttribute(column, 'data-session-field');
      if (columnKey.includes('"')) {
        columnKey = columnKey.split("'").join('"');
      }
      const columnValue = elementAttribute(column, 'type');
      if (columnKey) {
        if (loadFromExternalAPI) {
          columnsMap[columnResponseMapKey ? columnResponseMapKey : columnKey] = columnValue;
        } else if (loadFromBrowserSession) {
          columnsMap[columnSessionMapKey ? columnSessionMapKey : columnKey] = columnValue;
        } else {
          columnsMap[columnKey] = columnValue;
        }
        if (
          columnValue === 'reference' ||
          columnValue === 'createdBy' ||
          columnValue === 'belongsTo'
        ) {
          let refCollection = elementAttribute(column, 'metadata');
          if (columnValue === 'createdBy' && !refCollection) {
            refCollection = null;
          }

          if (!refCollection && itemData && collectionName && itemData[collectionName]) {
            // Handling BelongsTo Parent Collection
            itemData['hasBelongsToParentData'] = true;
            columnsMap[columnKey] = {
              metaData: itemData,
              type: columnValue,
            };
          } else {
            columnsMap[columnKey] = {
              metaData: JSON.parse(refCollection),
              type: columnValue,
            };
          }
        }
      }
    });
  }
  return columnsMap;
};

const addDataTableDataToMap = async (
  paginationData,
  originalDataTable,
  isNonPersistent = false,
  addNonPersistentToMap = false,
) => {
  if (isNonPersistent) {
    if (addNonPersistentToMap) {
      dataTablePaginationDataMap.set('nonpersist_ptdata_' + originalDataTable.id, paginationData);
    }
  } else {
    dataTablePaginationDataMap.set('ptdata_' + originalDataTable.id, paginationData);
  }
};

/** Data Table Related **/
const nextDataTablePage = async (paginationData) => {
  paginationData.currentPage += 1;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dtPaginationDataMapValue = dataTablePaginationDataMap.get(
      `nonpersist_ptdata_${paginationData.dataTable.id}`,
    );
    if (paginationData.enablePagination) {
      let response = {};
      paginationData.offsetValue += offsetKey ? numberPerPage : '';
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
      resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
      await loadExternalApiResponseDataList(paginationData, response, true);
    }
  } else {
    persistDataTablePagination(paginationData, paginationData.currentPage);
    persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
    resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
    loadDataComponent(paginationData);
  }
};

const firstDataTablePage = async (paginationData) => {
  paginationData.currentPage = 1;
  if (paginationData.externalApiId) {
    let { offsetKey } = paginationData;
    const dtPaginationDataMapValue = dataTablePaginationDataMap.get(
      `nonpersist_ptdata_${paginationData.dataTable.id}`,
    );
    if (paginationData.enablePagination) {
      let response = {};
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData.offsetValue = offsetKey ? 0 : '';
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
      resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
      await loadExternalApiResponseDataList(paginationData, response, true);
    }
  } else {
    persistDataTablePagination(paginationData, paginationData.currentPage);
    persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
    resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
    loadDataList(paginationData);
  }
};

const lastDataTablePage = async (paginationData) => {
  paginationData.currentPage = paginationData.numberOfPages;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dtPaginationDataMapValue = dataTablePaginationDataMap.get(
      `nonpersist_ptdata_${paginationData.dataTable.id}`,
    );
    if (paginationData.enablePagination) {
      let response = {};
      paginationData.pageOffsetValue = paginationData.currentPage;
      paginationData.offsetValue = offsetKey ? numberPerPage : '';
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
      resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
      await loadExternalApiResponseDataList(paginationData, response, true);
    }
  } else {
    persistDataTablePagination(paginationData, paginationData.currentPage);
    persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
    resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
    loadDataList(paginationData);
  }
};

const previousDataTablePage = async (paginationData) => {
  paginationData.currentPage -= 1;
  if (paginationData.externalApiId) {
    let { numberPerPage, offsetKey } = paginationData;
    const dtPaginationDataMapValue = dataTablePaginationDataMap.get(
      `nonpersist_ptdata_${paginationData.dataTable.id}`,
    );
    if (paginationData.enablePagination) {
      let response = {};
      paginationData.pageOffsetValue = paginationData.currentPage - 1;
      paginationData.offsetValue -= offsetKey ? numberPerPage : '';
      paginationData['isPaginated'] = true;
      persistExternalApiDataTablePagination(paginationData);
      persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
      resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
      await loadExternalApiResponseDataList(paginationData, response, true);
    }
  } else {
    persistDataTablePagination(paginationData, paginationData.currentPage);
    persistDataTableNumberedPagination(paginationData, paginationData.currentPage);
    resetPaginationPageDropdownValue(paginationData, paginationData.currentPage);
    loadDataComponent(paginationData);
  }
};

const specificDataTablePage = async (paginationData, pageNumber) => {
  if (paginationData.externalApiId) {
    if (paginationData.enablePagination) {
      let { numberPerPage, offsetKey } = paginationData;
      let response = {};
      paginationData.currentPage = pageNumber;
      paginationData.pageOffsetValue = pageNumber ? pageNumber - 1 : 0;
      const offsetValue = paginationData.pageOffsetValue * numberPerPage;
      paginationData.offsetValue = offsetKey ? offsetValue : '';
      paginationData['isPaginated'] = true;
      persistDataTableNumberedPagination(paginationData, pageNumber);
      resetPaginationPageDropdownValue(paginationData, pageNumber);
      await loadExternalApiResponseDataList(paginationData, response, true);
    }
  } else {
    persistDataTableNumberedPagination(paginationData, pageNumber);
    resetPaginationPageDropdownValue(paginationData, pageNumber);
    paginationData.currentPage = pageNumber;
    loadDataComponent(paginationData);
  }
};

const specificDataTablePageFromSelect = (selectElemId, paginationData) => {
  if (selectElemId && paginationData) {
    $(`#${selectElemId}`).on('select2:select', function (e) {
      let data = e.params.data;
      if (data && data.id) {
        specificDataTablePage(paginationData, Number(data.id));
      } else {
        specificDataTablePage(paginationData, 1);
      }
    });
  }
};

const loadDataComponent = (paginationData, checkPersistentPagination = false) => {
  const componentType = paginationData?.componentType || 'DATA_TABLE';
  if (componentType === 'DATA_TABLE') {
    loadDataList(paginationData, checkPersistentPagination);
  } else if (componentType === 'DATA_GROUP') {
    paginationData.replacedElement.innerHTML = createDataGroupPlaceholder(paginationData);
    loadGroupData(paginationData, false, checkPersistentPagination);
  }
};

const loadExternalApiPersistentPagination = (paginationData, currentPageSessionObj) => {
  if (currentPageSessionObj) {
    const { pageNumber, offsetValue, pageOffsetValue } = currentPageSessionObj;

    let persistPaginationObj = {
      currentPage: pageNumber,
      offsetValue: offsetValue,
      pageOffsetValue: pageOffsetValue,
      numberOfPages: 1,
    };

    paginationData.currentPage = pageNumber;
    paginationData.offsetValue = offsetValue;
    paginationData.pageOffsetValue = pageOffsetValue;
    paginationData.numberOfPages = 1;
    paginationData['externalApiPersistentPagination'] = { ...persistPaginationObj };
  }
};

const loadPersistentPagination = (paginationData, currentPageSessionObj) => {
  if (currentPageSessionObj) {
    const { sessionCurrentPage } = currentPageSessionObj;
    if (sessionCurrentPage) {
      let persistPaginationObj = {
        sessionCurrentPage,
      };
      paginationData['persistentPagination'] = { ...persistPaginationObj };
      paginationData['currentPage'] = sessionCurrentPage;
    }
  }
};

const resetPaginationPageDropdownValue = (paginationData, pageNumber) => {
  const { dataTable, dataGroup } = paginationData ? paginationData : '';
  let component = '';
  if (dataTable) {
    component = dataTable;
  } else if (dataGroup) component = dataGroup;
  const numberedPaginationContainer = elementSelector(component, '[data-gjs=pagination-number]');

  if (numberedPaginationContainer) {
    const showPaginationDropdown = numberedPaginationContainer.hasAttribute(
      'data-showpagepaginationdropdown',
    );
    if (showPaginationDropdown) {
      let selectElemId = numberedPaginationContainer.id + '-pageSelect';
      $(`#${selectElemId}`)
        .select2({
          selectionCssClass: ':all:',
          width: 'resolve',
        })
        .val(pageNumber === 1 ? '' : pageNumber)
        .trigger('change');
    }
  }
};

const persistDataTableNumberedPagination = (paginationData, pageNumber) => {
  const { dataTable } = paginationData ? paginationData : '';
  const numberedPaginationContainer = elementSelector(dataTable, '[data-gjs=pagination-number]');

  if (numberedPaginationContainer) {
    const persistPagination = numberedPaginationContainer.hasAttribute('data-persistpagination');
    let dtPageKey = `dtPage-${numberedPaginationContainer.id}`;

    if (persistPagination) {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');

      if (paginationData.externalApiId) {
        let pageObj = {
          pageNumber: paginationData.currentPage ? paginationData.currentPage : 1,
          offsetValue: paginationData.offsetValue ? paginationData.offsetValue : 0,
          pageOffsetValue: paginationData.pageOffsetValue ? paginationData.pageOffsetValue : 0,
        };

        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({
              ...previousActionResponse,
              [dtPageKey]: { ...pageObj },
            }),
          );
        } else {
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ [dtPageKey]: { ...pageObj } }),
          );
        }
      } else {
        if (previousActionResponse) {
          previousActionResponse = JSON.parse(previousActionResponse);
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({
              ...previousActionResponse,
              [dtPageKey]: pageNumber,
            }),
          );
        } else {
          sessionStorage.setItem(
            'previousActionResponse',
            JSON.stringify({ [dtPageKey]: pageNumber }),
          );
        }
      }
    }
  }
};

const persistDataTablePagination = (paginationData, pageNumber) => {
  const { dataTable, dataGroup, numberPerPage } = paginationData ? paginationData : '';
  let component = '';
  if (dataTable) {
    component = dataTable;
  } else if (dataGroup) component = dataGroup;
  const paginationContainer = elementSelector(component, '[data-gjs=pagination]');

  if (paginationContainer) {
    const persistPagination = paginationContainer.hasAttribute('data-persistpagination');
    let dtPageKey = `dtPage-${paginationContainer.id}`;

    if (persistPagination) {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      let pageObj = {
        sessionCurrentPage: pageNumber,
      };

      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({
            ...previousActionResponse,
            [dtPageKey]: { ...pageObj },
          }),
        );
      } else {
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ [dtPageKey]: { ...pageObj } }),
        );
      }
    }
  }
};

const persistExternalApiDataTablePagination = (paginationData) => {
  const { dataTable } = paginationData ? paginationData : '';
  const paginationContainer = elementSelector(dataTable, '[data-gjs=pagination]');

  if (paginationContainer) {
    const persistPagination = paginationContainer.hasAttribute('data-persistpagination');
    let dtPageKey = `dtPage-${paginationContainer.id}`;

    if (persistPagination) {
      let previousActionResponse = sessionStorage.getItem('previousActionResponse');
      paginationData.offsetValue += paginationData.numberPerPage;

      let pageObj = {
        pageNumber: paginationData.currentPage ? paginationData.currentPage : 1,
        offsetValue: paginationData.offsetValue ? paginationData.offsetValue : 0,
        pageOffsetValue: paginationData.pageOffsetValue ? paginationData.pageOffsetValue : 0,
      };

      if (previousActionResponse) {
        previousActionResponse = JSON.parse(previousActionResponse);
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({
            ...previousActionResponse,
            [dtPageKey]: { ...pageObj },
          }),
        );
      } else {
        sessionStorage.setItem(
          'previousActionResponse',
          JSON.stringify({ [dtPageKey]: { ...pageObj } }),
        );
      }
    }
  }
};

const getAllSelectors = () => {
  let ret = [];

  let sheets = Array.from(document.styleSheets).filter(
    (styleSheet) => !styleSheet.href || styleSheet.href.startsWith(window.location.origin),
  );

  for (let i = 0; i < sheets.length; i++) {
    let rules = sheets[i].rules || sheets[i].cssRules;
    for (let x in rules) {
      if (typeof rules[x].selectorText == 'string') ret.push(rules[x].selectorText);
    }
  }
  return ret;
};

const elementAttribute = (element, key) => {
  return element && element.hasAttribute(key) ? element.getAttribute(key) : '';
};

const renderLineChart = async (element, chartData, collectionId, finderId) => {
  element.innerHTML = '';
  element.children = [];
  const seriesDataField = elementAttribute(element, 'data-series');
  const xaxisDataField = elementAttribute(element, 'data-xaxis');
  const { constants: projectConstant, environments } = await getProjectDetail();
  let collectionConstants = [];
  if (collectionId) {
    const collectionDetails = await getCollectionDetails(collectionId);
    collectionConstants = collectionDetails?.constants || [];
  }
  let externalQueryParamKeys = elementAttribute(element, 'externalQueryParamKeys');
  if (externalQueryParamKeys) externalQueryParamKeys = externalQueryParamKeys.split(',');
  const chartHeight = chartData.chartHeight || '350';
  const yAxisMin = parseFloat(elementAttribute(element, 'data-y-axis-min')) || 0;
  const yAxisMax = parseFloat(elementAttribute(element, 'data-y-axis-max')) || undefined;
  const xAxisLabelRotate = elementAttribute(element, 'data-x-axis-label-rotate');
  const range1 = elementAttribute(element, 'data-y-axis-range1');
  const range2 = elementAttribute(element, 'data-y-axis-range2');
  const colorRange1 = elementAttribute(element, 'data-background-color-range1');
  const colorRange2 = elementAttribute(element, 'data-background-color-range2');
  const backgroundColorRange1 = convertColorForChartJs(colorRange1);
  const backgroundColorRange2 = convertColorForChartJs(colorRange2);
  const strokeCurve = chartData.strokeCurve || 'straight';
  const parsedRange1 = parseRange(range1);
  const parsedRange2 = parseRange(range2);
  const annotations = [];
  if (parsedRange1 && backgroundColorRange1) {
    annotations.push({
      type: 'box',
      yMin: parsedRange1.y,
      yMax: parsedRange1.y2,
      backgroundColor: backgroundColorRange1,
      borderWidth: 0,
    });
  }
  if (parsedRange2 && backgroundColorRange2) {
    annotations.push({
      type: 'box',
      yMin: parsedRange2.y,
      yMax: parsedRange2.y2,
      backgroundColor: backgroundColorRange2,
      borderWidth: 0,
    });
  }
  if (collectionId && finderId) {
    const { itemData } = await getItemDataForElement(element);
    let endpoint = `collection-table/${collectionId}/finder/${finderId}/items`;
    if (itemData) {
      endpoint = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        endpoint,
        itemData,
        element,
      );
    }
    endpoint = await addEntityQueryToUrl(endpoint, collectionId, finderId);
    const response = await securedGetCall(endpoint);
    if (response.data.length > 0) {
      const seriesData = [];
      const xAxisData = [];
      response.data.forEach((item) => {
        seriesData.push(
          parseValueFromData(
            item,
            seriesDataField,
            projectConstant,
            environments,
            collectionConstants,
          ),
        );
        xAxisData.push(
          parseValueFromData(
            item,
            xaxisDataField,
            projectConstant,
            environments,
            collectionConstants,
          ),
        );
      });
      const ctx = document.createElement('canvas');
      ctx.style.height = `${chartHeight}px`;
      element.appendChild(ctx);
      const chartConfig = {
        type: 'line',
        data: {
          labels: xAxisData,
          datasets: [
            {
              label: chartData.dataSeriesLabel || 'Data',
              data: seriesData,
              fill: false,
              borderColor: 'blue',
              backgroundColor: null,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: chartData.title || 'Chart',
            },
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            annotation: {
              annotations: annotations.reduce((acc, ann, index) => {
                acc[`annotation${index}`] = {
                  type: ann.type,
                  yMin: ann.yMin,
                  yMax: ann.yMax,
                  backgroundColor: ann.backgroundColor,
                  borderWidth: 0,
                };
                return acc;
              }, {}),
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: chartData.xAxisTitle || '',
              },
              ticks: {
                autoSkip: false,
                maxRotation: xAxisLabelRotate ? parseInt(xAxisLabelRotate) : 0,
                minRotation: xAxisLabelRotate ? parseInt(xAxisLabelRotate) : 0,
              },
            },
            y: {
              position: 'left',
              title: {
                display: true,
                text: chartData.yAxisTitle || '',
              },
              min: yAxisMin ? parseFloat(yAxisMin) : 0,
              max: yAxisMax ? parseFloat(yAxisMax) : undefined,
            },
          },
        },
      };
      let strokeOptions = {};
      switch (strokeCurve) {
        case 'smooth':
        case 'spline':
          strokeOptions = {
            tension: 0.4,
            stepped: false,
          };
          break;
        case 'straight':
          strokeOptions = {
            tension: 0,
            stepped: false,
          };
          break;
        case 'stepline':
          strokeOptions = {
            tension: 0,
            stepped: 'middle',
          };
          break;
        default:
          strokeOptions = {
            tension: 0.4,
            stepped: false,
          };
          break;
      }
      chartConfig.data.datasets[0] = {
        ...chartConfig.data.datasets[0],
        ...strokeOptions,
      };
      new Chart(ctx, chartConfig);
    }
  }
};

const renderAreaChart = async (element, chartData, collectionId, finderId) => {
  element.innerHTML = '';
  element.children = [];
  const seriesDataField = elementAttribute(element, 'data-series');
  const xaxisDataField = elementAttribute(element, 'data-xaxis');
  const { constants: projectConstant, environments } = await getProjectDetail();
  let collectionConstants = [];
  if (collectionId) {
    const collectionDetails = await getCollectionDetails(collectionId);
    collectionConstants = collectionDetails?.constants || [];
  }
  let externalQueryParamKeys = elementAttribute(element, 'externalQueryParamKeys');
  if (externalQueryParamKeys) externalQueryParamKeys = externalQueryParamKeys.split(',');
  const yAxisMin = parseFloat(elementAttribute(element, 'data-y-axis-min')) || 0;
  const yAxisMax = parseFloat(elementAttribute(element, 'data-y-axis-max')) || undefined;
  const xAxisLabelRotate = elementAttribute(element, 'data-x-axis-label-rotate');
  const chartHeight = chartData.chartHeight || '350';
  const range1 = elementAttribute(element, 'data-y-axis-range1');
  const range2 = elementAttribute(element, 'data-y-axis-range2');
  const colorRange1 = elementAttribute(element, 'data-background-color-range1');
  const colorRange2 = elementAttribute(element, 'data-background-color-range2');
  const backgroundColorRange1 = convertColorForChartJs(colorRange1);
  const backgroundColorRange2 = convertColorForChartJs(colorRange2);
  const strokeCurve = chartData.strokeCurve || 'straight';
  const parsedRange1 = parseRange(range1);
  const parsedRange2 = parseRange(range2);
  const annotations = [];
  if (parsedRange1 && backgroundColorRange1) {
    annotations.push({
      type: 'box',
      yMin: parsedRange1.y,
      yMax: parsedRange1.y2,
      backgroundColor: backgroundColorRange1,
      borderWidth: 0,
    });
  }
  if (parsedRange2 && backgroundColorRange2) {
    annotations.push({
      type: 'box',
      yMin: parsedRange2.y,
      yMax: parsedRange2.y2,
      backgroundColor: backgroundColorRange2,
      borderWidth: 0,
    });
  }
  if (collectionId && finderId) {
    const { itemData } = await getItemDataForElement(element);
    let endpoint = `collection-table/${collectionId}/finder/${finderId}/items`;
    if (itemData)
      endpoint = prepareItemDataAndExternalQueryParamForTable(
        externalQueryParamKeys,
        endpoint,
        itemData,
        element,
      );
    endpoint = await addEntityQueryToUrl(endpoint, collectionId, finderId);
    const response = await securedGetCall(endpoint);
    if (response.data.length > 0) {
      const seriesData = [];
      const xAxisData = [];
      response.data.map((item) => {
        seriesData.push(
          parseValueFromData(
            item,
            seriesDataField,
            projectConstant,
            environments,
            collectionConstants,
          ),
        );
        xAxisData.push(
          parseValueFromData(
            item,
            xaxisDataField,
            projectConstant,
            environments,
            collectionConstants,
          ),
        );
      });
      const ctx = document.createElement('canvas');
      ctx.style.height = `${chartHeight}px`;
      element.appendChild(ctx);
      const chartConfig = {
        type: 'line',
        data: {
          labels: xAxisData,
          datasets: [
            {
              label: chartData.dataSeriesLabel || 'Data',
              data: seriesData,
              fill: true,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.2)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: chartData.title || 'Chart',
            },
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
            annotation: {
              annotations: annotations.reduce((acc, ann, index) => {
                acc[`annotation${index}`] = {
                  type: ann.type,
                  yMin: ann.yMin,
                  yMax: ann.yMax,
                  backgroundColor: ann.backgroundColor,
                  borderWidth: 0,
                };
                return acc;
              }, {}),
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: chartData.xAxisTitle || '',
              },
              ticks: {
                autoSkip: false,
                maxRotation: xAxisLabelRotate ? parseInt(xAxisLabelRotate) : 0,
                minRotation: xAxisLabelRotate ? parseInt(xAxisLabelRotate) : 0,
              },
            },
            y: {
              position: 'right',
              title: {
                display: true,
                text: chartData.yAxisTitle || '',
              },
              min: yAxisMin ? parseFloat(yAxisMin) : 0,
              max: yAxisMax ? parseFloat(yAxisMax) : undefined,
            },
          },
        },
      };
      let strokeOptions = {};
      switch (strokeCurve) {
        case 'smooth':
        case 'spline':
          strokeOptions = {
            tension: 0.4,
            stepped: false,
          };
          break;
        case 'straight':
          strokeOptions = {
            tension: 0,
            stepped: false,
          };
          break;
        case 'stepline':
          strokeOptions = {
            tension: 0,
            stepped: 'middle',
          };
          break;
        default:
          strokeOptions = {
            tension: 0.4,
            stepped: false,
          };
          break;
      }
      chartConfig.data.datasets[0] = {
        ...chartConfig.data.datasets[0],
        ...strokeOptions,
      };
      new Chart(ctx, chartConfig);
    }
  }
};

const loadDataMapItems = async (finderId, collectionName, zoom, originalDataMap) => {
  const fieldLat = elementAttribute(originalDataMap, 'data-map-lat');
  const fieldLong = elementAttribute(originalDataMap, 'data-map-long');
  const fieldHeader = elementAttribute(originalDataMap, 'data-map-header');
  const fieldDescription = elementAttribute(originalDataMap, 'data-map-description');

  originalDataMap.innerHTML = `<div id="map-${originalDataMap.id}" class="map"></div> <style>.map{
      height:100%;width:100%;
  }</style>`;
  if (collectionName && finderId) {
    let endpoint = `collection-table/${collectionName}/finder/${finderId}/items`;
    endpoint = await addEntityQueryToUrl(endpoint, collectionName, finderId);
    const response = await securedGetCall(endpoint);

    const map = new google.maps.Map(document.getElementById(`map-${originalDataMap.id}`), {
      zoom: Number(zoom),
      center: new google.maps.LatLng(
        Number(response.data[0][fieldLat]),
        Number(response.data[0][fieldLong]),
      ),
    });

    if (response.data.length > 0) {
      addMarkerInfo(response.data, map, fieldLat, fieldLong, fieldHeader, fieldDescription);
    }
  }
};
const renderUrlColumnData = (item, column, tableColumnContentTag) => {
  let itemImageData = column ? item[column] : '';
  const previewIcon = elementAttribute(tableColumnContentTag, 'data-preview-icon');
  let imageUrl = '';
  let fileName = '';

  if (!itemImageData) {
    return `<td></td>`;
  }
  if (typeof itemImageData === 'string' && !itemImageData.startsWith('http')) {
    itemImageData = 'https://' + itemImageData;
  }
  if (typeof itemImageData === 'object') {
    imageUrl = previewIcon
      ? itemImageData[previewIcon]
      : itemImageData.isPrivate === true
        ? `https://drapcode-static.s3.amazonaws.com/img/placeholder-img.png`
        : imageServerUrl() + itemImageData.key;
    fileName = itemImageData.originalName;
  } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
    imageUrl = itemImageData;
    fileName = itemImageData;
  }
  const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
  if (innerTag && innerTag === 'IMG') {
    const newImgTag = tableColumnContentTag.cloneNode(true);
    newImgTag.src = imageUrl ? imageUrl : newImgTag.src;
    if (itemImageData.isPrivate === true) {
      addDownloadAttributeForPrivateFiles(newImgTag, itemImageData, item.uuid);
    }
    return `<td>${newImgTag.outerHTML}</td>`;
  } else if (innerTag && innerTag === 'A') {
    const anchorLink = document.createElement('a');
    if (itemImageData.isPrivate === true) {
      addDownloadAttributeForPrivateFiles(anchorLink, itemImageData, item.uuid);
    } else {
      anchorLink.href = imageUrl ? imageUrl : imageUrl;
    }
    anchorLink.innerText = fileName ? fileName : imageUrl;
    if (tableColumnContentTag) {
      const newAnchorTag = tableColumnContentTag.cloneNode(true);
      newAnchorTag.href = imageUrl ? imageUrl : imageUrl;
      if (tableColumnContentTag.classList && tableColumnContentTag.classList.contains('link-box')) {
        const childElem = tableColumnContentTag.children ? tableColumnContentTag.children[0] : '';
        const childTagName = childElem ? childElem.tagName : '';
        if (childTagName) {
          if (childTagName !== 'I') {
            if (TEXT_COMPONENTS.includes(childTagName)) {
              const newChildTag = childElem.cloneNode(true);
              newChildTag.innerText = fileName ? fileName : imageUrl;
              newAnchorTag.innerHTML = newChildTag.outerHTML;
            } else if (childTagName === 'IMG') {
              const newChildImgTag = childElem.cloneNode(true);
              newChildImgTag.src = imageUrl ? imageUrl : newChildImgTag.src;
              newAnchorTag.innerHTML = newChildImgTag.outerHTML;
            } else {
              newAnchorTag.innerText = fileName ? fileName : imageUrl;
            }
          }
        } else {
          newAnchorTag.innerText = fileName ? fileName : imageUrl;
        }
      } else {
        newAnchorTag.innerText = fileName ? fileName : imageUrl;
      }
      return `<td>${newAnchorTag.outerHTML}</td>`;
    } else {
      return `<td>${anchorLink.outerHTML}</td>`;
    }
  } else if (innerTag && TEXT_COMPONENTS.includes(innerTag)) {
    const newtextComp = tableColumnContentTag.cloneNode(true);
    newtextComp.innerText = imageUrl ? imageUrl : newtextComp.src;
    return `<td>${newtextComp.outerHTML}</td>`;
  } else {
    return `<td>${imageUrl}</td>`;
  }
};

const loadDataTableLocalStorage = async (paginationData) => {
  const { dataTable, fieldName, localStorageKey } = paginationData;
  console.log(`\n loadDataTableLocalStorage : ${localStorageKey} \n`);
  const theadElement = dataTable.querySelector('thead');
  const columnCount = theadElement.rows[0].cells.length;
  const tbodyElement = dataTable.querySelector('[data-js=table-body]');
  paginationData.tbodyElement = tbodyElement;
  await setTableMetaData(paginationData);
  hidePaginationButton(dataTable);

  await loadLocalStorageDataList(
    localStorageKey,
    fieldName,
    paginationData,
    tbodyElement,
    columnCount,
  );
};
const loadLocalStorageDataList = async (
  localStorageKey,
  fieldName,
  paginationData,
  tbodyElement,
  columnCount,
) => {
  let rows = ``;
  tbodyElement.innerHTML = rows;
  addTablePlaceholder(
    paginationData.numberPerPage || 1,
    paginationData.firstRowElements,
    tbodyElement,
  );

  let storageItem = parseLSJSONStrToJSON(localStorageKey);

  if (storageItem) {
    const storageContent = _.get(storageItem, fieldName);
    const { columnsMap, firstRowElements, tbodyElement, collectionName, dataTable } =
      paginationData;
    const tableData = storageContent;
    const theadElement = dataTable.querySelector('thead');
    const referenceColmunIndexes = [];
    [...theadElement.rows[0].cells].forEach((cell, index) => {
      if (['reference', 'belongsTo'].includes(elementAttribute(cell, 'type'))) {
        referenceColmunIndexes.push({
          fieldName: elementAttribute(cell, 'data-selected-column'),
          index,
        });
      }
    });

    rows += await createTableRecords(
      tableData,
      columnsMap,
      firstRowElements,
      collectionName,
      false,
      '',
      referenceColmunIndexes,
    );
    tbodyElement.innerHTML = rows;
  } else {
    tbodyElement.innerHTML = `<tr class="no-record-data-table"><td class="text-center" colspan="${columnCount}"></td></tr>`;
  }
};

const loadDataTableFromBrowserSession = async (collectionName, paginationData) => {
  const { browserSessionDataPath, dataTable } = paginationData;
  paginationData.loadFromBrowserSession = true;

  if (browserSessionDataPath) {
    const theadElement = dataTable.querySelector('thead');
    const columnCount = theadElement.rows[0].cells.length;
    const tbodyElement = dataTable.querySelector('[data-js=table-body]');
    paginationData.tbodyElement = tbodyElement;
    await setTableMetaData(paginationData);
    hidePaginationButton(dataTable);

    await loadBrowserSessionDataList(
      browserSessionDataPath,
      paginationData,
      tbodyElement,
      columnCount,
    );
  } else {
    toastr.error('Data Path is required!', 'Error');
  }

  /* Set the style */
  for (let [key, value] of dataTableStylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);
    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
};
const loadBrowserSessionDataList = async (
  browserSessionDataPath,
  paginationData,
  tbodyElement,
  columnCount,
) => {
  //Handling DataTable Placeholder
  let rows = ``;
  tbodyElement.innerHTML = rows;
  addTablePlaceholder(
    paginationData.numberPerPage || 1,
    paginationData.firstRowElements,
    tbodyElement,
  );

  const sessionStorage = window.sessionStorage;
  const sessionPreviousActionResponse = sessionStorage.getItem('previousActionResponse');
  const sessionResponseData = sessionPreviousActionResponse
    ? JSON.parse(sessionPreviousActionResponse)
    : '';

  if (sessionResponseData && sessionResponseData !== 'undefined') {
    const sessionContent = getContentFromSessionObject(sessionResponseData, browserSessionDataPath);
    const { columnsMap, firstRowElements, tbodyElement, collectionName, dataTable } =
      paginationData;
    const tableData = sessionContent;
    const theadElement = dataTable.querySelector('thead');
    const referenceColmunIndexes = [];
    [...theadElement.rows[0].cells].forEach((cell, index) => {
      if (['reference', 'belongsTo'].includes(elementAttribute(cell, 'type'))) {
        referenceColmunIndexes.push({
          fieldName: elementAttribute(cell, 'data-selected-column'),
          index,
        });
      }
    });

    rows += await createTableRecords(
      tableData,
      columnsMap,
      firstRowElements,
      collectionName,
      false,
      '',
      referenceColmunIndexes,
    );
    tbodyElement.innerHTML = rows;
  } else {
    tbodyElement.innerHTML = `<tr class="no-record-data-table"><td class="text-center" colspan="${columnCount}"></td></tr>`;
  }
};

const processDataForPersistentPagination = (paginationData, isPaginate, data) => {
  const { externalApiPersistentPagination } = paginationData ? paginationData : '';
  if (!isPaginate && externalApiPersistentPagination) {
    const { offsetValue, pageOffsetValue } = externalApiPersistentPagination;

    if (data.externalApiItem) {
      data.externalApiItem['recordsOffset'] = {
        offsetValue: offsetValue ? offsetValue : 0,
      };
      data.externalApiItem['pageOffset'] = {
        pageOffsetKey: paginationData.pageOffsetKey ? paginationData.pageOffsetKey : '',
        pageOffsetValue: pageOffsetValue ? pageOffsetValue : 0,
      };
    } else {
      data['externalApiItem'] = {
        recordsOffset: {
          offsetValue: offsetValue ? offsetValue : 0,
        },
        pageOffset: {
          pageOffsetValue: pageOffsetValue ? pageOffsetValue : 0,
        },
      };
    }
  }
};

const loadUserTenantDropdown = (tenantComponent, tenantReferenceField) => {
  if (tenantComponent) {
    const switchEvent = tenantComponent.attributes['data-tenant-action'];
    const onClickEvent = switchEvent ? switchEvent.value : null;
    tenantComponent.removeAttribute('data-tenant-action');
    const tenantDropdownElem = tenantComponent.querySelector('ul.dropdown-menu');
    const tenantLinkElem = tenantDropdownElem
      ? tenantDropdownElem.querySelector('a.dropdown-item')
      : '';
    tenantDropdownElem.innerHTML = '';
    if (isLoggedInUser()) {
      const currentUser = fetchLoggedInUserJson();
      const currentTenant = fetchCurrentTenantJson();
      if (currentUser.tenantId && currentUser.tenantId.length) {
        currentUser.tenantId.forEach((tenantObj, index) => {
          const newHtml = tenantLinkElem.cloneNode(true);
          newHtml.text = tenantReferenceField ? tenantObj[tenantReferenceField] : tenantObj.uuid;
          newHtml.setAttribute('id', `${tenantLinkElem.id}${index + 1}`);
          newHtml.setAttribute('data-tenant-id', tenantObj.uuid);
          newHtml.setAttribute('onclick', onClickEvent);
          if (tenantObj?.uuid === currentTenant?.uuid) {
            newHtml.classList.add('active');
          }
          tenantDropdownElem.appendChild(newHtml);
        });
      } else {
        addNoneOptionToDropdown(tenantLinkElem, tenantDropdownElem, onClickEvent, true, false);
      }
    } else {
      addNoneOptionToDropdown(tenantLinkElem, tenantDropdownElem, onClickEvent, true, false);
    }
  }
};

const loadCalendarComponent = async (calendarComp, calendarDataObj) => {
  const { collectionName, finderId, searchComponent, externalQueryParamKeys } =
    calendarDataObj || '';
  let { calendarChildren } = calendarDataObj || '';

  if (!calendarChildren) {
    calendarChildren = calendarComp.children;
  }

  const searchCompIndex = findComponentIndex(calendarChildren, 'search-form');
  let calendarPlaceholderIndex = findComponentIndex(calendarChildren, 'calendar-placeholder');

  /**
   * Identify calendarPlaceholderIndex in Calendar component
   */
  if (!calendarPlaceholderIndex || calendarPlaceholderIndex < 0) {
    if (searchComponent) {
      calendarPlaceholderIndex = searchCompIndex ? 0 : 1;
    } else {
      calendarPlaceholderIndex = 0;
    }
  }

  const calendarCompId = calendarComp.id;
  const calendarCompElemId = `calendar-${calendarCompId}`;
  const calendarCompElm = calendarComp.children[calendarPlaceholderIndex];
  calendarCompElm.setAttribute('id', `${calendarCompElemId}`);
  const componentDataSet = calendarComp.dataset;
  let onClickEvent = '';
  let eventTitleField = '';
  let eventStartTimeField = '';
  let eventDateField = '';
  let eventEndTimeField = '';
  let eventUrlField = '';
  let eventDurationFieldVal = '';
  let eventDurationVal = '';
  let calendarDefaultView = '';
  let eventTextColorField = '';
  let eventBgColorField = '';
  let eventBorderColorField = '';
  if (componentDataSet) {
    onClickEvent = componentDataSet['onclick'] ?? '';
    eventTitleField = componentDataSet['eventTitle'] ?? '';
    eventDateField = componentDataSet['eventDate'] ?? '';
    eventStartTimeField = componentDataSet['eventStarttime'] ?? '';
    eventEndTimeField = componentDataSet['eventEndtime'] ?? '';
    eventUrlField = componentDataSet['eventUrl'] ?? '';
    eventDurationFieldVal = componentDataSet['eventDuration'] ?? '';
    calendarDefaultView = componentDataSet['calendarView'] ?? '';
    eventTextColorField = componentDataSet['eventTextColor'] ?? '';
    eventBgColorField = componentDataSet['eventBgColor'] ?? '';
    eventBorderColorField = componentDataSet['eventBorderColor'] ?? '';
  }
  switch (eventDurationFieldVal) {
    case '15_MINS':
      eventDurationVal = '00:15';
      break;
    case '30_MINS':
      eventDurationVal = '00:30';
      break;
    case '60_MINS':
      eventDurationVal = '01:00';
      break;
    default:
      break;
  }

  /**
   * Remove Calander Placeholder element from Calendar
   */
  if (calendarComp.children[calendarPlaceholderIndex]) {
    calendarComp.children[calendarPlaceholderIndex].remove();
  }

  const { itemData } = await getItemDataForElement(calendarComp);
  if (finderId) {
    if (collectionName && finderId) {
      let collectionItemEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count`;
      console.log(
        '🚀 ~ loadCalendarComponent ~ collectionItemEndpoint #1:',
        collectionItemEndpoint,
      );

      collectionItemEndpoint = prepareItemDataAndExternalQueryParam(
        externalQueryParamKeys,
        collectionItemEndpoint,
        itemData,
        calendarComp,
      );
      console.log(
        '🚀 ~ loadCalendarComponent ~ collectionItemEndpoint #2:',
        collectionItemEndpoint,
      );

      const response = await securedGetCall(collectionItemEndpoint);
      console.log('🚀 ~ loadCalendarComponent ~ response:', response);
    }
  }

  let initialCalendarView = 'dayGridMonth';
  if (calendarDefaultView) {
    initialCalendarView = calendarDefaultView;
  }

  const calendarEl = document.getElementById(calendarCompId);

  let isFullCalendarScriptExist = false;
  try {
    new FullCalendar.Calendar(calendarEl, {});
    isFullCalendarScriptExist = true;
  } catch (error) {
    console.error('🚀 ~ loadCalendarComponent ~ error:', error);
  }

  const eventFields = {
    eventTitleField,
    eventStartTimeField,
    eventEndTimeField,
    eventUrlField,
    onClickEvent,
    eventDateField,
    eventTextColorField,
    eventBgColorField,
    eventBorderColorField,
  };

  console.log('🚀 ~ loadCalendarComponent ~ isFullCalendarScriptExist:', isFullCalendarScriptExist);
  if (isFullCalendarScriptExist) {
    loadCalendarComponentInDOM(
      calendarEl,
      calendarDataObj,
      initialCalendarView,
      eventDurationVal,
      collectionName,
      finderId,
      eventFields,
      externalQueryParamKeys,
      itemData,
    );
    /**
     * Append Search Form Component in Calender
     */
    if (searchComponent) {
      if (searchCompIndex > 0) {
        calendarEl.insertBefore(searchComponent, null);
      } else {
        calendarEl.insertBefore(searchComponent, calendarEl.children[0]);
      }
    }
  }
};

function loadCalendarComponentInDOM(
  calendarEl,
  calendarDataObj,
  initialCalendarView,
  eventDurationVal,
  collectionName,
  finderId,
  eventFields,
  externalQueryParamKeys,
  itemData,
) {
  const { onClickEvent } = eventFields || {};
  const { searchComponent } = calendarDataObj || '';
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: initialCalendarView,
    slotDuration: eventDurationVal || '00:15',
    overlap: true,
    interactive: true,
    events: async function (fetchInfo, successCallback, failureCallback) {
      const calendarEvents = await loadCalendarEvents(
        fetchInfo,
        calendarDataObj,
        collectionName,
        finderId,
        eventFields,
        externalQueryParamKeys,
        itemData,
      );
      console.log('🚀 ~ file: dataLoader.js:6324 ~ calendarEvents:', calendarEvents);
      if (!calendarEvents) {
        failureCallback('No events!');
      } else {
        successCallback(calendarEvents);
      }
    },
    eventDisplay: 'block',
    dayMaxEvents: true, // when too many events in a day, show the popover
    navLinks: true,
    customButtons: {
      customSearch: {
        text: 'Search',
        // icon: 'fa fa-search',
        click: function () {
          console.log('🚀 ~ loadCalendarComponent ~ clicked customSearch...');
          calendar.refetchEvents();
        },
      },
    },
    headerToolbar: {
      left: `prev,next ${searchComponent ? 'customSearch ' : ''}today`,
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    eventTimeFormat: {
      // List views. '7:00pm'
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
    },
    viewDidMount: function (info) {
      if (searchComponent) {
        calendarEl.querySelectorAll('.fc-button').forEach((button) => {
          if (button.innerText === 'Search') {
            button.classList.add('d-none');
            button.setAttribute('style', 'display:none');
          }
        });
      }
    },
    eventDidMount: function (info) {
      const { backgroundColor, borderColor } = info || '';
      let styles = '';
      if (backgroundColor) {
        styles += `background-color:${backgroundColor};`;
      }
      if (borderColor) {
        styles += `border-color:${borderColor};`;
      }
      if (collectionName && info.event.id) {
        info.el.setAttribute('data-collection-id', collectionName);
        info.el.setAttribute('data-item-id', info.event.id);
      }
      if (onClickEvent) {
        styles += `cursor:pointer;`;
        info.el.setAttribute(
          'title',
          `Click to view ${info.event.title ? info.event.title : ''} details`,
        );
        info.el.setAttribute('style', styles);
      } else if (info.event.title) {
        info.el.setAttribute('title', info.event.title);
        if (styles) {
          info.el.setAttribute('style', styles);
        }
      }
    },
    eventClick: function (info) {
      if (onClickEvent) {
        info.jsEvent.preventDefault();
        const dynamicFunction = new Function(`return ${onClickEvent}`);
        dynamicFunction();
      }
    },
  });
  calendar.render();
}

async function loadCalendarEvents(
  fetchInfo,
  calendarDataObj,
  collectionName,
  finderId,
  eventFields,
  externalQueryParamKeys,
  itemData,
) {
  const {
    eventTitleField,
    eventStartTimeField,
    eventEndTimeField,
    eventUrlField,
    eventDateField,
    eventTextColorField,
    eventBgColorField,
    eventBorderColorField,
  } = eventFields || {};
  let calendarEvents = [];
  let calendarItems = [];
  const { searchComponent, event, originalCalendar } = calendarDataObj || '';
  const { submitter } = event || null;
  appendLoaderToElement(submitter);

  if (collectionName && finderId) {
    let collectionItemEndpoint = `collection-table/${collectionName}/finder/${finderId}/items`;

    console.log('🚀 ~ loadCalendarEvents endpoint #1:', collectionItemEndpoint);

    collectionItemEndpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      collectionItemEndpoint,
      itemData,
      originalCalendar,
    );

    console.log('🚀 ~ loadCalendarEvents endpoint #2:', collectionItemEndpoint);
    const checkItContainsParam = collectionItemEndpoint.includes('?');
    console.log('🚀 ~ loadCalendarEvents hasParam:', checkItContainsParam);
    const dateFormat = document.getElementById('dateTimeFormat').innerText || 'YYYY-MM-DD';
    console.log('🚀 ~ loadCalendarEvents ~ dateFormat:', dateFormat);
    const dateTimeFormat = `${dateFormat}THH:mm:ss`;
    console.log('🚀 ~ loadCalendarEvents ~ dateTimeFormat:', dateTimeFormat);

    const { start, end } = fetchInfo;
    let startOfMonth = moment(start).format(dateFormat);
    let endOfMonth = moment(end).format(dateFormat);
    if (eventDateField) {
      if (startOfMonth) {
        if (checkItContainsParam) {
          collectionItemEndpoint += `&start_${eventDateField}=${startOfMonth}`;
        } else {
          collectionItemEndpoint += `?start_${eventDateField}=${startOfMonth}`;
        }
      }
      if (endOfMonth) {
        collectionItemEndpoint += `&end_${eventDateField}=${endOfMonth}`;
      }
    } else {
      if (eventStartTimeField && startOfMonth) {
        if (checkItContainsParam) {
          collectionItemEndpoint += `&start_${eventStartTimeField}=${startOfMonth}`;
        } else {
          collectionItemEndpoint += `?start_${eventStartTimeField}=${startOfMonth}`;
        }
      }
      if (eventStartTimeField && endOfMonth) {
        if (eventEndTimeField) {
          collectionItemEndpoint += `&end_${eventEndTimeField}=${endOfMonth}`;
        } else {
          collectionItemEndpoint += `&end_${eventStartTimeField}=${endOfMonth}`;
        }
      }
    }

    if (searchComponent) {
      calendarDataObj.searchString = convertQueryStringFromFormElements(searchComponent);
      console.log('🚀 ~ loadCalendarEvents calendarDataObj:', calendarDataObj);

      if (calendarDataObj.searchString) {
        collectionItemEndpoint += `&${calendarDataObj.searchString}`;
      }
    }
    collectionItemEndpoint = await addEntityQueryToUrl(
      collectionItemEndpoint,
      collectionName,
      finderId,
    );
    console.log('🚀 ~ loadCalendarEvents endpoint #3:', collectionItemEndpoint);
    const response = await securedGetCall(collectionItemEndpoint);
    if (response && response.status === 200) {
      calendarItems = response.data;
    }
    calendarItems &&
      calendarItems.map((calendarItem) => {
        let calEventObj = {};
        calEventObj['id'] = calendarItem['uuid'];

        if (eventTitleField) {
          if (eventTitleField.includes('"') && 'functionType' in JSON.parse(eventTitleField)) {
            calEventObj['title'] = getDerivedFieldData(eventTitleField, calendarItem);
          } else {
            calEventObj['title'] = calendarItem[eventTitleField] || '';
          }
        }
        if (eventDateField && calendarItem[eventDateField]) {
          calEventObj['start'] = calendarItem[eventDateField];
          calEventObj['end'] = calendarItem[eventDateField];
          if (
            calEventObj['start'] &&
            !calEventObj['start'].includes('T') &&
            eventStartTimeField &&
            calendarItem[eventStartTimeField]
          ) {
            const startTimeValue = calendarItem[eventStartTimeField];
            if (startTimeValue && startTimeValue.includes('T')) {
              const startTimeFull = startTimeValue.split('T');
              calEventObj['start'] = `${calEventObj['start']}T${startTimeFull[1]}`;
            } else if (startTimeValue && startTimeValue.includes(':')) {
              calEventObj['start'] = `${calEventObj['start']}T${startTimeValue}`;
            }
          }
          if (
            calEventObj['end'] &&
            !calEventObj['end'].includes('T') &&
            eventEndTimeField &&
            calendarItem[eventEndTimeField]
          ) {
            const endTimeValue = calendarItem[eventEndTimeField];
            if (endTimeValue && endTimeValue.includes('T')) {
              const endTimeFull = endTimeValue.split('T');
              calEventObj['end'] = `${calEventObj['end']}T${endTimeFull[1]}`;
            } else if (endTimeValue && endTimeValue.includes(':')) {
              calEventObj['end'] = `${calEventObj['end']}T${endTimeValue}`;
            }
          }
        } else {
          if (eventStartTimeField && calendarItem[eventStartTimeField]) {
            calEventObj['start'] = calendarItem[eventStartTimeField];
          }
          if (eventEndTimeField && calendarItem[eventEndTimeField]) {
            calEventObj['end'] = calendarItem[eventEndTimeField];
          }
        }
        if (eventUrlField && calendarItem[eventUrlField]) {
          calEventObj['url'] = calendarItem[eventUrlField];
        }

        // Convert date to timestamp
        convertStartEndDateToTimestamp(calEventObj);

        if (eventTextColorField) {
          if (
            eventTextColorField.includes('"') &&
            'functionType' in JSON.parse(eventTextColorField)
          ) {
            calEventObj['textColor'] = getDerivedFieldData(eventTextColorField, calendarItem);
          } else {
            calEventObj['textColor'] = calendarItem[eventTextColorField] || '';
          }
        }
        if (eventBgColorField) {
          if (eventBgColorField.includes('"') && 'functionType' in JSON.parse(eventBgColorField)) {
            calEventObj['backgroundColor'] = getDerivedFieldData(eventBgColorField, calendarItem);
          } else {
            calEventObj['backgroundColor'] = calendarItem[eventBgColorField] || '';
          }
        }
        if (eventBorderColorField) {
          if (
            eventBorderColorField.includes('"') &&
            'functionType' in JSON.parse(eventBorderColorField)
          ) {
            calEventObj['borderColor'] = getDerivedFieldData(eventBorderColorField, calendarItem);
          } else {
            calEventObj['borderColor'] = calendarItem[eventBorderColorField] || '';
          }
        }
        calendarEvents.push(calEventObj);
      });
  }
  removeLoaderFromElement(submitter, 'Calendar Search');
  return calendarEvents;
}

function convertStartEndDateToTimestamp(calEventObj) {
  const defaultDateFormat = 'YYYY-MM-DD';
  const defaultDateTimeFormat = `${defaultDateFormat}THH:mm:ss`;
  let startDate = null;
  let endDate = null;
  let startTimestamp = null;
  let endTimestamp = null;
  if (calEventObj['start']) {
    if (calEventObj['start'].includes('T')) {
      startDate = convertToNativeDate(calEventObj['start'], defaultDateTimeFormat);
      startTimestamp = convertToTimestamp(startDate);
      calEventObj['start'] = startTimestamp;
    } else {
      startDate = convertToNativeDate(calEventObj['start'], defaultDateFormat);
      startTimestamp = convertToTimestamp(startDate);
      calEventObj['start'] = startTimestamp;
    }
  }
  if (calEventObj['end']) {
    if (calEventObj['end'].includes('T')) {
      endDate = convertToNativeDate(calEventObj['end'], defaultDateTimeFormat);
      endTimestamp = convertToTimestamp(endDate);
      calEventObj['end'] = endTimestamp;
    } else {
      endDate = convertToNativeDate(calEventObj['end'], defaultDateFormat);
      endTimestamp = convertToTimestamp(endDate);
      calEventObj['end'] = endTimestamp;
    }
  }
}

async function searchInCalendar(calendarDataObj) {
  if (typeof calendarDataObj.event !== 'undefined') {
    const { target } = calendarDataObj.event;
    calendarDataObj.searchString = convertQueryStringFromFormElements(target);
  }
  const { searchComponent } = calendarDataObj;
  let calendarComp = '';
  if (searchComponent) {
    calendarComp = searchComponent.closest('[data-js="calendar"]');
  }
  if (calendarComp) {
    const customCalendarSearchBtn = calendarComp.querySelector('.fc-customSearch-button');
    if (customCalendarSearchBtn) {
      customCalendarSearchBtn.click();
    }
  }
}

const autoSearchInCalendarDataSearch = (enableAutoSearch, search) => {
  console.log('🚀 ~ autoSearchInCalendarDataSearch ~ search:', search);
  console.log('🚀 ~ autoSearchInCalendarDataSearch ~ enableAutoSearch:', enableAutoSearch);
  if (enableAutoSearch) {
    let searchFormSubmitBtn = search.querySelector('[type=submit]:not([value="export"]');
    console.log('🚀 ~ autoSearchInCalendarDataSearch ~ searchFormSubmitBtn:', searchFormSubmitBtn);

    //Fallback search button
    if (!searchFormSubmitBtn) {
      let newSearchBtnElem = document.createElement('button');
      newSearchBtnElem.role = 'button';
      newSearchBtnElem.type = 'submit';
      newSearchBtnElem.style.cssText +=
        'height:1px !important;width: 1px !important;overflow: hidden !important;padding: 0 !important;position: absolute !important;border: 0 !important';
      search.appendChild(newSearchBtnElem);
      searchFormSubmitBtn = newSearchBtnElem;
    }

    const allowedElementTags = ['INPUT', 'SELECT', 'DIV'];
    const restrictedKeyCodes = [16, 17, 18, 33, 34, 35, 36, 37, 38, 39, 40, 224, 229];

    console.log('🚀 ~ autoSearchInCalendarDataSearch ~ searchFormSubmitBtn:', searchFormSubmitBtn);
    if (searchFormSubmitBtn) {
      if (search.childNodes.length > 0) {
        search.childNodes.forEach((searchChildNode) => {
          console.log(
            '🚀 ~ autoSearchInCalendarDataSearch ~ search.childNodes.forEach ~ searchChildNode:',
            searchChildNode,
          );
          let searchChildNodeTag = searchChildNode.tagName;
          let selectElemId = searchChildNode.id;
          if (allowedElementTags.includes(searchChildNodeTag)) {
            if (searchChildNodeTag === 'INPUT') {
              const isModalParent = !!findModalParent(search);
              if (isModalParent) {
                checkForDateType('[id^=modal-container]');
                checkForDateType('[data-subpage-id]');
              }
              const isFlatpickerDataElem = searchChildNode.hasAttribute('flat-picker-date-type');

              if (isFlatpickerDataElem) {
                searchChildNode.addEventListener('change', function (event) {
                  event.preventDefault();
                  if (searchFormSubmitBtn) {
                    searchFormSubmitBtn.click();
                  }
                  searchChildNode.blur();
                });
              } else {
                searchChildNode.addEventListener('keyup', function (event) {
                  event.preventDefault();
                  if (event.isComposing || restrictedKeyCodes.includes(event.keyCode)) {
                    return;
                  }
                  if (searchFormSubmitBtn) {
                    searchFormSubmitBtn.click();
                  }
                });
              }
            }
            if (searchChildNodeTag === 'SELECT' && selectElemId) {
              $(`#${selectElemId}`).on('select2:select', function (event) {
                event.preventDefault();
                if (searchFormSubmitBtn) {
                  searchFormSubmitBtn.click();
                }
              });
            }
            if (searchChildNodeTag === 'DIV') {
              const searchFormTelElem = searchChildNode.querySelector(
                '[class*=iti--allow-dropdown] input[type=tel]',
              );
              if (searchFormTelElem) {
                searchChildNode.addEventListener('keyup', function (event) {
                  event.preventDefault();
                  if (event.isComposing || restrictedKeyCodes.includes(event.keyCode)) {
                    return;
                  }
                  if (searchFormSubmitBtn) {
                    searchFormSubmitBtn.click();
                  }
                });
              }
            }
          }
        });
      }
    }
  }
};

//TODO: Ali -> Need to refactor
const loadTimeslotComponent = async (timeslotComp, timeslotDataObj) => {
  console.log(
    '🚀 ~ file: dataLoader.js:6251 ~ loadTimeslotComponent ~ timeslotComp:',
    timeslotComp,
  );
  console.log(
    '🚀 ~ file: dataLoader.js:6251 ~ loadTimeslotComponent ~ timeslotDataObj:',
    timeslotDataObj,
  );
  const DEFAULT_DAY_START_AT = 10;
  const DEFAULT_DAY_END_AT = 22;
  const timeslotCompId = timeslotComp.id;
  const timeslotCompElemId = `timeslot-${timeslotCompId}`;
  const timeslotCompColElemId = `timeslot-col-${timeslotCompId}`;
  const timeslotCompElm = timeslotComp.children[0];
  timeslotCompElm.setAttribute('id', `${timeslotCompElemId}`);

  const collectionFormElem = timeslotComp.closest('form');
  const componentDataSet = timeslotComp.dataset;
  let eventStartTimeField = '';
  let eventEndTimeField = '';
  let eventDurationFieldVal = '';
  let eventDurationVal = '';
  let dayStartAtVal = '';
  let dayEndAtVal = '';
  let overlapSlots = false;

  const sessionStorage = window.sessionStorage;
  const sessionPreviousActionResponse = sessionStorage.getItem(SESSION_RESPONSE_KEY);
  const sessionPreviousActionForm = sessionStorage.getItem(SESSION_FORM_DATA_KEY);
  const sessionResponseActionData = sessionPreviousActionResponse
    ? JSON.parse(sessionPreviousActionResponse)
    : '';
  const sessionResponseFormData = sessionPreviousActionForm
    ? JSON.parse(sessionPreviousActionForm)
    : '';

  const { collectionName, finderId, timeSlotMetaFieldFrom } = timeslotDataObj || '';

  if (componentDataSet) {
    eventStartTimeField = componentDataSet['eventStarttime'] ?? '';
    eventEndTimeField = componentDataSet['eventEndtime'] ?? '';
    eventDurationFieldVal = componentDataSet['eventDuration'] ?? '';
    overlapSlots = componentDataSet.hasOwnProperty('overlapSlots');
  }

  switch (timeSlotMetaFieldFrom) {
    case 'sessionUser':
      let sessionUserStartField = '';
      let sessionUserEndField = '';
      if (componentDataSet) {
        sessionUserStartField = componentDataSet['sessionUserStart'] ?? '';
        sessionUserEndField = componentDataSet['sessionUserEnd'] ?? '';
      }
      if (isLoggedInUser()) {
        const loggedInUser = fetchLoggedInUserJson();
        let sessionUserStartFieldValue = _.get(loggedInUser, sessionUserStartField);
        let sessionUserEndFieldValue = _.get(loggedInUser, sessionUserEndField);
        dayStartAtVal = sessionUserStartFieldValue
          ? Number(sessionUserStartFieldValue)
          : DEFAULT_DAY_START_AT;
        dayEndAtVal = sessionUserEndFieldValue
          ? Number(sessionUserEndFieldValue)
          : DEFAULT_DAY_END_AT;
      }
      break;
    case 'sessionTenant':
      let sessionTenantStartField = '';
      let sessionTenantEndField = '';
      if (componentDataSet) {
        sessionTenantStartField = componentDataSet['sessionTenantStart'] ?? '';
        sessionTenantEndField = componentDataSet['sessionTenantEnd'] ?? '';
      }
      if (isLoggedInUser()) {
        const currentTenant = fetchCurrentTenantJson();
        let sessionTenantStartFieldValue = _.get(currentTenant, sessionTenantStartField);
        let sessionTenantEndFieldValue = _.get(currentTenant, sessionTenantEndField);
        dayStartAtVal = sessionTenantStartFieldValue
          ? Number(sessionTenantStartFieldValue)
          : DEFAULT_DAY_START_AT;
        dayEndAtVal = sessionTenantEndFieldValue
          ? Number(sessionTenantEndFieldValue)
          : DEFAULT_DAY_END_AT;
      }
      break;
    case 'sessionUserSettings':
      let sessionUserSettingsStartField = '';
      let sessionUserSettingsEndField = '';
      if (componentDataSet) {
        sessionUserSettingsStartField = componentDataSet['sessionUserSettingsStart'] ?? '';
        sessionUserSettingsEndField = componentDataSet['sessionUserSettingsEnd'] ?? '';
      }
      if (isLoggedInUser()) {
        const currentUserSettings = fetchCurrentUserSettingsJson();
        let sessionUserSettingsStartFieldValue = _.get(
          currentUserSettings,
          sessionUserSettingsStartField,
        );
        let sessionUserSettingsEndFieldValue = _.get(
          currentUserSettings,
          sessionUserSettingsEndField,
        );
        dayStartAtVal = sessionUserSettingsStartFieldValue
          ? Number(sessionUserSettingsStartFieldValue)
          : DEFAULT_DAY_START_AT;
        dayEndAtVal = sessionUserSettingsEndFieldValue
          ? Number(sessionUserSettingsEndFieldValue)
          : DEFAULT_DAY_END_AT;
      }
      break;
    case 'sessionSubTenant':
      let sessionSubTenantStartField = '';
      let sessionSubTenantEndField = '';
      if (componentDataSet) {
        sessionSubTenantStartField = componentDataSet['sessionSubTenantStart'] ?? '';
        sessionSubTenantEndField = componentDataSet['sessionSubTenantEnd'] ?? '';
      }
      if (isLoggedInUser()) {
        const currentSubTenant = fetchCurrentSubTenantJson();
        let sessionSubTenantStartFieldValue = _.get(currentSubTenant, sessionSubTenantStartField);
        let sessionSubTenantEndFieldValue = _.get(currentSubTenant, sessionSubTenantEndField);
        dayStartAtVal = sessionSubTenantStartFieldValue
          ? Number(sessionSubTenantStartFieldValue)
          : DEFAULT_DAY_START_AT;
        dayEndAtVal = sessionSubTenantEndFieldValue
          ? Number(sessionSubTenantEndFieldValue)
          : DEFAULT_DAY_END_AT;
      }
      break;
    case 'collection':
      let pageCollectionStartField = '';
      let pageCollectionEndField = '';
      if (componentDataSet) {
        pageCollectionStartField = componentDataSet['collectionFieldStart'] ?? '';
        pageCollectionEndField = componentDataSet['collectionFieldEnd'] ?? '';
      }

      let { itemData } = await getPageItemData();
      let pageCollectionStartFieldValue = _.get(itemData, pageCollectionStartField);
      let pageCollectionEndFieldValue = _.get(itemData, pageCollectionEndField);
      dayStartAtVal = pageCollectionStartFieldValue
        ? Number(pageCollectionStartFieldValue)
        : DEFAULT_DAY_START_AT;
      dayEndAtVal = pageCollectionEndFieldValue
        ? Number(pageCollectionEndFieldValue)
        : DEFAULT_DAY_END_AT;
      break;
    case 'previousActionResponse':
      let previousActionStartField = '';
      let previousActionEndField = '';
      if (componentDataSet) {
        previousActionStartField = componentDataSet['previousActionResponseStart'] ?? '';
        previousActionEndField = componentDataSet['previousActionResponseEnd'] ?? '';
      }

      if (sessionResponseActionData && sessionResponseActionData !== 'undefined') {
        let previousActionStartFieldValue = getContentFromSessionObject(
          sessionResponseActionData,
          previousActionStartField,
        );
        let previousActionEndFieldValue = getContentFromSessionObject(
          sessionResponseActionData,
          previousActionEndField,
        );
        dayStartAtVal = previousActionStartFieldValue
          ? Number(previousActionStartFieldValue)
          : DEFAULT_DAY_START_AT;
        dayEndAtVal = previousActionEndFieldValue
          ? Number(previousActionEndFieldValue)
          : DEFAULT_DAY_END_AT;
      }
      break;
    case 'previousActionFormData':
      let previousActionFormStartField = '';
      let previousActionFormEndField = '';
      if (componentDataSet) {
        previousActionFormStartField = componentDataSet['previousActionFormdataStart'] ?? '';
        previousActionFormEndField = componentDataSet['previousActionFormdataEnd'] ?? '';
      }

      if (sessionResponseFormData && sessionResponseFormData !== 'undefined') {
        let previousActionFormStartFieldValue = getContentFromSessionObject(
          sessionResponseFormData,
          previousActionFormStartField,
        );
        let previousActionFormEndFieldValue = getContentFromSessionObject(
          sessionResponseFormData,
          previousActionFormEndField,
        );
        dayStartAtVal = previousActionFormStartFieldValue
          ? Number(previousActionFormStartFieldValue)
          : DEFAULT_DAY_START_AT;
        dayEndAtVal = previousActionFormEndFieldValue
          ? Number(previousActionFormEndFieldValue)
          : DEFAULT_DAY_END_AT;
      }
      break;
    case 'browserStorage':
      let browserStorageKey = '';
      let browserStorageStartField = '';
      let browserStorageEndField = '';
      if (componentDataSet) {
        browserStorageKey = componentDataSet['storageKey'] ?? '';
        browserStorageStartField = componentDataSet['browserStorageStart'] ?? '';
        browserStorageEndField = componentDataSet['browserStorageEnd'] ?? '';
      }

      let browserStorageData = parseLSJSONStrToJSON(browserStorageKey);
      let browserStorageStartFieldValue = browserStorageData
        ? parseValueFromData(browserStorageData, browserStorageStartField)
        : '';
      let browserStorageEndFieldValue = browserStorageData
        ? parseValueFromData(browserStorageData, browserStorageEndField)
        : '';
      dayStartAtVal = browserStorageStartFieldValue
        ? Number(browserStorageStartFieldValue)
        : DEFAULT_DAY_START_AT;
      dayEndAtVal = browserStorageEndFieldValue
        ? Number(browserStorageEndFieldValue)
        : DEFAULT_DAY_END_AT;
      break;
    default:
      dayStartAtVal =
        componentDataSet && componentDataSet['fixedDayStartAt']
          ? Number(componentDataSet['fixedDayStartAt'])
          : DEFAULT_DAY_START_AT;
      dayEndAtVal =
        componentDataSet && componentDataSet['fixedDayEndAt']
          ? Number(componentDataSet['fixedDayEndAt'])
          : DEFAULT_DAY_END_AT;
      break;
  }

  switch (eventDurationFieldVal) {
    case '15_MINS':
      eventDurationVal = '00:15';
      break;
    case '30_MINS':
      eventDurationVal = '00:30';
      break;
    case '60_MINS':
      eventDurationVal = '01:00';
      break;
    default:
      break;
  }

  const columnElem = document.createElement('div');
  columnElem.id = timeslotCompColElemId;
  columnElem.classList.add('w-75', 'p-0');
  timeslotComp.innerHTML = '';
  timeslotComp.appendChild(columnElem);
  let collectionItemEndpoint = '';
  if (finderId) {
    if (collectionName && finderId) {
      collectionItemEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count`;
      const response = await securedGetCall(collectionItemEndpoint);
      console.log('🚀 ~ file: dataLoader.js:6201 ~ loadTimeslotComponent ~ response:', response);
    }
  }
  const currentDate = createLoggerDateFormat();
  const calendarEl = document.getElementById(timeslotCompColElemId);
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    slotDuration: eventDurationVal || '00:15',
    timezone: 'local',
    overlap: overlapSlots,
    interactive: true,
    events: [],
    eventDisplay: 'block',
    dayMaxEvents: true, // when too many events in a day, show the popover
    nowIndicator: true,
    selectable: true,
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today',
    },
    unselectAuto: false,
    unselectCancel: '.timeslot-link',
    validRange: {
      start: currentDate,
    },
    select: async function (selectionInfo) {
      let calendarEvents = [];
      if (finderId) {
        let calendarItems = [];
        if (collectionName && finderId) {
          collectionItemEndpoint = `collection-table/${collectionName}/finder/${finderId}/items`;

          if (selectionInfo.startStr) {
            collectionItemEndpoint += `?${eventStartTimeField}=${selectionInfo.startStr}`;
          }

          collectionItemEndpoint = await addEntityQueryToUrl(
            collectionItemEndpoint,
            collectionName,
            finderId,
          );
          console.log(
            '🚀 ~ file: dataLoader.js:6425 ~ collectionItemEndpoint:',
            collectionItemEndpoint,
          );
          const response = await securedGetCall(collectionItemEndpoint);
          console.log('🚀 ~ file: dataLoader.js:6425 ~ SELECT response:', response);
          if (response && response.status === 200) {
            calendarItems = response.data;
          }

          calendarItems.forEach((calendarItem) => {
            let calEventObj = {};
            calEventObj['id'] = calendarItem['uuid'];
            if (eventStartTimeField && calendarItem[eventStartTimeField]) {
              calEventObj['start'] = calendarItem[eventStartTimeField];
            }
            if (eventEndTimeField && calendarItem[eventEndTimeField]) {
              calEventObj['end'] = calendarItem[eventEndTimeField];
            }
            calendarEvents.push(calEventObj);
          });
        }
      }
      console.log('🚀 ~ file: dataLoader.js:6449 ~ SELECT calendarEvents:', calendarEvents);

      const selectedDate = selectionInfo.start.getDate();
      const dateOptions = { weekday: 'short' };
      const dayName = selectionInfo.start.toLocaleDateString('en-US', dateOptions);
      const timeSlotsContainerId = `timeslots-container-${timeslotCompId}`;
      let timeSlotsContainer = document.getElementById(timeSlotsContainerId);

      const hrElem = document.createElement('hr');
      hrElem.classList.add('my-1');
      const timeSlotHeaderElem = document.createElement('h6');
      timeSlotHeaderElem.innerHTML = `<span>${dayName},</span> <span class='text-black-50' style='font-size: medium;'>${selectedDate}${nthOrdinalNumber(
        selectedDate,
      )}</span>`;

      if (!timeSlotsContainer) {
        timeSlotsContainer = document.createElement('div');
        timeSlotsContainer.id = timeSlotsContainerId;
        timeSlotsContainer.classList.add(
          'timeslots-container',
          'w-25',
          'mt-1',
          'fc',
          'fc-media-screen',
          'fc-direction-ltr',
          'pr-0',
          'pl-2',
          'pe-0',
          'ps-2',
        );
        timeSlotsContainer.appendChild(timeSlotHeaderElem);
        timeSlotsContainer.appendChild(hrElem);
      } else {
        timeSlotsContainer.innerHTML = '';
        timeSlotsContainer.appendChild(timeSlotHeaderElem);
        timeSlotsContainer.appendChild(hrElem);
      }
      let timeSlotUlElem = document.createElement('ul');
      timeSlotUlElem.classList.add('list-unstyled', 'mt-4', 'px-2');
      timeSlotUlElem.style.maxHeight = '20em';
      timeSlotUlElem.style.overflow = 'auto';

      let interval = 30; //minutes interval
      switch (eventDurationFieldVal) {
        case '15_MINS':
          interval = 15;
          break;
        case '30_MINS':
          interval = 30;
          break;
        case '60_MINS':
          interval = 60;
          break;
        default:
          break;
      }
      const startTimeInHr = dayStartAtVal;
      const endTimeInHr = dayEndAtVal;
      const dayStartAt = 60 * startTimeInHr; // start time in minutes
      const dayEndAt = 60 * endTimeInHr; // end time in minutes
      const slotIntervalList = generateHoursInterval(dayStartAt, dayEndAt, interval);
      const filteredAppointments = calendarEvents.filter((appointment) =>
        appointment.start.includes(selectionInfo.startStr),
      );

      const existingAppointmentSlots =
        filteredAppointments && filteredAppointments.length
          ? filteredAppointments.map((appmnt) => {
              let momentDate = moment(appmnt.start);
              momentDate = momentDate.format('HH:mm');
              return momentDate;
            })
          : [];

      const availableSlots = overlapSlots
        ? slotIntervalList
        : slotIntervalList.filter((n) => !existingAppointmentSlots.includes(n));

      const startTimeInputElemId = `${eventStartTimeField}-${collectionFormElem.id}`;
      const endTimeInputElemId = `${eventEndTimeField}-${collectionFormElem.id}`;
      let startTimeInputOldElem = collectionFormElem.querySelector(`[id=${startTimeInputElemId}]`);
      let endTimeInputOldElem = collectionFormElem.querySelector(`[id=${endTimeInputElemId}]`);
      if (startTimeInputOldElem) startTimeInputOldElem.remove();
      if (endTimeInputOldElem) endTimeInputOldElem.remove();
      // Adding Empty time slot field for validation
      // Start Time Input
      const startTimeInputElem = document.createElement('input');
      startTimeInputElem.type = 'hidden';
      startTimeInputElem.id = startTimeInputElemId;
      startTimeInputElem.name = eventStartTimeField;
      startTimeInputElem.setAttribute('flat-picker-date-type', 'datetime-local');
      startTimeInputElem.setAttribute('data-timeslot', '');
      collectionFormElem.appendChild(startTimeInputElem);
      // End Time Input
      const endTimeInputElem = document.createElement('input');
      endTimeInputElem.type = 'hidden';
      endTimeInputElem.id = endTimeInputElemId;
      endTimeInputElem.name = eventEndTimeField;
      endTimeInputElem.setAttribute('flat-picker-date-type', 'datetime-local');
      endTimeInputElem.setAttribute('data-timeslot', '');
      collectionFormElem.appendChild(endTimeInputElem);

      if (availableSlots && availableSlots.length) {
        let slotIndex = 0;
        for (const slotTime of availableSlots) {
          let timeSlotNumber = slotIndex + 1;
          let timeSlotElem = document.createElement('li');
          timeSlotElem.classList.add('timeslot', 'py-1');
          let timeSlotLinkElem = document.createElement('a');
          timeSlotLinkElem.href = 'javascript:void(0)';
          timeSlotLinkElem.classList.add(
            'timeslot-link',
            `timeslot-link-${timeSlotNumber}`,
            'btn',
            'btn-outline-dark',
            'btn-sm',
            'w-100',
          );
          timeSlotLinkElem.textContent = slotTime;
          timeSlotElem.appendChild(timeSlotLinkElem);
          timeSlotLinkElem.addEventListener('click', (ev) => {
            ev.preventDefault();
            selectedTimeSlot(
              ev.target,
              timeSlotsContainerId,
              collectionFormElem,
              eventStartTimeField,
              eventEndTimeField,
              selectionInfo,
              slotTime,
              interval,
            );
          });
          timeSlotUlElem.appendChild(timeSlotElem);
        }
        timeSlotsContainer.appendChild(timeSlotUlElem);
        timeslotComp.appendChild(timeSlotsContainer);
        calendar.updateSize();
      }
    },
    unselect: function (info) {
      const { jsEvent, view } = info || '';
      let { srcElement } = jsEvent || '';

      if (srcElement && srcElement.tagName !== 'td') {
        srcElement = srcElement.closest('td');
      }

      const timeSlotsContainerId = `timeslots-container-${timeslotCompId}`;
      let timeSlotsContainer = document.getElementById(timeSlotsContainerId);

      if (srcElement) {
        const { dataset, outerText } = srcElement || '';
        const isTargetTimeslotLink = srcElement.classList.contains('timeslot-link');
        if (timeSlotsContainer && !dataset.date && !isTargetTimeslotLink) {
          calendar.select(currentDate);
        }
      } else {
        calendar.select(currentDate);
      }
    },
  });
  calendar.render();
  calendar.select(currentDate);
};
const loadChatComponent = async (messageComp, messageOptions) => {
  const currentUser = fetchLoggedInUserJson();
  const { projectId, nameField, imageField, finderUuid } = messageOptions;

  const fieldSettings = {
    nameField: nameField,
    avatarField: imageField,
    messageField: 'message',
    currentUser,
  };

  let users = [];
  const userItemEndpoint = `collection-table/user/finder/${finderUuid}/items`;
  const response = await securedGetCall(userItemEndpoint);
  if (response && response.status === 200) {
    users = response.data;
  }

  if (!users || users.lenght === 0) return;

  //User/Chat UI
  const usersListDiv = document.createElement('div');
  usersListDiv.setAttribute('class', 'list-group');
  usersListDiv.setAttribute('id', 'chat-rooms');

  //Message UI
  const chatMessagesDiv = document.createElement('div');
  chatMessagesDiv.setAttribute('class', 'chat-messages p-4');
  chatMessagesDiv.setAttribute('id', 'chat-messages-container');

  const inputP = document.createElement('div');
  inputP.setAttribute('class', 'flex-grow-1 my-3');
  await prepareSearchList(inputP, users, fieldSettings);

  const inputPP = document.createElement('div');
  inputPP.setAttribute('class', 'd-flex align-items-center');
  inputPP.appendChild(inputP);

  const inputPPP = document.createElement('div');
  inputPPP.setAttribute('class', 'px-4 d-none d-md-block');
  inputPPP.appendChild(inputPP);

  const column1 = document.createElement('div');
  column1.setAttribute('class', 'col-12 col-lg-5 col-xl-3 border-end');
  column1.appendChild(inputPPP);

  column1.appendChild(usersListDiv);

  const hrElem = document.createElement('hr');
  hrElem.setAttribute('class', 'd-block d-lg-none mt-1 mb-0');
  column1.appendChild(hrElem);

  const chatMessagesP = document.createElement('div');
  chatMessagesP.setAttribute('class', 'position-relative');
  chatMessagesP.appendChild(chatMessagesDiv);

  //Send Message UI
  const messageInputP = document.createElement('div');
  messageInputP.setAttribute('class', 'flex-grow-0 py-3 px-4 border-top');
  await prepareMessageInput(messageInputP, users, fieldSettings);

  //Current User Display
  const profilePPEl = document.createElement('div');
  profilePPEl.setAttribute('class', 'py-2 px-4 border-bottom d-none d-lg-block');

  const profilePEl = document.createElement('div');
  profilePEl.setAttribute('class', 'd-flex align-items-center py-1');
  profilePEl.setAttribute('id', 'current-room-user');
  profilePPEl.appendChild(profilePEl);

  const column2 = document.createElement('div');
  column2.setAttribute('class', 'col-12 col-lg-7 col-xl-9');
  column2.appendChild(profilePPEl);
  column2.appendChild(chatMessagesP);
  column2.appendChild(messageInputP);

  const row = document.createElement('div');
  row.setAttribute('class', 'row g-0');
  row.appendChild(column1);
  row.appendChild(column2);

  const parentOfRow = document.createElement('div');
  parentOfRow.setAttribute('class', 'card');
  parentOfRow.appendChild(row);
  messageComp.replaceChild(parentOfRow, messageComp.children[0]);

  const parentEl = document.getElementById('chat-rooms');
  parentEl.innerHTML =
    '<div class="drapcode-item placeholder"><div class="drapcode-col-12"><div class="drapcode-row"><div class="drapcode-col-2 big"></div><div class="drapcode-col-2 empty big"></div><div class="drapcode-col-8 big"></div></div></div></div><div class="drapcode-item placeholder"><div class="drapcode-col-12"><div class="drapcode-row"><div class="drapcode-col-2 big"></div><div class="drapcode-col-2 empty big"></div><div class="drapcode-col-8 big"></div></div></div></div>';
  let rooms = [];
  const roomItemsEndpoint = `chats/load-rooms`;
  const roomResponse = await securedGetCall(roomItemsEndpoint);
  if (roomResponse && roomResponse.status === 200) {
    rooms = roomResponse.data;
  }

  if (!rooms) {
    rooms = [];
  }
  parentEl.innerHTML = ``;
  await prepareChatList(rooms, users, fieldSettings);
  $('#chat-user-list').select2({
    placeholder: 'Select User',
  });
  setInterval(loadRoomMessages, 15 * 1000, users, fieldSettings);
};

const loadRoomMessages = async (users, fieldSettings) => {
  let selectedRoom = parseLSJSONStrToJSON('selected-room');
  let messages = [];
  const messageItemsEndpoint = `chats/load-messages/${selectedRoom.uuid}`;
  const messageResponse = await securedGetCall(messageItemsEndpoint);
  if (messageResponse && messageResponse.status === 200) {
    messages = messageResponse.data;
  }
  if (!messages) {
    messages = [];
  }
  if (messages.length > 0) {
    const parentEl = document.getElementById('chat-messages-container');
    parentEl.innerHTML = '';
  }
  messages.forEach(async (message) => await prepareMessage(message, users, fieldSettings));
};

const prepareSearchList = async (parentEl, users, fieldSettings) => {
  const { nameField, imageField, currentUser } = fieldSettings;
  const select = document.createElement('select');
  select.setAttribute('class', 'form-control');
  select.setAttribute('id', 'chat-user-list');

  const selectNone = document.createElement('option');
  selectNone.value = '';
  selectNone.text = 'Search User';

  select.appendChild(selectNone);

  for (var i = 0; i < users.length; i++) {
    const option = document.createElement('option');
    const user = users[i];
    if (currentUser.uuid !== user.uuid) {
      option.value = user.uuid;
      option.text = user[nameField];
      select.appendChild(option);
    }
  }

  select.onchange = function () {
    const setting = { type: 'user', value: this.value };
    createOrLoadMessagesOfRooms(setting, users, fieldSettings);
  };

  parentEl.appendChild(select);
};

const prepareChatList = async (rooms, users, fieldSettings) => {
  rooms.forEach(async (room) => await prepareRoom(room, users, fieldSettings));
};

const prepareRoom = async (room, users, fieldSettings) => {
  if (!room) {
    return;
  }

  const { recipients, uuid } = room;
  if (!recipients || recipients.length === 0) {
    return;
  }

  const { nameField, avatarField, currentUser } = fieldSettings;
  const notCurrentUser = recipients.filter((recipient) => recipient != currentUser.uuid);
  if (!notCurrentUser || notCurrentUser.length === 0) {
    return;
  }

  const recipientUser = users.find((user) => user.uuid === notCurrentUser[0]);
  const nameContent = document.createTextNode(recipientUser[nameField]);
  const titleDiv = document.createElement('div');
  titleDiv.setAttribute('class', 'flex-grow-1 ms-3');
  titleDiv.appendChild(nameContent);

  //Display Image
  const pImage = imageServerUrl() + recipientUser[avatarField].key;
  const avatar = document.createElement('IMG');
  avatar.setAttribute('src', pImage);
  avatar.setAttribute('alt', recipientUser[nameField]);
  avatar.setAttribute('width', '40');
  avatar.setAttribute('height', '40');
  avatar.setAttribute('class', 'rounded-circle me-1');

  const avatarDiv = document.createElement('div');
  avatarDiv.setAttribute('class', 'd-flex align-items-start');
  avatarDiv.appendChild(avatar);
  avatarDiv.appendChild(titleDiv);

  //Combine Display
  const hrefLink = document.createElement('A');
  hrefLink.setAttribute('href', 'javascript:void(0)');
  hrefLink.setAttribute('class', 'list-group-item list-group-item-action border-0');
  hrefLink.appendChild(avatarDiv);

  hrefLink.onclick = function () {
    setJsonInLocalStorage('selected-room', room);
    processSelectedChatRoom(users, fieldSettings);
    const siblings = getSiblings(this);
    siblings.forEach((sibling) => sibling.classList.remove('active'));
    this.classList.add('active');
  };

  let selectedRoom = parseLSJSONStrToJSON('selected-room');

  if (selectedRoom && selectedRoom.uuid === room.uuid) {
    hrefLink.onclick();
  }

  const parentEl = document.getElementById('chat-rooms');
  parentEl.appendChild(hrefLink);
};

const getSiblings = (e) => {
  let siblings = [];
  if (!e.parentNode) {
    return siblings;
  }
  let sibling = e.parentNode.firstChild;

  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== e) {
      siblings.push(sibling);
    }
    sibling = sibling.nextSibling;
  }
  return siblings;
};

const processSelectedChatRoom = async (users, fieldSettings) => {
  await prepareCurrentUserProfile(users, fieldSettings);
  const chatMessagesDiv = document.getElementById('chat-messages-container');
  chatMessagesDiv.innerHTML = '';

  let selectedRoom = parseLSJSONStrToJSON('selected-room');

  let messages = [];
  const messageItemsEndpoint = `chats/load-messages/${selectedRoom.uuid}`;
  const messageResponse = await securedGetCall(messageItemsEndpoint);
  if (messageResponse && messageResponse.status === 200) {
    messages = messageResponse.data;
  }
  if (!messages) {
    messages = [];
  }
  messages.forEach(async (message) => await prepareMessage(message, users, fieldSettings));
};

const createOrLoadMessagesOfRooms = async (setting, users, fieldSettings) => {
  let selectedRoom = null;
  let isNew = false;
  if (setting.type === 'user') {
    //User has selected
    const selectedUser = setting.value;
    const createOrLoadRoomEndpoint = `chats/create-rooms`;
    const roomResponse = await securedPostCall({ userId: selectedUser }, createOrLoadRoomEndpoint);
    if (roomResponse && roomResponse.status === 200) {
      selectedRoom = roomResponse.data.room;
      isNew = roomResponse.data.isNew;
    }
    if (isNew) {
      await prepareRoom(selectedRoom, users, fieldSettings);
    }
  } else if (type === 'room') {
    //Room has been selected then load message of this room
    const loadRoomEndpoint = `chats/load-room/${setting.value}`;
    const roomResponse = await securedGetCall(loadRoomEndpoint);
    if (roomResponse && roomResponse.status === 200) {
      selectedRoom = roomResponse.data;
    }
  }
  console.log('selectedRoom', selectedRoom);
  if (!selectedRoom) {
    return;
  }
  //TODO: In case handle to auto select room
};

const prepareCurrentUserProfile = async (users, fieldSettings) => {
  const { avatarField, nameField, currentUser } = fieldSettings;
  const profileDisplayEl = document.createElement('div');
  profileDisplayEl.setAttribute('class', 'position-relative');

  if (!users || users.length === 0) {
    return;
  }

  //Load selected room
  let selectedRoom = parseLSJSONStrToJSON('selected-room');
  console.log('selectedRoom', selectedRoom);

  if (!selectedRoom) {
    return;
  }

  let selectedRoomUser = selectedRoom.recipients.filter((user) => user !== currentUser.uuid);
  selectedRoomUser = selectedRoomUser[0];

  let selectedUser = users.filter((user) => user.uuid === selectedRoomUser);
  selectedUser = selectedUser[0];

  const avatar = document.createElement('IMG');
  const pImage = imageServerUrl() + selectedUser[avatarField].key;
  avatar.setAttribute('src', pImage);
  avatar.setAttribute('alt', selectedUser[nameField]);
  avatar.setAttribute('width', '40');
  avatar.setAttribute('height', '40');
  avatar.setAttribute('class', 'rounded-circle me-1');

  const displayEl = document.createElement('div');
  displayEl.setAttribute('class', 'flex-grow-1 pl-3');

  const strongEl = document.createElement('strong');
  const nameContent = document.createTextNode(selectedUser[nameField]);
  strongEl.appendChild(nameContent);
  displayEl.appendChild(strongEl);

  profileDisplayEl.appendChild(avatar);

  const parentEl = document.getElementById('current-room-user');
  parentEl.innerHTML = '';
  parentEl.appendChild(profileDisplayEl);
  parentEl.appendChild(displayEl);
};

const prepareMessage = async (message, users, fieldSettings) => {
  const { messageField, avatarField, nameField, currentUser } = fieldSettings;
  const senderUser = users.find((user) => user.uuid === message.createdBy);
  let senderName;
  let avatar;
  let msgAlign = 'chat-message-left';

  if (senderUser) {
    let userName = senderUser[nameField];
    let pImage = imageServerUrl() + senderUser[avatarField].key;
    if (currentUser.uuid === message.createdBy) {
      msgAlign = 'chat-message-right';
      userName = 'You';
      pImage = imageServerUrl() + currentUser[avatarField].key;
    }
    senderName = document.createTextNode(userName);
    avatar = document.createElement('IMG');
    avatar.setAttribute('src', pImage);
    avatar.setAttribute('alt', userName);
    avatar.setAttribute('width', '40');
    avatar.setAttribute('height', '40');
    avatar.setAttribute('class', 'rounded-circle me-1');
    if (currentUser.uuid === message.createdBy) {
      msgAlign = 'chat-message-right';
    }
  }

  const senderNameDiv = document.createElement('div');
  senderNameDiv.setAttribute('class', 'font-weight-bold mb-1');
  senderNameDiv.appendChild(senderName);

  const messageNode = document.createTextNode(message.message);
  const messageDiv = document.createElement('div');
  messageDiv.setAttribute('class', 'flex-shrink-1 bg-light rounded py-2 px-3 mr-3');
  messageDiv.appendChild(senderNameDiv);
  messageDiv.appendChild(messageNode);

  const completeMsgDiv = document.createElement('div');
  completeMsgDiv.setAttribute('class', `${msgAlign} pb-4`);

  const avatarP = document.createElement('div');
  if (avatar) {
    avatarP.appendChild(avatar);
    completeMsgDiv.appendChild(avatarP);
  }
  completeMsgDiv.appendChild(messageDiv);
  const parentEl = document.getElementById('chat-messages-container');
  parentEl.appendChild(completeMsgDiv);
  parentEl.scrollTop = parentEl.scrollHeight;
};

const prepareMessageInput = async (parentEl, users, fieldSettings) => {
  const input = document.createElement('input');
  input.setAttribute('class', 'form-control');
  input.setAttribute('type', 'text');
  input.setAttribute('placeholder', 'Type your message');

  const btnText = document.createTextNode('Send');
  const button = document.createElement('button');
  button.setAttribute('class', 'btn btn-primary');
  button.appendChild(btnText);
  button.onclick = async function () {
    await sendMessageToServer(input, users, fieldSettings);
  };

  const inputGroup = document.createElement('div');
  inputGroup.setAttribute('class', 'input-group');

  inputGroup.appendChild(input);
  inputGroup.appendChild(button);

  parentEl.appendChild(inputGroup);
};

const sendMessageToServer = async (input, users, fieldSettings) => {
  const inputValue = input.value;
  let selectedRoom = parseLSJSONStrToJSON('selected-room');
  let message = {
    message: inputValue,
    roomId: selectedRoom.uuid,
  };

  const createMessageEndpoint = `chats/save-message`;
  const messageResponse = await securedPostCall(message, createMessageEndpoint);
  if (messageResponse && messageResponse.status === 200) {
    message = messageResponse.data;
  }
  await prepareMessage(message, users, fieldSettings);
  input.value = '';
};

const getColorBadges = (cellComponent, fieldName, item) => {
  if (cellComponent) {
    let sortField = elementAttribute(cellComponent, 'data-sort-field');
    let maxAllowed = elementAttribute(cellComponent, 'data-allowed-field');
    const type = elementAttribute(cellComponent, 'data-field-type');
    let coloFieldName = elementAttribute(cellComponent, 'data-color-field');
    let refField = elementAttribute(cellComponent, 'data-reference-field');
    if (type === 'reference') {
      coloFieldName = fieldName + '.' + coloFieldName;
      fieldName = fieldName + '.' + refField;
    }
    const columnData = fieldName ? parseValueFromData(item, fieldName) : '';
    const color = coloFieldName ? parseValueFromData(item, coloFieldName) : '';
    const newTableColumn = cellComponent.cloneNode(true);
    cellComponent.innerHTML = '';
    const innerChildren = newTableColumn.children;
    let values = [];
    let colors = [];
    values = columnData ? (Array.isArray(columnData) ? columnData : columnData.split(',')) : '';
    colors = color ? (Array.isArray(color) ? color : color.split(',')) : '';
    if (sortField) {
      if (sortField === 'ALPHABETICALLY') {
        values = values.sort();
      } else if (sortField === 'REVERSE_ALPHABETICALLY') {
        values = values.sort().reverse();
      } else if (sortField === 'RANDOM') {
        values = _.shuffle(values);
      }
    }
    if (maxAllowed && +maxAllowed > 0 && values.length > maxAllowed) {
      values = values.slice(0, +maxAllowed);
    }
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    let data = '';
    const dupInnerChildren =
      innerChildren && innerChildren[0]
        ? innerChildren[0].cloneNode(true)
        : document.createElement('span');
    values.forEach((val, index) => {
      const isColorCode = colors ? hexColorRegex.test(colors[index]) : false;
      if (dupInnerChildren.style.display === 'none') dupInnerChildren.style.display = '';
      if (isColorCode) dupInnerChildren.style.backgroundColor = colors[index];
      data += setColumnDataIntoHtmlElement(val, dupInnerChildren);
    });
    if (!data) {
      dupInnerChildren.style.display = 'none';
      dupInnerChildren.textContent = '';
      data += dupInnerChildren.outerHTML;
    }
    return setColumnDataIntoHtmlElement(data, cellComponent, true);
  } else return '';
};
const loadChatBotMessageComponent = async (messageComp, messageOptions) => {
  console.log('loadChatBotMessageComponent');
  const { projectId } = messageOptions;

  const { itemData, collectionId, collectionItemId } = await getPageItemData();
  if (collectionId !== 'chatgpt_chatbot' || !itemData) {
    return;
  }

  //User/Chat UI
  const parentChatWrapper = document.createElement('div');
  parentChatWrapper.setAttribute('class', 'chatbox-wrapper');

  const chatToogle = document.createElement('div');
  chatToogle.setAttribute('class', 'chatbox-toggle');

  chatToogle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-gjs="drapcode-icons-svg" draggable="false" class="feather feather-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z">
  </path></svg>`;

  const chatWrapper = document.createElement('div');
  chatWrapper.setAttribute('class', 'chatbox-message-wrapper');

  //Header
  const chatHeader = document.createElement('div');
  chatHeader.setAttribute(
    'class',
    'd-flex align-items-center justify-content-between chatbox-message-header',
  );

  const chatHeaderText = document.createElement('h4');
  chatHeaderText.setAttribute('class', 'chatbox-message-name');
  chatHeaderText.textContent = 'Send your message';

  const chatCloser = document.createElement('div');
  chatCloser.setAttribute('class', 'chatbox-message-dropdown');
  chatCloser.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  const endButton = document.createElement('button');
  endButton.setAttribute('class', 'btn btn-danger btn-sm chatbox-btn-danger');
  endButton.textContent = 'End Chat';

  let selectedRoom = localStorage.getItem('selected-chatbot-room');
  if (!selectedRoom) {
    endButton.style.display = 'none';
  }

  chatHeader.append(chatHeaderText);
  chatHeader.append(endButton);
  chatHeader.append(chatCloser);

  //Content
  const chatContent = document.createElement('div');
  chatContent.setAttribute('class', 'chatbox-message-content');

  const chatMessageContent = document.createElement('div');
  chatMessageContent.setAttribute('class', 'chatbox-message-content');

  await loadChatBotMessages(chatMessageContent, true);
  chatContent.append(chatMessageContent);

  //End Chat Button
  endButton.addEventListener('click', function () {
    cleanChatBotRoomAndClearMessage(chatMessageContent);
    this.style.display = 'none';
  });

  //Bottom
  const chatBottom = document.createElement('div');
  chatBottom.setAttribute('class', 'chatbox-message-bottom');

  const form = document.createElement('form');
  form.setAttribute('class', 'chatbox-message-form');

  const textarea = document.createElement('textarea');
  textarea.setAttribute('class', 'chatbox-message-input');
  textarea.setAttribute('rows', '1');
  textarea.setAttribute('placeholder', 'Type message..');

  textarea.addEventListener('input', function () {
    let line = textarea.value.split('\n').length;

    if (textarea.rows < 6 || line < 6) {
      textarea.rows = line;
    }

    if (textarea.rows > 1) {
      form.style.alignItems = 'flex-end';
    } else {
      form.style.alignItems = 'center';
    }
  });

  form.append(textarea);
  const button = document.createElement('button');
  button.setAttribute('class', 'chatbox-message-submit');
  button.setAttribute('type', 'submit');
  button.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
  form.append(button);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (isValid(textarea.value)) {
      await sendChatBotMessageToServer(collectionItemId, chatMessageContent, textarea.value);
      form.style.alignItems = 'center';
      textarea.rows = 1;
      textarea.focus();
      textarea.value = '';
    }
  });

  chatBottom.append(form);
  chatWrapper.append(chatHeader);
  chatWrapper.append(chatContent);
  chatWrapper.append(chatBottom);

  chatToogle.addEventListener('click', function () {
    chatWrapper.classList.toggle('show');
  });

  chatCloser.addEventListener('click', function () {
    chatWrapper.classList.toggle('show');
  });

  parentChatWrapper.append(chatToogle);
  parentChatWrapper.append(chatWrapper);

  messageComp.replaceChild(parentChatWrapper, messageComp.children[0]);
  setInterval(loadChatBotMessages, 30 * 1000, chatMessageContent, false);
};

const cleanChatBotRoomAndClearMessage = async (chatMessageContent) => {
  chatMessageContent.innerHTML = ``;
  localStorage.removeItem('selected-chatbot-room');
};

const loadChatBotMessages = async (chatMessageContent, isFirst) => {
  let selectedRoom = localStorage.getItem('selected-chatbot-room');
  if (!selectedRoom) {
    return;
  }
  selectedRoom = parseLSJSONStrToJSON('selected-chatbot-room');
  let lastRestartTime = localStorage.getItem('last-message-time');
  if (lastRestartTime || isFirst) {
    const time1 = moment(lastRestartTime);
    const time2 = moment(moment().format());
    if (time2.diff(time1) / 1000 < 120 || isFirst) {
      let messages = [];
      const loadRoomMessagesEndpoint = `chatbot/chats/load-messages/${selectedRoom.uuid}`;
      const messagesRes = await securedGetCall(loadRoomMessagesEndpoint);
      if (messagesRes && messagesRes.status === 200) {
        messages = messagesRes.data;
      }

      console.log('messages', messages);
      chatMessageContent.innerHTML = ``;
      messages.forEach((message) => createMessageForChatBot(chatMessageContent, message));
    } else {
      console.log('No new message from user in last 2 mins');
    }
  } else {
    console.log('no message is sent');
  }
};

const sendChatBotMessageToServer = async (chatBotId, chatMessageContent, content) => {
  let selectedRoom = localStorage.getItem('selected-chatbot-room');
  if (!selectedRoom) {
    selectedRoom = await createChatBotRoom(chatBotId);
    setJsonInLocalStorage('selected-chatbot-room', selectedRoom);
    const endButton = document.getElementsByClassName('chatbox-btn-danger');
    endButton[0].style.display = 'block';
  } else {
    selectedRoom = parseLSJSONStrToJSON('selected-chatbot-room');
  }
  let message = {
    message: content,
    roomId: selectedRoom.uuid,
  };
  const createMessageEndpoint = `chatbot/chats/save-message`;
  const messageResponse = await securedPostCall(message, createMessageEndpoint);
  if (messageResponse && messageResponse.status === 200) {
    message = messageResponse.data;
  }
  localStorage.setItem('last-message-time', moment().format());
  createMessageForChatBot(chatMessageContent, message);
};

const createChatBotRoom = async (chatBotId) => {
  const createRoomEndpoint = `chatbot/chats/create-room`;
  const roomResponse = await securedPostCall({ chatBotId }, createRoomEndpoint);
  let room = null;
  if (roomResponse && roomResponse.status === 200) {
    room = roomResponse.data;
  }
  return room.room;
};

const isValid = (value) => {
  let text = value.replace(/\n/g, '');
  text = text.replace(/\s/g, '');

  return text.length > 0;
};

const createMessageForChatBot = (chatMessageContent, messageObj) => {
  const { message, createdAt, message_from } = messageObj;
  const isSent = message_from === 'USER';
  const chatMessageItem = document.createElement('div');
  chatMessageItem.setAttribute('class', `chatbox-message-item ${isSent ? 'sent' : 'received'}`);

  const chatMessageText = document.createElement('span');
  chatMessageText.setAttribute('class', 'chatbox-message-item-text');
  chatMessageText.textContent = message;

  const chatMessageTime = document.createElement('span');
  chatMessageTime.setAttribute('class', 'chatbox-message-item-time');
  if (createdAt) {
    const time = moment(createdAt).fromNow();
    chatMessageTime.textContent = time;
  }

  chatMessageItem.append(chatMessageText);
  chatMessageItem.append(chatMessageTime);

  chatMessageContent.append(chatMessageItem);
  chatMessageContent.scrollTop = chatMessageContent.scrollHeight;
};
const loadTOTPComponent = async (totpComp, totpOptions) => {
  if (!isLoggedInUser()) {
    return;
  }

  const loggedInUser = fetchLoggedInUserJson();
  if (!loggedInUser) {
    return;
  }
  const { is_secret_code_verify } = loggedInUser;
  if (is_secret_code_verify) {
    showResetSecurityButton(totpComp, loggedInUser);
  } else {
    const qrEndpoint = '/generate-secret-code';
    const response = await axios.get(qrEndpoint, {});
    if (response && response.status === 200) {
      const userObj = response.data;
      const { userDetails } = userObj.user || '';
      if (userDetails) {
        delete userDetails._id;
        delete userDetails.password;
        delete userDetails.secret_code;
        const newUserObj = { ...loggedInUser, ...userDetails };
        setJsonInLocalStorage('user', newUserObj);
      }
      createFormForSecurityVerification(totpComp, userObj.url, loggedInUser);
    } else {
      return;
    }
  }
};

const showResetSecurityButton = (totpComp, loggedInUser) => {
  const form = document.createElement('form');
  form.setAttribute('class', 'form-container');

  const button = document.createElement('button');
  button.setAttribute('class', 'btn btn-danger');
  button.setAttribute('type', 'submit');
  button.innerText = 'Reset Authentication';
  form.appendChild(button);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const codeEndpoint = '/reset-secret-code';
    const response = await axios.post(codeEndpoint, {}, {});
    if (response && response.status === 200) {
      const resData = response.data;
      console.log('check after reset resData', resData);
      if (resData.success) {
        const userDetails = resData.user.userDetails;
        delete userDetails._id;
        delete userDetails.password;

        const newUserObj = { ...loggedInUser, ...userDetails };
        setJsonInLocalStorage('user', newUserObj);
        //Hide and show QR again
        createFormForSecurityVerification(totpComp, resData.url, loggedInUser);
      }
    } else {
      return;
    }
  });
  totpComp.replaceChild(form, totpComp.children[0]);
};

const createFormForSecurityVerification = (totpComp, url, loggedInUser) => {
  const parentChatWrapper = document.createElement('div');
  const form = document.createElement('form');
  form.setAttribute('class', 'form-container');

  const paragraph = document.createElement('p');
  paragraph.innerText = `Scan the QR Code in the Authenticator app then enter the code that you
  see in the app in the text field and click Submit.`;

  form.appendChild(paragraph);

  const image = document.createElement('img');
  image.setAttribute('src', url);
  image.setAttribute('id', 'secure-code');
  form.appendChild(image);

  const inputPDiv = document.createElement('div');
  inputPDiv.setAttribute('class', 'mb-3');

  const label = document.createElement('label');
  label.setAttribute('class', 'form-label');
  label.innerText = 'Security Code';
  inputPDiv.appendChild(label);

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('class', 'form-control');
  input.setAttribute('placeholder', 'Security Code');
  input.setAttribute('name', 'code');
  input.setAttribute('id', 'code');

  inputPDiv.appendChild(input);
  const errorDiv = document.createElement('div');
  errorDiv.setAttribute('class', 'text-danger');
  errorDiv.setAttribute('id', 'qr-code-error');

  inputPDiv.appendChild(errorDiv);
  form.appendChild(inputPDiv);

  const button = document.createElement('button');
  button.setAttribute('class', 'btn btn-primary');
  button.setAttribute('type', 'submit');
  button.innerText = 'Submit';
  form.appendChild(button);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!input.value) {
      errorDiv.innerText = 'Please enter code.';
      return;
    }

    const codeEndpoint = '/verify-secret-code';
    const response = await axios.post(codeEndpoint, { code: input.value }, {});
    if (response && response.status === 200) {
      const resData = response.data;
      console.log('check after register resData', resData);
      if (resData.success) {
        const userDetails = resData.user.userDetails;
        delete userDetails._id;
        delete userDetails.password;

        const newUserObj = { ...loggedInUser, ...userDetails };
        setJsonInLocalStorage('user', newUserObj);
        //Hide form and show message to disable Auth2
        showResetSecurityButton(totpComp, loggedInUser);
        window.location = '/login';
      } else {
        errorDiv.innerText = 'Authentication Code is wrong. Please check and try again.';
        image.setAttribute('src', resData.url);
        input.value = '';
      }
    } else {
      return;
    }
  });

  totpComp.replaceChild(form, totpComp.children[0]);
};

const renderPdfViewerElements = (
  element,
  itemImageData,
  itemUuid,
  isExternalAPI = '',
  externalApiType = '',
) => {
  console.log(
    '🚀 ~ renderPdfViewerElements ~ isExternalAPI:',
    isExternalAPI,
    '~ externalApiType:',
    externalApiType,
  );
  const originalClassName = element.firstChild ? element.firstChild.className : '';
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  if (Array.isArray(itemImageData) && itemImageData.length > 0) {
    itemImageData.forEach((data) => {
      const button = createButtonForPdfViewer(
        data,
        itemUuid,
        originalClassName,
        isExternalAPI,
        externalApiType,
      );
      element.appendChild(button);
      return element;
    });
  } else if (itemImageData && typeof itemImageData === 'object') {
    const button = createButtonForPdfViewer(
      itemImageData,
      itemUuid,
      originalClassName,
      isExternalAPI,
      externalApiType,
    );
    element.appendChild(button);
    return element;
  }
};

const createButtonForPdfViewer = (
  data,
  uuid,
  originalClassName = '',
  isExternalAPI = '',
  externalApiType = '',
) => {
  console.log(
    '🚀 ~ createButtonForPdfViewer ~ isExternalAPI:',
    isExternalAPI,
    '~ externalApiType:',
    externalApiType,
  );
  const button = document.createElement('button');
  if (originalClassName) {
    button.className = originalClassName;
  } else {
    button.className = 'btn btn-outline-primary btn-sm mx-2';
  }
  button.setAttribute('data-item-id', uuid);
  button.setAttribute('data-collection-id', data.collectionName || '');
  button.setAttribute('data-file-id', data.uuid || '');
  button.setAttribute('data-file-original-name', data.originalName || '');
  button.setAttribute('data-file-type', data.mimeType || '');
  button.setAttribute('title', data.originalName || '');

  if (isExternalAPI) {
    const base64Data = data ? compressToBase64(data) : '';
    console.log('🚀 ~ createButtonForPdfViewer ~ base64Data:', base64Data);
    button.setAttribute('data-npf', base64Data || '');
  }

  button.textContent = data.originalName || 'Open PDF';
  button.setAttribute('onclick', 'openPDFViewer(event)');
  return button;
};

const renderPdfViewerInDataTable = (
  item,
  column,
  tableColumnContentTag,
  isExternalAPI = '',
  externalApiType = '',
) => {
  console.log(
    '🚀 ~ renderPdfViewerInDataTable ~ isExternalAPI:',
    isExternalAPI,
    '~ externalApiType:',
    externalApiType,
  );

  let pdfData = column ? item[column] : '';
  if (isExternalAPI && pdfData) {
    console.log('🚀 ~ renderPdfViewerInDataTable ~ pdfData #1:', pdfData);
    pdfData = parseMySqlBlobData(pdfData);
    console.log('🚀 ~ renderPdfViewerInDataTable ~ pdfData #2:', pdfData);
  }
  let data = '';

  if (!pdfData) {
    return `<td></td>`;
  }

  if (tableColumnContentTag) {
    renderPdfViewerElements(
      tableColumnContentTag,
      pdfData,
      item?.uuid,
      isExternalAPI,
      externalApiType,
    );
    data = `<td>${tableColumnContentTag.outerHTML}</td>`;
  }

  return data;
};

const addDownloadAttributeForPrivateFiles = (element, itemImageData, itemUuid) => {
  const { uuid, collectionName, collectionField = '', originalName } = itemImageData;
  element.setAttribute(
    'onclick',
    `fetchFile("${itemUuid}","${uuid}","${collectionName}","${collectionField}","${originalName}")`,
  );
};

const parseRange = (range) => {
  if (!range || !range.includes('-')) return null;
  const [y2, y] = range.split('-').map(parseFloat);
  if (isNaN(y2) || isNaN(y)) return null;
  return { y2, y };
};

const convertColorForChartJs = (color) => {
  const colorObj = tinycolor(color);
  if (colorObj.isValid()) {
    return colorObj.setAlpha(0.3).toString();
  } else {
    return 'rgba(255, 255, 255 ,0.3)';
  }
};

const loadSubTenantDropdown = (subTenantComponent, subTenantField) => {
  if (subTenantComponent) {
    const switchEvent = subTenantComponent.attributes['data-sub-tenant-action'];
    const onClickEvent = switchEvent ? switchEvent.value : null;
    subTenantComponent.removeAttribute('data-sub-tenant-action');
    const subTenantDropdownElem = subTenantComponent.querySelector('ul.dropdown-menu');
    const subTenantLinkElem = subTenantDropdownElem
      ? subTenantDropdownElem.querySelector('a.dropdown-item')
      : '';
    subTenantDropdownElem.innerHTML = '';
    if (isLoggedInUser()) {
      const currentUser = fetchLoggedInUserJson();
      const currentTenant = fetchCurrentTenantJson();
      const currentSubTenant = fetchCurrentSubTenantJson();
      if (currentUser.subTenantId && currentUser.subTenantId.length) {
        const filteredSubTenants = currentUser.subTenantId.filter((subTenantObj) => {
          return (
            subTenantObj?.tenantId?.[0]?.uuid === currentTenant.uuid ||
            subTenantObj?.tenantId?.[0] === currentTenant.uuid
          );
        });
        addNoneOptionToDropdown(
          subTenantLinkElem,
          subTenantDropdownElem,
          onClickEvent,
          !isLoggedInSubTenant(),
          true,
        );
        filteredSubTenants.forEach((subTenantObj, index) => {
          const newHtml = subTenantLinkElem.cloneNode(true);
          newHtml.text = subTenantField ? subTenantObj[subTenantField] : subTenantObj.uuid;
          newHtml.setAttribute('id', `${subTenantLinkElem.id}${index + 1}`);
          newHtml.setAttribute('data-sub-tenant-id', subTenantObj.uuid);
          newHtml.setAttribute('onclick', onClickEvent);
          if (subTenantObj?.uuid === currentSubTenant?.uuid) {
            newHtml.classList.add('active');
          }
          subTenantDropdownElem.appendChild(newHtml);
        });
      } else {
        addNoneOptionToDropdown(
          subTenantLinkElem,
          subTenantDropdownElem,
          onClickEvent,
          true,
          false,
        );
      }
    } else {
      addNoneOptionToDropdown(subTenantLinkElem, subTenantDropdownElem, onClickEvent, true, false);
    }
  }
};

const addNoneOptionToDropdown = (
  linkElem,
  dropdownElem,
  onClickEvent,
  isActive,
  isLoggedInUser,
) => {
  if (!linkElem || !dropdownElem) return;
  const noneOption = linkElem.cloneNode(true);
  noneOption.text = 'None';
  if (isLoggedInUser) {
    noneOption.setAttribute('id', `${linkElem.id}_none`);
    noneOption.setAttribute('data-sub-tenant-id', 'none');
    if (onClickEvent) {
      noneOption.setAttribute('onclick', onClickEvent);
    }
  }
  if (isActive) {
    noneOption.classList.add('active');
  }
  dropdownElem.appendChild(noneOption);
};

function processRoleBasedSnippet(snippetUUID, snippetEl) {
  console.log(
    '🚀 ~ processRoleBasedSnippet ~ snippetUUID:',
    snippetUUID,
    '~ snippetEl:',
    snippetEl,
  );
  let newSnippetUUID = snippetUUID;
  let newSnippetEl = snippetEl;

  let userObjString = localStorage.getItem('user');
  let user = '';
  const snippetElAttrs = newSnippetEl.attributes;
  let roleSnippetUuidMap = [];
  if (userObjString && userObjString !== 'undefined') {
    user = parseLSJSONStrToJSON('user');
    console.log('*** 🚀 ~ processRoleBasedSnippet ~ user:', user);
    if (user) {
      const { userRoles } = user;
      const loggedInUserRole = userRoles && userRoles.length === 1 ? userRoles[0] : '';
      const roleParameterize = loggedInUserRole
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
          return word.toLowerCase();
        })
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9]+/g, '-');
      // const snippetElAttrs = newSnippetEl.attributes;
      // let roleSnippetUuidMap = [];
      Array.from(snippetElAttrs).forEach(({ name, value }) => {
        if (name.startsWith('data-rolesnippetuuid-')) {
          if (value) {
            const attrRole = name.split('data-rolesnippetuuid-')[1];
            roleSnippetUuidMap.push({ role: attrRole, snippet: value });
          } else {
            newSnippetEl.removeAttribute(name);
          }
        }
      });

      console.log('🚀 ~ processRoleBasedSnippet ~ roleSnippetUuidMap:', roleSnippetUuidMap);
      const filteredRoleSnippet = roleSnippetUuidMap.find(
        (roleSnippet) => roleSnippet.role === roleParameterize,
      );
      console.log('🚀 ~ processRoleBasedSnippet ~ filteredRoleSnippet:', filteredRoleSnippet);
      const roleSnippetUuid = filteredRoleSnippet ? filteredRoleSnippet.snippet : '';
      if (roleSnippetUuid) {
        newSnippetUUID = roleSnippetUuid;
      }
    }
  }

  Array.from(snippetElAttrs).forEach(({ name, value }) => {
    if (name.startsWith('data-rolesnippetuuid-')) {
      newSnippetEl.removeAttribute(name);
    }
  });

  console.log(
    '🚀 ~ processRoleBasedSnippet ~ newSnippetUUID:',
    newSnippetUUID,
    '~ newSnippetEl:',
    newSnippetEl,
  );
  const snippetReturnJson = {
    newSnippetUUID,
    newSnippetEl,
  };
  return snippetReturnJson;
}

function loadSnippetContent(snippetComp, snippetOptions) {
  console.log(
    '🚀 ~ loadSnippetComponent ~ snippetComp:',
    snippetComp,
    '~ snippetOptions:',
    snippetOptions,
  );
  const { snippetEl, snippetContent } = snippetOptions || {};
  let isModal = false;
  const isModalContainer = snippetComp && snippetComp.closest('[id^=modal-container]');
  isModal = isModalContainer ? true : false;
  console.log('🚀 ~ loadSnippetComponent ~ isModal:', isModal);
  const dcMetaExists = document.getElementById('dcmeta') !== null;
  console.log('🚀 ~ loadSnippetComponent ~ dcMetaExists:', dcMetaExists);
  if (!dcMetaExists) {
    addEventsScriptForSnippet(snippetContent, snippetEl);
  }
  loadHyperLinkFromEntity('[data-snippet-id] [data-path-collection-name]');
  loadSessionDataIntoElements(isModal, '[data-snippet-id] [data-session]');
  loadSessionTenantDataIntoElements(isModal, '[data-snippet-id] [data-session-tenant]');

  const typesenseComponents = snippetEl.querySelectorAll('[data-typesense-search-component]');
  if (typesenseComponents && typesenseComponents.length) {
    typesenseComponents.forEach((component) => {
      renderTypesenseSearch(component);
    });
  }
  const notesWrapperComponents = snippetEl.querySelectorAll('[data-notes-wrapper]');
  console.log('🚀 ~ loadSnippetContent ~ notesWrapperComponents:', notesWrapperComponents);

  if (notesWrapperComponents && notesWrapperComponents.length) {
    notesWrapperComponents.forEach((component) => {
      console.log('🚀 ~ loadSnippetContent ~ component:', component);

      loadNotesData(component);
    });
  }
  let visibilityElements = snippetEl.querySelectorAll('[data-vis-condition]');
  console.log(
    '🚀 ~ %cloadSnippetComponent ~ visibilityElements:',
    'color:yellow;font-weight:bold',
    visibilityElements,
  );

  if (visibilityElements && visibilityElements.length) {
    console.log('🚀 ~ %cloadSnippetComponent ~ Processing Component Visibility...', 'color:yellow');
    let compVisibilityDataJson = {
      itemData: {},
    };

    visibilityElements.forEach((visibilityElem) => {
      const visConditionJson = parseVisibilityCondition(visibilityElem);
      const visWhenCollectionFrom = visConditionJson['visWhenCollectionFrom'];
      const visWhenBsl = visConditionJson['visWhenBsl'];
      const visWhenBslKey = visConditionJson['visWhenBslKey'];
      console.log(
        '🚀 ~ loadSnippetComponent ~ visibilityElements.forEach ~ visWhenCollectionFrom:',
        visWhenCollectionFrom,
        'visWhenBsl:',
        visWhenBsl,
        'visWhenBslKey:',
        visWhenBslKey,
      );
      if (visWhenCollectionFrom === 'BROWSER_STORAGE') {
        // Get Browser Storage Data Object
        let browserData = {};
        switch (visWhenBsl) {
          case 'SESSION_STORAGE':
            browserData = getBrowserSessionStorageData();
            break;
          case 'LOCAL_STORAGE':
            browserData = getBrowserLocalStorageData();
            break;
          case 'COOKIES':
            browserData = getBrowserCookieData();
            break;
          default:
            break;
        }

        console.log(
          '🚀 ~ loadSnippetComponent ~ visibilityElements.forEach ~ browserData:',
          browserData,
        );

        let compVisibilityDataJson = {
          itemData: browserData,
        };
        processComponentVisibilityCondition(visibilityElem, compVisibilityDataJson);
      } else {
        processComponentVisibilityCondition(visibilityElem, compVisibilityDataJson);
      }
    });
  }
}

const renderBoxFolderList = async (element) => {
  try {
    const resultsContainer = element.querySelector('#box-folder-list');
    const saveButton = element.querySelector('#save-box-folder-selection');
    if (!resultsContainer || !saveButton) {
      console.error('Box folder elements not found');
      return;
    }
    const originalLabel = resultsContainer.querySelector('label');
    const originalInput = resultsContainer.querySelector('input[type="radio"]');
    const labelClass = originalLabel?.className || '';
    const inputClass = originalInput?.className || '';
    element.style.display = 'none';
    resultsContainer.innerHTML = '<p>Loading folders...</p>';
    const response = await publicGetCall('box/get-folders');
    const folders = response?.data?.data || [];
    if (!folders.length) {
      resultsContainer.innerHTML = '<p>No folders found</p>';
      element.style.display = 'block';
      return;
    }
    resultsContainer.innerHTML = '';
    folders.forEach((folder) => {
      const label = document.createElement('label');
      label.className = labelClass;
      label.style.display = 'block';
      label.innerHTML = `
        <input type="radio" name="boxFolder" value="${folder.name}" class="${inputClass}" data-id="${folder.id}">
        ${folder.name}
      `;
      resultsContainer.appendChild(label);
    });
    element.style.display = 'block';
    saveButton.addEventListener('click', async () => {
      const selectedInput = element.querySelector('input[name="boxFolder"]:checked');
      if (!selectedInput) {
        toastr.error('Please select a folder', 'Error');
        return;
      }
      const selectedFolderName = selectedInput.value;
      try {
        const saveResponse = await unSecuredPostCall(
          { parentFolder: selectedFolderName },
          'box/save-folder',
        );
        if (saveResponse?.status === 200) {
          toastr.success('Folder saved successfully', 'Success');
        } else {
          toastr.error('Failed to save folder', 'Error');
        }
      } catch (err) {
        console.error('Error saving folder:', err);
        toastr.error('Error saving folder', 'Error');
      }
    });
  } catch (error) {
    console.error('Error in rendering Box Folder List:', error);
    toastr.error('Error rendering Box Folder List', 'Error');
  }
};

const renderNotesData = async (element, notesDetails, Data = undefined, TitlesData = undefined) => {
  const { collectionName, userId, retrieveField, saveField } = notesDetails;
  const currentTenant = fetchCurrentTenantJson().uuid || '';
  console.log('🚀 ~ renderNotesData ~ currentTenant:', currentTenant);
  const User = fetchLoggedInUserJson() || {};
  const currentUserId = User.uuid || '';
  console.log('🚀 ~ renderNotesData ~ currentUserId:', currentUserId);

  const loadCurrentUserNotesEndpoint = `collection-table/${collectionName}/items?${userId}%3AIN_LIST=${currentUserId}&tenantId%3AIN_LIST=${currentTenant}`;
  const notesRes = await publicGetCall(loadCurrentUserNotesEndpoint);
  let notesData;

  if (notesRes && notesRes.status === 200) {
    notesData = notesRes.data;
  }

  if (Data || TitlesData) {
    let NotesUpdate = {};
    if (Data) {
      NotesUpdate[`${saveField}`] = Data;
    }
    if (TitlesData) {
      NotesUpdate[`${retrieveField}`] = TitlesData;
    }

    let response;

    if (notesData.length <= 0) {
      NotesUpdate[`${userId}`] = currentUserId;
      NotesUpdate['tenantId'] = currentTenant;

      let endpoint = `collection-form/${collectionName}/items`;
      response = await unSecuredPostCall(NotesUpdate, endpoint);
    } else {
      let endpoint = `collection-form/${collectionName}/items/${notesData?.[0]?.uuid}`;
      response = await securedPutCall(NotesUpdate, endpoint, User.token);
    }

    return response;
  }
  return {
    notes: notesData?.[0]?.[saveField],
    titles: notesData?.[0]?.[retrieveField],
    id: notesData?.[0]?.uuid,
  };
};

const loadNotesData = async (element) => {
  const root = element;
  console.log('🚀 ~ loadNotesData ~ root:', root);

  const notepadWrapper = root.querySelector('.notepad-wrapper');
  const noteToggle = root.querySelector('.notepad-toggle');
  const noteWrapper = root.querySelector('.notepad-message-wrapper');
  const noteClose = root.querySelector('.notepad-message-close');
  const notesListView = root.querySelector('#notes-list-view');
  const noteEditorView = root.querySelector('#note-editor-view');
  const editorEl = root.querySelector('#note-editor');
  const saveStatus = root.querySelector('#save-status');
  const backToListBtn = root.querySelector('.back-to-list');
  const deleteNoteBtn = root.querySelector('.delete-note-btn');
  const currentNoteTitleEl = root.querySelector('#current-note-title');
  const notepadTitle = root.querySelector('#notepad-title');
  const messageHeader = root.querySelector('.notepad-message-header');

  const collectionName = root.getAttribute('data-notes-collection') || '';
  const userId = root.getAttribute('user-id') || '';
  const saveField = root.getAttribute('save-data-to') || '';
  const retrieveField = root.getAttribute('get-notes-title') || '';

  const NotesTraits = {
    collectionName,
    userId,
    retrieveField,
    saveField,
  };
  console.log('🚀 ~ loadNotesData ~ NotesTraits:', NotesTraits);
  const COOKIE_KEYS = {
    BUTTON_POSITION: 'notepad_button_position',
    POPUP_POSITION: 'notepad_popup_position',
    LAST_TAB: 'notepad_last_tab',
    NOTES_DATA: 'notesManagerData',
    TITLES_DATA: 'notesTitlesData',
  };

  let currentTab = null;
  let saveTimeout;
  let notesData = {};
  let notesTitles = {};
  let clickLock = false;

  const loadButtonPosition = () => {
    try {
      const savedPosition = JSON.parse(sessionStorage.getItem(COOKIE_KEYS.BUTTON_POSITION));
      if (savedPosition) {
        const { left, top } = savedPosition;
        notepadWrapper.style.left = `${left}px`;
        notepadWrapper.style.top = `${top}px`;
        notepadWrapper.style.bottom = 'auto';
        notepadWrapper.style.right = 'auto';
        console.log('✅ Button position restored:', { left, top });
      }
    } catch (error) {
      console.error('Error loading button position:', error);
    }
  };

  const saveButtonPosition = () => {
    try {
      const rect = notepadWrapper.getBoundingClientRect();
      const position = {
        left: rect.left,
        top: rect.top,
      };
      sessionStorage.setItem(COOKIE_KEYS.BUTTON_POSITION, JSON.stringify(position));
      console.log('💾 Button position saved:', position);
    } catch (error) {
      console.error('Error saving button position:', error);
    }
  };

  const loadPopupPosition = () => {
    try {
      const savedPosition = JSON.parse(sessionStorage.getItem(COOKIE_KEYS.POPUP_POSITION));
      if (savedPosition) {
        const { left, top } = savedPosition;
        noteWrapper.style.position = 'fixed';
        noteWrapper.style.left = `${left}px`;
        noteWrapper.style.top = `${top}px`;
        noteWrapper.style.bottom = 'auto';
        noteWrapper.style.right = 'auto';
        console.log('✅ Popup position restored:', { left, top });
      }
    } catch (error) {
      console.error('Error loading popup position:', error);
    }
  };

  const savePopupPosition = () => {
    try {
      const rect = noteWrapper.getBoundingClientRect();
      const position = {
        left: rect.left,
        top: rect.top,
      };
      sessionStorage.setItem(COOKIE_KEYS.POPUP_POSITION, JSON.stringify(position));
      console.log('💾 Popup position saved:', position);
    } catch (error) {
      console.error('Error saving popup position:', error);
    }
  };

  const saveLastTab = (tabId) => {
    try {
      sessionStorage.setItem(COOKIE_KEYS.LAST_TAB, tabId);
      console.log('💾 Last tab saved:', tabId);
    } catch (error) {
      console.error('Error saving last tab:', error);
    }
  };

  const loadLastTab = () => {
    try {
      const lastTab = sessionStorage.getItem(COOKIE_KEYS.LAST_TAB);
      console.log('✅ Last tab retrieved:', lastTab);
      return lastTab;
    } catch (error) {
      console.error('Error loading last tab:', error);
      return null;
    }
  };

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let wrapperStartX = 0;
  let wrapperStartY = 0;

  const initButtonDrag = () => {
    noteToggle.addEventListener('mousedown', startButtonDrag);
    document.addEventListener('mousemove', dragButton);
    document.addEventListener('mouseup', stopButtonDrag);
    noteToggle.addEventListener('touchstart', startButtonDragTouch, { passive: false });
    document.addEventListener('touchmove', dragButtonTouch, { passive: false });
    document.addEventListener('touchend', stopButtonDrag);
  };

  const startButtonDrag = (e) => {
    isDragging = true;
    noteToggle.classList.add('dragging');
    const rect = notepadWrapper.getBoundingClientRect();
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    wrapperStartX = rect.left;
    wrapperStartY = rect.top;
    e.preventDefault();
    e.stopPropagation();
  };

  const startButtonDragTouch = (e) => {
    isDragging = true;
    noteToggle.classList.add('dragging');
    const touch = e.touches[0];
    const rect = notepadWrapper.getBoundingClientRect();
    dragStartX = touch.clientX;
    dragStartY = touch.clientY;
    wrapperStartX = rect.left;
    wrapperStartY = rect.top;
    e.preventDefault();
    e.stopPropagation();
  };

  const dragButton = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;
    const newX = wrapperStartX + deltaX;
    const newY = wrapperStartY + deltaY;
    const maxX = window.innerWidth - notepadWrapper.offsetWidth;
    const maxY = window.innerHeight - notepadWrapper.offsetHeight;
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    notepadWrapper.style.left = `${constrainedX}px`;
    notepadWrapper.style.top = `${constrainedY}px`;
    notepadWrapper.style.bottom = 'auto';
    notepadWrapper.style.right = 'auto';
    e.preventDefault();
  };

  const dragButtonTouch = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartX;
    const deltaY = touch.clientY - dragStartY;
    const newX = wrapperStartX + deltaX;
    const newY = wrapperStartY + deltaY;
    const maxX = window.innerWidth - notepadWrapper.offsetWidth;
    const maxY = window.innerHeight - notepadWrapper.offsetHeight;
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    notepadWrapper.style.left = `${constrainedX}px`;
    notepadWrapper.style.top = `${constrainedY}px`;
    notepadWrapper.style.bottom = 'auto';
    notepadWrapper.style.right = 'auto';
    e.preventDefault();
  };

  const stopButtonDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    noteToggle.classList.remove('dragging');

    const deltaX = Math.abs(e.clientX - dragStartX);
    const deltaY = Math.abs(e.clientY - dragStartY);

    saveButtonPosition();

    if (deltaX < 5 && deltaY < 5) {
      setTimeout(() => {
        toggleNotepad();
      }, 50);
    }
  };

  const initPopupDrag = () => {
    messageHeader.addEventListener('mousedown', startPopupDrag);
    document.addEventListener('mousemove', dragPopup);
    document.addEventListener('mouseup', stopPopupDrag);
    messageHeader.addEventListener('touchstart', startPopupDragTouch, { passive: false });
    document.addEventListener('touchmove', dragPopupTouch, { passive: false });
    document.addEventListener('touchend', stopPopupDrag);
  };

  let isDraggingPopup = false;
  let popupDragStartX = 0;
  let popupDragStartY = 0;
  let popupStartX = 0;
  let popupStartY = 0;

  const startPopupDrag = (e) => {
    if (e.target.classList.contains('notepad-message-close')) return;
    isDraggingPopup = true;
    const rect = noteWrapper.getBoundingClientRect();
    popupDragStartX = e.clientX;
    popupDragStartY = e.clientY;
    popupStartX = rect.left;
    popupStartY = rect.top;
    e.preventDefault();
  };

  const startPopupDragTouch = (e) => {
    if (e.target.classList.contains('notepad-message-close')) return;
    isDraggingPopup = true;
    const touch = e.touches[0];
    const rect = noteWrapper.getBoundingClientRect();
    popupDragStartX = touch.clientX;
    popupDragStartY = touch.clientY;
    popupStartX = rect.left;
    popupStartY = rect.top;
    e.preventDefault();
  };

  const dragPopup = (e) => {
    if (!isDraggingPopup) return;
    const deltaX = e.clientX - popupDragStartX;
    const deltaY = e.clientY - popupDragStartY;
    const newX = popupStartX + deltaX;
    const newY = popupStartY + deltaY;
    const maxX = window.innerWidth - noteWrapper.offsetWidth;
    const maxY = window.innerHeight - noteWrapper.offsetHeight;
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    noteWrapper.style.position = 'fixed';
    noteWrapper.style.left = `${constrainedX}px`;
    noteWrapper.style.top = `${constrainedY}px`;
    noteWrapper.style.bottom = 'auto';
    noteWrapper.style.right = 'auto';
    e.preventDefault();
  };

  const dragPopupTouch = (e) => {
    if (!isDraggingPopup) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - popupDragStartX;
    const deltaY = touch.clientY - popupDragStartY;
    const newX = popupStartX + deltaX;
    const newY = popupStartY + deltaY;
    const maxX = window.innerWidth - noteWrapper.offsetWidth;
    const maxY = window.innerHeight - noteWrapper.offsetHeight;
    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));
    noteWrapper.style.position = 'fixed';
    noteWrapper.style.left = `${constrainedX}px`;
    noteWrapper.style.top = `${constrainedY}px`;
    noteWrapper.style.bottom = 'auto';
    noteWrapper.style.right = 'auto';
    e.preventDefault();
  };

  const stopPopupDrag = () => {
    if (!isDraggingPopup) return;
    isDraggingPopup = false;

    savePopupPosition();
  };

  const getTextPreview = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  const loadAllNotes = () => {
    return renderNotesData(element, NotesTraits, undefined, undefined).then((response) => {
      try {
        notesData = JSON.parse(response.notes || '{}');
        notesTitles = JSON.parse(response.titles || '{}');
        const id = response.id || '';

        console.log('🚀 ~ loadAllNotes ~ notesData:', notesData);
        console.log('🚀 ~ loadAllNotes ~ notesTitles:', notesTitles);

        return { notesData, notesTitles, id: id };
      } catch (error) {
        console.error('Error parsing notes data:', error);
        notesData = {};
        notesTitles = {};
        return { notesData, notesTitles, id: '' };
      }
    });
  };

  const getNoteTitle = (noteId) => {
    return notesTitles[noteId] || `Untitled Note`;
  };

  const renderNotesList = () => {
    notesListView.innerHTML = '';

    const noteIds = Object.keys(notesData);

    if (noteIds.length === 0) {
      notesListView.innerHTML = `
        <div class="empty-notes">
          <div class="empty-notes-icon">📝</div>
          <div class="empty-notes-text">No notes yet</div>
          <div style="font-size: 14px; color: #9ca3af;">Click below to create your first note</div>
        </div>
      `;
    } else {
      noteIds.forEach((noteId, index) => {
        const noteContent = notesData[noteId] || '';
        const notePreview = getTextPreview(noteContent);
        const noteTitle = getNoteTitle(noteId);

        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.dataset.noteId = noteId;
        noteCard.innerHTML = `
          <div class="note-card-title">${noteTitle}</div>
          <div class="note-card-preview">${notePreview || 'Empty note'}</div>
        `;

        noteCard.addEventListener('click', () => {
          openNoteEditor(noteId);
        });

        notesListView.appendChild(noteCard);
      });
    }

    const addNoteCard = document.createElement('div');
    addNoteCard.className = 'note-card add-note-card';
    addNoteCard.innerHTML = '+ Create New Note';
    addNoteCard.addEventListener('click', createNewNote);
    notesListView.appendChild(addNoteCard);
  };

  const openNoteEditor = (noteId) => {
    currentTab = noteId;

    saveLastTab(noteId);

    notesListView.style.display = 'none';
    noteEditorView.classList.add('active');

    const noteTitle = getNoteTitle(noteId);
    notepadTitle.textContent = noteTitle;
    currentNoteTitleEl.textContent = noteTitle;

    currentNoteTitleEl.contentEditable = 'true';
    currentNoteTitleEl.style.cursor = 'text';

    editorEl.innerHTML = notesData[noteId] || '';
    if (saveStatus) saveStatus.textContent = '';
  };

  const closeNoteEditor = () => {
    if (currentTab) {
      if (editorEl.innerHTML !== notesData[currentTab]) {
        saveNote(currentTab, editorEl.innerHTML);
      }

      const newTitle = currentNoteTitleEl.textContent.trim();
      if (newTitle && newTitle !== notesTitles[currentTab]) {
        saveTitlechange(currentTab, newTitle);
      }
    }

    noteEditorView.classList.remove('active');
    notesListView.style.display = 'flex';
    notepadTitle.textContent = 'My Notes';
    const lastTab = loadLastTab();
    if (lastTab === currentTab) {
      sessionStorage.removeItem(COOKIE_KEYS.LAST_TAB);
    }
    currentTab = null;
    renderNotesList();
  };

  const createNewNote = () => {
    const newId = Date.now().toString();
    notesData[newId] = '';
    notesTitles[newId] = 'New Note';

    saveNote(newId, '', true);

    openNoteEditor(newId);
  };

  const deleteCurrentNote = () => {
    if (!currentTab) return;

    const tabToDelete = currentTab;

    delete notesData[currentTab];
    delete notesTitles[currentTab];

    console.log('🚀 ~ deleteCurrentNote ~ notesData:', notesData);
    console.log('🚀 ~ deleteCurrentNote ~ notesTitles:', notesTitles);

    sessionStorage.setItem(COOKIE_KEYS.NOTES_DATA, JSON.stringify(notesData));
    sessionStorage.setItem(COOKIE_KEYS.TITLES_DATA, JSON.stringify(notesTitles));

    const lastTab = loadLastTab();
    if (lastTab === tabToDelete) {
      sessionStorage.removeItem(COOKIE_KEYS.LAST_TAB);
    }

    renderNotesData(element, NotesTraits, JSON.stringify(notesData), JSON.stringify(notesTitles));

    toastr.success('Notes Deleted Successfully', 'Success');

    currentTab = undefined;
    closeNoteEditor();
  };

  const saveNote = (tab, content, skipTitleSave = false) => {
    notesData[tab] = content;

    sessionStorage.setItem(COOKIE_KEYS.NOTES_DATA, JSON.stringify(notesData));

    if (skipTitleSave) {
      sessionStorage.setItem(COOKIE_KEYS.TITLES_DATA, JSON.stringify(notesTitles));
      renderNotesData(element, NotesTraits, JSON.stringify(notesData), JSON.stringify(notesTitles));
    } else {
      renderNotesData(element, NotesTraits, JSON.stringify(notesData), undefined);
    }

    if (saveStatus) saveStatus.textContent = 'Saved ✓';
    setTimeout(() => {
      if (saveStatus) saveStatus.textContent = '';
    }, 2000);
  };

  const saveTitlechange = (tab, newTitle) => {
    notesTitles[tab] = newTitle;
    sessionStorage.setItem(COOKIE_KEYS.TITLES_DATA, JSON.stringify(notesTitles));

    renderNotesData(element, NotesTraits, undefined, JSON.stringify(notesTitles));

    console.log('🚀 ~ Title saved for note:', tab, 'Title:', newTitle);
  };

  const toggleNotepad = () => {
    const isVisible = noteWrapper.classList.contains('show');
    console.log('🚀 ~ toggleNotepad ~ isVisible:', isVisible);

    if (isVisible) {
      noteWrapper.classList.remove('show');
      console.log('🔒 Notepad closed');
    } else {
      console.log('notesData', notesData);
      if (Object.keys(notesData).length === 0) {
        initialize().then(() => {
          noteWrapper.classList.add('show');
        });
      } else {
        const lastTab = loadLastTab();
        if (lastTab && notesData[lastTab]) {
          console.log('📂 Opening last tab:', lastTab);
          openNoteEditor(lastTab);
        } else {
          renderNotesList();
        }
        noteWrapper.classList.add('show');
      }
      console.log('🔓 Notepad opened');
    }
  };

  const initialize = async () => {
    loadButtonPosition();
    loadPopupPosition();

    const userNotes = await loadAllNotes();
    noteWrapper.setAttribute('data-item-id', userNotes?.id || '');
    renderNotesList();
    const lastTab = loadLastTab();
    if (lastTab && notesData[lastTab]) {
      console.log(':open_file_folder: Last tab available:', lastTab);
    }
  };

  initButtonDrag();
  initPopupDrag();

  noteClose.addEventListener('click', () => {
    if (currentTab) closeNoteEditor();
    noteWrapper.classList.remove('show');
  });

  backToListBtn.addEventListener('click', closeNoteEditor);

  deleteNoteBtn.addEventListener('click', deleteCurrentNote);

  editorEl.setAttribute('contenteditable', 'true');
  editorEl.style.cursor = 'text';

  editorEl.addEventListener('input', () => {
    if (saveStatus) saveStatus.textContent = 'Typing...';
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if (currentTab) saveNote(currentTab, editorEl.innerHTML);
    }, 800);
  });

  let titleSaveTimeout;
  currentNoteTitleEl.addEventListener('input', () => {
    clearTimeout(titleSaveTimeout);
    titleSaveTimeout = setTimeout(() => {
      if (currentTab) {
        const newTitle = currentNoteTitleEl.textContent.trim();
        if (newTitle && newTitle !== notesTitles[currentTab]) {
          saveTitlechange(currentTab, newTitle);
          notepadTitle.textContent = newTitle;
        }
      }
    }, 1000);
  });

  currentNoteTitleEl.addEventListener('blur', () => {
    if (currentTab) {
      const newTitle = currentNoteTitleEl.textContent.trim();
      if (!newTitle) {
        currentNoteTitleEl.textContent = notesTitles[currentTab] || 'Untitled Note';
      } else if (newTitle !== notesTitles[currentTab]) {
        saveTitlechange(currentTab, newTitle);
        notepadTitle.textContent = newTitle;
      }
    }
  });

  initialize();
};
