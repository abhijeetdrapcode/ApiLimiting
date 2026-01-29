const stripeConnectCheckout = async (event) => {
  event.preventDefault();
  const targetData = event.target;

  console.log('==> stripeConnectCheckout :>> ');

  const priceField = targetData.attributes['data-item-price'];
  const priceFieldValue = priceField ? priceField.value : '';
  const nameField = targetData.attributes['data-item-name'];
  const nameFieldValue = nameField ? nameField.value : '';
  const descriptionField = targetData.attributes['data-item-description'];
  const descriptionFieldValue = descriptionField ? descriptionField.value : '';
  const customerFrom = targetData.attributes['data-item-customer-from'];
  const customerFromValue = customerFrom ? customerFrom.value : '';
  const customerField = targetData.attributes['data-item-customer-field'];
  const customerFieldName = customerField ? customerField.value : '';
  const itemUuid = targetData.attributes['data-item-id'];
  const itemUuidValue = itemUuid ? itemUuid.value : '';
  let collectionName = targetData.attributes['data-collection-id'];
  let collectionNameValue = collectionName ? collectionName.value : '';
  const selectedCollectionData = targetData.attributes['selectedcollectiondata'];
  const selectedCollectionDataValue = selectedCollectionData ? selectedCollectionData.value : '';
  const openInNewTab = targetData.attributes['data-newtab'];
  let customerValue = '';

  //Handling for Modal
  if (!collectionName) {
    let parentElem = targetData ? targetData.closest('[data-collection-id]') : '';
    if (parentElem) {
      collectionName = parentElem ? parentElem.getAttribute('data-collection-id') : '';
      collectionNameValue = collectionName || '';
    }
  }

  if (!priceField) {
    toastr.error('Please bind Price Field', 'Error');
    return;
  }
  if (!nameField) {
    toastr.error('Please bind Name Field', 'Error');
    return;
  }
  if (!descriptionField) {
    toastr.error('Please bind Description Field', 'Error');
    return;
  }
  if (!itemUuid) {
    toastr.error('Please bind Product Field', 'Error');
    return;
  }
  if (!collectionName) {
    toastr.error('Please bind Collection Name', 'Error');
    return;
  }

  if (!priceFieldValue) {
    toastr.error('Price Field is blank', 'Error');
    return;
  }
  if (!nameFieldValue) {
    toastr.error('Name Field is blank', 'Error');
    return;
  }
  if (!descriptionFieldValue) {
    toastr.error('Description Field is blank', 'Error');
    return;
  }
  if (!itemUuidValue) {
    toastr.error('Product Field is blank', 'Error');
    return;
  }
  if (!collectionNameValue) {
    toastr.error('Collection Name is blank', 'Error');
    return;
  }

  if (customerFromValue && customerFieldName) {
    if (isLoggedInUser()) {
      const loggedInUser = fetchLoggedInUserJson();
      customerValue = _.get(loggedInUser, customerFieldName);
    }
    console.log(
      '🚀 ~ stripeConnectCheckout ~ customer:',
      customerValue,
      ' ~ customer from: ',
      customerFromValue,
      ' ~ customer field: ',
      customerFieldName,
    );
  }

  const response = await securedPostCall(
    {
      itemUuid: itemUuidValue,
      priceField: priceFieldValue,
      collectionName: collectionNameValue,
      nameField: nameFieldValue,
      descriptionField: descriptionFieldValue,
      selectedCollectionData: selectedCollectionDataValue,
      customer: customerValue,
    },
    `stripe-connect/process-checkout`,
  );
  const { data: apiData } = response;
  if (apiData) {
    if (apiData.code === 303) {
      let targetValue = '_top';
      if (openInNewTab) {
        targetValue = '_blank';
      }
      if (apiData.url) window.open(apiData.url, targetValue);
    }
  }
};
