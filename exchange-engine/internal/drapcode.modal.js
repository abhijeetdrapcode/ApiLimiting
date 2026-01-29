/**
 * Modals
 */
const getModalItemData = async (
  collectionItemData,
  modalHasExternalApi = false,
  externalApiData = {},
) => {
  let result = {};
  let collectionId = '';
  let collectionItemId = '';
  const modalExternalApiData = {};
  let fetchItemDataFrom = 'COLLECTION';

  if (modalHasExternalApi) {
    const modalExternalAPISpan = window.document.getElementById('project-modal-external-api');
    if (modalExternalAPISpan) {
      initialiseExternalApiDataFromSpan(modalExternalAPISpan, modalExternalApiData);
    }
    if (externalApiData && externalApiData.id) {
      Object.assign(modalExternalApiData, externalApiData);
      fetchItemDataFrom = 'EXTERNAL_API';
    } else if (modalExternalApiData && modalExternalApiData.id) {
      fetchItemDataFrom = 'EXTERNAL_API';
    }
  }
  parentPageCollectionData();
  if (collectionItemData) {
    collectionId = collectionItemData.collectionId;
    collectionItemId = collectionItemData.itemId;
    collectionItemId = replaceUnderscoreWithSlash(collectionItemId);
  }

  // TODO: Need to Handle Persistent & Non-Persistent Data when Snippet Type has Collection or External API binded to it.
  switch (fetchItemDataFrom) {
    case 'EXTERNAL_API':
      // Fetch Item Data from External API binded to Page
      console.log('processing for non-persistent item... ');
      result = await doProcessForNonPersistentData(
        collectionItemId,
        collectionId,
        modalExternalApiData,
      );
      break;
    default:
      // Fetch Item Data from Collection binded to Page
      result = await doProcessForCollectionData(collectionItemId, collectionId);
      break;
  }
  return result;
};

const extractAllComponent = (listComponent, components) => {
  components.forEach((component) => {
    if (component.components) {
      extractAllComponent(listComponent, component.components);
    }
    listComponent.push(component);
  });
};

const checkComponents = (modalComponents) => {
  const listComponents = [];
  if (modalComponents) {
    const components = JSON.parse(modalComponents);
    if (components || components.length > 0) {
      extractAllComponent(listComponents, components);
    }
  }

  let formComponents = listComponents.filter((comp) => comp.tagName === 'form');
  let formTheme = [];
  let formComponentThemes = [];

  formComponents.forEach((formComponent) => {
    formTheme = [];
    if (formComponent && formComponent.classes && Array.isArray(formComponent.classes)) {
      formTheme = formComponent.classes.filter(
        (cls) => cls.name.startsWith('dc-form-theme') || cls.name.startsWith('dc-form-default'),
      );
    }
    if (formTheme && formTheme[0]) {
      if (!formComponentThemes.includes(formTheme[0].name)) {
        formComponentThemes.push(formTheme[0].name);
      }
    }
  });

  let defaultFormExist = formComponentThemes.includes('dc-form-default');
  return defaultFormExist;
};

const checkForTextAreaType = async (query) => {
  const textareas = $(`${query} textarea`);
  let isTextareaFieldExist = textareas.length;
  if (isTextareaFieldExist) {
    initializeSummerNoteWYSIWYGEditor(textareas);
  }
};

const checkForDateType = (query) => {
  const dateField = document.querySelectorAll(
    `${query} input[type='datetime-local'], ${query} input[type='date']`,
  );
  if (dateField.length) {
    dateField.forEach((input) => {
      addFlatPickerToElement(input);
    });
  }
};
const checkForTimepickerType = (query) => {
  let timepickerFields = document.querySelectorAll(
    `${query} input[type=text][data-component-type=time_picker]`,
  );
  console.log('🚀 ~ drapcode modal ~ timepickerFields:', timepickerFields);
  let isTimepickerFieldExist = !!timepickerFields.length;
  console.log('🚀 ~ drapcode modal ~ isTimepickerFieldExist:', isTimepickerFieldExist);
  if (isTimepickerFieldExist) {
    timepickerFields.forEach((input) => {
      addTimePickerToElement(input);
    });
  }
};

const checkForSegregatedDateType = (query) => {
  // Main logic for date-segregated fields
  console.log('🚀 ~ checkForSegregatedDateType ~ query:', query);
  const dateSegregatedFields = queryElements(`${query} ${DATE_SEGREGATED_FIELD_SELECTOR}`);
  console.log('🚀 ~ dateSegregatedFields:', dateSegregatedFields);
  const isDateSegregateFieldExist = !!dateSegregatedFields.length;
  console.log(
    '🚀 ~ checkForSegregatedDateType ~ isDateSegregateFieldExist:',
    isDateSegregateFieldExist,
  );

  if (isDateSegregateFieldExist) {
    const daySegregatedFields = queryElements(`${query} ${DAY_SEGREGATED_FIELD_SELECTOR}`);
    const monthSegregatedFields = queryElements(`${query} ${MONTH_SEGREGATED_FIELD_SELECTOR}`);
    const yearSegregatedFields = queryElements(`${query} ${YEAR_SEGREGATED_FIELD_SELECTOR}`);

    // Populate day, month, and year fields
    populateDropdownFields(daySegregatedFields, 'day');
    populateDropdownFields(monthSegregatedFields, 'month');
    populateDropdownFields(yearSegregatedFields, 'year', SEGREGATED_DATE_QNT_YEARS, CURRENT_YEAR);
  }
};

// TODO: Need to remove because we are loading it by default
const checkForTelType = async (query) => {
  const phoneNumberFields = $(`${query} input[type=tel]`);
  let isPhoneNumberFieldExist = phoneNumberFields.length;
  if (isPhoneNumberFieldExist) {
    phoneNumberFields.each(function () {
      let initialCountry = $(this).attr('defaultcountry') || 'us'; // fallback
      let allowedAttr = $(this).attr('allowedcountries') || '';
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
  }
};

const checkForSelectType = (query) => {
  $(`${query} .select`).on('change', function () {
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
};

const extractModalFormComponent = (elemId) => {
  const modalFormElem = $(`[id^=${elemId}] form`);
  let ismodalFormElemExist = modalFormElem.length;
  if (ismodalFormElemExist) {
    return modalFormElem;
  } else {
    return '';
  }
};

const collectionFormDetailForModalUpdate = async (form, item) => {
  const isDisableItemId = form && form.hasAttribute('disableitemid');
  if (!isDisableItemId) {
    form.method = 'put';
    form.setAttribute('action', form.getAttribute('action') + '/' + item.uuid);
  }
};

const addModalExternalScriptUrl = (modal, modalContainer) => {
  if (modal.externalScriptURL) {
    const externalScriptURLs =
      modal && modal.externalScriptURL ? modal.externalScriptURL.split(',') : '';

    externalScriptURLs &&
      externalScriptURLs.forEach((externalScriptURL) => {
        let jsFileUrl = document.createElement('script');
        jsFileUrl.src = externalScriptURL.trim();
        jsFileUrl.async = true;
        jsFileUrl.defer = true;
        modalContainer.appendChild(jsFileUrl); //append it as src to body
      });
  }
};

const addModalCustomScript = (modal, modalContainer) => {
  if (modal.customScript) {
    let customScriptContent = modal.customScript.trim();
    let clearScriptTags = customScriptContent.startsWith('<script>')
      ? customScriptContent.replace('<script>', '')
      : customScriptContent;
    clearScriptTags = clearScriptTags.endsWith('</script>')
      ? clearScriptTags.replace('</script>', '')
      : clearScriptTags;

    let newScript = document.createElement('script');
    let inlineScript = document.createTextNode(`${clearScriptTags.trim()}`);
    newScript.appendChild(inlineScript);
    modalContainer.appendChild(newScript);
  }
};

const fetchCollectionByName = async (collectionId) => {
  if (collectionId) {
    const collectionEndpoint = `collection-details/${collectionId}/name`;
    const collectionResponse = await securedGetCall(collectionEndpoint);
    if (collectionResponse && collectionResponse.status === 200) {
      return collectionResponse.data;
    } else {
      return null;
    }
  }
};

const checkAndCreateValidationJS = async (listComponents, modalContainer) => {
  // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
  new Promise(function (resolve, reject) {
    resolve(listComponents);
  });
  let allFormWithValidationAttrs = [];
  if (listComponents) {
    allFormWithValidationAttrs = listComponents.filter((comp) => {
      if (comp && comp.attributes) {
        return Object.keys(comp.attributes).includes('data-form-validation');
      }
    });
  }

  const allValidations = await allFormWithValidationAttrs.map(async (form) => {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(form);
    });
    const { attributes } = form;
    const formId = attributes['id'];
    const collectionName = attributes['data-form-collection'];
    const validationUUID = attributes['data-form-validation'];
    const collection = await fetchCollectionByName(collectionName);
    const { validations } = collection;

    const validation =
      validations && validations.length > 0
        ? validations.find((val) => val.uuid === validationUUID)
        : null;
    if (validation) {
      const { validationRules } = validation;
      const rules = {};
      const messages = {};
      validationRules.forEach((valRul) => {
        const checkAlreadyExistRule = rules[valRul.field];
        if (checkAlreadyExistRule) {
          checkAlreadyExistRule[valRul.key] = valRul.value;
          rules[valRul.field] = checkAlreadyExistRule;
        } else {
          rules[valRul.field] = {
            [valRul.key]: valRul.value,
          };
        }

        const checkAlreadyExistMessage = messages[valRul.field];
        if (checkAlreadyExistMessage) {
          checkAlreadyExistMessage[valRul.key] = valRul.message;
          messages[valRul.field] = checkAlreadyExistMessage;
        } else {
          messages[valRul.field] = {
            [valRul.key]: valRul.message,
          };
        }
      });

      const validationDetail = {
        rules,
        messages,
      };
      const formValidationStr = `$("#${formId}").validate(${JSON.stringify(validationDetail)});`;
      return formValidationStr;
    }
    return '';
  });

  const allValidationStr = (await Promise.all(allValidations)).join('\n');
  let newScript = document.createElement('script');
  let inlineScript = document.createTextNode(`${allValidationStr.trim()}`);
  newScript.appendChild(inlineScript);
  modalContainer.appendChild(newScript);
};

const extractModalFormComponents = (modalComponents) => {
  const listComponents = [];
  if (modalComponents) {
    const components = JSON.parse(modalComponents);
    if (components || components.length > 0) {
      extractAllComponent(listComponents, components);
    }
  }

  let formComponents = listComponents.filter((comp) => comp.tagName === 'form');
  return formComponents;
};

const parentPageCollectionData = () => {
  const sessionStorage = window.sessionStorage;

  const pathArray = window.location.pathname.split('/');
  const pageCollectionId = pathArray[pathArray.length - 2];
  let pageCollectionItemId = pathArray[pathArray.length - 1];

  if (pageCollectionItemId && pageCollectionItemId.includes('_')) {
    pageCollectionItemId = pageCollectionItemId.split('_')[1];
  }

  const pageCollectionKey = `page_collection`;
  const pageCollectionData = {
    [pageCollectionKey]: {
      ['name']: pageCollectionId && pageCollectionItemId ? pageCollectionId : '',
      ['itemId']: pageCollectionId && pageCollectionItemId ? pageCollectionItemId : '',
    },
  };

  let previousActionResponse = sessionStorage.getItem('previousActionResponse');
  if (previousActionResponse) {
    previousActionResponse = JSON.parse(previousActionResponse);
    sessionStorage.setItem(
      'previousActionResponse',
      JSON.stringify({ ...previousActionResponse, ...pageCollectionData }),
    );
  } else {
    sessionStorage.setItem('previousActionResponse', JSON.stringify(pageCollectionData));
  }
};

const addEventsScriptForSnippet = async (content, modalContainer) => {
  const eventsContent = [];
  const endpoint = `events`;
  const response = await securedGetCall(endpoint);
  let events = '';

  if (response && response.status === 200) {
    events = response.data;
  }

  if (content && events) {
    let modalContent = content['nocode-html'];
    if (modalContent && modalContent !== 'undefined') {
      events.forEach((event) => {
        if (modalContent.includes(event.eventName)) {
          let eventScript = `async function ${event.eventName}(ev, url_params={}){
                            let element,targetElement, formID; 
                            if(ev){
                              element =  ev.target|| ev.srcElement ;
                              targetElement = ev.currentTarget ;
                              ev.preventDefault();
                              formID = element && element.id ? $("#"+element.id):'';
                            }
                            const ifValidToProcess = ev && ev.type === "submit" ? formID && formID.valid() && formID.validate().pendingRequest === 0 : true;
                            let formSubmitBtn;
                            let formSubmitBtnText;
                            if(formID){
                             formSubmitBtn = formID.find(':button[type=submit]');
                             formSubmitBtnText = formSubmitBtn.html()
                            }
                if(ifValidToProcess) {
                  let { dataset: targetElemDataset } = element || {};
                  let preventDblClick = false;
                  if (targetElemDataset && targetElemDataset.hasOwnProperty('preventDblclick')) {
                    preventDblClick = true;
                  }
                  if (preventDblClick) {
                    let timeoutDuration = 5000;
                    if (targetElemDataset.hasOwnProperty('disableDuration')) {
                      const typeOfDisableDurationValue = typeof Number(targetElemDataset['disableDuration']);
                      if (typeOfDisableDurationValue === 'number') {
                        timeoutDuration = Number(targetElemDataset['disableDuration']);
                      }
                    }
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.5';
                    setTimeout(() => {
                      element.style.pointerEvents = 'auto';
                      element.style.opacity = '1';
                    }, timeoutDuration);
                  }
                  formSubmitBtn && formSubmitBtn.prop('disabled', true);
                  formSubmitBtn && formSubmitBtn.empty().append("<i class='fa fa-spinner fa-spin'></i>");
                  let response= null;
                  try{`;
          event.actions
            .filter((action) => !!action.step)
            .sort((a, b) => {
              return a.step > b.step ? 1 : a.step == b.step ? 0 : -1;
            })
            .forEach((action) => {
              const { parameters } = action;
              let args = {};
              parameters.forEach((parameter) => {
                args[parameter.name] = parameter.value;
              });
              const actionCalling = `
            if(response && response.status==='error' && ${action.name !== 'showAlertMessage'}){
              formSubmitBtn && formSubmitBtn.prop('disabled', false);
              formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);
              return;
                   }
            response = await ${action.name}({parameters:${JSON.stringify(
                args,
              )},response:response?response.data:'',element:element, targetElement:targetElement, url_params:url_params});`;
              eventScript += `\n  ${actionCalling}
            console.log(response);`;
            });
          eventScript += `
            formSubmitBtn && formSubmitBtn.prop('disabled', false);
            formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);
          }
          catch(error){
            formSubmitBtn && formSubmitBtn.prop('disabled', false);
            formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);  
              console.log("error", error);  
            }
          } else {
            console.log("I am submit event and not valid");
          }
        }`;
          eventsContent.push(eventScript.replaceAll('  ', '').replaceAll('\n', ''));
        }
      });
    }
  }
  eventsContent &&
    eventsContent.forEach((eventContent) => {
      let newScript = document.createElement('script');
      let inlineScript = document.createTextNode(`${eventContent.trim()}`);
      newScript.appendChild(inlineScript);
      modalContainer.appendChild(newScript);
    });
};

const renderForModalExternalAPI = async (modal, modalContainer) => {
  console.log('🚀 ~ renderForModalExternalAPI ~ modal:', modal);
  let externalApi = '';
  if (modal.collectionFrom && modal.collectionFrom === 'EXTERNAL_API') {
    const externalApiId = modal.externalApiId;
    if (externalApiId) {
      externalApi = await fetchExternalApiById(externalApiId, modal.uuid);
      appendExternalApiSpanElement(externalApi, externalApiId, modalContainer);
    }
  }
  return externalApi;
};

const fetchExternalApiById = async (externalApiId, snippetId = '') => {
  if (externalApiId) {
    let externalAPIData = {};
    const hostnameShort = getHostnameShort();
    const externalAPISessionData = sessionStorage.getItem(
      `__snippetExternalAPI_${hostnameShort}-${snippetId}`,
    );
    externalAPIData = externalAPISessionData ? JSON.parse(externalAPISessionData) : null;
    console.log('🚀 ~ fetchExternalApiById ~ externalAPIData #1:', externalAPIData);

    if (!externalAPIData) {
      const externalApiEndpoint = `external-api/id/${externalApiId}`;
      const externalApiResponse = await publicGetCall(externalApiEndpoint);
      if (externalApiResponse && externalApiResponse.status === 200) {
        externalAPIData = externalApiResponse.data;
        console.log('🚀 ~ fetchExternalApiById ~ externalAPIData #2:', externalAPIData);
        sessionStorage.setItem(
          `__snippetExternalAPI_${hostnameShort}-${snippetId}`,
          JSON.stringify(externalAPIData),
        );
        populateBrowserStorageKeyToReset(`__snippetExternalAPI_${hostnameShort}-${snippetId}`);
        return externalAPIData;
      } else {
        return null;
      }
    }
  } else {
    return null;
  }
};

const addComponentScriptToElem = (componentScript, modalContainer) => {
  if (componentScript) {
    let customScriptContent = componentScript.trim();
    let clearScriptTags = customScriptContent.startsWith('<script>')
      ? customScriptContent.replace('<script>', '')
      : customScriptContent;
    clearScriptTags = clearScriptTags.endsWith('</script>')
      ? clearScriptTags.replace('</script>', '')
      : clearScriptTags;

    let newScript = document.createElement('script');
    let inlineScript = document.createTextNode(`${clearScriptTags.trim()}`);
    newScript.appendChild(inlineScript);
    modalContainer.appendChild(newScript);
  }
};

const replaceNbsps = (str) => {
  const re = new RegExp(String.fromCharCode(160), 'g');
  return str.replace(re, ' ');
};

const appendExternalApiSpanElement = (externalApi, externalApiId, modalContainer) => {
  if (externalApi) {
    let spanElem = document.createElement('span');
    spanElem.id = 'project-modal-external-api';
    spanElem.style = 'display:none;';
    spanElem.setAttribute('data-external-api-id', externalApiId);
    const { responseDataMapping, bodyDataFrom, collectionMapping } = externalApi ? externalApi : '';
    if (bodyDataFrom && bodyDataFrom === 'NON_PERSISTENT_COLLECTION') {
      spanElem.setAttribute('data-external-api-data-from', bodyDataFrom);
    }
    const { selectedMapping } = responseDataMapping ? responseDataMapping : '';
    if (selectedMapping) {
      const uniqueItemKey = selectedMapping['_data_source_rest_api_primary_id']
        ? selectedMapping['_data_source_rest_api_primary_id']
        : '';
      if (uniqueItemKey) {
        spanElem.setAttribute('data-external-api-unique-key', uniqueItemKey);
      }
      spanElem.setAttribute(
        'data-external-api-response-mapping',
        JSON.stringify(selectedMapping).replace(/"/g, "'"),
      );
    }
    const { itemsPath } = responseDataMapping ? responseDataMapping : '';
    if (itemsPath) {
      spanElem.setAttribute('data-external-api-item-path', itemsPath);
    }

    if (collectionMapping) {
      spanElem.setAttribute(
        'data-external-api-request-mapping',
        JSON.stringify(collectionMapping).replace(/"/g, "'"),
      );
    }

    modalContainer.appendChild(spanElem);
  }
};
// Helper functions Starts
function loadCdnScriptDynamically(url, containerElem, callback, processCallback = false) {
  if (url) {
    console.log('🚀 ~ file: drapcode.js:9126 ~ loadScript ~ url:', url);
    let script;
    const scripts = Array.from(document.querySelectorAll('script'));
    const existingScript = scripts.find((script) => script.src === url);
    console.log('🚀 ~ file: drapcode.js:9130 ~ loadScript ~ existingScript:', existingScript);
    if (existingScript) {
      script = existingScript;
    } else {
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      containerElem.appendChild(script);
    }

    if (script.readyState) {
      script.onreadystatechange = () => {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          if (processCallback) {
            callback();
          }
        }
      };
    } else if (processCallback) {
      script.onload = () => callback();
    }
  }
}

function processVisibilityElements(container, compVisibilityDataJson, snippetType = 'Modal') {
  let visibilityElements = container.querySelectorAll('[data-vis-condition]');
  if (visibilityElements && visibilityElements.length) {
    console.log(`*** Processing Component Visibility in ${snippetType}...`);
    visibilityElements.forEach((visibilityElem) => {
      if (
        !(
          visibilityElem.closest('[data-js="data-table"]') ||
          visibilityElem.closest('[data-js="data-group"]')
        )
      ) {
        const visConditionJson = parseVisibilityCondition(visibilityElem);
        const visWhenCollectionFrom = visConditionJson['visWhenCollectionFrom'];
        const visWhenBsl = visConditionJson['visWhenBsl'];
        const visWhenBslKey = visConditionJson['visWhenBslKey'];

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

          //Preparing compVisibilityDataJson with browserData as itemData
          compVisibilityDataJson = {
            itemData: browserData,
          };
        }
        processComponentVisibilityCondition(visibilityElem, compVisibilityDataJson);
      }
    });
  }
}
// Helper functions Ends
