(function script() {
    'use strict';
    var w, h;
    
    var notifguesslist={"Bing":"Bing","photos auto-added":"Photos"," years ago":"Photos"," Chest unlocked":"Clash Royale","card request":"Clash Royale", "new messages":"Gmail"};

    function init() {
      ap37.setTextSize(11);
  
      w = ap37.getScreenWidth();
      h = ap37.getScreenHeight();
  
      background.init();
      print(0, 0, 'ap37-2a9f58c3');
      time.init();
      battery.init();
      apps.init();
      notifications.init();//init notifications after app for counter to work properly
      markets.init();
      transmissions.init();
      print(w - 3, h - 1, 'EOF');
  
      ap37.setOnTouchListener(function (x, y) {
        notifications.onTouch(x, y);
        apps.onTouch(x, y);
        transmissions.onTouch(x, y);
        lineGlitch.onTouch(x, y);
        wordGlitch.onTouch(x, y);
      });
    }
  
    // modules
  
    var background = {
      buffer: [],
      bufferColors: [],
      pattern: '',
      printPattern: function (x0, xf, y) {
        print(x0, y,
          background.pattern.substring(y * w + x0, y * w + xf),
          '#333333');
      },
      init: function () {
        background.pattern = rightPad(script, h * w, ' ');
  
        for (var i = 0; i < h; i++) {
          background.buffer.push(background.pattern.substr(i * w, w));
          background.bufferColors.push(arrayFill('#333333', w));
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
        print(w - 13, 0, time);
      },
      init: function () {
        time.update();
        setInterval(time.update, 60000);
      }
    };
  
    var battery = {
      update: function () {
        print(w - 17, 0,
          leftPad(ap37.getBatteryLevel(), 3, ' '));
      },
      init: function () {
        battery.update();
        setInterval(battery.update, 60000);
      }
    };
  
    var notifications = {
      list: [],
      active: false,
      guessapp: function(notification){//guess app based on notification message
        for (var k in notifguesslist){
          if (notification.name.search(k)>=0){
            notification.appname = notifguesslist[k];
          }
        }
      },
      update: function () {
        notifications.active = ap37.notificationsActive();
        if (notifications.active) {
          var nots = ap37.getNotifications();
          notifications.list = nots;
          // count notification per app
          var notificationcounter={};
          for (var i=0;i<nots.length;i++){
            var notification = nots[i];
            notifications.guessapp(notification);
            if (notification.appname){
              if (notification.appname in notificationcounter){
                notificationcounter[notification.appname] = notificationcounter[notification.appname] + 1;
              }else{
                notificationcounter[notification.appname] = 1;
              }
            }
          }
          // update notif counter on apps with notifications
          for ( var j=0;j<apps.list.length;j++){
            var app = apps.list[j];
            if (app.name in notificationcounter){
                print(app.x0, app.y, notificationcounter[app.name] + app.name.substring(0, apps.appWidth - 2), '#ffffff');
            }
          }
          for (var i = 0; i < 3; i++) {
            var y = i + 2;
            background.printPattern(0, w, y);
            if (i < nots.length) {
              nots[i].y = y;
              if (i == 2 && nots.length > 3) {
                nots[i].ellipsis = true;
              }
              notifications.printNotification(nots[i], false);
            }
          }
        } else {
          print(0, 3, 'Activate notifications');
        }
      },
      printNotification: function (notification, highlight) {
        var name = notification.name;
        if (notification.ellipsis) {
          var length = Math.min(name.length, w - 10);
          name = name.substring(0, length) + "... +" +
            (notifications.list.length - 3);
        }
        print(0, notification.y, name, highlight ? '#ff3333' : '#ffffff');
        if (highlight) {
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
              notifications.printNotification(notifications.list[i], true);
              ap37.openNotification(notifications.list[i].id);
              return;
            }
          }
        } else if (y === 3) {
          ap37.requestNotificationsPermission();
        }
      }
    };
  
    var apps = {
      list: [],
      lineHeight: 2,
      topMargin: 6,
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
        print(app.x0, app.y, '_' +
          app.name.substring(0, apps.appWidth - 2),
          highlight ? '#ff3333' : '#999999');
        if (highlight) {
          setTimeout(function () {
            apps.printApp(app, false);
          }, 1000);
        } else {
          print(app.x0 + 1, app.y, app.name.substring(0, 1), '#ffffff');
        }
      },
      init: function () {
        apps.list = ap37.getApps();
        apps.lines = Math.floor(
          (h - apps.topMargin - apps.bottomMargin) / apps.lineHeight);
        apps.appsPerLine = Math.ceil(apps.list.length / apps.lines);
        apps.appWidth = Math.floor(w / apps.appsPerLine);
  
        // check minimum app name length
        if (apps.appWidth < 6) {
          apps.appWidth = 6;
          apps.appsPerLine = Math.floor(w / apps.appWidth);
          apps.isNextPageButtonVisible = true;
          print(w - 4, h - 9, '>>>');
          print(w - 4, h - 8, '>>>');
        } else {
          apps.isNextPageButtonVisible = false;
          background.printPattern(w - 4, w, h - 9);
        }
  
        apps.appsPerPage = apps.lines * apps.appsPerLine;
        apps.currentPage = 0;
  
        apps.printPage(apps.currentPage);
  
        ap37.setOnAppsListener(apps.init);
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
  
    var markets = {
      update: function () {
        get('https://api.cryptowat.ch/markets/prices', function (response) {
          try {
            var result = JSON.parse(response).result,
              marketString =
                'BTC' + Math.floor(result['market:kraken:btcusd']) +
                ' BCH' + Math.floor(result['market:kraken:bchusd']) +
                ' ETH' + Math.floor(result['market:kraken:ethusd']) +
                ' ETC' + Math.floor(result['market:kraken:etcusd']) +
                ' LTC' + Math.floor(result['market:kraken:ltcusd']) +
                ' ZEC' + Math.floor(result['market:kraken:zecusd']);
            background.printPattern(0, w, h - 7);
            print(0, h - 7, marketString);
          } catch (e) {
          }
        });
      },
      init: function () {
        print(0, h - 8, '// Markets');
        markets.update();
        setInterval(markets.update, 60000);
      }
    };
  
    var transmissions = {
      list: [],
      update: function () {
        get('https://hacker-news.firebaseio.com/v0/topstories.json', function (response) {
          try {
            var result = JSON.parse(response),
              line = h - 4,
              t = transmissions;
            t.list = [];
            for (var i = 0; i < result.length && i < 3; i++) {
              get('https://hacker-news.firebaseio.com/v0/item/' + result[i] + '.json', function (itemResponse) {
                var itemResult = JSON.parse(itemResponse);
                var transmission = {
                  title: itemResult.title,
                  url: itemResult.url,
                  y: line
                };
                t.list.push(transmission);
                background.printPattern(0, w, line);
                t.printTransmission(transmission, false);
                line++;
              });
            }
          } catch (e) {
          }
        });
      },
      printTransmission: function (transmission, highlight) {
        print(0, transmission.y, transmission.title,
          highlight ? '#ff3333' : '#ffffff');
        if (highlight) {
          setTimeout(function () {
            transmissions.printTransmission(transmission, false);
          }, 1000);
        }
      },
      init: function () {
        print(0, h - 5, '// Transmissions');
        transmissions.update();
        setInterval(transmissions.update, 3600000);
      },
      onTouch: function (x, y) {
        for (var i = 0; i < transmissions.list.length; i++) {
          if (transmissions.list[i].y === y &&
            x <= transmissions.list[i].title.length) {
            transmissions.printTransmission(transmissions.list[i], true);
            ap37.openLink(transmissions.list[i].url);
            return;
          }
        }
      }
    };
  
    var wordGlitch = {
      tick: 0,
      length: 0,
      x: 0,
      y: 0,
      text: [],
      active: false,
      intervalId: null,
      update: function () {
        var g = wordGlitch;
        if (g.tick === 0) { // generate new glitch
          g.length = 5 + Math.floor(Math.random() * 6);
          g.x = Math.floor(Math.random() * (w - g.length));
          g.y = Math.floor(Math.random() * h);
  
          g.text = [];
          for (var i = 0; i < 5; i++) {
            g.text.push(Math.random().toString(36).substr(2, g.length));
          }
  
          ap37.print(g.x, g.y, g.text[g.tick], '#666666');
          g.tick++;
        } else if (g.tick === 5) { // remove glitch
          ap37.printMultipleColors(g.x, g.y,
            background.buffer[g.y].substr(g.x, g.length),
            background.bufferColors[g.y].slice(g.x, g.x + g.length)
          );
          g.tick = 0;
          if (!wordGlitch.active) {
            clearInterval(wordGlitch.intervalId);
          }
        } else {
          ap37.print(g.x, g.y, g.text[g.tick], '#666666');
          g.tick++;
        }
      },
      onTouch: function (x, y) {
        if (x > w - 6 && y > h - 4) {
          wordGlitch.active = !wordGlitch.active;
          if (wordGlitch.active) {
            wordGlitch.intervalId = setInterval(wordGlitch.update, 100);
          }
        }
      }
    };
  
    var lineGlitch = {
      tick: 0,
      line: 0,
      active: false,
      intervalId: null,
      update: function () {
        var g = lineGlitch;
        if (g.tick === 0) { // shift line
          g.line = 1 + Math.floor(Math.random() * h - 1);
  
          var offset = 1 + Math.floor(Math.random() * 4),
            direction = Math.random() >= 0.5;
  
          if (direction) {
            ap37.printMultipleColors(0, g.line,
              rightPad(
                background.buffer[g.line].substring(offset), w,
                ' '),
              background.bufferColors[g.line].slice(offset));
          } else {
            ap37.printMultipleColors(0, g.line,
              leftPad(background.buffer[g.line]
                .substring(0, w - offset), w, ' '),
              arrayFill('#ffffff', offset)
                .concat(background.bufferColors[g.line]
                  .slice(0, w - offset))
            );
          }
          g.tick++;
        } else { // restore line
          ap37.printMultipleColors(
            0, g.line, background.buffer[g.line],
            background.bufferColors[g.line]);
          g.tick = 0;
          if (!lineGlitch.active) {
            clearInterval(lineGlitch.intervalId);
          }
        }
      },
      onTouch: function (x, y) {
        if (x > w - 6 && y > h - 4) {
          lineGlitch.active = !lineGlitch.active;
          if (lineGlitch.active) {
            lineGlitch.intervalId = setInterval(lineGlitch.update, 200);
          }
        }
      }
    };
  
    //utils
  
    function print(x, y, text, color) {
      color = color || '#ffffff';
      background.buffer[y] = background.buffer[y].substr(0, x) + text +
        background.buffer[y].substr(x + text.length);
      for (var i = x; i < x + text.length; i++) {
        background.bufferColors[y][i] = color;
      }
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
  })();
  
  // pull requests github.com/apseren/ap37
  