# PROJECT CONTEXT: MEMORD APP (FOR TEAM MEMBERS & AI AGENTS) 🤖

> **Mục đích tài liệu:** Cung cấp toàn bộ bối cảnh kỹ thuật, kiến trúc mã nguồn, quy ước code và hướng dẫn chi tiết từng chức năng. Các thành viên trong nhóm có thể sao chép (copy) tài liệu này đưa vào các AI Agent (như Antigravity, ChatGPT, Claude, Cursor) để AI sinh code chính xác 100% theo chuẩn của nhóm.

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

* **Tên ứng dụng:** Memord (Meme Discovery Mobile App - Phong cách Pinterest)
* **Framework:** React Native (Expo SDK 57)
* **Ngôn ngữ:** JavaScript thuần (ES6+, JSX) - **KHÔNG dùng TypeScript** để giữ tính đồng nhất và đơn giản cho nhóm.
* **Mô hình Dữ liệu:** Không dùng Database nội bộ (No SQLite / Realm / Firebase). Dữ liệu được fetch từ REST API qua hàm Service tập trung tại `src/api/memeApi.js`, kết hợp fallback dữ liệu dự phòng từ `src/constants/mockMemes.js`.
* **Điều hướng (Navigation):** React Navigation (gồm Bottom Tab Navigator và Native Stack Navigator).

---

## 2. QUY ƯỚC LẬP TRÌNH & CẤU TRÚC THƯ MỤC (CODE CONVENTIONS)

### A. Phạm vi làm việc của từng thành viên:
* Mỗi thành viên chịu trách nhiệm tại đúng thư mục màn hình của mình:
  * Bạn 2: `src/screens/HomeScreen/`
  * Bạn 3: `src/screens/SearchFilterScreen/`
  * Bạn 4: `src/screens/DetailScreen/`
  * Bạn 5: `src/screens/FavoritesScreen/`
* **Quy tắc vàng:** Không tự ý chỉnh sửa file `App.js` hay thư mục `src/navigation/` để tránh xung đột Git (Merge Conflict). Mọi yêu cầu liên kết màn hình do Nhóm trưởng điều phối.

### B. Chuẩn định dạng Code (`.prettierrc`):
* Thụt đầu dòng: 2 spaces.
* Luôn kết thúc lệnh bằng dấu chấm phẩy `;`.
* Dùng dấu nháy đơn `'...'` cho chuỗi ký tự.
* Tạo UI bằng các thành phần cơ bản của React Native: `<View>`, `<Text>`, `<Image>`, `<TouchableOpacity>`, `<FlatList>`, `<TextInput>`, `<ActivityIndicator>`.
* Tạo kiểu dáng (Styles) bằng `StyleSheet.create({ ... })` đặt ở cuối file component.

---

## 3. CẤU TRÚC DỮ LIỆU ĐỐI TƯỢNG MEME (DATA SCHEMA)

Tất cả các màn hình và API đều thống nhất sử dụng cấu trúc Object chuẩn sau đây cho mỗi Meme:

```javascript
{
  id: 'meme_01',                         // Chuỗi định danh duy nhất (string)
  title: 'Bug in Production',            // Tiêu đề của meme (string)
  imageUrl: 'https://i.imgur.com/...',   // Đường dẫn ảnh trực tiếp (string)
  author: 'dev_guy',                     // Tên tác giả hoặc nguồn (string)
  likes: 1250,                           // Số lượt thích (number)
  category: 'Programmer',                // Thể loại: Programmer | Anime | Cat | Gaming | Trending
  width: 400,                            // Chiều rộng gốc ảnh (hỗ trợ lưới Pinterest)
  height: 500                            // Chiều cao gốc ảnh
}
```

---

## 4. TẦNG DỊCH VỤ DỮ LIỆU (API SERVICE FLOW)

File `src/api/memeApi.js` cung cấp các hàm dùng chung:
* `fetchTrendingMemes()`: Lấy danh sách meme thịnh hành hiển thị tại `HomeScreen`.
* `searchMemes(query, category)`: Tự động ghép từ khóa `query + " memes"` hoặc lọc theo category để lấy danh sách meme cho `SearchFilterScreen`.
* **Cơ chế Fallback:** Khi mất mạng hoặc API bên ngoài bị nghẽn, hàm sẽ tự động trả về dữ liệu mẫu từ `src/constants/mockMemes.js` để đảm bảo app luôn có dữ liệu hiển thị lúc demo cho Thầy.

---

## 5. ĐẶC TẢ CHI TIẾT 5 CHỨC NĂNG (5 MODULES SPECIFICATION)

### 👤 Module 1 (Nhóm trưởng): Kiến trúc Sườn, Navigation & API
* **Thư mục:** `src/navigation/`, `src/api/`, `src/constants/`
* **Trách nhiệm:** 
  1. Cấu hình Tab Navigator ở đáy màn hình gồm các icon: *Home (Khám phá)*, *Search (Tìm kiếm)*, *Favorites (Bộ sưu tập)*.
  2. Cấu hình Stack Navigator để khi bấm vào 1 meme từ Home hoặc Search sẽ chuyển sang `DetailScreen`.
  3. Xây dựng file `src/api/memeApi.js` và `src/constants/mockMemes.js`.

---

### 👤 Module 2 (Thành viên 2): Màn hình Khám phá (HomeScreen)
* **Thư mục phụ trách:** `src/screens/HomeScreen/`
* **Nhiệm vụ:**
  1. Khi mở màn hình, gọi API lấy danh sách meme ban đầu.
  2. Hiển thị danh sách ảnh dạng lưới 2 cột so le kiểu Pinterest (gợi ý dùng `FlatList` với `numColumns={2}` hoặc component dạng Masonry).
  3. Xử lý trạng thái đang tải (Loading Indicator / `ActivityIndicator`) khi đang lấy ảnh.
  4. Hỗ trợ sự kiện kéo xuống để làm mới (Pull-to-Refresh) bằng `refreshControl`.
  5. Sự kiện bấm vào 1 thẻ Meme: Gọi `navigation.navigate('DetailScreen', { meme: item })` để chuyển sang trang chi tiết.

---

### 👤 Module 3 (Thành viên 3): Màn hình Tìm kiếm & Bộ lọc (SearchFilterScreen)
* **Thư mục phụ trách:** `src/screens/SearchFilterScreen/`
* **Nhiệm vụ:**
  1. Thanh tìm kiếm `<TextInput>`: Nhập từ khóa tìm kiếm (Event `onChangeText` hoặc `onSubmitEditing`).
  2. Dải nút tag danh mục nằm ngang (Horizontal Scroll): *Tất cả, Programmer, Cat, Anime, Gaming, Dark*. Khi click vào tag nào thì đổi màu active và lọc theo tag đó.
  3. Gọi hàm `searchMemes(keyword, selectedTag)` từ `src/api/memeApi.js`.
  4. Hiển thị kết quả tìm kiếm dạng danh sách. Nếu không có kết quả, hiển thị dòng thông báo: *"Không tìm thấy meme phù hợp"*.
  5. Bấm vào meme bất kỳ cũng chuyển sang `DetailScreen`.

---

### 👤 Module 4 (Thành viên 4): Màn hình Chi tiết Meme (DetailScreen)
* **Thư mục phụ trách:** `src/screens/DetailScreen/`
* **Nhiệm vụ:**
  1. Nhận dữ liệu `route.params.meme` được truyền sang từ `HomeScreen` hoặc `SearchFilterScreen`.
  2. Hiển thị ảnh Meme to, rõ nét, tiêu đề ảnh, tên tác giả, tag thể loại và số lượt thích.
  3. Xử lý các sự kiện tương tác người dùng:
     * **Nút Thả Tim (Like):** Bấm vào thì đổi màu tim (xám -> đỏ) và tăng số lượng like lên 1 đơn vị.
     * **Nút Lưu vào Bộ sưu tập:** Đổi icon thành "Đã lưu", gọi hàm lưu trữ tạm để `FavoritesScreen` hiển thị được.
     * **Nút Chia sẻ (Share):** Dùng module `Share.share(...)` có sẵn của React Native để mở hộp thoại chia sẻ của điện thoại.
     * **Nút Back (Quay lại):** Bấm để quay về trang trước đó (`navigation.goBack()`).

---

### 👤 Module 5 (Thành viên 5): Bộ sưu tập Meme Yêu thích (FavoritesScreen)
* **Thư mục phụ trách:** `src/screens/FavoritesScreen/`
* **Nhiệm vụ:**
  1. Hiển thị danh sách các Meme mà người dùng đã bấm nút "Lưu" ở trang Chi tiết.
  2. Hỗ trợ nút Xóa (biểu tượng thùng rác hoặc nút gỡ) để loại bỏ meme ra khỏi danh sách yêu thích.
  3. Giao diện thân thiện khi danh sách trống (Empty State): Hiển thị icon hình ảnh và thông báo *"Bạn chưa lưu meme nào cả! Hãy khám phá thêm nhé"* kèm nút bấm *"Khám phá ngay"* điều hướng về `HomeScreen`.

---

## 6. MẪU PROMPT CHO CÁC BẠN KHI DÙNG AI AGENT (PROMPT TEMPLATE)

Khi thành viên cần AI viết code cho phần của mình, hãy copy đoạn prompt mẫu này và gửi cho AI:

```markdown
Tôi đang phát triển ứng dụng mobile "Memord" (dạng Pinterest cho Meme) bằng React Native (JavaScript thuần, Expo SDK 57).
Tôi đang phụ trách Module: [Điền tên Module của bạn, ví dụ: Module 3 - SearchFilterScreen].
Dự án có cấu trúc thư mục và quy ước như sau:
- Thư mục làm việc của tôi: src/screens/[Tên_Thư_Mục_Của_Bạn]/
- Dữ liệu Meme có cấu trúc: { id, title, imageUrl, author, likes, category }
- Dùng StyleSheet thuần của React Native, style sạch sẽ, hiện đại.

Hãy viết code hoàn chỉnh cho file component của tôi để đáp ứng đầy đủ các yêu cầu:
[Liệt kê các yêu cầu cụ thể từ Mục 5 ở trên]
```
