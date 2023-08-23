note: chrome extension reload seems not good at reload manifest.json,if it changed,need restart chrome to make it work

to load lib script from content.js is not easy,cant just create a script elemnt and add to document body or header because content scurity policy,use this way:
support need add scrpits/marked.js to contents.js add this to mainifest.js and restart browser:
```
  "web_accessible_resources": [{
     "matches": ["<all_urls>"],
     "resources": ["scripts/marked.js"]
   }],
```   
  
add this to script/content.js:
```
    await (async () => {
        const src = chrome.runtime.getURL("scripts/marked.js");
        const contentMain = await import(src);
      })();
    console.log('marked.js loaded',marked)
```
or:
```
    'use strict';
    
    const script = document.createElement('script');
    script.setAttribute("type", "module");
    script.setAttribute("src", chrome.extension.getURL('scripts/marked.js'));
    const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore(script, head.lastChild);
```


follow
https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/
to make a helloword chrome extension
you can put png to a folder like /image, and change manifest.json like(restart chrome is needed to take effect):
```
"action": {
    "default_popup": "/popup/hello.html",
    "default_icon": "image/bubu.png"
  }
```


follow 
https://developer.chrome.com/docs/extensions/mv3/getstarted/tut-reading-time/
to add content scripts that executed on current webpage,remembe to restart chrome after add this to manifest.json:
```
"content_scripts": [
    {
      "js": ["scripts/content.js"],
      "matches": [
        "https://developer.chrome.com/docs/extensions/*",
        "<all_urls>"
      ]
    }
  ]

```
then put code to scripts/content.js


its odd(seen code comment below) to use storage api,put it to popup/popup.js or scripts/content.js
```
chrome.storage.sync.set({ test: 'testt' }).then(() => {
    console.log("Value is set"); //value can be object
});
  
chrome.storage.sync.get(["test"]).then((result) => {
        console.log("Value currently is " , result);
        //here result is a odd object {test:'testt'} not just the value
  });

```

