

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
     let response = xhr.response;
     print("getfilekey response:"+response);
     let nodes = JSON.parse(response).nodes;
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
  const fileurl = "https://file.io/"+key
  print("runscript fileurl:"+fileurl);  
  const xhr = new XMLHttpRequest();
  xhr.open("GET", fileurl);
  xhr.onload = function () {
   print("getfilekey status:"+xhr.status);
   if (xhr.status === 200) {
     let response = xhr.response;
     printlines("runscript response:"+response);
     eval(response);
    }
  };
  xhr.send(null);
}

var x = 1;
var y = 0;
function print(text) {
  y++;
  ap37.print(x, y, text, "#ffffff");
}

function printlines(text){
  let pos=0;
  while(pos < text.length){    
    print(text.substring(pos, Math.min(pos+w,text.length)));
    pos += w;
  }
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
