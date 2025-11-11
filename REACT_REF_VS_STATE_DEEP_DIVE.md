# 🧠 React Ref vs State - Deep Dive

## 📋 Tổng quan

File này giải thích **sâu** về `useRef` và `useState` trong React:

- Khi nào dùng cái nào?
- Render behavior khác nhau như thế nào?
- Mount vs Update behavior
- Ưu nhược điểm
- Tại sao lại như vậy?

---

## 🎯 Core Concept

### `useState` - Reactive State

```tsx
const [value, setValue] = useState(initialValue);
```

- ✅ **Trigger re-render** khi thay đổi
- ✅ **Reactive**: UI tự động update
- ✅ **Persist** giữa các renders
- ❌ **Re-render cost**: Mỗi lần set → component re-render

### `useRef` - Mutable Reference

```tsx
const ref = useRef(initialValue);
```

- ❌ **KHÔNG trigger re-render** khi thay đổi
- ❌ **KHÔNG reactive**: UI không tự động update
- ✅ **Persist** giữa các renders
- ✅ **No re-render cost**: Thay đổi không gây re-render

---

## 🔄 Render Behavior

### `useState` - Re-render Flow

```tsx
function Component() {
  const [count, setCount] = useState(0);

  console.log('Render!', count);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**Flow khi click button**:

```
1. User clicks button
2. setCount(1) called
3. React: "State changed! Need re-render!"
4. Component function runs again
5. console.log('Render!', 1) ← NEW render
6. Return new JSX with count = 1
7. React updates DOM
```

**Kết quả**: Component **re-render**, UI **update**

---

### `useRef` - No Re-render Flow

```tsx
function Component() {
  const countRef = useRef(0);

  console.log('Render!', countRef.current);

  return (
    <button
      onClick={() => {
        countRef.current = countRef.current + 1;
        console.log('New value:', countRef.current);
      }}
    >
      Count: {countRef.current}
    </button>
  );
}
```

**Flow khi click button**:

```
1. User clicks button
2. countRef.current = 1
3. React: "Ref changed? Who cares! No re-render!"
4. Component function KHÔNG chạy lại
5. console.log('New value:', 1) ← Same render
6. UI KHÔNG update (vẫn hiện 0)
```

**Kết quả**: Component **KHÔNG re-render**, UI **KHÔNG update**

---

## 📊 So sánh chi tiết

| Feature                      | `useState`               | `useRef`                   |
| ---------------------------- | ------------------------ | -------------------------- |
| **Trigger re-render?**       | ✅ Yes                   | ❌ No                      |
| **Reactive UI?**             | ✅ Yes                   | ❌ No                      |
| **Persist between renders?** | ✅ Yes                   | ✅ Yes                     |
| **Can mutate directly?**     | ❌ No (phải dùng setter) | ✅ Yes (ref.current = ...) |
| **Initial value**            | Chỉ dùng lần đầu         | Chỉ dùng lần đầu           |
| **Update triggers?**         | setValue()               | ref.current = ...          |
| **Use case**                 | UI state                 | DOM refs, timers, flags    |

---

## 🎯 Khi nào dùng `useState`?

### ✅ Dùng `useState` khi:

1. **UI cần update khi value thay đổi**

```tsx
// ✅ Good: UI cần show count
const [count, setCount] = useState(0);
return <div>Count: {count}</div>;
```

2. **Value là "source of truth" cho UI**

```tsx
// ✅ Good: isOpen controls dropdown visibility
const [isOpen, setIsOpen] = useState(false);
return isOpen ? <Dropdown /> : null;
```

3. **Value thay đổi → UI phải thay đổi**

```tsx
// ✅ Good: User input → show in UI
const [input, setInput] = useState('');
return <input value={input} onChange={e => setInput(e.target.value)} />;
```

---

## 🎯 Khi nào dùng `useRef`?

### ✅ Dùng `useRef` khi:

1. **DOM element reference**

```tsx
// ✅ Good: Cần access DOM element
const inputRef = useRef<HTMLInputElement>(null);
return <input ref={inputRef} />;
// Later: inputRef.current?.focus()
```

2. **Giữ value KHÔNG trigger re-render**

```tsx
// ✅ Good: Timer ID không cần re-render
const timerRef = useRef<NodeJS.Timeout | null>(null);
timerRef.current = setTimeout(() => {}, 1000);
```

3. **Previous value tracking**

```tsx
// ✅ Good: Track previous value
const prevCountRef = useRef(count);
useEffect(() => {
  prevCountRef.current = count; // Update without re-render
}, [count]);
```

4. **Flags/Counters không cần UI update**

```tsx
// ✅ Good: Render count không cần show
const renderCountRef = useRef(0);
renderCountRef.current += 1; // No re-render
```

---

## 🔍 Ví dụ từ code của bạn

### Example 1: Dropdown State

```tsx
// ✅ useState: UI cần update khi dropdown open/close
const [isOpen, setIsOpen] = useState(false);

// Khi setIsOpen(true):
// 1. State update
// 2. Component re-render
// 3. UI update: Dropdown hiện ra
return isOpen ? <Dropdown /> : null;
```

**Tại sao dùng state?**

- ✅ UI phải update khi `isOpen` thay đổi
- ✅ Dropdown visibility là "source of truth"
- ✅ User thấy được sự thay đổi

**Nếu dùng ref?**

```tsx
// ❌ Bad: UI không update
const isOpenRef = useRef(false);
isOpenRef.current = true; // No re-render!
return isOpenRef.current ? <Dropdown /> : null; // Still false!
```

---

### Example 2: DOM Element Reference

```tsx
// ✅ useRef: Cần access DOM element
const dropdownRef = useRef<HTMLDivElement>(null);
const buttonRef = useRef<HTMLButtonElement>(null);

// Click outside detection
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }
  // ...
}, [isOpen]);
```

**Tại sao dùng ref?**

- ✅ Cần access DOM element (`contains()`)
- ✅ Không cần re-render khi ref thay đổi
- ✅ Chỉ cần reference, không cần reactive

**Nếu dùng state?**

```tsx
// ❌ Bad: Unnecessary re-renders
const [dropdownElement, setDropdownElement] = useState<HTMLDivElement | null>(
  null
);

// Mỗi lần setDropdownElement → re-render
// Nhưng không cần update UI!
```

---

## 🏗️ Mount vs Update Behavior

### `useState` - Mount & Update

```tsx
function Component() {
  const [count, setCount] = useState(0);

  console.log('Component render');

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Mount (lần đầu)**:

```
1. Component mount
2. useState(0) → count = 0
3. console.log('Component render')
4. Return JSX với count = 0
5. React render DOM
```

**Update (click button)**:

```
1. User clicks
2. setCount(1) called
3. React: "State changed! Re-render!"
4. Component function runs AGAIN
5. useState(0) → IGNORED (initial value chỉ dùng lần đầu)
6. useState returns current state: count = 1
7. console.log('Component render') ← NEW render
8. Return JSX với count = 1
9. React update DOM
```

**Key point**: `useState(0)` chỉ dùng `0` lần đầu, sau đó dùng current state.

---

### `useRef` - Mount & Update

```tsx
function Component() {
  const countRef = useRef(0);

  console.log('Component render', countRef.current);

  return (
    <button
      onClick={() => {
        countRef.current = countRef.current + 1;
        console.log('After update:', countRef.current);
      }}
    >
      {countRef.current}
    </button>
  );
}
```

**Mount (lần đầu)**:

```
1. Component mount
2. useRef(0) → countRef = { current: 0 }
3. console.log('Component render', 0)
4. Return JSX với countRef.current = 0
5. React render DOM
```

**Update (click button)**:

```
1. User clicks
2. countRef.current = 1
3. React: "Ref changed? No re-render needed!"
4. Component function KHÔNG chạy lại
5. console.log('After update:', 1) ← Same render
6. UI KHÔNG update (vẫn hiện 0) ← PROBLEM!
```

**Key point**: `useRef` không trigger re-render, nên UI không update.

---

## 💡 Common Patterns

### Pattern 1: Previous Value Tracking

```tsx
function Component({ userId }: { userId: string }) {
  const prevUserIdRef = useRef<string>();

  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      console.log('User changed:', prevUserIdRef.current, '→', userId);
      prevUserIdRef.current = userId;
    }
  }, [userId]);
}
```

**Tại sao dùng ref?**

- ✅ Không cần re-render khi update previous value
- ✅ Chỉ cần lưu value để so sánh
- ✅ Không ảnh hưởng UI

---

### Pattern 2: Timer/Cleanup

```tsx
function Component() {
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

**Tại sao dùng ref?**

- ✅ Timer ID không cần trigger re-render
- ✅ Chỉ cần lưu để cleanup
- ✅ Không ảnh hưởng UI

---

### Pattern 3: Focus Management

```tsx
function Component() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.focus(); // Direct DOM access
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus Input</button>
    </>
  );
}
```

**Tại sao dùng ref?**

- ✅ Cần direct DOM access (focus())
- ✅ Không cần re-render
- ✅ Imperative API (focus, scroll, etc.)

---

## ⚠️ Common Mistakes

### Mistake 1: Dùng ref cho UI state

```tsx
// ❌ Bad: UI không update
function Component() {
  const countRef = useRef(0);

  return (
    <button onClick={() => countRef.current++}>
      Count: {countRef.current} {/* Always shows 0! */}
    </button>
  );
}

// ✅ Good: Dùng state
function Component() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count} {/* Updates correctly */}
    </button>
  );
}
```

---

### Mistake 2: Dùng state cho DOM refs

```tsx
// ❌ Bad: Unnecessary re-renders
function Component() {
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(
    null
  );

  return (
    <input ref={el => setInputElement(el)} />
    // Mỗi lần ref callback → setState → re-render!
  );
}

// ✅ Good: Dùng ref
function Component() {
  const inputRef = useRef<HTMLInputElement>(null);

  return <input ref={inputRef} />; // No re-render
}
```

---

### Mistake 3: Mutate state directly

```tsx
// ❌ Bad: State mutation không trigger re-render
function Component() {
  const [user, setUser] = useState({ name: 'John' });

  user.name = 'Jane'; // Mutation! No re-render!
  return <div>{user.name}</div>; // Still shows 'John'
}

// ✅ Good: Dùng setter
function Component() {
  const [user, setUser] = useState({ name: 'John' });

  setUser({ ...user, name: 'Jane' }); // New object → re-render
  return <div>{user.name}</div>; // Shows 'Jane'
}
```

---

## 🎓 Advanced: Ref Callback Pattern

### Ref Callback vs Ref Object

```tsx
// Pattern 1: Ref object (most common)
const inputRef = useRef<HTMLInputElement>(null);
<input ref={inputRef} />;

// Pattern 2: Ref callback (for dynamic refs)
const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
<input ref={el => setInputRef(el)} />;
```

**Khi nào dùng callback?**

- ✅ Cần logic khi element mount/unmount
- ✅ Dynamic refs (conditional rendering)
- ⚠️ Nhưng trigger re-render mỗi lần callback chạy!

---

## 📊 Performance Comparison

### `useState` - Re-render Cost

```tsx
function ExpensiveComponent() {
  const [count, setCount] = useState(0);

  // Expensive calculation
  const expensiveValue = useMemo(() => {
    return Array(1000000)
      .fill(0)
      .reduce(acc => acc + 1, 0);
  }, []);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count} {/* Re-render → expensiveValue recalculated */}
    </button>
  );
}
```

**Cost**: Mỗi lần `setCount` → re-render → expensive calculation (nếu không có useMemo)

---

### `useRef` - No Re-render Cost

```tsx
function ExpensiveComponent() {
  const countRef = useRef(0);

  // Expensive calculation
  const expensiveValue = useMemo(() => {
    return Array(1000000)
      .fill(0)
      .reduce(acc => acc + 1, 0);
  }, []);

  return (
    <button onClick={() => countRef.current++}>
      Count: {countRef.current} {/* No re-render → no recalculation */}
    </button>
  );
}
```

**Cost**: Update `countRef.current` → **KHÔNG re-render** → không recalculate

**Trade-off**: UI không update! (nhưng performance tốt hơn)

---

## 🔄 Lifecycle Comparison

### Component Lifecycle với `useState`

```
Mount
  ↓
useState(initial) → state = initial
  ↓
Render
  ↓
User interaction → setState(newValue)
  ↓
Re-render ← Component function runs again
  ↓
useState(initial) → IGNORED, returns current state
  ↓
Render với new state
  ↓
Unmount → State lost
```

---

### Component Lifecycle với `useRef`

```
Mount
  ↓
useRef(initial) → ref = { current: initial }
  ↓
Render
  ↓
User interaction → ref.current = newValue
  ↓
NO RE-RENDER ← Component function KHÔNG chạy lại
  ↓
ref.current = newValue (updated silently)
  ↓
Unmount → Ref lost
```

---

## 🎯 Decision Tree

```
Cần lưu value?
  ├─ Yes
  │  ├─ UI cần update khi value thay đổi?
  │  │  ├─ Yes → useState ✅
  │  │  └─ No → useRef ✅
  │  │
  │  └─ Cần access DOM element?
  │     └─ Yes → useRef ✅
  │
  └─ No → Không cần gì cả
```

---

## 💡 Real-world Examples

### Example 1: Form với validation

```tsx
function Form() {
  // ✅ State: UI cần show errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Ref: Form element không cần re-render
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Validate...
    if (errors) {
      formRef.current?.scrollIntoView(); // DOM access
    }
    setIsSubmitting(false);
  };

  return <form ref={formRef}>...</form>;
}
```

---

### Example 2: Scroll position tracking

```tsx
function ScrollableList() {
  // ✅ State: UI cần show scroll position
  const [scrollTop, setScrollTop] = useState(0);

  // ✅ Ref: Container element
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop); // Update state
    }
  };

  return (
    <div ref={containerRef} onScroll={handleScroll}>
      Scroll: {scrollTop}px
    </div>
  );
}
```

---

## 🔄 Page Reload Behavior

### ⚠️ QUAN TRỌNG: Cả `useState` và `useRef` đều KHÔNG persist qua page reload!

```tsx
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  // User clicks → count = 5, countRef.current = 5
  // User reloads page (F5)
  // → Component unmount
  // → Component mount lại
  // → useState(0) → count = 0 (RESET!)
  // → useRef(0) → countRef.current = 0 (RESET!)
}
```

**Kết luận**:

- ❌ **Cả hai đều KHÔNG persist qua reload**
- ✅ **Cả hai đều persist giữa các renders** (trong cùng session)
- ✅ **Cả hai đều reset khi component unmount/mount lại**

---

### So sánh Persistence

| Scenario                          | `useState` | `useRef`   |
| --------------------------------- | ---------- | ---------- |
| **Giữa renders** (same session)   | ✅ Persist | ✅ Persist |
| **Qua page reload**               | ❌ Reset   | ❌ Reset   |
| **Qua component unmount/remount** | ❌ Reset   | ❌ Reset   |
| **Qua navigation** (SPA)          | ❌ Reset\* | ❌ Reset\* |

\*Trừ khi dùng state management (Redux, Zustand, etc.)

---

### Ví dụ cụ thể

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);

  console.log('Render:', count, countRef.current);

  return (
    <div>
      <button
        onClick={() => {
          setCount(count + 1);
          countRef.current = countRef.current + 1;
        }}
      >
        Increment
      </button>
      <p>State: {count}</p>
      <p>Ref: {countRef.current}</p>
    </div>
  );
}
```

**Flow**:

```
1. Initial render: count = 0, countRef.current = 0
2. Click 3 times: count = 3, countRef.current = 3
3. User reloads page (F5)
4. Component unmount → All state/ref lost
5. Component mount lại
6. Initial render: count = 0, countRef.current = 0 ← RESET!
```

---

### Cách persist qua reload

#### Option 1: localStorage (Browser storage)

```tsx
function Counter() {
  // ✅ Load from localStorage on mount
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('count');
    return saved ? parseInt(saved) : 0;
  });

  // ✅ Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('count', count.toString());
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Behavior**:

- ✅ Persist qua page reload
- ✅ Persist qua browser close/open
- ❌ Không persist qua incognito/clear data

---

#### Option 2: sessionStorage (Session storage)

```tsx
function Counter() {
  const [count, setCount] = useState(() => {
    const saved = sessionStorage.getItem('count');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    sessionStorage.setItem('count', count.toString());
  }, [count]);
}
```

**Behavior**:

- ✅ Persist qua page reload
- ❌ Reset khi close tab/browser
- ✅ Persist trong cùng session

---

#### Option 3: URL params (Shareable state)

```tsx
function Counter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const count = parseInt(searchParams.get('count') || '0');

  const increment = () => {
    setSearchParams({ count: (count + 1).toString() });
  };

  return <button onClick={increment}>{count}</button>;
}
```

**Behavior**:

- ✅ Persist qua page reload
- ✅ Shareable (copy URL)
- ✅ Browser back/forward works

---

#### Option 4: Server state (Database)

```tsx
function Counter() {
  const { data: count, mutate } = useSWR('/api/count');

  const increment = async () => {
    await fetch('/api/count', { method: 'POST' });
    mutate(); // Revalidate
  };

  return <button onClick={increment}>{count}</button>;
}
```

**Behavior**:

- ✅ Persist qua page reload
- ✅ Persist qua devices
- ✅ Requires backend

---

### So sánh Persistence Methods

| Method           | Persist Reload? | Persist Close? | Shareable? | Complexity         |
| ---------------- | --------------- | -------------- | ---------- | ------------------ |
| `useState`       | ❌              | ❌             | ❌         | ⭐ Easy            |
| `useRef`         | ❌              | ❌             | ❌         | ⭐ Easy            |
| `localStorage`   | ✅              | ✅             | ❌         | ⭐⭐ Medium        |
| `sessionStorage` | ✅              | ❌             | ❌         | ⭐⭐ Medium        |
| `URL params`     | ✅              | ✅             | ✅         | ⭐⭐⭐ Hard        |
| `Server state`   | ✅              | ✅             | ✅         | ⭐⭐⭐⭐ Very Hard |

---

## 🎓 Key Takeaways

1. **`useState`**: Dùng khi UI cần update
2. **`useRef`**: Dùng khi không cần re-render
3. **State changes → Re-render → UI update**
4. **Ref changes → No re-render → UI không update**
5. **Ref persist giữa renders** (giống state) - ✅ TRONG CÙNG SESSION
6. **Ref KHÔNG persist qua reload** (giống state) - ❌ RESET KHI RELOAD
7. **Ref initial value chỉ dùng lần đầu** (giống state)
8. **Ref mutation không trigger re-render** (khác state)
9. **Để persist qua reload → dùng localStorage/sessionStorage/URL params/server**

---

## 📚 Further Reading

- React Hooks API Reference
- useRef vs useState performance
- React render optimization
- DOM refs best practices
