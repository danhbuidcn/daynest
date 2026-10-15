# 2026-10-15 — S7 bước 2: Bản `.aab` đầu cho thử nghiệm kín — ⏳ chờ bạn duyệt

Thuộc: [lộ trình code S7](2026-10-15-s7-code-plan.md) bước 2 · [Spec S7](../docs/specs/sprint-7/index.md) · việc của bạn: [todo thiết kế](2026-10-15-s7-design-and-code-plan.md#việc-của-bạn-xếp-theo-thứ-tự-làm-ngay-từ-hôm-nay-để-14-ngày-thử-nghiệm-bắt-đầu-sớm).

## Input

- Bạn (2026-10-15): "ok tiếp" (sau bước 1; bước 1 còn mục 6 chờ tài khoản phụ).

## Output

- 1 file `.aab` ký đúng, lên kênh thử nghiệm kín, **cài từ Play được và đăng nhập Google được** → đồng hồ 12 người × 14 ngày bắt đầu chạy.

## Context (đã xem lại)

| Phần | Hiện trạng | Hướng làm |
| --- | --- | --- |
| Build | `npm run release` **đã ra cả `.apk` lẫn `.aab`** (`bundleRelease`, cùng keystore) | Không cần viết script mới (kế hoạch cũ ghi "thêm script `.aab`" — bỏ) |
| Version | `app.config.ts`: `6.0.0` / `versionCode 9` (v6.0.0 đã phát hành) | Bản này `7.0.0` / `10` (có xoá tài khoản); không tag, không GitHub Release — chỉ cuối sprint mới làm |
| Chữ ký | Keystore release (SHA-1 `47:FA:…:93`) dùng cho OAuth client Android "release" | Play dùng **Play App Signing**: Google ký lại bằng khoá của Google → SHA-1 **khác** (xem rủi ro 1) |
| Đăng nhập | Chỉ Google; yêu cầu mạng | Play hỏi "Truy cập ứng dụng" → cần tài khoản thử cho người duyệt |
| Tính năng | Chưa có quảng cáo / Pro | Bản kín đầu sạch; khai Play **không có quảng cáo**, đổi khi lên bản có quảng cáo |

## Plan

- [ ] 1. **Đổi version** `7.0.0` / `versionCode 10` trong `app/app.config.ts` (không đổi chỗ khác).
- [ ] 2. **Build:** `cd app && npm run release` (kiểm SHA-1 tự động) → `dist/daynest-7.0.0-10.apk` + `.aab` · `apksigner verify --print-certs` ra SHA-1 release.
- [ ] 3. **Thử APK:** cài đè lên máy ảo và máy thật (`adb install -r`) → mở được, đăng nhập được, màn Xoá tài khoản vào được (không bấm xoá bằng tài khoản chính), dữ liệu cũ còn.
- [ ] 4. **Commit + push** `chore(release): v7.0.0 closed test build` — **không** tag, **không** GitHub Release.
- [ ] 5. **Bạn làm trên Play Console** (tôi hướng dẫn từng bước, chờ bạn báo): tạo app `com.danhbuidcn.daynest` · bật Play App Signing (mặc định) · kênh kín: Google Group 12–15 người · tải `.aab` · khai các mục Console bắt buộc (Data safety, độ tuổi 18+, quảng cáo = **không**, truy cập ứng dụng, chính sách quyền riêng tư = URL đã có) — bạn gửi tôi câu hỏi nào chưa rõ, tôi soạn đáp án (có dữ liệu sức khoẻ — chu kỳ).
- [ ] 6. **Thêm chữ ký của Play vào Google:** Play Console › Thiết lập › Chữ ký ứng dụng → lấy **SHA-1 của khoá ký ứng dụng** → Google Cloud › Credentials › tạo OAuth client Android mới (gói `com.danhbuidcn.daynest`, SHA-1 đó) → thêm Client ID mới vào Supabase › Auth › Google › Client IDs (giống cách đã làm với client "release", xem [build.md](../docs/specs/sprint-1/design/build.md)). Bạn làm trên web; tôi soạn từng bước + kiểm lại.
- [ ] 7. **Thử bản cài từ Play** bằng 1 tài khoản trong nhóm thử: cài được, **đăng nhập Google không lỗi `DEVELOPER_ERROR` (code 10)**. Lỗi → thường là SHA-1 ở bước 6 chưa đúng.
- [ ] 8. Ghi "cách đưa bản mới lên kênh kín" (bump version → `npm run release` → tải `.aab` → mời) vào `docs/` (1 mục ngắn trong `build.md`) + cập nhật lộ trình.

## Rủi ro

1. **Đăng nhập Google hỏng với bản cài từ Play** vì SHA-1 của Play khác SHA-1 keystore của bạn — rất hay gặp. Bước 6–7 xử lý; **phải thử trước khi mời 12 người**, nếu không cả nhóm không đăng nhập được và mất ngày.
2. **Người thử chưa nằm trong Test users của OAuth consent screen** (OAuth chưa xác minh): đăng nhập bị chặn "app chưa được xác minh" (xem việc 7 của bạn: thêm email người thử vào Test users, tối đa 100).
3. **Play Console có thể đòi khai nhiều mục trước khi cho tải lên kênh kín** (nội dung, đối tượng, dữ liệu…). Tôi chưa chắc mục nào bắt buộc ở bước này → làm theo danh sách của Console, báo tôi nội dung từng mục.
4. **Khai báo phải khớp bản build:** bản này không quảng cáo; khi đưa bản có quảng cáo (bước 9 lộ trình) phải sửa Data safety / khai quảng cáo / `AD_ID` trước.
5. Đồng hồ 14 ngày: theo kế hoạch vẫn tính khi đổi bản — tôi **chưa kiểm** điều này với Google; kiểm trên Play Console (mục yêu cầu thử nghiệm) trước khi mời người.

## Cần bạn quyết

1. Số bản `7.0.0` / `versionCode 10` được không? (Mọi bản S7 đều hiện `7.0.0`, chỉ `versionCode` tăng: 10, 11, 12…)
2. Bạn đã có tài khoản Play Console chưa? Chưa → việc 1–2 trong [todo thiết kế](2026-10-15-s7-design-and-code-plan.md) làm trước, tôi chạy bước 1–4 (build) trong lúc đó.
3. Tạo thêm 1 Gmail phụ (miễn phí, 2 phút): dùng để thử **xoá tài khoản thật** (bước 1 mục 6), làm **tài khoản thử cho người duyệt** Play ("Truy cập ứng dụng") và license tester sau này. Được không?

## Kết quả

- Chưa bắt đầu.
