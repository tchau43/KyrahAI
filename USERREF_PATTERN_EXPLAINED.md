# 🔍 userRef Pattern - Giải thích

## 📋 Vấn đề: Stale Closure

### Code hiện tại

```tsx
const [user, setUser] = useState<SupabaseUser | null>(null);
const userRef = useRef(user);

useEffect(() => {
  userRef.current = user; // Update ref mỗi khi user thay đổi
}, [user]);

useEffect(() => {
  const supabase = createClient();
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    // ⚠️ PROBLEM: Nếu dùng `user` ở đây
    const currentUser = user; // ← STALE VALUE! (luôn là giá trị ban đầu)
    
    // ✅ SOLUTION: Dùng userRef.current
    const currentUser = userRef.current; // ← ALWAYS CURRENT VALUE!
    
    if (event === 'SIGNED_IN' && session) {
      if (!currentUser || currentUser.id !== session.user.id) {
        await handleSignIn(session);
      }
    }
  });
  
  return () => subscription?.unsubscribe();
}, []); // ← Empty deps = callback chỉ tạo 1 lần!
```

---

## 🎯 Tại sao cần `userRef`?

### Vấn đề: Stale Closure

```tsx
// ❌ BAD: Dùng user state trong callback
useEffect(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    // `user` ở đây là STALE VALUE!
    // Vì callback được tạo 1 lần (empty deps [])
    // Nó "capture" giá trị `user` ban đầu (null)
    if (!user || user.id !== session.user.id) { // ← user luôn là null!
      await handleSignIn(session);
    }
  });
}, []); // Empty deps = callback không bao giờ recreate
```

**Flow**:
```
1. Component mount: user = null
2. Callback được tạo: "capture" user = null
3. User login: user = { id: '123' }
4. Tab out → Tab focus lại
5. Supabase trigger onAuthStateChange
6. Callback chạy: vẫn thấy user = null (STALE!)
7. ❌ Bug: Check sai, sign in lại không cần thiết
```

---

### Solution: useRef

```tsx
// ✅ GOOD: Dùng userRef.current
const userRef = useRef(user);

useEffect(() => {
  userRef.current = user; // Update ref mỗi khi user thay đổi
}, [user]);

useEffect(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    // userRef.current luôn có giá trị MỚI NHẤT!
    const currentUser = userRef.current; // ← CURRENT VALUE!
    
    if (!currentUser || currentUser.id !== session.user.id) {
      await handleSignIn(session);
    }
  });
}, []);
```

**Flow**:
```
1. Component mount: user = null, userRef.current = null
2. Callback được tạo: "capture" userRef (ref object, không phải value)
3. User login: user = { id: '123' }
4. useEffect chạy: userRef.current = { id: '123' }
5. Tab out → Tab focus lại
6. Supabase trigger onAuthStateChange
7. Callback chạy: userRef.current = { id: '123' } (CURRENT!)
8. ✅ Correct: Check đúng, không sign in lại
```

---

## 🔄 Tab Focus Behavior

### Khi bạn out tab và focus lại

1. **Browser behavior**:
   - Tab inactive → Browser có thể pause một số operations
   - Tab active → Browser resume, Supabase có thể re-check auth state
   - Supabase trigger `onAuthStateChange` event

2. **Supabase behavior**:
   - Khi tab focus lại, Supabase có thể:
     - Re-validate session
     - Check token expiry
     - Trigger `onAuthStateChange` với current session

3. **Callback chạy**:
   - Callback được tạo 1 lần (empty deps)
   - Nếu dùng `user` state → STALE VALUE
   - Nếu dùng `userRef.current` → CURRENT VALUE ✅

---

## 📊 So sánh

| Approach | Value trong callback | Khi tab focus lại |
|----------|---------------------|-------------------|
| `user` state | ❌ Stale (giá trị ban đầu) | ❌ Sai |
| `userRef.current` | ✅ Current (giá trị mới nhất) | ✅ Đúng |

---

## 🎯 Pattern này dùng khi nào?

### ✅ Dùng `useRef` khi:

1. **Callback với empty deps** nhưng cần current value
2. **Event listeners** (onAuthStateChange, window events, etc.)
3. **Timers/intervals** cần access current state
4. **Async operations** trong callbacks

### ❌ KHÔNG dùng khi:

1. **UI cần update** → Dùng `useState`
2. **Normal component logic** → Dùng `useState`
3. **Props/state dependencies** → Dùng dependencies array

---

## 💡 Ví dụ khác

### Example 1: Window event listener

```tsx
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count; // Update ref
  }, [count]);
  
  useEffect(() => {
    function handleResize() {
      // ❌ Nếu dùng count: STALE VALUE
      // ✅ Dùng countRef.current: CURRENT VALUE
      console.log('Count:', countRef.current);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty deps = listener chỉ tạo 1 lần
}
```

---

### Example 2: setInterval

```tsx
function Component() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // ❌ Nếu dùng count: STALE VALUE (luôn là 0)
      // ✅ Dùng countRef.current: CURRENT VALUE
      console.log('Current count:', countRef.current);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []); // Empty deps = interval chỉ tạo 1 lần
}
```

---

## 🎓 Key Takeaways

1. **Stale Closure**: Callback với empty deps "capture" giá trị ban đầu
2. **useRef solution**: Ref object không bị capture, `.current` luôn current
3. **Pattern**: `useRef` + `useEffect` để sync ref với state
4. **Use case**: Event listeners, timers, callbacks với empty deps
5. **Tab focus**: Supabase có thể trigger events, cần current value

---

## 🔍 Tại sao vẫn giữ user khi out tab?

### User state vs userRef

```tsx
const [user, setUser] = useState<SupabaseUser | null>(null);
const userRef = useRef(user);

// Khi user login
setUser({ id: '123' }); // State update → Re-render
userRef.current = { id: '123' }; // Ref update → No re-render

// Khi out tab
// - user state: Vẫn giữ (React state persist)
// - userRef.current: Vẫn giữ (Ref persist)

// Khi focus lại
// - Supabase trigger onAuthStateChange
// - Callback check: userRef.current (CURRENT) vs user (STALE trong callback)
```

**Tại sao vẫn giữ?**
- ✅ React state persist giữa renders (trong cùng session)
- ✅ Ref persist giữa renders
- ✅ Tab out/focus không unmount component
- ✅ Chỉ reset khi page reload

---

## 📚 Further Reading

- React Stale Closure Problem
- useRef vs useState for callbacks
- Event listeners in React
- Supabase auth state management

