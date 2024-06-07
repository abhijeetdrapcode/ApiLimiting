const serverURL = 'http://localhost:3000';

const headers = {
  'Host': window.location.host,
  'Connection': navigator.connection ? navigator.connection.effectiveType : '',
  'sec-ch-ua': navigator.userAgentData ? navigator.userAgentData.brands.map(brand => `"${brand.brand.replace(/"/g, '\\\\"')}"; v="${brand.version}"`).join(' ') : '',
  'sec-ch-ua-platform': navigator.userAgentData ? `"${navigator.userAgentData.platform}"` : '',
  'User-Agent': navigator.userAgent,
  'Origin': window.location.origin, 
  'Sec-Fetch-Site': window.location.origin ? 'same-origin' : 'cross-site',
  'Referer': document.referrer
};

// const socket = io(serverURL, { transports: ['websocket'], extraHeaders: headers });

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Socket disconnected');
});

async function emitData(data) {
  try {
    data.ipAddress = await fetchIPAddress();
    socket.emit('clickData', data);
  } catch (error) {
    console.error('Error emitting click data:', error);
  }
}

async function fetchIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error(`Failed to fetch IP address: ${response.statusText}`);
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return '';
  }
}

function attachEventListeners(selector, eventType, eventName) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    element.addEventListener(eventType, async (event) => {
      const data = createEventData(event, eventName);
      emitData(data);
    });
  });
}

function createEventData(event, eventName) {
  const currentDateTime = new Date().toLocaleString();
  return {
    tag: event.target.tagName.toLowerCase(),
    text: event.target.innerText,
    id: event.target.id,
    class: event.target.className,
    headers: headers,
    localStorageData: getStorageData(localStorage),
    sessionStorageData: getStorageData(sessionStorage),
    eventName: eventName,
    currentDateTime: currentDateTime
  };
}

function getStorageData(storage) {
  const data = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);
    try {
      data[key] = JSON.parse(value);
    } catch (e) {
      data[key] = value;
    }
  }
  return data;
}

function emitClickData(eventType, selector, eventName) {
  attachEventListeners(selector, eventType, eventName);
}

function emitClickDataByIdOrClass(eventType, idOrClass, eventName) {
  const selector = `[id="${idOrClass}"], .${idOrClass}`;
  attachEventListeners(selector, eventType, eventName);
}

socket.on('clickDataSaved', (payload) => {
  console.log(payload.message);
  console.log("Data Saved to MongoDB");
});

socket.on('clickDataError', (payload) => {
  console.error(payload.message);
});


// emitClickData('click', 'a', 'clicked on link/a tag');
emitClickDataByIdOrClass('click', 'apiTest2', 'clicked on api test 2 button');
emitClickDataByIdOrClass('click', 'apiTest1', 'clicked on api test 1 button');