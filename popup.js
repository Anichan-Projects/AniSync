// Language translations
const translations = {
  vi: {
    // Header
    title: "AniSync",
    subtitle: "Đồng bộ lịch sử xem anime với AniList",
    
    // Loading
    loading: "Đang tải...",
    
    // Status card
    connectionStatus: "Trạng thái kết nối",
    checking: "Đang kiểm tra...",
    connected: "Đã kết nối",
    
    // Current anime card
    currentAnime: "Anime hiện tại",
    noAnimeDetected: "Không có anime nào được phát hiện",
    episode: "Episode:",
    anilistId: "AniList ID:",
    status: "Trạng thái:",
    notConnected: "Chưa kết nối",
    syncNow: "Đồng bộ ngay",
    
    // Actions
    connectToAnilist: "Kết nối với AniList",
    
    // Settings
    settings: "Cài đặt",
    autoSync: "Tự động đồng bộ",
    notifications: "Thông báo",
    publicActivity: "Tạo activity công khai",
    language: "Ngôn ngữ",
    openSettings: "Cài đặt",
    
    // Footer
    footer: "AniSync v1.0.0 • Made with ❤️",
    
    // Tooltips and titles
    disconnect: "Ngắt kết nối tài khoản",
    refresh: "Làm mới",
    publicActivityTooltip: "Hiển thị hoạt động xem anime trên profile AniList của bạn",
    
    // Button texts
    logoutText: "Logout",
    refreshText: "Refresh",
    
    // Sync statuses
    ready: "Sẵn sàng",
    syncing: "Đang đồng bộ",
    error: "Lỗi",
    notFound: "Không tìm thấy",
    
    // Manual sync button states
    syncingInProgress: "Đang đồng bộ...",
    synced: "Đã đồng bộ!",
    syncError: "Lỗi đồng bộ",
    connectionError: "Lỗi kết nối",
    
    // Connection messages
    connecting: "Đang kết nối...",
    connectionSuccess: "Kết nối thành công với AniList!",
    connectionFailed: "Lỗi kết nối: ",
    
    // Error messages
    errorLoadingAnime: "Lỗi khi lấy thông tin anime",
    connectionErrorHelp: "Không thể kết nối với extension. Vui lòng:\n1. Reload extension trong chrome://extensions/\n2. Refresh trang web hiện tại\n3. Đảm bảo bạn đang ở trang AnimeVsub"
  },
  en: {
    // Header
    title: "AniSync",
    subtitle: "Sync anime watching history with AniList",
    
    // Loading
    loading: "Loading...",
    
    // Status card
    connectionStatus: "Connection Status",
    checking: "Checking...",
    connected: "Connected",
    
    // Current anime card
    currentAnime: "Current Anime",
    noAnimeDetected: "No anime detected",
    episode: "Episode:",
    anilistId: "AniList ID:",
    status: "Status:",
    notConnected: "Not connected",
    syncNow: "Sync now",
    
    // Actions
    connectToAnilist: "Connect to AniList",
    
    // Settings
    settings: "Settings",
    autoSync: "Auto sync",
    notifications: "Notifications",
    publicActivity: "Create public activity",
    language: "Language",
    openSettings: "Setup",
    
    // Footer
    footer: "AniSync v1.0.0 • Made with ❤️",
    
    // Tooltips and titles
    disconnect: "Disconnect account",
    refresh: "Refresh",
    publicActivityTooltip: "Show anime watching activity on your AniList profile",
    
    // Button texts
    logoutText: "Logout",
    refreshText: "Refresh",
    
    // Sync statuses
    ready: "Ready",
    syncing: "Syncing",
    error: "Error",
    notFound: "Not found",
    
    // Manual sync button states
    syncingInProgress: "Syncing...",
    synced: "Synced!",
    syncError: "Sync error",
    connectionError: "Connection error",
    
    // Connection messages
    connecting: "Connecting...",
    connectionSuccess: "Successfully connected to AniList!",
    connectionFailed: "Connection error: ",
    
    // Error messages
    errorLoadingAnime: "Error loading anime information",
    connectionErrorHelp: "Cannot connect to extension. Please:\n1. Reload extension in chrome://extensions/\n2. Refresh current webpage\n3. Make sure you're on AnimeVsub website"
  }
};

// Popup script để quản lý UI
class PopupManager {
  constructor() {
    this.isConnected = false;
    this.currentUser = null;
    this.settings = {
      autoSync: true,
      notifications: true,
      publicActivity: false,  // Mặc định không tạo activity công khai
      language: 'vi'  // Mặc định tiếng Việt
    };
    
    this.init();
  }

  async init() {
    // Kiểm tra setup status trước
    const setupValid = await this.checkSetupStatus();
    if (!setupValid) {
      return; // Exit early if setup is invalid
    }

    // Load settings từ storage
    await this.loadSettings();
    
    // Update language first
    this.updateLanguage();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Kiểm tra trạng thái kết nối
    await this.checkConnectionStatus();
    
    // Cập nhật thông tin anime hiện tại
    await this.updateCurrentAnimeInfo();
    
    // Ẩn loading và hiển thị content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
  }

  // Load settings từ Chrome storage
  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      if (result.settings) {
        this.settings = { ...this.settings, ...result.settings };
      }
      
      // Apply settings to UI
      document.getElementById('auto-sync-toggle').checked = this.settings.autoSync;
      document.getElementById('notifications-toggle').checked = this.settings.notifications;
      document.getElementById('public-activity-toggle').checked = this.settings.publicActivity;
      document.getElementById('language-select').value = this.settings.language;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Save settings to Chrome storage
  async saveSettings() {
    try {
      await chrome.storage.local.set({ settings: this.settings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Connect button
    document.getElementById('connect-btn').addEventListener('click', () => {
      this.connectToAniList();
    });

    // Disconnect buttons (both large and small)
    const disconnectBtnSmall = document.getElementById('disconnect-btn-small');
    if (disconnectBtnSmall) {
      disconnectBtnSmall.addEventListener('click', () => {
        this.disconnectFromAniList();
      });
    }

    // Refresh buttons (both large and small)
    const refreshBtnSmall = document.getElementById('refresh-btn-small');
    if (refreshBtnSmall) {
      refreshBtnSmall.addEventListener('click', () => {
        this.refreshStatus();
      });
    }

    // Settings toggles
    document.getElementById('auto-sync-toggle').addEventListener('change', (e) => {
      this.settings.autoSync = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('notifications-toggle').addEventListener('change', (e) => {
      this.settings.notifications = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('public-activity-toggle').addEventListener('change', (e) => {
      this.settings.publicActivity = e.target.checked;
      this.saveSettings();
    });

    // Language selector
    document.getElementById('language-select').addEventListener('change', (e) => {
      this.settings.language = e.target.value;
      this.saveSettings();
      this.updateLanguage();
      
      // Notify content scripts about language change
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'languageChanged',
            language: this.settings.language
          }, (response) => {
            // Ignore errors - content script might not be loaded on this tab
            if (chrome.runtime.lastError) {
              console.log('Content script not available on this tab:', chrome.runtime.lastError.message);
            }
          });
        }
      });
    });

    // Manual sync button
    document.getElementById('manual-sync-btn').addEventListener('click', () => {
      this.manualSync();
    });

    // Open settings button
    document.getElementById('open-settings-btn').addEventListener('click', () => {
      this.openSettings();
    });
  }

  // Kiểm tra setup status
  async checkSetupStatus() {
    try {
      const response = await this.sendMessage({ action: 'checkSetup' });
      
      if (response && response.success) {
        if (!response.setupCompleted || !response.hasCredentials) {
          console.log('Setup not completed or missing credentials, redirecting to setup');
          chrome.tabs.create({
            url: chrome.runtime.getURL('setup.html')
          });
          window.close();
          return false;
        }
        return true;
      } else {
        // If can't check setup, assume setup needed
        chrome.tabs.create({
          url: chrome.runtime.getURL('setup.html')
        });
        window.close();
        return false;
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      chrome.tabs.create({
        url: chrome.runtime.getURL('setup.html')
      });
      window.close();
      return false;
    }
  }

  // Gửi message đến background script
  sendMessage(message) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Kiểm tra trạng thái kết nối
  async checkConnectionStatus() {
    try {
      const tokenResponse = await this.sendMessage({ action: 'checkToken' });
      
      if (tokenResponse && tokenResponse.success && tokenResponse.hasToken) {
        // Có token, kiểm tra user info
        const userResponse = await this.sendMessage({ action: 'getCurrentUser' });
        
        if (userResponse && userResponse.success) {
          this.isConnected = true;
          this.currentUser = userResponse.user;
          this.updateConnectionUI(true);
        } else {
          this.isConnected = false;
          this.updateConnectionUI(false);
          
          // Nếu token bị revoke, hiển thị thông báo
          if (userResponse && userResponse.needsAuth) {
            const t = translations[this.settings.language];
            this.showError(t.language === 'en' ? 'Token has been revoked on AniList. Please reconnect.' : 'Token đã bị thu hồi trên AniList. Vui lòng kết nối lại.');
          }
        }
      } else {
        this.isConnected = false;
        this.updateConnectionUI(false);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      const t = translations[this.settings.language];
      if (error.message.includes('Could not establish connection')) {
        // This is normal when extension is not loaded on current tab or background script issues
        console.log('Background script not available, setting disconnected state');
        this.updateConnectionUI(false);
        
        // Show helpful message after a short delay to let UI load
        setTimeout(() => {
          this.showError(t.connectionErrorHelp);
        }, 1000);
      } else {
        this.showError((t.language === 'en' ? 'Connection check error: ' : 'Lỗi kiểm tra kết nối: ') + error.message);
        this.updateConnectionUI(false);
      }
    }
  }

  // Cập nhật UI kết nối
  updateConnectionUI(connected) {
    const t = translations[this.settings.language];
    const statusDot = document.getElementById('anilist-status');
    const statusText = document.getElementById('anilist-status-text');
    const connectBtn = document.getElementById('connect-btn');
    const userInfoDiv = document.getElementById('user-info');
    const actionsCard = document.getElementById('actions-card');

    if (connected && this.currentUser) {
      statusDot.className = 'status-dot connected';
      statusText.textContent = t.connected;
      
      // Ẩn card actions khi đã kết nối
      actionsCard.style.display = 'none';
      
      userInfoDiv.style.display = 'block';
      document.getElementById('user-name').textContent = this.currentUser.name;
      document.getElementById('user-avatar').src = this.currentUser.avatar?.medium || '';
    } else {
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = t.notConnected;
      
      // Hiển thị nút connect khi chưa kết nối
      actionsCard.style.display = 'block';
      connectBtn.style.display = 'block';
      
      userInfoDiv.style.display = 'none';
    }
  }

  // Kết nối với AniList
  async connectToAniList() {
    const t = translations[this.settings.language];
    const connectBtn = document.getElementById('connect-btn');
    const originalText = connectBtn.innerHTML;
    
    try {
      // Hiển thị loading
      connectBtn.innerHTML = `<div class="spinner"></div>${t.connecting}`;
      connectBtn.disabled = true;
      
      const response = await this.sendMessage({ action: 'authenticate' });
      
      if (response && response.success) {
        // Lấy thông tin user sau khi authenticate thành công
        const userResponse = await this.sendMessage({ action: 'getCurrentUser' });
        
        if (userResponse.success) {
          this.isConnected = true;
          this.currentUser = userResponse.user;
          this.updateConnectionUI(true);
          this.showSuccess(t.connectionSuccess);
        }
      } else {
        // Kiểm tra nếu cần setup
        if (response.needsSetup) {
          // Redirect to setup page
          chrome.tabs.create({
            url: chrome.runtime.getURL('setup.html')
          });
          window.close();
          return;
        }
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      this.showError(t.connectionFailed + error.message);
    } finally {
      connectBtn.innerHTML = originalText;
      connectBtn.disabled = false;
    }
  }

  // Ngắt kết nối với AniList
  async disconnectFromAniList() {
    try {
      console.log('Attempting to logout...');
      
      // Gọi background script để logout hoàn toàn
      const response = await this.sendMessage({ action: 'logout' });
      
      console.log('Logout response:', response);
      
      if (response && response.success) {
        this.isConnected = false;
        this.currentUser = null;
        this.updateConnectionUI(false);
        
        const t = translations[this.settings.language];
        const message = this.settings.language === 'vi' 
          ? 'Đã ngắt kết nối tài khoản! Client ID & Secret được giữ lại.'
          : 'Account disconnected! Client ID & Secret are preserved.';
        this.showSuccess(message);
      } else {
        const errorMessage = response?.error || 'Unknown logout error';
        throw new Error(`Logout failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      const errorMessage = this.settings.language === 'vi' 
        ? 'Lỗi ngắt kết nối: ' + error.message
        : 'Disconnect error: ' + error.message;
      this.showError(errorMessage);
    }
  }

  // Refresh status
  async refreshStatus() {
    const refreshBtnSmall = document.getElementById('refresh-btn-small');
    const originalText = refreshBtnSmall ? refreshBtnSmall.innerHTML : '';
    
    try {
      if (refreshBtnSmall) {
        refreshBtnSmall.innerHTML = '⟳';
        refreshBtnSmall.disabled = true;
      }
      
      await this.checkConnectionStatus();
      await this.updateCurrentAnimeInfo();
      
      this.showSuccess('Đã làm mới trạng thái');
    } catch (error) {
      console.error('Refresh error:', error);
      this.showError('Lỗi làm mới: ' + error.message);
    } finally {
      if (refreshBtnSmall) {
        refreshBtnSmall.innerHTML = originalText;
        refreshBtnSmall.disabled = false;
      }
    }
  }

  // Cập nhật thông tin anime hiện tại
  async updateCurrentAnimeInfo() {
    try {
      const response = await this.sendMessage({ action: 'getCurrentAnimeInfo' });
      
      // Check if response is valid
      if (!response) {
        throw new Error('No response from background script');
      }
      
      const animeTitle = document.getElementById('current-anime');
      const animeDetails = document.getElementById('anime-details');
      const currentEpisode = document.getElementById('current-episode');
      const anilistId = document.getElementById('anilist-id');
      const syncStatus = document.getElementById('sync-status');
      const animeCover = document.getElementById('anime-cover');
      const animeCoverPlaceholder = document.getElementById('anime-cover-placeholder');
      
      if (response.success && response.animeInfo) {
        const info = response.animeInfo;
        
        if (info.currentAnime) {
          // Hiển thị title từ AniList nếu có, nếu không thì dùng title từ website
          const displayTitle = info.anilistTitle || info.currentAnime;
          animeTitle.textContent = displayTitle;
          animeDetails.style.display = 'block';
          
          // Hiển thị episode với format "X / Y" nếu có total episodes
          if (info.currentEpisode && info.totalEpisodes) {
            currentEpisode.textContent = `${info.currentEpisode} / ${info.totalEpisodes}`;
          } else if (info.currentEpisode) {
            currentEpisode.textContent = info.currentEpisode;
          } else {
            currentEpisode.textContent = '-';
          }
          
          anilistId.textContent = info.anilistAnimeId || 'Chưa tìm thấy';
          
          // Hiển thị cover image
          if (info.coverImage) {
            animeCover.src = info.coverImage;
            animeCover.style.display = 'block';
            animeCoverPlaceholder.style.display = 'none';
          } else {
            animeCover.style.display = 'none';
            animeCoverPlaceholder.style.display = 'flex';
          }
          
          // Cập nhật sync status
          syncStatus.className = `value sync-status ${info.syncStatus}`;
          const t = translations[this.settings.language];
          const statusText = {
            'disconnected': t.notConnected,
            'ready': t.ready,
            'syncing': t.syncing,
            'error': t.error,
            'not-found': t.notFound
          };
          syncStatus.textContent = statusText[info.syncStatus] || info.syncStatus;
          
          // Hiển thị nút sync nếu có anime và đã kết nối AniList
          const animeActions = document.getElementById('anime-actions');
          const syncBtn = document.getElementById('manual-sync-btn');
          
          if (info.anilistAnimeId && info.syncStatus !== 'disconnected') {
            animeActions.style.display = 'block';
            syncBtn.disabled = false;
          } else {
            animeActions.style.display = 'none';
          }
          
        } else {
          const t = translations[this.settings.language];
          animeTitle.textContent = t.noAnimeDetected;
          animeDetails.style.display = 'none';
          animeCover.style.display = 'none';
          animeCoverPlaceholder.style.display = 'flex';
          document.getElementById('anime-actions').style.display = 'none';
        }
      } else {
        const t = translations[this.settings.language];
        animeTitle.textContent = t.noAnimeDetected;
        animeDetails.style.display = 'none';
        animeCover.style.display = 'none';
        animeCoverPlaceholder.style.display = 'flex';
        document.getElementById('anime-actions').style.display = 'none';
      }
    } catch (error) {
      console.error('Error updating anime info:', error);
      const t = translations[this.settings.language];
      
      if (error.message.includes('Could not establish connection') || error.message.includes('No response')) {
        // Background script not available - show default message
        document.getElementById('current-anime').textContent = t.noAnimeDetected;
      } else {
        document.getElementById('current-anime').textContent = t.errorLoadingAnime;
      }
      
      document.getElementById('anime-cover').style.display = 'none';
      document.getElementById('anime-cover-placeholder').style.display = 'flex';
      document.getElementById('anime-details').style.display = 'none';
      document.getElementById('anime-actions').style.display = 'none';
    }
  }

  // Đồng bộ thủ công
  async manualSync() {
    const t = translations[this.settings.language];
    const syncBtn = document.getElementById('manual-sync-btn');
    const syncText = syncBtn.querySelector('.sync-text');
    
    try {
      // Disable button và set trạng thái syncing
      syncBtn.disabled = true;
      syncBtn.className = 'btn btn-sync syncing';
      syncText.textContent = t.syncingInProgress;
      
      // Gọi manual sync action
      const response = await this.sendMessage({ action: 'manualSync' });
      
      if (response && response.success) {
        // Success state
        syncBtn.className = 'btn btn-sync success';
        syncText.textContent = t.synced;
        
        // Reset sau 2 giây
        setTimeout(() => {
          syncBtn.className = 'btn btn-sync';
          syncText.textContent = t.syncNow;
          syncBtn.disabled = false;
        }, 2000);
        
        // Cập nhật thông tin anime
        await this.updateCurrentAnimeInfo();
        
      } else {
        // Error state
        syncBtn.className = 'btn btn-sync error';
        syncText.textContent = t.syncError;
        
        // Reset sau 3 giây
        setTimeout(() => {
          syncBtn.className = 'btn btn-sync';
          syncText.textContent = t.syncNow;
          syncBtn.disabled = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error during manual sync:', error);
      
      // Error state
      syncBtn.className = 'btn btn-sync error';
      syncText.textContent = t.connectionError;
      
      // Reset sau 3 giây
      setTimeout(() => {
        syncBtn.className = 'btn btn-sync';
        syncText.textContent = t.syncNow;
        syncBtn.disabled = false;
      }, 3000);
    }
  }

  // Mở trang settings để cấu hình Client ID & Secret
  openSettings() {
    try {
      // Mở trang setup trong tab mới
      chrome.tabs.create({
        url: chrome.runtime.getURL('setup.html')
      });
      
      // Đóng popup
      window.close();
    } catch (error) {
      console.error('Error opening settings:', error);
      const t = translations[this.settings.language];
      this.showError('Không thể mở trang cài đặt');
    }
  }

  // Kiểm tra hoạt động hiện tại (deprecated, sử dụng updateCurrentAnimeInfo)
  async checkCurrentActivity() {
    await this.updateCurrentAnimeInfo();
  }

  // Hiển thị thông báo lỗi
  showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>❌</span>
        <span>${message}</span>
      </div>
    `;
    
    errorContainer.innerHTML = '';
    errorContainer.appendChild(errorDiv);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  // Hiển thị thông báo thành công
  showSuccess(message) {
    const errorContainer = document.getElementById('error-container');
    const successDiv = document.createElement('div');
    successDiv.className = 'error-message';
    successDiv.style.background = 'rgba(76,175,80,0.2)';
    successDiv.style.borderColor = 'rgba(76,175,80,0.5)';
    successDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>✅</span>
        <span>${message}</span>
      </div>
    `;
    
    errorContainer.innerHTML = '';
    errorContainer.appendChild(successDiv);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 3000);
  }

  // Update language for all UI elements
  updateLanguage() {
    const t = translations[this.settings.language];
    
    // Header
    document.querySelector('.header h1').textContent = t.title;
    document.querySelector('.header p').textContent = t.subtitle;
    
    // Loading
    document.querySelector('#loading').innerHTML = `
      <div class="spinner"></div>
      ${t.loading}
    `;
    
    // Status card
    const connectionStatusTitle = document.querySelector('#connection-status-title');
    if (connectionStatusTitle) {
      connectionStatusTitle.textContent = t.connectionStatus;
    }
    
    const anilistStatusText = document.querySelector('#anilist-status-text');
    if (anilistStatusText) {
      const currentText = anilistStatusText.textContent;
      if (currentText.includes('Đang kiểm tra') || currentText.includes('Checking')) {
        anilistStatusText.textContent = t.checking;
      } else if (currentText.includes('Đã kết nối') || currentText.includes('Connected')) {
        anilistStatusText.textContent = t.connected;
      } else if (currentText.includes('Chưa kết nối') || currentText.includes('Not connected')) {
        anilistStatusText.textContent = t.notConnected;
      }
    }
    
    // User info
    const connectedText = document.querySelector('#connected-text');
    if (connectedText) {
      connectedText.textContent = t.connected;
    }
    
    // Current anime card
    const currentAnimeTitle = document.querySelector('#current-anime-title');
    if (currentAnimeTitle) {
      currentAnimeTitle.textContent = t.currentAnime;
    }
    
    const currentAnimeEl = document.querySelector('#current-anime');
    if (currentAnimeEl && (currentAnimeEl.textContent.includes('Không có anime') || currentAnimeEl.textContent.includes('No anime'))) {
      currentAnimeEl.textContent = t.noAnimeDetected;
    }
    
    // Anime details labels
    const episodeLabel = document.querySelector('#episode-label');
    if (episodeLabel) {
      episodeLabel.textContent = t.episode;
    }
    
    const anilistIdLabel = document.querySelector('#anilist-id-label');
    if (anilistIdLabel) {
      anilistIdLabel.textContent = t.anilistId;
    }
    
    const statusLabel = document.querySelector('#status-label');
    if (statusLabel) {
      statusLabel.textContent = t.status;
    }
    
    // Sync button
    const syncNowText = document.querySelector('#sync-now-text');
    if (syncNowText) {
      syncNowText.textContent = t.syncNow;
    }
    
    // Connect button
    const connectBtn = document.querySelector('#connect-btn');
    if (connectBtn) {
      connectBtn.textContent = t.connectToAnilist;
    }
    
    // Settings
    const settingsTitle = document.querySelector('#settings-title');
    if (settingsTitle) {
      settingsTitle.textContent = t.settings;
    }
    
    // Settings labels
    const autoSyncLabel = document.querySelector('#auto-sync-label');
    if (autoSyncLabel) {
      autoSyncLabel.textContent = t.autoSync;
    }
    
    const notificationsLabel = document.querySelector('#notifications-label');
    if (notificationsLabel) {
      notificationsLabel.textContent = t.notifications;
    }
    
    const publicActivityLabel = document.querySelector('#public-activity-label');
    if (publicActivityLabel) {
      publicActivityLabel.textContent = t.publicActivity;
      publicActivityLabel.title = t.publicActivityTooltip;
    }
    
    const languageLabel = document.querySelector('#language-label');
    if (languageLabel) {
      languageLabel.textContent = t.language;
    }
    
    // Button texts and tooltips
    const disconnectBtn = document.querySelector('#disconnect-btn-small');
    if (disconnectBtn) {
      disconnectBtn.title = t.disconnect;
      disconnectBtn.textContent = t.logoutText;
    }
    
    const refreshBtn = document.querySelector('#refresh-btn-small');
    if (refreshBtn) {
      refreshBtn.title = t.refresh;
      refreshBtn.textContent = t.refreshText;
    }
    
    // Settings button
    const openSettingsText = document.querySelector('#open-settings-text');
    if (openSettingsText) {
      openSettingsText.textContent = t.openSettings;
    }
    
    // Footer
    const footer = document.querySelector('.footer div');
    if (footer) {
      footer.textContent = t.footer;
    }
    
    // Update sync status if exists
    const syncStatus = document.querySelector('#sync-status');
    if (syncStatus) {
      const statusText = syncStatus.textContent.toLowerCase();
      if (statusText.includes('chưa kết nối') || statusText.includes('not connected')) {
        syncStatus.textContent = t.notConnected;
      } else if (statusText.includes('sẵn sàng') || statusText.includes('ready')) {
        syncStatus.textContent = t.ready;
      } else if (statusText.includes('đang đồng bộ') || statusText.includes('syncing')) {
        syncStatus.textContent = t.syncing;
      } else if (statusText.includes('lỗi') || statusText.includes('error')) {
        syncStatus.textContent = t.error;
      } else if (statusText.includes('không tìm thấy') || statusText.includes('not found')) {
        syncStatus.textContent = t.notFound;
      }
    }
  }
}

// Khởi tạo popup manager khi DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Check if setup is completed and credentials exist
  const setupResult = await chrome.storage.local.get(['setupCompleted', 'clientId', 'clientSecret']);
  
  if (!setupResult.setupCompleted || !setupResult.clientId || !setupResult.clientSecret) {
    // Redirect to setup page if not completed or missing credentials
    chrome.tabs.create({
      url: chrome.runtime.getURL('setup.html')
    });
    window.close();
    return;
  }

  // Initialize popup manager if setup is completed
  new PopupManager();
});