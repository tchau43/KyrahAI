# ⏱️ NodeJS.Timeout Explained

## 📋 Tổng quan

`NodeJS.Timeout` là **type** cho timer ID từ `setTimeout()` trong **Node.js environment**. Trong React, bạn cần hiểu sự khác biệt giữa Node.js và Browser environments.

---

## 🎯 NodeJS.Timeout là gì?

### Trong Node.js

```typescript
// Node.js environment
const timerId: NodeJS.Timeout = setTimeout(() => {
  console.log('Done!');
}, 1000);

// timerId có type: NodeJS.Timeout
clearTimeout(timerId);
```

**Type definition**:
```typescript
namespace NodeJS {
  interface Timeout {
    // Timer object với methods
    ref(): Timeout;
    unref(): Timeout;
    hasRef(): boolean;
  }
}
```

---

### Trong Browser

```typescript
// Browser environment
const timerId: number = setTimeout(() => {
  console.log('Done!');
}, 1000);

// timerId có type: number
clearTimeout(timerId);
```

**Browser `setTimeout`** trả về `number`, không phải object.

---

## 🔄 Sự khác biệt

| Environment | Return Type | Example |
|-------------|-------------|---------|
| **Node.js** | `NodeJS.Timeout` (object) | `{ ref(), unref(), hasRef() }` |
| **Browser** | `number` | `12345` |

---

## ⚠️ Vấn đề trong React

React code có thể chạy ở **cả hai environments**:
- **Server-side** (Next.js SSR, React Server Components)
- **Client-side** (Browser)

Nên cần handle cả hai cases!

---

## ✅ Solution: Union Type

### Option 1: Union Type (Recommended)

```tsx
import { useEffect, useRef } from 'react';

function Component() {
  // ✅ Handle cả Node.js và Browser
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      console.log('Timer done!');
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current); // Works in both!
      }
    };
  }, []);
}
```

**Tại sao works?**
- `clearTimeout()` accept cả `NodeJS.Timeout` và `number`
- TypeScript happy với union type
- Runtime works ở cả hai environments

---

### Option 2: ReturnType<typeof setTimeout>

```tsx
function Component() {
  // ✅ TypeScript tự động infer type
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      console.log('Timer done!');
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
```

**Tại sao tốt?**
- ✅ TypeScript tự động chọn đúng type
- ✅ Works ở cả hai environments
- ✅ Không cần hardcode type

---

### Option 3: Chỉ dùng NodeJS.Timeout (Nếu chắc chắn chạy ở Node.js)

```tsx
function Component() {
  // ⚠️ Chỉ dùng nếu chắc chắn chạy ở Node.js
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      console.log('Timer done!');
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
```

**Khi nào dùng?**
- ✅ Server-side only code
- ✅ Next.js API routes
- ✅ Node.js scripts

**Khi nào KHÔNG dùng?**
- ❌ Client-side components
- ❌ Browser-only code
- ❌ Universal code (chạy cả server và client)

---

## 🔍 Ví dụ từ code của bạn

### Code hiện tại

```tsx
const timerRef = useRef<NodeJS.Timeout | null>(null);
```

**Phân tích**:
- ✅ Works ở Node.js environment
- ⚠️ Có thể có type error ở browser (nếu strict mode)
- ⚠️ TypeScript có thể complain nếu chạy ở browser

---

### Code nên dùng (Universal)

```tsx
// ✅ Option 1: Union type
const timerRef = useRef<NodeJS.Timeout | number | null>(null);

// ✅ Option 2: ReturnType (Recommended)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

## 🎯 Real-world Examples

### Example 1: Debounce với timer

```tsx
function SearchInput() {
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleChange = (value: string) => {
    setQuery(value);
    
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set new timer
    timerRef.current = setTimeout(() => {
      // Search API call
      console.log('Searching:', value);
    }, 500);
  };
  
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return <input value={query} onChange={(e) => handleChange(e.target.value)} />;
}
```

---

### Example 2: Polling với timer

```tsx
function PollingComponent() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    const poll = async () => {
      // Fetch data
      await fetch('/api/data');
      
      // Schedule next poll
      timerRef.current = setTimeout(poll, 5000);
    };
    
    poll(); // Start polling
    
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return <div>Polling...</div>;
}
```

---

### Example 3: Auto-save với timer

```tsx
function AutoSaveEditor() {
  const [content, setContent] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleChange = (newContent: string) => {
    setContent(newContent);
    
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Auto-save after 2 seconds of inactivity
    timerRef.current = setTimeout(async () => {
      await fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify({ content: newContent }),
      });
    }, 2000);
  };
  
  useEffect(() => {
    return () => {
      // Save on unmount if pending
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // Could also trigger save here
      }
    };
  }, []);
  
  return <textarea value={content} onChange={(e) => handleChange(e.target.value)} />;
}
```

---

## 🔧 TypeScript Configuration

### Nếu gặp type error

```tsx
// ❌ Error: Type 'number' is not assignable to type 'NodeJS.Timeout'
const timerRef = useRef<NodeJS.Timeout | null>(null);
timerRef.current = setTimeout(() => {}, 1000); // Error ở browser!
```

**Fix**:

```tsx
// ✅ Solution 1: Union type
const timerRef = useRef<NodeJS.Timeout | number | null>(null);

// ✅ Solution 2: ReturnType
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// ✅ Solution 3: Type assertion (not recommended)
const timerRef = useRef<NodeJS.Timeout | null>(null);
timerRef.current = setTimeout(() => {}, 1000) as NodeJS.Timeout;
```

---

## 📊 So sánh các approaches

| Approach | Pros | Cons | Use When |
|----------|------|------|----------|
| `NodeJS.Timeout` | Simple, explicit | ❌ Browser type error | Node.js only |
| `NodeJS.Timeout \| number` | ✅ Works both | Verbose | Universal code |
| `ReturnType<typeof setTimeout>` | ✅ Auto-infer, clean | Slightly complex | ✅ **Recommended** |

---

## 🎓 Key Takeaways

1. **`NodeJS.Timeout`**: Type cho timer ID ở Node.js
2. **Browser**: `setTimeout` trả về `number`
3. **React**: Code có thể chạy ở cả hai environments
4. **Solution**: Dùng `ReturnType<typeof setTimeout>` hoặc union type
5. **Best practice**: Luôn cleanup timers trong `useEffect` cleanup

---

## 💡 Best Practice

```tsx
// ✅ Recommended pattern
function Component() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      // Do something
    }, 1000);
    
    return () => {
      // Always cleanup!
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
}
```

**Tại sao pattern này?**
- ✅ Works ở cả Node.js và Browser
- ✅ Type-safe
- ✅ Cleanup prevents memory leaks
- ✅ No type errors

---

## 📚 Further Reading

- TypeScript Node.js types
- React useEffect cleanup
- setTimeout vs setInterval
- Debouncing and throttling patterns

