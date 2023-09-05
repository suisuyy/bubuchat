//not usable now 
function sendMessageToActiveTab(msgObj={message:'hi this backgroud.js'}) {
    chrome.runtime.sendMessage('get-user-data', (response) => {
      chrome.tabs.query({ active: true, currentWindow: true }).then(res => {
        console.log('sent msg to tab', res);
  
        let tabId = res[0].id;
        console.log(tabId);
        chrome.tabs.sendMessage(tabId, msgObj);
  
      });
  
  
    });
  }
  
  function randomHexDigit() {
    // An array of hex digits from 0 to F
    const hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    // Return a random element from the array
    return hexDigits[Math.floor(Math.random() * hexDigits.length)];
  }
  
  // A function to generate a hex string with a given length
  function generateHexString(length) {
    // Initialize an empty string
    let hexString = "";
    // Loop for the given length
    for (let i = 0; i < length; i++) {
      // Append a random hex digit to the string
      hexString += randomHexDigit();
    }
    // Return the hex string
    return hexString;
  }
  
  
  console.log('this is backgroudjs');
  
  const terminalChar = '';
  
  class BingChat {
    constructor(opts, onMessage = msg => { console.log(msg) }) {
      const { cookie, debug = false } = opts;
      this._cookie = cookie;
      this._debug = !!debug;
      this.onMessage = onMessage
    }
    /**
     * Sends a message to Bing Chat, waits for the response to resolve, and returns
     * the response.
     *
     * If you want to receive a stream of partial responses, use `opts.onProgress`.
     *
     * @param message - The prompt message to send
     * @param opts.conversationId - Optional ID of a conversation to continue (defaults to a random UUID)
     * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
     *
     * @returns The response from Bing Chat
     */
    async sendMessage(text, opts = {},onMessage=msgstr=>{console.log(msgstr)}) {
      const {
        invocationId = '1',
        onProgress,
        locale = 'en-US',
        market = 'en-US',
        region = 'US',
        location,
        messageType = 'Chat',
        variant = 'Balanced',
      } = opts;
      let { conversationId, clientId, conversationSignature } = opts;
      const isStartOfSession = !(
        conversationId &&
        clientId &&
        conversationSignature
      );
      if (isStartOfSession) {
        const conversation = await this.createConversation();
        console.log('created conversationg_________', conversation)
        conversationId = conversation.conversationId;
        clientId = conversation.clientId;
        conversationSignature = conversation.conversationSignature;
      }
      const result = {
        author: 'bot',
        id: crypto.randomUUID(),
        conversationId,
        clientId,
        conversationSignature,
        invocationId: `${parseInt(invocationId, 10) + 1}`,
        text: '',
      };
  
      const responseP = new Promise(async (resolve, reject) => {
        const chatWebsocketUrl = 'wss://sydney.bing.com/sydney/ChatHub';
        const ws = new WebSocket(chatWebsocketUrl);
        let isFulfilled = false;
        function cleanup() {
          ws.close();
          ws.removeAllListeners();
        }
        ws.onerror = (error) => {
          console.warn('WebSocket error:', error);
          cleanup();
          if (!isFulfilled) {
            isFulfilled = true;
            reject(new Error(`WebSocket error: ${error.toString()}`));
          }
        };
        ws.onclose = () => {
          // TODO
        };
        ws.onopen = () => {
          ws.send(`{"protocol":"json","version":1}${terminalChar}`);
        }
        let stage = 0;
        ws.onmessage = (data) => {
          console.log(data)
          if (data?.data?.slice) {
            try {
              let msgObj = JSON.parse(data.data.replace(terminalChar, ''))
  
              let updateAnswer = msgObj.arguments[0].messages[0].text
              onMessage(updateAnswer);
  
            } catch (error) {
              console.log(error)
            }
  
  
          }
          var _a, _b;
          const objects = data.toString().split(terminalChar);
          const messages = objects
            .map((object) => {
              try {
                return JSON.parse(object);
              } catch (error) {
                return object;
              }
            })
            .filter(Boolean);
          if (!messages.length) {
            return;
          }
          if (stage === 0) {
            ws.send(`{"type":6}${terminalChar}`);
            const traceId = generateHexString(16).toLocaleLowerCase();
            // example location: 'lat:47.639557;long:-122.128159;re=1000m;'
            const locationStr = location
              ? `lat:${location.lat};long:${location.lng};re=${location.re || '1000m'
              };`
              : undefined;
            // Sets the correct options for the variant of the model
            const optionsSets = [
              'nlu_direct_response_filter',
              'deepleo',
              'enable_debug_commands',
              'disable_emoji_spoken_text',
              'responsible_ai_policy_235',
              'enablemm',
            ];
            if (variant == 'Balanced') {
              optionsSets.push('galileo');
            } else {
              optionsSets.push('clgalileo');
              if (variant == 'Creative') {
                optionsSets.push('h3imaginative');
              } else if (variant == 'Precise') {
                optionsSets.push('h3precise');
              }
            }
            const params = {
              arguments: [
                {
                  source: 'cib',
                  optionsSets,
                  allowedMessageTypes: [
                    'Chat',
                    'InternalSearchQuery',
                    'InternalSearchResult',
                    'InternalLoaderMessage',
                    'RenderCardRequest',
                    'AdsQuery',
                    'SemanticSerp',
                  ],
                  sliceIds: [],
                  traceId,
                  isStartOfSession,
                  message: {
                    locale,
                    market,
                    region,
                    location: locationStr,
                    author: 'user',
                    inputMethod: 'Keyboard',
                    messageType,
                    text,
                  },
                  conversationSignature,
                  participant: { id: clientId },
                  conversationId,
                },
              ],
              invocationId,
              target: 'chat',
              type: 4,
            };
            if (this._debug) {
              console.log(chatWebsocketUrl, JSON.stringify(params, null, 2));
            }
            ws.send(`${JSON.stringify(params)}${terminalChar}`);
            ++stage;
            return;
          }
          for (const message of messages) {
            if (message.type === 1) {
              const update = message;
              const msg =
                (_a = update.arguments[0].messages) === null || _a === void 0
                  ? void 0
                  : _a[0];
  
              console.log(msg)
              if (!msg) continue;
              console.log('RESPONSE0', JSON.stringify(update, null, 2))
              if (!msg.messageType) {
                result.author = msg.author;
                result.text = msg.text;
                result.detail = msg;
                onProgress === null || onProgress === void 0
                  ? void 0
                  : onProgress(result);
              }
            } else if (message.type === 2) {
              const response = message;
              console.log('RESPONSE', JSON.stringify(response, null, 2));
              const validMessages =
                (_b = response.item.messages) === null || _b === void 0
                  ? void 0
                  : _b.filter((m) => !m.messageType);
              const lastMessage =
                validMessages === null || validMessages === void 0
                  ? void 0
                  : validMessages[
                  (validMessages === null || validMessages === void 0
                    ? void 0
                    : validMessages.length) - 1
                  ];
              if (lastMessage) {
                result.conversationId = response.item.conversationId;
                result.conversationExpiryTime =
                  response.item.conversationExpiryTime;
                result.author = lastMessage.author;
                result.text = lastMessage.text;
                result.detail = lastMessage;
                if (!isFulfilled) {
                  isFulfilled = true;
                  resolve(result);
                }
              }
            } else if (message.type === 3) {
              if (!isFulfilled) {
                isFulfilled = true;
                resolve(result);
              }
              cleanup();
              return;
            } else {
              // TODO: handle other message types
              // these may be for displaying "adaptive cards"
              // console.warn('unexpected message type', message.type, message)
            }
          }
        }
      });
      return responseP;
    }
    async createConversation() {
      const requestId = crypto.randomUUID();
      const cookie = this._cookie?.includes(';')
        ? this._cookie
        : `_U=${this._cookie}`;
      return fetch('https://www.bing.com/turing/conversation/create', {
        headers: {
          accept: 'application/json',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'sec-ch-ua':
            '"Not_A Brand";v="99", "Microsoft Edge";v="109", "Chromium";v="109"',
          'sec-ch-ua-arch': '"x86"',
          'sec-ch-ua-bitness': '"64"',
          'sec-ch-ua-full-version': '"109.0.1518.78"',
          'sec-ch-ua-full-version-list':
            '"Not_A Brand";v="99.0.0.0", "Microsoft Edge";v="109.0.1518.78", "Chromium";v="109.0.5414.120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-model': '',
          'sec-ch-ua-platform': '"macOS"',
          'sec-ch-ua-platform-version': '"12.6.0"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-edge-shopping-flag': '1',
          'x-ms-client-request-id': requestId,
          'x-ms-useragent':
            'azsdk-js-api-client-factory/1.0.0-beta.1 core-rest-pipeline/1.10.0 OS/MacIntel',
            "Origin":"https://www.bing.com",
          // cookie,
        },
        referrer: 'https://www.bing.com/search',
        referrerPolicy: 'origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      }).then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(
            `unexpected HTTP error createConversation ${res.status}: ${res.statusText}`
          );
        }
      });
    }
  }
  
  
  async function example() {
    console.log('start bingchat');
    const bingchat = new BingChat({
      // cookie: process.env.BING_COOKIE
      cookie: 'no cookie need if in browser and login',
    },(msgstr) => {
      sendMessageToActiveTab({message:msgstr})
     });
  
    const res = await bingchat.sendMessage('write js code to edit a object like {a:1,b:{c:3}}', );
  }
  
  
  
  let bots={
  }
  bots.bingchat= new BingChat({
    // cookie: process.env.BING_COOKIE
    cookie: 'no cookie need if in browser and login',
  });
  
  
  
  chrome.runtime.onMessage.addListener(async (msgObj, sender, sendResponse) => {
    // 2. A page requested user data, respond with a copy of `user`
    console.log('got msg from content or popup:', msgObj,'sendtab is:',sender.tab.id)
    if(msgObj.forbing===true || msgObj.forbing==='true'|| msgObj.forbing==='yes'){
      await bots.bingchat.sendMessage(msgObj.message,{},(msgstr)=>{
        console.log(msgstr,'will send to :',sender.tab.id)
        chrome.tabs.sendMessage(sender.tab.id,{message:msgstr,from:'bing'})
      })
    }
    sendResponse('ok');
  
  });
  
  //test
  bots.bingchat.sendMessage('write js code to edit a object like {a:1,b:{c:3}}', );
  
  