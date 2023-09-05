console.log('start backgroudjs')


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



chrome.runtime.onMessage.addListener(async (msgObj, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  console.log('got msg from content or popup:', msgObj,'sendtab is:',sender.tab.id)
  chrome.tabs.sendMessage(sender.tab.id,{message:msgstr,from:'backgroudjs'})
  sendResponse('ok');

});



