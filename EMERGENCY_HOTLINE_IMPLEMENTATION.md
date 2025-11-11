# 🚨 Emergency Hotline Feature - Implementation Guide

## 📋 Tổng quan

Feature này tự động phát hiện region của user và hiển thị số hotline khẩn cấp phù hợp (988 cho US, Samaritans cho UK, v.v.) với một action button để gọi ngay.

## 🎯 Yêu cầu

1. **Auto-detect region**: Tự động phát hiện quốc gia/region của user
2. **Dynamic hotline display**: Hiển thị hotline phù hợp với region
3. **One-click calling**: Button để gọi hotline ngay lập tức
4. **Always accessible**: Luôn hiển thị, dễ truy cập trong chat interface
5. **Fallback mechanism**: Có fallback nếu không detect được region

## 🏗️ Kiến trúc (Architecture)

### 1. **Region Detection Service** (`src/services/region-detection.service.ts`)

- **Tại sao**: Tách logic detection ra service riêng để dễ test và maintain
- **Cách hoạt động** (Priority order):
  - **Ưu tiên 1: User preferences** (language/timezone từ `user_preferences` table) - Most accurate, user's explicit choice
  - Ưu tiên 2: Browser locale (`navigator.language`)
  - Ưu tiên 3: Timezone detection
  - Ưu tiên 4: IP geolocation (optional, có thể thêm sau)
  - Fallback: Default to "Global"

### 2. **Emergency Hotlines Data** (`src/data/emergency-hotlines.ts`)

- **Tại sao**: Tách data ra file riêng để dễ maintain và update
- **Cấu trúc**: Map country code → array of hotlines
- **Mỗi hotline có**:
  - `name`: Tên hotline
  - `number`: Số điện thoại (format: `tel:+1234567890`)
  - `description`: Mô tả ngắn
  - `type`: `emergency` | `crisis` | `support`

### 3. **Custom Hook** (`src/hooks/useEmergencyHotline.ts`)

- **Tại sao**: Encapsulate logic, dễ reuse và test
- **Chức năng**:
  - Detect region on mount
  - Get hotlines for detected region
  - Handle phone call action
  - Manage loading/error states

### 4. **EmergencyHotlineButton Component** (`src/components/emergency/EmergencyHotlineButton.tsx`)

- **Tại sao**: Component riêng để dễ customize và maintain
- **Features**:
  - Visual indicator (icon, color)
  - Dropdown/modal để show multiple hotlines
  - One-click call action
  - Accessible (ARIA labels, keyboard navigation)

### 5. **Integration vào ChatMainView**

- **Vị trí**: Fixed position, luôn visible
- **Design**: Prominent nhưng không intrusive

## 🔄 Flow hoạt động

```
User opens chat
    ↓
useEmergencyHotline hook mounts
    ↓
Region detection service runs
    ↓
Get hotlines for detected region
    ↓
Render EmergencyHotlineButton
    ↓
User clicks button
    ↓
Show hotline options (dropdown/modal)
    ↓
User selects hotline
    ↓
Trigger phone call (tel: link)
```

## 🎨 Design Principles

1. **Safety First**: Button phải dễ thấy và dễ click trong crisis
2. **Non-intrusive**: Không làm gián đoạn chat experience
3. **Accessible**: Support keyboard navigation, screen readers
4. **Responsive**: Hoạt động tốt trên mobile và desktop
5. **Fast**: Detection và rendering phải nhanh

## 📝 Implementation Steps

1. ✅ Create region detection service
2. ✅ Create emergency hotlines data structure
3. ✅ Create useEmergencyHotline hook
4. ✅ Create EmergencyHotlineButton component
5. ✅ Integrate into ChatMainView
6. ✅ Test với các regions khác nhau

## 🧪 Testing Strategy

- Test với các browser locales khác nhau
- Test fallback mechanism
- Test phone call functionality (mobile/desktop)
- Test accessibility (keyboard, screen reader)
- Test responsive design

## 🔮 Future Enhancements

- IP geolocation API integration
- User preference override (cho phép user chọn region manually)
- Analytics tracking (track hotline usage)
- Multi-language support cho hotline descriptions
