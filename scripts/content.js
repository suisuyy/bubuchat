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
        console.log('not run as extension ');
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

        chrome.runtime?.onMessage.addListener((msgObj, sender, sendResponse) => {
            console.log('got msg:', msgObj)
            let oldChatContainerModel=appModel.AIprovider.bingchat.chatContainer;
            window.appControler.updateBingContainer(
                {
                    messages:[
                        {role:'from bing',content:msgObj.message}
                    ],
                    style:{...oldChatContainerModel.style}
                }
            )
    
        });


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

.BubuContainer *::-webkit-scrollbar {
        width: 5px;
        background-color: transparent;
}
.BubuContainer *::-webkit-scrollbar-thumb {
        width: 5px;
        background-color: lightblue;
}


.ChatContainer div  p {
        color: black;
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
        'tran': 'translate txt below to English,Chinese  : ',
        'defw': 'the word  has multi meanings,give all definitions and usage example of the word  in english and chinese  : ',
        'ask': '',
    }

    window.appModel = {
        api: {
            url: 'https://gptapi.suisuy.eu.org',
            key: 'sk-FvDfZ4RW4xPjO1460WfvPPMRgBlesmjXJjH6V8LROGBTk4g',
            moreurl: {
                openai: 'https://api.openai.com',
                cn: 'https://api.chatanywhere.cn',
                bubu:'https://gptapi.suisuy.eu.org',
            },
            req_path: {
                completions: "/chat/completions",
                alt: "/v1/chat/completions"
            }
        },
        chatmodel: "gpt-3.5-turbo",
        AIprovider: {
            bingchat: {
                active: true,
                chatContainer:{
                    style:{
                        classList: ["ChatContainer"],
                        width: '100%',
                        height: '70%',
                        color: 'black',
                        backgroundColor: 'inherit',
                        borderTop:'lightblue solid',
                        marginTop:'0.5',
                        overflow: 'auto',
                    },
                    messages:[
                        {
                            role:'assistant',
                            content:'this is bing,ask anything'
                        }
                    ]
                }
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
                height: '50%',
                maxHeight: '400px',
                maxWidth: '350px',
                scrollbarWidth: 'thin',
                fontSize: '0.4',
                font: 'black',
                backgroundColor: '#FEDFC0',
                position: 'fixed',
                top: '80%',
                left: '80%',
                zIndex: 10000000000,
                display: 'block',
                overflow:'auto'

            },

            bubuIcon: {
                src: 'https://lnote.suisuy.eu.org/images/bubu-128.png',
                style: {
                    classList: ["BubuIcon"],
                    width: 0.8,
                    height: 0.8,
                    position: 'sticky',
                    float: 'left',
                    top:0,
                }
            },
            promptButtons: {
                prompts: {},
                style: {
                    classList: ["PromptButtons"],
                    position: 'sticky',
                    top:0,
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
                    { "role": "user", "content": "hi", },
                    { "role": "assistant", "content": "hi anything i can help you? try to click bubu icon and drag topbar", },
                ],
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                config: {
                    isStreamed: true,
                    model: 'gpt-3.5-turbo',
                    temperature: 0.7,
                    max_tokens: 10000,
                }
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
                    bing: {
                        name: 'bing',
                    },
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
                zIndex: 1000000000,

            },
        },


    }

    window.appControler = {
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
            //todo: add drag
            dragElement(appView.promptButtons,appView.bubuContainer,appModel.bubuContainer.dragSpeed || 3);

            setStyle(promptButtonsModel, appView.promptButtons);
            // appView.promptButtons.style.marginLeft = appModel.bubuContainer.bubuIcon.style.width + appModel.sizeUnit;
            // appView.promptButtons.style.position='fixed';
            // appView.promptButtons.style.bottom='0';
            // appView.promptButtons.style.left=appModel.bubuContainer.menuContainer.size.width+'em';


            for (const [key, value] of Object.entries(appModel.bubuContainer.promptButtons.prompts)) {
                console.log(`${key} ${value}`);
                //key is button name,value is prompt prepend to selection txt
                let promptButton = document.createElement('button');
                promptButton.innerHTML = key;
                promptButton.style.color = 'white';
                promptButton.style.backgroundColor = 'transparent';
                promptButton.style.border = '0';
                promptButton.style.padding = '0';
                promptButton.style.marginLeft = '8px';
                promptButton.addEventListener('click', () => {
                    let msgstr=`${value} ${appModel.bubuContainer.inpurtArea.value}`;
                    appControler.sendMessage(msgstr, appModel.bubuContainer.chatContainer.config.isStreamed);
                    let bingSearchBox=document.querySelector('#searchbox');
                    console.log('bingsearchbox set')
                    let serachbox=document.querySelector("#b_sydConvCont > cib-serp").shadowRoot.querySelector("#cib-action-bar-main").shadowRoot.querySelector("div > div.main-container > div > div.input-row > cib-text-input").shadowRoot.querySelector("#searchbox");
                    serachbox.value=msgstr;
                    serachbox.focus();
                    document.execCommand('insertText', false, ' ');
                    

                    setTimeout(() => {
                        document.querySelector("#b_sydConvCont > cib-serp").shadowRoot.querySelector("#cib-action-bar-main").shadowRoot.querySelector("div > div.main-container > div > div.bottom-controls > div.bottom-right-controls > div.control.submit > cib-icon-button").shadowRoot.querySelector("button").click()
                    }, 1000);
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
        updateBingContainer(newChatContainer) {
            appModel.AIprovider.bingchat.chatContainer = {
                ...appModel.AIprovider.bingchat.chatContainer,
                ...newChatContainer
            }
            let chatContainer;
            if (appView.bingchatContainer===undefined || appView.bingchatContainer===null) {
                chatContainer = document.createElement('div');

                appView.bubuContainer.append(chatContainer);
                appView.bingchatContainer = chatContainer;
            }else{
                chatContainer=appView.bingchatContainer;
            }
            setStyle(appModel.AIprovider.bingchat.chatContainer, appView.bingchatContainer);

            chatContainer.innerHTML = '';
            for (const message of appModel.AIprovider.bingchat.chatContainer.messages) {
                let messageDiv = document.createElement('div');
                chatContainer.prepend(messageDiv);
                messageDiv.innerHTML += `<span style="color:blue">${message.role}:</span>`
                messageDiv.innerHTML += window.marked?.parse(message.content) || marked?.parse(message.content) || message.content;
            }

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
        async sendMessage(message = '', isStreamed = true) {
            appControler.menuClickListener.bing(message);

            let userMessageId = Object.keys(appModel.bubuContainer.chatContainer.messages).length;
            let assistantMessageId = userMessageId + 1;

            let newMessagesArray = appModel.bubuContainer.chatContainer.messages;
            if (message !== null || message !== undefined || message !== '') {
                newMessagesArray = [
                    ...newMessagesArray,
                    {
                        role: 'user',
                        content: message,
                        // messageId: userMessageId
                    },
                    {
                        role: 'assistant',
                        content: 'please wait...',
                        // messageId: assistantMessageId  cant send extra proper to openai, it will deny req
                    }
                ];
                this.updateChatContainer({
                    ...appModel.bubuContainer.chatContainer,
                    messages: newMessagesArray,

                })
            }

            if (isStreamed === true || isStreamed === 'true') {
                let chatsession = streamedgpt(
                    newMessagesArray,
                    (newMsgStr, deltaMsgStr) => {
                        console.log(newMsgStr);
                        newMessagesArray = [
                            ...appModel.bubuContainer.chatContainer.messages
                        ];
                        newMessagesArray[assistantMessageId].content = newMsgStr;
                        appControler.updateChatContainer({
                            messages: newMessagesArray
                        })
                    }
                );
                await chatsession.generate();

            }
            else {

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
            }

            //bingai not working now
            if (appModel.AIprovider.bingchat.active === true) {
                //todo
            }

        },
        menuClickListener: {
            bing(message=appModel.bubuContainer.inpurtArea.value){
                console.log('__________-send to bing:' ,message)
                let msgObj={
                    forbing: 'true',
                    message: message
                }
                chrome.runtime?.sendMessage(msgObj, (response) => {
                    console.log('__________received frome backgroud', response);
                });
            },
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
        if (chrome?.storage) {
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



})();


//helper function
/**
 * This code demonstrates how to use the OpenAI API to generate chat completions.
 * The generated completions are received as a stream of data from the API and the
 * code includes functionality to handle errors and abort requests using an AbortController.
 * The API_KEY variable needs to be updated with the appropriate value from OpenAI for successful API communication.
 */

setTimeout(() => {
    console.log('streamedgpt() started');
    return;
    streamedgpt([
        {
            role: 'user',
            content: 'hi,write js code to dplsay a object',
        }
    ]).generate();
}, 2000);


function streamedgpt(
    msgs = [{ role: 'user', content: 'hi' }],
    onMessageFunction = (newMsg, deltaMsg) => { console.log(newMsg, deltaMsg) },
    config = { model: 'gpt3-turbo', temperature: 0.7, max_tokens: 10000, API_KEY: appModel.api.key, API_URL: `${appModel.api.url}${appModel.api.req_path.completions}` },
) {


    const API_URL = config.API_URL || "https://gptapi.suisuy.eu.org/chat/completions";
    const API_KEY = config.API_KEY || "YOUR_API_KEY";


    let controller = null; // Store the AbortController instance

    const generate = async () => {
        // Create a new AbortController instance
        controller = new AbortController();
        const signal = controller.signal;

        try {
            // Fetch the response from the OpenAI API with the signal from AbortController
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: msgs,
                    max_tokens: config.max_tokens,
                    stream: true, // For streaming responses
                }),
                signal, // Pass the signal to the fetch request
            });



            // Read the response as a stream of data
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let totalMessage = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                // Massage and parse the chunk of data
                const chunk = decoder.decode(value);

                const lines = chunk.split("\n");
                const parsedLines = lines
                    .map((line) => line.replace(/^data: /, "").trim()) // Remove the "data: " prefix
                    .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
                    .map((line) => JSON.parse(line)); // Parse the JSON string

                for (const parsedLine of parsedLines) {
                    const { choices } = parsedLine;
                    const { delta } = choices[0];
                    const { content } = delta;
                    // Update the UI with the new content
                    if (content) {
                        totalMessage += content;
                        onMessageFunction(totalMessage, content);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            // Handle fetch request errors
            if (signal.aborted) {
                totalMessage = "Request aborted.";
            } else {
                console.error("Error:", error);
                totalMessage = "Error occurred while generating.";
            }
        } finally {
            // Enable the generate button and disable the stop button
            controller = null; // Reset the AbortController instance
        }
    };

    const stop = () => {
        // Abort the fetch request by calling abort() on the AbortController instance
        if (controller) {
            controller.abort();
            controller = null;
        }
    };

    return { generate, stop };

}

//make draggable
function dragElement(elmnt,movableElmnt=elmnt.parentElement,speed=3) {
    elmnt.style.touchAction = 'none' //need on touch devices
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    let shadeDiv;
    let rmShadeTimeout;

    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onpointerdown = dragMouseDown;


    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onpointerup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onpointermove = elementDrag;

        //create a shade to cover full body to stop iframe catch mouse move
        shadeDiv=document.createElement('div');
        shadeDiv.style.width="300vw";
        shadeDiv.style.height="300vh";
        shadeDiv.style.position="fixed";
        shadeDiv.style.top='0';
        shadeDiv.style.left='0';
        shadeDiv.style.backgroundColor='rgb(20,20,0,0.2)'
        shadeDiv.style.zIndex=100000
        document.body.appendChild(shadeDiv);
        rmShadeTimeout= setTimeout(() => {
            document.body.removeChild(shadeDiv);
        }, 20000);
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
        movableElmnt.style.top = (movableElmnt.offsetTop - pos2*speed) + "px";
        movableElmnt.style.left = (movableElmnt.offsetLeft - pos1*speed) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        console.log('pointerup')
        document.onpointerup = null;
        document.onpointermove = null;

        document.body.removeChild(shadeDiv);
        clearTimeout(rmShadeTimeout);
    }
}
