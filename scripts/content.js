// ==UserScript==
// @name         bubuchat
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  let bubu help you anythin on web!
// @author       suisuy
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    if (typeof chrome === 'undefined') {
        console.log('chrome not found');
        window.chrome = null;
    }


    async function main() {
        await loadjs();
        await init();
        // addEventListener version
        document.addEventListener("selectionchange", () => {
            console.log(document.getSelection());
        });
        document.addEventListener('selectionchange', () => {
            console.log('slectionchange', window.getSelection().toString());
            if (window.getSelection().toString().length <= 0) {
                return;
            }
            appControler.updateInputArea({
                value: window.getSelection().toString()
            })
        })

        //test put here
        setTimeout(() => {

            // appControler.toggleSettingContainer();


        }, 2000);


    }
    main();


    //load js
    async function loadjs() {


        //marked.js
        if (window.marked === undefined) {
            // //setup js lib not work bc content security police
            let scriptElem = document.createElement('script');
            scriptElem.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            document.getElementsByTagName('head')[0].appendChild(scriptElem);
            if (window.marked === undefined) {
                console.log('marked not load,try use extension api')
            }
        }

        if (window.marked === undefined) {
            try {
                const src = chrome?.runtime?.getURL("scripts/marked.js");
                await import(src);
                console.log('marked.js loaded', window.marked)

            } catch (error) {
                console.log('marked.js not loaded', error)
            }

        }

    };


    //setup you css
    var css = `

.BubuContainer textarea::-webkit-scrollbar {
        width: 5px;
        background-color: transparent;
      }
.BubuContainer textarea::-webkit-scrollbar-thumb {
        width: 5px;
        background-color: lightblue;
      }

.ChatContainer::-webkit-scrollbar {
        width: 5px;
        background-color: transparent;
      }
.ChatContainer::-webkit-scrollbar-thumb {
        width: 5px;
        background-color: lightblue;
      }





`
    var style = document.createElement('style');

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName('head')[0].appendChild(style);



    const preload_prompts = {
        'tran': 'translate txt below to japanese,english,German,French,chinese,korean,  : ',
        'defw': 'give definition of the word in english and chinese,give usage example for the word: ',
        'ask': 'gpt,',
    }

    let appModel = {
        api: {
            url: 'https://gptapi.suisuy.eu.org',
            key: 'sk-FvDfZ4RW4xPjO1460WfvPPMRgBlesmjXJjH6V8LROGBTk4g',
            moreurl: {
                default: 'https://api.openai.com',
                cn: 'https://api.chatanywhere.cn',
            },
            req_path:{
                completions:"/chat/completions"
            }
        },
        chatmodel: "gpt-3.5-turbo",
        AIprovider: {
            bingchat: {
                netType: 'wss',
                url: 'wss://sydney.bing.com/sydney/ChatHub',
                active: false
            },
            bard: {
                active: false
            },
            webgpt: {
                active: false
            }
        },
        bubuContainer: {

            style: {
                classList: ["BubuContainer"],
                width: '30',
                height: '30',
                maxHeight: '50%',
                maxWidth: '350px',
                scrollbarWidth: 'thin',
                fontSize: '0.4',
                font: 'black',
                backgroundColor: '#FEDFC0',
                position: 'fixed',
                top: '80%',
                left: '80%',
                zIndex: 10000,

            },

            bubuIcon: {
                src: 'https://lnote.suisuy.eu.org/images/bubu-128.png',
                style: {
                    classList: ["BubuIcon"],
                    width: 0.8,
                    height: 0.8,
                    position: 'sticky',
                    float: 'left'
                }
            },
            promptButtons: {
                prompts: {},
                style: {
                    classList: ["PromptButtons"],
                    position: 'sticky',
                    // float: 'left',
                    width: 'auto',
                    height: 0.8,
                    display: "flex",
                    backgroundColor: '#455CA3'
                },


            },
            inpurtArea: {
                style: {
                    classList: ["InputArea"],
                    width: '98%',
                    backgroundColor: '#FEDFC0'

                },
                message: '',
                value: '',
                placeholder: 'type here to chat,then click ask button  to send ',
            },
            chatContainer: {
                style: {
                    classList: ["ChatContainer"],
                    width: '100%',
                    height: '80%',
                    color: 'black',
                    backgroundColor: 'inherit',
                    overflow: 'auto',
                },
                messages: [
                    { "role": "user", "content": "how to use bubu" },
                    { "role": "assistant", "content": "try to click bubu icon or drag it to move bubu" },
                ],
                model: 'gpt-3.5-turbo',
                temperature: 0.7
            },

            menuContainer: {
                classList: ["MenuContainer"],
                style: {
                    classList: ["MenuContainer"],
                    width: 2,
                    height: 2,
                    fontSize: 1.5,
                    display: "none",
                    margin: '0em',
                    padding: 0,
                    altdisplay: 'inline',
                    position: 'fixed',
                    padding: 0,
                    bottom: '0',
                    left: '',
                    right: '0',
                    // bottom:'2em',

                    backgroundColor: 'black',
                    color: 'white',
                },
                menuIcon: {
                    src: 'https://lnote.suisuy.eu.org/images/bubu-128.png',
                    style: {
                        classList: ["MenuIcon"],
                        width: 2,
                        height: 2
                    }
                },
                menucontents: {
                    settings: {
                        name: 'setting',
                    },
                    reset: {
                        name: 'reset',
                    },
                    fullscreen: {
                        name: 'fullscreen'
                    },
                    min: {
                        name: 'min'
                    },
                    exit: {
                        name: 'exit'
                    }
                }
            }
        },
        bubuColor: {
            face: '#FEDFC0',
            hair: '#455CA3'
        },
        currentBot: null,
        sizeUnit: 'cm',
        settingDataName: 'bubuContainer',
        settingContainer: {
            style: {
                classList: ["SettingContainer"],
                width: 30,
                height: 20,
                maxWidth: '100%',
                maxHeight: '50%',
                display: 'none',
                buttom: 'inherit',
                right: 0,
                left: 'inherit',
                top: 0,
                color: 'white',
                backgroundColor: 'gray',
                position: 'fixed',
                overflow: 'auto',
                zIndex: 10001,

            },
        },


    }

    let appControler = {
        updateBubuContainer(newBubuContainer) {
            appModel.bubuContainer = {
                ...appModel.bubuContainer,
                ...newBubuContainer
            }
            let bubuContainer;
            if (appView.bubuContainer === null || appView.bubuContainer === undefined) {
                bubuContainer = document.createElement('div');
                document.body.appendChild(bubuContainer);
                appView.bubuContainer = bubuContainer;
            }
            else {
                bubuContainer = appView.bubuContainer;
            }
            //todo need delete
            // bubuContainer.innerHTML = 'bu'
            bubuContainer.classList.add(['BubuContainer']);
            setStyle(appModel.bubuContainer, bubuContainer);
        },
        updateBubuIcon(newBubuIcon) {
            appModel.bubuContainer.bubuIcon = {
                ...appModel.bubuContainer.bubuIcon,
                ...newBubuIcon
            };

            if (appView.bubuIcon === null || appView.bubuIcon === undefined) {
                appView.bubuIcon = document.createElement('img');
                appView.bubuContainer.appendChild(appView.bubuIcon);
            }
            appView.bubuIcon.src = appModel.bubuContainer.bubuIcon.src;
            setStyle(appModel.bubuContainer.bubuIcon, appView.bubuIcon);


            //make draggable
            appView.bubuContainer.style.touchAction = 'none' //need on touch devices
            dragElement(appView.bubuContainer);
            function dragElement(elmnt) {
                var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

                // otherwise, move the DIV from anywhere inside the DIV:
                appView.bubuIcon.onpointerdown = dragMouseDown;


                function dragMouseDown(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // get the mouse cursor position at startup:
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    document.onpointerup = closeDragElement;
                    // call a function whenever the cursor moves:
                    document.onpointermove = elementDrag;
                }

                function elementDrag(e) {
                    e = e || window.event;
                    e.preventDefault();
                    // calculate the new cursor position:
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    // console.log(pos1,pos2,pos3,pos4)
                    // set the element's new position:
                    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
                }

                function closeDragElement() {
                    // stop moving when mouse button is released:
                    console.log('pointerup')
                    document.onpointerup = null;
                    document.onpointermove = null;
                }
            }

            appView.bubuIcon.addEventListener('click', () => {
                console.log('click icon')
                let style = appModel.bubuContainer.menuContainer.style;
                if (style.display === 'none') {
                    style.display = appModel.bubuContainer.menuContainer.altdisplay;
                    appControler.updateMenuContainer({ style });
                }
                else {
                    style.display = 'none';
                    appControler.updateMenuContainer({ style });
                }
            })


        },
        updatePromptButtons(newPrompButtons) {
            appModel.bubuContainer.promptButtons = {
                ...appModel.bubuContainer.promptButtons,
                ...newPrompButtons
            };

            let promptButtonsModel = appModel.bubuContainer.promptButtons;

            if (appView.promptButtons === null) {
                appView.promptButtons = document.createElement('div');
                appView.bubuContainer.appendChild(appView.promptButtons);
            }


            appView.promptButtons.innerHTML = '';
            setStyle(promptButtonsModel, appView.promptButtons);
            // appView.promptButtons.style.marginLeft = appModel.bubuContainer.bubuIcon.style.width + appModel.sizeUnit;
            // appView.promptButtons.style.position='fixed';
            // appView.promptButtons.style.bottom='0';
            // appView.promptButtons.style.left=appModel.bubuContainer.menuContainer.size.width+'em';


            for (const [key, value] of Object.entries(appModel.bubuContainer.promptButtons.prompts)) {
                console.log(`${key} ${value}`);
                let promptButton = document.createElement('button');
                promptButton.innerHTML = key;
                promptButton.style.color = 'white';
                promptButton.style.backgroundColor = 'transparent';
                promptButton.style.border = '0';
                promptButton.style.padding = '0';
                promptButton.style.marginLeft = '8px';
                promptButton.addEventListener('click', () => {


                    appControler.sendMessage(`${value} ${appModel.bubuContainer.inpurtArea.value}`);

                })

                appView.promptButtons.appendChild(promptButton);

            }
        },
        updateInputArea(newInputAreaModel) {
            appModel.bubuContainer.inpurtArea = {
                ...appModel.bubuContainer.inpurtArea,
                ...newInputAreaModel
            };
            let inputAreaModel = appModel.bubuContainer.inpurtArea;
            if (appView.inpurtArea === null || appView.inpurtArea === undefined) {
                appView.inpurtArea = document.createElement('textarea');
                appView.bubuContainer.appendChild(appView.inpurtArea);
                appView.inpurtArea.addEventListener('input', (evt) => {
                    appControler.updateInputArea({ value: appView.inpurtArea.value });
                    console.log(appModel.bubuContainer.inpurtArea.value);
                });
            }
            setStyle(inputAreaModel, appView.inpurtArea);
            appView.inpurtArea.placeholder = appModel.bubuContainer.inpurtArea.placeholder;
            appView.inpurtArea.value = appModel.bubuContainer.inpurtArea.value;


        }
        ,
        updateChatContainer(newChatContainer) {
            appModel.bubuContainer.chatContainer = {
                ...appModel.bubuContainer.chatContainer,
                ...newChatContainer
            }
            if (appView.chatContainer === null) {
                let chatContainer = document.createElement('div');

                appView.bubuContainer.appendChild(chatContainer);
                appView.chatContainer = chatContainer;
            }
            setStyle(appModel.bubuContainer.chatContainer, appView.chatContainer);

            appView.chatContainer.innerHTML = '';
            for (const message of appModel.bubuContainer.chatContainer.messages) {
                let messageDiv = document.createElement('div');
                appView.chatContainer.prepend(messageDiv);
                messageDiv.innerHTML += `<span style="color:blue">${message.role}:</span>`
                messageDiv.innerHTML += window.marked?.parse(message.content) || marked?.parse(message.content) || message.content;
            }

        },
        updateMenuContainer(newMenuContainer) {
            appModel.bubuContainer.menuContainer = {
                ...appModel.bubuContainer.menuContainer,
                ...newMenuContainer
            }

            let menuContainerModel = appModel.bubuContainer.menuContainer;
            let menuContainer;
            if (appView.menuContainer === null) {
                menuContainer = document.createElement('div');
                appView.bubuContainer.appendChild(menuContainer);
                appView.menuContainer = menuContainer;
            }
            else {
                menuContainer = appView.menuContainer;
            }

            appView.menuContainer.innerHTML = '';
            appView.menuContainer.style.bottom = '-0.5em'
            appView.menuContainer.style.display = 'inline';
            appView.menuContainer.classList.add(['MenuContainer']);




            // Create an ordered list (ol) element
            const orderedList = document.createElement('ol');
            let menucontents = appModel.bubuContainer.menuContainer.menucontents;
            orderedList.classList.add(['MenuList']);
            orderedList.style.display = appModel.bubuContainer.menuContainer.style.display;
            orderedList.style.margin = appModel.bubuContainer.menuContainer.style.margin;
            orderedList.style.padding = appModel.bubuContainer.menuContainer.style.padding;
            orderedList.style.height = appModel.bubuContainer.menuContainer.style.height;
            orderedList.style.width = appModel.bubuContainer.menuContainer.style.width;
            orderedList.style.bottom = appModel.bubuContainer.menuContainer.style.bottom;
            orderedList.style.left = appModel.bubuContainer.menuContainer.style.left;
            orderedList.style.position = appModel.bubuContainer.menuContainer.style.position;
            orderedList.style.top = appModel.bubuContainer.menuContainer.style.top;
            orderedList.style.backgroundColor = appModel.bubuContainer.menuContainer.style.backgroundColor;
            orderedList.style.color = appModel.bubuContainer.menuContainer.style.color;



            // Loop through the menucontents object and create list items (li) with click event handlers
            for (const key in menucontents) {
                if (menucontents.hasOwnProperty(key)) {
                    const menuItem = menucontents[key];

                    // Create a list item (li) element
                    const listItem = document.createElement('li');

                    // Set the inner text of the list item
                    listItem.innerText = menuItem.name;
                    listItem.style.display = 'inline';
                    listItem.style.marginRight = '0.5' + appModel.sizeUnit;
                    // listItem.style.fontSize = '1'+appModel.sizeUnit;
                    // Add a click event handler to the list item
                    listItem.addEventListener('click', () => {
                        // Replace this console.log with your desired click event functionality
                        console.log(`Clicked on ${menuItem.name}`);
                        //cant do this in manifest v3
                        // (new Function(menuItem.clickListenerString) )();
                        appControler.menuClickListener[menuItem.name]();

                    });

                    // Append the list item to the ordered list
                    orderedList.appendChild(listItem);
                }
            }

            // Append the ordered list to a container element with the ID "menuContainer"
            appView.menuContainer.prepend(orderedList);



        },

        //this almost genrated by gpt3.5
        updateSettingContainer() {
            let container;
            if (appView.settingContainer === null || appView.settingContainer === undefined) {
                container = document.createElement('div');
                appView.settingContainer = container;

                document.body.appendChild(container);
            }
            else {
                container = appView.settingContainer;
            }


            container.innerHTML = '';
            setStyle(appModel.settingContainer, container);

            let saveButton = document.createElement('button');
            saveButton.innerText = 'Save';
            saveButton.addEventListener('click', () => {
                appModel.bubuContainer.chatContainer.messages = [];
                chrome?.storage?.sync.set({ 'bubusettings': appModel }).then(res => {
                    init();
                    console.log('value saved', res);
                });
            })
            container.appendChild(saveButton);


            function createForm(data, parentElement, keyPrefix = '') {
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const value = data[key];
                        const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;

                        if (typeof value === 'object') {
                            const fieldset = document.createElement('fieldset');
                            const legend = document.createElement('legend');
                            legend.innerText = key;
                            fieldset.appendChild(legend);

                            createForm(value, fieldset, fullKey);

                            const addButton = document.createElement('button');
                            addButton.innerText = 'Add Property';
                            addButton.addEventListener('click', () => {
                                const newPropertyName = prompt('Enter the new property name:');
                                if (newPropertyName !== null && newPropertyName !== '') {
                                    const newValue = prompt('Enter the new property value:');
                                    if (newValue !== null) {
                                        data[key][newPropertyName] = newValue;
                                        appControler.updateAll();
                                    }
                                }
                            });
                            fieldset.appendChild(addButton);

                            parentElement.appendChild(fieldset);
                        } else {
                            const label = document.createElement('label');
                            label.innerText = `${key}: `;

                            const input = document.createElement('input');
                            input.type = 'text';
                            input.value = value;

                            input.addEventListener('change', (event) => {
                                const newValue = event.target.value;
                                setNestedValue(appModel, fullKey, newValue);
                                appControler.updateAll();
                                console.log(appModel); // Log the updated object
                            });

                            parentElement.appendChild(label);
                            parentElement.appendChild(input);
                            parentElement.appendChild(document.createElement('br'));
                        }
                    }
                }
            }

            function setNestedValue(obj, path, value) {
                const keys = path.split('.');
                let current = obj;

                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    current = current[key];
                }

                const lastKey = keys[keys.length - 1];
                current[lastKey] = value;
            }

            createForm(appModel, container);
        },
        updateAll() {
            console.log('updateAll()')
            appModel.bubuContainer.promptButtons.prompts = {
                ...preload_prompts,
                ...appModel.bubuContainer.promptButtons.prompts
            }
            appControler.updateBubuContainer();
            appControler.updateBubuIcon();
            appControler.updateMenuContainer();
            appControler.updatePromptButtons();
            appControler.updateInputArea();
            appControler.updateChatContainer();
            appControler.updateSettingContainer();
        },
        sendMessage(message = null) {
            if (message !== null || message !== undefined || message !== '') {
                let messages = appModel.bubuContainer.chatContainer.messages;
                messages = [
                    ...messages,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                    this.updateChatContainer({
                        ...appModel.bubuContainer.chatContainer,
                        messages
                    })
            }

            // fetch(`https://corsp.suisuy.eu.org?${appModel.api.url}/chat/completions`, {
            fetch(`${appModel.api.url}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${appModel.api.key}`,
                },
                body: JSON.stringify({
                    'model': appModel.chatmodel,
                    'messages': appModel.bubuContainer.chatContainer.messages,
                    'temperature': 0.7
                })
            })
                .then(res => {
                    res.json().then(res => {

                        console.log(res);
                        console.log(res?.choices[0].message.content);
                        if (res?.choices === undefined) {
                            return;
                        }

                        let oldMessages = appModel.bubuContainer.chatContainer.messages;
                        appControler.updateChatContainer({
                            ...appModel.bubuContainer.chatContainer,
                            messages: [
                                ...oldMessages,
                                { "role": "assistant", "content": res?.choices[0].message.content },

                            ]
                        })
                        return res;

                    })
                })

            //bingai
            if (appModel.AIprovider.bingchat.active === true) {
                console.log('start bingchat')
                let log = console.log;

                let msg0 = '{"protocol":"json","version":1}';
                let msg1 = '{"type":6}';
                let msg2_2 = `{"arguments":[{"source":"cib","optionsSets":["nlu_direct_response_filter","deepleo","disable_emoji_spoken_text","responsible_ai_policy_235","enablemm","dv3sugg","iyxapbing","iycapbing","harmonyv3","saharagenconv5","cgptreasondl","fluxclmodelsp","fluxv1","rai278","replaceurl","enpcktrk","logosv1","udt4upm5gnd","eredirecturl"],"allowedMessageTypes":["ActionRequest","Chat","Context","InternalSearchQuery","InternalSearchResult","Disengaged","InternalLoaderMessage","Progress","RenderCardRequest","AdsQuery","SemanticSerp","GenerateContentQuery","SearchQuery"],"sliceIds":["edi","kcimgov2","0731ziv2","707enpcktrks0","0628ups0","816bof108s0","812fluxv1pcs0a","0518logos","810fluxhi52","727udtupm","815enftshrcs0"],"verbosity":"verbose","scenario":"SERP","plugins":[],"traceId":"64e09b83673945e48552074bc459d80a","isStartOfSession":false,"requestId":"369c4183-3a8c-4c81-dd41-d57b022085a7","message":{"locale":"en-GB","market":"en-GB","region":"JP","location":"lat:47.639557;long:-122.128159;re=1000m;","locationHints":[{"country":"Japan","state":"Tokyo","city":"Koto-Ku","zipcode":"162-0843","timezoneoffset":9,"Center":{"Latitude":35.6949,"Longitude":139.7377},"RegionType":2,"SourceType":1}],"userIpAddress":"13.114.30.22","timestamp":"2023-08-19T18:35:02+08:00","author":"user","inputMethod":"Keyboard","text":"write js code to display a object","messageType":"Chat","requestId":"369c4183-3a8c-4c81-dd41-d57b022085a7","messageId":"369c4183-3a8c-4c81-dd41-d57b022085a7"},"tone":"Balanced","conversationSignature":"MoF2rd13lmasyw+c2PrT6ZBAg1T5/+9vlUaXAzHyECo=","participant":{"id":"844425739378170"},"spokenTextMode":"None","conversationId":"51D|BingProdUnAuthenticatedUsers|53477B1D4ADF0508E54756199BCF768FE918E6C5E98996F6BC7B23BD434786D4"}],"invocationId":"3","target":"chat","type":4}`;


                let socket = new WebSocket(
                    //   'wss://javascript.info/article/websocket/demo/hello'
                    // 'wss://sydney.bing.com/sydney/ChatHub,
                    appModel.AIprovider.bingchat.url
                );

                socket.onopen = function (e) {
                    log('[open] Connection established,send msg now');
                    socket.send(msg0);
                };
                socket.onmessage = function (event) {
                    log(`[message] Data received from server: ${event.data}`);
                    if (event.data == '{}') {
                        socket.send(msg1);
                        socket.send(msg2_2);
                    }
                    else{
                        console.log()
                    }
                };

                socket.onclose = function (event) {
                    if (event.wasClean) {
                        log(
                            `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
                        );
                    } else {
                        // e.g. server process killed or network down
                        // event.code is usually 1006 in this case
                        log('[close] Connection died');
                    }
                };

                socket.onerror = function (error) {
                    log(`[error]`);
                };
            }

        },
        menuClickListener: {
            setting() {
                let style = appModel.settingContainer.style;
                if (style.display === 'none') {
                    style.display = "block";
                }
                else {
                    style.display = 'none';
                }
                appControler.updateSettingContainer();
            },
            fullscreen() {

            },
            reset() {
                if (window.confirm('Are you sure? reload page to see the effect')) {
                    resetSetting();
                    console.log('reset');
                }
            },
            exit() {
                document.body.removeChild(appView.bubuContainer);
                document.body.removeChild(appView.settingContainer);

            },
            min() {
                appControler.updateChatContainer({ messages: [] });
            },
            fullscreen() {
                (function () {
                    var elem = document.documentElement;
                    var rfs =
                        elem.requestFullscreen
                        || elem.webkitRequestFullScreen
                        || elem.mozRequestFullScreen
                        || elem.msRequestFullScreen;
                    rfs.call(elem);
                })();
            }
        }

    }

    let appView = {
        bubuContainer: null,
        promptButtons: null,
        chatContainer: null,
        menuContainer: null,
        settingContainer: null,
    }



    async function init() {

        console.log('start init!!!')
        //init appmodle from browser storage
        if (chrome !== null) {
            console.log('init():has extion api,load frome storage now')
            await chrome?.storage?.sync.get(["bubusettings"]).then((result) => {
                console.log("bubusettings is ", result);
                let bubusettingsObj = result.bubusettings;
                appModel = { ...appModel, ...bubusettingsObj }
                appModel.settingContainer.style.display = 'none';
                appModel.bubuContainer.menuContainer.style.display = 'none';

                // console.log('start set bubusettings',bubusettingsObj)
                //appModel.api_key = bubusettings?.api_key || ''
                //appModel.api_url = bubusettings?.api_url || ''
                appControler.updateAll();

                console.log(appModel)

            });

        }
        else {
            console.log('init():no extion api,not load storage')
            appModel.bubuContainer.menuContainer.style.display = 'none';
            appControler.updateAll();
            console.log(appModel)

        }

    }



    function renderbubu() {


        //seems not work but can use document direct
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded !!!!')
        })

        let bubuContainer = document.createElement('div');
        document.body.appendChild(bubuContainer);
        bubuContainer.innerHTML = 'bubu'
        bubuContainer.classList.add(['BubuContainer']);
        bubuContainer.style.position = 'fixed'
        bubuContainer.style.bottom = appModel.position.buttom
        bubuContainer.style.right = appModel.position.right
        bubuContainer.style.backgroundColor = 'blue'
        bubuContainer.style.color = 'white'


        let chatContainer = document.createElement('div');
        chatContainer.innerText = 'chat will show here'
        bubuContainer.prepend(chatContainer);

        for (const [key, value] of Object.entries(appModel.prompts)) {
            console.log(`${key} ${value}`);
            let promptButton = document.createElement('button');
            promptButton.innerHTML = key;
            promptButton.style.border = 0;

            bubuContainer.appendChild(promptButton);

            promptButton.addEventListener('click', () => {
                chatContainer.innerHTML += `start ${key} :<br> ${appModel.selectedTxt} <br>`
            })
        }



    }




    // chrome?.storage?.onChanged?.addListener((changes, namespace) => {
    //     for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    //         console.log(
    //             `Storage key "${key}" in namespace "${namespace}" changed.`,
    //             `Old value was "${oldValue}", new value is "${newValue}".`
    //         );
    //     }
    // });

    // chrome?.storage?.sync?.set({ test: { a: 1, b: 'str2' } }).then(() => {
    //     console.log("Value is set");
    // });

    // chrome?.storage?.sync?.get(["test"]).then((result) => {
    //     console.log("Value currently is ", result);
    //     //result is object {a:1,b:'str2'}
    // });

    function resetSetting() {
        chrome?.storage?.sync?.set({ 'bubusettings': {} }).then(res => {
            console.log('value reset', res);
        });
    }

    function setStyle(submodel, element) {
        function isNumber(str) {
            let regex = /^\d+(\.\d+)?$/;
            let isNum = regex.test(str);
            return isNum;
        }

        function setCorrectPropertie(styleName, value) {
            if (isNumber(value) === true) {
                element.style[styleName] = value + appModel.sizeUnit;
            }
            else {
                element.style[styleName] = value;
            }

            if (styleName === 'zIndex') {
                element.style[styleName] = value;
            }
        }

        element.classList.add(submodel.style.classList)

        for (const [key, value] of Object.entries(submodel.style)) {
            console.log('setStyle():', key, value)

            setCorrectPropertie(key, value);
        }

    }



    //js lib








})();