(function () {
  fetch(getBackendServerUrl() + 'events')
    .then(function (res) {
      return res.json();
    })
    .then((json) => {
      if (json) {
        let script_ele = document.createElement('script');

        json.forEach((event) => {
          let innerHTML = `async function ${event.eventName}(ev, url_params={}){
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
                                let response;let argsData;
                                try{`;
          event.actions
            .filter((action) => !!action.step)
            .sort((a, b) => {
              return a.step > b.step ? 1 : a.step == b.step ? 0 : -1;
            })
            .forEach((action, key) => {
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
              argsData={
                parameters:${JSON.stringify(
                  args,
                )},response:response && response.data?response.data:'',element:element, targetElement:targetElement, url_params:url_params
              }
              response = await ${action.name}(argsData);
            `;
              innerHTML += `\n  ${actionCalling}`;
            });
          innerHTML += `
            formSubmitBtn && formSubmitBtn.prop('disabled', false);
            formSubmitBtn &&  formSubmitBtn.html(formSubmitBtnText);
          }
                 catch(error){
                    console.log("error",error)
                    formSubmitBtn && formSubmitBtn.prop('disabled', false);
                    formSubmitBtn && formSubmitBtn.html(formSubmitBtnText);
                  }
                 } else {
                   console.log("I am submit event and not valid")
                 }
                }`;
          script_ele.innerHTML = script_ele.innerHTML + '\n\n' + innerHTML;
        });
        document.head.appendChild(script_ele);
      } else {
        console.error('error');
      }
    });
})();
