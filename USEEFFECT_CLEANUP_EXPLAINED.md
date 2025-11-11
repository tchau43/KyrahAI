# 🧹 useEffect Cleanup Function - Explained

## 📋 Tổng quan

File này giải thích **khi nào** cleanup function (return) trong `useEffect` được gọi, và **tại sao** nó quan trọng.

---

## 🎯 Cleanup Function là gì?

```tsx
useEffect(() => {
  // Setup code
  const subscription = something.subscribe();
  
  // Cleanup function
  return () => {
    subscription.unsubscribe(); // Cleanup code
  };
}, [dependencies]);
```

**Cleanup function** = Function được return từ `useEffect`, chạy để cleanup trước khi:
1. Component unmount
2. Effect chạy lại (nếu dependencies thay đổi)

---

## 🔄 Khi nào cleanup được gọi?

### Scenario 1: Component Unmount

```tsx
function Component() {
  useEffect(() => {
    const timer = setTimeout(() => {}, 1000);
    
    return () => {
      clearTimeout(timer); // ← Chạy khi component unmount
    };
  }, []);
  
  return <div>Component</div>;
}
```

**Flow**:
```
1. Component mounts
2. useEffect runs → Timer created
3. Component unmounts (removed from DOM)
4. Cleanup runs → clearTimeout(timer) ✅
```

---

### Scenario 2: Dependencies Change (Effect Re-runs)

```tsx
function Component({ userId }: { userId: string }) {
  useEffect(() => {
    const subscription = subscribe(userId);
    
    return () => {
      subscription.unsubscribe(); // ← Chạy TRƯỚC khi effect chạy lại
    };
  }, [userId]); // ← Dependency
}
```

**Flow khi `userId` thay đổi**:
```
1. Initial: userId = 'user1'
2. useEffect runs → Subscribe to 'user1'
3. userId changes: 'user1' → 'user2'
4. Cleanup runs FIRST → Unsubscribe from 'user1' ✅
5. useEffect runs AGAIN → Subscribe to 'user2'
```

**Key point**: Cleanup chạy TRƯỚC khi effect chạy lại!

---

### Scenario 3: Empty Dependencies (Chỉ chạy 1 lần)

```tsx
function Component() {
  useEffect(() => {
    const listener = () => console.log('Event');
    window.addEventListener('click', listener);
    
    return () => {
      window.removeEventListener('click', listener); // ← Chỉ chạy khi unmount
    };
  }, []); // ← Empty deps = chỉ chạy 1 lần
}
```

**Flow**:
```
1. Component mounts
2. useEffect runs → Add event listener
3. Component re-renders (state change) → useEffect KHÔNG chạy lại
4. Component unmounts
5. Cleanup runs → Remove event listener ✅
```

---

## 🔍 Ví dụ từ code của bạn

### Code hiện tại

```tsx
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }

  document.addEventListener('keydown', handleEscape);
  
  return () => {
    document.removeEventListener('keydown', handleEscape); // ← Cleanup
  };
}, [isOpen]); // ← Dependency: isOpen
```

---

### Flow chi tiết

#### Case 1: Component Mount → Dropdown Opens

```
1. Component mounts
2. isOpen = false (initial)
3. useEffect runs (isOpen = false)
   - Add event listener
4. User clicks button → isOpen = true
5. Component re-renders
6. useEffect dependencies change: [false] → [true]
7. Cleanup runs FIRST → Remove old listener ✅
8. useEffect runs AGAIN → Add new listener (với isOpen = true)
```

---

#### Case 2: Dropdown Opens → Closes

```
1. isOpen = true
2. useEffect active (listener attached)
3. User presses Escape
4. handleEscape runs → setIsOpen(false)
5. Component re-renders
6. useEffect dependencies change: [true] → [false]
7. Cleanup runs → Remove event listener ✅
8. useEffect runs AGAIN → Add new listener (với isOpen = false)
```

**Note**: Listener vẫn được add lại ngay cả khi `isOpen = false`. Tại sao? Vì effect vẫn chạy, chỉ là handler check `isOpen` trong condition.

---

#### Case 3: Component Unmount

```
1. isOpen = true
2. useEffect active (listener attached)
3. Component unmounts (removed from DOM)
4. Cleanup runs → Remove event listener ✅
5. No memory leak!
```

---

## ⚠️ Tại sao cleanup quan trọng?

### Nếu KHÔNG có cleanup

```tsx
// ❌ BAD: Không cleanup
useEffect(() => {
  document.addEventListener('keydown', handleEscape);
  // No cleanup!
}, [isOpen]);
```

**Vấn đề**:
```
1. Component mounts → Add listener #1
2. isOpen changes → Add listener #2 (listener #1 vẫn active!)
3. isOpen changes again → Add listener #3 (listener #1, #2 vẫn active!)
4. Component unmounts → All listeners vẫn active!
5. ❌ Memory leak! Event listeners không được remove
```

**Kết quả**:
- Multiple event listeners
- Memory leak
- Handler chạy nhiều lần
- Performance issues

---

### Với cleanup

```tsx
// ✅ GOOD: Có cleanup
useEffect(() => {
  document.addEventListener('keydown', handleEscape);
  
  return () => {
    document.removeEventListener('keydown', handleEscape); // ← Cleanup
  };
}, [isOpen]);
```

**Behavior**:
```
1. Component mounts → Add listener #1
2. isOpen changes:
   - Cleanup runs → Remove listener #1 ✅
   - Effect runs → Add listener #2 ✅
3. isOpen changes again:
   - Cleanup runs → Remove listener #2 ✅
   - Effect runs → Add listener #3 ✅
4. Component unmounts:
   - Cleanup runs → Remove listener #3 ✅
5. ✅ No memory leak!
```

---

## 📊 Cleanup Timing

### Execution Order

```
1. Component renders
2. Previous effect cleanup runs (if exists) ← CLEANUP FIRST
3. New effect runs ← SETUP AFTER
4. Component unmounts
5. Cleanup runs ← CLEANUP ON UNMOUNT
```

---

## 🎯 Ví dụ cụ thể

### Example 1: Timer với cleanup

```tsx
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Effect runs, count:', count);
    const timer = setTimeout(() => {
      setCount(count + 1);
    }, 1000);
    
    return () => {
      console.log('Cleanup runs, count:', count);
      clearTimeout(timer);
    };
  }, [count]);
  
  return <div>Count: {count}</div>;
}
```

**Output**:
```
Effect runs, count: 0
[After 1 second]
Cleanup runs, count: 0  ← Cleanup với old count
Effect runs, count: 1
[After 1 second]
Cleanup runs, count: 1  ← Cleanup với old count
Effect runs, count: 2
...
```

**Key insight**: Cleanup chạy với **old values** (values từ previous render)!

---

### Example 2: Subscription với cleanup

```tsx
function Component({ userId }: { userId: string }) {
  useEffect(() => {
    console.log('Subscribe to:', userId);
    const subscription = subscribe(userId);
    
    return () => {
      console.log('Unsubscribe from:', userId); // ← Old userId!
      subscription.unsubscribe();
    };
  }, [userId]);
}
```

**Flow khi userId changes**:
```
1. userId = 'user1'
   Effect runs: Subscribe to: user1
2. userId = 'user2'
   Cleanup runs: Unsubscribe from: user1  ← Old value!
   Effect runs: Subscribe to: user2
```

---

## 🔍 Code của bạn - Phân tích chi tiết

### useEffect với `[isOpen]` dependency

```tsx
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }

  document.addEventListener('keydown', handleEscape);
  
  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen]);
```

### Khi nào cleanup chạy?

1. **Khi `isOpen` thay đổi**:
   ```
   isOpen: false → true
   - Cleanup runs → Remove listener (với isOpen = false)
   - Effect runs → Add listener (với isOpen = true)
   ```

2. **Khi component unmounts**:
   ```
   Component removed from DOM
   - Cleanup runs → Remove listener
   ```

3. **KHÔNG chạy khi**:
   - Component re-renders (không có dependency change)
   - Other state changes (không liên quan đến `isOpen`)

---

## 💡 Tại sao dependency `[isOpen]`?

### Nếu không có dependency

```tsx
// ❌ BAD: Không có dependency
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) { // ← isOpen là STALE!
      setIsOpen(false);
    }
  }
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, []); // ← Empty deps
```

**Vấn đề**:
- `isOpen` trong handler là **STALE VALUE** (giá trị ban đầu)
- Handler luôn thấy `isOpen = false` (initial value)
- Escape key không hoạt động đúng!

---

### Với dependency `[isOpen]`

```tsx
// ✅ GOOD: Có dependency
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) { // ← isOpen là CURRENT!
      setIsOpen(false);
    }
  }
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen]); // ← Dependency
```

**Behavior**:
- Effect re-runs mỗi khi `isOpen` thay đổi
- Handler luôn có **CURRENT** `isOpen` value
- Escape key hoạt động đúng!

---

## 🎓 Cleanup Best Practices

### 1. Always cleanup event listeners

```tsx
useEffect(() => {
  const handler = () => {};
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler); // ✅ Always cleanup
  };
}, []);
```

---

### 2. Always cleanup timers

```tsx
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  
  return () => {
    clearTimeout(timer); // ✅ Always cleanup
  };
}, []);
```

---

### 3. Always cleanup subscriptions

```tsx
useEffect(() => {
  const subscription = something.subscribe();
  
  return () => {
    subscription.unsubscribe(); // ✅ Always cleanup
  };
}, []);
```

---

### 4. Cleanup với same function reference

```tsx
// ✅ GOOD: Same function reference
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    // ...
  }
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen]);

// ❌ BAD: Different function reference
useEffect(() => {
  document.addEventListener('keydown', (event) => {
    // Anonymous function
  });
  return () => {
    document.removeEventListener('keydown', ???); // ← Can't remove!
  };
}, [isOpen]);
```

**Tại sao?**
- `removeEventListener` cần **SAME function reference**
- Anonymous function = new reference mỗi lần
- Cleanup không thể remove được!

---

## 📊 Cleanup Execution Summary

| Event | Cleanup Runs? | When? |
|-------|---------------|-------|
| **Component mount** | ❌ No | Effect chạy, không có previous cleanup |
| **Dependency changes** | ✅ Yes | **TRƯỚC** khi effect chạy lại |
| **Component re-render** (no deps change) | ❌ No | Effect không chạy lại |
| **Component unmount** | ✅ Yes | **TRƯỚC** khi component removed |

---

## 🎯 Key Takeaways

1. **Cleanup chạy TRƯỚC khi**:
   - Effect chạy lại (dependencies change)
   - Component unmounts

2. **Cleanup KHÔNG chạy khi**:
   - Component re-renders (không có dependency change)
   - Effect chạy lần đầu

3. **Cleanup có old values**:
   - Cleanup chạy với values từ previous render
   - Không phải current values

4. **Always cleanup**:
   - Event listeners
   - Timers
   - Subscriptions
   - Any side effects

5. **Same function reference**:
   - Cleanup cần same function để remove listener

---

## 💡 Code của bạn - Tóm tắt

```tsx
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }

  document.addEventListener('keydown', handleEscape);
  
  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen]);
```

**Cleanup chạy khi**:
1. ✅ `isOpen` thay đổi (trước khi effect chạy lại)
2. ✅ Component unmounts

**Cleanup KHÔNG chạy khi**:
1. ❌ Component re-renders (không có `isOpen` change)
2. ❌ Effect chạy lần đầu

**Tại sao cần cleanup?**
- ✅ Prevent memory leaks
- ✅ Remove old listeners trước khi add new
- ✅ Clean up khi component unmounts

