branch='main';
script='notifcount.js';
url='https://raw.githubusercontent.com/kyrlian/ap37/'+branch+'/'+script;  
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.onload = function () {
 if (xhr.status === 200) {
  eval(xhr.response)
 }
};
xhr.send();
