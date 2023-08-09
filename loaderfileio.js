

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
     let nodes = JSON.parse(xhr.response).nodes;
     if (nodes.length >0){
       let key = nodes[0].key;
       print("getfilekey key:"+key);
       callback(key);
     } else {
      print("file "+filename+" not found");
     }
   }
  };
  xhr.send(data);
}

function runscript(key){
  const data = null;
  const fileurl = "https://file.io/"+key
  print("runscript fileurl:"+fileurl);
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open("GET", fileurl);
  xhr.setRequestHeader("Authorization", "Bearer " + fileioapikey);
  xhr.onload = function () {
   print("runscript status:"+xhr.status);
   if (xhr.status === 200) {
    print("runscript response:"+xhr.response);
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

var w = ap37.getScreenWidth();
var h = ap37.getScreenHeight();
function clearscreen() {
  let buffer = [];
  for (var i = 0; i < h; i++) {
    buffer.push(" ".repeat(w));
  }
  ap37.printLines(buffer, "#000000");
}
clearscreen();
getfilekey(scriptname,runscript);
