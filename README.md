# Storagemate UI

Trang quản trị web của **Storagemate**, hệ thống quản lý kho cho quán qua Zalo Bot. Nhân viên báo nhập/xuất bằng tin nhắn Zalo, bot đọc tin (regex → NER → LLM) và ghi vào kho. Trang này cho chủ quán xem toàn cảnh kho và chất lượng bot trên một màn hình.

Bản hiện tại có **trang đăng nhập admin** và **trang Tổng quan kho**. Backend chưa có nên trang chạy bằng mock data. Kiểu dữ liệu và hàm gọi API đã khớp với API thật, nên khi có BE chỉ cần đổi biến môi trường.

## Trang Tổng quan kho

| Khối | Nội dung |
|---|---|
| **KPI** | Lượt nhập, lượt xuất (kèm % so với kỳ trước), số nguyên liệu dưới mức tối thiểu, tỉ lệ tin hiểu ngay bằng regex, tỉ lệ tin phải gõ lại |
| **Lượt nhập và xuất theo ngày** | Biểu đồ cột đôi, hover xem số từng ngày |
| **Sắp hết hàng** | 5 nguyên liệu có tỉ lệ tồn / mức tối thiểu thấp nhất, trạng thái *Dưới mức* / *Sắp chạm* / *Đủ*, ước tính còn đủ dùng bao nhiêu ngày |
| **Tồn theo thời gian** | Biểu đồ đường 30 ngày của nguyên liệu đang theo dõi (chọn bằng pill), có vạch mức tối thiểu |
| **Bot hiểu tin nhắn bằng gì** | Tỉ lệ Regex / NER / LLM / Không hiểu theo từng tuần, số mẫu chờ duyệt nhãn |
| **Nhân viên** | Số tin kho, % đúng cú pháp, số lần Hủy của từng người |
| **Giao dịch gần đây** | Các giao dịch mới nhất kèm nguồn parser đã đọc tin |

Bộ lọc **7 / 14 / 30 ngày** nằm trên URL (`?range=14`), nên tải lại trang hay gửi link cho người khác vẫn giữ lựa chọn. Sidebar hiện trạng thái webhook Zalo Bot và số nhãn đang chờ duyệt.

Các mục khác trong sidebar (Tồn kho, Giao dịch, Nhân viên…) đã có route nhưng mới là trang trống, sẽ làm ở bước sau.

## Chạy thử

Cần Node 20.19+ hoặc 22.12+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Đăng nhập bằng tài khoản demo: **`admin@storagemate.vn`** / **`storagemate123`**

| Lệnh | Việc |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Kiểm tra type và build ra `dist/` |
| `npm run preview` | Xem bản build |
| `npm run lint` | Chạy oxlint |

## Nối backend thật

Chép `.env.example` thành `.env.local` rồi sửa:

```env
VITE_USE_MOCK=false
VITE_API_URL=https://ten-ban.ngrok-free.app
```

Mọi request gửi kèm `Authorization: Bearer <token>` và `ngrok-skip-browser-warning: 1`. Khi API trả `401`, trang tự xóa phiên và quay về `/login`.

| Hàm FE (`src/api/client.ts`) | Endpoint |
|---|---|
| `api.login` | `POST /api/auth/login` (form `username`, `password`) |
| `api.getDashboard` | `GET /api/dashboard/summary?range=7` *(cần thêm ở BE)* |
| `api.getTrackedItems` | `GET /api/items?tracked=true` |
| `api.getStockHistory` | `GET /api/stock/{itemId}/history?days=30` |
| `api.getBotStatus` | `GET /api/bot/status` *(cần thêm ở BE)* |

Dữ liệu trả về phải đúng kiểu trong [src/api/types.ts](src/api/types.ts). Ngày có dạng `YYYY-MM-DD`, thời điểm là chuỗi ISO có múi giờ `+07:00`. Backend cần bật CORS cho domain deploy và cho phép header `ngrok-skip-browser-warning`.

## Công nghệ

React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router 7. Biểu đồ vẽ tay bằng div/SVG, không dùng thư viện chart.

## Cấu trúc

```
src/
├── api/              # kiểu dữ liệu (hợp đồng với BE) và client gọi API
├── mocks/            # dữ liệu mẫu cố định, mốc cuối 31/10/2026
├── auth/             # lưu phiên, AuthContext, chặn route khi chưa đăng nhập
├── lib/              # định dạng số/ngày, công thức biểu đồ, hook tải dữ liệu
├── components/       # layout (sidebar, khung trang) và UI dùng chung
├── features/dashboard/  # các khối của trang Tổng quan
└── pages/            # Login, Dashboard, trang placeholder
```

Màu, cỡ chữ và khoảng cách được khai báo một lần trong `@theme` ở [src/index.css](src/index.css), dùng qua class Tailwind (`bg-ground`, `text-muted`…). Thiết kế chi tiết, công thức từng biểu đồ và checklist nghiệm thu nằm trong [storagemate-dashboard-spec.md](storagemate-dashboard-spec.md).
