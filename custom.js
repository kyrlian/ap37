  'use strict';

  // config
  //TODO tuple config
  let config={}
  let appversion='ap37-kyr';
  let hideapps=["Google", "Freebox","Steam Chat","Steam Link"];
  let appnameminwidth=8;
  let notifstart=2;
  let appstart =6;
  let displayablenotifs =appstart-notifstart-1;//TODO: use it below
  let bgcolor='';//TODO: use it below
  let textcolor='';//TODO: use it below
  let highlightcolor='';//TODO: use it below
  //
  var w, h
  function init() {
    ap37.setTextSize(13);

    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();

    background.init();
    print(3, 0, appversion);//TODO move to bottom left
    time.init();
    battery.init();
    notifications.init();
    apps.init();
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
      const chars='-._ /';//random chars for background
      for (let i = 0; i < w*h; i++) {
        background.pattern += chars.charAt(Math.floor(Math.random() * chars.length));
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
      print(w - time.length - 3, 0, time);//TODO move to left
    },
    init: function () {
      time.update();
      setInterval(time.update, 60000);
    }
  };

  var battery = {
    update: function () {
      print(w - 21, 0,
        leftPad(ap37.getBatteryLevel(), 3, ' ')+'%');//TODO move right after moving time
    },
    init: function () {
      battery.update();
      setInterval(battery.update, 60000);
    }
  };

  var notifications = {//TODO Debug duplicate notif
    list: [],
    active: false,
    update: function () {
      notifications.active = ap37.notificationsActive();
      if (notifications.active) {
        var nots = ap37.getNotifications();
        notifications.list = nots;
        for (var i = 0; i < 3; i++) {// display max 3 notifications
          var y = i + notifstart;// print notifications from line 2
          background.printPattern(0, w, y);//erase line first
          if (i < nots.length) {
            nots[i].y = y;
            if (i ==  2 && nots.length > 3) {
              nots[i].ellipsis = true;// if last displayable notif and has more
            }
            notifications.printNotification(nots[i], false);
          }
        }
      } else {
        print(0,notifstart , 'Activate notifications');
      }
    },
    printNotification: function (notification, highlight) {
      var name = notification.name;
      if (notification.ellipsis) {
        var length = Math.min(name.length, w - 10);
        name = name.substring(0, length) + "... +" +
          (notifications.list.length - 3);//override last notification with: name... number of remaining notifs
      }
      print(0, notification.y, name, highlight ? '#ff3333' : '#ffffff');// highlight is set on touch callback 
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
    lineHeight: 2,
    topMargin: appstart,
    bottomMargin: 8,
    lines: 0,
    appWidth: 6,
    appsPerLine: 0,
    appsPerPage: 0,
    currentPage: 0,
    isNextPageButtonVisible: false,
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
      print(app.x0, app.y, 
        app.name.substring(0, apps.appWidth - 1),
        highlight ? '#ff3333' : '#999999');
      if (highlight) {
        setTimeout(function () {
          apps.printApp(app, false);
        }, 1000);
      } else {
        print(app.x0, app.y, app.name.substring(0, 1), '#ffffff');
      }
    },
    init: function () {
      appslist = ap37.getApps();
      for (var i = 0; i<appslist.length; i++){
       var app=appslist[i];
       if (!hideapps.includes(app.name)){
        apps.list.push(app);
       }
      }
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
        print(w - 4, h - 8, '>>>');
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

  //utils

  function print(x, y, text, color) {
    color = color || '#ffffff';
    background.buffer[y] = background.buffer[y].substr(0, x) + text +
      background.buffer[y].substr(x + text.length);
    ap37.print(x, y, text, color);
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


// pull requests github.com/kyrlian/ap37
