# Xử lý traffic

Thuộc: [Kiến trúc](index.md).

Mục tiêu: 100 user cùng lúc, tổng ~10.000 user ([Spec tổng §3](../index.md#mục-tiêu-tải) · gói Supabase: [supabase-plans.md](supabase-plans.md)).

```mermaid
flowchart LR
  subgraph Clients["~100 máy cùng lúc"]
    D1["Máy 1"]
    D2["Máy 2"]
    Dn["Máy n"]
  end

  subgraph AppSide["Giảm request ở app"]
    C1["Cache TanStack Query<br/>retry 1 lần"]
    C2["Chỉ tải khoảng ngày đang xem"]
    C3["Lặp / âm lịch / lễ tính trên máy"]
    C4["touch_device ≤ 1 lần / 5 phút<br/>kéo Google ≤ 1 lần / 5 phút"]
  end

  subgraph DBSide["Giảm tải DB"]
    I1["Index (user_id, span_start)"]
    I2["Index notes keyset<br/>(user_id, pinned, updated_at, id)"]
    I3["RLS dùng (select auth.uid())<br/>tính 1 lần / truy vấn"]
    I4["Không offset, không quét toàn bảng"]
  end

  D1 & D2 & Dn --> AppSide --> PostgREST["Supabase PostgREST"] --> DBSide --> PG[("Postgres")]
  D1 & D2 & Dn -->|"token của từng user,<br/>quota Google tính theo user"| GCal["Google Calendar"]
```

| Cơ chế | Tác dụng |
| --- | --- |
| Không server riêng, không trạng thái chung giữa user | Không có điểm nghẽn ngoài Supabase; mỗi user chỉ chạm dòng của mình |
| Event lặp lưu 1 dòng | DB ~10–50 KB/user → 100–500 MB cho 10.000 user (sát 500 MB, theo dõi) |
| Truy vấn theo khoảng ngày + index | Đọc lịch tháng chỉ vài chục dòng/user |
| Google `429` / `rateLimitExceeded` | Chờ tăng dần rồi thử lại (lúc đẩy hàng loạt) |
| Kiểm tra tải mỗi sprint | DB local, seed 10.000 user, 100 user ảo × 5 phút → 0 lỗi, p95 < 1 s ([S2 db.md](../sprint-2/design/db.md#kiểm-tra-tải)) |
