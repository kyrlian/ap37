

const fileioapikey = "4NA6HxxEZ21";

const scriptname = "custom.js";

function getfilekey(filename,callback){
  const data = "search="+filename;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open("GET", "https://file.io/");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer " + fileioapikey);
  xhr.onload = function () {
   print("getfilekey status:"+xhr.status);
   if (xhr.status === 200) {
     print("getfilekey response:"+xhr.response);
     let key = JSON.parse(xhr.response).nodes[0].key;
     print("getfilekey key:"+key);
     callback(key);
   }
  };
  xhr.send(data);
}

function runscript(key){
  const data = "key="+key;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open("GET", "https://file.io/");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer " + fileioapikey);
  xhr.onload = function () {
   print("runscript status:"+xhr.status);
   if (xhr.status === 200) {
    print("runscript response:"+xhr.response);
    print("response:"+xhr.response);
    eval(xhr.response);
   }
  };
  xhr.send(data);
}

var x = 1;
var y = 0;
function print(text) {
  y += 2;
  ap37.print(x, y, text, "#ffffff");
}

getfilekey(scriptname,runscript);
