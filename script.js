/**
 *  Author : Alxb & FreeQyMat
 *  Scenario pour: Wombat - Dungeon Master
 *  Version: 0.6.0 (19/11/2022)
 */
let wombat = {
  enableClan: true,  // false pour désactiver
  enableCandy: true,  // false pour désactiver
  enableRun: true,  // false pour désactiver
  delay: {
    defaultLoopTime: 15 * 1000,
    afterAction: 1.5 * 1000,
    afterPageChange: 7 * 1000,
    afterCandyClaim: 3 * 1000,
  },
  paths: {
    claim: "#app > div > div.base-layout__main.base-layout__main--with-reward > div.reward-claimable > div.claim-reward > button > span",
    timer: "#app .in-dungeon__timer-section-timer",
    claimRewards: "#app > div.base-layout.base-layout--green-bg > div.header > div.header__cell.header__cell--column-small-screen > div > div > button > div > div",
    grabRewards: "#app > div.base-layout.base-layout--green-bg > div.header > div.header__cell.header__cell--column-small-screen > div > div > div.popup.reward-treasure-popup > div > button",
    errorRewards: "#app > div.popup.error-view > div > div > button",
    candyClaim: "#app > div.base-layout.base-layout--green-bg > div.base-layout__main > div.popup > div > div > button.btn.confirm-send-wombat-with-claimable-candy-modal__btn.confirm-send-wombat-with-claimable-candy-modal__btn--accept.btn--primary.btn--primary-without-arrow.btn--with-icon",
    candyCancel: "#app > div.base-layout.base-layout--green-bg > div.base-layout__main > div.popup > div > div > button.btn.btn--outlined.confirm-send-wombat-with-claimable-candy-modal__btn.confirm-send-wombat-with-claimable-candy-modal__btn--reject",
    unexpectedError: "#app > div.popup.error-view > div > div > button",
    claimLevelUp: "#app > div.base-layout > div.base-layout__main.base-layout__main--with-reward > div.reward-claimable > div.claim-level.claim-level--active > button",
    backButton:"#app .page-title__back-btn",
    pages: {
      //clan: "#app > div.base-layout.base-layout--black-bg > div.base-layout__main > div > div > div:nth-child(1) > a",
      clan: "a[href='/clan/home']", 
      clan2: "#app > div.base-layout.base-layout--black-bg > div.base-layout__main > div > div > div > a:nth-child(3)",
      clanNeedHelp: "#app > div.base-layout-clans > div.base-layout-clans__main > div > div > div.clan-home__help > div.clan-home__help-list",
      clanMember: "#app > div.base-layout-clans > div.base-layout-clans__footer > div > a:nth-child(2)",
      clanRequestHelp: "#app > div.base-layout-clans > div.base-layout-clans__main > div.base-layout-clans__main-container> div.clan-members > div.clan-members__list",
      //dungeonFromClan: "#app > div.base-layout-clans > div.base-layout-clans__header > div > a",
      dungeonFromClan: "#app > div.base-layout-clans > div.base-layout-clans__header > div > button",
      shop: "#app > div > div.base-layout__main > div > a:nth-child(3)",
      dungeonFromShop: "#app > div > div.base-layout__main > div > div.page-title.shop-view__title > a",
    },
  },
  xpaths: {
    launch: "/html/body/div[1]/div/div[2]/section/div/div[3]/div/button[1]",
  },
  getCurrentPageName: () => {
    return window.location.pathname.substr(1) || '';
  },
  switchingPageForRefresh: async () => {
    autoFarmEngine.getElement(wombat.paths.pages.shop).click();
    await autoFarmEngine.sleep(wombat.delay.afterAction);
    autoFarmEngine.getElement(wombat.paths.pages.dungeonFromShop).click();
    await autoFarmEngine.sleep(wombat.delay.afterAction);
  },
  clanLoop: async () => {
    if (autoFarmEngine.getElement(wombat.paths.pages.clan) || autoFarmEngine.getElement(wombat.paths.pages.clan2)) {
      console.log("trying to get clan page "+autoFarmEngine.getElement(wombat.paths.pages.clan))
      var clanPage = autoFarmEngine.getElement(wombat.paths.pages.clan)
        ? autoFarmEngine.getElement(wombat.paths.pages.clan)
        : autoFarmEngine.getElement(wombat.paths.pages.clan2);
      // Helping
      clanPage.click();
      await autoFarmEngine.sleep(wombat.delay.afterAction);
      var helpList = autoFarmEngine.getElement(wombat.paths.pages.clanNeedHelp); //.children;
      if (helpList && helpList.children) {
        for (let i = 0; i < helpList.children.length; i++) {
          let member = helpList.children[i];
          if (member.querySelector('button')) {
            member.querySelector('button').click();
            await autoFarmEngine.sleep(wombat.delay.afterAction);
          }
        }
      }
      // Request Help
      autoFarmEngine.getElement(wombat.paths.pages.clanMember).click();
      await autoFarmEngine.sleep(wombat.delay.afterPageChange);
      var requestList = autoFarmEngine.getElement(wombat.paths.pages.clanRequestHelp).children;
      for (let i = 0; i < requestList.length; i++) {
        let member = requestList[i];
        if (member.querySelector('button')) {
          member.querySelector('button').click();
          await autoFarmEngine.sleep(wombat.delay.afterAction);
        }
      }
      // Back to exploring dungeon
      autoFarmEngine.getElement(wombat.paths.pages.dungeonFromClan).click();
      await autoFarmEngine.sleep(wombat.delay.afterAction);
      autoFarmEngine.getElement(wombat.paths.pages.dungeonFromClan).click();
      await autoFarmEngine.sleep(wombat.delay.afterAction);
    }
  },
  mainLoop: async () => {
    const result = {
      relaunch: false,
      remainingTime: wombat.delay.defaultLoopTime
    };

    try {
      console.log('--dbg-- Starting Main Loop !');

      // Check if unexpected error popup
      if (autoFarmEngine.getElement(wombat.paths.unexpectedError)) {
        console.log('--dbg-- UNEXPECTED ERROR FOUND... trying to resolve...');
        autoFarmEngine.getElement(wombat.paths.unexpectedError).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
        await wombat.switchingPageForRefresh();
      }

      // Check if currentPage !== dungeon
      if (wombat.getCurrentPageName() !== 'dungeon') {
        console.log('--dbg-- WRONG PAGE FOR STARTING CHECK...');
        autoFarmEngine.getElement(wombat.paths.backButton).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
      }

      // Check if need claim level up
      if (autoFarmEngine.getElement(wombat.paths.claimLevelUp)) {
        console.log('--dbg-- CLAIM LEVEL UP FOUND... trying to claim...');
        autoFarmEngine.getElement(wombat.paths.claimLevelUp).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
      }

      // Check if daily rewards error
      if (autoFarmEngine.getElement(wombat.paths.errorRewards)) {
        console.log('--dbg-- ERROR DAILY REWARDS POPUP FOUND :(');
        autoFarmEngine.getElement(wombat.paths.errorRewards).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
      }
      if (autoFarmEngine.getElement(wombat.paths.claimRewards) && autoFarmEngine.getElement(wombat.paths.claimRewards).innerHTML === 'TAP HERE TO REVEAL YOUR REWARD') {
        console.log('--dbg-- DAILY REWARDS FOUND :(');
        autoFarmEngine.getElement(wombat.paths.claimRewards).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
        autoFarmEngine.getElement(wombat.paths.grabRewards).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
      }

      // Check if need claim level up
      if (autoFarmEngine.getElement(wombat.paths.claimLevelUp)) {
        console.log('--dbg-- CLAIM LEVEL UP FOUND... trying to claim...');
        autoFarmEngine.getElement(wombat.paths.claimLevelUp).click();
        await autoFarmEngine.sleep(wombat.delay.afterAction);
      }

      // Check if remaining time ? (yes, wait next loop),
      console.log(autoFarmEngine.getElement(wombat.paths.timer))
      if (autoFarmEngine.getElement(wombat.paths.timer)) {
        console.log('--dbg-- TIMER PATH FOUND...');

        // Clan helping management
        if (wombat.enableClan) await wombat.clanLoop();

      } else {
        // Check if claim is available
        if (autoFarmEngine.getElement(wombat.paths.claim)) {
          console.log('--dbg-- CLAIM PATH FOUND... trying to claim...');
          autoFarmEngine.getElement(wombat.paths.claim).click();
          await autoFarmEngine.sleep(wombat.delay.afterAction);
        }

        // check if need to launch exploration
        if (autoFarmEngine.getElementByXpath(wombat.xpaths.launch)) {
          console.log('--dbg-- LAUNCH PATH FOUND... trying to launch...');
          autoFarmEngine.getElementByXpath(wombat.xpaths.launch).click();
          await autoFarmEngine.sleep(wombat.delay.afterAction);
        }

        // Check for candy claim
        if (autoFarmEngine.getElement(wombat.paths.candyClaim)) {
          if (wombat.enableCandy){
            console.log('--dbg-- CANDY CLAIM POPUP FOUND...');
            autoFarmEngine.getElement(wombat.paths.candyClaim).click();
  
          }else{
            console.log('--dbg-- CANDY CANCEL POPUP FOUND...');
            autoFarmEngine.getElement(wombat.paths.candyCancel).click();
            
          }  
          await autoFarmEngine.sleep(wombat.delay.afterPageChange);

        }   
      }
      console.log('--dbg-- EOF Main Loop !');
    } catch (err) {
      console.log('### UNEXPECTED ERROR: ', err);
    }
    return result;
  },
};

const autoFarmEngine = {
  _version: '0.6',
  _loopStart: false,
  defaultLoopTime: 10 * 1000,
  _loopSleep: async (timeMs = autoFarmEngine.defaultLoopTime) => {
    autoFarmEngine.monitor._loopTimer = timeMs;
    await new Promise((res) => setTimeout(res, timeMs));
  },
  getElement: (path) => {
    return document.querySelector(path);
  },
  getElementByXpath: (path) => {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  },
  calculateRemainingTime: (timeSring) => {
    const timeSplit = timeSring.split(':');
    return (parseInt(timeSplit[0], 10) * 60 * 60) + (parseInt(timeSplit[1], 10) * 60) + parseInt(timeSplit[2], 10);
  },
  sleep: async (timeMs = 2000) => {
    await new Promise((res) => setTimeout(res, timeMs));
  },
  start: async (scenario = wombat) => {
    if (!autoFarmEngine.monitor._isInitialized) {
      autoFarmEngine.monitor.initialize();
    }

    if (!autoFarmEngine._loopStart) {
      console.log('### Starting Main loop !!');
      autoFarmEngine._loopStart = true;

      while (autoFarmEngine._loopStart) {
        autoFarmEngine.monitor.setRunning();
        let loopResult = await scenario.mainLoop();
        autoFarmEngine.monitor.setWaiting();
        console.log('# LoopResult', loopResult);

        if (autoFarmEngine._loopStart) {
          if (loopResult.relaunch) continue;
          await autoFarmEngine._loopSleep(loopResult.remainingTime);
        }
      }
      console.log('### Main loop stoped !!');
      autoFarmEngine.monitor.setLoaded();
    } else {
      console.log('### Main loop already started !!');
    }
  },
  stop: () => {
    if (autoFarmEngine._loopStart) {
      console.log('### Waiting for stoping Main loop !!');
      autoFarmEngine._loopStart = false;
    } else {
      console.log('### Main Loop already stoped !!');
    }
    autoFarmEngine.monitor.setLoaded();
  },
  /**
   *  TODO: Ajouter un btn Start/Stop/Pause
   */
  monitor: {
    _isInitialized: false,
    _state: 'loaded',
    _loopTimer: 0,
    css: `
      #app{
        margin-top: 50px;
      }
      .base-layout,.base-layout-clans{
        min-height: calc(100vh - 50px);
        height: calc(100vh - 50px);
      }
      #autoFarmMonitor {
        position: fixed;
        top: 0px;
        left: calc(10% + 420px);
        width: 190px;
        height: 42px;
        z-index: 100;
        border: 3px solid white;
        border-radius: 10px;
        text-align: center;
        padding-top: 5px;
        font-size: 20px;
        box-shadow: 9px -9px 40px 4px rgba(0,0,0,0.67);
        -webkit-box-shadow: 9px -9px 40px 4px rgba(0,0,0,0.67);
        -moz-box-shadow: 9px -9px 40px 4px rgba(0,0,0,0.67);
      }
      #clanMonitor,#CandyMonitor,#start-stopBtn{
        position: fixed;
        width: 125px;
        height: 42px;
        z-index: 100;
        border: 3px solid white;
        border-radius: 10px 10px 10px 10px;
        text-align: center;
        padding-top: 5px;
        font-size: 20px;
        box-shadow: 9px -9px 40px 4px rgba(0,0,0,0.67);
        -webkit-box-shadow: 9px -9px 40px 4px rgba(0,0,0,0.67);
        -moz-box-shadow: 9px -9px 40px 4px rgba(0,0,0,0.67);
        background: #fff;
        left: 50%;
        top: 0px;
      }
      #start-stopBtn{
        left: 10%;
      }
      #clanMonitor{
        left: calc(10% + 280px);
      }
      #CandyMonitor{
        left: calc(10% + 140px);
      }
      .monitor-loaded {
        background-color: #85C1E9;
      }
      .monitor-running ,.button-off{
        background-color: #F1948A!important;
      }
      .monitor-waiting,.button-on {
        background-color: #82E0AA!important;
      }
      

    `,
    initialize: () => {
      if (!autoFarmEngine.monitor._isInitialized) {
        const addCSS = document.createElement('style');
        addCSS.innerHTML = autoFarmEngine.monitor.css;
        document.head.appendChild(addCSS);

        /* CountDown */
        const monitor = document.createElement('div');
        monitor.setAttribute('id', 'autoFarmMonitor');

        const monitorUl = document.createElement('ul');
        const monitorAction = document.createElement('li');
        const monitorInfo = document.createElement('li');

        monitor.classList.add('monitor-loaded');
        monitor.innerHTML = 'Not Started';
        document.body.appendChild(monitor);

        /* Button */
          /* Clan On/OFF */
        const clanButtonContaint = document.createElement('div');
        
        clanButtonContaint.setAttribute('id', 'clanMonitor');

        clanButtonContaint.classList.add('button-style');
        clanButtonContaint.classList.add('button-on');

        clanButtonContaint.innerHTML = 'Clan ON';

        document.body.appendChild(clanButtonContaint);

        clanButtonContaint.addEventListener('click', event => {
          wombat.enableClan = autoFarmEngine.monitor.checkBtnON(clanButtonContaint,wombat.enableClan,"Clan")
        });
          /* Candy On/OFF */

        const candyButtonContaint = document.createElement('div');
        
        candyButtonContaint.setAttribute('id', 'CandyMonitor');

        candyButtonContaint.classList.add('button-style');
        candyButtonContaint.classList.add('button-on');

        candyButtonContaint.innerHTML = 'Candy ON';

        document.body.appendChild(candyButtonContaint);

        candyButtonContaint.addEventListener('click', event => {
          wombat.enableCandy = autoFarmEngine.monitor.checkBtnON(candyButtonContaint,wombat.enableCandy,"Candy")

        });
          /* run On/OFF */

          const runButtonContaint = document.createElement('div');
                  
          runButtonContaint.setAttribute('id', 'start-stopBtn');

          runButtonContaint.classList.add('button-style');
          runButtonContaint.classList.add('button-on');
          candyButtonContaint.innerHTML = 'Start ON';

          document.body.appendChild(runButtonContaint);

          runButtonContaint.addEventListener('click', event => {
            if(wombat.enableRun){
              console.log("on stop tous ")
              autoFarmEngine.stop();  
            }else{
              console.log("on relance ")
              autoFarmEngine.start();  
            }

            wombat.enableRun = autoFarmEngine.monitor.checkBtnON(runButtonContaint,wombat.enableRun,"Start")            
          });




        setInterval(() => {
          if (autoFarmEngine.monitor._loopTimer > 0) {
            autoFarmEngine.monitor._loopTimer = (autoFarmEngine.monitor._loopTimer < 1000) ? 0 : (autoFarmEngine.monitor._loopTimer - 1000);
            if (autoFarmEngine.monitor._state === 'waiting') {
              const monitor = document.getElementById('autoFarmMonitor');
              const hour = Math.floor(autoFarmEngine.monitor._loopTimer / (60 * 60 * 1000));
              const min = Math.floor((autoFarmEngine.monitor._loopTimer % (60 * 60 * 1000)) / (60 * 1000));
              const sec = Math.floor(autoFarmEngine.monitor._loopTimer / 1000) - ((hour * 60 * 60) + (min * 60));
              monitor.innerHTML = `Wait: ${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            }
          }
        }, 1000);

        autoFarmEngine.monitor._isInitialized = true;
        wombat.enableCandy = autoFarmEngine.monitor.checkBtnON(candyButtonContaint,wombat.enableCandy,"Candy",true)
        wombat.enableClan = autoFarmEngine.monitor.checkBtnON(clanButtonContaint,wombat.enableClan,"Clan",true)
        wombat.enableClan = autoFarmEngine.monitor.checkBtnON(runButtonContaint,wombat.enableRun,"Start",true)

      }
    },
    checkBtnON: (obj,varBool,objName,justCheck = false)=>{
      if(varBool == true && !justCheck || varBool == false && justCheck ){
        varBool =  false;
        obj.innerHTML = objName+' OFF';
        obj.classList.add('button-off');
        obj.classList.remove('button-on');
      }
      else{
        varBool = true
        obj.innerHTML = objName+' ON';
        obj.classList.remove('button-off');
        obj.classList.add('button-on');
      }
      console.log(objName+" check ->"+varBool)
      return varBool;
    },
    setLoaded: (msg = 'Stopped') => {
      autoFarmEngine.monitor._state = 'loaded';
      const monitor = document.getElementById('autoFarmMonitor');
      monitor.classList.remove('monitor-running');
      monitor.classList.remove('monitor-waiting');
      monitor.classList.add('monitor-loaded');
      monitor.innerHTML = msg;
    },
    setRunning: (msg = 'Check in progress') => {
      autoFarmEngine.monitor._state = 'running';
      const monitor = document.getElementById('autoFarmMonitor');
      monitor.classList.remove('monitor-loaded');
      monitor.classList.remove('monitor-waiting');
      monitor.classList.add('monitor-running');
      monitor.innerHTML = msg;
    },
    setWaiting: (msg = 'Wait...') => {
      autoFarmEngine.monitor._state = 'waiting';
      const monitor = document.getElementById('autoFarmMonitor');
      monitor.classList.remove('monitor-running');
      monitor.classList.remove('monitor-loaded');
      monitor.classList.add('monitor-waiting');
      monitor.innerHTML = msg;
    }
  }, // eo monitor
};

autoFarmEngine.start();