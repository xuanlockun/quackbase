# Learning: Quy Trình Quản Lý Yêu Cầu & Spec-Driven Development (AI-Native)

Tài liệu này đúc kết kinh nghiệm xử lý các kịch bản thực tế khi làm việc với AI trong dự án Edge CMS, tập trung vào việc quản trị sự thay đổi và tối ưu hóa Prompt phân rã.

---

## Mục lục
1. [Rào trước kịch bản "Khách hàng bổ sung/quên yêu cầu"](#1-rào-trước-kịch-bản-khách-hàng-bổ-sungquên-yêu-cầu)
2. [Prompt Thần Thánh: Phân rã Doc thành Đặc tả](#2-prompt-thần-thánh-phân-rã-doc-thành-đặc-tả-spec)
3. [Quy trình "Bơm Context" cho AI Code](#3-quy-trình-bơm-context-cho-ai-code)
4. [Bảng kiểm soát rủi ro](#4-bảng-kiểm-soát-rủi-ro-checklist)

---

## 1. Rào trước kịch bản: "Khách hàng bổ sung/quên yêu cầu"

Khi quy trình đã chạy đến bước AI code (Bước 8) mà khách hàng đòi thêm tính năng hoặc sửa logic, đừng sửa trực tiếp vào Code. Hãy áp dụng quy tắc **"Impact - Spec - Sync"**.

### 1.1 Phân tích tác động (Impact Analysis)

Trước khi cập nhật, hãy hỏi AI để kiểm tra độ "vênh":

> **Prompt:**  
> "Tôi có yêu cầu mới là [Nội dung]. Dựa trên file README.md (quy trình hiện tại) và các file Spec trong thư mục /specs, yêu cầu mới này có xung đột với logic RBAC hay cấu trúc D1 hiện tại không? Liệt kê các file bị ảnh hưởng."

### 1.2 Chiến lược cập nhật Spec

| Mức độ | Hành động |
|--------|-----------|
| **Nhỏ** (< 20% logic) | Cập nhật trực tiếp vào Spec hiện tại + block `## UPDATE [YYYY-MM-DD]` |
| **Lớn** (> 20% logic) | Tạo Spec mới (vd: `009-refactor-xxx.md`) + đánh dấu Spec cũ `DEPRECATED` |

### 1.3 Kịch bản "Khách hàng quên" thường gặp (Rào trước)

> **Prompt phòng ngừa (Bước 4):**  
> "Dựa trên quy trình nghiệp vụ CMS này, hãy đóng vai một Tester khó tính để liệt kê các trường hợp khách hàng thường quên nhưng kỹ thuật cần phải có:
> - Cơ chế Soft Delete hay Hard Delete?
> - Rate limit cho API login?
> - Kích thước tối đa bài viết/hình ảnh trong D1?
> - Logic xử lý slug trùng lặp?"

---

## 2. Prompt Thần Thánh: Phân rã Doc thành Đặc tả (Spec)

### Prompt Template:

```plaintext
# Role: Senior Solution Architect & AI Prompt Engineer

# Context: Tôi có tài liệu "Yêu cầu rõ ràng" và "Quy trình nghiệp vụ" cho dự án Edge CMS.
# Input: [Dán nội dung phần 2 và 3 của README vào đây]

# Task: Phân rã dự án thành các Feature-sized Specs.

# Yêu cầu đầu ra cho mỗi Spec:
1. ID & Tên
2. Data Schema (D1)
3. API Routes
4. Logic Constraints
5. UI Admin Requirements
6. Edge Cases (>= 3 tình huống)
```

---

## 3. Quy trình "Bơm Context" cho AI Code

### Cấu trúc 3 lớp:

```yaml
Layer 1 - Global Context:
  "Đây là dự án Edge CMS (Astro + D1). Xem README.md để hiểu kiến trúc chung."

Layer 2 - Feature Context:
  "Chúng ta đang làm Spec 005-content-i18n. Đây là file đặc tả: [Nội dung Spec]."

Layer 3 - Current Task:
  "Bây giờ, hãy thực hiện Task con: 'Viết API POST cho việc lưu bản dịch bài viết'."
```

---

## 4. Bảng kiểm soát rủi ro (Checklist)

| Giai đoạn | Rủi ro | Giải pháp |
|-----------|--------|------------|
| Phân rã Spec | Spec quá to, AI bị cắt ngang | Chia spec < 200 dòng code |
| Nghiệp vụ | Khách đòi quay lại logic cũ | Git commit sau mỗi Spec |
| Dữ liệu | Sửa schema mất dữ liệu cũ | Kèm `migration.sql` mỗi Spec |
| Đa ngôn ngữ | Giao diện bị trống | Fallback (EN → VI) ngay từ Spec i18n |
```

### 📦 **Phần 2/3** (Mục 5 đến hết 7.5)

```markdown
## 5. Mẹo Spec-Driven để AI không "ngáo" logic

> **Prompt xác nhận trước khi code:**  
> "Trước khi viết code, hãy tóm tắt lại luồng dữ liệu (Data Flow) từ User request → D1 response dựa trên Spec tôi vừa đưa."

---

## 6. Quy trình làm việc chi tiết theo ngày

### 6.1 Quy trình 8 bước chuẩn

| Bước | Hoạt động | Output | Người thực hiện |
|------|-----------|--------|-----------------|
| 1 | Thu thập yêu cầu nghiệp vụ | BRD | PO/Khách hàng |
| 2 | Phân tích kỹ thuật sơ bộ | Technical Feasibility Note | Tech Lead |
| 3 | Viết User Stories & Acceptance Criteria | User Stories | PO + Tech Lead |
| 4 | Xác định yêu cầu phi chức năng | NFR Checklist | Technical Architect |
| 5 | **Phân rã Spec (dùng Prompt Thần Thánh)** | Các file `.md` trong `/specs` | AI + Tech Lead |
| 6 | Review Spec với khách hàng | Spec đã approve | Khách hàng + Team |
| 7 | Tạo migration scripts | `migration/*.sql` | AI |
| 8 | AI Code theo từng Spec | Source code | AI + Developer review |

### 6.2 Quy trình xử lý change request

```text
Change Request
     │
     ▼
Impact Analysis
     │
     ├─── Nhỏ (<20%) ──→ Update Spec + đánh dấu UPDATE ──→ Re-run AI Code ──→ Test + Deploy
     │
     └─── Lớn (>20%) ──→ Tạo Spec mới + DEPRECATED cũ ──→ Re-run AI Code ──→ Test + Deploy
```

### 6.3 Daily workflow khuyến nghị

```markdown
**Buổi sáng (09:00 - 10:00):** Review code AI từ hôm qua + chạy test
**Buổi sáng (10:00 - 11:30):** Phân rã Spec mới (dùng Prompt Thần Thánh)
**Buổi trưa (11:30 - 13:30):** AI chạy code (để máy làm việc)
**Buổi chiều (13:30 - 15:00):** Review output AI + điều chỉnh
**Buổi chiều (15:00 - 16:30):** Họp với khách hàng xác nhận Spec
**Buổi chiều (16:30 - 17:30):** Commit + Deploy lên staging
```

---

## 7. Kỹ năng nâng cao khi làm việc với AI

### 7.1 Kỹ năng viết Prompt phân cấp (Hierarchical Prompting)

```markdown
❌ **Prompt dở:**
"Viết cho tôi một CMS hoàn chỉnh"

✅ **Prompt hay (phân cấp 3 tầng):**
"Tầng 1: Hãy liệt kê các module cần có của một CMS
 Tầng 2: Với module Auth, hãy chi tiết hóa các chức năng con
 Tầng 3: Bây giờ, viết code cho chức năng Login với session-based"
```

### 7.2 Kỹ năng "Prompt Chaining" (Xâu chuỗi Prompt)

```markdown
**Prompt 1 (Phân tích):** "Phân tích file requirements.md, output ra 5 module chính"

**Prompt 2 (Thiết kế):** "Với module 1 (Auth), hãy thiết kế database schema"

**Prompt 3 (Code):** "Dựa trên schema vừa có, viết API Register"

**Prompt 4 (Test):** "Viết unit test cho API Register vừa tạo"

**Prompt 5 (Doc):** "Tự động sinh OpenAPI documentation từ code"
```

### 7.3 Kỹ năng "Few-shot Prompting" cho Spec

```markdown
**Cung cấp ví dụ trước khi yêu cầu:**

"Đây là một Spec mẫu cho tính năng Login:

---
ID: 001-Auth-Login
API: POST /api/login
Input: { email, password }
Output: { token, user }
Constraints: Rate limit 5 lần/phút, lock sau 3 lần sai
---

Bây giờ, hãy tạo Spec tương tự cho tính năng Forgot Password"
```

### 7.4 Kỹ năng "Self-Correction" (Tự sửa lỗi)

```markdown
**Khi AI trả lời sai, thay vì nói "sai rồi", hãy dùng cấu trúc:**

"Bạn vừa trả lời [Nội dung]. 
Tôi nhận thấy có vấn đề ở [điểm X] vì [lý do Y].
Hãy giải thích lại logic của bạn, sau đó sửa theo hướng [Z]."
```

### 7.5 Kỹ năng "Context Compression" (Nén ngữ cảnh)

> **Prompt:**  
> "File README.md hiện tại dài 500 dòng. Hãy tóm tắt thành 10 bullet points quan trọng nhất, tập trung vào: kiến trúc, database schema, và API endpoints."
```

### 📦 **Phần 3/3** (Mục 7.6 đến hết)

```markdown
### 7.6 Kỹ năng "Spec Validation" (Xác nhận Spec)

```markdown
**Prompt kiểm tra Spec trước khi code:**

"Hãy đóng vai một Senior Developer phản biện Spec 005-content-i18n. 
Chỉ ra 3 điểm thiếu sót hoặc mơ hồ trong Spec này, đề xuất cách sửa."
```

### 7.7 Kỹ năng "Test Generation First" (Tạo test trước)

```markdown
**Nguyên tắc: Test trước - Code sau**

Prompt: "Dựa trên Spec 003-post-crud, hãy viết test case cho API PUT /api/posts/:id 
TRƯỚC KHI viết code implementation. Bao gồm: 
- Happy path
- Unauthorized
- Not found
- Validation error"
```

### 7.8 Kỹ năng "Parallel Prompting" (Song song hóa)

```markdown
**Thay vì:**
"Viết API cho User, Post, và Category"

**Hãy tách thành 3 prompt chạy song song:**
Prompt A: "Viết API User (CRUD)"
Prompt B: "Viết API Post (CRUD)"  
Prompt C: "Viết API Category (CRUD)"
```

### 7.9 Kỹ năng "Version Prompting" (Quản lý phiên bản prompt)

```markdown
**Lưu lại các prompt đã dùng:**

/specs/
  /prompts/
    001-spec-generation-v1.md
    001-spec-generation-v2.md (cải tiến)
    002-impact-analysis-v1.md

**Khi prompt cũ không hiệu quả, hãy nói:**
"Hãy dùng phiên bản prompt v2 thay vì v1, vì v2 có thêm yêu cầu về edge cases"
```

### 7.10 Kỹ năng "Role Stacking" (Chồng vai)

```markdown
**Yêu cầu AI đóng nhiều vai cùng lúc:**

"Hãy đóng vai:
1. **Product Owner** - viết user stories
2. **Technical Architect** - thiết kế database
3. **Security Expert** - review lỗ hổng
4. **Tester** - viết test cases

Sau đó tổng hợp thành Spec hoàn chỉnh."
```

---

## 8. Checklist trước khi bắt đầu mỗi Spec

```markdown
[ ] Đã đọc lại Spec ít nhất 1 lần?
[ ] Đã chạy Impact Analysis với các Spec khác?
[ ] Đã có migration.sql cho thay đổi DB?
[ ] Đã xác định được dependency với Spec khác?
[ ] Đã có test cases trước?
[ ] Đã commit code hiện tại để có thể rollback?
[ ] Đã thông báo cho team về Spec sắp làm?
```

---

## 9. Tổng kết: 10 nguyên tắc vàng

| # | Nguyên tắc | Mô tả |
|---|------------|-------|
| 1 | **Spec First** | Không code khi chưa có Spec |
| 2 | **Impact Always** | Mọi thay đổi đều phải phân tích tác động |
| 3 | **Small is Beautiful** | Spec < 200 dòng code |
| 4 | **Test Before Code** | Viết test trước, code sau |
| 5 | **Git Commit per Spec** | Commit sau mỗi Spec hoàn thành |
| 6 | **Migration Mandatory** | Thay đổi DB = phải có migration |
| 7 | **Fallback Ready** | i18n phải có fallback |
| 8 | **Context 3 Layers** | Global → Feature → Task |
| 9 | **Self-Correction** | Để AI tự sửa lỗi thay vì nói "sai" |
| 10 | **Version Prompts** | Lưu lại lịch sử prompt để cải tiến |

---

## 10. Phụ lục: Mẫu Spec chuẩn

```markdown
# Spec 001: User Authentication & RBAC

## Metadata
- **ID:** 001-Auth-RBAC
- **Status:** Draft | Approved | Implemented | Deprecated
- **Dependencies:** None
- **Version:** 1.0.0

## Data Schema
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Routes
| Method | Path | Input | Output |
|--------|------|-------|--------|
| POST | /api/auth/login | { email, password } | { token, user } |
| POST | /api/auth/logout | { token } | { success } |

## Logic Constraints
- Admin: full access
- Editor: create/edit posts only
- Viewer: read only

## Edge Cases
1. Rate limiting: 5 attempts/minute
2. Account lock after 3 failed attempts (15 minutes)
3. Session timeout after 8 hours

## Migration
```sql
-- 001-add-users-table.sql
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX idx_users_email ON users(email);
```

## 11. AI Output Validation Layer (Bắt buộc trước Deploy)

Sau khi AI sinh code, KHÔNG được deploy ngay. 
Phải đi qua lớp kiểm tra tự động để đảm bảo code tuân thủ Spec.

### 11.1 Schema Validation

- Sử dụng Zod hoặc TypeBox để validate input/output
- Mapping trực tiếp từ Spec → schema

**Ví dụ:**
- Spec định nghĩa: `{ email: string }`
- Code phải có validator tương ứng

---

### 11.2 Contract Testing (OpenAPI)

- Tự động generate OpenAPI từ Spec hoặc code
- So sánh:
  - API thực tế vs Spec
- Fail nếu mismatch

---

### 11.3 Lint Rules bắt buộc

- ESLint / Biome rules:
  - Không hardcode role
  - Không bypass validation
  - Không query DB trực tiếp ngoài service layer

---

### 11.4 CI Check: Spec vs Code

Trong pipeline CI:

- Parse Spec (`/specs/*.md` hoặc `.yaml`)
- So sánh với:
  - API routes thực tế
  - DB schema
- Nếu lệch → fail build

---

### 11.5 Nguyên tắc

- ❌ Không có validation → không merge
- ❌ Không pass CI → không deploy
- ✅ Spec là source of truth

## 12. Spec Lifecycle & State Management

Mỗi Spec phải có trạng thái rõ ràng để kiểm soát việc AI code và thay đổi.

### 12.1 Các trạng thái

| State | Ý nghĩa | Có được code không? |
|-------|--------|---------------------|
| Draft | Đang viết | ❌ |
| Review | Đang review nội bộ | ❌ |
| Approved | Đã thống nhất với team/khách | ✅ |
| In Development | AI đang code | ✅ |
| Implemented | Đã code xong | ✅ |
| Deprecated | Không còn dùng | ❌ |
| Archived | Lưu trữ | ❌ |

---

### 12.2 Rule bắt buộc

- ❌ Không được AI code khi Spec chưa `Approved`
- ❌ Không sửa trực tiếp Spec `Implemented`
- ✅ Nếu thay đổi lớn → tạo Spec mới + mark Spec cũ `Deprecated`
- ✅ Mỗi Spec phải có version (`v1.0`, `v1.1`, ...)

---

### 12.3 Metadata mẫu

```markdown
## Metadata
- **ID:** 005-content-i18n
- **Status:** Approved
- **Version:** 1.1.0
- **Last Updated:** 2026-04-07
- **Dependencies:** 003-post-crud