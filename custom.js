(function script() {
  'use strict';
 
  // config
  const config={
   appversion:'ap37-kyr',
   hideapps:["ap37","Internet","Google", "Freebox","Hacker's Keyboard","Play Games","Steam Chat","Steam Link"],
   appdisplayname:{"foobar2000":"foobar","Mars: Mars":"Mars"},
   bgchars:'-._ /',
   notifguesslist:{"Bing":"Bing","photos auto-added":"Photos"," years ago":"Photos"," Chest unlocked":"Clash Royale","card request":"Clash Royale", "new messages":"Gmail"};
   appnameminwidth:8,
   notifstart:2,
   displayablenotifs : 6,
   appstart : 2 + 6 + 1,
   bgcolor:'#333333',
   textcolordim:'#999999',
   textcolorbright:'#ffffff',
   highlightcolor='#ff3333',
   appprefix:'>',
   appprefixonnotif:'>',//will also be highlighted
   appdisplaymode:'grid',//grid or text
  }
  //
  var w, h
  function init() {
    ap37.setTextSize(13);
    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();
    background.init();
    print(3, h-1, config.appversion);//bottom left
    time.init();
    battery.init();
    apps.init();
    notifications.init();
    print(w - 5, h - 1, 'EOF');
    ap37.setOnTouchListener(function (x, y) {
      notifications.onTouch(x, y);
      apps.onTouch(x, y);
    });
  }

  // modules

  var background = {
    randomline: function(nbc){
      let line = "";
      for (let i = 0; i < nbc; i++) {
        line += config.bgchars.charAt(Math.floor(Math.random() * config.bgchars.length));
      }
      return line;
    },
    printPattern: function (x0, xf, y) {//redraw background for a single line
      print(x0, y, background.randomline(xf), config.bgcolor);
    },
    init: function () {
      let buffer = []
      for (var i = 0; i < h; i++) {
        buffer.push(background.randomline(w));
      }
      ap37.printLines(buffer, config.bgcolor);
    }
  };

  var time = {
    update: function () {
      var d = ap37.getDate();
      var time = d.year +
        leftPad(d.month, 2, '0') + leftPad(d.day, 2, '0') + ' ' +
        leftPad(d.hour, 2, '0') + leftPad(d.minute, 2, '0');
      print(3, 0, time);
    },
    init: function () {
      time.update();
      setInterval(time.update, 60000);
    }
  };

  var battery = {
    update: function () {
      print(w - 6, 0,
        leftPad(ap37.getBatteryLevel(), 3, ' ')+'%');
    },
    init: function () {
      battery.update();
      setInterval(battery.update, 60000);
    }
  };

  var notifications = {
    list: [],
    active: false,
    guessapp: function (notification) { 
      for (var k in config.notifguesslist){
        if (notification.name.search(k)>=0){
          notification.appname = config.notifguesslist[k]
        }
      }
    },
    update: function () {
      notifications.active = ap37.notificationsActive();
      if (notifications.active) {
        var nots = ap37.getNotifications();
        notifications.list = nots; 
        // count notification per app
        notificationcounter={}
        for (var i=0;i<nots.length;i++){
          var notification = nots[i]
          notifications.guessapp(notification)
          if (notification.appname){
            if (notification.appname in notificationcounter){
              notificationcounter[notification.appname] = notificationcounter[notification.appname] +1
            }else{
              notificationcounter[notification.appname] = 1
            }
          }
        }
        // update notif counter on apps with notifications
        for ( var j=0;j<apps.list.length;j++){
          var app = apps.list[j]
          if (app.name in notificationcounter){
              app.notifcount = notificationcounter[app.name]
              apps.printNotifCount(app)
          }
        }
        for (var i = 0; i < config.displayablenotifs ; i++) {// display max n notifications
          var y = i + config.notifstart;// print notifications from line 2
          background.printPattern(0, w, y);//erase line first
          if (i < nots.length) {
            nots[i].y = y;
            if (i ==  config.displayablenotifs-1 && nots.length > config.displayablenotifs) {
              nots[i].ellipsis = true;// if last displayable notif and has more
            }
            notifications.printNotification(nots[i], false);
          }
        }
      } else {
        print(0,config.notifstart , 'Activate notifications');
      }
    },
    printNotification: function (notification, highlight) {
      var name = notification.name;
      var disp = (notification.appname ? notification.appname+":":" ") +name 
      if (notification.ellipsis) {
        var length = Math.min(disp.length, w - 7);
        disp = disp.substring(0, length) + "... +" +
          (notifications.list.length - config.displayablenotifs);//override last notification with: name... number of remaining notifs
      }
      print(0, notification.y, disp, highlight ? config.highlightcolor : config.textcolorbright);// highlight is set on touch callback 
      if (highlight) {// if highlight set a timeout to reset to normal
        setTimeout(function () {
          notifications.printNotification(notification, false);
        }, 1000);
      }
    },
    init: function () {
      ap37.setOnNotificationsListener(notifications.update);
      notifications.update();
    },
    onTouch: function (x, y) {
      if (notifications.active) {
        for (var i = 0; i < notifications.list.length; i++) {
          if (notifications.list[i].y === y) {
            notifications.printNotification(notifications.list[i], true);// highlight touched
            ap37.openNotification(notifications.list[i].id);// and open
            return;
          }
        }
      } else if (y === config.notifstart) {// permission request alert on line  3
        ap37.requestNotificationsPermission();
      }
    }
  };

  var apps = {
    list: [],
    pagefirstappnum: {0:0},
    lineHeight: 2,
    topMargin: config.appstart,
    bottomMargin: 8,
    lines: 0,
    appWidth: 6,
    appsPerLine: 0,
    appsPerPage: 0,
    currentPage: 0,
    isNextPageButtonVisible: false,
    getdisplayname: function(app){
      let n=app.name 
      if(n in config.appdisplayname){ n=config.appdisplayname[n]}
      app.displayname =  n[0].toUpperCase()+n.slice(1).replaceAll(" ","");
    },
    printPageGrid: function (page) {
      var appPos = page * apps.appsPerPage;
      for (var x = 0; x + apps.appWidth <= w; x += apps.appWidth) {
        for (var y = apps.topMargin; y < apps.topMargin + apps.lines *
        apps.lineHeight; y += apps.lineHeight) {
          background.printPattern(x, x + apps.appWidth, y);
          if (appPos < apps.list.length) {
            var app = apps.list[appPos];
            app.y = y;
            app.x0 = x;
            app.xf = x + apps.appWidth;
            apps.printApp(app, false);
            appPos++;
          }
        }
      }
    },
    printPageText: function (page) {
      let appnum = apps.pagefirstappnum[page];
      let fits = true;
      let x = 0;
      let y = apps.topMargin;
      while(fits){
        let app = apps.list[appnum];
        app.xf = x + (config.appprefix + app.displayname).length;
        if (app.xf > w){//if out of row
          x=0;
          y++;
          if(y>(h-apps.bottomMargin)){//out of screen
            fits=false;
            apps.pagefirstappnum[page+1]=appnum;
            apps.pagination(true);// and activate pagination
          }
        }
        if(fits){
          app.x0 = x;
          app.y = y;
          app.xf = x + (config.appprefix + app.displayname).length;
          apps.printApp(app, false);
          appnum++;
        }
      }
      if(page==0 && fits){
        apps.pagination(false);// deactivate pagination
      }
    },
    printApp: function (app, highlight) {
      let display = config.appprefix + app.displayname
      if(config.appdisplaymode=='grid'){//grid mode
        display =  display.substring(0, apps.appWidth - 1)
      }
      print(app.x0, app.y, display, highlight ? config.highlightcolor : config.textcolordim);
      if (highlight) {
        setTimeout(function () {
          apps.printApp(app, false);
        }, 1000);
      } else {
        print(app.x0+config.appprefix.length, app.y, app.displayname[0], config.textcolorbright);//highlight first letter after prefix
      }
    },
    printNotifCount: function(app) {
      if (app.notifcount > 0){
         print(app.x0, app.y, config.appprefixonnotif + app.displayname, config.textcolorbright);//highlight prefix
      }
    },
    pagination: function (onoff) {
      if(onoff){
        apps.isNextPageButtonVisible = true;// and activate pagination
        print(w - 4, h - 9, '>>>');
        print(w - 4, h - 8, '>>>');// TODO keep only one ?
      } else {
        apps.isNextPageButtonVisible = false;
        background.printPattern(w - 4, w, h - 9);// erase pagination >>>
      }
    },
    init: function () {
      apps.list=[];
      appslist = ap37.getApps();
      for (var i = 0; i<appslist.length; i++){
       var app=appslist[i];
       if (!config.hideapps.includes(app.name)){
        app.notifcount=0;
        apps.getdisplayname(app)
        apps.list.push(app);
       }
      }
      apps.currentPage = 0;
      if(config.appdisplaymode=='grid'){//grid mode
        apps.lines = Math.floor((h - apps.topMargin - apps.bottomMargin) / apps.lineHeight);
        apps.appsPerLine = Math.ceil(apps.list.length / apps.lines);
        apps.appWidth = Math.floor(w / apps.appsPerLine);
        // check minimum app name length
        if (apps.appWidth < config.appnameminwidth) {//if available app width is too small
          apps.appWidth = config.appnameminwidth;// force
          apps.appsPerLine = Math.floor(w / apps.appWidth);
          apps.pagination(true);// and activate pagination
        } else {
          apps.pagination(false);
        }
        apps.appsPerPage = apps.lines * apps.appsPerLine;
        apps.printPageGrid(apps.currentPage);
      }else{//text mode
        apps.printPageText(apps.currentPage);
      }
      ap37.setOnAppsListener(apps.init);// reset app list callback
    },
    onTouch: function (x, y) {
      for (var i = apps.currentPage * apps.appsPerPage; i <
      apps.list.length; i++) {
        var app = apps.list[i];
        if (y >= app.y && y <= app.y + 1 &&
          x >= app.x0 && x <= app.xf) {
          apps.printApp(app, true);
          ap37.openApp(app.id);
          return;
        }
      }
      if (apps.isNextPageButtonVisible &&
        y >= h - 9 && y <= h - 8 &&
        x >= w - 4 && x <= w) {
        apps.currentPage++;
        if(config.appdisplaymode=='grid'){//grid mode
          if (apps.currentPage * apps.appsPerPage >= apps.list.length) {
            apps.currentPage = 0;
          }
          apps.printPageGrid(apps.currentPage);
        }else{//text mode
          if (!(apps.currentPage in apps.pagefirstappnum)){
            apps.currentPage = 0;
          }
          apps.printPageText(apps.currentPage);
        }
      }
    }
  };

  var meteo ={//TODO stub meteo
    url:"https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&forecast_days=1"
   // url:"https://api.open-meteo.com/v1/forecast?latitude=48.8534&longitude=2.3488&hourly=apparent_temperature&forecast_days=1"
  };

  //utils
  hexchars="0123456789abcdef";
  function randomizeHexColor(c) {
    function rndhex() {
      return hexchars.charAt(Math.floor(Math.random() * 16));
    }
    function shift(h){//for each digit go up/dowm by 1
      let i=hexchars.indexOf(h); 
      let s=Math.max(0,Math.min(15,i+Math.floor(Math.random()*3)-1))
      return hexchars[s]
    }
    let r="#"
    for (let j=0;j<6;j++){
     r+=shift(c.charAt(j))
    }
    //return r
    return "#" + c.charAt(1)+ rndhex()+c.charAt(3) + rndhex()+c.charAt(5) + rndhex();
  }

  function print(x, y, text, color) {
    let rcolor =  color || config.textcolorbright;
    ap37.print(x, y, text, rcolor);
  }

  function get(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(xhr.response)
      }
    };
    xhr.send();
  }

  function leftPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      new Array(newLength - str.length + 1).join(char) + str : str;
  }

  function rightPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      str + new Array(newLength - str.length + 1).join(char) : str;
  }

  function arrayFill(value, length) {
    var result = [];
    for (var i = 0; i < length; i++) {
      result.push(value);
    }
    return result;
  }

  function debug(str){
    print(0,h-2,str,'#ff3333')
  }
  init();
})();
  
// pull requests github.com/kyrlian/ap37
// pull requests github.com/apseren/ap37

