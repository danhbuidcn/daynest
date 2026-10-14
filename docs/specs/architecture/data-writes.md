# Ghi dữ liệu: không trùng, không mất

Thuộc: [Kiến trúc](index.md).

Spec: [S3](../sprint-3/index.md) (idempotency) · [S6 §1, §5](../sprint-6/index.md#1-lưu-nhanh) (lưu nhanh, Hoàn tác).

## Lưu form

Form chờ server ghi xong rồi mới đóng (~1 lượt gọi). Server trả về dòng đã lưu → đặt thẳng vào cache, **không tải lại**.

```mermaid
flowchart TD
  Save(["Bấm Lưu"]) --> Online{"Có mạng?"}
  Online -->|Không| Block["Banner mất mạng<br/>nút Lưu bị khoá"]
  Online -->|Có| New{"Tạo mới?"}

  New -->|Có| Gen["id = uuid, sinh lúc mở form"] --> Ins["upsert (id, …) onConflict id"]
  Ins -->|"Gửi lại / bấm 2 lần"| Dup["Cùng id → ghi lại đúng dòng đó<br/>không tạo bản 2"]
  Ins -->|OK| Done

  New -->|"Sửa"| Upd["update … where id = :id<br/>and updated_at = :đã_đọc"]
  Upd -->|"1 dòng"| Done["Đặt dòng đã lưu vào mọi khoảng ngày<br/>đang có trong cache · đóng form<br/>đẩy lên Google (nếu bật) · đặt lại nhắc"]
  Upd -->|"0 dòng"| Conflict["Hộp Đã thay đổi ở thiết bị khác<br/>Tải bản mới / Ghi đè"]

  Ins & Upd -->|"42501"| Forbidden["Hỏi lại session_active()"]
  Forbidden -->|false| Out["Đăng xuất + hộp báo"]
  Forbidden -->|true| Toast["Toast lỗi theo loại, giữ form"]
  Ins & Upd -->|"Hết 15 s / 5xx / lỗi khác"| Toast
```

- Ghi **không tự thử lại** (người dùng bấm lại; `id` app sinh nên không trùng). Đọc mới tự thử lại ([errors.md](errors.md)).
- "Đặt dòng đã lưu vào cache" là hàm thuần, có test: thêm mới, sửa, đổi ngày sang khoảng khác, xoá. Event / todo lặp: đặt dòng quy tắc vào mọi khoảng nó chạm → app tự trải lần lặp. "Chỉ lần này": đặt ngoại lệ cùng cách.
- Lần tải kế tiếp kiểm lại với server ở nền.
- `updated_at` giữ nguyên chuỗi API trả về (không đổi qua `Date`, tránh mất micro giây → so sánh sai).
- Sửa kiểu lặp / ngày bắt đầu → xoá ngoại lệ cũ (ngày gốc không còn khớp).
- Tick todo: hiện ngay trên máy, gửi server; lỗi → trả về như cũ + toast.

## Xoá: Hoàn tác 4 s

Event, todo (cả "Chỉ lần này" và "Tất cả"), khoản chi. Không còn hộp xác nhận xoá; event / todo lặp vẫn có hộp "Chỉ lần này / Tất cả".

```mermaid
flowchart LR
  Del(["Bấm Xoá"]) --> Hide["Bỏ khỏi cache ngay<br/>toast Đã xoá · Hoàn tác"]
  Hide -->|"Bấm Hoàn tác"| Back["Đặt lại vào cache<br/>không gửi gì"]
  Hide -->|"Hết 4 s"| Send["Gửi lệnh xoá<br/>(cả Google nếu event đang đồng bộ)"]
  Hide -->|"App ra nền"| Send
  Send -->|"Lỗi"| Restore["Hiện lại + toast lỗi"]
```

- Mất mạng → nút Xoá bị khoá, nên không có lệnh xoá chờ mạng.
- Note: xoá vào thùng rác (`deleted_at`), khôi phục được — không dùng Hoàn tác 4 s. Xoá nhóm chi tiêu, quy tắc khoản chi lặp: vẫn có hộp xác nhận.

## Mất mạng

Online-only: mất mạng chỉ xem dữ liệu đã có trên máy. **Mọi thao tác ghi bị khoá** ở mọi màn (Lưu, Xoá, tick todo, tick ngày có kinh, Gửi báo lỗi) bằng 1 hook chung. Ngoại lệ: đổi giao diện vẫn được trên máy, có mạng lại thì lưu lên tài khoản.

## Danh sách

Notes, thùng rác: phân trang **keyset** `(pinned, updated_at, id)` → không lặp / sót khi dữ liệu đổi lúc đang cuộn.
