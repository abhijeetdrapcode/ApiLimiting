const signaturePadMap = new Map();

async function loadSignaturePad(canvas) {
  if (!canvas) throw new Error('Signature Pad Canvas not found.');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const signaturePadPlugin = await fetchInstalledPluginByCode('SIGNATURE_PAD');
  if (!signaturePadPlugin) throw new Error('Signature Pad Plugin is not installed.');

  const {
    penColor = '#000000',
    backgroundColor = null,
    minWidth = 0.5,
    maxWidth = 2.5,
  } = signaturePadPlugin?.setting;
  const options = {
    penColor,
    backgroundColor: backgroundColor ?? undefined,
    minWidth,
    maxWidth,
  };

  const signaturePad = new SignaturePad(canvas, options);
  // Paint background once if solid color is required
  if (backgroundColor) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  signaturePadMap.set(canvas.id, signaturePad);
}

const saveSignature = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters, targetElement } = args;
    const { pageSignPadComponent, collection, collectionField, successMessage, errorMessage } =
      parameters;

    const pageSignPadComponentId = pageSignPadComponent.split(':')[1];
    const signPadInstance = signaturePadMap.get(pageSignPadComponentId);

    if (!signPadInstance) throw new Error('Signature Pad Canvas not found.');
    if (signPadInstance.isEmpty()) throw new Error('Please provide a signature.');

    const { itemId } = await getItemIdForSnippet(collection, args, targetElement);
    if (!itemId) throw new Error('Item not found.');

    const canvas = signPadInstance.canvas;
    const formData = new FormData();
    let endpoint = `file/upload/${collection}/${collectionField}`;

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    formData.append('file', blob, 'signature.png');
    const { data: imageData } = await multipartFormDataSecuredCall(formData, endpoint);

    let data = {};
    let response = {};
    try {
      let endpoint = 'collection-form/' + collection + '/items/' + itemId;
      endpoint = 'open/' + endpoint;
      data = { [collectionField]: [imageData] };
      response.data = await unSecuredPutCall(data, endpoint);
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
    } finally {
      actionCompleted(args);
    }
  } else {
    return disabledActionResponse(args);
  }
};

const clearSignature = async (args) => {
  const actionEnabled = isActionEnabled(args);
  if (actionEnabled) {
    // Force promise to support Safari browser & fix Unhandled Promise Rejection on IOS device browsers
    new Promise(function (resolve, reject) {
      resolve(args);
    });
    const { parameters } = args;
    let { pageSignPadComponent } = parameters;
    pageSignPadComponent = pageSignPadComponent.split(':')[1];
    const signPadInstance = signaturePadMap.get(pageSignPadComponent);
    if (!signPadInstance) throw new Error('Signature Pad Canvas not found.');
    signPadInstance.clear();
    actionCompleted(args);
  } else {
    return disabledActionResponse(args);
  }
};
