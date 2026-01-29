const imaginePayCheckout = async (event) => {
  event.preventDefault();
  const targetData = event.target;
  console.log('==> imaginePayCheckout :>> ');

  // 1
  const itemUuid = targetData.attributes['data-item-id'];
  if (!itemUuid) {
    toastr.error('Please bind Product Field', 'Error');
    return;
  }
  const itemUuidValue = itemUuid ? itemUuid.value : '';
  if (!itemUuidValue) {
    toastr.error('Product Field is blank', 'Error');
    return;
  }
  //2
  const collectionName = targetData.attributes['data-collection-id'];
  if (!collectionName) {
    toastr.error('Please bind Collection Name', 'Error');
    return;
  }
  const collectionNameValue = collectionName ? collectionName.value : '';
  if (!collectionNameValue) {
    toastr.error('Collection Name is blank', 'Error');
    return;
  }
  //3
  const providerIdField = targetData.attributes['provider_id'];
  if (!providerIdField) {
    toastr.error('Please bind Online Provider ID', 'Error');
    return;
  }
  const providerIdValue = providerIdField.value;
  if (!providerIdValue) {
    toastr.error('Online Provider ID is blank', 'Error');
    return;
  }
  //4
  const accountNumberField = targetData.attributes['account_number'];
  if (!accountNumberField) {
    toastr.error('Please bind Online Account Number', 'Error');
    return;
  }
  const accountNumberValue = accountNumberField.value;
  if (!accountNumberValue) {
    toastr.error('Online Account Number is blank', 'Error');
    return;
  }
  //5
  const dobField = targetData.attributes['dob'];
  if (!dobField) {
    toastr.error('Please bind Patient Date of Birth', 'Error');
    return;
  }
  const dobValue = dobField.value;
  if (!dobValue) {
    toastr.error('Patient Date of Birth is blank', 'Error');
    return;
  }
  //6
  const firstNameField = targetData.attributes['first_name'];
  if (!firstNameField) {
    toastr.error('Please bind Patient First Name', 'Error');
    return;
  }
  const firstNameValue = firstNameField.value;
  if (!firstNameValue) {
    toastr.error('Patient First Name is blank', 'Error');
    return;
  }
  //7
  const lastNameField = targetData.attributes['last_name'];
  if (!lastNameField) {
    toastr.error('Please bind Patient Last Name', 'Error');
    return;
  }
  const lastNameValue = lastNameField.value;
  if (!lastNameValue) {
    toastr.error('Patient Last Name is blank', 'Error');
    return;
  }
  //8
  const balanceField = targetData.attributes['balance'];
  if (!balanceField) {
    toastr.error('Please bind Balance', 'Error');
    return;
  }
  const balanceValue = balanceField.value;
  if (!balanceValue) {
    toastr.error('Balance is blank', 'Error');
    return;
  }
  //9
  const amountField = targetData.attributes['amount'];
  const amountValue = amountField ? amountField.value : '';
  //10
  const selectedCollectionData = targetData.attributes['selectedcollectiondata'];
  const selectedCollectionDataValue = selectedCollectionData ? selectedCollectionData.value : '';
  //11
  const serviceDescField = targetData.attributes['service_description'];
  const serviceDescValue = serviceDescField ? serviceDescField.value : '';
  //12
  const noteField = targetData.attributes['note'];
  const noteValue = noteField ? noteField.value : '';

  const sendObj = {
    itemUuid: itemUuidValue,
    collectionName: collectionNameValue,
    providerIdField: providerIdValue,
    accountNumberField: accountNumberValue,
    dobField: dobValue,
    firstNameField: firstNameValue,
    lastNameField: lastNameValue,
    balanceField: balanceValue,
    amountField: amountValue,
    serviceDescriptionField: serviceDescValue,
    noteField: noteValue,
    selectedCollectionData: selectedCollectionDataValue,
  };
  const previousBtnText = targetData.innerText;
  targetData.disabled = true;
  targetData.innerText = 'Processing Payment';
  try {
    const response = await securedPostCall(sendObj, `imagine-pay/process-checkout`);
    const { data } = response;
    if (data) {
      if (data.status === 'SUCCESS') {
        const parentDialog = document.createElement('div');
        parentDialog.setAttribute('id', 'imagine-pay-process-dialog');
        parentDialog.setAttribute('role', 'dialog');
        parentDialog.setAttribute('data-bs-toggle', 'modal');
        parentDialog.setAttribute('data-bs-backdrop', 'static');
        parentDialog.setAttribute('data-bs-keyboard', 'false');
        parentDialog.setAttribute('tabindex', '-1');
        parentDialog.setAttribute('class', 'modal fade show d-block modal-xl');

        const modalDialog = document.createElement('div');
        modalDialog.setAttribute('role', 'document');
        modalDialog.setAttribute(
          'class',
          'modal-dialog modal-dialog-centered modal-dialog-scrollable',
        );

        const modalContent = document.createElement('div');
        modalContent.setAttribute('class', 'modal-content');
        modalDialog.appendChild(modalContent);

        const modalHeader = document.createElement('div');
        modalHeader.setAttribute('class', 'modal-header');

        const title = document.createElement('h5');
        title.setAttribute('class', 'modal-title');
        title.innerText = 'Process Payment';
        modalHeader.appendChild(title);

        const titleButton = document.createElement('button');
        titleButton.setAttribute('class', 'btn close');
        titleButton.setAttribute('role', 'button');
        titleButton.setAttribute('type', 'button');
        titleButton.setAttribute('aria-label', 'Close');
        titleButton.innerText = 'X';
        modalHeader.appendChild(titleButton);

        const modalBody = document.createElement('div');
        modalBody.setAttribute('class', 'modal-body');

        const iframe = document.createElement('iframe');
        const attrs = [
          { key: 'id', value: 'imagine-pay-process' },
          { key: 'src', value: data.paymentUrl },
          { key: 'height', value: '100%' },
          { key: 'width', value: '100%' },
          { key: 'style', value: 'padding:10px;min-height:500px' },
        ];
        attrs.map((attr) => iframe.setAttribute(attr.key, attr.value));
        modalBody.appendChild(iframe);

        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        parentDialog.appendChild(modalDialog);
        document.body.appendChild(parentDialog);
        const backdrop = document.createElement('div');
        backdrop.setAttribute('class', 'modal-backdrop fade show');
        document.body.appendChild(backdrop);
        titleButton.addEventListener('click', () => {
          document.body.removeChild(parentDialog);
          document.body.removeChild(backdrop);
          targetData.disabled = false;
          targetData.innerText = previousBtnText;
        });
      } else {
        toastr.error(data.message, 'Error');
      }
    } else {
      toastr.error('Error', 'Error');
    }
  } catch (error) {
    console.log('error', error);
    targetData.disabled = false;
    targetData.innerText = 'Try Again';
    const response = error.response;
    if (response.data) {
      const { message } = response.data;
      toastr.error(message, 'Error');
    }
  }
};
const registerImaginePayCard = async (args) => {
  let form = args.element;
  const formData = await serializeFormData(form.elements);
  console.log('formData', formData);
  const cardExpMonth = formData.card_expiry_month;
  const cardExpYear = formData.card_expiry_year;
  const date = `${cardExpYear}-${cardExpMonth}-01`;
  const today = new Date();
  let currentMonth = `${today.getMonth() + 1}`;
  console.log('currentMonth', currentMonth.length);
  if (currentMonth.length === 1) {
    currentMonth = `0${currentMonth}`;
  }
  const currentDate = `${today.getFullYear()}-${currentMonth}-01`;
  console.log('currentDate', currentDate);
  console.log('date', date);

  const isExpired = moment(date).isBefore(currentDate);
  console.log('isExpired', isExpired);
  if (isExpired) {
    toastr.error('Please check expiry month/year', 'Error');
    return;
  }
  //Now make api call to register card
  try {
    const response = await securedPostCall(formData, `imagine-pay/register-card`);
    const { data } = response;
    console.log('data', data);
  } catch (error) {
    console.log('error', error);
  }
};
