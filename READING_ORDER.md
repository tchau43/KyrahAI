# 📚 Thứ tự đọc code - Emergency Hotline Feature

## 🎯 Recommended Reading Order (Top-Down Approach)

### 1️⃣ **Component** - `src/components/emergency/EmergencyHotlineButton.tsx` (5 phút)

**Tại sao đọc đầu tiên:**

- ✅ Hiểu feature làm gì (UI/UX)
- ✅ Xem user interaction
- ✅ Thấy kết quả cuối cùng
- ✅ Dễ visualize flow

**Những gì cần hiểu:**

- Component nhận props gì?
- Render UI như thế nào?
- User click button → chuyện gì xảy ra?
- Dropdown hiển thị gì?

---

### 2️⃣ **Hook** - `src/hooks/useEmergencyHotline.ts` (5 phút)

**Tại sao đọc thứ 2:**

- ✅ Hiểu orchestration logic
- ✅ Xem cách component sử dụng hook
- ✅ Thấy data flow: hook → component
- ✅ Hiểu state management

**Những gì cần hiểu:**

- Hook return gì cho component?
- Khi nào detect region? (useEffect)
- Làm sao load hotlines?
- Handle phone call như thế nào?

**Questions để tự trả lời:**

- `useEmergencyHotline()` được gọi ở đâu?
- `userPreferences` đến từ đâu? (useAuth)
- Khi nào `detectAndLoad()` chạy?

---

### 3️⃣ **Service** - `src/services/region-detection.service.ts` (10 phút)

**Tại sao đọc thứ 3:**

- ✅ Hiểu core detection logic
- ✅ Xem strategy priority
- ✅ Hiểu cách map language/timezone → country
- ✅ Thấy fallback mechanism

**Những gì cần hiểu:**

- Strategy priority: User preferences → Browser locale → Timezone → GLOBAL
- `languageToCountryCode()` - map language → country
- `timezoneToCountryCode()` - map timezone → country
- `detectUserRegion()` - main function

**Questions để tự trả lời:**

- Tại sao user preferences có priority cao nhất?
- Nếu user có `language: 'vi'` → country nào?
- Nếu không có preferences → fallback gì?

---

### 4️⃣ **Data** - `src/data/emergency-hotlines.ts` (5 phút)

**Tại sao đọc cuối:**

- ✅ Hiểu data structure
- ✅ Xem hotlines cho từng country
- ✅ Hiểu format phone numbers
- ✅ Thấy GLOBAL fallback

**Những gì cần hiểu:**

- Structure của `EmergencyHotline`
- Map country code → hotlines array
- `getHotlinesForCountry()` function
- `getPrimaryEmergencyNumber()` function

---

## 🔄 Flow Diagram

```
User opens chat page
    ↓
EmergencyHotlineButton renders
    ↓
useEmergencyHotline() hook mounts
    ↓
detectAndLoad() runs
    ↓
detectUserRegion(userPreferences) ← Service
    ↓
Check user preferences (language/timezone)
    ↓ (if not found)
Check browser locale
    ↓ (if not found)
Check timezone
    ↓ (if not found)
Return 'GLOBAL'
    ↓
getHotlinesForCountry(countryCode) ← Data
    ↓
Set hotlines state
    ↓
Component renders button with hotlines
```

---

## 📖 Alternative: Bottom-Up Approach

Nếu bạn thích hiểu từ foundation lên:

1. **Data** (`emergency-hotlines.ts`) - Foundation
2. **Service** (`region-detection.service.ts`) - Core logic
3. **Hook** (`useEmergencyHotline.ts`) - Orchestration
4. **Component** (`EmergencyHotlineButton.tsx`) - UI

**Khi nào dùng bottom-up:**

- Bạn đã quen với React patterns
- Muốn hiểu sâu từng layer
- Debugging một issue cụ thể

---

## 🎓 Learning Tips

### Khi đọc mỗi file, tự hỏi:

1. **Component:**
   - "Component này render gì?"
   - "User interaction nào?"
   - "Props/state nào cần?"

2. **Hook:**
   - "Hook này làm gì?"
   - "Dependencies là gì?"
   - "Khi nào re-run?"

3. **Service:**
   - "Function này input/output gì?"
   - "Edge cases nào?"
   - "Fallback strategy?"

4. **Data:**
   - "Data structure như thế nào?"
   - "Có thể extend thêm countries không?"
   - "Format phone numbers?"

---

## 🚀 Quick Start (5 phút overview)

Nếu bạn chỉ muốn hiểu nhanh:

1. Đọc `EmergencyHotlineButton.tsx` - lines 1-50 (component structure)
2. Đọc `useEmergencyHotline.ts` - lines 38-90 (hook logic)
3. Đọc `region-detection.service.ts` - lines 271-324 (main function)
4. Đọc `emergency-hotlines.ts` - lines 1-100 (data structure)

---

## 💡 Pro Tips

1. **Dùng "Go to Definition"** trong IDE để jump giữa files
2. **Đọc comments** - code có nhiều comments giải thích "tại sao"
3. **Follow imports** - xem dependencies giữa files
4. **Test trong browser** - đọc code + test thực tế

---

## ❓ Common Questions

**Q: Tại sao không đọc service trước?**
A: Service là implementation detail. Đọc component trước giúp hiểu "what" trước khi hiểu "how".

**Q: Có cần đọc tất cả không?**
A: Không. Tùy mục đích:

- Chỉ muốn dùng feature → đọc Component + Hook
- Muốn extend thêm countries → đọc Data
- Muốn thay đổi detection logic → đọc Service

**Q: File nào quan trọng nhất?**
A: **Hook** - nó là bridge giữa UI và logic. Hiểu hook = hiểu toàn bộ flow.

