/**
 * Id kho tổng trong bảng `locations` (KT_SG). Dùng để lấy nhóm hàng của riêng kho tổng:
 * GET /api/items/categories?locationId=1 (người dùng chốt giữ cách này, 2026-11-09).
 * Các API /api/stock/* tự biết kho tổng nên không cần id này.
 */
export const WAREHOUSE_ID = 1

export const PAGE_SIZE = 50
