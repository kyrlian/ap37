# My fork of [ap37 launcher script](https://github.com/apseren/ap37), to use with [app37 launcher app](https://play.google.com/store/apps/details?id=com.aurhe.ap37)

- Original [script.js](./script.js)
- [custom.js](./custom.js) is my own launcher, the main modifications are:
  - Setup is done in config and layout at the top of the script
  - Switch between home and list modes
  - display notification count - if any
  - New module to display temperature (city is set in config at the begining of the script)
  - New digital clock module, shown in 'home' mode
  - Ability to hide some apps
  - Ability to rename some apps
  - Show favorite apps at the bottom in home mode
  - Markets are hidden by default, activate in layout with layout.hidemarkets. Only visible in 'home' mode
  - Transmissions are hidden by default, activate in layout with layout.hidetransmissions. Only visible in 'home' mode
  - Adapt layout in landscape orientation
  - Long notifications and transmissions can be displayed with scrollers, disabled by default, activate with notifications.scroll and transmissions.scroll
  - Activate word and line glitches one by one by clicking 'EOF'

Older scripts: 
- [notifcount.js](./notifcount.js), not needed anymore, as you can retrieve notification counts with ap37.[getnotificationgroups()](https://github.com/apseren/ap37?tab=readme-ov-file#getnotificationgroups) and get the application name with ap37.[getNotifications()](https://github.com/apseren/ap37#getnotifications). It was a minimal modification of [script.js](./script.js) to display notification count for each application. using a guess list based on the notification message to try to identify the application for each notification. If found I added the counter in place of the '_' in front of the application name.
- [loader.js](./loader.js) loads a file from internet and uses it as a launcher script, good for testing.

[Original ap37 README](https://github.com/apseren/ap37)