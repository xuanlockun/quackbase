<p>
  <a href="./README.md"><img src="https://img.shields.io/badge/Language-English-0f172a?style=for-the-badge" alt="English README"></a>
  <a href="./README.vi.md"><img src="https://img.shields.io/badge/Ngon_ngu-Tieng_Viet-dc2626?style=for-the-badge" alt="README tiếng Việt"></a>
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

**Quackbase là một runtime CMS cho Astro, được vận hành bởi Cloudflare Workers và D1.**

Xây dựng website hướng nội dung nhanh gọn mà không cần dựng server riêng, không phải lắp backend truyền thống, và không cần trả tiền cho database trước khi dự án của bạn có người dùng.

Quackbase mang đến giao diện admin gọn gàng, khả năng chỉnh sửa nội dung khi hệ thống đang chạy, và quy trình deploy lên Cloudflare nhỏ gọn, sắc nét, và rất dễ đưa vào sản xuất.

## Tại sao là Quackbase?

Phần lớn các bộ CMS hiện nay đều quá nặng, quá tốn kém, hoặc quá phức tạp khi deploy.

Quackbase được xây dựng quanh một ý tưởng đơn giản hơn:

> Website Astro của bạn nên vẫn nhanh, nội dung nên chỉnh sửa được khi đang chạy, và hạ tầng nên gọn nhẹ đến mức có thể bỏ vào túi.

Không cần thẻ tín dụng.  
Không cần server.  
Không cần quy trình nhà cung cấp rườm rà.  
Không lòng vòng.

Chỉ cần Astro, Cloudflare Workers, D1, và một lớp CMS nhỏ gọn không cản trở bạn.

## Bạn nhận được gì

- **Chỉnh sửa nội dung runtime**  
  Cập nhật page, bài viết, và nội dung có cấu trúc mà không cần build lại toàn bộ website mỗi lần.

- **Deploy native với Cloudflare**  
  Chạy trên Cloudflare Workers với D1 làm lớp database.

- **Kiến trúc ưu tiên Astro**  
  Được thiết kế cho dự án Astro, không phải chắp vá cho một CMS tổng quát.

- **Giao diện admin gọn gàng**  
  Trải nghiệm chỉnh sửa đơn giản để quản lý nội dung mà không cần động vào code.

- **Nhanh ngay từ mặc định**  
  Đặt gần edge, stack nhẹ và ít bộ phận phụ.

- **Mã nguồn mở, dễ hack dễ tùy biến**  
  TypeScript xuyên suốt. Fork nó, tùy biến nó, phá nó, biến nó thành của bạn.

## Phù hợp cho

Quackbase hợp với:

- blog
- trang tài liệu
- landing page
- changelog
- portfolio
- website startup
- sản phẩm nhỏ nhiều nội dung
- dự án indie cần CMS nhưng không muốn gánh nặng

## Không hướng tới

Quackbase được giữ chủ đích là nhỏ gọn.

Có thể nó sẽ không phải lựa chọn phù hợp nếu bạn cần:

- chuỗi phê duyệt workflow cấp doanh nghiệp
- đội biên tập rất lớn
- hệ thống phân quyền multi-tenant phức tạp
- một bản thay thế WordPress với vô số plugin

Dự án này dành cho những ai muốn một thứ gọn, dễ hiểu, dễ deploy.

## Công nghệ sử dụng

- **Astro 5**
- **TypeScript**
- **Cloudflare Workers**
- **Cloudflare D1**
- **Wrangler**

## Cài đặt

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/xuanlockun/astro-blog-starter-template)

Deploy và thiết lập tài khoản admin tại `/admin`.

## Tính năng

### Nền tảng cốt lõi
- **Edge-First**: Xây dựng cho Cloudflare Workers với hiệu năng toàn cầu
- **Developer-Centric**: Ưu tiên TypeScript và thân thiện với admin
- **AI-Friendly**: Cấu trúc code dễ mở rộng
- **Modern Stack**: Astro 5, Cloudflare D1, R2, Bootstrap 5
- **Fast & Lightweight**: Tối ưu cho nội dung runtime, không phải các lần rebuild nặng nề

### Quản lý nội dung
- **Posts and Pages**: Tạo và sửa nội dung runtime
- **Site Settings**: Quản lý tiêu đề, logo, favicon, và cấu hình media
- **Draft / Publish Flow**: Kiểm soát nội dung trước khi lên sóng
- **Localized Content**: Nội dung đa ngôn ngữ và slug bản địa hóa
- **Modular Admin**: Settings, media, pages, roles, users, và languages

### Quản lý media
- **Media Library**: Tải lên và quản lý tài nguyên từ bảng admin
- **R2 / S3-Compatible**: Hoạt động với Cloudflare R2 hoặc bucket tương thích S3
- **DB-Backed Settings**: Cấu hình media được lưu trong database
- **Secret Toggle**: Hiển thị access key đã lưu khi cần
- **Test Connection**: Kiểm tra thông tin media ngay trong settings

## Bao gồm những gì

| Khu vực | Edge CMS |
|--|--|
| **Runtime content** | Yes |
| **Cloudflare Workers** | Yes |
| **Cloudflare D1** | Yes |
| **Media uploads** | Yes |
| **RBAC** | Yes |
| **Multilingual UI** | Yes |
| **Localized content** | Yes |
| **Database-backed settings** | Yes |

## Dành cho lập trình viên ứng dụng

## Database và migrations

Repository hiện tách migrations thành hai thư mục:

- `migrations/` - bootstrap migrations thực tế cho cài đặt mới
- `migrations-dev/` - lịch sử SQL cũ và migrations dùng cho local/test

Wrangler trỏ đến `migrations/` theo mặc định, nên các cài đặt mới sẽ áp dụng file bootstrap trước.

## Cấu trúc dự án

```text
.
|-- locales/
|-- migrations/
|-- migrations-dev/
|-- public/
|-- src/
|   |-- components/
|   |-- layouts/
|   |-- lib/
|   `-- pages/
|-- tests/
`-- wrangler.json
```

## Tài liệu

- [Astro](https://astro.build/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

## Giấy phép

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Credit

From V1t with love

Cảm ơn [Mr. Hieu](https://www.linkedin.com/in/hieu-ha-ngoc) đã truyền cảm hứng cho dự án này.

<img src="docs/V1t_.png" alt="V1t" height="120"> X <img src="docs/allxone.webp" alt="AllXOne" height="40">
