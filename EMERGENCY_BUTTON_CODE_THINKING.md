# 🧠 Tư duy Code - EmergencyHotlineButton Component

## 📋 Tổng quan

File này giải thích **tại sao** code được viết như vậy, không chỉ **làm gì**. Mỗi quyết định đều có lý do cụ thể.

---

## 🎯 Component Purpose

**Mục đích**: Hiển thị button emergency hotline luôn accessible, với dropdown để chọn nhiều hotlines.

**Requirements**:
- ✅ Luôn visible (fixed position)
- ✅ One-click call primary hotline
- ✅ Dropdown cho nhiều options
- ✅ Accessible (keyboard, screen readers)
- ✅ Responsive (mobile/desktop)

---

## 🏗️ Architecture Decisions

### 1. **Tại sao dùng Custom Hook?**

```tsx
const { countryName, hotlines, primaryHotline, isLoading, handleCall } = useEmergencyHotline();
```

**Tư duy**:
- ✅ **Separation of Concerns**: Component chỉ lo UI, hook lo business logic
- ✅ **Reusability**: Hook có thể dùng ở component khác
- ✅ **Testability**: Test hook riêng, test component riêng
- ✅ **Clean Code**: Component ngắn gọn, dễ đọc

**Nếu không dùng hook**:
```tsx
// ❌ Bad: Logic lẫn với UI
const [countryCode, setCountryCode] = useState('GLOBAL');
useEffect(() => {
  // 50 lines of detection logic...
}, []);
```

**Với hook**:
```tsx
// ✅ Good: Logic tách riêng
const { countryCode } = useEmergencyHotline();
```

---

### 2. **Tại sao dùng `useRef` cho dropdown?**

```tsx
const dropdownRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);
```

**Tư duy**:
- ✅ **Direct DOM access**: Cần check `contains()` để detect click outside
- ✅ **No re-render**: `useRef` không trigger re-render khi thay đổi
- ✅ **Stable reference**: Ref không thay đổi giữa các renders

**Tại sao không dùng state?**
```tsx
// ❌ Bad: Không cần state cho DOM element
const [dropdownElement, setDropdownElement] = useState<HTMLDivElement | null>(null);
```

**Với ref**:
```tsx
// ✅ Good: Chỉ cần reference, không cần state
const dropdownRef = useRef<HTMLDivElement>(null);
```

---

### 3. **Tại sao 2 `useEffect` riêng cho click outside và Escape?**

```tsx
// Effect 1: Click outside
useEffect(() => {
  function handleClickOutside(event: MouseEvent) { ... }
  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [isOpen]);

// Effect 2: Escape key
useEffect(() => {
  function handleEscape(event: KeyboardEvent) { ... }
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen]);
```

**Tư duy**:
- ✅ **Single Responsibility**: Mỗi effect làm 1 việc
- ✅ **Clear dependencies**: Dễ hiểu khi nào effect chạy
- ✅ **Easy to debug**: Bug ở click outside → check effect 1, bug ở keyboard → check effect 2

**Nếu gộp lại**:
```tsx
// ❌ Bad: Khó maintain, logic lẫn lộn
useEffect(() => {
  function handleClickOutside() { ... }
  function handleEscape() { ... }
  // 20 lines of mixed logic...
}, [isOpen]);
```

**Tách riêng**:
```tsx
// ✅ Good: Mỗi effect rõ ràng, dễ maintain
useEffect(() => { /* click outside logic */ }, [isOpen]);
useEffect(() => { /* escape key logic */ }, [isOpen]);
```

---

### 4. **Tại sao `handleQuickCall` và `handleHotlineSelect` tách riêng?**

```tsx
const handleQuickCall = () => {
  if (primaryHotline) {
    handleCall(primaryHotline);
  } else {
    setIsOpen(!isOpen);
  }
};

const handleHotlineSelect = (hotline: EmergencyHotline) => {
  handleCall(hotline);
  setIsOpen(false);
};
```

**Tư duy**:
- ✅ **Different behaviors**: Quick call = one-click, Select = choose from list
- ✅ **Clear intent**: Tên function nói rõ mục đích
- ✅ **Easy to modify**: Thay đổi quick call không ảnh hưởng select

**Nếu gộp lại**:
```tsx
// ❌ Bad: Logic phức tạp, khó hiểu
const handleClick = (hotline?: EmergencyHotline) => {
  if (hotline) {
    handleCall(hotline);
    setIsOpen(false);
  } else if (primaryHotline) {
    handleCall(primaryHotline);
  } else {
    setIsOpen(!isOpen);
  }
};
```

**Tách riêng**:
```tsx
// ✅ Good: Mỗi function rõ ràng, dễ test
const handleQuickCall = () => { /* quick call logic */ };
const handleHotlineSelect = (hotline) => { /* select logic */ };
```

---

### 5. **Tại sao early return khi loading?**

```tsx
if (isLoading || hotlines.length === 0) {
  return null;
}
```

**Tư duy**:
- ✅ **Guard clause pattern**: Xử lý edge cases trước
- ✅ **No unnecessary rendering**: Không render khi chưa sẵn sàng
- ✅ **Clear intent**: Code đọc như "nếu chưa ready thì không render"

**Nếu không early return**:
```tsx
// ❌ Bad: Nested conditions, khó đọc
return (
  <div>
    {!isLoading && hotlines.length > 0 && (
      <button>...</button>
    )}
  </div>
);
```

**Với early return**:
```tsx
// ✅ Good: Flat structure, dễ đọc
if (isLoading || hotlines.length === 0) return null;
return <button>...</button>;
```

---

### 6. **Tại sao tính `positionClasses` trước return?**

```tsx
const positionClasses = position === 'fixed'
  ? 'fixed bottom-24 right-4 md:bottom-28 md:right-6 lg:bottom-32 z-50'
  : 'relative';
```

**Tư duy**:
- ✅ **Separation**: Logic tách khỏi JSX
- ✅ **Readability**: JSX sạch hơn, dễ đọc
- ✅ **Reusability**: Có thể dùng lại `positionClasses`
- ✅ **Testability**: Dễ test logic riêng

**Nếu inline**:
```tsx
// ❌ Bad: JSX phức tạp, khó đọc
<div className={`${position === 'fixed' ? 'fixed bottom-24...' : 'relative'} ${className}`}>
```

**Tách ra**:
```tsx
// ✅ Good: JSX sạch, logic rõ ràng
const positionClasses = position === 'fixed' ? '...' : '...';
return <div className={`${positionClasses} ${className}`}>;
```

---

### 7. **Tại sao dùng template string cho className?**

```tsx
className={`
  flex items-center gap-2
  px-4 py-3 md:px-5 md:py-3
  bg-red-600 hover:bg-red-700
  ...
`}
```

**Tư duy**:
- ✅ **Multi-line**: Dễ đọc, dễ format
- ✅ **Grouping**: Có thể group related classes
- ✅ **Comments**: Có thể thêm comments (nếu cần)

**Nếu single line**:
```tsx
// ❌ Bad: Khó đọc, dài dòng
className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 bg-red-600 hover:bg-red-700..."
```

**Template string**:
```tsx
// ✅ Good: Dễ đọc, dễ maintain
className={`
  flex items-center gap-2
  px-4 py-3 md:px-5 md:py-3
  bg-red-600 hover:bg-red-700
`}
```

---

### 8. **Tại sao conditional rendering cho dropdown arrow?**

```tsx
{hotlines.length > 1 && (
  <svg>...</svg>
)}
```

**Tư duy**:
- ✅ **UX**: Chỉ show arrow khi có nhiều options
- ✅ **Visual clarity**: User biết có dropdown hay không
- ✅ **Performance**: Không render khi không cần

**Nếu luôn render**:
```tsx
// ❌ Bad: Confusing UX nếu chỉ có 1 hotline
<svg>...</svg> // Arrow luôn hiện, nhưng không có dropdown
```

**Conditional**:
```tsx
// ✅ Good: Arrow chỉ hiện khi có dropdown
{hotlines.length > 1 && <svg>...</svg>}
```

---

### 9. **Tại sao dùng `role="menu"` và `role="menuitem"`?**

```tsx
<div role="menu" aria-label="Emergency hotlines">
  <button role="menuitem" onClick={...}>
```

**Tư duy**:
- ✅ **Accessibility**: Screen readers hiểu đây là menu
- ✅ **Semantic HTML**: Đúng chuẩn ARIA
- ✅ **Keyboard navigation**: Browser tự động support

**Nếu không có role**:
```tsx
// ❌ Bad: Screen reader không hiểu structure
<div>
  <button onClick={...}>
```

**Với ARIA**:
```tsx
// ✅ Good: Screen reader biết đây là menu
<div role="menu">
  <button role="menuitem">
```

---

### 10. **Tại sao map với index làm key?**

```tsx
{hotlines.map((hotline, index) => (
  <button key={index}>
```

**Tư duy**:
- ⚠️ **Trade-off**: Index key không ideal, nhưng acceptable trong case này
- ✅ **Stable list**: Hotlines không thay đổi thứ tự
- ✅ **No add/remove**: Không có add/remove operations
- ✅ **Simple**: Đơn giản, không cần unique ID

**Lý tưởng hơn**:
```tsx
// ✅ Better: Nếu hotline có unique ID
{hotlines.map((hotline) => (
  <button key={hotline.id}>
```

**Nhưng trong case này**:
```tsx
// ✅ Acceptable: List stable, không thay đổi
{hotlines.map((hotline, index) => (
  <button key={index}>
```

---

### 11. **Tại sao conditional className cho emergency/crisis?**

```tsx
className={`
  ...
  ${isEmergency ? 'bg-red-50 hover:bg-red-100' : ''}
  ${isCrisis ? 'bg-orange-50 hover:bg-orange-100' : ''}
`}
```

**Tư duy**:
- ✅ **Visual distinction**: Emergency = red, Crisis = orange
- ✅ **UX**: User dễ phân biệt loại hotline
- ✅ **Conditional styling**: Chỉ apply khi cần

**Nếu không conditional**:
```tsx
// ❌ Bad: Tất cả giống nhau, khó phân biệt
className="w-full text-left px-4 py-3..."
```

**Conditional**:
```tsx
// ✅ Good: Visual distinction rõ ràng
className={`
  ...
  ${isEmergency ? 'bg-red-50' : ''}
  ${isCrisis ? 'bg-orange-50' : ''}
`}
```

---

### 12. **Tại sao format phone number?**

```tsx
{formatPhoneNumber(hotline.number)}
```

**Tư duy**:
- ✅ **Readability**: `tel:+18007997233` → `1-800-799-7233`
- ✅ **UX**: User dễ đọc số điện thoại
- ✅ **Consistency**: Format nhất quán

**Nếu không format**:
```tsx
// ❌ Bad: Khó đọc
<span>tel:+18007997233</span>
```

**Với format**:
```tsx
// ✅ Good: Dễ đọc
<span>1-800-799-7233</span>
```

---

## 🎨 Design Patterns Used

### 1. **Custom Hook Pattern**
- Tách business logic ra hook riêng
- Component chỉ lo UI

### 2. **Guard Clause Pattern**
- Early return cho edge cases
- Giảm nesting

### 3. **Conditional Rendering**
- Render dựa trên state/conditions
- Performance optimization

### 4. **Event Delegation**
- Click outside detection
- Escape key handling

### 5. **Controlled Component**
- State quản lý dropdown open/close
- Predictable behavior

---

## 🚀 Best Practices Applied

1. ✅ **Single Responsibility**: Mỗi function làm 1 việc
2. ✅ **DRY (Don't Repeat Yourself)**: Reuse logic qua hook
3. ✅ **Accessibility**: ARIA labels, keyboard navigation
4. ✅ **Performance**: Conditional rendering, early returns
5. ✅ **Type Safety**: TypeScript types cho tất cả
6. ✅ **Clean Code**: Tên rõ ràng, comments giải thích "tại sao"
7. ✅ **Error Handling**: Try-catch trong hook
8. ✅ **Responsive**: Mobile-first design với Tailwind breakpoints

---

## 💡 Key Takeaways

1. **Tách logic khỏi UI**: Hook cho business logic, component cho UI
2. **Early returns**: Xử lý edge cases trước
3. **Clear naming**: Tên function nói rõ mục đích
4. **Accessibility first**: ARIA, keyboard navigation
5. **Performance**: Conditional rendering, không render khi không cần
6. **Maintainability**: Code dễ đọc, dễ modify

---

## 🔄 Flow Summary

```
Component mounts
    ↓
useEmergencyHotline() hook runs
    ↓
Detect region (user preferences → browser locale → timezone)
    ↓
Load hotlines for detected region
    ↓
Render button with hotlines
    ↓
User clicks button
    ↓
If primary hotline exists → Call immediately
Else → Open dropdown
    ↓
User selects hotline → Call + Close dropdown
```

---

## 📚 Further Reading

- React Hooks best practices
- Accessibility (ARIA) guidelines
- Tailwind CSS utility-first approach
- TypeScript patterns for React


