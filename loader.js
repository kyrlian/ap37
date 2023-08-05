url='https://raw.githubusercontent.com/kyrlian/ap37/master/script.js'  
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.onload = function () {
 if (xhr.status === 200) {
  eval(xhr.response)
 }
};
xhr.send();
