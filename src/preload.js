const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('mainAPI', {
  scrapePeopleFromTeams: () => { 
    ipcRenderer.send('scrape-people-from-teams')
  },

  onScrapingWindowClosed: (callback) => {
    ipcRenderer.on('scraping-window-closed', callback);
  },

  onPeopleScraped: (callback) => {
    ipcRenderer.on('people-scraped', callback);
  },

  scrapePeople: () => {
    console.log('[scrapePeople] triggered !!!!!!!!!!');

    const result = Array.from(document.querySelectorAll('.recipient-group-list-item'), item => {
      const name = item.querySelector('.cle-title').innerText;
      const profileImg = item.querySelector('.profile-img-parent > img');
      const email = profileImg ? profileImg.dataset.upn : null;
      const statusSpan = item.querySelector('.ts-skype-status');
      const status = statusSpan ? statusSpan.title : null;
      return { name, email, status }
    }).filter(person => person.status);

    if (!result.length) {
      return
    }

    if (result.some(person => person.status === '状態不明')) {
      console.log('状態不明が含まれるのでスキップします');
      console.log(result);
      return
    }

    ipcRenderer.send('people-scraped', result);
  },

  processLogin: () => {
    console.log('[processLogin] triggered !!!!!!!!!!');
    
    const preferences = ipcRenderer.sendSync('getPreferences');
    if (!preferences.setting.email || !preferences.setting.password) {
      return
    }
    
    setTimeout(() => {
      const submitButton = document.querySelector('input[type="submit"]') || document.querySelector('#submitButton');

      // メールアドレスの場合
      const email = document.querySelector('input[type="email"]');
      if (email && !email.value) {
        email.value = preferences.setting.email;
        email.blur();
        submitButton.click();
        return
      }

      // アカウント選択の場合
      const aadTile = document.querySelector('#aadTile'); // 職場または学校アカウント
      if (aadTile) {
        aadTile.click();
        return
      }

      // パスワードの場合
      const password = document.querySelector('input[type="password"]');
      if (password) {
        const errorMessage = document.querySelector('#passwordError');
        if (errorMessage) {
          return
        }
        password.value = preferences.setting.password;
        password.blur();
        submitButton.click();
        return
      }

      // 状態維持オプションの場合
      const rememberForm = document.querySelector('form[action="/kmsi"]');
      if (rememberForm) {
        submitButton.click();
        return
      }
    }, preferences.setting.input_delay);
  },

  getLayout() {
    const preferences = ipcRenderer.sendSync('getPreferences');
    return JSON.parse(preferences.data.layout);
  },

  saveLayout(layout) {
    const preferences = ipcRenderer.sendSync('getPreferences');
    preferences.data.layout = JSON.stringify(layout);
    ipcRenderer.sendSync('setPreferences', preferences);
  },

  getCustomLabels() {
    const preferences = ipcRenderer.sendSync('getPreferences');
    return JSON.parse(preferences.data.custom_labels);
  },

  saveCustomLabels(custom_labels) {
    const preferences = ipcRenderer.sendSync('getPreferences');
    preferences.data.custom_labels = JSON.stringify(custom_labels);
    ipcRenderer.sendSync('setPreferences', preferences);
  },

  getStatusColorMap() {
    const preferences = ipcRenderer.sendSync('getPreferences');
    return new Map(JSON.parse(preferences.data.status_colors));
  },

  updateStatusColor(status, color) {
    const preferences = ipcRenderer.sendSync('getPreferences');

    const map = new Map(JSON.parse(preferences.data.status_colors));
    map.set(status, color);

    preferences.data.status_colors = JSON.stringify(Array.from(map));
    ipcRenderer.sendSync('setPreferences', preferences);
  },

  hasLoginInfo() {
    const preferences = ipcRenderer.sendSync('getPreferences');
    return preferences.setting.email && preferences.setting.password;
  },
  
  saveLoginInfo(loginInfo) {
    const preferences = ipcRenderer.sendSync('getPreferences');
    preferences.setting.email = loginInfo.email
    preferences.setting.password = loginInfo.password
    ipcRenderer.sendSync('setPreferences', preferences);
  },

  openChat(email) {
    ipcRenderer.send('open-chat', email)  
  }
})