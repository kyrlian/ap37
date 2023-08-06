  'use strict';
 

  // config
  //TODO tuple config
  let config={}
  let appversion='ap37-kyr';
  let hideapps=["Internet","Google", "Freebox","Hacker's Keyboard","Play Games","Steam Chat","Steam Link"];
  let apprename={"foobar2000":"foobar","Mars: Mars":"Mars"}
  let bgchars='-._ /'
  let notifguesslist={" Chest unlocked":"Clash Royale","card request":"Clash Royale", "new messages":"Gmail"}
  let appnameminwidth=8;
  let notifstart=2;
  let displayablenotifs = 6
  let appstart = notifstart +displayablenotifs+1
  let bgcolor='';//TODO: use it below
  let textcolor='';//TODO: use it below
  let highlightcolor='';//TODO: use it below
  let appprefix='>';
  let appprefixonnotif='*';
  //
  var w, h
  function init() {
    ap37.setTextSize(13);

    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();

    background.init();
    print(3, h-1, appversion);//bottom left
    time.init();
    battery.init();
    apps.init()
    notifications.init();
    print(w - 5, h - 1, 'EOF');

    ap37.setOnTouchListener(function (x, y) {
      notifications.onTouch(x, y);
      apps.onTouch(x, y);
    });
  }

  // modules

  var background = {//TODO no need to save, just regen as needed
    buffer: [],
    pattern: '',
    printPattern: function (x0, xf, y) {
      print(x0, y,
        background.pattern.substring(y * w + x0, y * w + xf),
        '#333333');
    },
    init: function () {//TODO move char list to config
      //random chars for background
      for (let i = 0; i < w*h; i++) {
        background.pattern += bgchars.charAt(Math.floor(Math.random() * bgchars.length));
      }
      for (var i = 0; i < h; i++) {
        background.buffer.push(background.pattern.substr(i * w, w));
      }
      ap37.printLines(background.buffer, '#333333');
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
    update: function () {
      notifications.active = ap37.notificationsActive();
      if (notifications.active) {
        var nots = ap37.getNotifications();
        notifications.list = nots; 
        for ( var i=0;i<nots.length;i++){
          var notif = nots[i]
          notifications.guessapp(notif)
        }//TODO merge 2 for
        for (var i = 0; i < displayablenotifs; i++) {// display max n notifications
          var y = i + notifstart;// print notifications from line 2
          background.printPattern(0, w, y);//erase line first
          if (i < nots.length) {
            nots[i].y = y;
            if (i ==  displayablenotifs-1 && nots.length > displayablenotifs) {
              nots[i].ellipsis = true;// if last displayable notif and has more
            }
            notifications.printNotification(nots[i], false);
          }
        }
        // TODO use apps.notifcount to add counts
      } else {
        print(0,notifstart , 'Activate notifications');
      }
    },
    guessapp: function(notification){ 
      var nn=notification.name
      for (k in notifguesslist){
        if (nn.search(k)>=0){
          notifapp=notifguesslist[k]
          notification.app=notifapp
          notification.display = notifapp+":"+nn 
          apps.notifcount[notifapp]=apps.notifcount[notifapp]+1
          //return notifguesslist[k]
        }
      }
      //return ""
    },
    printNotification: function (notification, highlight) {
      var name = notification.name;
      var disp = notification.display || name 
      if (notification.ellipsis) {
        var length = Math.min(disp.length, w - 7);
        disp = disp.substring(0, length) + "... +" +
          (notifications.list.length - displayablenotifs);//override last notification with: name... number of remaining notifs
      }
      print(0, notification.y, disp, highlight ? '#ff3333' : '#ffffff');// highlight is set on touch callback 
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
      } else if (y === notifstart) {// permission request alert on line  3
        ap37.requestNotificationsPermission();
      }
    }
  };

  var apps = {
    list: [],
    notifcount:{},
    lineHeight: 2,
    topMargin: appstart,
    bottomMargin: 8,
    lines: 0,
    appWidth: 6,
    appsPerLine: 0,
    appsPerPage: 0,
    currentPage: 0,
    isNextPageButtonVisible: false,
    getappname: function(app){
      let n=app.name 
      if(n in apprename){ n=apprename[n]}
      return appprefix+n[0].toUpperCase()+n.slice(1).replaceAll(" ","");
    },
    printPage: function (page) {
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
    printApp: function (app, highlight) {
      n=apps.getappname(app)
      print(app.x0, app.y, 
        n.substring(0, apps.appWidth - 1),
        highlight ? '#ff3333' : '#999999');
      if (highlight) {
        setTimeout(function () {
          apps.printApp(app, false);
        }, 1000);
      } else {
        print(app.x0+appprefix.length, app.y, n.charAt(appprefix.length), '#ffffff');//highlight first letter after prefix
      }
    },
    init: function () {
      apps.list=[];
      appslist = ap37.getApps();
      for (var i = 0; i<appslist.length; i++){
       var app=appslist[i];
       if (!hideapps.includes(app.name)){
        apps.list.push(app);
        apps.notifcount[app.name]=0;
       }
      }
      // TODO print continous on each line
      apps.lines = Math.floor(
        (h - apps.topMargin - apps.bottomMargin) / apps.lineHeight);
      apps.appsPerLine = Math.ceil(apps.list.length / apps.lines);
      apps.appWidth = Math.floor(w / apps.appsPerLine);

      // check minimum app name length
      if (apps.appWidth < appnameminwidth) {//if available app width is too small
        apps.appWidth = appnameminwidth;// force
        apps.appsPerLine = Math.floor(w / apps.appWidth);
        apps.isNextPageButtonVisible = true;// and activate pagination
        print(w - 4, h - 9, '>>>');
        print(w - 4, h - 8, '>>>');// TODO keep only one
      } else {
        apps.isNextPageButtonVisible = false;
        background.printPattern(w - 4, w, h - 9);// erase pagination >>>
      }

      apps.appsPerPage = apps.lines * apps.appsPerLine;
      apps.currentPage = 0;

      apps.printPage(apps.currentPage);

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
        if (apps.currentPage * apps.appsPerPage >= apps.list.length) {
          apps.currentPage = 0;
        }
        apps.printPage(apps.currentPage);
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
    let rcolor =  randomizeHexColor(color || '#eeeeee');
    background.buffer[y] = background.buffer[y].substr(0, x) + text +
      background.buffer[y].substr(x + text.length);// TODO remove ?
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

  init();
  //print(0,h-2,"debug:"+JSON.stringify(ap37.print)+ap37+console.dir(ap37))

// pull requests github.com/apseren/ap37

