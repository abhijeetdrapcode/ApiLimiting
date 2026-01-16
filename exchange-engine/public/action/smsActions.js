const sendDynamicMessage = async function (args) {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    let itemId = targetElement ? targetElement.getAttribute('data-item-id') : '';
    let propagateItemId = '';
    const previousResponse = args.response;
    // itemId = previousResponse ? previousResponse.data['uuid'] : itemId;

    if (!itemId && previousResponse) {
      const { collectionSaveOrUpdateResponse } = previousResponse;
      if (collectionSaveOrUpdateResponse) {
        const { data: collectionItemData } = collectionSaveOrUpdateResponse;
        itemId = collectionItemData.uuid;
      }
    }
    let previousActionResponse = sessionStorage.getItem('previousActionResponse');
    previousActionResponse = previousActionResponse ? JSON.parse(previousActionResponse) : {};
    if (previousActionResponse) {
      let collectionKey = `parentCollectionToPropagate`;
      if (previousActionResponse[collectionKey]) {
        let collectionName = previousActionResponse[collectionKey].name;
        let collectionItemId = previousActionResponse[collectionKey].uuid;
        propagateItemId = collectionItemId;
      }
    }
    let previousActionFormData = sessionStorage.getItem('previousActionFormData');
    previousActionFormData = previousActionFormData ? JSON.parse(previousActionFormData) : {};
    // Get Browser Storage Data Object
    const browserData = await getBrowserData();
    const formData = {
      itemId,
      propagateItemId,
      templatesRules: parameters.templatesRules,
      previousActionResponse,
      previousActionFormData,
      ...browserData,
    };
    let response = {};
    let result = {};
    if (parameters) {
      try {
        const endpoint = 'sms/send-dynamic-sms';
        result = await unSecuredPostCall(formData, endpoint);
        response.data = { ...previousResponse, ...result };
        response.status = 'success';
      } catch (error) {
        console.log('%c==> Error :>> ', 'color:yellow', error);
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
