// Translations for domains page
const domainTranslations = {
  vi: {
    'domains.subtitle': 'Quản lý tên miền AnimeVietSub',
    'domains.darkMode': 'Chế độ Tối',
    'domains.lightMode': 'Chế độ Sáng',
    'domains.supportedTitle': 'Tên miền được hỗ trợ',
    'domains.supportedDesc': 'Extension sẽ <strong>tự động phát hiện và hoạt động</strong> trên hầu hết các tên miền của AnimeVietSub (ví dụ: animevietsub.show, ...). Chỉ cần thêm tên miền tùy chỉnh nếu extension không tự động hoạt động.',
    'domains.addCustomTitle': 'Thêm tên miền tùy chỉnh',
    'domains.addCustomDesc': '<strong>Chỉ cần thêm tên miền nếu extension không tự động hoạt động.</strong> Extension đã có khả năng tự động phát hiện hầu hết các tên miền AnimeVietSub. Nếu bạn thấy extension không hoạt động trên một tên miền nào đó, hãy thêm vào đây.',
    'domains.inputPlaceholder': 'Ví dụ: animevietsub.cc hoặc https://animevietsub.xyz',
    'domains.addBtn': 'Thêm',
    'domains.inputHelp': 'Có thể nhập tên miền với hoặc không có "https://". Extension sẽ tự động bổ sung.',
    'domains.close': 'Đóng',
    'domains.testConnection': 'Kiểm tra kết nối',
    'domains.cleanup': 'Xóa tên miền lỗi',
    'domains.back': 'Quay lại',
    'domains.builtIn': 'Có sẵn',
    'domains.autoDetected': 'Tự động',
    'domains.custom': 'Tùy chỉnh',
    'domains.remove': 'Xóa',
    'domains.noCustomDomains': '✨ Extension sẽ tự động phát hiện hầu hết các tên miền AnimeVietSub. Chỉ cần thêm tên miền nếu không tự động hoạt động.',
    'domains.addSuccess': 'Đã thêm tên miền thành công',
    'domains.addError': 'Lỗi khi thêm tên miền',
    'domains.removeSuccess': 'Đã xóa tên miền thành công',
    'domains.removeError': 'Lỗi khi xóa tên miền',
    'domains.invalidDomain': 'Tên miền không hợp lệ',
    'domains.domainExists': 'Tên miền đã tồn tại',
    'domains.testingConnection': 'Đang kiểm tra kết nối...',
    'domains.testSuccess': 'Tất cả tên miền hoạt động bình thường',
    'domains.testFailed': 'Một số tên miền không thể truy cập',
    'domains.cleanupStarting': 'Đang kiểm tra và xóa tên miền lỗi...',
    'domains.cleanupSuccess': 'Đã xóa {count} tên miền không hoạt động',
    'domains.cleanupNone': 'Tất cả tên miền đều hoạt động tốt',
    'domains.cleanupError': 'Lỗi khi dọn dẹp tên miền',
    'domains.autoDetectDesc': 'Extension tự động hoạt động với các tên miền bắt đầu với ://animevietsub.*/',
    'domains.testing': 'Đang kiểm tra...',
    'domains.testingConnection': 'Đang kiểm tra kết nối đến các tên miền...',
    'domains.testResults': 'Kết quả kiểm tra:',
    'domains.connectionSuccess': 'Kết nối thành công',
    'domains.connectionCors': 'Có thể truy cập (CORS restricted)',
    'domains.cleanupConfirm': 'Bạn có muốn kiểm tra và xóa các tên miền không hoạt động? ({count} tên miền sẽ được kiểm tra)',
    'domains.loadError': 'Lỗi khi tải danh sách tên miền',
    'domains.updateError': 'Không thể cập nhật danh sách tên miền',
    'domains.removeConfirm': 'Bạn có chắc muốn xóa tên miền "{domain}"?',
    'domains.cleanupTooltip': 'Kiểm tra và xóa tên miền không hoạt động'
  },
  en: {
    'domains.subtitle': 'Manage AnimeVietSub Domains',
    'domains.darkMode': 'Dark Mode',
    'domains.lightMode': 'Light Mode',
    'domains.supportedTitle': 'Supported Domains',
    'domains.supportedDesc': 'The extension will <strong>automatically detect and work</strong> on most AnimeVietSub domains (e.g., animevietsub.show, ...). Only add custom domains if the extension doesn\'t work automatically.',
    'domains.addCustomTitle': 'Add Custom Domain',
    'domains.addCustomDesc': '<strong>Only add domains if the extension doesn\'t work automatically.</strong> The extension can automatically detect most AnimeVietSub domains. If you find the extension not working on a specific domain, add it here.',
    'domains.inputPlaceholder': 'Example: animevietsub.cc or https://animevietsub.xyz',
    'domains.addBtn': 'Add',
    'domains.inputHelp': 'You can enter domain with or without "https://". Extension will automatically supplement.',
    'domains.close': 'Close',
    'domains.testConnection': 'Test Connection',
    'domains.cleanup': 'Remove Broken Domains',
    'domains.back': 'Back',
    'domains.builtIn': 'Built-in',
    'domains.autoDetected': 'Auto',
    'domains.custom': 'Custom',
    'domains.remove': 'Remove',
    'domains.noCustomDomains': '✨ Extension will automatically detect most AnimeVietSub domains. Only add domains if not working automatically.',
    'domains.addSuccess': 'Domain added successfully',
    'domains.addError': 'Error adding domain',
    'domains.removeSuccess': 'Domain removed successfully',
    'domains.removeError': 'Error removing domain',
    'domains.invalidDomain': 'Invalid domain',
    'domains.domainExists': 'Domain already exists',
    'domains.testingConnection': 'Testing connection...',
    'domains.testSuccess': 'All domains are working normally',
    'domains.testFailed': 'Some domains are not accessible',
    'domains.cleanupStarting': 'Checking and removing broken domains...',
    'domains.cleanupSuccess': 'Removed {count} non-working domains',
    'domains.cleanupNone': 'All domains are working well',
    'domains.cleanupError': 'Error cleaning up domains',
    'domains.autoDetectDesc': 'Extension works automatically with domains starting with ://animevietsub.*/',
    'domains.testing': 'Testing...',
    'domains.testingConnection': 'Testing connection to domains...',
    'domains.testResults': 'Test Results:',
    'domains.connectionSuccess': 'Connection successful',
    'domains.connectionCors': 'Accessible (CORS restricted)',
    'domains.cleanupConfirm': 'Do you want to check and remove non-working domains? ({count} domains will be checked)',
    'domains.loadError': 'Error loading domain list',
    'domains.updateError': 'Cannot update domain list',
    'domains.removeConfirm': 'Are you sure you want to remove domain "{domain}"?',
    'domains.cleanupTooltip': 'Check and remove non-working domains'
  }
};

// Built-in domains that are always supported
const BUILTIN_DOMAINS = [
  'https://animevietsub.show' // Tên miền chính, các tên miền khác sẽ được tự động phát hiện
];

let customDomains = [];
let currentLanguage = 'vi';
let isDarkMode = false;

// Translation utility functions
function translate(key) {
  return domainTranslations[currentLanguage][key] || key;
}

function updatePageLanguage() {
  // Update all elements with data-translate attribute
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    const translation = translate(key);
    element.innerHTML = translation;
  });

  // Update placeholders
  document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
    const key = element.getAttribute('data-translate-placeholder');
    const translation = translate(key);
    element.placeholder = translation;
  });

  // Update theme toggle text
  const themeText = document.getElementById('themeText');
  if (themeText) {
    themeText.textContent = translate(isDarkMode ? 'domains.lightMode' : 'domains.darkMode');
  }
}

function switchLanguage(lang) {
  currentLanguage = lang;
  updatePageLanguage();
  
  // Save preference
  chrome.storage.sync.set({ language: lang });
}

function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-theme', isDarkMode);
  
  // Update theme button
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (themeIcon && themeText) {
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    themeText.textContent = translate(isDarkMode ? 'domains.lightMode' : 'domains.darkMode');
  }
  
  // Save preference
  chrome.storage.sync.set({ darkMode: isDarkMode });
}

// Load saved preferences
async function loadPreferences() {
  try {
    const result = await chrome.storage.sync.get(['language', 'darkMode']);
    
    if (result.language) {
      currentLanguage = result.language;
      document.getElementById('languageSelect').value = currentLanguage;
    }
    
    if (result.darkMode !== undefined) {
      isDarkMode = result.darkMode;
      document.body.classList.toggle('dark-theme', isDarkMode);
      
      const themeIcon = document.getElementById('themeIcon');
      if (themeIcon) {
        themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
      }
    }
    
    updatePageLanguage();
  } catch (error) {
    console.error('Error loading preferences:', error);
  }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadPreferences();
  await loadDomains();
  renderDomainList();
  
  // Setup language selector
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      switchLanguage(e.target.value);
    });
  }

  // Setup theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Setup Enter key handler for input
  document.getElementById('newDomainInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addDomain();
    }
  });

  // Setup button event listeners
  document.getElementById('addDomainBtn').addEventListener('click', () => {
    addDomain();
  });

  document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
  });

  document.getElementById('testDomainsBtn').addEventListener('click', () => {
    testDomains();
  });

  document.getElementById('cleanupDomainsBtn').addEventListener('click', () => {
    cleanupInvalidDomains();
  });
});

// Load domains from storage
async function loadDomains() {
  try {
    console.log('Loading domains from storage...');
    const response = await chrome.runtime.sendMessage({ action: 'getCustomDomains' });
    console.log('Load domains response:', response);
    
    if (response && response.success) {
      customDomains = response.customDomains || [];
      console.log('Loaded custom domains:', customDomains);
    } else {
      console.error('Failed to load domains:', response);
      showMessage(translate('domains.loadError') + ': ' + (response?.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error loading domains:', error);
    showMessage(translate('domains.loadError') + ': ' + error.message, 'error');
  }
}

// Render the domain list
function renderDomainList() {
  const domainList = document.getElementById('domainList');
  domainList.innerHTML = '';

  // Add built-in domains
  BUILTIN_DOMAINS.forEach(domain => {
    const li = document.createElement('li');
    li.className = 'domain-item built-in';
    li.innerHTML = `
      <span class="domain-url">${domain}</span>
      <span class="domain-badge badge-builtin">${translate('domains.builtIn')}</span>
    `;
    domainList.appendChild(li);
  });

  // Add auto-detection info
  const autoDetectLi = document.createElement('li');
  autoDetectLi.style.backgroundColor = '#e3f2fd';
  autoDetectLi.style.border = '1px solid #2196F3';
  autoDetectLi.style.padding = '12px';
  autoDetectLi.style.borderRadius = '6px';
  autoDetectLi.style.margin = '8px 0';
  autoDetectLi.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <div>
        <div style="font-weight: bold; color: #1976d2;">${translate('domains.autoDetected')}</div>
        <div style="font-size: 12px; color: #666;">
          ${translate('domains.autoDetectDesc')}
        </div>
      </div>
      <span class="domain-badge" style="background: #2196F3; color: white;">AUTO</span>
    </div>
  `;
  domainList.appendChild(autoDetectLi);

  // Add custom domains
  customDomains.forEach((domain, index) => {
    const li = document.createElement('li');
    li.className = 'domain-item custom';
    
    const domainUrl = document.createElement('span');
    domainUrl.className = 'domain-url';
    domainUrl.textContent = domain;
    
    const actionsDiv = document.createElement('div');
    
    const badge = document.createElement('span');
    badge.className = 'domain-badge badge-custom';
    badge.textContent = translate('domains.custom');
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = translate('domains.remove');
    removeBtn.onclick = function() {
      console.log('Button clicked, removing domain at index:', index);
      removeDomain(index);
    };
    
    actionsDiv.appendChild(badge);
    actionsDiv.appendChild(removeBtn);
    
    li.appendChild(domainUrl);
    li.appendChild(actionsDiv);
    
    domainList.appendChild(li);
  });

  // Show message if no custom domains
  if (customDomains.length === 0) {
    const li = document.createElement('li');
    li.style.textAlign = 'center';
    li.style.padding = '20px';
    li.style.color = '#666';
    li.style.fontStyle = 'italic';
    li.innerHTML = translate('domains.noCustomDomains');
    domainList.appendChild(li);
  }

  // Update cleanup button state
  const cleanupBtn = document.getElementById('cleanupDomainsBtn');
  if (cleanupBtn) {
    cleanupBtn.disabled = customDomains.length === 0;
    if (customDomains.length === 0) {
      cleanupBtn.title = translate('domains.cleanupNone');
    } else {
      const domainCountText = currentLanguage === 'vi' ? 
        `${customDomains.length} tên miền` : 
        `${customDomains.length} domain${customDomains.length > 1 ? 's' : ''}`;
      cleanupBtn.title = `${translate('domains.cleanupTooltip')} (${domainCountText})`;
    }
  }
}

// Add new domain
async function addDomain() {
  const input = document.getElementById('newDomainInput');
  const domainValue = input.value.trim();
  
  if (!domainValue) {
    showMessage(translate('domains.invalidDomain'), 'error');
    return;
  }

  // Normalize domain URL
  let normalizedDomain;
  try {
    if (!domainValue.startsWith('http://') && !domainValue.startsWith('https://')) {
      normalizedDomain = `https://${domainValue}`;
    } else {
      normalizedDomain = domainValue;
    }

    // Validate URL
    const url = new URL(normalizedDomain);
    
    // Check if domain is already in built-in or custom list
    const allDomains = [...BUILTIN_DOMAINS, ...customDomains];
    if (allDomains.includes(normalizedDomain)) {
      showMessage(translate('domains.domainExists'), 'error');
      return;
    }

    // Check if it's a reasonable domain for AnimeVietSub
    if (!url.hostname.includes('anime') && !url.hostname.includes('avs')) {
      const confirmed = confirm(
        `Tên miền "${url.hostname}" có vẻ không phải của AnimeVietSub. Bạn có chắc muốn thêm?`
      );
      if (!confirmed) return;
    }

  } catch (error) {
    showMessage(translate('domains.invalidDomain'), 'error');
    return;
  }

  // Add to custom domains
  customDomains.push(normalizedDomain);
  
  try {
    // Save to storage
    const response = await chrome.runtime.sendMessage({ 
      action: 'updateCustomDomains', 
      customDomains: customDomains 
    });
    
    if (response.success) {
      showMessage(translate('domains.addSuccess'), 'success');
      input.value = '';
      renderDomainList();
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Error adding domain:', error);
    showMessage(translate('domains.addError') + ': ' + error.message, 'error');
    // Remove from local array on error
    customDomains.pop();
  }
}

// Remove domain
async function removeDomain(index) {
  console.log('removeDomain called with index:', index);
  console.log('customDomains length:', customDomains.length);
  console.log('customDomains:', customDomains);
  
  if (index < 0 || index >= customDomains.length) {
    console.error('Invalid index for removeDomain:', index);
    showMessage('Lỗi: Index không hợp lệ', 'error');
    return;
  }

  const domainToRemove = customDomains[index];
  console.log('Domain to remove:', domainToRemove);
  
  const confirmed = confirm(translate('domains.removeConfirm').replace('{domain}', domainToRemove));
  
  if (!confirmed) return;

  // Store backup before removing
  const backupDomains = [...customDomains];
  
  // Remove from array
  customDomains.splice(index, 1);
  console.log('After splice, customDomains:', customDomains);
  
  try {
    // Save to storage
    const response = await chrome.runtime.sendMessage({ 
      action: 'updateCustomDomains', 
      customDomains: customDomains 
    });
    
    console.log('Update response:', response);
    
    if (response && response.success) {
      showMessage(translate('domains.removeSuccess'), 'success');
      renderDomainList();
    } else {
      throw new Error(response?.error || 'Không nhận được response hợp lệ');
    }
  } catch (error) {
    console.error('Error removing domain:', error);
    showMessage(translate('domains.removeError') + ': ' + error.message, 'error');
    // Restore from backup on error
    customDomains = backupDomains;
    renderDomainList();
  }
}

// Test domains connectivity
async function testDomains() {
  const testBtn = document.getElementById('testDomainsBtn');
  const originalText = testBtn.textContent;
  
  testBtn.disabled = true;
  testBtn.innerHTML = '<span class="loading"></span>' + translate('domains.testing');
  
  showMessage(translate('domains.testingConnection'), 'info');
  
  const allDomains = [...BUILTIN_DOMAINS, ...customDomains];
  const results = [];
  
  for (const domain of allDomains) {
    try {
      const response = await fetch(domain, { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      results.push({ domain, status: 'success', message: translate('domains.connectionSuccess') });
    } catch (error) {
      // In no-cors mode, we can't access the response, so any error might be CORS-related
      // We'll assume the domain is accessible but has CORS restrictions (which is normal)
      results.push({ domain, status: 'cors', message: translate('domains.connectionCors') });
    }
  }
  
  // Show results
  let resultMessage = '<strong>' + translate('domains.testResults') + '</strong><br>';
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '⚠️';
    resultMessage += `${icon} ${result.domain}: ${result.message}<br>`;
  });
  
  showMessage(resultMessage, 'info');
  
  testBtn.disabled = false;
  testBtn.textContent = translate('domains.testConnection');
}

// Show message function
function showMessage(message, type = 'info') {
  const container = document.getElementById('messageContainer');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.innerHTML = message;
  
  container.innerHTML = '';
  container.appendChild(messageDiv);
  
  // Auto-remove after 5 seconds for success/error messages
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// Cleanup invalid domains
async function cleanupInvalidDomains() {
  const cleanupBtn = document.getElementById('cleanupDomainsBtn');
  const originalText = cleanupBtn.textContent;
  
  if (customDomains.length === 0) {
    const cleanupBtn = document.getElementById('cleanupDomainsBtn');
    if (cleanupBtn) {
      cleanupBtn.title = translate('domains.cleanupNone');
    }
    return;
  }

  const confirmed = confirm(translate('domains.cleanupConfirm').replace('{count}', customDomains.length));
  if (!confirmed) return;

  cleanupBtn.disabled = true;
  cleanupBtn.innerHTML = '<span class="loading"></span>' + translate('domains.cleanupStarting');
  
  showMessage(translate('domains.cleanupStarting'), 'info');
  
  const validDomains = [];
  const invalidDomains = [];
  
  for (const domain of customDomains) {
    try {
      console.log(`Checking domain: ${domain}`);
      
      // Try to fetch the domain with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(domain, { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      validDomains.push(domain);
      console.log(`✅ ${domain} - OK`);
      
    } catch (error) {
      // Check if it's a timeout or network error (invalid domain)
      if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
        invalidDomains.push(domain);
        console.log(`❌ ${domain} - INVALID (${error.message})`);
      } else {
        // CORS errors are normal and indicate the domain is accessible
        validDomains.push(domain);
        console.log(`✅ ${domain} - OK (CORS restricted but accessible)`);
      }
    }
  }
  
  // Update custom domains with only valid ones
  if (invalidDomains.length > 0) {
    try {
      customDomains = validDomains;
      
      const response = await chrome.runtime.sendMessage({ 
        action: 'updateCustomDomains', 
        customDomains: customDomains 
      });
      
      if (response && response.success) {
        const message = translate('domains.cleanupSuccess').replace('{count}', invalidDomains.length);
        showMessage(
          `✅ ${message}:<br>` +
          invalidDomains.map(d => `• ${d}`).join('<br>') +
          `<br><br>🎉 Còn lại ${validDomains.length} tên miền hoạt động tốt.`, 
          'success'
        );
        renderDomainList();
      } else {
        throw new Error(response?.error || translate('domains.updateError'));
      }
    } catch (error) {
      console.error('Error updating domains after cleanup:', error);
      showMessage(translate('domains.cleanupError') + ': ' + error.message, 'error');
    }
  } else {
    showMessage(translate('domains.cleanupNone'), 'success');
  }
  
  cleanupBtn.disabled = false;
  cleanupBtn.textContent = translate('domains.cleanup');
}

// Test background script connection
async function testBackgroundConnection() {
  try {
    showMessage('Testing background connection...', 'info');
    
    // Test basic connection
    const debugResponse = await chrome.runtime.sendMessage({ action: 'debugStorage' });
    console.log('Debug storage response:', debugResponse);
    
    // Test getCustomDomains
    const getResponse = await chrome.runtime.sendMessage({ action: 'getCustomDomains' });
    console.log('Get custom domains response:', getResponse);
    
    // Test updateCustomDomains with current data
    const updateResponse = await chrome.runtime.sendMessage({ 
      action: 'updateCustomDomains',
      customDomains: customDomains 
    });
    console.log('Update custom domains response:', updateResponse);
    
    showMessage('Background connection test completed. Check console for details.', 'success');
    
  } catch (error) {
    console.error('Background connection test failed:', error);
    showMessage('Background connection failed: ' + error.message, 'error');
  }
}

// Export functions for debugging
window.addDomain = addDomain;
window.removeDomain = removeDomain;
window.testDomains = testDomains;
window.cleanupInvalidDomains = cleanupInvalidDomains;
window.testBackgroundConnection = testBackgroundConnection;