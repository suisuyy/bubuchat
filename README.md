# bubuchat
<img  src="./images/icon-128.png">

Bubu is Cute ai assistant and browser extension powered by chatgpt,Highly customizable

try bubu quickly at 
<a href="https://bubu.suisuy.eu.org">bubu test page</a> or
<a href="https://bubu.pages.dev">bubu test page2</a>

drag bubu icon at bottom-left screen to move.
after install as broser extension,bubu will apear on any webpage,you can customize it and add more skill/prompt button as need


<img  src="./doc/img/demotrans.png">
<strong>use bubu as translator:select some text on page then click tran button </strong>

<br> <br> 



# feature

**Highly customizable**
	this why bubu here,there are some ai extension already but their function is  Fixed and unchangable so limited . the app is modeled by simple string,  by writting string to modify the model,its possible to modify every aspect including style,function... most importantly, you can add skill/function using nature language!

Small ,fast and lightweight

Work well on any device,from pc to mobile phone

Bubu is cute? maybe...



# usage
current not available in chrome store or firefox,need install the extension manully:download the repo,then go to chrome extension setting,enable dev mode,then load unpacked choose the project folder; extension works on android kiwi browser or firefox. 

1.after install it,bubu will apear on the webpage at left bottom,click icon to show more settings,drag it to move the window

2.set up your api url and key,there a free api server preconfigured now, powered by project gpt4free but maybe unstable

3.select some txt on webpage,then click tran button,your txt will tranlate to many language,you can set your own action and more button easily,this make bubu very flexable and powerfull

4.read pdf: not work in builtin pdf read,try to  install pdf.js extension to open pdf file, or use this webapp <a href="https://mozilla.github.io/pdf.js/web/viewer.html" >pdfjs viewer</a>, drag a pdf file to webpage then read  


# configuration
there is no normal UI to change app perference currently,the only way is click bubu icon then there will be a setting button at bottom of the page,open a complex setting page,need some learning to change it. Actually this page is writen by chatgpt,so it maybe look odd,its just a naive object editor.  
simple UI will be added later


Todo:

Improve UI style and more cuter bubu icon and image : )


Friendly and easy setting ,current only advanced setting by click icon then setting apear,remember to save after change done,its powerfull but not convient and risky,click bubu icon then  reset if broken

Change to testdriven dev,auto testing. now only manual testing 

maybe add bingchat and google bard

firefox fix. Bubu not work on some page when use firefox due to security policy,it prohibit sending 3rd api http request ,this not easy to fixed . use chrome based browser first 

more simple and well structed code,currently all code messed in content.js 


Else:

if dislike extension,Bubu can be installed as tempermokey script,though some function not works ,just copy **script/content.js** to tampermokey script,almost all function implemented in that script 


