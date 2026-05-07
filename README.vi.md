<p>
  <a href="./README.md"><img src="https://img.shields.io/badge/Language-English-0f172a?style=for-the-badge" alt="English README"></a>
  <a href="./README.vi.md"><img src="https://img.shields.io/badge/Ngôn_ngữ-Tiếng_Việt-dc2626?style=for-the-badge" alt="README tiếng Việt"></a>
</p>

<h1 style="display: flex; align-items: center; gap: 10px;">
  <img src="docs/quackbase.png" alt="V1t" height="40">
  <span>Quackbase</span>
</h1>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5-black.svg)](https://astro.build/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020.svg)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1-F38020.svg)](https://developers.cloudflare.com/d1/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/xuanlockun/astro-blog-starter-template)

<img src="docs/d5677d11-feb4-4bcc-9a67-eb5525620533.png" alt="Demo" height="420">

**Quackbase là một runtime CMS gọn nhẹ dành cho Astro, chạy trên Cloudflare Workers và D1.**

Triển khai website định hướng nội dung thật nhanh mà không cần tự vận hành server, ghép thêm một backend riêng, hay trả tiền hạ tầng quá sớm khi dự án còn chưa chứng minh được giá trị.

Quackbase mang đến khả năng chỉnh sửa nội dung trực tiếp khi chạy, giao diện quản trị gọn gàng, và mô hình triển khai chuẩn Cloudflare đủ nhẹ, đủ nhanh, đủ dễ để ship.

## ✨ Vì sao là Quackbase?

Phần lớn CMS hiện nay quá nặng, quá đắt, hoặc quá phiền để triển khai.

Quackbase được xây dựng dựa trên một ý tưởng đơn giản hơn:

> Website Astro của bạn nên luôn nhanh, nội dung nên chỉnh sửa được ngay khi chạy, và hạ tầng nên nhỏ gọn đến mức bỏ túi được.

💳 Không cần thẻ tín dụng.  
🖥️ Không cần server riêng.  
🧾 Không cần nghi thức rườm rà với vendor.  
🦆 Không cần bullsh*t.

Chỉ cần Astro, Cloudflare Workers, D1, và một lớp CMS nhỏ gọn không đứng cản đường bạn.

## 🎁 Bạn nhận được gì

| Thành phần | Mô tả |
| --- | --- |
| Chỉnh sửa nội dung khi chạy | Cập nhật trang, bài viết và nội dung có cấu trúc mà không cần rebuild toàn bộ website mỗi lần thay đổi. |
| Triển khai theo hệ sinh thái Cloudflare | Chạy trên Cloudflare Workers với D1 làm lớp cơ sở dữ liệu. |
| Kiến trúc ưu tiên Astro | Được thiết kế riêng cho dự án Astro, không phải kiểu ghép tạm từ một CMS tổng quát. |
| Admin UI gọn gàng | Trải nghiệm quản trị đơn giản để quản lý nội dung mà không cần đụng vào code. |
| Nhanh ngay từ mặc định | Chạy sát edge, stack nhẹ và ít thành phần phải vận hành. |
| Mã nguồn mở, dễ tùy biến | TypeScript xuyên suốt. Bạn có thể fork, chỉnh sửa, phá đi, rồi biến nó thành của riêng mình. |

## 🎯 Phù hợp cho

Quackbase đặc biệt phù hợp với:

| Loại dự án | Vì sao phù hợp |
| --- | --- |
| Blog | Xuất bản và chỉnh sửa nội dung trực tiếp mà không vướng rebuild liên tục. |
| Trang tài liệu | Giữ hệ thống tài liệu nhẹ, nhanh và dễ cập nhật. |
| Landing page | Quản lý nội dung marketing bằng một luồng admin đơn giản. |
| Changelog | Đăng cập nhật sản phẩm nhanh với cấu trúc nội dung rõ ràng. |
| Portfolio | Duy trì website cá nhân chỉn chu mà không cần backend cồng kềnh. |
| Website startup | Di chuyển nhanh với stack nhỏ và ít độ phức tạp khi vận hành. |
| Sản phẩm nhỏ nhưng nhiều nội dung | Quản lý page và post gọn gàng mà không bị phình như các CMS nặng. |
| Dự án indie | Có thêm lớp CMS mà không phải gánh theo cả một nền tảng truyền thống. |

## 🚫 Không hướng tới

Quackbase được chủ ý giữ nhỏ gọn.

Nó có thể không phải lựa chọn phù hợp nếu bạn cần:

- chuỗi phê duyệt nội dung kiểu enterprise
- đội ngũ biên tập rất lớn
- hệ thống phân quyền multi-tenant phức tạp
- một bản thay thế WordPress với cả rừng plugin

Dự án này dành cho những ai muốn một thứ tinh gọn, dễ hiểu và dễ triển khai.

## ⚙️ Cài đặt

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/xuanlockun/astro-blog-starter-template)

Triển khai và thiết lập tài khoản quản trị tại `/admin`.

## 🚀 Tính năng

### Nền tảng cốt lõi
- **⚡ Edge-First**: Xây dựng cho Cloudflare Workers với hiệu năng toàn cầu
- **🔧 Thân thiện với lập trình viên**: Ưu tiên TypeScript và dễ làm việc trong admin
- **🤖 Dễ mở rộng cho AI**: Cấu trúc code rõ ràng, thuận tiện để mở rộng
- **📱 Stack hiện đại**: Astro 5, Cloudflare D1, R2, Bootstrap 5
- **🚀 Nhanh và gọn nhẹ**: Tối ưu cho nội dung runtime thay vì phụ thuộc vào rebuild nặng nề

### Quản lý nội dung
- **📝 Bài viết và trang**: Tạo và chỉnh sửa nội dung runtime
- **🎛️ Cài đặt website**: Quản lý tiêu đề, logo, favicon và cấu hình media
- **📚 Luồng nháp / xuất bản**: Kiểm soát nội dung trước khi đưa lên live
- **🌍 Nội dung đa ngôn ngữ**: Hỗ trợ nội dung bản địa hóa và slug theo ngôn ngữ
- **🧩 Admin theo mô-đun**: Settings, media, pages, roles, users và languages

### Quản lý media
- **🖼️ Thư viện media**: Upload và quản lý tài nguyên ngay trong trang quản trị
- **☁️ Tương thích R2 / S3**: Hoạt động với Cloudflare R2 hoặc các bucket tương thích S3
- **🔐 Cấu hình lưu trong DB**: Thiết lập media được lưu trong cơ sở dữ liệu
- **👁️ Hiện / ẩn khóa bí mật**: Có thể xem lại access key đã lưu khi cần
- **🧪 Kiểm tra kết nối**: Xác thực thông tin media trực tiếp từ phần settings

## 🏗️ Kiến trúc

Quackbase đi theo kiến trúc edge-first đơn giản:

- **Astro** phụ trách giao diện, routing và render trang.
- **Cloudflare Workers** vận hành runtime của ứng dụng ở gần người dùng.
- **Cloudflare D1** lưu bài viết, trang, cài đặt và toàn bộ nội dung do admin quản lý.
- **Admin UI** nằm ngay trong cùng project, nên phần chỉnh sửa nội dung và phần phân phối website cùng nằm trong một codebase có thể deploy thống nhất.

Nhờ vậy hệ thống vẫn nhỏ gọn và thực dụng: một app Astro, một runtime ở edge, một database, và không cần duy trì thêm một CMS server riêng.

## 📚 Tài liệu

- [Tài liệu dự án](https://quackbase.v1t.site/)
- [Astro](https://astro.build/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

## 📄 Giấy phép

Phát hành theo giấy phép MIT. Xem chi tiết tại [LICENSE](LICENSE).

## 🤝 Ghi nhận

From V1t with love ❤️

Cảm ơn [Mr. Hieu](https://www.linkedin.com/in/hieu-ha-ngoc) đã truyền cảm hứng cho dự án này.

<img src="docs/V1t_.png" alt="V1t" height="120"> X <img src="docs/allxone.webp" alt="AllXOne" height="40">
