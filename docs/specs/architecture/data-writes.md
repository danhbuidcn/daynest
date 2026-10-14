# Ghi dữ liệu: không trùng, không mất

Thuộc: [Kiến trúc](index.md).

```mermaid
flowchart TD
  Save(["Bấm Lưu"]) --> Online{"Có mạng?"}
  Online -->|Không| Block["Banner mất mạng<br/>khoá nút Lưu"]
  Online -->|Có| New{"Tạo mới?"}

  New -->|Có| Gen["id = uuid, sinh lúc mở form"] --> Ins["upsert (id, …) onConflict id"]
  Ins -->|"Gửi lại / bấm 2 lần"| Dup["Cùng id → ghi lại đúng dòng đó<br/>không tạo bản 2"]
  Ins -->|OK| Done

  New -->|"Sửa"| Upd["update … where id = :id<br/>and updated_at = :đã_đọc"]
  Upd -->|"1 dòng"| Done["onSuccess: đẩy lên Google (nếu bật)<br/>đặt lại toàn bộ nhắc<br/>làm mới cache (invalidate)"]
  Upd -->|"0 dòng"| Conflict["ConflictError<br/>→ Xung đột"]

  Ins & Upd -->|"42501"| Forbidden["ForbiddenError<br/>→ hỏi lại session_active()"]
  Forbidden -->|false| Out["Đăng xuất + hộp báo"]
  Forbidden -->|true| Toast["Toast lỗi, giữ form"]
  Ins & Upd -->|"Lỗi mạng"| Toast
```

- `updated_at` giữ nguyên chuỗi API trả về (không đổi qua `Date`, tránh mất micro giây → so sánh sai).
- Sửa kiểu lặp / ngày bắt đầu → xoá ngoại lệ cũ (ngày gốc không còn khớp).
- Danh sách (notes, thùng rác): phân trang **keyset** `(pinned, updated_at, id)` → không lặp / sót khi dữ liệu đổi lúc đang cuộn.
