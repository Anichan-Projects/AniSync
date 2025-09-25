// Content script notifications translations
const contentTranslations = {
  vi: {
    authNotificationTitle: '🔗 Kết nối với AniList',
    authNotificationDesc: 'Nhấp để kết nối với AniList và đồng bộ tiến trình xem anime của bạn.',
    connectSuccess: '✅ Kết nối thành công!',
    connectSuccessDesc: 'Bạn có thể bắt đầu xem anime ngay bây giờ.',
    connectFailed: '❌ Kết nối thất bại',
    connectFailedDesc: 'Vui lòng thử lại sau.',
    animeDetected: 'Phát hiện anime',
    foundOnAnilist: 'Tìm thấy trên AniList',
    notFoundOnAnilist: 'Không tìm thấy trên AniList',
    syncSuccess: '✅ Đồng bộ thành công',
    syncSuccessDesc: 'Tiến trình xem đã được cập nhật trên AniList',
    syncError: 'Lỗi đồng bộ: ',
    connectionError: 'Lỗi kết nối khi đồng bộ'
  },
  en: {
    authNotificationTitle: '🔗 Connect to AniList',
    authNotificationDesc: 'Click to connect to AniList and sync your anime watching progress.',
    connectSuccess: '✅ Connected successfully!',
    connectSuccessDesc: 'You can start watching anime now.',
    connectFailed: '❌ Connection failed',
    connectFailedDesc: 'Please try again later.',
    animeDetected: 'Anime detected',
    foundOnAnilist: 'Found on AniList',
    notFoundOnAnilist: 'Not found on AniList',
    syncSuccess: '✅ Sync successful',
    syncSuccessDesc: 'Watching progress updated on AniList',
    syncError: 'Sync error: ',
    connectionError: 'Connection error while syncing'
  }
};

// Content script chạy trên animevsub.tv
class AnimeVsubTracker {
  constructor() {
    this.currentAnime = null;
    this.currentEpisode = null;
    this.anilistAnimeId = null;
    this.anilistAnimeTitle = null;
    this.anilistCoverImage = null;
    this.anilistTotalEpisodes = null;
    this.watchStartTime = null;
    this.isWatching = false;
    this.syncEnabled = true;
    this.syncStatus = 'disconnected'; // disconnected, ready, syncing, error, not-found
    this.language = 'vi'; // Default language
    
    // Listen for language changes from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'languageChanged') {
        this.language = message.language;
        sendResponse({ success: true });
      } else if (message.action === 'ping') {
        // Respond to ping to indicate content script is loaded
        sendResponse({ success: true, loaded: true });
      }
    });
    
    this.init();
  }

  async init() {
    // Load language setting từ storage
    await this.loadLanguage();
    
    // Kiểm tra xem user đã authenticate chưa
    const response = await this.sendMessage({ action: 'checkToken' });
    
    if (!response.success || !response.hasToken) {
      this.syncStatus = 'disconnected';
      this.showAuthNotification();
      return;
    }

    this.syncStatus = 'ready';
    // Bắt đầu monitoring
    this.startMonitoring();
  }

  // Load language setting từ Chrome storage
  async loadLanguage() {
    try {
      const result = await chrome.storage.local.get(['settings']);
      if (result.settings && result.settings.language) {
        this.language = result.settings.language;
      }
    } catch (error) {
      console.error('Error loading language setting:', error);
    }
  }

  // Gửi message đến background script
  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  // Hiển thị thông báo cần authentication
  showAuthNotification() {
    const t = contentTranslations[this.language];
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      cursor: pointer;
      transition: transform 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>${t.authNotificationTitle}</strong>
      </div>
      <div style="margin-bottom: 10px; opacity: 0.9;">
        ${t.authNotificationDesc}
      </div>
    `;
    
    notification.onmouseover = () => {
      notification.style.transform = 'scale(1.05)';
    };
    
    notification.onmouseout = () => {
      notification.style.transform = 'scale(1)';
    };
    
    notification.onclick = async () => {
      try {
        const authResult = await this.sendMessage({ action: 'authenticate' });
        if (authResult.success) {
          notification.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
          notification.innerHTML = `<div><strong>${t.connectSuccess}</strong><br>${t.connectSuccessDesc}</div>`;
          
          setTimeout(() => {
            notification.remove();
            this.startMonitoring();
          }, 2000);
        }
      } catch (error) {
        notification.style.background = 'linear-gradient(135deg, #f44336 0%, #da190b 100%)';
        notification.innerHTML = `<div><strong>${t.connectFailed}</strong><br>${t.connectFailedDesc}</div>`;
      }
    };
    
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 10 giây
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 10000);
  }

  // Bắt đầu monitoring hoạt động xem anime
  startMonitoring() {
    // Detect anime info từ URL và page content
    this.detectAnimeInfo();
    
    // Theo dõi video player
    this.monitorVideoPlayer();
    
    // Theo dõi thay đổi URL (SPA navigation)
    this.monitorUrlChanges();
    
    console.log('AniList Sync: Bắt đầu theo dõi hoạt động xem anime');
    
    // Listen for messages từ popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getAnimeInfo') {
        sendResponse({
          currentAnime: this.currentAnime,
          currentEpisode: this.currentEpisode,
          anilistAnimeId: this.anilistAnimeId,
          anilistTitle: this.anilistAnimeTitle,
          coverImage: this.anilistCoverImage,
          totalEpisodes: this.anilistTotalEpisodes,
          syncStatus: this.syncStatus,
          isWatching: this.isWatching
        });
      } else if (request.action === 'triggerManualSync') {
        // Thực hiện đồng bộ thủ công
        this.performManualSync().then(result => {
          sendResponse(result);
        }).catch(error => {
          sendResponse({ success: false, error: error.message });
        });
        return true; // Async response
      }
      return true;
    });
  }

  // Phát hiện thông tin anime từ trang
  detectAnimeInfo() {
    console.log('Starting anime detection on:', window.location.href);
    
    // Chỉ tìm tên tiếng Anh (để search AniList)
    const englishTitleSelectors = [
      '/html/body/div[1]/div[1]/div/div[3]/main/article/header/h2', // Subtitle tiếng Anh
      '.english-title',
      '.subtitle',
      '[data-english-title]'
    ];
    
    const episodeSelectors = [
      '.episode-number',
      '.ep-title',
      '.episode-title',
      '.current-episode',
      '.episode-info',
      '[data-episode]',
      '.breadcrumb .active'
    ];
    
    let animeTitle = null;
    let episodeNumber = null;
    
    // Chỉ tìm tên tiếng Anh
    console.log('Looking for English title...');
    
    // Thử lấy từ XPath selector
    const xpathResult = document.evaluate(
      '/html/body/div[1]/div[1]/div/div[3]/main/article/header/h2',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    
    if (xpathResult.singleNodeValue && xpathResult.singleNodeValue.textContent.trim()) {
      animeTitle = xpathResult.singleNodeValue.textContent.trim();
      console.log('Found English title from XPath:', animeTitle);
    } else {
      // Thử các selector tiếng Anh khác
      for (const selector of englishTitleSelectors.slice(1)) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          animeTitle = element.textContent.trim();
          console.log('Found English title from selector:', selector, '→', animeTitle);
          break;
        }
      }
    }
    
    // Nếu không tìm thấy tên tiếng Anh, không làm gì cả
    if (!animeTitle) {
      console.log('English title not found, skipping detection');
      return;
    }
    
    // Thử lấy episode number
    for (const selector of episodeSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        const episodeText = element.textContent.trim();
        const episodeMatch = episodeText.match(/(\d+)/);
        if (episodeMatch) {
          episodeNumber = parseInt(episodeMatch[1]);
          break;
        }
      }
    }
    
    // Fallback: lấy episode từ URL
    if (!episodeNumber) {
      const urlPath = window.location.pathname;
      console.log('Looking for episode in URL:', urlPath);
      
      const matches = urlPath.match(/tap-(\d+)/i) || 
                     urlPath.match(/episode-(\d+)/i) ||
                     urlPath.match(/ep-(\d+)/i) ||
                     urlPath.match(/-(\d+)\.html/i);
      
      if (matches) {
        episodeNumber = parseInt(matches[1]);
        console.log('Extracted episode number:', episodeNumber);
      }
    }
    
    if (animeTitle && episodeNumber) {
      // Làm sạch title trước khi sử dụng
      animeTitle = this.cleanAnimeTitle(animeTitle);
      this.setCurrentAnime(animeTitle, episodeNumber);
    }
  }

  // Set thông tin anime hiện tại
  async setCurrentAnime(title, episode) {
    if (this.currentAnime === title && this.currentEpisode === episode) {
      return; // Không thay đổi
    }
    
    this.currentAnime = title;
    this.currentEpisode = episode;
    
    console.log(`Phát hiện anime: ${title} - Episode ${episode}`);
    console.log(`Sẽ search trên AniList với tên: "${title}"`);
    
    // Tìm anime trên AniList
    await this.searchAndMatchAnime(title);
  }

  // Tìm anime trên AniList với multiple titles
  async searchAndMatchAnime(title) {
    try {
      console.log(`Searching for "${title}" on AniList...`);
      
      // Tách các title bằng dấu phẩy và thử từng cái
      const titles = title.split(',').map(t => t.trim()).filter(t => t.length > 0);
      console.log(`Found ${titles.length} title(s) to try:`, titles);
      
      for (let i = 0; i < titles.length; i++) {
        const currentTitle = titles[i];
        console.log(`Trying title ${i + 1}/${titles.length}: "${currentTitle}"`);
        
        const response = await this.sendMessage({
          action: 'searchAnime',
          title: currentTitle
        });
        
        if (response.success && response.anime) {
          this.anilistAnimeId = response.anime.id;
          this.anilistAnimeTitle = response.anime.title.romaji || response.anime.title.english;
          this.anilistCoverImage = response.anime.coverImage ? response.anime.coverImage.large : null;
          this.anilistTotalEpisodes = response.anime.episodes;
          this.syncStatus = 'ready';
          console.log(`Tìm thấy anime với title "${currentTitle}":`, response.anime);
          
          // Hiển thị thông báo tìm thấy
          this.showAnimeMatchedNotification(
            response.anime.title.romaji || response.anime.title.english,
            currentTitle
          );
          return; // Tìm thấy rồi thì dừng
        } else {
          console.log(`Không tìm thấy với title "${currentTitle}"`);
        }
      }
      
      // Nếu không tìm thấy với bất kỳ title nào
      this.syncStatus = 'not-found';
      console.log(`Không tìm thấy anime với tất cả ${titles.length} title(s)`);
      this.showAnimeNotFoundNotification(title);
      
    } catch (error) {
      console.error('Lỗi khi tìm anime:', error);
    }
  }

  // Hiển thị thông báo phát hiện anime
  showAnimeDetectedNotification(title, episode) {
    // Xóa notification cũ nếu có
    const oldNotification = document.getElementById('anilist-sync-notification');
    if (oldNotification) {
      oldNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'anilist-sync-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: linear-gradient(135deg, #02A9FF 0%, #0062cc 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(2,169,255,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 13px;
      max-width: 350px;
      opacity: 0;
      transform: translateX(-100%);
      transition: all 0.4s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 18px;">🎯</div>
        <div>
          <div style="font-weight: bold; margin-bottom: 2px;">${title}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation hiển thị
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 5000);
  }

  // Theo dõi video player
  monitorVideoPlayer() {
    const checkForVideo = () => {
      const video = document.querySelector('video');
      
      if (video && !video.dataset.anilistTracked) {
        video.dataset.anilistTracked = 'true';
        this.setupVideoEventListeners(video);
      }
    };
    
    // Kiểm tra ngay lập tức
    checkForVideo();
    
    // Kiểm tra định kỳ cho các video được load động
    setInterval(checkForVideo, 2000);
  }

  // Setup event listeners cho video
  setupVideoEventListeners(video) {
    let watchTime = 0;
    let lastUpdateTime = Date.now();
    
    video.addEventListener('play', () => {
      this.isWatching = true;
      this.watchStartTime = Date.now();
      lastUpdateTime = Date.now();
      console.log(' Bắt đầu xem video');
    });
    
    video.addEventListener('pause', () => {
      this.isWatching = false;
      if (this.watchStartTime) {
        watchTime += Date.now() - lastUpdateTime;
      }
      console.log('Tạm dừng video');
    });
    
    video.addEventListener('ended', () => {
      this.isWatching = false;
      watchTime += Date.now() - lastUpdateTime;
      console.log('Xem xong episode');
      this.onEpisodeCompleted(watchTime);
    });
    
    // Cập nhật tiến độ theo thời gian thực
    video.addEventListener('timeupdate', () => {
      if (this.isWatching) {
        const currentTime = Date.now();
        watchTime += currentTime - lastUpdateTime;
        lastUpdateTime = currentTime;
        
        // Kiểm tra xem đã xem được 80% chưa
        const progress = video.currentTime / video.duration;
        if (progress >= 0.8 && !this.episodeMarkedAsWatched) {
          this.episodeMarkedAsWatched = true;
          this.onEpisodeCompleted(watchTime);
        }
      }
    });
  }

  // Xử lý khi hoàn thành episode
  async onEpisodeCompleted(watchTime) {
    if (!this.anilistAnimeId || !this.currentEpisode) {
      console.log('Không thể đồng bộ: Missing anilistAnimeId hoặc currentEpisode', {
        anilistAnimeId: this.anilistAnimeId,
        currentEpisode: this.currentEpisode
      });
      return;
    }

    // Kiểm tra xem user đã authenticate với AniList chưa
    try {
      const tokenCheck = await this.sendMessage({ action: 'checkToken' });
      if (!tokenCheck.success || !tokenCheck.hasToken) {
        console.log('Không thể đồng bộ: User chưa authenticate với AniList');
        this.syncStatus = 'disconnected';
        return;
      }
    } catch (error) {
      console.error('❌ Lỗi khi kiểm tra token:', error);
      return;
    }
    
    console.log(`Hoàn thành episode ${this.currentEpisode} (${Math.round(watchTime/1000)}s) - Bắt đầu đồng bộ...`);
    this.syncStatus = 'syncing';
    
    try {
      // Lấy settings trước khi sync
      const settingsResponse = await this.sendMessage({ action: 'getSettings' });
      const publicActivity = settingsResponse?.settings?.publicActivity || false;
      
      const response = await this.sendMessage({
        action: 'updateProgress',
        animeId: this.anilistAnimeId,
        episode: parseInt(this.currentEpisode),
        publicActivity: publicActivity
      });
      
      if (response.success) {
        this.syncStatus = 'ready';
        this.showSyncSuccessNotification();
        console.log('Đã cập nhật tiến độ lên AniList:', response.result);
      } else {
        this.syncStatus = 'error';
        console.error('❌ Lỗi khi cập nhật tiến độ:', response.error);
        this.showErrorNotification(contentTranslations[this.language].syncError + response.error);
      }
    } catch (error) {
      this.syncStatus = 'error';
      console.error('❌ Lỗi khi đồng bộ:', error);
      this.showErrorNotification(contentTranslations[this.language].connectionError);
    }
  }

  // Thực hiện đồng bộ thủ công
  async performManualSync() {
    console.log('Bắt đầu đồng bộ thủ công...');
    
    if (!this.anilistAnimeId || !this.currentEpisode) {
      throw new Error('Không có thông tin anime hoặc episode để đồng bộ');
    }

    // Kiểm tra authentication
    try {
      const tokenCheck = await this.sendMessage({ action: 'checkToken' });
      if (!tokenCheck.success || !tokenCheck.hasToken) {
        throw new Error('Chưa kết nối với AniList');
      }
    } catch (error) {
      throw new Error('Lỗi kiểm tra kết nối: ' + error.message);
    }
    
    this.syncStatus = 'syncing';
    
    try {
      // Lấy settings trước khi sync
      const settingsResponse = await this.sendMessage({ action: 'getSettings' });
      const publicActivity = settingsResponse?.settings?.publicActivity || false;
      
      const response = await this.sendMessage({
        action: 'updateProgress',
        animeId: this.anilistAnimeId,
        episode: parseInt(this.currentEpisode),
        publicActivity: publicActivity
      });
      
      if (response.success) {
        this.syncStatus = 'ready';
        this.showSyncSuccessNotification();
        console.log('Đồng bộ thủ công thành công:', response.result);
        return { success: true, message: 'Đã đồng bộ thành công' };
      } else {
        this.syncStatus = 'error';
        throw new Error(response.error || 'Lỗi không xác định');
      }
    } catch (error) {
      this.syncStatus = 'error';
      throw new Error('Lỗi đồng bộ: ' + error.message);
    }
  }

  // Hiển thị thông báo tìm thấy anime
  showAnimeMatchedNotification(anilistTitle, matchedTitle = null) {
    const t = contentTranslations[this.language];
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(76,175,80,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 13px;
      max-width: 300px;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.4s ease;
    `;
    
    const displayText = matchedTitle && matchedTitle !== anilistTitle 
      ? `${anilistTitle}<br><span style="opacity: 0.6;">Matched: ${matchedTitle}</span>`
      : anilistTitle;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: bold;">${t.foundOnAnilist}!</div>
          <div style="opacity: 0.8; font-size: 11px;">${displayText}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation hiển thị
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 3000);
  }

  // Hiển thị thông báo không tìm thấy anime
  showAnimeNotFoundNotification(title) {
    const t = contentTranslations[this.language];
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(255,152,0,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 13px;
      max-width: 300px;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.4s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">⚠️</span>
        <div>
          <div style="font-weight: bold;">${t.notFoundOnAnilist}</div>
          <div style="opacity: 0.8; font-size: 11px;">${title}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation hiển thị
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Tự động ẩn sau 4 giây
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 4000);
  }

  // Hiển thị thông báo đồng bộ thành công
  showSyncSuccessNotification() {
    const t = contentTranslations[this.language];
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(76,175,80,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 13px;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.4s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">✅</span>
        <div>
          <div style="font-weight: bold;">${t.syncSuccess}</div>
          <div style="opacity: 0.8; font-size: 11px;">${t.syncSuccessDesc}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation hiển thị
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Tự động ẩn sau 4 giây
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 4000);
  }

  // Hiển thị thông báo lỗi
  showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(244,67,54,0.3);
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 13px;
      opacity: 0;
      transform: translateY(100%);
      transition: all 0.4s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">❌</span>
        <div>
          <div style="font-weight: bold;">Error</div>
          <div style="opacity: 0.8; font-size: 11px;">${message}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation hiển thị
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Tự động ẩn sau 6 giây (lâu hơn success notification)
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, 6000);
  }

  // Làm sạch tên anime để search tốt hơn
  cleanAnimeTitle(title) {
    // Làm sạch toàn bộ title trước
    let cleaned = title
      .trim()
      .replace(/\s*\(.*?\)\s*/g, '') // Xóa nội dung trong ngoặc đơn
      .replace(/\s*\[.*?\]\s*/g, '') // Xóa nội dung trong ngoặc vuông  
      .replace(/\s*-\s*Tập\s*\d+.*$/i, '') // Xóa "- Tập X"
      .replace(/\s*Episode\s*\d+.*$/i, '') // Xóa "Episode X"
      .replace(/\s*EP\s*\d+.*$/i, '') // Xóa "EP X"
      .replace(/\s*SS?\s*\d+.*$/i, '') // Xóa "S1", "SS2", etc.
      .trim();
    
    // Nếu có nhiều title phân cách bởi dấu phẩy, clean từng cái
    if (cleaned.includes(',')) {
      const titles = cleaned.split(',').map(t => 
        t.trim()
         .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
         .trim()
      ).filter(t => t.length > 0);
      
      return titles.join(', ');
    }
    
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  // Theo dõi thay đổi URL
  monitorUrlChanges() {
    let currentUrl = window.location.href;
    
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        this.episodeMarkedAsWatched = false;
        
        // Chờ một chút để page load
        setTimeout(() => {
          this.detectAnimeInfo();
        }, 1000);
      }
    };
    
    // Kiểm tra mỗi giây
    setInterval(checkUrlChange, 1000);
  }
}

// Kiểm tra xem có phải domain được phép không
async function isAllowedDomain() {
  try {
    // Lấy danh sách domain từ storage (từ domains.js)
    const response = await chrome.runtime.sendMessage({ action: 'getDomains' });
    
    if (!response.success) {
      console.log('Cannot get domains list, extension will not run');
      return false;
    }
    
    const customDomains = response.customDomains || [];
    const builtInDomains = response.builtInDomains || [];
    const allDomains = [...customDomains, ...builtInDomains];
    
    const currentHostname = window.location.hostname.toLowerCase();
    
    // Kiểm tra xem domain hiện tại có trong danh sách không
    const isAllowed = allDomains.some(domain => {
      // Loại bỏ protocol nếu có
      const cleanDomain = domain.replace(/^https?:\/\//, '').toLowerCase();
      
      // Kiểm tra exact match hoặc subdomain
      return currentHostname === cleanDomain || 
             currentHostname.endsWith('.' + cleanDomain) ||
             cleanDomain.includes(currentHostname);
    });
    
    if (isAllowed) {
      console.log(`Domain ${currentHostname} is in allowed list`);
    } else {
      console.log(`Domain ${currentHostname} is NOT in allowed list. Available domains:`, allDomains);
    }
    
    return isAllowed;
    
  } catch (error) {
    console.error('Error checking domain:', error);
    return false;
  }
}

// Khởi tạo tracker khi DOM ready
console.log('AniList Sync content script loaded on:', window.location.href);

// Chỉ chạy trên domain được phép (từ domains list)
isAllowedDomain().then(allowed => {
  if (!allowed) {
    console.log('Domain not in allowed list, skipping initialization');
    return;
  }
  
  console.log('Domain is allowed, initializing tracker');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, initializing tracker');
      new AnimeVsubTracker();
    });
  } else {
    console.log('DOM already loaded, initializing tracker');
    new AnimeVsubTracker();
  }
}).catch(error => {
  console.error('Error during domain check:', error);
});