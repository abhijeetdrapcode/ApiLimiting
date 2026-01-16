const bngPaymentCheckout = async (event) => {
  event.preventDefault();
  const targetData = event.target;
  console.log('==> bngPaymentCheckout :>> ');
  const quantityField = targetData.attributes['data-item-quantity'];
  console.log('quantityField', quantityField);
  const skuField = targetData.attributes['data-item-sku'];
  console.log('skuField', skuField);
  const descriptionField = targetData.attributes['data-item-description'];
  const quantityFieldValue = quantityField ? quantityField.value : '';
  const skuFieldValue = skuField ? skuField.value : '';
  const descriptionFieldValue = descriptionField ? descriptionField.value : '';
  console.log('Payment Object', {
    quantityFieldValue,
    skuFieldValue,
    descriptionField,
  });
  const itemUuid = targetData.attributes['data-item-id'];
  if (!itemUuid) {
    toastr.error('Please bind Product Field', 'Error');
    return;
  }
  const collectionName = targetData.attributes['data-collection-id'];
  if (!collectionName) {
    toastr.error('Please bind Collection Name', 'Error');
    return;
  }
  const selectedCollectionData = targetData.attributes['selectedcollectiondata'];
  const itemUuidValue = itemUuid ? itemUuid.value : '';
  if (!itemUuidValue) {
    toastr.error('Product Field is blank', 'Error');
    return;
  }
  const collectionNameValue = collectionName ? collectionName.value : '';
  if (!collectionNameValue) {
    toastr.error('Collection Name is blank', 'Error');
    return;
  }
  const selectedCollectionDataValue = selectedCollectionData ? selectedCollectionData.value : '';
  console.log('itemUuidValue', itemUuidValue);
  console.log('collectionNameValue', collectionNameValue);
  console.log('selectedCollectionDataValue', selectedCollectionDataValue);
  const sendObj = {
    quantityField: quantityFieldValue,
    skuField: skuFieldValue,
    descriptionField: descriptionFieldValue,
    itemUuid: itemUuidValue,
    collectionName: collectionNameValue,
    selectedCollectionData: selectedCollectionDataValue,
  };
  const currentHost = window.location.hostname;
  const response = await securedPostCall(sendObj, `bng-payment/process-checkout`);
  const { data } = response;
  if (data) {
    if (data.status === 'SUCCESS') {
      CollectCheckout.redirectToCheckout({
        lineItems: data.lineItems,
        type: data.type,
        collectShippingInfo: false,
        customerVault: {
          addCustomer: false,
        },
        successUrl: encodeURI(
          `https://${currentHost}/bng-payment-success/?transid=(TRANSACTION_ID)`,
        ),
        cancelUrl: `https://${currentHost}/bng-payment-cancel`,
        receipt: data.receipt,
      }).then((error) => {
        console.log(error);
      });
    } else {
      toastr.error(data.message, 'Error');
    }
  } else {
    toastr.error('Error', 'Error');
  }
};
