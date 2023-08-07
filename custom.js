(function script() {
  'use strict';
 
  // config
  const config={
   appversion:'ap37-kyr',
   hideapps:["ap37","Internet","Google", "Freebox","Hacker's Keyboard","Play Games","Steam Chat","Steam Link"],
   favoriteapps:["Phone","Signal","Gmail","Maps","Camera"],
   appdisplayname:{"foobar2000":"foobar","Mars: Mars":"Mars","Coding Python" : "Python",   "Freebox Connect" : "Freebox","G7 Taxi" : "G7","Keep Notes" : "Keep","Linux Command Library" : "Linux Command","Mandel Browser" : "Mandelbrot","Picturesaurus for Reddit" : "Picturesaurus","Simple Text Editor" : "TextEdit","SNCF Connect" : "SNCF"},
   notifguesslist:{"Bing":"Bing","photos auto-added":"Photos"," years ago":"Photos"," Chest unlocked":"Clash Royale","card request":"Clash Royale", "new messages":"Gmail"},
   appnameminwidth:8,//for grid display
   bgchars:'-._ /',
   bgcolor:'#333333',
   textcolordim:'#999999',
   textcolorbright:'#ffffff',
   highlightcolor:'#ff3333',
   appprefix:'>',
   appprefixonnotif:'>',//will also be highlighted
   appdisplaymode:'grid',//grid or text
  }
  //
  ap37.setTextSize(13);
  var w = ap37.getScreenWidth();
  var h = ap37.getScreenHeight();
  function init() {
    background.init();
    header.init();
    apps.init();// do apps before notifications
    notifications.init();
    favorites.init();
    footer.init();
    ap37.setOnTouchListener(function (x, y) {
      header.onTouch(x, y);
      apps.onTouch(x, y);
      notifications.onTouch(x, y);
      favorites.onTouch(x, y);
      footer.onTouch(x,y);
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
  
  var header = {
    heigth:2,
    top:0,
    bottom:2,
    init: function () {
      time.init();
      battery.init();
      meteo.init()
    },
    onTouch: function (x, y) {
      if(y==header.top){
        meteo.onTouch(x,y);
      }
    },
  };

  var time = {
    update: function () {
      var d = ap37.getDate();
      var time = d.year +
        leftPad(d.month, 2, '0') + leftPad(d.day, 2, '0') + ' ' +
        leftPad(d.hour, 2, '0') + leftPad(d.minute, 2, '0');
      print(3, header.top, time);
    },
    init: function () {
      time.update();
      setInterval(time.update, 60000);
    },
    onTouch: function (x, y) {
      // TODO open clock app
    }
  };

  var battery = {
    update: function () {
      print(w - 6, header.top,
        leftPad(ap37.getBatteryLevel(), 3, ' ')+'%');
    },
    init: function () {
      battery.update();
      setInterval(battery.update, 60000);
    }
  };

  var meteo = {//TODO stub meteo
    url:"https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&forecast_days=1",
    init: function () {
      meteo.update();
      setInterval(meteo.update, 3600000);//1h
    },
    update: function () {
       // todo update temp
    },
    onTouch: function (x, y) {// todo open meteo app
    }
  };

  var footer = {
    heigth:1,
    top:h-1,
    bottom:h,
    init: function () {
      print(3, footer.top, config.appversion);//bottom left
      settings.init()
    },
    onTouch: function (x, y) {
      if(y == footer.top){
        settings.onTouch(x,y);
      }
    }
  };


  var settings = {
    init: function () {
      settings.update();
    },
    update: function () {
      print(w - 5, footer.top, config.appdisplaymode.toUpperCase());
    },
    onTouch: function (x, y) {
      if (x >= w-5 && y >= footer.top){
        config.appdisplaymode = (config.appdisplaymode=='grid') ? 'text' : 'grid';//grid or text
        apps.update();
        settings.update();
      }
    }
  };


  var notifications = {
    heigth:6,
    top: header.bottom,
    bottom: header.bottom+6,
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
        let notificationcounter={}
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
        for (var i = 0; i < notifications.heigth; i++) {// display max n notifications
          var y = i + notifications.top;// print notifications from line 2
          background.printPattern(0, w, y);//erase line first
          if (i < nots.length) {
            nots[i].y = y;
            if (i ==  notifications.height -1 && nots.length > notifications.height) {
              nots[i].ellipsis = true;// if last displayable notif and has more
            }
            notifications.printNotification(nots[i], false);
          }
        }
      } else {
        print(0, notifications.top, 'Activate notifications');
      }
    },
    printNotification: function (notification, highlight) {
      var name = notification.name;
      var disp = (notification.appname ? notification.appname+":":" ") +name 
      if (notification.ellipsis) {
        var length = Math.min(disp.length, w - 7);
        disp = disp.substring(0, length) + "... +" +
          (notifications.list.length -  notifications.height); //last notification with: name... number of remaining notifs
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
      } else if (y === notifications.top ) {// permission request alert on line  3
        ap37.requestNotificationsPermission();
      }
    }
  };

  var favorites = {
    bottom: footer.top,
    heigth:2,
    top: footer.top-2,
    init: function () {
      //TODO display favoriteapps on a single line
    },
    update: function () {
    },
    onTouch: function (x, y) {
    }
  };

  var apps = {
    heigth: favorites.top - 1 - notifications.bottom,
    top: notifications.bottom,
    bottom: favorites.top - 1, //keep 1 because we use bottom line for pagination    
    list: [],
    pagefirstappnum: {0 : 0},
    lineHeight: 2,
    lines: 0,
    appWidth: 6,
    appsPerLine: 0,
    appsPerPage: 0,
    currentPage: 0,
    isNextPageButtonVisible: false,
    getdisplayname: function(app){
      let n = app.name;
      if(n in config.appdisplayname){ n = config.appdisplayname[n]; };
      app.displayname = n[0].toUpperCase() + n.slice(1).replaceAll(" ","");
    },
    printPageGrid: function (page) {
      var appPos = page * apps.appsPerPage;
      for (var x = 0; x + apps.appWidth <= w; x += apps.appWidth) {
        for (var y = apps.top; y < apps.bottom; y += apps.lineHeight) {
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
      let x = 0;
      let y = apps.top;
      background.printPattern(0, w, y);
      while(y < apps.bottom && appnum < apps.list.length){
        let app = apps.list[appnum];
        let xf = x + (config.appprefix + app.displayname).length;
        if (xf > w){//if out of row
          x=0;
          y+=2;//keep a blank line between rows
          if(y>= apps.bottom ){//out of screen
            apps.pagefirstappnum[page+1]=appnum;
            apps.pagination(true);// and activate pagination
          }else{
            background.printPattern(0, w, y);
          }
        }
        if(y < apps.bottom){
          app.x0 = x;
          app.y = y;
          app.xf = x + (config.appprefix + app.displayname).length;
          apps.printApp(app, false);
          x = app.xf + 1;//space between apps
          appnum++;
        }
      }
      if(page==0 && y < apps.bottom ){
        apps.pagination(false);// deactivate pagination
      }
      for(let j=y;j< apps.bottom ;j++){
        background.printPattern(0, w, j);//erase rest of the zone
      }
    },
    printApp: function (app, highlight) {
      let display = config.appprefix + app.displayname
      if(config.appdisplaymode == 'grid'){//grid mode
        display =  display.substring(0, apps.appWidth - 1)
      }
      print(app.x0, app.y, display, highlight ? config.highlightcolor : config.textcolordim);
      apps.printNotifCount(app);
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
        print(w - 4, apps.bottom, '>>>');
      } else {
        apps.isNextPageButtonVisible = false;
        background.printPattern(w - 4, w, apps.bottom);// erase pagination >>>
      }
    },
    init: function () {
      apps.list=[];
      let appslist = ap37.getApps();
      for (var i = 0; i<appslist.length; i++){
       var app=appslist[i];
       if (!config.hideapps.includes(app.name)){
        app.notifcount=0;
        apps.getdisplayname(app)
        apps.list.push(app);
       }
      }
      apps.currentPage = 0;
      apps.lines = Math.floor( apps.heigth / apps.lineHeight);
      apps.update();
      ap37.setOnAppsListener(apps.init);// reset app list callback
    },
    update: function() {
      if(config.appdisplaymode=='grid'){//grid
        // check minimum app name length
        apps.appsPerLine = Math.ceil(apps.list.length / apps.lines);
        apps.appWidth = Math.floor(w / apps.appsPerLine);
        if (apps.appWidth < config.appnameminwidth) {//if available app width is too small
          apps.appWidth = config.appnameminwidth;// force
          apps.appsPerLine = Math.floor(w / apps.appWidth);
          apps.pagination(true);// and activate pagination
        } else {
          apps.pagination(false);
        }
        apps.appsPerPage = apps.lines * apps.appsPerLine
        apps.printPageGrid(apps.currentPage);
      } else {//text mode
        apps.printPageText(apps.currentPage);
      }
    },
    onTouch: function (x, y) {
      for (var i = apps.currentPage * apps.appsPerPage; i < apps.list.length; i++) {
        var app = apps.list[i];
        if (y >= app.y && y <= app.y + 1 &&
          x >= app.x0 && x <= app.xf) {
          apps.printApp(app, true);
          ap37.openApp(app.id);
          return;
        }
      }
      if (apps.isNextPageButtonVisible && y == config.zonepaginationstart && x >= w - 4 ) {
        apps.currentPage++;
        if((config.appdisplaymode=='grid' && apps.currentPage * apps.appsPerPage >= apps.list.length) ||
         (config.appdisplaymode=='text' && !(apps.currentPage in apps.pagefirstappnum))){
            apps.currentPage = 0;
        }
        apps.update();
      }
    }
  };


  //utils
  const hexchars="0123456789abcdef";
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
