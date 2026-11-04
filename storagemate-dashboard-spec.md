# Storagemate Dashboard — Spec dựng codebase (React + TypeScript + Vite + Tailwind)

> Mục tiêu: dựng lại **y hệt** bản thiết kế "Storagemate dashboard thống kê" (trang Tổng quan kho) và thêm **trang đăng nhập admin**. Chưa có backend nên dùng **mock data**, nhưng kiểu dữ liệu và hàm gọi API đã khớp với API thật trong proposal — khi có BE chỉ cần đặt `VITE_USE_MOCK=false`.
>
> Mọi code trong file này đã được dựng thử và `npm run build` thành công. Mỗi mục `### \`đường/dẫn\`` là một file: tạo file đúng đường dẫn đó và dán nguyên khối code bên dưới.

---

## 1. Phạm vi

| Có trong bản này | Chưa làm (để trang riêng sau) |
|---|---|
| Trang `/login`: email + mật khẩu admin, validate, báo lỗi, ẩn/hiện mật khẩu | Quên mật khẩu, đăng ký (proposal chốt 1 admin tạo bằng script) |
| Route bảo vệ: chưa đăng nhập → về `/login`; đăng xuất ở sidebar | Refresh token |
| Trang `/` Tổng quan: KPI, biểu đồ cột nhập/xuất, sắp hết hàng, biểu đồ đường tồn kho, chất lượng parser, nhân viên, giao dịch gần đây | Các trang Tồn kho, Giao dịch, Nhân viên… (đã có route + trang placeholder) |
| Bộ lọc 7/14/30 ngày lưu trên URL `?range=` | Bộ lọc theo khoảng ngày tùy chọn |
| Hover tooltip trên 2 biểu đồ, bảng ẩn cho trình đọc màn hình | Xuất báo cáo (nút có sẵn, chưa gắn hành động) |
| Loading skeleton, lỗi + nút Thử lại | Dark mode |

---

## 2. Cài đặt

```bash
npm create vite@latest storagemate-web -- --template react-ts
cd storagemate-web
npm install
npm install react-router-dom
npm install -D tailwindcss @tailwindcss/vite
```

Xóa các file mẫu không dùng: `src/App.css`, `src/assets/`. Sau đó tạo/ghi đè các file ở mục 9.

```bash
npm run dev        # http://localhost:5173
npm run build      # kiểm tra type + build
```

Tài khoản demo khi chạy mock: **`admin@storagemate.vn` / `storagemate123`**.

Biến môi trường (`.env.local`, không commit):

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `VITE_USE_MOCK` | `true` | `false` để gọi API thật |
| `VITE_API_URL` | rỗng | URL ngrok của FastAPI, ví dụ `https://ten-ban.ngrok-free.app` |

---

## 3. Cấu trúc thư mục

```
storagemate-web/
├── index.html
├── vite.config.ts
└── src/
    ├── main.tsx                 # mount + BrowserRouter + AuthProvider
    ├── App.tsx                  # khai báo route
    ├── index.css                # Tailwind + design tokens (@theme)
    ├── vite-env.d.ts            # kiểu cho import.meta.env
    ├── api/
    │   ├── types.ts             # kiểu dữ liệu = hợp đồng với BE
    │   ├── errors.ts            # ApiError (tách riêng để tránh import vòng)
    │   └── client.ts            # gọi mock hoặc API thật
    ├── mocks/
    │   ├── data.ts              # sinh dữ liệu mẫu (giống bản thiết kế)
    │   └── api.ts               # giả lập API (delay 250ms)
    ├── auth/
    │   ├── session.ts           # lưu token
    │   ├── AuthContext.tsx      # login / logout
    │   └── RequireAuth.tsx      # chặn route khi chưa đăng nhập
    ├── lib/
    │   ├── format.ts            # định dạng ngày, số
    │   ├── chart.ts             # công thức trục, nhãn, khoảng cách cột
    │   ├── cn.ts                # nối className
    │   └── useAsync.ts          # hook tải dữ liệu
    ├── components/
    │   ├── layout/AppShell.tsx  # sidebar + vùng nội dung
    │   ├── layout/Sidebar.tsx
    │   └── ui/                  # Card, SegmentedControl, Icon, Skeleton…
    ├── features/dashboard/      # các khối của trang Tổng quan
    └── pages/                   # LoginPage, DashboardPage, PlaceholderPage
```

---

## 4. Design tokens

### 4.1 Màu

Tất cả màu khai báo một lần trong `@theme` (file `src/index.css`) và dùng qua class Tailwind, ví dụ `bg-ground`, `text-muted`, `border-line`. **Không** viết mã hex rời trong component, trừ chỗ màu đến từ dữ liệu (series biểu đồ).

| Token | Hex | Dùng cho |
|---|---|---|
| `ground` | `#F6F6F3` | Nền trang |
| `surface` | `#FFFFFF` | Nền card, sidebar, input |
| `line` | `#E5E3DC` | Viền card, viền sidebar, kẻ dưới header bảng |
| `line-soft` | `#F0EFEA` | Kẻ giữa các dòng trong card |
| `line-strong` | `#D6D4CC` | Viền nút phụ, input, pill chưa chọn, trục 0 của biểu đồ đường |
| `grid` | `#EEEDE8` | Gridline biểu đồ, nền thanh meter |
| `ink` | `#1C1C1A` | Chữ chính, nền tooltip |
| `ink-2` | `#3B3A36` | Chữ phụ đậm (legend, nav, bảng) |
| `muted` | `#5C5B57` | Chữ mô tả, nhãn KPI |
| `faint` | `#75746F` | Nhãn trục (11px), chấm "Hủy" |
| `chip` | `#F1EFE8` | Badge, nhãn nguồn parser, hover nav |
| `seg` | `#ECEBE6` | Nền segmented control |
| `hover-col` | `#F1F0EC` | Nền cột đang hover trong biểu đồ cột |
| `crosshair` | `#B9B7AE` | Đường dọc khi hover biểu đồ đường |
| `nav-active-bg` | `#EAF1FB` | Nền mục nav đang chọn, pill nguyên liệu đang chọn |
| `nav-active-fg` | `#123F78` | Chữ mục nav / pill đang chọn |
| `pill-on-bd` | `#9EC5F4` | Viền pill nguyên liệu đang chọn |
| `link` / `link-hover` | `#1D5FAE` / `#123F78` | Link |
| `primary` / `primary-hover` | `#1D5FAE` / `#174E90` | Nút chính (đăng nhập). Chữ trắng trên nền này đạt tương phản ≥ 4.5:1 |
| `series-in` | `#2A78D6` | Nhập; Regex; đường tồn kho; meter |
| `series-out` | `#EB6834` | Xuất; NER |
| `series-3` | `#1BAF7A` | LLM |
| `series-4` | `#EDA100` | Không hiểu |
| `good` | `#0CA30C` | Chấm "Webhook hoạt động" |
| `warning` / `warning-text` | `#FAB219` / `#7A5200` | Meter "Sắp chạm" / chữ của nó |
| `critical` / `critical-text` | `#D03B3B` / `#A32D2D` | Meter "Dưới mức", vạch mức tối thiểu / chữ, viền input lỗi |
| `critical-bg` / `critical-bd` | `#FCEBEB` / `#F7C1C1` | Hộp báo lỗi đăng nhập |

Bảng màu 4 series (blue, orange, aqua, yellow) đã chạy qua bộ kiểm tra mù màu: các cặp kề nhau đạt ΔE ≥ 9. Hai màu aqua và yellow có tương phản < 3:1 trên nền trắng, nên **bắt buộc** đi kèm nhãn chữ (đã có legend + dòng phần trăm). Màu trạng thái (critical/warning) luôn đi kèm biểu tượng + chữ.

### 4.2 Chữ

- Font: **Inter** (400, 500, 600, 700) từ Google Fonts, fallback `system-ui, sans-serif`.
- Toàn trang dùng `tabular-nums` để số thẳng cột.

| Vai trò | Cỡ / độ đậm | Class |
|---|---|---|
| Tiêu đề trang (h1) | 26px / 700, letter-spacing −0.02em | `text-[26px] font-bold tracking-[-0.02em]` |
| Tiêu đề trang login | 22px / 700 | `text-[22px] font-bold tracking-[-0.02em]` |
| Giá trị KPI | 28px / 700, −0.02em | `text-[28px] font-bold tracking-[-0.02em]` |
| Logo "Storagemate" | 17px / 700, −0.01em | `text-[17px] font-bold tracking-[-0.01em]` |
| Tiêu đề card (h2) | 16px / 600 | `text-base font-semibold` |
| Chữ thường | 14px / 400 | `text-sm` |
| Nút, nhãn KPI, link trong card | 13px / 600 hoặc 400 | `text-[13px]` |
| Ghi chú, legend, bảng header | 12px | `text-xs` |
| Nhãn trục, badge nguồn | 11px | `text-[11px]` |

### 4.3 Khoảng cách, bo góc, viền

| Thứ | Giá trị |
|---|---|
| Padding vùng nội dung | trên 28px, trái/phải 32px, dưới 48px (`pt-7 sm:px-8 pb-12`); dưới 640px trái/phải còn 16px (`px-4`) |
| Khoảng cách giữa các khối dọc | 20px (`gap-5`) |
| Khoảng cách giữa các card cùng hàng | 20px (`gap-5`) |
| Khoảng cách giữa các ô KPI | 12px (`gap-3`) |
| Padding card | 20px (`p-5`); ô KPI 16px × 18px (`py-4 px-[18px]`) |
| Bo góc card / ô KPI | 12px (`rounded-xl`) |
| Bo góc nút, input, segmented | 10px (`rounded-[10px]`); nút trong segmented 8px (`rounded-lg`) |
| Bo góc pill, badge, meter | `rounded-full` |
| Đầu cột biểu đồ | bo 4px phía trên (`rounded-t`) |
| Viền | 1px, không đổ bóng (không dùng `shadow`) |
| Vùng bấm tối thiểu | nút segmented 36px, nút "Xuất báo cáo" 42px, pill 32px, input/nút login 44px |

---

## 5. Layout

### 5.1 Khung trang (AppShell)

```
┌───────────────┬──────────────────────────────────────────────────────────┐
│ Sidebar       │ Header: Tổng quan kho · khoảng ngày   [7|14|30] [Xuất BC] │
│ 220px         ├──────────────────────────────────────────────────────────┤
│ (flex 1 1     │ KPI × 5  (grid auto-fit, mỗi ô ≥ 180px)                  │
│  220px)       ├─────────────────────────────────────┬────────────────────┤
│               │ Lượt nhập và xuất theo ngày         │ Sắp hết hàng       │
│               │ flex 2 1 520px                      │ flex 1 1 300px     │
│               ├─────────────────────────────────────┼────────────────────┤
│               │ Tồn <nguyên liệu> 30 ngày qua       │ Bot hiểu tin nhắn  │
│               │ flex 2 1 520px                      │ bằng gì · 1 1 300px│
│               ├──────────────────────┬──────────────┴────────────────────┤
│ [Bot status]  │ Nhân viên            │ Giao dịch gần đây                 │
│ [Đăng xuất]   │ flex 1 1 420px       │ flex 1 1 420px                    │
└───────────────┴──────────────────────┴───────────────────────────────────┘
```

- Hàng ngoài cùng là `flex flex-wrap items-stretch`. Sidebar `flex-[1_1_220px]`, nội dung `flex-[999_1_560px] min-w-0`. Khi màn hình hẹp (< 780px) sidebar tự xuống thành khối trên cùng, nội dung ở dưới — **không** dùng `position: sticky` hay `100vh` cho sidebar.
- Mỗi hàng card là `flex flex-wrap gap-5`, hệ số flex như sơ đồ, nên khi hẹp các card tự xếp dọc.
- Bảng nhân viên nằm trong hộp `overflow-x-auto`, bảng có `min-width: 440px`.
- Bản thiết kế chuẩn ở chiều rộng **1440px**; kiểm tra thêm ở 1024px và 390px.

### 5.2 Trang đăng nhập

```
               nền ground, căn giữa cả 2 chiều, padding 16px
             ┌──────────────────────────────────────┐
             │ Storagemate                          │  card: max-width 400px,
             │ Quán Mộc · kho trung tâm             │  padding 32px, gap 24px,
             │                                      │  viền line, bo 12px
             │ Đăng nhập quản trị          (22/700) │
             │ Dùng tài khoản admin do chủ quán tạo │
             │ [!] Sai email hoặc mật khẩu.         │  hộp lỗi (khi có)
             │ Email                                │
             │ [admin@storagemate.vn            ]   │  input 44px
             │ Mật khẩu                             │
             │ [••••••••••••            ] [Hiện]    │
             │ [        Đăng nhập        ]          │  nút primary 44px
             │ Bản demo: admin@… / storagemate123   │  chỉ hiện khi mock
             └──────────────────────────────────────┘
```

Hành vi:
- Validate khi bấm Đăng nhập: email bắt buộc và đúng định dạng; mật khẩu ≥ 8 ký tự. Lỗi hiện ngay dưới ô (12px, `critical-text`), ô có `aria-invalid` và viền `critical`.
- Sai tài khoản → hộp lỗi `role="alert"` phía trên form.
- Đang gửi: nút disabled, chữ "Đang đăng nhập…".
- Thành công → chuyển về trang đã định vào (hoặc `/`). Đã đăng nhập mà vào `/login` → chuyển về `/`.

---

## 6. Components

| Component | File | Props chính | Ghi chú cần làm đúng |
|---|---|---|---|
| `AppShell` | `components/layout/AppShell.tsx` | — | Bọc các route đã đăng nhập, render `<Outlet/>` |
| `Sidebar` | `components/layout/Sidebar.tsx` | — | Logo, 8 mục nav (`NavLink`), badge "Duyệt nhãn" (số nhãn chờ), thẻ trạng thái bot, email admin + Đăng xuất |
| `Card` | `components/ui/Card.tsx` | `title`, `action?`, `subtitle?`, `className?` | `<section aria-labelledby>` + `<h2>`; padding 20, gap 14 |
| `SegmentedControl` | `components/ui/SegmentedControl.tsx` | `options`, `value`, `onChange`, `label` | Nút thật `<button aria-pressed>`; nền nhóm `seg`, nút chọn nền trắng |
| `Icon` | `components/ui/Icon.tsx` | `name`, `size?` | SVG nét 2.2px, `aria-hidden` |
| `Skeleton`, `ErrorCard` | `components/ui/` | — | Loading và lỗi |
| `ChartTooltip` | `components/ui/ChartTooltip.tsx` | `leftPct`, `children` | Nền `ink`, chữ trắng 12px, `pointer-events: none`, kẹp trong 10–90% chiều ngang |
| `PageHeader` | `features/dashboard/PageHeader.tsx` | `periodLabel`, `range`, `onRangeChange` | — |
| `KpiGrid` | `features/dashboard/KpiGrid.tsx` | `kpis`, `range` | 5 ô; mũi tên ▲/▼ + dấu đi kèm, không dựa vào màu |
| `InOutBarChart` | `features/dashboard/InOutBarChart.tsx` | `daily` | Mục 7.1 |
| `LowStockCard` | `features/dashboard/LowStockCard.tsx` | `items` | Mục 7.3 |
| `StockLineChart` | `features/dashboard/StockLineChart.tsx` | `items`, `itemId`, `onItemChange`, `history` | Mục 7.2 |
| `ParserQualityCard` | `features/dashboard/ParserQualityCard.tsx` | `weeks`, `pendingLabels` | Thanh 100% chồng, khe 2px giữa các đoạn |
| `StaffTable` | `features/dashboard/StaffTable.tsx` | `staff` | `<table>` thật, `th scope="col"` |
| `RecentTransactions` | `features/dashboard/RecentTransactions.tsx` | `items` | Dòng cao ~40px, chữ dài bị cắt `…` |

---

## 7. Công thức biểu đồ

Biểu đồ vẽ tay bằng div/SVG, không dùng thư viện, để khớp thiết kế từng pixel.

### 7.1 Lượt nhập và xuất theo ngày (cột đôi)

- Vùng vẽ cao **220px**. Nhãn trục Y ở trái (rộng 30px), vùng cột bắt đầu từ `left: 34px`.
- `max = ceil(max(mọi inCount, outCount) / 5) * 5`. Gridline ở 0%, 50%, 100% với nhãn `0`, `max/2`, `max` (làm tròn).
- Mỗi ngày là một cột `flex: 1`, bên trong 2 thanh rộng 42% (tối đa 16px), cách nhau 2px, cao `value / max * 100%`, đầu bo 4px.
- Khoảng cách giữa các ngày: 7 ngày → 14px; 14 ngày → 8px; 30 ngày → 3px.
- Nhãn trục X (`dd/mm`, 11px): 7 ngày hiện tất cả; 14 ngày cách 2; 30 ngày cách 5; luôn hiện ngày cuối; bỏ nhãn kế cuối nếu đang nhảy cách (để không chồng chữ). Nhãn đầu căn trái, nhãn cuối căn phải để không tràn ra ngoài card trên điện thoại.
- Hover một cột: nền cột `hover-col`; tooltip ở trên cùng, tâm tại `(i + 0.5) / n * 100%`, kẹp trong 12–88%: dòng 1 `dd/mm` (600), dòng 2 `Nhập X lượt · Xuất Y lượt`.
- Legend ô vuông 10px bo 3px ở góc phải tiêu đề.

### 7.2 Tồn theo thời gian (đường)

- Vùng vẽ cao **210px**, lề trái 34px cho nhãn Y (`max` ở trên, `0` ở dưới), gridline 0% / 50% / 100% (đường đáy dùng `line-strong`).
- `max = ceil(max(tất cả giá trị, mức tối thiểu) × 1.15 / 10) × 10`.
- SVG `viewBox="0 0 600 200" preserveAspectRatio="none"`, `x = i / (n−1) × 600`, `y = 200 − v / max × 200`. Đường 2px `series-in`, có `vector-effect="non-scaling-stroke"` để nét không bị kéo giãn.
- Vạch mức tối thiểu: đường ngang nét đứt `5 4`, 1.5px, màu `critical`; nhãn "Mức tối thiểu 20 kg" 11px/600 màu `critical-text`, nằm sát phải, ngay trên vạch.
- Hover: chia vùng vẽ thành n cột vô hình để bắt chuột; hiện đường dọc `crosshair`, chấm 10px có viền trắng 2px, tooltip `dd/mm` + `Tồn 34 kg`, kẹp 10–88%.
- Nhãn trục X: ngày đầu, ngày giữa (điểm thứ 15), ngày cuối.
- Pill chọn nguyên liệu (4 nguyên liệu theo dõi): chọn → nền `nav-active-bg`, chữ `nav-active-fg`, viền `pill-on-bd`.

### 7.3 Sắp hết hàng

- Lấy 5 nguyên liệu có tỉ lệ `qty / minQty` thấp nhất (BE trả sẵn đã sắp xếp).
- Trạng thái: tỉ lệ < 1 → **Dưới mức** (icon cảnh báo, meter `critical`, chữ `critical-text`); < 1.6 → **Sắp chạm** (icon đồng hồ, meter `warning`, chữ `warning-text`); còn lại → **Đủ** (icon đồng hồ, meter `series-in`, chữ `ink-2`).
- Meter cao 6px: độ dài = `min(100, qty / (minQty × 2) × 100)%`, nên vạch giữa thanh tương ứng đúng mức tối thiểu.
- Dòng phụ: `Còn 6 kg · tối thiểu 10 kg · đủ dùng ~3 ngày`, với số ngày = `floor(qty / avgDailyOut)`; 0 → "đã hết".

### 7.4 Bot hiểu tin nhắn bằng gì

- Legend 4 màu: Regex (`series-in`), NER (`series-out`), LLM (`series-3`), Không hiểu (`series-4`).
- Mỗi tuần một thanh cao 14px, các đoạn rộng theo %, khe 2px giữa đoạn, đầu thanh bo 4px. Trên thanh: trái là "Tuần dd/mm", phải là "Regex 83% · NER 9% · LLM 6% · Không hiểu 2%".

---

## 8. Hợp đồng API (mock = thật)

| Hàm trong `api/client.ts` | API thật | Trả về |
|---|---|---|
| `api.login(email, password)` | `POST /api/auth/login` (form `username`, `password`) | `LoginResponse` |
| `api.getDashboard(range)` | `GET /api/dashboard/summary?range=7` | `DashboardSummary` |
| `api.getTrackedItems()` | `GET /api/items?tracked=true` | `ItemRef[]` |
| `api.getStockHistory(itemId, 30)` | `GET /api/stock/{itemId}/history?days=30` | `StockHistory` |
| `api.getBotStatus()` | `GET /api/bot/status` | `BotStatus` |

- Mọi request gửi `Authorization: Bearer <token>` và `ngrok-skip-browser-warning: 1`.
- `401` từ API thật → xóa phiên và quay về `/login`.
- Ngày dạng `YYYY-MM-DD`, thời điểm dạng ISO có múi giờ `+07:00`. FE chỉ cắt chuỗi để hiển thị, không đổi múi giờ.
- Mock sinh dữ liệu xác định (cùng số mỗi lần chạy), trùng số với bản thiết kế, mốc cuối là 31/10/2026.
- Hai đường `/api/dashboard/summary` và `/api/bot/status` là endpoint mới cần thêm vào backend.

---

## 9. Code từng file

### `index.html`

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    />
    <title>Storagemate · Quản trị kho</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCK?: string
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### `src/index.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", system-ui, sans-serif;

  --color-ground: #f6f6f3;
  --color-surface: #ffffff;
  --color-line: #e5e3dc;
  --color-line-soft: #f0efea;
  --color-line-strong: #d6d4cc;
  --color-grid: #eeede8;

  --color-ink: #1c1c1a;
  --color-ink-2: #3b3a36;
  --color-muted: #5c5b57;
  --color-faint: #75746f;

  --color-chip: #f1efe8;
  --color-seg: #ecebe6;
  --color-hover-col: #f1f0ec;
  --color-crosshair: #b9b7ae;

  --color-nav-active-bg: #eaf1fb;
  --color-nav-active-fg: #123f78;
  --color-pill-on-bd: #9ec5f4;
  --color-link: #1d5fae;
  --color-link-hover: #123f78;
  --color-primary: #1d5fae;
  --color-primary-hover: #174e90;

  --color-series-in: #2a78d6;
  --color-series-out: #eb6834;
  --color-series-3: #1baf7a;
  --color-series-4: #eda100;

  --color-good: #0ca30c;
  --color-warning: #fab219;
  --color-warning-text: #7a5200;
  --color-critical: #d03b3b;
  --color-critical-text: #a32d2d;
  --color-critical-bg: #fcebeb;
  --color-critical-bd: #f7c1c1;
}

@layer base {
  html,
  body {
    margin: 0;
    background: var(--color-ground);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  a {
    color: var(--color-link);
    text-decoration: none;
  }
  a:hover {
    color: var(--color-link-hover);
    text-decoration: underline;
  }
  button {
    font-family: inherit;
    cursor: pointer;
  }
  :focus-visible {
    outline: 2px solid var(--color-series-in);
    outline-offset: 2px;
  }
}
```

### `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

### `src/App.tsx`

```tsx
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { NAV_ITEMS } from './components/layout/nav'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PlaceholderPage from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        {NAV_ITEMS.filter((n) => n.to !== '/').map((n) => (
          <Route key={n.to} path={n.to} element={<PlaceholderPage title={n.label} />} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

### `src/api/types.ts`

```ts
export type RangeDays = 7 | 14 | 30
export type Role = 'staff' | 'manager'
export type ParserSource = 'regex' | 'ner' | 'llm'
export type TxAction = 'IN' | 'OUT' | 'REVERSE'

export interface AdminInfo {
  email: string
  name: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'bearer'
  admin: AdminInfo
}

export interface DailyCount {
  date: string // YYYY-MM-DD
  inCount: number
  outCount: number
}

export interface DashboardKpis {
  inCount: number
  outCount: number
  inDeltaPct: number // so với kỳ trước cùng độ dài
  outDeltaPct: number
  belowMinCount: number
  regexRatePct: number // tuần gần nhất
  regexDeltaPt: number // điểm % so với tuần trước
  retypeRatePct: number // % tin phải gõ lại
  retypeCount: number
}

export interface LowStockItem {
  itemId: string
  name: string
  unit: string
  qty: number
  minQty: number
  avgDailyOut: number
}

export interface ParserWeek {
  weekStart: string // YYYY-MM-DD
  regex: number // phần trăm, 4 số cộng lại = 100
  ner: number
  llm: number
  failed: number
}

export interface StaffStat {
  id: string
  name: string
  role: Role
  messages: number
  syntaxOkPct: number
  undoCount: number
}

export interface RecentTx {
  id: string
  at: string // ISO có múi giờ, ví dụ 2026-10-31T17:12:00+07:00
  action: TxAction
  qty: number
  unit: string
  itemName: string
  staffName: string
  source: ParserSource | 'undo'
  confirmed: boolean // tin do NER/LLM đọc đã được nhân viên trả lời OK
}

export interface BotStatus {
  botName: string
  webhookOk: boolean
  lastMessageAt: string
  queueSize: number
  pendingLabels: number
}

export interface DashboardSummary {
  range: RangeDays
  from: string
  to: string
  kpis: DashboardKpis
  daily: DailyCount[]
  lowStock: LowStockItem[]
  parserWeekly: ParserWeek[]
  staff: StaffStat[]
  recent: RecentTx[]
  pendingLabels: number
}

export interface ItemRef {
  id: string
  name: string
  unit: string
}

export interface StockHistory {
  item: ItemRef
  minQty: number
  points: { date: string; qty: number }[]
}
```

### `src/api/errors.ts`

```ts
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
```

### `src/api/client.ts`

```ts
import { clearSession, getToken } from '../auth/session'
import * as mock from '../mocks/api'
import { ApiError } from './errors'
import type {
  BotStatus,
  DashboardSummary,
  ItemRef,
  LoginResponse,
  RangeDays,
  StockHistory,
} from './types'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
const BASE = import.meta.env.VITE_API_URL ?? ''

export { ApiError }

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      'ngrok-skip-browser-warning': '1',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    clearSession()
    window.location.assign('/login')
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, text || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export const api = {
  login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCK) return mock.login(email, password)
    return http<LoginResponse>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    })
  },
  getDashboard(range: RangeDays): Promise<DashboardSummary> {
    if (USE_MOCK) return mock.getDashboard(range)
    return http<DashboardSummary>(`/api/dashboard/summary?range=${range}`)
  },
  getTrackedItems(): Promise<ItemRef[]> {
    if (USE_MOCK) return mock.getTrackedItems()
    return http<ItemRef[]>('/api/items?tracked=true')
  },
  getStockHistory(itemId: string, days = 30): Promise<StockHistory> {
    if (USE_MOCK) return mock.getStockHistory(itemId)
    return http<StockHistory>(`/api/stock/${encodeURIComponent(itemId)}/history?days=${days}`)
  },
  getBotStatus(): Promise<BotStatus> {
    if (USE_MOCK) return mock.getBotStatus()
    return http<BotStatus>('/api/bot/status')
  },
}
```

### `src/mocks/data.ts`

```ts
import type {
  DailyCount,
  LowStockItem,
  ParserWeek,
  RecentTx,
  StaffStat,
  StockHistory,
} from '../api/types'

/** Mốc cuối của dữ liệu mẫu: 31/10/2026. */
const END = new Date(2026, 9, 31)
const TOTAL_DAYS = 60
const HISTORY_DAYS = 30

/** Số giả ngẫu nhiên xác định: cùng (i, k) luôn ra cùng kết quả. */
function rnd(i: number, k: number): number {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function dayAt(i: number, total: number): Date {
  return new Date(END.getFullYear(), END.getMonth(), END.getDate() - (total - 1 - i))
}

export const DAILY: DailyCount[] = Array.from({ length: TOTAL_DAYS }, (_, i) => {
  const d = dayAt(i, TOTAL_DAYS)
  const weekend = d.getDay() === 0 || d.getDay() === 6
  return {
    date: iso(d),
    inCount: 2 + Math.floor(rnd(i, 1) * 4),
    outCount: (weekend ? 14 : 8) + Math.floor(rnd(i, 2) * (weekend ? 8 : 7)),
  }
})

interface ItemSeed {
  id: string
  name: string
  unit: string
  minQty: number
  start: number
  lo: number
  hi: number
  restock: Record<number, number>
  tracked: boolean
}

const ITEM_SEEDS: ItemSeed[] = [
  { id: 'botmi', name: 'Bột mì', unit: 'kg', minQty: 20, start: 70, lo: 4, hi: 7, restock: { 6: 50, 16: 50, 25: 45 }, tracked: true },
  { id: 'sua', name: 'Sữa tươi', unit: 'hộp', minQty: 48, start: 200, lo: 18, hi: 30, restock: { 4: 144, 11: 144, 18: 144, 26: 120 }, tracked: true },
  { id: 'duong', name: 'Đường', unit: 'kg', minQty: 10, start: 30, lo: 1, hi: 2.2, restock: { 14: 20 }, tracked: true },
  { id: 'bo', name: 'Bơ lạt', unit: 'kg', minQty: 5, start: 14, lo: 0.5, hi: 1.2, restock: { 9: 10, 21: 5 }, tracked: true },
  { id: 'trung', name: 'Trứng', unit: 'quả', minQty: 60, start: 420, lo: 25, hi: 40, restock: { 5: 240, 13: 240, 21: 240 }, tracked: false },
  { id: 'cafe', name: 'Cà phê hạt', unit: 'kg', minQty: 3, start: 12, lo: 0.4, hi: 0.7, restock: { 12: 6 }, tracked: false },
]

interface ItemSeries extends ItemSeed {
  values: number[]
  avgDailyOut: number
}

export const ITEMS: ItemSeries[] = ITEM_SEEDS.map((seed, k) => {
  let stock = seed.start
  let used = 0
  const values: number[] = []
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const out = seed.lo + rnd(i, 10 + k) * (seed.hi - seed.lo)
    used += out
    stock = Math.max(0, stock - out + (seed.restock[i] ?? 0))
    values.push(Math.round(stock * 10) / 10)
  }
  return { ...seed, values, avgDailyOut: used / HISTORY_DAYS }
})

export function stockHistory(itemId: string): StockHistory | undefined {
  const it = ITEMS.find((x) => x.id === itemId)
  if (!it) return undefined
  return {
    item: { id: it.id, name: it.name, unit: it.unit },
    minQty: it.minQty,
    points: it.values.map((qty, i) => ({ date: iso(dayAt(i, HISTORY_DAYS)), qty })),
  }
}

export function lowStock(limit = 5): LowStockItem[] {
  return ITEMS.map((it) => ({
    itemId: it.id,
    name: it.name,
    unit: it.unit,
    qty: it.values[it.values.length - 1],
    minQty: it.minQty,
    avgDailyOut: it.avgDailyOut,
  }))
    .sort((a, b) => a.qty / a.minQty - b.qty / b.minQty)
    .slice(0, limit)
}

export function belowMinCount(): number {
  return ITEMS.filter((it) => it.values[it.values.length - 1] < it.minQty).length
}

export const PARSER_WEEKS: ParserWeek[] = [
  { weekStart: '2026-10-06', regex: 72, ner: 10, llm: 12, failed: 6 },
  { weekStart: '2026-10-13', regex: 76, ner: 11, llm: 9, failed: 4 },
  { weekStart: '2026-10-20', regex: 80, ner: 10, llm: 7, failed: 3 },
  { weekStart: '2026-10-27', regex: 83, ner: 9, llm: 6, failed: 2 },
]

export const STAFF: StaffStat[] = [
  { id: 's1', name: 'Lan', role: 'staff', messages: 86, syntaxOkPct: 94, undoCount: 1 },
  { id: 's2', name: 'Minh', role: 'staff', messages: 74, syntaxOkPct: 88, undoCount: 3 },
  { id: 's3', name: 'Hòa', role: 'manager', messages: 41, syntaxOkPct: 97, undoCount: 0 },
  { id: 's4', name: 'Tuấn', role: 'staff', messages: 63, syntaxOkPct: 71, undoCount: 5 },
  { id: 's5', name: 'Vy', role: 'staff', messages: 29, syntaxOkPct: 90, undoCount: 1 },
]

export const RECENT: RecentTx[] = [
  { id: 't6', at: '2026-10-31T17:12:00+07:00', action: 'OUT', qty: 3, unit: 'thùng', itemName: 'sữa tươi', staffName: 'Lan', source: 'regex', confirmed: true },
  { id: 't5', at: '2026-10-31T16:48:00+07:00', action: 'IN', qty: 50, unit: 'kg', itemName: 'bột mì', staffName: 'Minh', source: 'regex', confirmed: true },
  { id: 't4', at: '2026-10-31T16:05:00+07:00', action: 'OUT', qty: 2, unit: 'kg', itemName: 'đường', staffName: 'Tuấn', source: 'llm', confirmed: true },
  { id: 't3', at: '2026-10-31T15:40:00+07:00', action: 'REVERSE', qty: 1, unit: 'kg', itemName: 'bơ lạt', staffName: 'Tuấn', source: 'undo', confirmed: true },
  { id: 't2', at: '2026-10-31T14:22:00+07:00', action: 'OUT', qty: 30, unit: 'quả', itemName: 'trứng', staffName: 'Vy', source: 'ner', confirmed: true },
  { id: 't1', at: '2026-10-31T13:10:00+07:00', action: 'IN', qty: 6, unit: 'kg', itemName: 'cà phê hạt', staffName: 'Hòa', source: 'regex', confirmed: true },
]

export const PENDING_LABELS = 14
```

### `src/mocks/api.ts`

```ts
import { ApiError } from '../api/errors'
import type {
  BotStatus,
  DashboardSummary,
  ItemRef,
  LoginResponse,
  RangeDays,
  StockHistory,
} from '../api/types'
import {
  belowMinCount,
  DAILY,
  ITEMS,
  lowStock,
  PARSER_WEEKS,
  PENDING_LABELS,
  RECENT,
  STAFF,
  stockHistory,
} from './data'

export const DEMO_EMAIL = 'admin@storagemate.vn'
export const DEMO_PASSWORD = 'storagemate123'

const wait = <T,>(value: T, ms = 250) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0)
const deltaPct = (cur: number, prev: number) =>
  prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 100)

export async function login(email: string, password: string): Promise<LoginResponse> {
  await wait(null, 500)
  if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    throw new ApiError(401, 'Sai email hoặc mật khẩu.')
  }
  return {
    access_token: 'mock.' + btoa(email) + '.' + Date.now(),
    token_type: 'bearer',
    admin: { email: DEMO_EMAIL, name: 'Chủ quán' },
  }
}

export function getDashboard(range: RangeDays): Promise<DashboardSummary> {
  const cur = DAILY.slice(-range)
  const prev = DAILY.slice(-range * 2, -range)
  const inCount = sum(cur.map((d) => d.inCount))
  const outCount = sum(cur.map((d) => d.outCount))
  return wait({
    range,
    from: cur[0].date,
    to: cur[cur.length - 1].date,
    kpis: {
      inCount,
      outCount,
      inDeltaPct: deltaPct(inCount, sum(prev.map((d) => d.inCount))),
      outDeltaPct: deltaPct(outCount, sum(prev.map((d) => d.outCount))),
      belowMinCount: belowMinCount(),
      regexRatePct: 83,
      regexDeltaPt: 3,
      retypeRatePct: 2,
      retypeCount: 6,
    },
    daily: cur,
    lowStock: lowStock(5),
    parserWeekly: PARSER_WEEKS,
    staff: STAFF,
    recent: RECENT,
    pendingLabels: PENDING_LABELS,
  })
}

export function getTrackedItems(): Promise<ItemRef[]> {
  return wait(
    ITEMS.filter((it) => it.tracked).map((it) => ({ id: it.id, name: it.name, unit: it.unit })),
  )
}

export function getStockHistory(itemId: string): Promise<StockHistory> {
  const h = stockHistory(itemId)
  if (!h) return Promise.reject(new ApiError(404, 'Không tìm thấy nguyên liệu'))
  return wait(h)
}

export function getBotStatus(): Promise<BotStatus> {
  return wait({
    botName: 'Bot Storagemate',
    webhookOk: true,
    lastMessageAt: '2026-10-31T17:12:00+07:00',
    queueSize: 0,
    pendingLabels: PENDING_LABELS,
  })
}
```

### `src/auth/session.ts`

```ts
import type { AdminInfo } from '../api/types'

const TOKEN_KEY = 'sm_token'
const ADMIN_KEY = 'sm_admin'

// Hackathon: lưu localStorage cho đơn giản. Bản thật nên chuyển sang cookie httpOnly.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getAdmin(): AdminInfo | null {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    return raw ? (JSON.parse(raw) as AdminInfo) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, admin: AdminInfo): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  } catch {
    /* bỏ qua: trình duyệt chặn storage */
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  } catch {
    /* bỏ qua */
  }
}
```

### `src/auth/AuthContext.tsx`

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { AdminInfo } from '../api/types'
import { clearSession, getAdmin, getToken, saveSession } from './session'

interface AuthValue {
  admin: AdminInfo | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(() => (getToken() ? getAdmin() : null))

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    saveSession(res.access_token, res.admin)
    setAdmin(res.admin)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, isAuthenticated: admin !== null, login, logout }),
    [admin, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải nằm trong AuthProvider')
  return ctx
}
```

### `src/auth/RequireAuth.tsx`

```tsx
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <>{children}</>
}
```

### `src/lib/cn.ts`

```ts
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}
```

### `src/lib/format.ts`

```ts
/** "2026-10-28" → "28/10" */
export function fmtDate(isoDate: string): string {
  const [, m, d] = isoDate.slice(0, 10).split('-')
  return `${d}/${m}`
}

/** 12.5 → "12,5"; 12 → "12" */
export function fmtNum(v: number): string {
  return String(Math.round(v * 10) / 10).replace('.', ',')
}

/** "2026-10-31T17:12:00+07:00" → "17:12" (giữ nguyên giờ địa phương trong chuỗi) */
export function fmtTime(isoDateTime: string): string {
  return isoDateTime.slice(11, 16)
}

export function fmtQty(v: number, unit: string): string {
  return `${fmtNum(v)} ${unit}`
}
```

### `src/lib/chart.ts`

```ts
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const niceCeil = (v: number, step: number) => Math.max(step, Math.ceil(v / step) * step)

/** Khoảng cách giữa các cột ngày (px). */
export function barGap(n: number): number {
  if (n <= 7) return 14
  if (n <= 14) return 8
  return 3
}

/** Có hiện nhãn trục X cho cột i trong n cột không. */
export function showXLabel(i: number, n: number): boolean {
  const every = n <= 7 ? 1 : n <= 14 ? 2 : 5
  if (i === n - 2 && every > 1) return false
  return i % every === 0 || i === n - 1
}
```

### `src/lib/useAsync.ts`

```ts
import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
  reload: () => void
}

/** Tải dữ liệu; giữ dữ liệu cũ trong lúc tải lại để giao diện không nháy. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(true)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(undefined)
    fn()
      .then((d) => alive && setData(d))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { data, error, loading, reload }
}
```

### `src/components/layout/nav.ts`

```ts
export interface NavItem {
  to: string
  label: string
  badgeKey?: 'pendingLabels'
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tổng quan' },
  { to: '/ton-kho', label: 'Tồn kho' },
  { to: '/giao-dich', label: 'Giao dịch' },
  { to: '/nhan-vien', label: 'Nhân viên & mã mời' },
  { to: '/nguyen-lieu', label: 'Nguyên liệu' },
  { to: '/duyet-nhan', label: 'Duyệt nhãn', badgeKey: 'pendingLabels' },
  { to: '/chat-thu', label: 'Chat thử' },
  { to: '/bao-cao', label: 'Báo cáo' },
]
```

### `src/components/layout/AppShell.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-wrap items-stretch bg-ground text-sm text-ink tabular-nums">
      <Sidebar />
      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-5 px-4 pt-7 pb-12 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
```

### `src/components/layout/Sidebar.tsx`

```tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { cn } from '../../lib/cn'
import { useAsync } from '../../lib/useAsync'
import { NAV_ITEMS } from './nav'

function minutesAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (!Number.isFinite(diff) || diff < 0 || diff > 60 * 24) return iso.slice(11, 16)
  return diff <= 1 ? 'vừa xong' : `${diff} phút trước`
}

export function Sidebar() {
  const { admin, logout } = useAuth()
  const navigate = useNavigate()
  const bot = useAsync(() => api.getBotStatus(), [])

  return (
    <nav
      aria-label="Điều hướng chính"
      className="flex max-w-full min-w-0 flex-[1_1_220px] flex-col gap-6 border-r border-line bg-surface px-4 py-6"
    >
      <div className="flex flex-col gap-0.5 px-2">
        <span className="text-[17px] font-bold tracking-[-0.01em]">Storagemate</span>
        <span className="text-xs text-muted">Quán Mộc · kho trung tâm</span>
      </div>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between rounded-lg px-3 py-[9px] no-underline hover:no-underline',
                isActive
                  ? 'bg-nav-active-bg font-semibold text-nav-active-fg hover:text-nav-active-fg'
                  : 'text-ink-2 hover:bg-chip hover:text-ink',
              )
            }
          >
            <span>{item.label}</span>
            {item.badgeKey && bot.data && bot.data.pendingLabels > 0 && (
              <span className="rounded-full bg-chip px-2 py-px text-xs font-semibold text-ink-2">
                {bot.data.pendingLabels}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-col gap-2 rounded-xl border border-line p-3.5">
          <span className="text-xs text-muted">Zalo Bot · {bot.data?.botName ?? '…'}</span>
          <span className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className={cn('size-2 rounded-full', bot.data?.webhookOk === false ? 'bg-critical' : 'bg-good')}
            />
            {bot.data?.webhookOk === false ? 'Webhook lỗi' : 'Webhook hoạt động'}
          </span>
          <span className="text-xs text-muted">
            {bot.data
              ? `Tin cuối: ${minutesAgo(bot.data.lastMessageAt)} · Hàng đợi: ${bot.data.queueSize} tin`
              : 'Đang kiểm tra…'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 px-2 text-xs">
          <span className="min-w-0 truncate text-muted">{admin?.email}</span>
          <button
            type="button"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="shrink-0 whitespace-nowrap rounded-md border-0 bg-transparent px-1 py-1 font-semibold text-link hover:text-link-hover hover:underline"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  )
}
```

### `src/components/ui/Card.tsx`

```tsx
import { useId, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
  gapClass?: string
  children: ReactNode
}

export function Card({ title, subtitle, action, className, gapClass = 'gap-3.5', children }: CardProps) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className={cn('flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5', gapClass, className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="m-0 text-base font-semibold">
            {title}
          </h2>
          {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
```

### `src/components/ui/SegmentedControl.tsx`

```tsx
import { cn } from '../../lib/cn'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface Props<T extends string | number> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (v: T) => void
}

export function SegmentedControl<T extends string | number>({ label, options, value, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex gap-0.5 rounded-[10px] bg-seg p-[3px]">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-9 rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold',
              on ? 'bg-surface text-ink' : 'bg-transparent text-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
```

### `src/components/ui/Icon.tsx`

```tsx
const PATHS = {
  alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
```

### `src/components/ui/ChartTooltip.tsx`

```tsx
import type { ReactNode } from 'react'

export function ChartTooltip({ leftPct, top = -6, children }: { leftPct: number; top?: number; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-2 text-xs leading-normal text-white"
      style={{ left: `${leftPct}%`, top }}
    >
      {children}
    </div>
  )
}
```

### `src/components/ui/Skeleton.tsx`

```tsx
import { cn } from '../../lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-seg', className)} />
}
```

### `src/components/ui/ErrorCard.tsx`

```tsx
import { Icon } from './Icon'

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-critical-bd bg-critical-bg p-4 text-[13px] text-critical-text"
    >
      <span className="flex items-center gap-2">
        <Icon name="alert" size={16} />
        Không tải được dữ liệu: {message}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-9 rounded-lg border border-critical-bd bg-surface px-3 text-[13px] font-semibold text-critical-text"
      >
        Thử lại
      </button>
    </div>
  )
}
```

### `src/features/dashboard/PageHeader.tsx`

```tsx
import type { RangeDays } from '../../api/types'
import { SegmentedControl } from '../../components/ui/SegmentedControl'

const RANGE_OPTIONS: { value: RangeDays; label: string }[] = [
  { value: 7, label: '7 ngày' },
  { value: 14, label: '14 ngày' },
  { value: 30, label: '30 ngày' },
]

interface Props {
  periodLabel: string
  range: RangeDays
  onRangeChange: (r: RangeDays) => void
}

export function PageHeader({ periodLabel, range, onRangeChange }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">Tổng quan kho</h1>
        <span className="text-muted">{periodLabel}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl label="Khoảng thời gian" options={RANGE_OPTIONS} value={range} onChange={onRangeChange} />
        <button
          type="button"
          className="min-h-[42px] rounded-[10px] border border-line-strong bg-surface px-4 py-[9px] text-[13px] font-semibold text-ink hover:bg-ground"
        >
          Xuất báo cáo
        </button>
      </div>
    </div>
  )
}
```

### `src/features/dashboard/KpiGrid.tsx`

```tsx
import type { DashboardKpis, RangeDays } from '../../api/types'
import { cn } from '../../lib/cn'

interface Tile {
  label: string
  value: string
  unit: string
  note: string
  critical?: boolean
}

function delta(v: number, range: RangeDays): string {
  return `${v >= 0 ? '▲ +' : '▼ '}${v}% so với ${range} ngày trước`
}

export function KpiGrid({ kpis, range }: { kpis: DashboardKpis; range: RangeDays }) {
  const tiles: Tile[] = [
    { label: 'Lượt nhập', value: String(kpis.inCount), unit: 'lượt', note: delta(kpis.inDeltaPct, range) },
    { label: 'Lượt xuất', value: String(kpis.outCount), unit: 'lượt', note: delta(kpis.outDeltaPct, range) },
    {
      label: 'Dưới mức tối thiểu',
      value: String(kpis.belowMinCount),
      unit: 'nguyên liệu',
      note: kpis.belowMinCount > 0 ? '● Cần đặt hàng' : 'Đủ hàng',
      critical: kpis.belowMinCount > 0,
    },
    {
      label: 'Hiểu ngay bằng regex',
      value: String(kpis.regexRatePct),
      unit: '%',
      note: `${kpis.regexDeltaPt >= 0 ? '▲ +' : '▼ '}${kpis.regexDeltaPt} điểm so với tuần trước`,
    },
    {
      label: 'Tin phải gõ lại',
      value: String(kpis.retypeRatePct),
      unit: '%',
      note: `${kpis.retypeCount} tin trong ${range} ngày`,
    },
  ]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
      {tiles.map((t) => (
        <div key={t.label} className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface px-[18px] py-4">
          <span className="text-[13px] text-muted">{t.label}</span>
          <span className="text-[28px] font-bold tracking-[-0.02em]">
            {t.value}
            <span className="ml-1 text-sm font-medium tracking-normal text-muted">{t.unit}</span>
          </span>
          <span className={cn('text-xs font-medium', t.critical ? 'text-critical-text' : 'text-ink-2')}>{t.note}</span>
        </div>
      ))}
    </div>
  )
}
```

### `src/features/dashboard/InOutBarChart.tsx`

```tsx
import { useState } from 'react'
import type { DailyCount } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { barGap, clamp, niceCeil, showXLabel } from '../../lib/chart'
import { cn } from '../../lib/cn'
import { fmtDate } from '../../lib/format'

function Legend() {
  return (
    <div className="flex gap-4 text-xs text-ink-2">
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-series-in" />
        Nhập
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-[3px] bg-series-out" />
        Xuất
      </span>
    </div>
  )
}

export function InOutBarChart({ daily, className }: { daily: DailyCount[]; className?: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const n = daily.length
  const max = niceCeil(Math.max(...daily.flatMap((d) => [d.inCount, d.outCount])), 5)
  const gap = barGap(n)
  const grid = [0, 50, 100].map((p) => ({ pos: p, label: String(Math.round((max * p) / 100)) }))
  const tip = hover !== null && hover < n ? daily[hover] : null

  return (
    <Card title="Lượt nhập và xuất theo ngày" action={<Legend />} className={className}>
      <div className="relative h-[220px]">
        {grid.map((g) => (
          <div key={g.pos} aria-hidden="true">
            <div className="absolute right-0 left-[30px] border-t border-grid" style={{ bottom: `${g.pos}%` }} />
            <span className="absolute left-0 translate-y-1/2 text-[11px] text-faint" style={{ bottom: `${g.pos}%` }}>
              {g.label}
            </span>
          </div>
        ))}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 left-[34px] flex items-end"
          style={{ gap }}
          onMouseLeave={() => setHover(null)}
        >
          {daily.map((d, i) => (
            <div
              key={d.date}
              onMouseEnter={() => setHover(i)}
              className={cn(
                'flex h-full flex-1 basis-0 items-end justify-center gap-[2px] rounded-md',
                hover === i ? 'bg-hover-col' : 'bg-transparent',
              )}
            >
              <div className="w-[42%] max-w-4 rounded-t bg-series-in" style={{ height: `${(d.inCount / max) * 100}%` }} />
              <div className="w-[42%] max-w-4 rounded-t bg-series-out" style={{ height: `${(d.outCount / max) * 100}%` }} />
            </div>
          ))}
        </div>
        {tip && hover !== null && (
          <ChartTooltip leftPct={clamp(((hover + 0.5) / n) * 100, 12, 88)}>
            <div className="font-semibold">{fmtDate(tip.date)}</div>
            <div>
              Nhập {tip.inCount} lượt · Xuất {tip.outCount} lượt
            </div>
          </ChartTooltip>
        )}
      </div>
      <div aria-hidden="true" className="ml-[34px] flex text-[11px] text-faint" style={{ gap }}>
        {daily.map((d, i) => (
          <span
            key={d.date}
            className={cn(
              'flex-1 basis-0 whitespace-nowrap',
              i === 0 ? 'text-left' : i === n - 1 ? 'text-right' : 'text-center',
            )}
          >
            {showXLabel(i, n) ? fmtDate(d.date) : ''}
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>Lượt nhập và xuất theo ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">Nhập</th>
            <th scope="col">Xuất</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}>
              <td>{fmtDate(d.date)}</td>
              <td>{d.inCount}</td>
              <td>{d.outCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
```

### `src/features/dashboard/LowStockCard.tsx`

```tsx
import type { LowStockItem } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { cn } from '../../lib/cn'
import { fmtQty } from '../../lib/format'

function statusOf(it: LowStockItem) {
  const ratio = it.qty / it.minQty
  if (ratio < 1) return { label: 'Dưới mức', icon: 'alert' as const, bar: 'bg-critical', text: 'text-critical-text' }
  if (ratio < 1.6) return { label: 'Sắp chạm', icon: 'clock' as const, bar: 'bg-warning', text: 'text-warning-text' }
  return { label: 'Đủ', icon: 'clock' as const, bar: 'bg-series-in', text: 'text-ink-2' }
}

export function LowStockCard({ items, className }: { items: LowStockItem[]; className?: string }) {
  return (
    <Card title="Sắp hết hàng" action={<a href="/ton-kho" className="text-[13px]">Xem tồn kho</a>} className={className}>
      {items.map((it) => {
        const s = statusOf(it)
        const days = it.avgDailyOut > 0 ? Math.floor(it.qty / it.avgDailyOut) : 0
        const pct = Math.min(100, (it.qty / (it.minQty * 2)) * 100)
        return (
          <div key={it.itemId} className="flex flex-col gap-1.5 border-b border-line-soft pb-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{it.name}</span>
              <span className={cn('flex items-center gap-[5px] text-xs font-semibold', s.text)}>
                <Icon name={s.icon} />
                {s.label}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-grid">
              <div className={cn('h-full rounded-full', s.bar)} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted">
              Còn {fmtQty(it.qty, it.unit)} · tối thiểu {fmtQty(it.minQty, it.unit)} ·{' '}
              {days <= 0 ? 'đã hết' : `đủ dùng ~${days} ngày`}
            </span>
          </div>
        )
      })}
    </Card>
  )
}
```

### `src/features/dashboard/StockLineChart.tsx`

```tsx
import { useState } from 'react'
import type { ItemRef, StockHistory } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { ChartTooltip } from '../../components/ui/ChartTooltip'
import { Skeleton } from '../../components/ui/Skeleton'
import { clamp } from '../../lib/chart'
import { cn } from '../../lib/cn'
import { fmtDate, fmtQty } from '../../lib/format'

interface Props {
  items: ItemRef[]
  itemId: string
  onItemChange: (id: string) => void
  history: StockHistory | undefined
  className?: string
}

function ItemPills({ items, itemId, onItemChange }: Pick<Props, 'items' | 'itemId' | 'onItemChange'>) {
  return (
    <div role="group" aria-label="Chọn nguyên liệu" className="flex flex-wrap gap-1.5">
      {items.map((it) => {
        const on = it.id === itemId
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={on}
            onClick={() => onItemChange(it.id)}
            className={cn(
              'min-h-8 rounded-full border px-3 py-1.5 text-xs font-semibold',
              on ? 'border-pill-on-bd bg-nav-active-bg text-nav-active-fg' : 'border-line-strong bg-surface text-ink-2',
            )}
          >
            {it.name}
          </button>
        )
      })}
    </div>
  )
}

export function StockLineChart({ items, itemId, onItemChange, history, className }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const current = items.find((i) => i.id === itemId)
  const title = `Tồn ${(history?.item.name ?? current?.name ?? '').toLowerCase()} 30 ngày qua (${history?.item.unit ?? current?.unit ?? ''})`

  if (!history) {
    return (
      <Card title={title} action={<ItemPills items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
        <Skeleton className="h-[236px]" />
      </Card>
    )
  }

  const vals = history.points.map((p) => p.qty)
  const n = vals.length
  const max = Math.ceil((Math.max(...vals, history.minQty) * 1.15) / 10) * 10
  const y = (v: number) => 200 - (v / max) * 200
  const x = (i: number) => (i / (n - 1)) * 600
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const minY = y(history.minQty)
  const unit = history.item.unit
  const last = vals[n - 1]
  const hp = hover !== null && hover < n ? hover : null

  return (
    <Card title={title} action={<ItemPills items={items} itemId={itemId} onItemChange={onItemChange} />} className={className}>
      <div className="relative ml-[34px] h-[210px]">
        <span aria-hidden="true" className="absolute top-0 -left-[34px] -translate-y-1/2 text-[11px] text-faint">
          {max}
        </span>
        <span aria-hidden="true" className="absolute bottom-0 -left-[34px] translate-y-1/2 text-[11px] text-faint">
          0
        </span>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 border-t border-grid" />
        <div aria-hidden="true" className="absolute inset-x-0 top-1/2 border-t border-grid" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 border-t border-line-strong" />
        <svg
          role="img"
          aria-label={`Biểu đồ đường tồn ${history.item.name} ${n} ngày, hiện còn ${fmtQty(last, unit)}, mức tối thiểu ${fmtQty(history.minQty, unit)}.`}
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <path
            d={`M0 ${minY} L600 ${minY}`}
            fill="none"
            stroke="var(--color-critical)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
          <path d={d} fill="none" stroke="var(--color-series-in)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <span
          className="absolute right-0 -translate-y-[120%] bg-surface px-1 text-[11px] font-semibold text-critical-text"
          style={{ top: `${(minY / 200) * 100}%` }}
        >
          Mức tối thiểu {fmtQty(history.minQty, unit)}
        </span>
        <div aria-hidden="true" className="absolute inset-0 flex" onMouseLeave={() => setHover(null)}>
          {vals.map((_, i) => (
            <div key={i} className="h-full flex-1 basis-0" onMouseEnter={() => setHover(i)} />
          ))}
        </div>
        {hp !== null && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 border-l border-crosshair"
              style={{ left: `${(hp / (n - 1)) * 100}%` }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-series-in shadow-[0_0_0_2px_#fff]"
              style={{ left: `${(hp / (n - 1)) * 100}%`, top: `${(y(vals[hp]) / 200) * 100}%` }}
            />
            <ChartTooltip leftPct={clamp((hp / (n - 1)) * 100, 10, 88)} top={-8}>
              <div className="font-semibold">{fmtDate(history.points[hp].date)}</div>
              <div>Tồn {fmtQty(vals[hp], unit)}</div>
            </ChartTooltip>
          </>
        )}
      </div>
      <div aria-hidden="true" className="ml-[34px] flex justify-between text-[11px] text-faint">
        <span>{fmtDate(history.points[0].date)}</span>
        <span>{fmtDate(history.points[Math.min(15, n - 1)].date)}</span>
        <span>{fmtDate(history.points[n - 1].date)}</span>
      </div>
    </Card>
  )
}
```

### `src/features/dashboard/ParserQualityCard.tsx`

```tsx
import type { ParserWeek } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { fmtDate } from '../../lib/format'

const SERIES = [
  { key: 'regex', name: 'Regex', cls: 'bg-series-in' },
  { key: 'ner', name: 'NER', cls: 'bg-series-out' },
  { key: 'llm', name: 'LLM', cls: 'bg-series-3' },
  { key: 'failed', name: 'Không hiểu', cls: 'bg-series-4' },
] as const

export function ParserQualityCard({ weeks, pendingLabels, className }: { weeks: ParserWeek[]; pendingLabels: number; className?: string }) {
  return (
    <Card
      title="Bot hiểu tin nhắn bằng gì"
      subtitle={`Tỉ lệ tin nhắn kho theo bậc parser, ${weeks.length} tuần gần nhất`}
      className={className}
    >
      <div className="flex flex-wrap gap-3 text-xs text-ink-2">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`size-2.5 rounded-[3px] ${s.cls}`} />
            {s.name}
          </span>
        ))}
      </div>
      {weeks.map((w) => {
        const summary = SERIES.map((s) => `${s.name} ${w[s.key]}%`).join(' · ')
        return (
          <div key={w.weekStart} className="flex flex-col gap-1.5">
            <div className="flex justify-between gap-2 text-xs">
              <span className="shrink-0 whitespace-nowrap text-muted">Tuần {fmtDate(w.weekStart)}</span>
              <span className="text-right text-ink-2">{summary}</span>
            </div>
            <div role="img" aria-label={`Tuần ${fmtDate(w.weekStart)}: ${summary}`} className="flex h-3.5 gap-[2px]">
              {SERIES.map((s, j) => (
                <div
                  key={s.key}
                  className={`${s.cls} ${j === 0 ? 'rounded-l' : ''} ${j === SERIES.length - 1 ? 'rounded-r' : ''}`}
                  style={{ width: `${w[s.key]}%` }}
                />
              ))}
            </div>
          </div>
        )
      })}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-3 text-[13px]">
        <span className="text-ink-2">{pendingLabels} mẫu do NER/LLM đọc chờ duyệt</span>
        <a href="/duyet-nhan">Duyệt nhãn</a>
      </div>
    </Card>
  )
}
```

### `src/features/dashboard/StaffTable.tsx`

```tsx
import type { StaffStat } from '../../api/types'
import { Card } from '../../components/ui/Card'

const th = 'border-b border-line py-2 px-2 font-medium'
const td = 'border-b border-line-soft py-2.5 px-2'

export function StaffTable({ staff, className }: { staff: StaffStat[]; className?: string }) {
  return (
    <Card title="Nhân viên" action={<a href="/nhan-vien" className="text-[13px]">Thêm nhân viên</a>} gapClass="gap-3" className={className}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th scope="col" className={`${th} pl-0`}>Tên</th>
              <th scope="col" className={th}>Vai trò</th>
              <th scope="col" className={`${th} text-right`}>Tin kho</th>
              <th scope="col" className={th}>Đúng cú pháp</th>
              <th scope="col" className={`${th} pr-0 text-right`}>Lần Hủy</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((p) => (
              <tr key={p.id}>
                <td className={`${td} pl-0 font-semibold`}>{p.name}</td>
                <td className={`${td} text-muted`}>{p.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</td>
                <td className={`${td} text-right`}>{p.messages}</td>
                <td className={td}>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-[1_1_60px] overflow-hidden rounded-full bg-grid">
                      <span className="block h-full rounded-full bg-series-in" style={{ width: `${p.syntaxOkPct}%` }} />
                    </span>
                    <span className="w-[34px] text-right">{p.syntaxOkPct}%</span>
                  </span>
                </td>
                <td className={`${td} pr-0 text-right`}>{p.undoCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
```

### `src/features/dashboard/RecentTransactions.tsx`

```tsx
import type { RecentTx } from '../../api/types'
import { Card } from '../../components/ui/Card'
import { fmtQty, fmtTime } from '../../lib/format'

const ACTION = {
  IN: { label: 'Nhập', dot: 'bg-series-in' },
  OUT: { label: 'Xuất', dot: 'bg-series-out' },
  REVERSE: { label: 'Hủy', dot: 'bg-faint' },
} as const

function sourceLabel(t: RecentTx): string {
  if (t.source === 'undo') return 'lệnh Hủy'
  if (t.source === 'regex') return 'regex'
  return `${t.source.toUpperCase()}${t.confirmed ? ' · đã OK' : ' · chờ OK'}`
}

export function RecentTransactions({ items, className }: { items: RecentTx[]; className?: string }) {
  return (
    <Card title="Giao dịch gần đây" action={<a href="/giao-dich" className="text-[13px]">Xem tất cả</a>} gapClass="gap-3" className={className}>
      {items.map((t) => {
        const a = ACTION[t.action]
        return (
          <div key={t.id} className="flex items-center gap-3 border-b border-line-soft py-2">
            <span className="w-11 shrink-0 text-xs text-muted">{fmtTime(t.at)}</span>
            <span className="flex w-[58px] shrink-0 items-center gap-1.5 text-xs font-semibold text-ink-2">
              <span aria-hidden="true" className={`size-2 rounded-[2px] ${a.dot}`} />
              {a.label}
            </span>
            <span className="min-w-0 flex-auto truncate">
              <span className="font-semibold">{fmtQty(t.qty, t.unit)}</span> {t.itemName}
              {t.action === 'REVERSE' ? ' (bù trừ)' : ''} <span className="text-muted">· {t.staffName}</span>
            </span>
            <span className="shrink-0 rounded-full bg-chip px-2 py-0.5 text-[11px] font-semibold text-ink-2">{sourceLabel(t)}</span>
          </div>
        )
      })}
    </Card>
  )
}
```

### `src/pages/DashboardPage.tsx`

```tsx
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api, USE_MOCK } from '../api/client'
import type { RangeDays } from '../api/types'
import { ErrorCard } from '../components/ui/ErrorCard'
import { Skeleton } from '../components/ui/Skeleton'
import { InOutBarChart } from '../features/dashboard/InOutBarChart'
import { KpiGrid } from '../features/dashboard/KpiGrid'
import { LowStockCard } from '../features/dashboard/LowStockCard'
import { PageHeader } from '../features/dashboard/PageHeader'
import { ParserQualityCard } from '../features/dashboard/ParserQualityCard'
import { RecentTransactions } from '../features/dashboard/RecentTransactions'
import { StaffTable } from '../features/dashboard/StaffTable'
import { StockLineChart } from '../features/dashboard/StockLineChart'
import { fmtDate } from '../lib/format'
import { useAsync } from '../lib/useAsync'

function parseRange(v: string | null): RangeDays {
  return v === '14' ? 14 : v === '30' ? 30 : 7
}

export default function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const range = parseRange(params.get('range'))
  const [itemId, setItemId] = useState('botmi')

  const summary = useAsync(() => api.getDashboard(range), [range])
  const items = useAsync(() => api.getTrackedItems(), [])
  const history = useAsync(() => api.getStockHistory(itemId), [itemId])

  const s = summary.data
  const periodLabel = s
    ? `${range} ngày qua (${fmtDate(s.from)} – ${fmtDate(s.to)})${USE_MOCK ? ' · dữ liệu mẫu' : ''}`
    : 'Đang tải…'

  return (
    <>
      <PageHeader
        periodLabel={periodLabel}
        range={range}
        onRangeChange={(r) => setParams(r === 7 ? {} : { range: String(r) }, { replace: true })}
      />

      {summary.error && <ErrorCard message={summary.error.message} onRetry={summary.reload} />}

      {!s ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-[110px]" />
            ))}
          </div>
          <div className="flex flex-wrap gap-5">
            <Skeleton className="h-[330px] flex-[2_1_520px]" />
            <Skeleton className="h-[330px] flex-[1_1_300px]" />
          </div>
        </>
      ) : (
        <>
          <KpiGrid kpis={s.kpis} range={range} />
          <div className="flex flex-wrap gap-5">
            <InOutBarChart daily={s.daily} className="flex-[2_1_520px]" />
            <LowStockCard items={s.lowStock} className="flex-[1_1_300px]" />
          </div>
          <div className="flex flex-wrap gap-5">
            <StockLineChart
              items={items.data ?? []}
              itemId={itemId}
              onItemChange={setItemId}
              history={history.data?.item.id === itemId ? history.data : undefined}
              className="flex-[2_1_520px]"
            />
            <ParserQualityCard weeks={s.parserWeekly} pendingLabels={s.pendingLabels} className="flex-[1_1_300px]" />
          </div>
          <div className="flex flex-wrap gap-5">
            <StaffTable staff={s.staff} className="flex-[1_1_420px]" />
            <RecentTransactions items={s.recent} className="flex-[1_1_420px]" />
          </div>
        </>
      )}
    </>
  )
}
```

### `src/pages/PlaceholderPage.tsx`

```tsx
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="m-0 text-[26px] font-bold tracking-[-0.02em]">{title}</h1>
      <span className="text-muted">Trang này sẽ làm ở bước sau.</span>
    </div>
  )
}
```

### `src/pages/LoginPage.tsx`

```tsx
import { useId, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, USE_MOCK } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { Icon } from '../components/ui/Icon'
import { cn } from '../lib/cn'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../mocks/api'

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const e: FieldErrors = {}
  if (!email.trim()) e.email = 'Nhập email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Email chưa đúng định dạng.'
  if (!password) e.password = 'Nhập mật khẩu.'
  else if (password.length < 8) e.password = 'Mật khẩu có ít nhất 8 ký tự.'
  return e
}

const inputCls =
  'h-11 w-full rounded-[10px] border bg-surface px-3 text-sm text-ink outline-none placeholder:text-faint focus:border-series-in focus:ring-2 focus:ring-series-in/25'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const emailId = useId()
  const pwId = useId()

  if (isAuthenticated) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const v = validate(email, password)
    setErrors(v)
    setFormError(null)
    if (v.email || v.password) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(
        err instanceof ApiError && err.status === 401
          ? 'Sai email hoặc mật khẩu.'
          : 'Không kết nối được máy chủ. Thử lại sau.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ground p-4 font-sans text-sm text-ink">
      <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-xl border border-line bg-surface p-8">
        <div className="flex flex-col gap-0.5">
          <span className="text-[17px] font-bold tracking-[-0.01em]">Storagemate</span>
          <span className="text-xs text-muted">Quán Mộc · kho trung tâm</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[22px] font-bold tracking-[-0.02em]">Đăng nhập quản trị</h1>
          <p className="m-0 text-muted">Dùng tài khoản admin do chủ quán tạo.</p>
        </div>

        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-[10px] border border-critical-bd bg-critical-bg px-3 py-2.5 text-[13px] text-critical-text"
            >
              <Icon name="alert" size={16} />
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-[13px] font-medium text-ink-2">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="username"
              placeholder="admin@quan.vn"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((x) => ({ ...x, email: undefined }))
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-err` : undefined}
              className={cn(inputCls, errors.email ? 'border-critical' : 'border-line-strong')}
            />
            {errors.email && (
              <span id={`${emailId}-err`} className="text-xs text-critical-text">
                {errors.email}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={pwId} className="text-[13px] font-medium text-ink-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id={pwId}
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((x) => ({ ...x, password: undefined }))
                }}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? `${pwId}-err` : undefined}
                className={cn(inputCls, 'pr-16', errors.password ? 'border-critical' : 'border-line-strong')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-pressed={showPw}
                aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute inset-y-1 right-1 flex items-center gap-1 rounded-lg border-0 bg-transparent px-2.5 text-xs font-semibold text-link hover:bg-chip"
              >
                {showPw ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {errors.password && (
              <span id={`${pwId}-err`} className="text-xs text-critical-text">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 h-11 w-full rounded-[10px] border-0 bg-primary text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>

        {USE_MOCK && (
          <p className="m-0 text-xs text-faint">
            Bản demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        )}
      </div>
    </div>
  )
}
```

---

## 10. Checklist nghiệm thu

**Giống thiết kế (so ở 1440px):**
- [ ] Sidebar rộng 220px, mục "Tổng quan" nền `#EAF1FB` chữ `#123F78`, badge "Duyệt nhãn" = 14.
- [ ] Header: "Tổng quan kho" 26px/700; dòng phụ "7 ngày qua (25/10 – 31/10) · dữ liệu mẫu".
- [ ] 5 ô KPI một hàng; với 7 ngày, số khớp bản thiết kế (mock dùng cùng công thức sinh số).
- [ ] Biểu đồ cột cao 220px, gridline 3 mức, legend Nhập/Xuất, tooltip khi hover.
- [ ] "Sắp hết hàng" 5 dòng, thứ tự Cà phê hạt → Đường → Bơ lạt → Sữa tươi → Bột mì (với dữ liệu mẫu).
- [ ] Biểu đồ đường: vạch đỏ nét đứt "Mức tối thiểu 20 kg", đổi pill thì đổi nguyên liệu.
- [ ] Thanh parser 4 tuần, khe 2px giữa các đoạn, dòng phần trăm bên phải.
- [ ] Bảng nhân viên 5 dòng, giao dịch gần đây 6 dòng với nhãn nguồn.

**Hành vi:**
- [ ] Chưa đăng nhập vào `/` → về `/login`; đăng nhập xong quay lại đúng trang.
- [ ] Sai mật khẩu → hộp lỗi; bỏ trống → lỗi dưới từng ô; nút khóa khi đang gửi.
- [ ] Đổi 7/14/30 ngày → URL đổi `?range=`, tải lại trang vẫn giữ lựa chọn.
- [ ] Đăng xuất → xóa phiên, về `/login`.

**Responsive & truy cập:**
- [ ] 390px: sidebar lên trên, các card xếp dọc, bảng nhân viên cuộn ngang trong hộp, không trang nào cuộn ngang.
- [ ] Tab đi qua được nav, segmented, pill, nút; có viền focus xanh.
- [ ] Biểu đồ có `aria-label` / bảng ẩn cho trình đọc màn hình.

**Khi nối BE thật:** đặt `VITE_USE_MOCK=false`, `VITE_API_URL=<ngrok>`; backend thêm `GET /api/dashboard/summary`, `GET /api/bot/status`, `GET /api/stock/{id}/history` trả đúng kiểu ở `src/api/types.ts`, và bật CORS cho domain Vercel kèm header `ngrok-skip-browser-warning`.
