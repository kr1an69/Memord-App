# 📋 NHẬT KÝ TIẾN ĐỘ & KẾ HOẠCH BÁO CÁO SEMINAR (LEADER PROGRESS TRACKER)

> **Dành riêng cho:** Nhóm trưởng  
> **Mục tiêu tối thượng:** Hoàn thiện App Memord chạy mượt mà và chuẩn bị 50 slide thuyết trình trước tối Thứ 5 tuần sau.

---

## ⏳ LỊCH TRÌNH ĐẾM NGƯỢC (TIMELINE ĐẾN TỐI THỨ 5)

| Ngày | Kế hoạch trọng tâm | Trạng thái |
| :--- | :--- | :---: |
| **Hôm nay (Thứ 5)** | Khởi tạo Project, cấu trúc `src/`, `.prettierrc`, tạo 3 file `.md` và push lên GitHub. | 🟡 Đang làm |
| **Thứ 6** | Cài đặt Navigation, tạo Mock Data & Tầng API Service (`memeApi.js`). Giao việc và hướng dẫn 4 bạn tạo branch. | ⚪ Chưa bắt đầu |
| **Thứ 7 - CN** | 4 bạn tập trung code 4 màn hình theo `PROJECT_CONTEXT.md`. Nhóm trưởng hỗ trợ gỡ lỗi và kiểm tra tiến độ. | ⚪ Chưa bắt đầu |
| **Thứ 2** | Gom code (Merge code) các branch của từng bạn vào nhánh `develop`. Chạy thử toàn bộ luồng app trên máy ảo. | ⚪ Chưa bắt đầu |
| **Thứ 3** | Fix lỗi phát sinh, tối ưu giao diện app cho đẹp mắt. Bắt đầu làm Slide thuyết trình (Canva / PowerPoint). | ⚪ Chưa bắt đầu |
| **Thứ 4** | Hoàn thiện 50 slide seminar. Nhóm họp online tổng duyệt khớp giờ (30 phút, mỗi bạn nói ~6 phút). | ⚪ Chưa bắt đầu |
| **Tối Thứ 5** | **DEMO APP & BÁO CÁO SEMINAR VỚI THẦY VÕ TẤN TOÀN** 🎯 | ⚪ Chưa bắt đầu |

---

## 👥 BẢNG THEO DÕI TIẾN ĐỘ 5 THÀNH VIÊN

| STT | Thành viên | Chức năng / Branch | Trạng thái Code | Trạng thái Slide | Ghi chú / Lỗi cần sửa |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | Nhóm trưởng | `setup/base-project` | 🟡 Đang setup | ⚪ Chưa | Xây dựng sườn Nav + API |
| **2** | Bạn 2 | `feature/home-feed` | ⚪ Chưa nhận | ⚪ Chưa | HomeScreen (Lưới 2 cột) |
| **3** | Bạn 3 | `feature/search-filter`| ⚪ Chưa nhận | ⚪ Chưa | Search & Filter |
| **4** | Bạn 4 | `feature/meme-detail` | ⚪ Chưa nhận | ⚪ Chưa | DetailScreen (Like, Share) |
| **5** | Bạn 5 | `feature/favorites` | ⚪ Chưa nhận | ⚪ Chưa | FavoritesScreen (Bộ sưu tập)|

---

## 📊 KẾ HOẠCH PHÂN BỔ 50 SLIDE SEMINAR (THỜI LƯỢNG 30 PHÚT)

Thầy yêu cầu: **Seminar ~30 phút, tất cả 5 thành viên đều phải thuyết trình, khoảng 50 slides bao gồm cả phần Demo**.

### Phân chia 5 người thuyết trình:

#### 🎤 Phần 1: Giới thiệu & Tổng quan về React Native (10 Slides - ~6 phút)
* **Người trình bày:** Thành viên 1 (Nhóm trưởng)
* **Nội dung:**
  * Giới thiệu nhóm và đề tài Memord (2 slides).
  * Lập trình Mobile truyền thống (Java/Kotlin trên Android, Swift trên iOS) và lý do ra đời của Cross-Platform (2 slides).
  * React Native là gì? Lịch sử phát triển và các ứng dụng nổi tiếng sử dụng (2 slides).
  * Kiến trúc cốt lõi của React Native (JavaScript Engine, React Native Bridge / JSI, Native UI Elements) (3 slides).
  * So sánh nhanh React Native vs Flutter vs Java/Kotlin thuần (1 slide).

#### 🎤 Phần 2: Cấu trúc Project & Môi trường Phát triển (10 Slides - ~6 phút)
* **Người trình bày:** Thành viên 2
* **Nội dung:**
  * Môi trường phát triển: Node.js, Expo vs React Native CLI thuần (2 slides).
  * Giải thích chi tiết cây thư mục dự án chuẩn (`assets/`, `src/screens`, `src/navigation`, `src/api`) (3 slides).
  * Chuẩn hóa mã nguồn trong dự án nhóm: `.prettierrc`, quy ước Git Branching (2 slides).
  * Các thành phần cơ bản trong React Native: JSX, `<View>`, `<Text>`, `<Image>`, `<FlatList>`, StyleSheet (3 slides).

#### 🎤 Phần 3: Cơ chế Dữ liệu & Tầng API không cần Database (10 Slides - ~6 phút)
* **Người trình bày:** Thành viên 3
* **Nội dung:**
  * Giải thích tiêu chí đề tài: "Ứng dụng Client-driven không cần máy chủ Database" (2 slides).
  * Thiết kế dữ liệu Meme: Cấu trúc JSON Object chuẩn (2 slides).
  * Cách kết nối REST API lấy Meme động theo từ khóa tìm kiếm (`fetch()`, cơ chế `keyword + " memes"`) (3 slides).
  * Xử lý bất đồng bộ (Async/Await), Loading indicator và cơ chế Fallback Mock Data khi rớt mạng (3 slides).

#### 🎤 Phần 4: Điều hướng & Các sự kiện tương tác người dùng (10 Slides - ~6 phút)
* **Người trình bày:** Thành viên 4
* **Nội dung:**
  * Cơ chế điều hướng trong React Native: Thư viện React Navigation (2 slides).
  * Thiết kế Bottom Tab Navigation (Home, Search, Favorites) (2 slides).
  * Native Stack Navigation: Truyền tham số dữ liệu giữa Trang A -> Trang B (`route.params`) (3 slides).
  * Xử lý bộ sự kiện tương tác người dùng (Events: Thả tim, Lưu danh sách, Native Share hộp thoại điện thoại) (3 slides).

#### 🎤 Phần 5: Demo Thực tế App Memord & Tổng kết (10 Slides - ~6 phút)
* **Người trình bày:** Thành viên 5 (Cả nhóm cùng hỗ trợ thao tác máy ảo)
* **Nội dung:**
  * Trực tiếp trình chiếu App Memord trên máy ảo Android / điện thoại thật qua Expo Go (5 slides kịch bản demo: Lướt Feed -> Tìm kiếm theo tag -> Vào chi tiết -> Bấm like/share -> Vào mục yêu thích xem lại).
  * Thuận lợi và khó khăn khi nhóm sinh viên mới bắt đầu với React Native (2 slides).
  * Hướng phát triển trong tương lai (2 slides).
  * Lời cảm ơn và Q&A với Thầy cùng các bạn (1 slide).
