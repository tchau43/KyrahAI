# 🔍 useEmergencyHotline Hook - Deep Analysis

## 📋 Tổng quan

File này phân tích **chi tiết** từng phần của `useEmergencyHotline` hook, giải thích **tại sao** code được viết như vậy.

---

## 🏗️ Architecture Overview

```
useEmergencyHotline Hook
    ├─ Dependencies
    │  ├─ useAuth() → userPreferences
    │  ├─ detectUserRegion() → Service
    │  └─ getHotlinesForCountry() → Data
    │
    ├─ State Management
    │  ├─ countryCode
    │  ├─ hotlines
    │  ├─ primaryHotline
    │  ├─ isLoading
    │  └─ error
    │
    ├─ Core Logic
    │  ├─ detectAndLoad() → Detect + Load
    │  ├─ handleCall() → Phone call
    │  └─ refreshDetection() → Re-detect
    │
    └─ Return Values
       └─ All state + functions
```

---

## 📦 Part 1: Imports & Dependencies

### Imports

```tsx
import { useState, useEffect, useCallback } from 'react';
import { detectUserRegion, getCountryName, CountryCode } from '@/services/region-detection.service';
import { getHotlinesForCountry, getPrimaryEmergencyNumber, EmergencyHotline } from '@/data/emergency-hotlines';
import { useAuth } from '@/contexts/AuthContext';
```

**Phân tích**:
- ✅ **React hooks**: `useState`, `useEffect`, `useCallback` - Core React APIs
- ✅ **Service layer**: `detectUserRegion` - Business logic tách riêng
- ✅ **Data layer**: `getHotlinesForCountry` - Data access tách riêng
- ✅ **Context**: `useAuth` - Access user preferences

**Tại sao structure này?**
- ✅ **Separation of concerns**: Mỗi layer có trách nhiệm riêng
- ✅ **Dependency injection**: Hook không hardcode logic
- ✅ **Testability**: Dễ mock dependencies

---

## 🎯 Part 2: Return Type Interface

### Interface Definition

```tsx
interface UseEmergencyHotlineReturn {
  countryCode: CountryCode;
  countryName: string;
  hotlines: EmergencyHotline[];
  primaryHotline: EmergencyHotline | null;
  isLoading: boolean;
  error: Error | null;
  handleCall: (hotline: EmergencyHotline) => void;
  refreshDetection: () => void;
}
```

**Phân tích**:
- ✅ **Type safety**: TypeScript đảm bảo return type
- ✅ **Clear contract**: Component biết hook return gì
- ✅ **Documentation**: Interface là documentation

**Tại sao interface riêng?**
- ✅ **Reusability**: Có thể export interface để dùng ở nơi khác
- ✅ **Type checking**: TypeScript check return type
- ✅ **IDE support**: Autocomplete tốt hơn

---

## 🔄 Part 3: State Management

### State Declarations

```tsx
const { userPreferences } = useAuth();
const [countryCode, setCountryCode] = useState<CountryCode>('GLOBAL');
const [hotlines, setHotlines] = useState<EmergencyHotline[]>([]);
const [primaryHotline, setPrimaryHotline] = useState<EmergencyHotline | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
```

**Phân tích từng state**:

#### 1. `userPreferences` (from useAuth)
```tsx
const { userPreferences } = useAuth();
```
- ✅ **Source**: User preferences từ AuthContext
- ✅ **Purpose**: Pass vào `detectUserRegion()` để có priority
- ✅ **Reactive**: Khi userPreferences thay đổi → hook re-run

#### 2. `countryCode`
```tsx
const [countryCode, setCountryCode] = useState<CountryCode>('GLOBAL');
```
- ✅ **Initial**: `'GLOBAL'` (fallback)
- ✅ **Purpose**: Lưu detected country code
- ✅ **Type**: `CountryCode` (type-safe)

#### 3. `hotlines`
```tsx
const [hotlines, setHotlines] = useState<EmergencyHotline[]>([]);
```
- ✅ **Initial**: Empty array
- ✅ **Purpose**: Lưu danh sách hotlines cho detected country
- ✅ **Type**: Array of `EmergencyHotline`

#### 4. `primaryHotline`
```tsx
const [primaryHotline, setPrimaryHotline] = useState<EmergencyHotline | null>(null);
```
- ✅ **Initial**: `null` (chưa có)
- ✅ **Purpose**: Lưu primary emergency number (911, 999, etc.)
- ✅ **Type**: `EmergencyHotline | null` (có thể không có)

#### 5. `isLoading`
```tsx
const [isLoading, setIsLoading] = useState(true);
```
- ✅ **Initial**: `true` (đang load khi mount)
- ✅ **Purpose**: Track loading state
- ✅ **Usage**: Component có thể show loading indicator

#### 6. `error`
```tsx
const [error, setError] = useState<Error | null>(null);
```
- ✅ **Initial**: `null` (no error)
- ✅ **Purpose**: Track errors
- ✅ **Usage**: Component có thể show error message

**Tại sao nhiều states?**
- ✅ **Granular control**: Mỗi state có mục đích riêng
- ✅ **Reactive updates**: Component re-render khi state thay đổi
- ✅ **Clear state**: Dễ debug và track state changes

---

## 🎯 Part 4: detectAndLoad Function

### Function Analysis

```tsx
const detectAndLoad = useCallback(() => {
  try {
    setIsLoading(true);
    setError(null);

    // Detect region (with user preferences priority)
    const detected = detectUserRegion(userPreferences);
    setCountryCode(detected);

    // Load hotlines for detected region
    const regionHotlines = getHotlinesForCountry(detected);
    setHotlines(regionHotlines);

    // Get primary emergency number
    const primary = getPrimaryEmergencyNumber(detected);
    setPrimaryHotline(primary);

    setIsLoading(false);
  } catch (err) {
    console.error('Error detecting region or loading hotlines:', err);
    setError(err instanceof Error ? err : new Error('Unknown error'));
    setIsLoading(false);
    
    // Fallback to GLOBAL
    setCountryCode('GLOBAL');
    setHotlines(getHotlinesForCountry('GLOBAL'));
    setPrimaryHotline(getPrimaryEmergencyNumber('GLOBAL'));
  }
}, [userPreferences]);
```

### Phân tích từng phần

#### 1. `useCallback` - Tại sao?

```tsx
const detectAndLoad = useCallback(() => {
  // ...
}, [userPreferences]);
```

**Tại sao dùng `useCallback`?**
- ✅ **Memoization**: Function không recreate mỗi render
- ✅ **Dependency stability**: `detectAndLoad` chỉ thay đổi khi `userPreferences` thay đổi
- ✅ **useEffect dependency**: Có thể dùng trong `useEffect` dependency array

**Nếu không dùng `useCallback`?**
```tsx
// ❌ Bad: Function recreate mỗi render
const detectAndLoad = () => {
  // ...
};

useEffect(() => {
  detectAndLoad();
}, [detectAndLoad]); // ← detectAndLoad thay đổi mỗi render → Infinite loop!
```

**Với `useCallback`**:
```tsx
// ✅ Good: Function chỉ recreate khi userPreferences thay đổi
const detectAndLoad = useCallback(() => {
  // ...
}, [userPreferences]);

useEffect(() => {
  detectAndLoad();
}, [detectAndLoad]); // ← detectAndLoad stable → Chỉ chạy khi cần
```

---

#### 2. Loading State Management

```tsx
setIsLoading(true);
setError(null);
// ... do work ...
setIsLoading(false);
```

**Pattern**: Loading state management
- ✅ **Start**: `setIsLoading(true)` - Bắt đầu loading
- ✅ **Clear error**: `setError(null)` - Clear previous errors
- ✅ **End**: `setIsLoading(false)` - Kết thúc loading

**Tại sao pattern này?**
- ✅ **User feedback**: Component biết đang loading
- ✅ **Error handling**: Clear errors trước khi retry
- ✅ **State consistency**: Loading state luôn đúng

---

#### 3. Region Detection

```tsx
const detected = detectUserRegion(userPreferences);
setCountryCode(detected);
```

**Flow**:
1. Call `detectUserRegion()` với `userPreferences`
2. Service check: userPreferences → browser locale → timezone → GLOBAL
3. Return country code (e.g., 'US', 'VN', 'GLOBAL')
4. Set state

**Tại sao pass `userPreferences`?**
- ✅ **Priority**: User preferences có priority cao nhất
- ✅ **Accuracy**: Chính xác hơn browser locale
- ✅ **User choice**: Tôn trọng user's explicit preference

---

#### 4. Load Hotlines

```tsx
const regionHotlines = getHotlinesForCountry(detected);
setHotlines(regionHotlines);
```

**Flow**:
1. Call `getHotlinesForCountry()` với country code
2. Data layer lookup hotlines cho country đó
3. Return array of hotlines
4. Set state

**Tại sao tách riêng?**
- ✅ **Separation**: Data access tách khỏi business logic
- ✅ **Reusability**: Function có thể dùng ở nơi khác
- ✅ **Testability**: Dễ test data layer riêng

---

#### 5. Get Primary Hotline

```tsx
const primary = getPrimaryEmergencyNumber(detected);
setPrimaryHotline(primary);
```

**Flow**:
1. Call `getPrimaryEmergencyNumber()` với country code
2. Data layer tìm emergency type hotline (911, 999, etc.)
3. Return primary hotline hoặc null
4. Set state

**Tại sao primary riêng?**
- ✅ **Quick access**: Component có thể gọi ngay primary
- ✅ **UX**: One-click call cho primary hotline
- ✅ **Convenience**: Không cần loop qua array

---

#### 6. Error Handling

```tsx
catch (err) {
  console.error('Error detecting region or loading hotlines:', err);
  setError(err instanceof Error ? err : new Error('Unknown error'));
  setIsLoading(false);
  
  // Fallback to GLOBAL
  setCountryCode('GLOBAL');
  setHotlines(getHotlinesForCountry('GLOBAL'));
  setPrimaryHotline(getPrimaryEmergencyNumber('GLOBAL'));
}
```

**Error handling pattern**:
- ✅ **Log error**: Console log để debug
- ✅ **Set error state**: Component có thể show error
- ✅ **Fallback**: Luôn có fallback (GLOBAL) để app không crash
- ✅ **Graceful degradation**: App vẫn hoạt động dù có error

**Tại sao fallback GLOBAL?**
- ✅ **Always works**: GLOBAL hotlines luôn có
- ✅ **User experience**: App không crash
- ✅ **Safety**: User vẫn có emergency numbers

---

## 🔄 Part 5: useEffect - Initialization

### useEffect Analysis

```tsx
useEffect(() => {
  detectAndLoad();
}, [detectAndLoad]);
```

**Phân tích**:

#### 1. When does it run?

**Runs when**:
- ✅ Component mounts (first render)
- ✅ `detectAndLoad` function changes (khi `userPreferences` thay đổi)

**Doesn't run when**:
- ❌ Component re-renders (không có dependency change)
- ❌ Other state changes (không liên quan)

---

#### 2. Dependency: `[detectAndLoad]`

**Tại sao dependency này?**
- ✅ **Re-run when needed**: Khi `userPreferences` thay đổi → `detectAndLoad` recreate → effect re-run
- ✅ **No infinite loop**: `useCallback` đảm bảo function stable
- ✅ **Correct timing**: Chạy đúng lúc cần

**Nếu không có dependency?**
```tsx
// ❌ Bad: Chỉ chạy 1 lần, không update khi userPreferences thay đổi
useEffect(() => {
  detectAndLoad();
}, []); // Empty deps
```

**Với dependency**:
```tsx
// ✅ Good: Re-run khi userPreferences thay đổi
useEffect(() => {
  detectAndLoad();
}, [detectAndLoad]); // Re-run when detectAndLoad changes
```

---

#### 3. No cleanup needed

```tsx
useEffect(() => {
  detectAndLoad();
  // No return statement = no cleanup
}, [detectAndLoad]);
```

**Tại sao không cần cleanup?**
- ✅ **No subscriptions**: Không có event listeners, timers, etc.
- ✅ **Synchronous**: Function chạy sync, không có async operations cần cancel
- ✅ **State updates**: Chỉ update state, không có side effects cần cleanup

---

## 📞 Part 6: handleCall Function

### Function Analysis

```tsx
const handleCall = useCallback((hotline: EmergencyHotline) => {
  try {
    let phoneNumber = hotline.number;

    // Ensure tel: protocol
    if (!phoneNumber.startsWith('tel:')) {
      const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      if (!cleaned.startsWith('+') && !cleaned.startsWith('tel:')) {
        phoneNumber = `tel:${cleaned}`;
      } else {
        phoneNumber = `tel:${cleaned}`;
      }
    }

    // Open phone dialer
    window.location.href = phoneNumber;

    // Optional: Analytics tracking
    // trackHotlineCall(hotline, countryCode);
  } catch (err) {
    console.error('Error initiating phone call:', err);
  }
}, []);
```

### Phân tích từng phần

#### 1. `useCallback` với empty deps

```tsx
const handleCall = useCallback((hotline: EmergencyHotline) => {
  // ...
}, []); // Empty dependencies
```

**Tại sao empty deps?**
- ✅ **Stable function**: Function không thay đổi giữa renders
- ✅ **No dependencies**: Function không phụ thuộc vào state/props
- ✅ **Performance**: Không recreate function mỗi render

**Function có cần state/props không?**
- ❌ Không cần `countryCode` (có thể thêm analytics sau)
- ❌ Không cần `hotlines` (đã có trong parameter)
- ✅ Function pure: Input → Output, không side effects (trừ `window.location`)

---

#### 2. Phone Number Normalization

```tsx
let phoneNumber = hotline.number;

if (!phoneNumber.startsWith('tel:')) {
  const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  if (!cleaned.startsWith('+') && !cleaned.startsWith('tel:')) {
    phoneNumber = `tel:${cleaned}`;
  } else {
    phoneNumber = `tel:${cleaned}`;
  }
}
```

**Logic breakdown**:

**Case 1: Đã có `tel:` prefix**
```tsx
phoneNumber = "tel:911"
// → Không cần normalize, dùng luôn
```

**Case 2: Không có `tel:` prefix**
```tsx
phoneNumber = "1-800-799-7233"
// → Remove spaces, dashes, parentheses
cleaned = "18007997233"
// → Add tel: prefix
phoneNumber = "tel:18007997233"
```

**Case 3: Có `+` prefix**
```tsx
phoneNumber = "+18007997233"
// → Remove spaces, dashes
cleaned = "+18007997233"
// → Add tel: prefix
phoneNumber = "tel:+18007997233"
```

**Tại sao normalize?**
- ✅ **Consistency**: Tất cả numbers đều có `tel:` prefix
- ✅ **Browser compatibility**: Một số browser cần `tel:` prefix
- ✅ **Clean format**: Remove formatting characters

---

#### 3. Open Phone Dialer

```tsx
window.location.href = phoneNumber;
```

**How it works**:
- ✅ **Browser behavior**: Browser detect `tel:` protocol
- ✅ **Mobile**: Opens phone dialer
- ✅ **Desktop**: May open dialer hoặc do nothing (depends on browser)

**Alternative approaches**:
```tsx
// Option 1: window.location.href (current)
window.location.href = 'tel:911';
// ✅ Works everywhere
// ✅ Simple

// Option 2: window.open
window.open('tel:911');
// ⚠️ May be blocked by popup blocker

// Option 3: <a> tag
<a href="tel:911">Call</a>
// ✅ Semantic HTML
// ❌ Need to create element
```

**Tại sao dùng `window.location.href`?**
- ✅ **Simple**: Một dòng code
- ✅ **Reliable**: Works trên mọi browser
- ✅ **No popup blocker**: Không bị block

---

#### 4. Error Handling

```tsx
catch (err) {
  console.error('Error initiating phone call:', err);
  // Could show error toast here
}
```

**Error handling**:
- ✅ **Log error**: Console log để debug
- ✅ **Graceful**: Không crash app
- ✅ **Future**: Có thể thêm error toast

**Tại sao không throw error?**
- ✅ **User experience**: Không muốn crash app
- ✅ **Non-critical**: Phone call failure không critical
- ✅ **Silent failure**: User có thể thử lại

---

## 🔄 Part 7: refreshDetection Function

### Function Analysis

```tsx
const refreshDetection = useCallback(() => {
  detectAndLoad();
}, [detectAndLoad]);
```

**Phân tích**:

#### 1. Simple wrapper

```tsx
const refreshDetection = useCallback(() => {
  detectAndLoad();
}, [detectAndLoad]);
```

**Tại sao wrapper function?**
- ✅ **API consistency**: Hook return function, không expose internal `detectAndLoad`
- ✅ **Future extensibility**: Có thể thêm logic sau (e.g., analytics)
- ✅ **Clear intent**: Tên function rõ ràng hơn

**Nếu expose `detectAndLoad` trực tiếp?**
```tsx
// ❌ Bad: Expose internal implementation
return {
  detectAndLoad, // ← Internal function exposed
  // ...
};
```

**Với wrapper**:
```tsx
// ✅ Good: Clean API
return {
  refreshDetection, // ← Clear intent
  // ...
};
```

---

#### 2. `useCallback` với `detectAndLoad` dependency

```tsx
const refreshDetection = useCallback(() => {
  detectAndLoad();
}, [detectAndLoad]);
```

**Tại sao dependency `[detectAndLoad]`?**
- ✅ **Stable reference**: Function chỉ thay đổi khi `detectAndLoad` thay đổi
- ✅ **Correct behavior**: Khi `userPreferences` thay đổi → `detectAndLoad` recreate → `refreshDetection` recreate
- ✅ **No stale closure**: Luôn gọi current `detectAndLoad`

---

## 📤 Part 8: Return Values

### Return Statement

```tsx
return {
  countryCode,
  countryName: getCountryName(countryCode),
  hotlines,
  primaryHotline,
  isLoading,
  error,
  handleCall,
  refreshDetection,
};
```

**Phân tích từng return value**:

#### 1. `countryCode`
- ✅ **Raw value**: Country code (e.g., 'US', 'VN')
- ✅ **Usage**: Component có thể dùng để display hoặc logic

#### 2. `countryName`
- ✅ **Computed value**: `getCountryName(countryCode)` - Convert code → name
- ✅ **Usage**: Display country name trong UI
- ✅ **Computed on return**: Tính toán mỗi render (có thể optimize với `useMemo` nếu cần)

#### 3. `hotlines`
- ✅ **Array**: Danh sách hotlines cho country
- ✅ **Usage**: Render trong dropdown

#### 4. `primaryHotline`
- ✅ **Single value**: Primary emergency number
- ✅ **Usage**: Quick call button

#### 5. `isLoading`
- ✅ **Boolean**: Loading state
- ✅ **Usage**: Show loading indicator

#### 6. `error`
- ✅ **Error | null**: Error state
- ✅ **Usage**: Show error message

#### 7. `handleCall`
- ✅ **Function**: Call hotline
- ✅ **Usage**: Button onClick handler

#### 8. `refreshDetection`
- ✅ **Function**: Re-detect region
- ✅ **Usage**: Manual refresh (nếu cần)

---

## 🔄 Data Flow

### Complete Flow

```
Component mounts
    ↓
useEmergencyHotline() hook runs
    ↓
useState() → Initialize states
    ↓
useEffect() → detectAndLoad() runs
    ↓
detectUserRegion(userPreferences)
    ├─ Check userPreferences → country code
    ├─ Fallback: browser locale → country code
    ├─ Fallback: timezone → country code
    └─ Fallback: GLOBAL
    ↓
getHotlinesForCountry(countryCode)
    └─ Return hotlines array
    ↓
getPrimaryEmergencyNumber(countryCode)
    └─ Return primary hotline
    ↓
setState() → Update all states
    ↓
Component re-renders with new data
    ↓
User clicks button
    ↓
handleCall(hotline)
    ↓
window.location.href = 'tel:...'
    ↓
Phone dialer opens
```

---

## 🎯 Design Patterns Used

### 1. Custom Hook Pattern
- ✅ Encapsulate business logic
- ✅ Reusable across components
- ✅ Testable independently

### 2. Separation of Concerns
- ✅ Hook = Logic layer
- ✅ Service = Business logic
- ✅ Data = Data access

### 3. Error Boundary Pattern
- ✅ Try-catch với fallback
- ✅ Graceful degradation
- ✅ Always return valid state

### 4. Loading State Pattern
- ✅ `isLoading` state
- ✅ Set true before async, false after
- ✅ Component can show loading UI

---

## 💡 Key Insights

### 1. Why `useCallback` for `detectAndLoad`?

```tsx
const detectAndLoad = useCallback(() => {
  // ...
}, [userPreferences]);
```

**Reason**:
- ✅ Prevent infinite loop trong `useEffect`
- ✅ Function stable giữa renders (trừ khi `userPreferences` thay đổi)
- ✅ Performance: Không recreate function mỗi render

---

### 2. Why `useCallback` for `handleCall`?

```tsx
const handleCall = useCallback((hotline: EmergencyHotline) => {
  // ...
}, []); // Empty deps
```

**Reason**:
- ✅ Function không phụ thuộc state/props
- ✅ Stable reference → không trigger re-renders
- ✅ Performance: Không recreate function

---

### 3. Why separate `primaryHotline` state?

```tsx
const [primaryHotline, setPrimaryHotline] = useState<EmergencyHotline | null>(null);
```

**Reason**:
- ✅ Quick access: Không cần loop qua array
- ✅ UX: One-click call
- ✅ Convenience: Component có thể check `if (primaryHotline)`

**Alternative**:
```tsx
// ❌ Bad: Phải loop mỗi lần
const primaryHotline = hotlines.find(h => h.type === 'emergency');
```

**Current**:
```tsx
// ✅ Good: Pre-computed, ready to use
const primaryHotline = ...; // Already computed
```

---

### 4. Why `getCountryName()` in return?

```tsx
return {
  countryName: getCountryName(countryCode),
  // ...
};
```

**Reason**:
- ✅ Convenience: Component không cần import `getCountryName`
- ✅ Clean API: Hook cung cấp đầy đủ data
- ⚠️ **Trade-off**: Tính toán mỗi render (có thể optimize với `useMemo`)

**Optimization** (nếu cần):
```tsx
const countryName = useMemo(() => getCountryName(countryCode), [countryCode]);
return { countryName, ... };
```

---

## 🎓 Best Practices Applied

1. ✅ **Custom Hook**: Encapsulate logic
2. ✅ **useCallback**: Memoize functions
3. ✅ **Error handling**: Try-catch với fallback
4. ✅ **Loading states**: Track async operations
5. ✅ **Type safety**: TypeScript interfaces
6. ✅ **Separation of concerns**: Logic tách khỏi UI
7. ✅ **Clean API**: Return values rõ ràng

---

## 📚 Summary

**Hook này làm gì?**
1. ✅ Detect user region (user preferences → browser locale → timezone)
2. ✅ Load hotlines cho detected region
3. ✅ Get primary emergency number
4. ✅ Handle phone call actions
5. ✅ Manage loading/error states

**Tại sao structure này?**
- ✅ **Separation**: Logic tách khỏi UI
- ✅ **Reusability**: Có thể dùng ở nhiều components
- ✅ **Testability**: Dễ test logic riêng
- ✅ **Maintainability**: Code rõ ràng, dễ maintain

