// Translations for setup page
const setupTranslations = {
  vi: {
    'setup.subtitle': 'Chào mừng! Hãy thiết lập kết nối AniList của bạn',
    'setup.instructions.title': 'Cách lấy thông tin xác thực AniList',
    'setup.step1.title': 'Truy cập AniList Developer',
    'setup.step1.desc': 'Vào <a href="https://anilist.co/settings/developer" target="_blank" class="external-link">https://anilist.co/settings/developer</a> và đăng nhập vào tài khoản AniList của bạn',
    'setup.step2.title': 'Tạo Ứng dụng Mới',
    'setup.step2.desc': 'Nhấp "Create New Client" và điền tên ứng dụng (ví dụ: "My AniSync Extension")',
    'setup.step3.title': 'Đặt Redirect URL',
    'setup.step3.desc': 'Đặt redirect URL chính xác như hiển thị trong form bên dưới (có dạng <span class="highlight">https://[extension-id].chromiumapp.org/</span>)',
    'setup.step4.title': 'Sao chép Thông tin',
    'setup.step4.desc': 'Sau khi tạo, sao chép Client ID và Client Secret của bạn vào form bên phải',
    'setup.step5.title': 'Lưu & Tiếp tục',
    'setup.step5.desc': 'Nhấp "Lưu Cấu hình" để hoàn tất thiết lập',
    'setup.form.title': 'Nhập Thông tin Của Bạn',
    'setup.form.clientId': 'Client ID',
    'setup.form.clientIdHelp': 'Tìm thấy trong cài đặt developer AniList của bạn',
    'setup.form.clientSecret': 'Client Secret',
    'setup.form.clientSecretHelp': 'Giữ bí mật và không chia sẻ với ai',
    'setup.form.redirectUrl': 'Redirect URL',
    'setup.form.redirectUrlHelp': 'Phải khớp chính xác trong cài đặt ứng dụng AniList của bạn',
    'setup.form.submit': 'Lưu Cấu hình',
    'setup.error.validation': 'Vui lòng điền đầy đủ tất cả các trường',
    'setup.error.clientId': 'Client ID không hợp lệ',
    'setup.error.clientSecret': 'Client Secret không hợp lệ',
    'setup.error.redirectUrl': 'Redirect URL phải khớp chính xác với URL của extension',
    'setup.error.save': 'Lỗi khi lưu cấu hình. Vui lòng thử lại.',
    'setup.success': 'Cấu hình đã được lưu thành công! Đang chuyển hướng...',
    'setup.saving': 'Đang lưu cấu hình...',
    'setup.darkMode': 'Chế độ Tối',
    'setup.lightMode': 'Chế độ Sáng'
  },
  en: {
    'setup.subtitle': 'Welcome! Let\'s set up your AniList connection',
    'setup.instructions.title': 'How to get your AniList credentials',
    'setup.step1.title': 'Visit AniList Developer',
    'setup.step1.desc': 'Go to <a href="https://anilist.co/settings/developer" target="_blank" class="external-link">https://anilist.co/settings/developer</a> and log in to your AniList account',
    'setup.step2.title': 'Create New App',
    'setup.step2.desc': 'Click "Create New Client" and fill in the app name (e.g., "My AniSync Extension")',
    'setup.step3.title': 'Set Redirect URL',
    'setup.step3.desc': 'Set the redirect URL exactly as shown in the form below (format: <span class="highlight">https://[extension-id].chromiumapp.org/</span>)',
    'setup.step4.title': 'Copy Credentials',
    'setup.step4.desc': 'After creating, copy your Client ID and Client Secret to the form on the right',
    'setup.step5.title': 'Save & Continue',
    'setup.step5.desc': 'Click "Save Configuration" to complete the setup',
    'setup.form.title': 'Enter Your Credentials',
    'setup.form.clientId': 'Client ID',
    'setup.form.clientIdHelp': 'Found in your AniList developer settings',
    'setup.form.clientSecret': 'Client Secret',
    'setup.form.clientSecretHelp': 'Keep this secret and don\'t share it',
    'setup.form.redirectUrl': 'Redirect URL',
    'setup.form.redirectUrlHelp': 'This must match exactly in your AniList app settings',
    'setup.form.submit': 'Save Configuration',
    'setup.error.validation': 'Please fill in all required fields',
    'setup.error.clientId': 'Invalid Client ID format',
    'setup.error.clientSecret': 'Invalid Client Secret format',
    'setup.error.redirectUrl': 'Redirect URL must match exactly with the extension URL',
    'setup.error.save': 'Error saving configuration. Please try again.',
    'setup.success': 'Configuration saved successfully! Redirecting...',
    'setup.saving': 'Saving configuration...',
    'setup.darkMode': 'Dark Mode',
    'setup.lightMode': 'Light Mode'
  }
};

// Current language and theme
let currentLanguage = 'vi';
let currentTheme = 'light';
let extensionId = '';
let redirectUrl = '';

// Initialize extension info when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Get extension ID
    extensionId = chrome.runtime.id;
    console.log('Extension ID detected:', extensionId);
    
    // Get redirect URL from Chrome Identity API
    redirectUrl = chrome.identity.getRedirectURL();
    console.log('Redirect URL from chrome.identity:', redirectUrl);
    
    // Đảm bảo redirectUrl có format đúng cho AniList OAuth
    if (!redirectUrl || !redirectUrl.includes('.chromiumapp.org')) {
      // Tự tạo redirect URL với format đúng
      redirectUrl = `https://${extensionId}.chromiumapp.org/`;
      console.log('Using manual redirect URL:', redirectUrl);
    }
    
    // Validate redirect URL format
    const expectedPattern = new RegExp(`https://${extensionId}\\.chromiumapp\\.org/?`);
    if (!expectedPattern.test(redirectUrl)) {
      console.warn('⚠️ Redirect URL format may be incorrect:', redirectUrl);
      redirectUrl = `https://${extensionId}.chromiumapp.org/`;
      console.log('Corrected redirect URL:', redirectUrl);
    }
    
    // Set redirect URL in the form
    const redirectUrlInput = document.getElementById('redirectUrl');
    if (redirectUrlInput) {
      redirectUrlInput.value = redirectUrl;
    }
    
    // Load existing credentials if any
    loadExistingCredentials();
    
    // Auto-focus first input
    const clientIdInput = document.getElementById('clientId');
    if (clientIdInput) {
      clientIdInput.focus();
    }
  } catch (error) {
    console.error('Error getting extension info:', error);
    
    // Fallback method
    try {
      extensionId = chrome.runtime.id;
      redirectUrl = `https://${extensionId}.chromiumapp.org/`;
      
      console.log('Extension ID (fallback):', extensionId);
      console.log('Redirect URL (fallback):', redirectUrl);
      
      const redirectUrlInput = document.getElementById('redirectUrl');
      if (redirectUrlInput) {
        redirectUrlInput.value = redirectUrl;
      }
      
      // Load existing credentials if any
      loadExistingCredentials();
      
      // Auto-focus first input
      const clientIdInput = document.getElementById('clientId');
      if (clientIdInput) {
        clientIdInput.focus();
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      
      // Last resort: manual construction
      if (extensionId) {
        redirectUrl = `https://${extensionId}.chromiumapp.org/`;
        
        const redirectUrlInput = document.getElementById('redirectUrl');
        if (redirectUrlInput) {
          redirectUrlInput.value = redirectUrl;
        }
      }
    }
  }
});

// Load saved preferences
chrome.storage.local.get(['language', 'theme']).then(result => {
  if (result.language) {
    currentLanguage = result.language;
    document.getElementById('languageSelect').value = currentLanguage;
  }
  if (result.theme) {
    currentTheme = result.theme;
  }
  updateLanguage();
  updateTheme();
});

// Language selector
document.getElementById('languageSelect').addEventListener('change', (e) => {
  currentLanguage = e.target.value;
  chrome.storage.local.set({ language: currentLanguage });
  updateLanguage();
});

// Theme toggle button
document.getElementById('themeToggle').addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  chrome.storage.local.set({ theme: currentTheme });
  updateTheme();
});

// Load existing credentials function
async function loadExistingCredentials() {
  try {
    const result = await chrome.storage.local.get(['clientId', 'clientSecret']);
    
    if (result.clientId) {
      const clientIdInput = document.getElementById('clientId');
      if (clientIdInput) {
        clientIdInput.value = result.clientId;
      }
    }
    
    if (result.clientSecret) {
      const clientSecretInput = document.getElementById('clientSecret');
      if (clientSecretInput) {
        clientSecretInput.value = result.clientSecret;
      }
    }
    
    console.log('Loaded existing credentials:', !!result.clientId, !!result.clientSecret);
  } catch (error) {
    console.error('Error loading existing credentials:', error);
  }
}

// Update language function
function updateLanguage() {
  const translations = setupTranslations[currentLanguage];
  
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[key]) {
      element.innerHTML = translations[key];
    }
  });
}

// Update theme function
function updateTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (currentTheme === 'dark') {
    body.classList.add('dark-theme');
    themeIcon.textContent = '☀️';
    themeText.textContent = setupTranslations[currentLanguage]['setup.lightMode'];
    themeText.setAttribute('data-translate', 'setup.lightMode');
  } else {
    body.classList.remove('dark-theme');
    themeIcon.textContent = '🌙';
    themeText.textContent = setupTranslations[currentLanguage]['setup.darkMode'];
    themeText.setAttribute('data-translate', 'setup.darkMode');
  }
}

// Form validation
function validateForm(formData) {
  const errors = [];
  
  // Check if all fields are filled
  if (!formData.clientId.trim() || !formData.clientSecret.trim() || !formData.redirectUrl.trim()) {
    errors.push(setupTranslations[currentLanguage]['setup.error.validation']);
    return errors;
  }
  
  // Validate Client ID (should be numeric)
  if (!/^\d+$/.test(formData.clientId.trim())) {
    errors.push(setupTranslations[currentLanguage]['setup.error.clientId']);
  }
  
  // Validate Client Secret (should be alphanumeric, length > 10)
  if (formData.clientSecret.trim().length < 10) {
    errors.push(setupTranslations[currentLanguage]['setup.error.clientSecret']);
  }
  
  // Validate Redirect URL
  if (formData.redirectUrl.trim() !== redirectUrl) {
    errors.push(setupTranslations[currentLanguage]['setup.error.redirectUrl']);
  }
  
  return errors;
}

// Show message function
function showMessage(message, isError = false) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
}

// Clear message function
function clearMessage() {
  document.getElementById('message').innerHTML = '';
}

// Form submission handler
document.getElementById('setupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessage();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  // Get form data
  const formData = {
    clientId: document.getElementById('clientId').value,
    clientSecret: document.getElementById('clientSecret').value,
    redirectUrl: document.getElementById('redirectUrl').value
  };
  
  // Validate form
  const validationErrors = validateForm(formData);
  if (validationErrors.length > 0) {
    showMessage(validationErrors.join('<br>'), true);
    return;
  }
  
  // Disable submit button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = setupTranslations[currentLanguage]['setup.saving'];
  
  try {
    // Save configuration to Chrome storage
    const dataToSave = {
      clientId: formData.clientId.trim(),
      clientSecret: formData.clientSecret.trim(),
      setupCompleted: true
    };
    
    console.log('Saving setup data:', { 
      clientId: dataToSave.clientId ? 'exists' : 'missing',
      clientSecret: dataToSave.clientSecret ? 'exists' : 'missing',
      setupCompleted: dataToSave.setupCompleted 
    });
    
    await chrome.storage.local.set(dataToSave);
    
    // Verify save was successful
    const verification = await chrome.storage.local.get(['clientId', 'clientSecret', 'setupCompleted']);
    console.log('Setup verification:', verification);
    
    // Show success message
    showMessage(setupTranslations[currentLanguage]['setup.success']);
    
    // Redirect to popup after 2 seconds
    setTimeout(() => {
      window.close();
    }, 2000);
    
  } catch (error) {
    console.error('Error saving configuration:', error);
    showMessage(setupTranslations[currentLanguage]['setup.error.save'], true);
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});


