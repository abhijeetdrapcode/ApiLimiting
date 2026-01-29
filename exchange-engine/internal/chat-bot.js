window.addEventListener('load', async (event) => {
  const { domainSrc, chatbotId } = getScriptURL();
  const projectData = cleanScript(domainSrc);
  console.log('projectData', projectData);

  const elemDiv = document.createElement('div');
  document.body.appendChild(elemDiv);
  const { apiEndPoint } = projectData;
  await loadChatBotMessageComponent(apiEndPoint, chatbotId, elemDiv);
  const style = document.createElement('style');
  style.innerHTML = `
  .chatbox-wrapper{position:fixed;bottom:2rem;right:2rem;width:4rem;height:4rem}.chatbox-toggle{width:100%;height:100%;background:#335dff;color:#fff;font-size:2rem;display:flex;justify-content:center;align-items:center;border-radius:50%;cursor:pointer;transition:.2s}.chatbox-toggle:active{transform:scale(.9)}.chatbox-message-wrapper{position:absolute;bottom:calc(100% + 1rem);right:0;width:420px;border-radius:.5rem;overflow:hidden;box-shadow:.5rem .5rem 2rem rgba(0,0,0,.1);transform:scale(0);transform-origin:bottom right;transition:.2s}.chatbox-message-wrapper.show{transform:scale(1)}.chatbox-message-header{display:flex;align-items:center;justify-content:space-between;background:#fff;padding:5px 20px}.chatbox-message-dropdown{cursor:pointer}.chatbox-message-content{background:#f5f5f5;padding:1.5rem;display:flex;flex-direction:column;grid-row-gap:1rem;max-height:300px;overflow-y:auto}.chatbox-message-item{width:90%;padding:1rem}.chatbox-message-item.sent{align-self:flex-end;background:#335dff;color:#fff;border-radius:.75rem 0 .75rem .75rem}.chatbox-message-item.received{background:#fff;border-radius:0 .75rem .75rem;box-shadow:.25rem .25rem 1.5rem rgba(0,0,0,.05)}.chatbox-message-item-time{float:right;font-size:.75rem;margin-top:.5rem;display:inline-block}.chatbox-message-bottom{background:#fff;padding:.75rem 1.5rem}.chatbox-message-form{display:flex;align-items:center;justify-content:space-between;background:#f5f5f5;border-radius:.5rem;padding:.5rem 1.25rem}.chatbox-message-input{background:0 0;outline:0;border:none;resize:none;scrollbar-width:none}.chatbox-message-input::-webkit-scrollbar{display:none}.chatbox-message-submit{font-size:1.25rem;color:#335dff;background:0 0;border:none;outline:0;cursor:pointer}.chatbox-btn-danger{display:inline-block;font-weight:400;text-align:center;cursor:pointer;font-size:14px;border-radius:4px;padding:6px 12px;color:#fff;background-color:#d9534f;border-color:#d43f3a}
    `;
  document.head.appendChild(style);
});

const loadChatBotMessageComponent = async (apiPoint, chatbotId, messageComp) => {
  //TODO: Add condition to check Chatbot should render or not
  console.log('chatbotId', chatbotId);
  const collectionItemEndpoint = `collection-table/chatgpt_chatbot/item/${chatbotId}`;
  const roomResponse = await chatGetCall(apiPoint, collectionItemEndpoint);
  console.log('roomResponse', roomResponse);
  if (!roomResponse) {
    return;
  }

  const parentChatWrapper = document.createElement('div');
  parentChatWrapper.setAttribute('class', 'chatbox-wrapper');

  const chatToggle = document.createElement('div');
  chatToggle.setAttribute('class', 'chatbox-toggle');

  chatToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-gjs="drapcode-icons-svg" draggable="false" class="feather feather-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z">
  </path></svg>`;

  const chatWrapper = document.createElement('div');
  chatWrapper.setAttribute('class', 'chatbox-message-wrapper');

  //Header
  const chatHeader = document.createElement('div');
  chatHeader.setAttribute('class', 'chatbox-message-header');

  const chatHeaderText = document.createElement('h4');
  chatHeaderText.setAttribute('class', 'chatbox-message-name');
  chatHeaderText.textContent = 'Send your message';

  const chatCloser = document.createElement('div');
  chatCloser.setAttribute('class', 'chatbox-message-dropdown');
  chatCloser.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  const endButton = document.createElement('button');
  endButton.setAttribute('class', 'chatbox-btn-danger');
  endButton.textContent = 'End Chat';

  let selectedRoom = localStorage.getItem('selected-chatbot-room');
  if (!selectedRoom) {
    endButton.style.display = 'none';
  }

  chatHeader.append(chatHeaderText);
  chatHeader.append(endButton);
  chatHeader.append(chatCloser);

  //Content
  const chatMessageContent = document.createElement('div');
  chatMessageContent.setAttribute('class', 'chatbox-message-content');

  await loadChatBotMessages(apiPoint, chatMessageContent, true);

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
      await sendChatBotMessageToServer(apiPoint, chatMessageContent, textarea.value);
      form.style.alignItems = 'center';
      textarea.rows = 1;
      textarea.focus();
      textarea.value = '';
    }
  });

  chatBottom.append(form);

  chatWrapper.append(chatHeader);
  chatWrapper.append(chatMessageContent);
  chatWrapper.append(chatBottom);

  chatToggle.addEventListener('click', function () {
    chatWrapper.classList.toggle('show');
  });

  chatCloser.addEventListener('click', function () {
    chatWrapper.classList.toggle('show');
  });

  parentChatWrapper.append(chatToggle);
  parentChatWrapper.append(chatWrapper);
  messageComp.append(parentChatWrapper);
  setInterval(loadChatBotMessages, 30 * 1000, apiPoint, chatMessageContent, false);
};

const isValid = (value) => {
  let text = value.replace(/\n/g, '');
  text = text.replace(/\s/g, '');
  return text.length > 0;
};

const cleanChatBotRoomAndClearMessage = async (chatMessageContent) => {
  chatMessageContent.innerHTML = ``;
  localStorage.removeItem('selected-chatbot-room');
};

const sendChatBotMessageToServer = async (apiPoint, chatMessageContent, content) => {
  let selectedRoom = localStorage.getItem('selected-chatbot-room');
  if (!selectedRoom) {
    selectedRoom = await createChatBotRoom(apiPoint);
    setJsonInLocalStorage('selected-chatbot-room', selectedRoom);
    const endButton = document.getElementsByClassName('chatbox-btn-danger');
    endButton[0].style.display = 'block';
  } else {
    selectedRoom = JSON.parse(selectedRoom);
  }
  let message = {
    message: content,
    roomId: selectedRoom.uuid,
  };
  const createMessageEndpoint = `chatbot/chats/save-message`;
  const messageResponse = await chatPostCall(apiPoint, message, createMessageEndpoint);
  localStorage.setItem('last-message-time', new Date());
  createMessageForChatBot(apiPoint, chatMessageContent, message);
};

const createChatBotRoom = async (apiPoint) => {
  const createRoomEndpoint = `chatbot/chats/create-room`;
  const roomResponse = await chatPostCall(apiPoint, {}, createRoomEndpoint);
  return roomResponse.room;
};

const loadChatBotMessages = async (apiPoint, chatMessageContent, isFirst) => {
  let selectedRoom = localStorage.getItem('selected-chatbot-room');
  if (!selectedRoom) {
    return;
  }
  selectedRoom = JSON.parse(selectedRoom);
  let lastRestartTime = localStorage.getItem('last-message-time');
  //replace moment
  if (lastRestartTime || isFirst) {
    const time1 = new Date(lastRestartTime);
    const time2 = new Date();
    if ((time2.getTime() - time1.getTime()) / 1000 < 120 || isFirst) {
      const loadRoomMessagesEndpoint = `chatbot/chats/load-messages/${selectedRoom.uuid}`;
      const messages = await chatGetCall(apiPoint, loadRoomMessagesEndpoint);

      console.log('messages', messages);
      chatMessageContent.innerHTML = ``;
      messages.forEach((message) => createMessageForChatBot(apiPoint, chatMessageContent, message));
    } else {
      console.log('No new message from user in last 2 mins');
    }
  } else {
    console.log('no message is sent');
  }
};

const chatGetCall = async (apiPoint, endpoint) => {
  try {
    // const token = validateCookieToken();
    // if (!token) return;
    const header = getHeaderForChatRequest();
    const response = await fetch(`${apiPoint}${endpoint}`, { method: 'GET', headers: header });
    extractCookieToken(response.headers);
    return await response.json();
  } catch (error) {
    console.log('error', error);
  }
};

const chatPostCall = async (apiPoint, data, endpoint) => {
  try {
    // const token = validateCookieToken();
    // if (!token) return;
    const header = getHeaderForChatRequest();
    const response = await fetch(`${apiPoint}${endpoint}`, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(data),
    });
    extractCookieToken(response.headers);
    return await response.json();
  } catch (error) {
    console.log('error', error);
  }
};

const getHeaderForChatRequest = (token = '') => {
  return {
    'Content-Type': 'application/json',
    // JSESSIONID: token,
  };
};

const createMessageForChatBot = (apiPoint, chatMessageContent, messageObj) => {
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
    const time = (new Date().getTime() - new Date(createdAt).getTime()) / 1000;
    chatMessageTime.textContent = time;
  }

  chatMessageItem.append(chatMessageText);
  chatMessageItem.append(chatMessageTime);

  chatMessageContent.append(chatMessageItem);
  chatMessageContent.scrollTop = chatMessageContent.scrollHeight;
};

const getScriptURL = () => {
  var script = document.currentScript || document.querySelector('script[src*="chat-bot.min.js"]');
  const chatbotId = script.getAttribute('chat-bot-id');
  return { domainSrc: script.src, chatbotId };
};

const cleanScript = (domainSrc) => {
  if (!domainSrc) return;
  let completeSrc = domainSrc;
  domainSrc = domainSrc
    .replace('/resources/chat-bot.min.js', '')
    .replace('/chat-bot.min.js', '')
    .replace('https://', '')
    .replace('http://', '');

  let environment = '';
  let projectSeoName = '';
  let domainName = '';
  let protocal = 'https://';
  if (domainSrc.includes('.drapcode.io')) {
    if (domainSrc.includes('.sandbox')) {
      environment = 'sandbox';
      domainSrc = domainSrc.replace('.sandbox', '');
    } else if (domainSrc.includes('.uat')) {
      environment = 'uat';
      domainSrc = domainSrc.replace('.uat', '');
    }

    projectSeoName = domainSrc.split('.')[0];
    domainName = domainSrc.replace(`${projectSeoName}.`, '');
  } else if (domainSrc.includes('.webconnect.today')) {
    console.log('domainSrc', domainSrc);
    projectSeoName = domainSrc.split('.')[0];
    domainName = domainSrc.replace(`${projectSeoName}.`, '');
  } else if (domainSrc.includes('.prodeless.com')) {
    protocal = 'http://';
    projectSeoName = domainSrc.split('.')[0];
    domainSrc = domainSrc.replace('5001', '5002');
    domainName = domainSrc.replace(`${projectSeoName}.`, '');
  } else {
    //Most probably for custom domain
  }

  let apiEndPoint = `${protocal}${projectSeoName}.api.${domainName}/api/v1/`;
  return { domainName, environment, completeSrc, projectSeoName, apiEndPoint };
};
