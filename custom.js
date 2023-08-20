(function script() {
  'use strict';
 
  // config
  const config={
   appversion:'ap37-kyr',
   city:"Paris, France",
   hideApps:["ap37","Internet","Google", "Freebox","Hacker's Keyboard","Play Games","Samsung O","Steam Chat","Steam Link"],
   homeApps:["Citymapper","Clash Royale","Firefox","foobar2000","Inoreader","Keep Notes", "Messages","VLC"],
   // favoriteApps:["Phone","Signal","Gmail","Maps","Camera"], 
   favoriteApps:{"Phone":"P", "Signal":"s", "Gmail":"@", "Maps":"M", "Camera":"C" }, // todo use unicode symbols
   appDisplayName:{"My Files":"Files","foobar2000":"foobar","Mars: Mars":"Mars","Coding Python" : "Python", "Freebox Connect" : "Freebox", "G7 Taxi" : "G7","Keep Notes" : "Keep","Linux Command Library" : "Linux Command","Mandel Browser" : "Mandelbrot","Picturesaurus for Reddit" : "Picturesaurus","Simple Text Editor" : "TextEdit","SNCF Connect" : "SNCF"},
   notifguesslist:{"Bing":"Bing","photos auto-added":"Photos"," years ago":"Photos"," Chest unlocked":"Clash Royale","card request":"Clash Royale", "new messages":"Gmail"},
   bgcolor:'#333333',
   textcolordim:'#999999',
   textcolorbright:'#ffffff',
   textcolorclicked:'#ff3333',
   textcolorglitch:'#666666',
  };

  // easy debug, called by footer 
  function debugstuff(){//use this to display debug info in footer
   // debug(wordGlitch.active +" " +lineGlitch.active);
  }

  // screen size
  ap37.setTextSize(13);
  var w = ap37.getScreenWidth();
  var h = ap37.getScreenHeight();

  // modules layout 
  var layout={
   orientation : 'portrait',
   mode : 'home',
   init: function(){
    layout.update();
   },
   update: function (){// used below, directly
    // handles resize beetween home and list modes by calling reset
    // handles hidding modules by setting a height of 0
    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();
    function recalc(layinfo){
      if ( layinfo.top == -1 ){ layinfo.top = layinfo.bottom - layinfo.height }
      else if ( layinfo.height == -1 ){ layinfo.height = layinfo.bottom - layinfo.top }
      else if ( layinfo.bottom == -1 ){ layinfo.bottom = layinfo.top + layinfo.height }
      return layinfo;
    }
    layout.orientation = ( w > h ? 'landscape' : 'portrait' );
    layout.header = recalc({ top: 0, height: 2, bottom: -1, page: "all"});
     layout.time = recalc( {left: 3, right: 3+13});
     layout.meteo =  recalc({left: w - 10, right: w-10+4});
     layout.battery =  recalc({left: w - 6, right: w});
    layout.notifications =  recalc({  top: layout.header.bottom, height:layout.mode == 'home' ? 6:0, bottom: -1, page: "all"});//-1 will be calculated
    layout.footer = recalc( { top: -1, height: 2, bottom: h, page: "all"});
    layout.favorites =  recalc({ top: -1, height: layout.mode == 'home' ? 2:0, bottom: layout.footer.top, page: "all"});
    // transmission and market height is 0 if not in layout home
    layout.hidetransmissions = true ;// set to false to show transmission on home page
    layout.hidemarkets= true;// set to false to show markets on home page 
    layout.transmissions =  recalc({ top: -1, height: (layout.mode == 'home' && ! layout.hidetransmissions ? 5 : 0), bottom: layout.favorites.top, page: "home"});
    layout.markets =  recalc({ top: -1, height: (layout.mode == 'home' && ! layout.hidemarkets ? 3 : 0), bottom: layout.transmissions.top, page: "home"});
    // 
    layout.apps =  recalc({ top: layout.notifications.bottom + 3,  height: -1, bottom: layout.markets.top, page: "all"});
    // adjust clock position in landscape orientation
    layout.asciiclock =  recalc({ top: ( layout.orientation == 'portrait' ? layout.notifications.bottom + 5 : layout.header.bottom + 5 ), height: 5, bottom: -1, left:w-26, right: w, page: "home"});
   },
   toggle: function(){// toggle display mode
      layout.mode = (layout.mode == 'home') ? 'list' : 'home';//home or list
      layout.update();
      apps.currentPage = 0;
      background.clear ( 0, w, layout.notifications.top , layout.transmissions.bottom);
      notifications.update();
      apps.update();
      asciiclock.update();
      favorites.update()
      markets.update();
      transmissions.update();
      footer.update();
   }
  };

  // init all modules - will be run after all modules are declared
  function init() {
    layout.init();
    background.init();
    header.init();
    apps.init();// do apps before notifications to init apps list
    notifications.init();
    asciiclock.init();// do clock after apps
    markets.init();
    transmissions.init();
    favorites.init();
    footer.init();
    ap37.setOnTouchListener(function (x, y) {
      header.onTouch(x, y);
      apps.onTouch(x, y);
      notifications.onTouch(x, y);
      asciiclock.onTouch(x, y);
      transmissions.onTouch(x,y);
      favorites.onTouch(x, y);
      footer.onTouch(x,y);
      scrollers.onTouch(x,y);
    });
  }

  // modules
  var background = {
    bgchars:'             -..._/',
    buffer: [],
    bufferColors: [],
    pattern: '',
    randomline: function(nbc){
      let line = "";
      for (let i = 0; i < nbc; i++) {
        line += background.bgchars.charAt(Math.floor(Math.random() * background.bgchars.length));
      }
      return line;
    },
    printPattern: function (x0, xf, y) {//redraw background for a single line
      print(x0, y, background.pattern.substring(y * w + x0, y * w + xf), config.bgcolor);
    },
    updatebuffer: function(x,y,text,color){
      //update background buffer with text to be printed - used to restore glitches
      background.buffer[y] = background.buffer[y].substr(0, x) + text + background.buffer[y].substr(x + text.length);
      for (var i = x; i < x + text.length; i++) {
        background.bufferColors[y][i] = color;
      }
    },
    restorebuffer: function(x0, xf, y){
      ap37.printMultipleColors(x0, y, background.buffer[y].substr(x0, xf), background.bufferColors[y].slice(x0, xf) );
    },
    clear: function (x0,xf ,y0, yf){
      for(let i=y0; i<yf ; i++){
        background.printPattern(x0, xf, i);
      }
    },
    init: function () {
      // background.pattern = rightPad(script, h * w, ' ');//original ap37 version
      background.pattern = background.randomline(h * w);
      for (var i = 0; i < h; i++) {
        background.buffer.push(background.pattern.substr(i * w, w));
        background.bufferColors.push(arrayFill(config.bgcolor, w));
      }
      ap37.printLines(background.buffer, config.bgcolor);
    }
  };
  
  var header = {
    init: function () {
      time.init();
      meteo.init()
      battery.init();
    },
    onTouch: function (x, y) {
      if(y >= layout.header.top && y < layout.header.bottom){
        time.onTouch(x,y);
        meteo.onTouch(x,y);
        battery.onTouch(x,y);
      }
    },
  };

  var time = {
    init: function () {
      time.update();
      setInterval(time.update, 60000);
    },
    update: function () {
      var d = ap37.getDate();
      var timestr = d.year +
        leftPad(d.month, 2, '0') + leftPad(d.day, 2, '0') + ' ' +
        leftPad(d.hour, 2, '0') + leftPad(d.minute, 2, '0');
      print(layout.time.left, layout.header.top, timestr);
      time.right = time.left + timestr.length;
    },
    onTouch: function (x, y) {
      if(x >= layout.time.left && x < layout.time.right){//y tested by header
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
        print(layout.meteo.left, layout.header.top, temperature.toFixed(0)+"'C");
       });
    },
    onTouch: function (x, y) {
      if(x >= layout.meteo.left && x < layout.meteo.right){//y tested by header
        ap37.openLink("https://duckduckgo.com/?q=meteo+"+encodeURIComponent(config.city));
      }
    }
  };

  var battery = {
    init: function () {
      battery.update();
      setInterval(battery.update, 60000);
    },
    update: function () {
      print(layout.battery.left, layout.header.top,leftPad(ap37.getBatteryLevel(), 3, ' ')+'%');
    },
    onTouch : function (x,y){
     if(x >= layout.battery.left && x < layout.battery.right){
      ap37.openApp( apps.getbyname("Settings").id);
     }
    },
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
     init: function () {
      asciiclock.update();
      setInterval(asciiclock.update, 60000);
     },
     printnum: function (x, y, n) {
      for( let k = 0; k<n.length; k++){
        print(x, y + k, n[k].replaceAll("□"," "));
      }
     },
     update: function () {
       if ( layout.mode == 'home'){// Only display on home
         // first erase previous to avoid glitches
         background.clear ( layout.asciiclock.left, layout.asciiclock.right, layout.asciiclock.top , layout.asciiclock.bottom);
         var d = ap37.getDate();
         let h1 = Math.floor ( d.hour / 10 ) 
         let h2 = d.hour % 10 
         let m1 = Math.floor ( d.minute / 10 ) 
         let m2 = d.minute % 10 
         if ( h1 > 0 ){
           asciiclock.printnum( layout.asciiclock.left, layout.asciiclock.top, asciiclock.nums[h1]);
         }
         asciiclock.printnum( layout.asciiclock.left + 6, layout.asciiclock.top,asciiclock.nums[h2]);
         asciiclock.printnum( layout.asciiclock.left + 12, layout.asciiclock.top, asciiclock.nums[10]);
         asciiclock.printnum( layout.asciiclock.left + 14, layout.asciiclock.top,asciiclock.nums[m1]);
         asciiclock.printnum( layout.asciiclock.left + 20, layout.asciiclock.top, asciiclock.nums[m2]);
       }
     },
     onTouch: function (x, y) {
      if(  layout.mode == 'home' &&  x >= layout.asciiclock.left && x < layout.asciiclock.right && y >= layout.asciiclock.top && y < layout.asciiclock.bottom ){
        ap37.openApp( apps.getbyname("Clock").id);
      }
     }
  };

  var footer = {
    x0: 0,
    xf: 0,
    eof: "EOF",
    init: function () {
     // scrollers.create(0, w, footer.top, "  ░░▒▒▓▓▒▒░░".repeat(w/8), config.textcolordim);
      print(3, layout.footer.bottom-1, config.appversion);//bottom left
      footer.x0 = Math.floor(( (w - layout.mode.length) / 2) );
      footer.xf = footer.x0 + layout.mode.length ;
      footer.update();
    },
    update: function () {
      print(w-5, layout.footer.bottom - 1,  footer.eof );//bottom right, changes to show glitch status
      print( footer.x0 , layout.footer.bottom-1, layout.mode.toUpperCase());//center
    },
    onTouch: function (x, y) {
      if (y >= layout.footer.top && y < layout.footer.bottom ) {
        if (x >= footer.x0 && x < footer.xf ){//center home/list button
          layout.toggle();
          // footer.update();// done in toggle
        } else if ( x < config.appversion.length ){ // bottom left, app version
          ap37.openLink("https://github.com/kyrlian/ap37");
        } else if ( x > w-5 ){ // bottom right, "EOF" toggles glitches
          //once to activate word only, twice to activate line only, trice for both, four for off
          if(!wordGlitch.active && !lineGlitch.active){ wordGlitch.activate(); lineGlitch.active = false; footer.eof = 'eOF'}
          else if( wordGlitch.active && !lineGlitch.active){ wordGlitch.active = false; lineGlitch.activate() ; footer.eof = 'EoF' }
          else if(!wordGlitch.active && lineGlitch.active){ wordGlitch.activate(); lineGlitch.activate() ; footer.eof = 'eof' }
          else if( wordGlitch.active &&  lineGlitch.active){ wordGlitch.active = false; lineGlitch.active = false ; footer.eof = 'EOF'}
          footer.update();
        }else{
          debugstuff();// run debug display on footer touch
        }
      }
    }
   };


  var notifications = {
    list: [],
    scroll : false,
    active: false,
    guessapp: function (notification) { 
      for (var k in config.notifguesslist){
        if (notification.name.search(k)>=0){
          notification.appname = config.notifguesslist[k];
          return notification.appname;
        }
      }
    },
    init: function () {
      ap37.setOnNotificationsListener(notifications.update);
      notifications.update();
    },
    update: function () {
     if ( layout.notifications.height >0){
      notifications.active = ap37.notificationsActive();
      if (notifications.active) {
        background.clear(0, w, layout.notifications.top, layout.notifications.bottom);
        // Clean scrollers on old notifs first
        scrollers.clear(notifications.list);
        // get current notifications list 
        notifications.list = ap37.getNotifications();
        // count notification per app
        let notificationcounter={};
        for (let i in notifications.list){
          var notification = notifications.list[i];
          notifications.guessapp(notification);
          if (notification.appname){
            if (notification.appname in notificationcounter){
              notificationcounter[notification.appname] = notificationcounter[notification.appname] +1;
            }else{
              notificationcounter[notification.appname] = 1;
            }
          }
        }
        // update notif counter on apps with notifications
        for ( var j in apps.list ){
          var app = apps.list[j]
          if (app.name in notificationcounter && app.page == apps.currentPage && app.displaymode == layout.mode){
              app.notifcount = notificationcounter[app.name];
              apps.printNotifCount(app);
          }
        }
        for (var i = 0; i < layout.notifications.height; i++) {// display max n notifications
          var y = i + layout.notifications.top;// print notifications from line 2
          if (i < notifications.list.length) {
            notifications.list[i].y = y;
            if (i == layout.notifications.height -1 && notifications.list.length > layout.notifications.height) {
              notifications.list[i].ellipsis = true;// if last displayable notif and has more
            }
            notifications.printNotification(notifications.list[i], false);
          }
        }
      } else {
        print(0, layout.notifications.top, 'Activate notifications');
      }
     }
    },
    printNotification: function (notification, highlight) {
      var name = notification.name;
      var disp = (notification.appname ? notification.appname+":":" ") +name 
      if (notification.ellipsis) {
        var length = Math.min(disp.length, w - "... +".length - 2);
        disp = disp.substring(0, length) + "... +" +
          (notifications.list.length -  layout.notifications.height); //last notification with: name... number of remaining notifs
      }
      let ncolor = (highlight ? config.textcolorclicked : config.textcolorbright);
      if ( disp.length > w && notifications.scroll ){// if notif doesnt fit, create a scroller
        if ( ! notification.scroller ){
          notification.scroller = scrollers.create(0, w, notification.y, disp +" - ", ncolor);
        } else {// scroller already exists, might be clicked and need color update
          notification.scroller.color = ncolor;
        }
      } else {
         print(0, notification.y, disp, ncolor );// highlight is set on touch callback 
      }
      if (highlight) {// if highlight set a timeout to reset to normal
        setTimeout(function () {
          if ( notification.scroller ){
            notification.scroller.clear();
          } else {
            background.printPattern(0, w, notification.y);
          }
        }, 1000);
      }
    },
    onTouch: function (x, y) {
      if (notifications.active) {
        if(y >= layout.notifications.top && y < layout.notifications.bottom ){
          for (var i in notifications.list ) {
            let n = notifications.list[i]
            if (n.y === y) {
              notifications.printNotification(n, true);// highlight touched
              ap37.openNotification(n.id);// and open
              return;
            }
          }
        }
      } else if (y === layout.notifications.top ) {// permission request alert on line  3
        ap37.requestNotificationsPermission();
      }
    }
  };

  var favorites = {
    list:[],
    prefix :"[",
    postfix:"]",
    spacing:0,
    margin:0,
    init: function () {
      // favorites.list = Array(config.favoriteApps.length)//init so we can put at the correct place
      let appslist = ap37.getApps();
      let totalDisplayLen = 0
      for (let favname in config.favoriteApps){
        for (let ka in appslist){
          let app = appslist[ka];
           if (app.name == favname ){
            apps.getdisplayname(app);
            // app.favoriteDisplay = favorites.prefix + app.displayname + favorites.postfix;
            app.favoriteDisplay = favorites.prefix + config.favoriteApps[favname] + favorites.postfix;
            //favorites.list[config.favoriteApps.indexOf(app.name)] = app;
            favorites.list.push(app)
            totalDisplayLen += app.favoriteDisplay.length;
        }
       }
      }
      favorites.spacing = Math.floor( (w - totalDisplayLen ) / (favorites.list.length - 1));
      favorites.margin = Math.floor((w - totalDisplayLen - (favorites.list.length - 1) * favorites.spacing ) / 2);
      favorites.update();
    },
    update: function (){
     if (layout.favorites.height>0){
      let x = favorites.margin;
      for (let k in favorites.list){//compute positions and draw
        let app = favorites.list[k];
        app.x0 = x;
        app.y = layout.favorites.top;
        app.xf = x + app.favoriteDisplay.length;
        x = app.xf + favorites.spacing;
        favorites.printApp(app, false);
      }
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
      if(y >= layout.favorites.top && y < layout.favorites.bottom){
        for (let k in favorites.list){
          let app = favorites.list[k];
          if (x >= app.x0 && x <= app.xf) {
            favorites.printApp(app, true);//highlight
            ap37.openApp(app.id);
            return;
          }
        }
      }
    }
  };

  var apps = {
    appprefix:'>',
    appprefixonnotif:'>',//will also be highlighted
    list: [],
    pagefirstappnum: {0 : 0},
    margin:1,
    homeAppWidth: 0,
    homeAppsPerLine: 1, //set this as you want
    lineHeight: 2,
    currentPage: 0,
    isNextPageButtonVisible: false,
    getbyname: function(name){
      for ( let k in apps.list){
          let app = apps.list[k]
          if (app.name == name){
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
      if (layout.mode == 'home'){
        return apps.homeAppWidth;
      } else {
        return (apps.appprefix + app.displayname).length + 1;
      }
    },
    printPage: function (page) {
      let appnum = apps.pagefirstappnum[page];
      let x = apps.margin;
      let y = layout.apps.top;
      background.clear( 0,w, layout.apps.top, layout.apps.bottom);
      while(y < layout.apps.bottom -1 && appnum < apps.list.length){
        let app = apps.list[appnum];
        if (layout.mode!='home' || config.homeApps.includes(app.name) ){//if 'home' mode, only get homeApps
          let xshift = apps.getxshift(app);
          if (x + xshift > w){//if out of row
            x = apps.margin;
            y += apps.lineHeight;//keep a blank line between rows
            if(y >= layout.apps.bottom -1){//out of screen, keep 1 for >>>
              apps.pagefirstappnum[page+1] = appnum;
              apps.printPagination(true);// and activate pagination
            }
          }
          if(y < layout.apps.bottom - 1){
            app.x0 = x;
            app.y = y;
            app.page = page;
            app.displaymode = layout.mode;// to test on touch
            apps.printApp(app, false);
            x += xshift;
          }
        }
        appnum++;
      }
      if(page==0 && y < layout.apps.bottom - 1){
        apps.printPagination(false);// deactivate pagination
      } else {
        apps.printPagination(true);
      }
    },
    printApp: function (app, highlight) {
      let display = apps.appprefix + app.displayname
      if(layout.mode == 'home'){//home mode
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
    printPagination: function(onoff) {
      if(onoff){
        apps.isNextPageButtonVisible = true;// activate pagination
        background.printPattern(0,w, layout.apps.bottom-1 );
        print(w - 4, layout.apps.bottom -1, '>>>');
      } else {
        apps.isNextPageButtonVisible = false;
        background.printPattern(w - 4, w, layout.apps.bottom-1);// erase pagination >>>
      }
    },
    init: function () {
      apps.list=[];
      let appslist = ap37.getApps();
      for (let k in appslist){
       let app = appslist[k];
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
    update: function() {
      if ( layout.mode == 'list' || layout.orientation == 'portrait'){
        apps.printPage(apps.currentPage);
      }
    },
    onTouch: function (x, y) {
      if(y >= layout.apps.top && y < layout.apps.bottom){
        for (let k in apps.list){
          let app = apps.list[k];
          if (app.page == apps.currentPage && app.displaymode == layout.mode){
            if (y >= app.y && y < app.y + apps.lineHeight && x >= app.x0 && x <= app.xf) {
              apps.printApp(app, true);
              ap37.openApp(app.id);
              return;
            }
          }
        }
      }
      if (apps.isNextPageButtonVisible && y == layout.apps.bottom -1 && x >= w - ">>>".length) {
        apps.currentPage++;
        if(!(apps.currentPage in apps.pagefirstappnum)){
            apps.currentPage = 0;
        }
        apps.update();
      }
    }
  };

  var markets = {
    init: function () {
      markets.update();
      setInterval(markets.update, 60000);
    },
    update: function () {
      if ( layout.markets.height >0){// Only display on home
        background.clear ( 0, w, layout.markets.top , layout.markets.bottom);
        print(0, layout.markets.top, '// Markets', config.textcolordim);
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
            background.printPattern(0, w, layout.markets.top+1);
            print(0, layout.markets.top+1, marketString, config.textcolordim);
          } catch (e) {
          }
        });
      }
    },
  };

  var transmissions = {
    list: [],
    scroll: false,
    update: function () {
      if ( layout.transmissions.height>0){// layout.mode == 'home'){ // Only display on home
        background.clear( 0,w, layout.transmissions.top, layout.transmissions.bottom);
        print(0, layout.transmissions.top, '// Transmissions', config.textcolordim);
        get('https://hacker-news.firebaseio.com/v0/topstories.json', function (response) {
        try {
          var result = JSON.parse(response);
          let line = layout.transmissions.top + 1;
          // clear current scrollers first
          scrollers.clear(transmissions.list);
          // now reset list
          transmissions.list = [];
          for (var i = 0; i < result.length && i < layout.transmissions.height-2; i++) {
            get('https://hacker-news.firebaseio.com/v0/item/' + result[i] + '.json', function (itemResponse) {
              var itemResult = JSON.parse(itemResponse);
              var transmission = {
                title: itemResult.title,
                url: itemResult.url,
                y: line
              };
              transmissions.list.push(transmission);
              background.printPattern(0, w, line);
              transmissions.printTransmission(transmission, false);
              line++;
            });
          }
        } catch (e) {
        }
      });// end of get callback
     } else { // not in home mode, stop scrollers
        scrollers.clear(transmissions.list); 
     }
    },
    printTransmission: function (transmission, highlight) {
      let tcolor = highlight ? config.textcolorclicked : config.textcolordim;
      if ( transmission.title.length > w && transmissions.scroll ){// if notif doesnt fit, create a scroller
        if ( ! transmission.scroller ){
          transmission.scroller = scrollers.create(0, w, transmission.y, transmission.title +" - " , tcolor);
        } else {// scroller already exists, might be clicked and need color update
          transmission.scroller.color = tcolor;
        }
      } else {
        print(0, transmission.y, transmission.title, tcolor ); 
      }
      if (highlight) {
        setTimeout(function () {
          if ( transmission.scroller ){
            transmission.scroller.clear();
          } else {
            transmissions.printTransmission(transmission, false);
          }
        }, 1000);
      }
    },
    init: function () {
      transmissions.update();
      setInterval(transmissions.update, 3600000);
    },
    onTouch: function (x, y) {
      if ( layout.transmissions.height > 0 ){//layout.mode == 'home'){// Only display on home
        for (var k in transmissions.list) {
          let transmission = transmissions.list[k];
          if (transmission.y === y &&
            x <= transmission.title.length) {
            transmissions.printTransmission(transmission, true);
            ap37.openLink(transmission.url);
            return;
          }
        }
      }
    },
  };

  var wordGlitch = {
    tick: 0,
    length: 0,
    x: 0,
    y: 0,
    text: [],
    active: false,
    intervalId: null,
    activate: function() {
      if (!wordGlitch.active) {
        wordGlitch.intervalId = setInterval(wordGlitch.update, 200);
        wordGlitch.active = true;
      }
    },
    update: function () {
      var g = wordGlitch;
      if (g.tick === 0) { // generate new glitch
        g.length = 5 + Math.floor(Math.random() * 6);
        g.x = Math.floor(Math.random() * (w - g.length));
        g.y = Math.floor(Math.random() * h);
        g.text = [];
        for (var i = 0; i < 5; i++) {
          //g.text.push(Math.random().toString(36).substr(2, g.length)); //original word glitch
          g.text.push(background.randomline(g.length))
        }
        ap37.print(g.x, g.y, g.text[g.tick], config.textcolorglitch);
        g.tick++;
      } else if (g.tick === 5) { // remove glitch
        background.restorebuffer(g.x, g.x + g.length, g.y);
        g.tick = 0;
        if (!wordGlitch.active) {
          clearInterval(wordGlitch.intervalId);
        }
      } else {
        ap37.print(g.x, g.y, g.text[g.tick], config.textcolorglitch);
        g.tick++;
      }
    },
  };

  var lineGlitch = {
    tick: 0,
    line: 0,
    active: false,
    intervalId: null,
    activate: function() {
      if (!lineGlitch.active) {// if not already active
        lineGlitch.intervalId = setInterval(lineGlitch.update, 500);
        lineGlitch.active = true;
      }
    },
    update: function () {
      var g = lineGlitch;
      if (g.tick === 0) { // shift line
        g.line = Math.floor(Math.random() * h);
        var offset = Math.ceil(Math.random() * 4);
        let direction = Math.random() >= 0.5;
        if (direction) {
          ap37.printMultipleColors(0, g.line,
            rightPad(background.buffer[g.line].substring(offset), w,' '),
            background.bufferColors[g.line].slice(offset));
        } else {
          ap37.printMultipleColors(0, g.line,
            leftPad(background.buffer[g.line].substring(0, w - offset), w, ' '),
            arrayFill(config.textcolorbright, offset).concat(background.bufferColors[g.line].slice(0, w - offset))
          );
        }
        g.tick++;
      } else { // restore line
        background.restorebuffer(0, w, g.line);
        g.tick = 0;
        if (!lineGlitch.active) {
          clearInterval(lineGlitch.intervalId);
        }
      }
    },
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
    background.updatebuffer(x, y, text, rcolor);
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
   clear: function(objlist){
     for (var k in objlist) {
          let obj = objlist[k];
          if ( obj.scroller ){
            obj.scroller.clear();
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
      delay: 500,
      start: function(){
        scroller.settext(scroller.str);
        scroller.interval = setInterval(scroller.update, scroller.delay);
        scroller.running = true;
      },
      stop: function(){
        clearInterval(scroller.interval);
        scroller.running = false;
      },
      clear: function(){
        scroller.stop();
        background.printPattern(scroller.x, scroller.x + scroller.width, scroller.y);
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
    if ( str.indexOf("object" )>=0){
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
