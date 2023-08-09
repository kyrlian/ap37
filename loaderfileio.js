

const scriptname = "custom.js";
const fileioapikey = "4NA6HxxEZ21";

function getfilekey(filename,callback){
  const data = "search="+filename;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open("GET", "https://file.io/");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", "Bearer "+fileioapikey);
  xhr.onload = function () {
   ap37.print(2, "getfilekey status:"xhr.status);
   if (xhr.status === 200) {
     ap37.print(4, "response:"+xhr.response);
     let key = JSON.parse(xhr.response).nodes[0].key
     ap37.print(6, "key:"key);
     callback(key)
   }
  };
  xhr.send(data);
}

function runscript(key){
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.onload = function () {
   ap37.print(8, "runscript status:"xhr.status);
   if (xhr.status === 200) {
    eval(xhr.response)
   }
  };
  xhr.open("GET", "https://file.io/"+key);
  xhr.setRequestHeader("Authorization", "Bearer "+fileioapikey);
  xhr.send(null);
}

function print(y, text) {
  ap37.print(0, y, text, "#ffffff#);
}

getfilekey(scriptname,runscript);
