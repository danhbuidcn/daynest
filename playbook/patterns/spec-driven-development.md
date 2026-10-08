# Spec-Driven Development (SDD)

Ý chính từ bài viết "Code ngày càng rẻ, spec ngày càng đắt giá" (user đọc, ghi 2026-09-28). Cách áp dụng vào workspace: [teamwork.md](../teamwork.md) mục 2.

## Ý chính

- **Bottleneck dịch chuyển.** Agent viết code rất nhanh. Câu hỏi không còn là "ai code nhanh hơn" mà là "ai mô tả đúng thứ cần xây, đủ rõ để người và AI cùng làm".
- **Spec là nguồn sự thật chung** xuyên suốt: Idea → Requirements → Spec → Design → Tasks → Code → Test → Release.
- **Mỗi lần diễn giải lại là mất ý định sản phẩm.** PM nói BA → BA viết → Dev hiểu lại → Dev prompt agent → QA diễn giải lại để test. AI làm nhanh hơn không sửa được việc này, còn làm sai nhanh hơn.
- **Spec là hợp đồng chung** của team, không riêng BA hay PM. Với agent, spec là hợp đồng giữa người và agent.
- **SPEC > AGENT.** Tool đổi được (Claude Code, Codex, Cursor…). Ý định sản phẩm không được nằm chết trong chat của 1 tool.
- **Acceptance criteria không chỉ để đọc:** AC → test case → test tự động / eval → quality gate.

## Spec tốt

| Tiêu chí | Nghĩa |
| --- | --- |
| Clear | Agent không phải đoán |
| Testable | Biết thế nào là Done |
| Traceable | Requirement nối được tới code và test |
| Living | Sản phẩm đổi → spec đổi theo |

Smarter, not longer. Anti-pattern: bộ tài liệu khổng lồ không ai cập nhật.

## Vai trò theo SDD

| Bước | Ai | Output |
| --- | --- | --- |
| WHY & WHAT | PM/PO | Problem, user, business outcome, scope, non-goals |
| Requirements | BA | Scenario, business rule, edge case, acceptance criteria |
| Design | Designer + Architect | UX flow, system boundary, API/data contract, NFR, quyết định kiến trúc |
| Implement | Agent + Dev | Nhận spec → chia task → code → chạy test → tạo PR |
| Verify | QA | AC → test case → test tự động → quality gate |
| Operate | DevOps/SRE | NFR (performance, security…) truy vết từ spec tới production |

## Cách thử

Không bắt đầu bằng framework lớn. Chọn 1 feature thật, đi: Problem → Requirements → AC → Technical design → Tasks → Agent implement → Tests → PR.

Đo 4 chỉ số, cần giảm:

- Rework.
- Hiểu sai requirement.
- Thời gian tới PR hợp lệ.
- Lỗi sau release.

Không giảm → spec đang tạo thủ tục, chưa tạo đòn bẩy.

## Giá trị của người dịch lên trên

Chọn đúng problem. Ra đúng quyết định. Thiết kế đúng hệ thống. Mô tả ý định đủ rõ. Kiểm chứng output đủ tốt.
