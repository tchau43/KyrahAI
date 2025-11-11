# 🔄 Ref Persistence - Clarified

## ⚠️ QUAN TRỌNG: Ref KHÔNG mất khi re-render!

## 🎯 Sự khác biệt: Re-render vs Unmount

### Re-render (Component function chạy lại)

```tsx
function Component() {
  const countRef = useRef(0);
  
  console.log('Render!', countRef.current);
  
  return (
    <button onClick={() => {
      countRef.current = countRef.current + 1;
      console.log('After update:', countRef.current);
    }}>
      Count: {countRef.current}
    </button>
  );
}
```

**Flow khi click button**:
```
1. Initial render: countRef = { current: 0 }
2. User clicks button
3. countRef.current = 1
4. React: "State changed? No. Ref changed? Who cares!"
5. Component KHÔNG re-render
6. countRef.current = 1 (vẫn giữ!)
```

**Nếu có state change**:
```tsx
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  
  console.log('Render!', count, countRef.current);
  
  return (
    <button onClick={() => {
      setCount(count + 1); // Trigger re-render
      countRef.current = countRef.current + 1;
    }}>
      Count: {count} | Ref: {countRef.current}
    </button>
  );
}
```

**Flow khi click button**:
```
1. Initial render: count = 0, countRef = { current: 0 }
2. User clicks button
3. setCount(1) → Trigger re-render
4. countRef.current = 1
5. Component RE-RENDERS (vì state change)
6. useRef(0) → IGNORED! (initial value chỉ dùng lần đầu)
7. useRef returns SAME ref object: { current: 1 } ✅
8. countRef.current = 1 (VẪN GIỮ!)
```

**Key point**: 
- ✅ **Ref object PERSIST qua re-renders**
- ✅ **ref.current value PERSIST qua re-renders**
- ✅ **Initial value chỉ dùng lần đầu** (giống useState)

---

### Unmount (Component bị remove khỏi DOM)

```tsx
function Parent() {
  const [show, setShow] = useState(true);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <Child />}
    </div>
  );
}

function Child() {
  const countRef = useRef(0);
  
  useEffect(() => {
    countRef.current = 5;
    console.log('Mounted, ref:', countRef.current);
    
    return () => {
      console.log('Unmounting, ref:', countRef.current);
      // Ref vẫn có value ở đây (5)
      // Nhưng sau khi unmount, ref object bị garbage collected
    };
  }, []);
  
  return <div>Child</div>;
}
```

**Flow khi toggle**:
```
1. show = true → Child mounts
2. countRef = { current: 0 } (initial)
3. useEffect: countRef.current = 5
4. User clicks toggle → show = false
5. Child UNMOUNTS
6. Cleanup runs: countRef.current = 5 (vẫn có)
7. Component removed from DOM
8. Ref object bị garbage collected → MẤT
```

**Key point**:
- ❌ **Ref MẤT khi component unmount**
- ✅ **Ref PERSIST qua re-renders**

---

## 📊 So sánh chi tiết

| Event | `useState` | `useRef` |
|-------|------------|----------|
| **Re-render** | ✅ Persist (state giữ nguyên) | ✅ Persist (ref giữ nguyên) |
| **Unmount** | ❌ Mất (state reset) | ❌ Mất (ref reset) |
| **Page reload** | ❌ Mất | ❌ Mất |
| **Component remount** | ❌ Reset về initial | ❌ Reset về initial |

---

## 🔍 Ví dụ cụ thể: userRef trong AuthContext

```tsx
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const userRef = useRef(user); // Initial: null
  
  // Sync ref với state mỗi khi user thay đổi
  useEffect(() => {
    userRef.current = user; // Update ref
  }, [user]);
  
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = userRef.current; // ← Luôn có giá trị mới nhất
      // ...
    });
  }, []);
}
```

**Flow khi user login**:
```
1. Initial: user = null, userRef.current = null
2. User logs in: setUser({ id: '123' })
3. State update → Component RE-RENDERS
4. useRef(user) → IGNORED (initial chỉ dùng lần đầu)
5. useRef returns SAME ref object: { current: null } (chưa update)
6. useEffect([user]) chạy: userRef.current = { id: '123' } ✅
7. Re-render xong: userRef.current = { id: '123' } (VẪN GIỮ!)
```

**Flow khi component re-render (không unmount)**:
```
1. Component re-renders (vì state change khác)
2. useRef(user) → IGNORED
3. useRef returns SAME ref object: { current: '123' } ✅
4. userRef.current = '123' (VẪN GIỮ!)
```

**Flow khi component unmount**:
```
1. Component unmounts
2. Ref object bị garbage collected
3. userRef = null (MẤT)
```

---

## 🎯 Tại sao ref persist qua re-renders?

### React's Internal Mechanism

```tsx
// React internally (simplified)
function useRef(initialValue) {
  // React stores refs in a special place (fiber node)
  // Refs are NOT stored in component function scope
  // They're stored in React's internal state
  
  if (componentFirstRender) {
    // Create new ref object
    const ref = { current: initialValue };
    React.storeRef(componentId, ref);
    return ref;
  } else {
    // Return SAME ref object from previous render
    return React.getRef(componentId); // ← SAME object!
  }
}
```

**Key insight**:
- React lưu refs trong **fiber node** (internal state)
- Refs **KHÔNG** nằm trong component function scope
- Mỗi lần re-render, React trả về **CÙNG MỘT ref object**
- Chỉ khi unmount, React mới cleanup refs

---

## 💡 Ví dụ minh họa

### Example 1: Ref persist qua nhiều re-renders

```tsx
function Component() {
  const [renderCount, setRenderCount] = useState(0);
  const valueRef = useRef(0);
  
  console.log('Render #', renderCount, 'Ref:', valueRef.current);
  
  return (
    <div>
      <button onClick={() => {
        valueRef.current = valueRef.current + 1;
        setRenderCount(renderCount + 1); // Trigger re-render
      }}>
        Increment (Render: {renderCount}, Ref: {valueRef.current})
      </button>
    </div>
  );
}
```

**Output khi click 3 lần**:
```
Render # 0 Ref: 0
[Click]
Render # 1 Ref: 1  ← Ref vẫn giữ!
[Click]
Render # 2 Ref: 2  ← Ref vẫn giữ!
[Click]
Render # 3 Ref: 3  ← Ref vẫn giữ!
```

**Kết luận**: Ref **PERSIST** qua re-renders! ✅

---

### Example 2: Ref mất khi unmount

```tsx
function Parent() {
  const [show, setShow] = useState(true);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>Toggle</button>
      {show && <Child />}
    </div>
  );
}

function Child() {
  const valueRef = useRef(0);
  
  useEffect(() => {
    valueRef.current = 100;
    console.log('Mounted, ref:', valueRef.current);
    
    return () => {
      console.log('Unmounting, ref:', valueRef.current);
    };
  }, []);
  
  return <div>Child (Ref: {valueRef.current})</div>;
}
```

**Output khi toggle**:
```
Mounted, ref: 100
[Toggle off]
Unmounting, ref: 100  ← Ref vẫn có ở đây
[Toggle on]
Mounted, ref: 0  ← Ref RESET về initial!
```

**Kết luận**: Ref **MẤT** khi unmount, **RESET** khi remount! ❌

---

## 🎓 Key Takeaways

1. ✅ **Ref PERSIST qua re-renders** (cùng component instance)
2. ❌ **Ref MẤT khi component unmount**
3. ❌ **Ref RESET về initial khi component remount**
4. ✅ **Ref object là SAME object** qua các re-renders
5. ✅ **ref.current value PERSIST** qua re-renders (nếu không mutate)

---

## 🔄 So sánh với useState

| Event | `useState` | `useRef` |
|-------|------------|----------|
| **Re-render** | ✅ State persist | ✅ Ref persist |
| **Unmount** | ❌ State mất | ❌ Ref mất |
| **Remount** | ❌ Reset về initial | ❌ Reset về initial |
| **Object identity** | ❌ New state object mỗi setState | ✅ Same ref object |

---

## 💡 Tại sao userRef vẫn giữ khi out tab?

### Tab out/focus không unmount component!

```tsx
// User out tab → focus lại
// Component KHÔNG unmount
// Chỉ có thể:
// - Browser pause/resume operations
// - Supabase re-check auth state
// - Trigger onAuthStateChange event

// Component vẫn mounted → Ref vẫn giữ! ✅
```

**Chỉ khi nào ref mất?**
- ❌ Component unmount (remove khỏi DOM)
- ❌ Page reload
- ❌ Navigation away (nếu component không render)

---

## 📚 Summary

**Ref PERSIST qua re-renders** ✅
- Re-render = Component function chạy lại
- Ref object vẫn là SAME object
- ref.current value vẫn giữ

**Ref MẤT khi unmount** ❌
- Unmount = Component bị remove khỏi DOM
- Ref object bị garbage collected
- Remount = Ref reset về initial

**Tab out/focus = KHÔNG unmount** ✅
- Component vẫn mounted
- Ref vẫn giữ
- State vẫn giữ

