# AniSync - AniList Sync Extension

<div align="center">

**Tự động đồng bộ tiến độ xem anime từ AnimeVietsub lên AniList**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-lightgreen?style=for-the-badge)](https://github.com/Anichan-Projects/AniSync)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

### Tổng quan

AniSync là Chrome Extension đơn giản giúp tự động đồng bộ tiến độ xem anime từ AnimeVietsub lên tài khoản AniList của bạn với giao diện và tính năng đơn giản.

### Tính năng

#### Đồng bộ

- **Tự động phát hiện**: Nhận diện anime và episode đang xem
- **Đồng bộ tức thời**: Cập nhật tiến độ ngay khi hoàn thành episode  
- **Hoàn thành tự động**: Tự động đánh dấu "Completed" khi xem hết anime
- **Đồng bộ thủ công**: Nút sync thủ công khi cần thiết

#### Bảo mật & Riêng tư

- **OAuth2 Authentication**: Đăng nhập an toàn với AniList
- **Tự cấu hình**: Người dùng tự nhập Client ID/Secret
- **Không lưu trữ**: Không thu thập dữ liệu cá nhân
- **Mã nguồn mở**: Transparent và có thể kiểm tra

#### Tùy chỉnh linh hoạt  

- **Cài đặt chi tiết**: Bật/tắt từng tính năng
- **Thông báo**: Tùy chỉnh hiển thị notification
- **Hoạt động công khai**: Chọn chia sẻ hoạt động với cộng đồng

### Cài đặt & Thiết lập

#### Bước 1: Cài đặt Extension

> [!NOTE]  
> Extension này không phát hành ở ChromeStore. Lưu ý.

##### Cài đặt thủ công (Developer Mode)

1. Tải source code:

   ```bash
   git clone https://github.com/Anichan-Projects/AniSync.git
   cd AniSync
   ```

   Hoặc [Download zip](https://github.com/Anichan-Projects/AniSync/archive/refs/heads/main.zip) và giải nén

2. Mở Chrome Extensions:
   - Vào `chrome://extensions/`
   - Bật "Developer mode"
   - Chọn "Load unpacked" → chọn thư mục AniSync

#### Bước 2: Thiết lập AniList API

1. **Tạo AniList Application**:
   - Truy cập [AniList Developer Settings](https://anilist.co/settings/developer)
   - Nhấn "Create New Client"
   - Điền tên ứng dụng (ví dụ: "My AniSync Extension")

2. **Cấu hình Redirect URL**:
   - Copy URL từ setup page của extension
   - Format: `https://[extension-id].chromiumapp.org/`
   - Paste vào "Redirect URL" trên AniList

3. **Lưu thông tin**:
   - Copy Client ID và Client Secret
   - Paste vào form trong extension setup page
   - Nhấn "Save Configuration"

#### Bước 3: Kết nối và sử dụng

1. **Authentication**:
   - Nhấn icon AniSync trên toolbar
   - Chọn "Connect to AniList"
   - Đăng nhập và cấp quyền

2. **Bắt đầu xem anime**:
   - Extension tự động phát hiện và đồng bộ

#### Cấu trúc Project

```
AniSync/
├── manifest.json              # Extension manifest
├── background.js             # Service worker & API logic
├── content.js               # Content script
├── popup.html              # Main popup interface  
├── popup.js               # Popup functionality
├── setup.html            # Initial setup page
├── setup.js             # Setup page logic
├── icons/              # Extension icons
│   └── iconX.png
└── README.md          # This file
```

### Cách hoạt động

#### Phát hiện Anime

1. **Title Detection**: Ưu tiên tên tiếng Anh, fallback tên tiếng Việt
2. **Episode Parsing**: Tự động lấy số episode từ URL và page content
3. **Smart Matching**: So sánh với database AniList để tìm anime chính xác

#### Đồng bộ Progress

1. **Video Monitoring**: Theo dõi video player events
2. **Progress Calculation**: Tính toán % xem và thời gian
3. **API Integration**: Gọi AniList GraphQL API để cập nhật
4. **Status Management**: Tự động chuyển WATCHING → COMPLETED

### API Reference

#### AniList GraphQL Endpoints

##### Search Anime

```graphql
query SearchAnime($search: String) {
  Media(search: $search, type: ANIME) {
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
    }
  }
}
```

##### Update Progress  

```graphql
mutation UpdateProgress($mediaId: Int, $progress: Int, $status: MediaListStatus, $private: Boolean) {
  SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status, private: $private) {
    id
    progress 
    status
    media {
      title {
        romaji
      }
    }
  }
}
```

##### Get Current User

```graphql
query GetCurrentUser {
  Viewer {
    id
    name
    avatar {
      large
    }
  }
}
```

### Xử lý Lỗi & Debug

#### Lỗi thường gặp

1. **"Could not establish connection"**
   - Kiểm tra extension đã load đúng chưa
   - Restart browser nếu cần

2. **"Authentication failed"**  
   - Xác minh Client ID/Secret đúng
   - Kiểm tra Redirect URL khớp chính xác

3. **"Anime not found"**
   - Thử sync thủ công
   - Kiểm tra tên anime trên AniList

#### Debug Mode

Mở DevTools Console để xem logs chi tiết:

```javascript
// Logs từ content script
console.log('Starting anime detection...')
console.log('Found anime:', animeTitle)

// Logs từ background script  
console.log('API Response:', response)
```

### Đóng góp

Team hoan nghênh mọi đóng góp, cứ pull đi.

#### Coding Standards

- JavaScript ES6+
- JSDoc comments cho functions
- Consistent naming conventions

### 📄 License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.

### Credits & Acknowledgments

- **AniList**: API và database anime

---
> [!NOTE]  
> Vì đa số là vibe code nên comment code chưa chuẩn, mọi người thông cảm.

> [!WARNING]  
> Extension này được tạo ra để phục vụ cộng đồng miễn phí, nếu thấy ai đó bán extension này, liên hệ với chúng tôi tại [Discord](https://discord.gg/PE29XWTTc5).

<div align="center">
Made with ❤️ by the Ani Team
</div>
