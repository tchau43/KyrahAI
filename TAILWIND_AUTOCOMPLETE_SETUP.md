# 🎨 Tailwind CSS Autocomplete Setup

## ✅ Xác nhận

**Đúng rồi!** `className` prop nhận **Tailwind CSS classes** như:
- `p-4` (padding)
- `bg-red-600` (background color)
- `flex items-center` (flexbox)
- `rounded-full` (border-radius)
- etc.

## 🔧 Cài đặt Autocomplete (VS Code / Cursor)

### Bước 1: Cài Extension

1. Mở VS Code/Cursor
2. Nhấn `Ctrl+Shift+X` (hoặc `Cmd+Shift+X` trên Mac) để mở Extensions
3. Tìm: **"Tailwind CSS IntelliSense"**
4. Cài extension từ **Tailwind Labs** (official)

### Bước 2: Verify Settings

Extension sẽ tự động detect Tailwind nếu:
- ✅ File `package.json` có `tailwindcss` dependency
- ✅ File `postcss.config.mjs` có `@tailwindcss/postcss` plugin
- ✅ File `globals.css` có `@import 'tailwindcss'`

**Project của bạn đã có đủ điều kiện!** ✅

### Bước 3: Test Autocomplete

1. Mở file `.tsx` hoặc `.jsx`
2. Gõ `className="`
3. Bắt đầu gõ class name, ví dụ: `p-`
4. **Autocomplete sẽ hiện ra!** 🎉

## 🎯 Ví dụ

```tsx
// Khi bạn gõ:
<div className="p-|  // ← cursor ở đây

// Autocomplete sẽ suggest:
// - p-0
// - p-1
// - p-2
// - p-4  ← bạn chọn
// - p-6
// - etc.
```

## ⚙️ Advanced Settings (Optional)

Nếu autocomplete không hoạt động, thêm vào `.vscode/settings.json`:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*[:=]\\s*[\"'`]([^\"'`]*)[\"'`]", "([^\\s]*)"],
    ["className\\s*[:=]\\s*\\{`([^`]*)`\\}", "([^\\s]*)"]
  ],
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

## 🐛 Troubleshooting

### Autocomplete không hiện?

1. **Reload VS Code**: `Ctrl+Shift+P` → "Reload Window"
2. **Check extension enabled**: Extensions → Tailwind CSS IntelliSense → Enable
3. **Check file type**: Phải là `.tsx`, `.jsx`, `.ts`, `.js`
4. **Restart VS Code**: Đôi khi cần restart

### Extension không detect Tailwind?

1. Check `package.json` có `tailwindcss` không
2. Check `postcss.config.mjs` có plugin không
3. Check `globals.css` có import không

## 📚 Custom Classes

Project của bạn có **custom colors** trong `globals.css`:
- `neutral-1`, `neutral-2`, ... `neutral-11`
- `primary`, `secondary-1`, `secondary-2`, `secondary-3`
- `success-1`, `success-2`, etc.

**Autocomplete sẽ suggest cả custom classes này!** ✅

## 💡 Tips

1. **Hover để xem CSS**: Hover vào class name → xem CSS được generate
2. **Go to definition**: `Ctrl+Click` vào class → xem definition
3. **Color preview**: Extension sẽ show màu sắc trong autocomplete
4. **Class sorting**: Extension tự động sort classes theo best practice

## 🎨 Example trong code của bạn

```tsx
// Line 130-142 trong EmergencyHotlineButton.tsx
className={`
  flex items-center gap-2           // ← Tailwind classes
  px-4 py-3 md:px-5 md:py-3        // ← Responsive classes
  bg-red-600 hover:bg-red-700      // ← Hover states
  text-white
  rounded-full
  shadow-lg hover:shadow-xl
  transition-all duration-200
  focus:outline-none focus:ring-2  // ← Focus states
  font-semibold
  text-sm md:text-base
  min-w-[140px] md:min-w-[160px]
`}
```

Tất cả đều là **Tailwind CSS classes** và sẽ có **autocomplete**! 🚀


