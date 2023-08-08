(function script() {
  'use strict';
 
  // config
  const config={
   appversion:'ap37-kyr',
   hideApps:["ap37","Internet","Google", "Freebox","Hacker's Keyboard","Play Games","Steam Chat","Steam Link"],
   favoriteApps:["Phone","Signal","Gmail","Maps","Camera"],
   appDisplayName:{"foobar2000":"foobar","Mars: Mars":"Mars","Coding Python" : "Python",   "Freebox Connect" : "Freebox","G7 Taxi" : "G7","Keep Notes" : "Keep","Linux Command Library" : "Linux Command","Mandel Browser" : "Mandelbrot","Picturesaurus for Reddit" : "Picturesaurus","Simple Text Editor" : "TextEdit","SNCF Connect" : "SNCF"},
   notifguesslist:{"Bing":"Bing","photos auto-added":"Photos"," years ago":"Photos"," Chest unlocked":"Clash Royale","card request":"Clash Royale", "new messages":"Gmail"},
   bgcolor:'#333333',
   textcolordim:'#999999',
   textcolorbright:'#ffffff',
   textcolorclicked:'#ff3333',
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
    bgchars:'-._ /',
    randomline: function(nbc){
      let line = "";
      for (let i = 0; i < nbc; i++) {
        line += background.bgchars.charAt(Math.floor(Math.random() * background.bgchars.length));
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
      meteo.init()
      battery.init();
    },
    onTouch: function (x, y) {
      if(y==header.top){
        time.onTouch(x,y);
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
      if(x < 10){//y tested by header
        for ( var j=0;j<apps.list.length;j++){
          if (apps.list[j].name == "Clock"){
            ap37.openApp(app.id);
          }
        }
      }
    }
  };

  var meteo = {
    city="Paris, France",
    meteourl:"",
    init: function () {
      let encodedloc = encodeURIComponent(meteo.city);
      let geourl ="https://geocode.maps.co/search?q=%22#LOC#22".replace("#LOC#", encodedloc);
      get(geourl, function (response) {
        let info = JSON.parse(response)[0];
        let latitude = info.lat.substring(0,5);
        let longitude = info.long.substring(0,5);
        let template="https://api.open-meteo.com/v1/forecast?latitude=#LAT#&longitude=#LONG#&current_weather=true&forecast_days=1";
        meteo.meteourl = template.replace("#LAT#", latitude).replace("#LONG#",longitude);
        meteo.update();
      });
      setInterval(meteo.update, 3600000);//1h
    },
    update: function () {
       get(meteo.meteourl, function (response) {
        let temperature = JSON.parse(response).current_weather.temperature.split(".")[0];
        print(w - 10, header.top, temperature+"°C");
       });
    },
    onTouch: function (x, y) {
      if(x > w - 10){//y tested by header
        ap37.openLink("https://duckduckgo.com/?q=meteo+"+encodeURIComponent(meteo.city));
      }
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
      print(w - 5, footer.top, apps.appdisplaymode.toUpperCase());
    },
    onTouch: function (x, y) {
      if (x >= w-5 && y >= footer.top){
        apps.appdisplaymode = (apps.appdisplaymode=='grid') ? 'text' : 'grid';//grid or text
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
      print(0, notification.y, disp, highlight ? config.textcolorclicked : config.textcolorbright);// highlight is set on touch callback 
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
    list:[],
    prefix :"[",
    postfix:"]",
    spacing:0,
    init: function () {
      favorites.list = Array(config.favoriteApps.length)//init so we can put at the correct place
      let appslist = ap37.getApps();
      let totalDisplayLen = 0
      for (let i = 0; i < appslist.length; i++){
       let app = appslist[i];
       if (config.favoriteApps.includes(app.name)){//init list
        apps.getdisplayname(app)
        app.favoriteDisplay = favorites.prefix + app.displayname + favorites.postfix;
        favorites.list[config.favoriteApps.indexOf(app.name)] = app;
        totalDisplayLen += app.favoriteDisplay.length;
       }
      }
      favorites.spacing = math.Floor( (w - totalDisplayLen ) / (favorites.list.length+1));
      let x = favorites.spacing;
      for (let i = 0; i< favorites.list.length; i++){//compute positions and draw
        let app = favorites.list[i];
        app.x0 = x;
        app.y = favorites.top;
        app.xf = x + app.favoriteDisplay.length;
        x = app.xf + favorites.spacing;
        favorites.printApp(app, false);
      }
    },
    printApp: function (app, highlight) {
      print(app.x0, app.y, app.favoriteDisplay, highlight ? config.textcolorclicked : config.textcolordim);
      if (highlight) {
        setTimeout(function () {
          favorites.printApp(app, false);
        }, 1000);
      }
    },
    onTouch: function (x, y) {
      if(y == favorites.top){
        for (let i = 0; i< favorites.list.length; i++){
          let app = favorites.list[i];
          if (x >= app.x0 && x <= app.xf) {
            favorites.printApp(app, true);//highligth
            ap37.openApp(app.id);
            return;
          }
        }
      }
    }
  };

  var apps = {
    heigth: favorites.top - 1 - notifications.bottom,
    top: notifications.bottom,
    bottom: favorites.top - 1, //keep 1 because we use bottom line for pagination
    appprefix:'>',
    gridAppNameMinWidth:8,//for grid display
    appprefixonnotif:'>',//will also be highlighted
    appdisplaymode:'grid',//grid or text 
    list: [],
    pagefirstappnum: {0 : 0},
    gridlineHeight: 2,
    gridlines: 0,
    gridAppWidth: 6,
    gridAppsPerLine: 0,
    gridAppsPerPage: 0,
    currentPage: 0,
    isNextPageButtonVisible: false,
    getdisplayname: function(app){
      let n = app.name;
      if(n in config.appDisplayName){ n = config.appDisplayName[n]; };
      app.displayname = n[0].toUpperCase() + n.slice(1).replaceAll(" ","");
    },
    printPageGrid: function (page) {
      var appPos = page * apps.gridAppsPerPage;
      for (var x = 0; x + apps.gridAppWidth <= w; x += apps.gridAppWidth) {
        for (var y = apps.top; y < apps.bottom; y += apps.gridlineHeight) {
          background.printPattern(x, x + apps.gridAppWidth, y);
          if (appPos < apps.list.length) {
            var app = apps.list[appPos];
            app.y = y;
            app.x0 = x;
            app.xf = x + apps.gridAppWidth;
            app.page = page;
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
        let xf = x + (apps.appprefix + app.displayname).length;
        if (xf > w){//if out of row
          x=0;
          y+=2;//keep a blank line between rows
          if(y>= apps.bottom ){//out of screen
            apps.pagefirstappnum[page+1]=appnum;
            apps.printPagination(true);// and activate pagination
          }else{
            background.printPattern(0, w, y);
          }
        }
        if(y < apps.bottom){
          app.x0 = x;
          app.y = y;
          app.xf = x + (apps.appprefix + app.displayname).length;
          app.page = page;
          apps.printApp(app, false);
          x = app.xf + 1;//space between apps
          appnum++;
        }
      }
      if(page==0 && y < apps.bottom ){
        apps.pagination(false);// deactivate printPagination
      }
      for(let j=y;j< apps.bottom ;j++){
        background.printPattern(0, w, j);//erase rest of the zone
      }
    },
    printApp: function (app, highlight) {
      let display = apps.appprefix + app.displayname
      if(apps.appdisplaymode == 'grid'){//grid mode
        display =  display.substring(0, apps.gridAppWidth - 1)
      }
      print(app.x0, app.y, display, highlight ? config.textcolorclicked : config.textcolordim);
      apps.printNotifCount(app);
      if (highlight) {
        setTimeout(function () {
          apps.printApp(app, false);
        }, 1000);
      } else {
        print(app.x0+apps.appprefix.length, app.y, app.displayname[0], config.textcolorbright);//highlight first letter after prefix
      }
    },
    printNotifCount: function(app) {
      if (app.notifcount > 0){
         print(app.x0, app.y, apps.appprefixonnotif + app.displayname, config.textcolorbright);//highlight prefix
      }
    },
    printPagination: function (onoff) {
      if(onoff == ""){//if call with neither true or false, just print
        onoff = apps.isNextPageButtonVisible;
      }
      if(onoff){
        apps.isNextPageButtonVisible = true;// activate pagination
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
       if (!config.hideApps.includes(app.name)){
        app.notifcount=0;
        apps.getdisplayname(app)
        apps.list.push(app);
       }
      }
      apps.currentPage = 0;
      //grid setup
      apps.gridlines = Math.floor( apps.heigth / apps.gridlineHeight);
      apps.gridAppsPerLine = Math.ceil(apps.list.length / apps.gridlines);
      apps.gridAppWidth = Math.floor(w / apps.gridAppsPerLine);
      if (apps.gridAppWidth < apps.gridAppNameMinWidth) {//if available app width is too small
        apps.gridAppWidth = apps.gridAppNameMinWidth;// force
        apps.gridAppsPerLine = Math.floor(w / apps.gridAppWidth);
        apps.printPagination(true);// and activate pagination
      } else {
        apps.printPagination(false);
      }
      apps.gridAppsPerPage = apps.gridlines * apps.gridAppsPerLine
      apps.update();
      ap37.setOnAppsListener(apps.init);// reset app list callback
    },
    update: function() {
      if(apps.appdisplaymode=='grid'){//grid
        apps.printPageGrid(apps.currentPage);
      } else {//text mode
        apps.printPageText(apps.currentPage);
      }
    },
    onTouch: function (x, y) {
      for (var i = 0; i<apps.list.length; i++){
        var app = apps.list[i];
        if (app.page == apps.currentPage){
          if (y >= app.y && y <= app.y + 1 && x >= app.x0 && x <= app.xf) {
            apps.printApp(app, true);
            ap37.openApp(app.id);
            return;
          }
        }
      }
      if (apps.isNextPageButtonVisible && y == apps.bottom && x >= w - 4 ) {
        apps.currentPage++;
        if((apps.appdisplaymode=='grid' && apps.currentPage * apps.gridAppsPerPage >= apps.list.length) ||
         (apps.appdisplaymode=='text' && !(apps.currentPage in apps.pagefirstappnum))){
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
