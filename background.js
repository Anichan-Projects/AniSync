// Background script để xử lý authentication và API calls
class AniListAPI {
  constructor() {
    this.clientId = null;
    this.clientSecret = null;
    this.accessToken = null;
  }

  // Load credentials from Chrome storage
  async loadCredentials() {
    try {
      const result = await chrome.storage.local.get(['clientId', 'clientSecret']);
      console.log('Loading credentials from storage:', result);
      this.clientId = result.clientId;
      this.clientSecret = result.clientSecret;
      console.log('Loaded credentials:', { 
        clientId: this.clientId ? 'exists' : 'missing', 
        clientSecret: this.clientSecret ? 'exists' : 'missing' 
      });
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  }

  // Check if credentials are configured
  async hasCredentials() {
    await this.loadCredentials();
    const hasValid = !!(this.clientId && this.clientSecret);
    console.log('Checking credentials:', { 
      hasClientId: !!this.clientId, 
      hasClientSecret: !!this.clientSecret, 
      hasValid 
    });
    return hasValid;
  }

  // Lấy access token từ storage
  async getAccessToken() {
    if (this.accessToken) return this.accessToken;
    
    const result = await chrome.storage.local.get(['anilist_token', 'token_expires']);
    
    // Kiểm tra token có hết hạn không
    if (result.token_expires && Date.now() > result.token_expires) {
      await this.logout(); // Tự động logout nếu token hết hạn
      return null;
    }
    
    this.accessToken = result.anilist_token;
    return this.accessToken;
  }

  // Xác thực với AniList
  async authenticate() {
    try {
      console.log('Starting authentication process...');
      
      // Check if credentials are configured
      const hasCredentials = await this.hasCredentials();
      console.log('Credentials check result:', hasCredentials);
      
      if (!hasCredentials) {
        console.log('No credentials found, throwing error');
        throw new Error('Credentials not configured. Please run setup first.');
      }

      // Reload credentials to ensure we have latest values
      await this.loadCredentials();

      // Sử dụng chrome.identity.getRedirectURL() để lấy redirect URI
      let redirectUri = chrome.identity.getRedirectURL();
      const currentExtensionId = chrome.runtime.id;
      console.log('Current Extension ID:', currentExtensionId);
      console.log('Redirect URI from chrome.identity:', redirectUri);
      
      // Đảm bảo redirectUri có format đúng cho AniList OAuth
      if (!redirectUri || !redirectUri.includes('.chromiumapp.org')) {
        redirectUri = `https://${currentExtensionId}.chromiumapp.org/`;
        console.log('Using manual redirect URI:', redirectUri);
      }
      
      // Validate redirect URI matches current extension
      if (!redirectUri.includes(currentExtensionId)) {
        console.warn('Redirect URI does not match current extension ID');
        redirectUri = `https://${currentExtensionId}.chromiumapp.org/`;
        console.log('Corrected redirect URI:', redirectUri);
      }
      
      const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
      console.log('Auth URL:', authUrl);
      
      const redirectUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      });
      
      console.log('Redirect URL received:', redirectUrl);
      
      if (!redirectUrl) {
        throw new Error('No redirect URL received');
      }
      
      const url = new URL(redirectUrl);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code) {
        throw new Error('No authorization code received');
      }
      
      console.log('Authorization code received:', code);
      
      const tokenResponse = await this.exchangeCodeForToken(code, redirectUri);
      
      if (!tokenResponse.access_token) {
        throw new Error('No access token received');
      }
      
      this.accessToken = tokenResponse.access_token;
      
      // Lưu token vào storage
      await chrome.storage.local.set({
        'anilist_token': this.accessToken,
        'token_expires': Date.now() + (tokenResponse.expires_in * 1000)
      });
      
      console.log('Authentication successful');
      return this.accessToken;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Đổi authorization code lấy access token
  async exchangeCodeForToken(code, redirectUri) {
    const response = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${data.error || response.statusText}`);
    }
    
    return data;
  }

  // Gửi GraphQL query tới AniList
  async graphQLRequest(query, variables = {}) {
    const token = await this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    const data = await response.json();
    
    if (data.errors) {
      const error = data.errors[0];
      
      // Nếu token không hợp lệ tự động logout
      if (error.message === 'Invalid token' || 
          error.status === 401 || 
          error.message.includes('Unauthorized')) {
        console.log('Token không hợp lệ, tự động xóa và yêu cầu authenticate lại');
        await this.logout();
        throw new Error('Token không hợp lệ. Vui lòng kết nối lại với AniList.');
      }
      
      if (error.message === 'Not Found' || error.status === 404) {
        console.log('Anime không tìm thấy trên AniList');
        return null; // Trả về null thay vì throw error
      }
      
      throw new Error(error.message);
    }
    
    return data.data;
  }

  // Tìm anime trên AniList
  async searchAnime(title) {
    // Làm sạch title trước khi search
    const cleanTitle = title.trim().replace(/\s+/g, ' ');
    console.log(`Searching AniList for: "${cleanTitle}"`);
    
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            large
            medium
          }
          episodes
          status
        }
      }
    `;
    
    try {
      const result = await this.graphQLRequest(query, { search: cleanTitle });
      
      // Thử search với tên ngắn hơn
      if (!result || !result.Media) {
        console.log(`Không tìm thấy với tên đầy đủ, thử tên ngắn hơn...`);
        
        // Thử với tên ngắn hơn (lấy từ đầu tiên)
        const shortTitle = cleanTitle.split(' ')[0];
        if (shortTitle !== cleanTitle && shortTitle.length > 2) {
          console.log(`Thử search với: "${shortTitle}"`);
          const fallbackResult = await this.graphQLRequest(query, { search: shortTitle });
          
          if (fallbackResult && fallbackResult.Media) {
            console.log(`Tìm thấy với tên ngắn: "${shortTitle}"`);
            return fallbackResult;
          }
        }

        console.log(`Không tìm thấy anime "${title}" trên AniList`);
        return null;
      }
      
      return result;
    } catch (error) {
      console.error('Search anime error:', error);
      
      // throw error
      throw error;
    }
  }

  // Cập nhật tiến độ
  async updateProgress(animeId, episode, status = 'CURRENT', publicActivity = false) {
    console.log(`Updating progress for anime ${animeId}, episode ${episode}, status: ${status}, publicActivity: ${publicActivity}, private: ${!publicActivity}`);
    
    const query = `
      mutation ($mediaId: Int, $progress: Int, $status: MediaListStatus, $private: Boolean) {
        SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status, private: $private) {
          id
          progress
          status
        }
      }
    `;
    
    const result = await this.graphQLRequest(query, {
      mediaId: parseInt(animeId),
      progress: parseInt(episode),
      status: status,
      private: !publicActivity  // không tạo activity công khai
    });
    
    console.log('AniList update result:', result);
    return result;
  }

  // Lấy thông tin chi tiết
  async getAnimeInfo(animeId) {
    console.log(`Getting anime info for ID: ${animeId}`);
    
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          episodes
          status
          coverImage {
            large
            medium
          }
        }
      }
    `;
    
    try {
      const result = await this.graphQLRequest(query, { id: parseInt(animeId) });
      
      if (!result || !result.Media) {
        console.log(`Anime not found for ID: ${animeId}`);
        return null;
      }

      console.log(`Anime info retrieved: ${result.Media.title?.romaji || 'Unknown'} (${result.Media.episodes} episodes)`);
      return result.Media;
    } catch (error) {
      console.error('Error getting anime info:', error);
      throw error;
    }
  }

  // Lấy thông tin user
  async getCurrentUser() {
    const query = `
      query {
        Viewer {
          id
          name
          avatar {
            medium
          }
        }
      }
    `;
    
    return await this.graphQLRequest(query);
  }

  // Ngắt kết nối extension
  async logout() {
    try {
      // Xóa token trong memory
      this.accessToken = null;
      
      // Chỉ xóa token và dữ liệu auth
      await chrome.storage.local.remove([
        'anilist_token',
        'token_expires'
      ]);
      
      // Xóa OAuth cache
      if (chrome.identity && chrome.identity.clearAllCachedAuthTokens) {
        await chrome.identity.clearAllCachedAuthTokens();
      }
      
      console.log('Đã ngắt kết nối extension');
      return true;
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw new Error('Failed to disconnect extension');
    }
  }
}

const aniListAPI = new AniListAPI();

// Lắng nghe messages từ content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'authenticate':
          try {
            const authToken = await aniListAPI.authenticate();
            sendResponse({ success: true, token: authToken });
          } catch (authError) {
            console.error('Authentication error:', authError);
            
            // Kiểm tra nếu lỗi do chưa setup
            if (authError.message.includes('Credentials not configured')) {
              sendResponse({ 
                success: false, 
                error: authError.message, 
                needsSetup: true 
              });
            } else {
              sendResponse({ 
                success: false, 
                error: authError.message 
              });
            }
          }
          break;
          
        case 'getCurrentUser':
          try {
            const user = await aniListAPI.getCurrentUser();
            sendResponse({ success: true, user: user.Viewer });
          } catch (userError) {
            // Nếu lỗi liên quan đến token, trả về success: false
            if (userError.message.includes('Token không hợp lệ') || 
                userError.message === 'Invalid token') {
              sendResponse({ success: false, error: 'Token revoked', needsAuth: true });
            } else {
              sendResponse({ success: false, error: userError.message });
            }
          }
          break;
          
        case 'searchAnime':
          const searchResult = await aniListAPI.searchAnime(request.title);
          if (searchResult && searchResult.Media) {
            sendResponse({ success: true, anime: searchResult.Media });
          } else {
            sendResponse({ success: false, error: 'Anime not found', notFound: true });
          }
          break;
          
        case 'updateProgress':
          try {
            // Sử dụng publicActivity từ request (đã được content script lấy từ settings)
            const publicActivity = request.publicActivity || false;
            
            // Lấy thông tin anime để kiểm tra nếu là tập cuối
            let finalStatus = request.status || 'CURRENT';
            
            try {
              const animeInfo = await aniListAPI.getAnimeInfo(request.animeId);
              if (animeInfo && animeInfo.episodes) {
                const totalEpisodes = animeInfo.episodes;
                const currentEpisode = parseInt(request.episode);
                
                console.log(`Episode check: ${currentEpisode}/${totalEpisodes}`);
                
                // Nếu đây là tập cuối, đặt status thành COMPLETED
                if (currentEpisode >= totalEpisodes) {
                  finalStatus = 'COMPLETED';
                  console.log('Final episode detected, setting status to COMPLETED');
                }
              }
            } catch (animeInfoError) {
              console.log('Could not get anime info for episode check:', animeInfoError.message);
              // Vẫn tiếp tục với status mặc định nếu không lấy được thông tin
            }
            
            const updateResult = await aniListAPI.updateProgress(
              request.animeId, 
              request.episode, 
              finalStatus,
              publicActivity
            );
            console.log('Progress updated successfully:', updateResult);
            sendResponse({ success: true, result: updateResult.SaveMediaListEntry });
          } catch (error) {
            console.error('Error updating progress:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;
          
        case 'checkToken':
          const existingToken = await aniListAPI.getAccessToken();
          sendResponse({ success: true, hasToken: !!existingToken });
          break;

        case 'getSettings':
          try {
            const { settings } = await chrome.storage.local.get(['settings']);
            sendResponse({ success: true, settings: settings });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
          break;

        case 'manualSync':
          try {
            // Lấy thông tin anime hiện tại từ active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length === 0) {
              throw new Error('Không tìm thấy tab đang hoạt động');
            }
            
            // Gửi message đến content script để trigger manual sync
            const response = await chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'triggerManualSync' 
            });
            
            if (response && response.success) {
              sendResponse({ success: true, message: 'Đã đồng bộ thành công' });
            } else {
              sendResponse({ success: false, error: response?.error || 'Không thể đồng bộ' });
            }
          } catch (error) {
            console.error('Manual sync error:', error);
            sendResponse({ success: false, error: error.message });
          }
          break;

        case 'getCurrentAnimeInfo':
          // Lấy thông tin anime hiện tại từ active tab
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tabs.length > 0) {
            try {
              const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getAnimeInfo' });
              sendResponse({ success: true, animeInfo: response });
            } catch (tabError) {
              sendResponse({ success: false, error: 'No anime info available' });
            }
          } else {
            sendResponse({ success: false, error: 'No active tab' });
          }
          break;
          
        case 'logout':
          try {
            await aniListAPI.logout();
            sendResponse({ success: true, message: 'Logout successful' });
          } catch (logoutError) {
            console.error('Logout error in background:', logoutError);
            sendResponse({ success: false, error: logoutError.message });
          }
          break;

        case 'resetSetup':
          try {
            // Clear setup completion flag để force user setup lại
            await chrome.storage.local.remove(['setupCompleted', 'clientId', 'clientSecret']);
            sendResponse({ success: true, message: 'Setup reset successful' });
          } catch (resetError) {
            console.error('Reset setup error:', resetError);
            sendResponse({ success: false, error: resetError.message });
          }
          break;

        case 'checkSetup':
          try {
            const hasCredentials = await aniListAPI.hasCredentials();
            const result = await chrome.storage.local.get(['setupCompleted']);
            sendResponse({ 
              success: true, 
              setupCompleted: result.setupCompleted && hasCredentials,
              hasCredentials: hasCredentials
            });
          } catch (setupError) {
            console.error('Check setup error:', setupError);
            sendResponse({ success: false, error: setupError.message });
          }
          break;
          
        case 'debugStorage':
          try {
            const allStorage = await chrome.storage.local.get();
            console.log('Full storage contents:', allStorage);
            sendResponse({ success: true, storage: allStorage });
          } catch (debugError) {
            console.error('Debug storage error:', debugError);
            sendResponse({ success: false, error: debugError.message });
          }
          break;

        case 'updateCustomDomains':
          try {
            const { customDomains } = request;
            console.log('Updating custom domains:', customDomains);
            
            if (!Array.isArray(customDomains)) {
              throw new Error('customDomains must be an array');
            }
            
            await chrome.storage.local.set({ customDomains });
            console.log('Custom domains saved to storage successfully');
            
            // Re-inject content scripts for new domains
            setTimeout(() => {
              injectContentScriptForCustomDomains();
            }, 500);
            
            sendResponse({ success: true, message: 'Custom domains updated' });
          } catch (updateError) {
            console.error('Update custom domains error:', updateError);
            sendResponse({ success: false, error: updateError.message });
          }
          return true; // Keep message channel open for async response
          break;

        case 'getCustomDomains':
          try {
            const result = await chrome.storage.local.get(['customDomains']);
            console.log('Retrieved custom domains from storage:', result.customDomains);
            sendResponse({ success: true, customDomains: result.customDomains || [] });
          } catch (getError) {
            console.error('Get custom domains error:', getError);
            sendResponse({ success: false, error: getError.message });
          }
          return true; // Keep message channel open for async response
          break;

        case 'getDomains':
          try {
            const builtInDomains = [
              'animevietsub.show',
              // Các domain sẽ được phát hiện tự động qua patterns
            ];
            
            const result = await chrome.storage.local.get(['customDomains']);
            const customDomains = result.customDomains || [];
            
            console.log('Retrieved domains - Built-in:', builtInDomains, 'Custom:', customDomains);
            sendResponse({ 
              success: true, 
              builtInDomains, 
              customDomains,
              allDomains: [...builtInDomains, ...customDomains]
            });
          } catch (getError) {
            console.error('Get domains error:', getError);
            sendResponse({ success: false, error: getError.message });
          }
          return true;
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();
  
  return true; // Giữ message channel mở cho async response
});

// Function to inject content script into tabs matching AnimeVietSub domains
async function injectContentScriptForCustomDomains() {
  try {
    console.log('Scanning existing tabs for AnimeVietSub domains...');

    // Get all tabs
    const tabs = await chrome.tabs.query({});
    
    for (const tab of tabs) {
      if (!tab.url) continue;
      
      try {
        // Check if URL matches AnimeVietSub patterns (automatic detection)
        const isAnimeVietSub = isAnimeVietSubDomain(tab.url);
        
        // Also check custom domains
        const result = await chrome.storage.local.get(['customDomains']);
        const customDomains = result.customDomains || [];
        
        const matchesCustomDomain = customDomains.some(domain => {
          try {
            const tabUrl = new URL(tab.url);
            const customUrl = new URL(domain);
            return tabUrl.hostname === customUrl.hostname;
          } catch (e) {
            return false;
          }
        });

        if (isAnimeVietSub || matchesCustomDomain) {
          console.log(`Found AnimeVietSub tab: ${tab.url} (auto: ${isAnimeVietSub}, custom: ${matchesCustomDomain})`);
          
          // Check if content script is already injected
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
          } catch (e) {
            // Content script not present, inject it
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              });
              console.log(`Content script injected successfully into ${tab.url}`);
            } catch (injectError) {
              console.log(`Failed to inject content script into ${tab.url}:`, injectError);
            }
          }
        }
      } catch (urlError) {
        // Invalid URL, skip
        continue;
      }
    }
  } catch (error) {
    console.error('Error injecting content scripts:', error);
  }
}

// Function to check if URL matches AnimeVietSub patterns
function isAnimeVietSubDomain(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Enhanced patterns to detect AnimeVietSub domains
    const animeVietSubPatterns = [
      // Main patterns
      /animevietsub\.(show|tv|com|net|org|info|me|vn|cc|xyz|biz|co|io)/,
      
      // Generic anime
      /anime.*viet.*sub/,
      /viet.*anime.*sub/,
      /anime.*vsub/,
      /vsub.*anime/,
      
      // Domain with numbers
      /animevietsub\d+\.(tv|com|net|org|show)/,
      /avs\d+\.(tv|com|net|org|show)/
    ];

    return animeVietSubPatterns.some(pattern => pattern.test(hostname));
  } catch (e) {
    return false;
  }
}

// Get all supported domains (built-in + custom)
async function getAllSupportedDomains() {
  const builtInDomains = [
    'https://animevietsub.show',
    // Chỉ giữ lại tên miền chính, các tên miền khác sẽ được phát hiện tự động
  ];
  
  try {
    const result = await chrome.storage.local.get(['customDomains']);
    const customDomains = result.customDomains || [];
    return [...builtInDomains, ...customDomains];
  } catch (error) {
    console.error('Error getting supported domains:', error);
    return builtInDomains;
  }
}

// Listen for tab updates to inject content script for custom domains
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Check if URL matches AnimeVietSub patterns (automatic detection)
      const isAnimeVietSub = isAnimeVietSubDomain(tab.url);
      
      // Also check custom domains
      const result = await chrome.storage.local.get(['customDomains']);
      const customDomains = result.customDomains || [];
      
      const matchesCustomDomain = customDomains.some(domain => {
        try {
          const tabUrl = new URL(tab.url);
          const customUrl = new URL(domain);
          return tabUrl.hostname === customUrl.hostname;
        } catch (e) {
          return false;
        }
      });

      if (isAnimeVietSub || matchesCustomDomain) {
        console.log(`AnimeVietSub domain detected: ${tab.url} (auto: ${isAnimeVietSub}, custom: ${matchesCustomDomain})`);
        
        // Check if content script is already injected
        try {
          await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        } catch (e) {
          // Content script not present, inject it
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content.js']
            });
            console.log(`Content script injected into AnimeVietSub tab: ${tab.url}`);
          } catch (injectError) {
            console.log(`Failed to inject content script:`, injectError);
          }
        }
      }
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
});

// Khởi tạo khi extension được install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('AniList Sync extension installed');
  
  // Open setup page on first install
  if (details.reason === 'install') {
    // Check if setup is already completed
    const result = await chrome.storage.local.get(['setupCompleted']);
    
    if (!result.setupCompleted) {
      // Open setup page
      chrome.tabs.create({
        url: chrome.runtime.getURL('setup.html')
      });
    }
  }

  // Inject content scripts into existing tabs for custom domains
  if (details.reason === 'install' || details.reason === 'update') {
    setTimeout(() => {
      injectContentScriptForCustomDomains();
    }, 1000);
  }
});