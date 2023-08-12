(function script() {
  'use strict';
 
  // config
  const config={
   appversion:'ap37-kyr',
   city:"Paris, France",
   hideApps:["ap37","Internet","Google", "Freebox","Hacker's Keyboard","Play Games","Samsung O","Steam Chat","Steam Link"],
   homeApps:["Citymapper","Clash Royale","Firefox","foobar2000","Inoreader","Keep Notes", "Messages","VLC"],
   favoriteApps:["Phone","Signal","Gmail","Maps","Camera"],
   appDisplayName:{"My Files":"Files","foobar2000":"foobar","Mars: Mars":"Mars","Coding Python" : "Python", "Freebox Connect" : "Freebox","G7 Taxi" : "G7","Keep Notes" : "Keep","Linux Command Library" : "Linux Command","Mandel Browser" : "Mandelbrot","Picturesaurus for Reddit" : "Picturesaurus","Simple Text Editor" : "TextEdit","SNCF Connect" : "SNCF"},
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

  function debugstuff(){//use this to display debug info in footer
    // debug("important■test■message"+" - ");
  }

  function init() {
    background.init();
    header.init();
    apps.init();// do apps before notifications
    notifications.init();
    asciiclock.init();// do clock after apps
    favorites.init();
    footer.init();
    ap37.setOnTouchListener(function (x, y) {
      // TODO have a callback[] list, store positions and callbacks on print, use it on touch, saves handling on touch on each ?
      header.onTouch(x, y);
      apps.onTouch(x, y);
      notifications.onTouch(x, y);
      asciiclock.onTouch(x, y);
      favorites.onTouch(x, y);
      footer.onTouch(x,y);
      scrollers.onTouch(x,y);
    });
    //debug("init done");
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
      print(x0, y, background.randomline(xf-x0), config.bgcolor);
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
      if(y>=header.top && y < header.bottom){
        time.onTouch(x,y);
        meteo.onTouch(x,y);
      }
    },
  };

  var time = {
    left: 3,
    right: 3+13,
    update: function () {
      var d = ap37.getDate();
      var timestr = d.year +
        leftPad(d.month, 2, '0') + leftPad(d.day, 2, '0') + ' ' +
        leftPad(d.hour, 2, '0') + leftPad(d.minute, 2, '0');
      print(time.left, header.top, timestr);
      time.right = time.left + timestr.length;
    },
    init: function () {
      time.update();
      setInterval(time.update, 60000);
    },
    onTouch: function (x, y) {
      if(x < time.right){//y tested by header
        ap37.openApp( apps.getbyname("Clock").id);
      }
    }
  };


  var asciiclock = { 
  nums:[["▄▄▄▄▄",
         "█□□□█",
         "█□□□█",
         "█□□□█",
         "█▄▄▄█"],
        ["□□▄□□",
         "▀▀█□□",
         "□□█□□",
         "□□█□□",
         "▄▄█▄▄"],
        ["▄▄▄▄▄",
         "□□□□█",
         "▄▄▄▄█",
         "█□□□□",
         "█▄▄▄▄"],
        ["▄▄▄▄▄",
         "□□□□█",
         "□□▄▄█",
         "□□□□█",
         "▄▄▄▄█"],
        ["▄□□□▄",
         "█□□□█",
         "█▄▄▄█",
         "□□□□█",
         "□□□□█"],
        ["▄▄▄▄▄",
         "█□□□□",
         "█▄▄▄▄",
         "□□□□█",
         "▄▄▄▄█"],
        ["▄▄▄▄▄",
         "█□□□□",
         "█▄▄▄▄",
         "█□□□█",
         "█▄▄▄█"],
        ["▄▄▄▄▄",
         "□□□□█",
         "□□□□█",
         "□□□□█",
         "□□□□█"],
        ["▄▄▄▄▄",
         "█□□□█",
         "█▄▄▄█",
         "█□□□█",
         "█▄▄▄█"],
        ["▄▄▄▄▄",
         "█□□□█",
         "█▄▄▄█",
         "□□□□█",
         "▄▄▄▄█"],
        ["□",
         "▄",
         "□",
         "▄",
         "□"]],
     top : 10,
     bottom : 10+5,
     left: 18,
     right: 18 + 4*6 +1,
     init: function () {
      asciiclock.update();
      setInterval(asciiclock.update, 60000);
     },
     printnum: function (x,y,n) {
      for( let i=0;i<n.length;i++){
        print(x, y+i, n[i].replaceAll("□"," "));
      }
     },
     update: function () {
       if ( apps.appdisplaymode=='home'){// Only display on home
         var d = ap37.getDate();
         let h1 = asciiclock.nums[ Math.floor ( d.hour / 10 ) ];
         let h2 = asciiclock.nums[ d.hour % 10 ];
         let m1 = asciiclock.nums[ Math.floor ( d.minute / 10 ) ];
         let m2 = asciiclock.nums[ d.minute % 10 ];
         asciiclock.printnum( asciiclock.left,asciiclock.top, h1 );
         asciiclock.printnum( asciiclock.left + 6,asciiclock.top, h2 );
         asciiclock.printnum( asciiclock.left + 12,asciiclock.top, asciiclock.nums[10] );
         asciiclock.printnum( asciiclock.left + 14,asciiclock.top, m1 );
         asciiclock.printnum( asciiclock.left + 20,asciiclock.top, m2 );
       }
     },
     onTouch: function (x, y) {
      if(  apps.appdisplaymode=='home' &&  x >= asciiclock.left && x < asciiclock.right && y >= asciiclock.top && y < asciiclock.bottom ){//y tested by header
        ap37.openApp( apps.getbyname("Clock").id);
      }
     }
  };

  var meteo = {
    meteourl:"",
    init: function () {
      let encodedloc = encodeURIComponent(config.city);
      let geourl ="https://geocode.maps.co/search?q=%22#LOC#%22".replace("#LOC#", encodedloc);
      get(geourl, function (response) {
        let info = JSON.parse(response)[0];
        let latitude = info.lat.substring(0,5);
        let longitude = info.lon.substring(0,5);
        let template="https://api.open-meteo.com/v1/forecast?latitude=#LAT#&longitude=#LONG#&current_weather=true&forecast_days=1";
        meteo.meteourl = template.replace("#LAT#", latitude).replace("#LONG#",longitude);
        meteo.update();
      });
      setInterval(meteo.update, 3600000);//1h
    },
    update: function () {
       get(meteo.meteourl, function (response) {
        let temperature = JSON.parse(response).current_weather.temperature;
        print(w - 10, header.top, temperature.toFixed(0)+"'C");
       });
    },
    onTouch: function (x, y) {
      if(x > w - 10){//y tested by header
        ap37.openLink("https://duckduckgo.com/?q=meteo+"+encodeURIComponent(config.city));
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
    heigth:2,
    top:h-2,
    bottom:h,
    init: function () {
     // scrollers.create(0, w, footer.top, "  ░░▒▒▓▓▒▒░░".repeat(w/8), config.textcolordim);
      print(3, footer.bottom-1, config.appversion);//bottom left
      settings.init();
      print(w-5, footer.bottom-1,  "EOF" );
    },
    onTouch: function (x, y) {
      if (y >= footer.top && y < footer.bottom ) {
        settings.onTouch(x,y);
        debugstuff();// run debug display on footer touch
      }
    }
   };

  var settings = {// TODO  split in 3: version, displaymode, glitches
    x0: 0,
    xf: 0,
    init: function () {
      settings.update();
    },
    update: function () {
      settings.x0 = Math.floor(( (w - apps.appdisplaymode.length) / 2) );
      settings.xf = settings.x0 + apps.appdisplaymode.length ;
      print( settings.x0 , footer.bottom-1, apps.appdisplaymode.toUpperCase());
    },
    onTouch: function (x, y) {
      if (x >= settings.x0 && x < settings.xf ){//y tested by footer
        apps.toggledisplaymode();
        settings.update();
      } else if ( x < config.appversion.length ){
        ap37.openLink("https://github.com/kyrlian/ap37");
      } else if ( x > w-5 ){
        // TODO  toggle glitches
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
          if (app.name in notificationcounter && app.page == apps.currentPage && app.displaymode == apps.appdisplaymode){
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
        var length = Math.min(disp.length, w - 7);// TODO  7 ?
        disp = disp.substring(0, length) + "... +" +
          (notifications.list.length -  notifications.height); //last notification with: name... number of remaining notifs
      }
      let ncolor = (highlight ? config.textcolorclicked : config.textcolorbright);
      if ( disp.length > w){// if notif doesnt fit, create a scroller
        if ( ! notification.scroller ){
          notification.scroller = scrollers.create(0,w,notification.y,  disp +" - ", ncolor);
        } else {
          // already exists, might be clicked and need color update
          notification.scroller.color = ncolor;
        }
      } else {
         print(0, notification.y, disp, ncolor );// highlight is set on touch callback 
      }
      if (highlight) {// if highlight set a timeout to reset to normal
        setTimeout(function () {
       // notifications.printNotification(notification, false);//hide it - its been clicked, will be removed soon
          background.printPattern(0, w, notification.y);
        }, 1000);
      }
    },
    init: function () {
      ap37.setOnNotificationsListener(notifications.update);
      notifications.update();
    },
    onTouch: function (x, y) {
      if (notifications.active) {
        if(y >= notifications.top && y < notifications.bottom ){
          for (var i = 0; i < notifications.list.length; i++) {
            if (notifications.list[i].y === y) {
              notifications.printNotification(notifications.list[i], true);// highlight touched
              ap37.openNotification(notifications.list[i].id);// and open
              return;
            }
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
    margin:0,
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
      favorites.spacing = Math.floor( (w - totalDisplayLen ) / (favorites.list.length - 1));
      favorites.margin = Math.floor((w - totalDisplayLen - (favorites.list.length - 1) * favorites.spacing ) / 2);
      let x = favorites.margin;
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
      print(app.x0, app.y, app.favoriteDisplay, highlight ? config.textcolorclicked : config.textcolorbright);
      if (highlight) {
        setTimeout(function () {
          favorites.printApp(app, false);
        }, 1000);
      }
    },
    onTouch: function (x, y) {
      if(y >= favorites.top && y < favorites.bottom){
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
    appprefixonnotif:'>',//will also be highlighted
    appdisplaymode:'home',//home or list 
    list: [],
    pagefirstappnum: {0 : 0},
    margin:1,
    homeAppWidth: 0,
    homeAppsPerLine: 1, //set this as you want
    lineHeight: 2,
    currentPage: 0,
    isNextPageButtonVisible: false,
    getbyname: function(n){
     for ( var j=0;j<apps.list.length;j++){
          let app = apps.list[j]
          if (app.name == n){
            return app;
          }
        }
     },

    getdisplayname: function(app){
      let n = app.name;
      if(n in config.appDisplayName){ n = config.appDisplayName[n]; };
      app.displayname = n[0].toUpperCase() + n.slice(1).replaceAll(" ","");
    },
    getxshift: function(app){
      if (apps.appdisplaymode=='home'){
        return apps.homeAppWidth;
      } else {
        return (apps.appprefix + app.displayname).length + 1;
      }
    },
    printPage: function (page) {
      let appnum = apps.pagefirstappnum[page];
      let x = apps.margin;
      let y = apps.top;
      background.printPattern(0, w, y);
      while(y < apps.bottom && appnum < apps.list.length){
        let app = apps.list[appnum];
        if (apps.appdisplaymode!='home' || config.homeApps.includes(app.name) ){//if 'home' mode, only get homeApps
          let xshift = apps.getxshift(app);
          if (x + xshift> w){//if out of row
            x=apps.margin;
            y+=apps.lineHeight;//keep a blank line between rows
            if(y >= apps.bottom ){//out of screen
              apps.pagefirstappnum[page+1]=appnum;
              apps.printPagination(true);// and activate pagination
            } else {
              for( let i=0; i< apps.lineHeight ; i++){
                background.printPattern(0, w, y-i);// clean new line
              }
            }
          }
          if(y < apps.bottom){
            app.x0 = x;
            app.y = y;
            app.page = page;
            app.displaymode = apps.appdisplaymode;// to test on touch
            apps.printApp(app, false);
            x += xshift;
          }
        }
        appnum++;
      }
      if(page==0 && y < apps.bottom ){
        apps.printPagination(false);// deactivate printPagination
      }
      for(let j=y+1;j < apps.bottom ;j++){
        background.printPattern(0, w, j);//erase rest of the zone
      }
    },
    printApp: function (app, highlight) {
      let display = apps.appprefix + app.displayname
      if(apps.appdisplaymode == 'home'){//home mode
        display =  display.substring(0, apps.homeAppWidth - 1)
      }
      print(app.x0, app.y, display, highlight ? config.textcolorclicked : config.textcolordim);
      app.xf = app.x0 + display.length;
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
        onoff = apps.isNextPageButtonVisible;// TODO used ?
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
      apps.homeAppWidth = Math.floor((w  - 2 * apps.margin )/ apps.homeAppsPerLine);
      apps.update();
      ap37.setOnAppsListener(apps.init);// reset app list callback
    },
    toggledisplaymode: function(){
        apps.appdisplaymode = (apps.appdisplaymode == 'home') ? 'list' : 'home';//home or list
        apps.currentPage = 0;
        apps.update();
    },
    update: function() {
      apps.printPage(apps.currentPage);
      if ( apps.appdisplaymode == 'home' ){
        asciiclock.update();
      }
    },
    onTouch: function (x, y) {
      if(y >= apps.top && y < apps.bottom){
        for (var i = 0; i<apps.list.length; i++){
          var app = apps.list[i];
          if (app.page == apps.currentPage && app.displaymode == apps.appdisplaymode){
            if (y >= app.y && y < app.y + apps.lineHeight && x >= app.x0 && x <= app.xf) {
              apps.printApp(app, true);
              ap37.openApp(app.id);
              return;
            }
          }
        }
      }
      if (apps.isNextPageButtonVisible && y == apps.bottom && x >= w - 4 ) {
        apps.currentPage++;
        if(!(apps.currentPage in apps.pagefirstappnum)){
            apps.currentPage = 0;
        }
        apps.update();
      }
    }
  };

  // TODO restore display glitches
    
  // TODO restore  markets
   
  // TODO restore  transmissions

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

  function printlines(x, y, text, color){
    let pos=0;
    let py=y;
    while(pos < text.length){    
      print(x, py, text.substring(pos, Math.min(pos+w-x,text.length)), color);
      pos += (w-x);
      py++;
    }
  }
  var scrollers = {
    list : [],
    onTouch: function(x, y){
     // detect if a scroller is touched, if yes start/stop it
     for ( let i=0; i< scrollers.list.length; i++){
       let sc = scrollers.list[i];
       if ( y == sc.y && x >= sc.x && x < sc.x + sc.width){
         sc.toggle();
       }
     } 
    },
   create: function(x0, xf, ay, astr, acolor){
    var scroller = {
      str: astr,
      text: "",
      x: x0,
      width: xf - x0,
      y: ay,
      color: acolor,
      d: 0,
      step: 2,
      interval: null,
      running: true,
      start: function(){
        scroller.settext(scroller.str);
        scroller.interval = setInterval(scroller.update, 1000);
        scroller.running = true;
      },
      stop: function(){
        clearInterval(scroller.interval);
      //  print(scroller.x, scroller.y, scroller.str, scroller.color);
        scroller.running = false;
      },
      toggle: function(){
        if ( scroller.running ) {
          scroller.stop();
        } else {
          scroller.start();
        }
      },
      settext: function(s,sep){
        scroller.text = s.repeat( Math.ceil( scroller.width / s.length ));
        scroller.update();
      },
      update: function(){
        let stext = scroller.text.substring(scroller.d, Math.min( scroller.d + scroller.width, scroller.text.length ) );
        if (stext.length < scroller.width){
          stext += scroller.text.substring(0, scroller.width - stext.length);
        }
        print(scroller.x, scroller.y, stext, scroller.color);
        scroller.d += scroller.step;
        if ( scroller.d > scroller.text.length){
          scroller.d = 0;
        }
      }
    };
    scrollers.list.push(scroller);
    scroller.start();
    return scroller;
  }
 };

  // let a = scrollers.create(0,w,10, "text 122344669988","#ff6666");
  // let b = scrollers.create(0,w,20, "other jjiiikj","#6666ff");
  
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

  let debugScroller = null;//dont init at load - only when needed
  function debug(obj){
    let str = ""+obj;
    if ( typeof(obj) == "object" ){// TODO  test on array of objects . alt: (""+obj).contains ("object")
      str = JSON.stringify(obj);
    }
    if (debugScroller === null){//init at first call
      debugScroller = scrollers.create(0, w, h-2, str, '#ff3333');
    } else {
      debugScroller.settext( str );
    }
    // print(0, h-2, JSON.stringify(str), '#ff3333');
  }

  init();

})();

// pull requests github.com/kyrlian/ap37
// pull requests github.com/apseren/ap37
