# Memord - Meme Discovery Mobile App

> **Môn học:** Lập trình trên thiết bị di động (Mobile Programming)  
> **Giảng viên hướng dẫn:** Thầy Võ Tấn Toàn - Khoa CNTT, Trường Đại học Nông Lâm TP.HCM  
> **Đề tài Seminar:** Báo cáo tìm hiểu React Native, Cấu trúc dự án & Demo ứng dụng  
> **Tên ứng dụng:** Memord (Kết hợp giữa "Meme" và "Lord" - Pinterest Inspired)  

---

## 📱 Giới thiệu Ứng dụng (Overview)

**Memord** là một ứng dụng di động Android mang phong cách khám phá hình ảnh tương tự **Pinterest**, nhưng chuyên biệt dành cho các bạn yêu thích Memes.

### Điểm nổi bật:
* **Khám phá vô tận (Pinterest Grid):** Hiển thị danh sách Meme dưới dạng lưới 2 cột so le bắt mắt, cuộn mượt mà.
* **Tìm kiếm & Bộ lọc động:** Tìm kiếm meme theo từ khóa và lọc nhanh theo các chủ đề thịnh hành (Programmer/Dev, Cat, Anime, Dark Meme, Gaming...).
* **Tương tác trực quan:** Xem chi tiết ảnh kích thước đầy đủ, thả tim (Like), lưu vào bộ sưu tập cá nhân, chia sẻ nhanh sang các ứng dụng khác.
* **Kiến trúc Client-Driven Không Cần Database:** Dữ liệu được nạp động từ REST API, tối ưu hóa bộ nhớ tạm trên thiết bị, khởi động nhanh chóng.

---

## 👥 Danh sách Thành viên & Phân công Chức năng

| STT | Họ và Tên | Vai trò | Chức năng đảm nhiệm |
| :---: | :--- | :---: | :--- |
| 1 | *Trần Tuấn Anh* | **Nhóm trưởng** | **Kiến trúc nền tảng & Điều hướng:** Cấu trúc dự án, Navigation (Tabs & Stack), Tầng API Service & Mock Data, Quản lý Git. |
| 2 | *Phan Thành Đạt* | Thành viên | **Màn hình Khám phá (Home Feed):** Lưới ảnh 2 cột phong cách Pinterest, hiệu ứng Pull-to-Refresh, tải danh sách Meme ban đầu. |
| 3 | *Vũ Đăng Khoa* | Thành viên | **Màn hình Tìm kiếm & Bộ lọc (Search & Filter):** Thanh tìm kiếm từ khóa, dải tag danh mục, gọi API động và hiển thị kết quả. |
| 4 | *Trần Văn Đức* | Thành viên | **Màn hình Chi tiết (Meme Detail):** Xem ảnh độ phân giải cao, nút Thả Tim, Lưu vào bộ sưu tập, Chia sẻ hệ thống (Native Share). |
| 5 | *Trần Minh Hiếu* | Thành viên | **Bộ sưu tập Cá nhân (Favorites Board):** Quản lý danh sách các Meme đã lưu, thao tác xóa khỏi bộ sưu tập, giao diện Empty State. |

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

* **Framework:** [React Native](https://reactnative.dev/) (Expo SDK 57)
* **Ngôn ngữ:** JavaScript (ES6+)
* **Thư viện Điều hướng:** React Navigation (Bottom Tabs + Native Stack)
* **Phong cách UI:** React Native StyleSheet, Flexbox (Masonry Grid Layout)
* **Kiến trúc:** REST API Service Client (Không cần máy chủ Database nội bộ)

---

## 🚀 Hướng dẫn Cài đặt & Chạy Thử (Quick Start)

### 1. Yêu cầu Tiền đề (Prerequisites)
* Đã cài đặt **Node.js** (Phiên bản v20+ hoặc v22+ khuyến nghị)
* Máy ảo **Android Emulator** (qua Android Studio) hoặc điện thoại Android thật đã cài sẵn ứng dụng **Expo Go** (tải trên Google Play Store).

### 2. Cài đặt các thư viện (Dependencies)
Clone dự án về máy và mở terminal tại thư mục dự án:
```bash
git clone <URL_REPOSITORY>
cd memord
npm install
```

### 3. Khởi động Ứng dụng
```bash
npm start
```
* **Chạy trên Máy ảo Android Studio:** Nhấn phím `a` trên bàn phím terminal.
* **Chạy trên Điện thoại thật:** Dùng app **Expo Go** quét mã QR hiển thị trên màn hình terminal.
* **Chạy trên trình duyệt Web (Xem nhanh):** Nhấn phím `w`.

---

## 📁 Cấu trúc Thư mục Tổng quan (Project Structure)

```text
memord/
├── assets/                 # Logo, icons, splash screen của ứng dụng
├── src/
│   ├── api/                # Tầng gọi API lấy dữ liệu meme từ internet
│   ├── components/         # Các thành phần tái sử dụng (MemeCard, SearchBar...)
│   ├── constants/          # Dữ liệu mẫu (Mock data), hằng số màu sắc, theme
│   ├── navigation/         # Quản lý luồng điều hướng (TabNavigator, StackNavigator)
│   ├── screens/            # 5 Màn hình chính tương ứng 5 chức năng của 5 thành viên
│   │   ├── HomeScreen/
│   │   ├── SearchFilterScreen/
│   │   ├── DetailScreen/
│   │   ├── FavoritesScreen/
│   │   └── ProfileScreen/
│   └── utils/              # Các hàm tiện ích bổ trợ
├── .prettierrc             # Cấu hình chuẩn định dạng code chung cho nhóm
├── App.js                  # Điểm khởi động chính của ứng dụng
├── app.json                # Cấu hình định danh ứng dụng Expo
└── package.json            # Quản lý danh sách thư viện phụ thuộc
```
