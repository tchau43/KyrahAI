# 🧠 useCallback vs useMemo - Deep Dive

## 📋 Tổng quan

File này giải thích **sự khác biệt thực sự** giữa `useCallback` và `useMemo`, tại sao cả hai đều cần thiết, và khi nào dùng cái nào.

---

## 🎯 Core Concept

### JavaScript: Function là Value

```javascript
// Function cũng là một value!
const myFunction = () => console.log('Hello');
// myFunction là một value (function value)
```

**Điều này đúng!** Function trong JavaScript là **first-class citizen** - nó là một value như string, number, object.

---

## 🔍 useMemo - Memoize Value (Kết quả)

### Syntax

```tsx
const memoizedValue = useMemo(() => {
  return expensiveCalculation();
}, [dependencies]);
```

**useMemo làm gì?**
- ✅ **Memoize kết quả** của function call
- ✅ **Return value** (không phải function)
- ✅ **Re-compute** khi dependencies thay đổi

### Ví dụ

```tsx
function Component({ items }: { items: number[] }) {
  // ❌ Bad: Tính toán mỗi render
  const sum = items.reduce((acc, item) => acc + item, 0);
  
  // ✅ Good: Memoize kết quả
  const sum = useMemo(() => {
    return items.reduce((acc, item) => acc + item, 0);
  }, [items]);
  
  return <div>Sum: {sum}</div>; // ← sum là NUMBER
}
```

**Kết quả**: `sum` là một **number** (value), không phải function.

---

## 🔍 useCallback - Memoize Function Reference

### Syntax

```tsx
const memoizedFunction = useCallback(() => {
  doSomething();
}, [dependencies]);
```

**useCallback làm gì?**
- ✅ **Memoize function reference** (chính function đó)
- ✅ **Return function** (không phải kết quả của function)
- ✅ **Re-create function** khi dependencies thay đổi

### Ví dụ

```tsx
function Component({ userId }: { userId: string }) {
  // ❌ Bad: Function recreate mỗi render
  const handleClick = () => {
    console.log('User:', userId);
  };
  
  // ✅ Good: Memoize function reference
  const handleClick = useCallback(() => {
    console.log('User:', userId);
  }, [userId]);
  
  return <button onClick={handleClick}>Click</button>; // ← handleClick là FUNCTION
}
```

**Kết quả**: `handleClick` là một **function** (value), nhưng `useCallback` memoize **function reference**.

---

## 🔄 Sự khác biệt thực sự

### useMemo: Memoize KẾT QUẢ

```tsx
const result = useMemo(() => {
  return expensiveCalculation(); // ← Tính toán và return kết quả
}, [deps]);

// result = KẾT QUẢ của expensiveCalculation()
// Ví dụ: result = 42 (number)
```

**Flow**:
```
1. useMemo runs function
2. Function executes: expensiveCalculation()
3. Return value: 42
4. useMemo memoizes: 42
5. result = 42 (value)
```

---

### useCallback: Memoize FUNCTION

```tsx
const handler = useCallback(() => {
  doSomething(); // ← Function definition
}, [deps]);

// handler = FUNCTION itself (chưa chạy!)
// Ví dụ: handler = () => { doSomething(); }
```

**Flow**:
```
1. useCallback receives function definition
2. useCallback memoizes: function definition
3. handler = function (chưa chạy!)
4. Khi gọi: handler() → mới chạy doSomething()
```

---

## 💡 Ví dụ so sánh trực tiếp

### Example 1: useMemo

```tsx
function Component({ count }: { count: number }) {
  // useMemo: Memoize KẾT QUẢ
  const doubled = useMemo(() => {
    console.log('Computing doubled...');
    return count * 2; // ← Tính toán và return
  }, [count]);
  
  console.log('doubled:', doubled); // ← doubled = 10 (number)
  // Output: doubled: 10
  
  return <div>{doubled}</div>; // ← Hiển thị 10
}
```

**Behavior**:
- `doubled` là **number** (10)
- Function chạy → return 10 → memoize 10
- `doubled` = 10 (value)

---

### Example 2: useCallback

```tsx
function Component({ count }: { count: number }) {
  // useCallback: Memoize FUNCTION
  const handleClick = useCallback(() => {
    console.log('Count:', count);
  }, [count]);
  
  console.log('handleClick:', handleClick); // ← handleClick = function
  // Output: handleClick: [Function]
  
  return <button onClick={handleClick}>Click</button>; // ← Pass function
}
```

**Behavior**:
- `handleClick` là **function** (chưa chạy)
- Function được memoize (reference)
- `handleClick` = function (value, nhưng là function value)

---

## 🎯 Điểm khác biệt chính

| Aspect | `useMemo` | `useCallback` |
|--------|-----------|---------------|
| **Memoize gì?** | Kết quả (return value) | Function reference |
| **Return gì?** | Value (number, string, object, etc.) | Function |
| **Khi nào chạy?** | Ngay lập tức (trong render) | Khi được gọi (lazy) |
| **Use case** | Expensive calculations | Function references |

---

## 🔍 Ví dụ cụ thể: Cùng một logic

### Dùng useMemo (SAI)

```tsx
function Component() {
  // ❌ WRONG: useMemo với function
  const handleClick = useMemo(() => {
    return () => console.log('Clicked');
  }, []);
  
  // handleClick = function (nhưng không đúng cách!)
  // useMemo chạy function ngay → return function
  // Nhưng không phải mục đích của useMemo
}
```

**Vấn đề**:
- `useMemo` chạy function ngay → return function
- Function được tạo mỗi lần (không memoize reference đúng cách)
- Không đúng mục đích của `useMemo`

---

### Dùng useCallback (ĐÚNG)

```tsx
function Component() {
  // ✅ CORRECT: useCallback với function
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  // handleClick = function (memoized reference)
  // useCallback memoize function reference
  // Function chỉ recreate khi deps thay đổi
}
```

**Đúng**:
- `useCallback` memoize function reference
- Function stable giữa renders
- Đúng mục đích của `useCallback`

---

## 🎯 Tại sao cần cả hai?

### useMemo: Khi cần memoize KẾT QUẢ

```tsx
function Component({ items }: { items: number[] }) {
  // Expensive calculation
  const sortedItems = useMemo(() => {
    console.log('Sorting...'); // ← Chạy ngay
    return items.sort((a, b) => a - b);
  }, [items]);
  
  // sortedItems = [1, 2, 3] (array, đã sorted)
  return <div>{sortedItems.map(...)}</div>;
}
```

**Tại sao useMemo?**
- ✅ Tính toán **expensive** (sorting)
- ✅ Cần **kết quả** ngay (để render)
- ✅ Không muốn tính lại mỗi render

---

### useCallback: Khi cần memoize FUNCTION

```tsx
function Component({ userId }: { userId: string }) {
  // Function để pass vào child component
  const handleClick = useCallback(() => {
    fetchUser(userId);
  }, [userId]);
  
  // handleClick = function (chưa chạy)
  return <ChildComponent onClick={handleClick} />;
}
```

**Tại sao useCallback?**
- ✅ Function được **pass vào child component**
- ✅ Child component dùng `React.memo()` → cần stable reference
- ✅ Không muốn child re-render khi function reference thay đổi

---

## 🔄 useMemo có thể dùng cho function không?

### Technically: Có thể

```tsx
// ✅ Technically works
const handleClick = useMemo(() => {
  return () => console.log('Clicked');
}, []);
```

**Nhưng**:
- ❌ **Không đúng mục đích**: `useMemo` để memoize kết quả, không phải function
- ❌ **Không tối ưu**: Function vẫn được tạo mỗi lần (trong return)
- ❌ **Không semantic**: Code không rõ ràng

---

### useCallback: Đúng mục đích

```tsx
// ✅ Correct và semantic
const handleClick = useCallback(() => {
  console.log('Clicked');
}, []);
```

**Đúng**:
- ✅ **Đúng mục đích**: `useCallback` để memoize function
- ✅ **Tối ưu**: Function reference stable
- ✅ **Semantic**: Code rõ ràng, dễ hiểu

---

## 💡 Ví dụ thực tế: Khi nào dùng cái nào?

### Case 1: Expensive Calculation → useMemo

```tsx
function Component({ data }: { data: number[] }) {
  // ✅ useMemo: Tính toán expensive, cần kết quả
  const sum = useMemo(() => {
    return data.reduce((acc, num) => acc + num, 0);
  }, [data]);
  
  return <div>Sum: {sum}</div>; // ← sum là number
}
```

**Tại sao useMemo?**
- Tính toán expensive (reduce)
- Cần kết quả ngay (để render)
- Không muốn tính lại mỗi render

---

### Case 2: Function cho Child Component → useCallback

```tsx
function Parent({ userId }: { userId: string }) {
  // ✅ useCallback: Function để pass vào child
  const handleClick = useCallback(() => {
    console.log('User:', userId);
  }, [userId]);
  
  return <Child onClick={handleClick} />; // ← Pass function
}

const Child = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
});
```

**Tại sao useCallback?**
- Function được pass vào child
- Child dùng `React.memo()` → cần stable reference
- Không muốn child re-render khi function reference thay đổi

---

### Case 3: Function trong useEffect dependency → useCallback

```tsx
function Component({ userId }: { userId: string }) {
  // ✅ useCallback: Function trong useEffect dependency
  const fetchUser = useCallback(async () => {
    const user = await api.getUser(userId);
    setUser(user);
  }, [userId]);
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // ← Cần stable reference
}
```

**Tại sao useCallback?**
- Function trong `useEffect` dependency
- Không muốn effect chạy lại khi function reference thay đổi
- Stable reference → effect chỉ chạy khi `userId` thay đổi

---

## 🔍 Code của bạn - Phân tích

### useCallback trong useEmergencyHotline

```tsx
const detectAndLoad = useCallback(() => {
  // Detect region và load hotlines
  const detected = detectUserRegion(userPreferences);
  setCountryCode(detected);
  // ...
}, [userPreferences]);

useEffect(() => {
  detectAndLoad();
}, [detectAndLoad]); // ← Cần stable reference
```

**Tại sao useCallback?**
- ✅ Function trong `useEffect` dependency
- ✅ Không muốn effect chạy lại khi function reference thay đổi
- ✅ Stable reference → effect chỉ chạy khi `userPreferences` thay đổi

**Nếu dùng useMemo?**
```tsx
// ❌ WRONG: useMemo không đúng mục đích
const detectAndLoad = useMemo(() => {
  return () => {
    // ...
  };
}, [userPreferences]);
// Vấn đề: Function vẫn được tạo mỗi lần trong return
```

---

## 🎓 Key Insights

### 1. useMemo = Memoize KẾT QUẢ

```tsx
const value = useMemo(() => compute(), [deps]);
// value = KẾT QUẢ của compute()
// compute() chạy ngay → return value → memoize value
```

**Khi dùng**:
- Expensive calculations
- Derived values
- Filtered/sorted arrays
- Computed objects

---

### 2. useCallback = Memoize FUNCTION

```tsx
const fn = useCallback(() => doSomething(), [deps]);
// fn = FUNCTION itself
// Function được memoize (reference)
// Function chưa chạy, chỉ khi gọi fn() mới chạy
```

**Khi dùng**:
- Functions cho child components
- Functions trong useEffect dependencies
- Event handlers cần stable reference
- Any function reference cần stable

---

### 3. Function cũng là Value - Nhưng...

**Đúng**: Function là value trong JavaScript
```javascript
const fn = () => {}; // fn là value (function value)
```

**Nhưng**:
- `useMemo` memoize **kết quả** của function call
- `useCallback` memoize **function reference** itself

**Ví dụ**:
```tsx
// useMemo: Memoize kết quả
const result = useMemo(() => 1 + 1, []); // result = 2

// useCallback: Memoize function
const fn = useCallback(() => 1 + 1, []); // fn = function, chưa chạy
const result = fn(); // result = 2 (chạy function)
```

---

## 📊 So sánh trực tiếp

### useMemo Example

```tsx
function Component() {
  const expensiveValue = useMemo(() => {
    console.log('Computing...'); // ← Chạy ngay
    return 42;
  }, []);
  
  console.log(expensiveValue); // ← 42 (number)
  // Output: Computing... (chạy ngay)
  // Output: 42
}
```

**Timeline**:
```
1. Component renders
2. useMemo runs → Function executes → Return 42
3. expensiveValue = 42
4. Component continues render
```

---

### useCallback Example

```tsx
function Component() {
  const handler = useCallback(() => {
    console.log('Handler called'); // ← Chưa chạy
    return 42;
  }, []);
  
  console.log(handler); // ← [Function] (function, chưa chạy)
  // Output: [Function]
  
  handler(); // ← Bây giờ mới chạy
  // Output: Handler called
}
```

**Timeline**:
```
1. Component renders
2. useCallback runs → Memoize function reference
3. handler = function (chưa chạy)
4. Component continues render
5. User clicks → handler() → Function executes → Return 42
```

---

## 🎯 Decision Tree

```
Cần memoize gì?
  ├─ Kết quả tính toán (number, string, array, object)?
  │  └─ Yes → useMemo ✅
  │
  └─ Function reference?
     └─ Yes → useCallback ✅
```

---

## 💡 Real-world Examples

### Example 1: Filtered List (useMemo)

```tsx
function Component({ items, filter }: { items: Item[], filter: string }) {
  // ✅ useMemo: Memoize filtered array (kết quả)
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter));
  }, [items, filter]);
  
  return (
    <ul>
      {filteredItems.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

**Tại sao useMemo?**
- `filteredItems` là **array** (kết quả)
- Tính toán expensive (filter)
- Cần kết quả ngay (để render)

---

### Example 2: Event Handler (useCallback)

```tsx
function Parent({ userId }: { userId: string }) {
  // ✅ useCallback: Memoize function reference
  const handleClick = useCallback(() => {
    console.log('User:', userId);
  }, [userId]);
  
  return <Child onClick={handleClick} />;
}

const Child = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click</button>;
});
```

**Tại sao useCallback?**
- `handleClick` là **function** (reference)
- Pass vào child component
- Child dùng `React.memo()` → cần stable reference

---

### Example 3: Derived Value (useMemo)

```tsx
function Component({ user }: { user: User }) {
  // ✅ useMemo: Memoize computed object (kết quả)
  const userDisplay = useMemo(() => {
    return {
      name: `${user.firstName} ${user.lastName}`,
      initials: `${user.firstName[0]}${user.lastName[0]}`,
    };
  }, [user.firstName, user.lastName]);
  
  return <div>{userDisplay.name}</div>;
}
```

**Tại sao useMemo?**
- `userDisplay` là **object** (kết quả)
- Computed từ user data
- Không muốn tạo object mới mỗi render

---

### Example 4: Async Function (useCallback)

```tsx
function Component({ userId }: { userId: string }) {
  // ✅ useCallback: Memoize async function reference
  const fetchData = useCallback(async () => {
    const data = await api.getData(userId);
    setData(data);
  }, [userId]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // ← Cần stable reference
}
```

**Tại sao useCallback?**
- `fetchData` là **function** (reference)
- Trong `useEffect` dependency
- Không muốn effect chạy lại khi function reference thay đổi

---

## 🔍 Advanced: useMemo với Function

### Có thể dùng useMemo cho function không?

```tsx
// ✅ Technically works, nhưng không đúng mục đích
const handler = useMemo(() => {
  return () => console.log('Clicked');
}, []);
```

**Vấn đề**:
- Function vẫn được tạo mỗi lần (trong return)
- Không memoize function reference đúng cách
- Không semantic

**So với useCallback**:
```tsx
// ✅ Correct và semantic
const handler = useCallback(() => {
  console.log('Clicked');
}, []);
```

---

## 🎓 Key Takeaways

### 1. useMemo = Memoize KẾT QUẢ

- ✅ Return **value** (number, string, array, object)
- ✅ Function chạy **ngay** (trong render)
- ✅ Memoize **kết quả** của function call
- ✅ Dùng cho: Expensive calculations, derived values

---

### 2. useCallback = Memoize FUNCTION

- ✅ Return **function** (reference)
- ✅ Function **chưa chạy** (lazy)
- ✅ Memoize **function reference** itself
- ✅ Dùng cho: Event handlers, functions trong dependencies

---

### 3. Function là Value - Nhưng khác nhau

- ✅ Function là value trong JavaScript
- ✅ `useMemo` memoize **kết quả** của function call
- ✅ `useCallback` memoize **function reference**
- ✅ Cùng là value, nhưng **mục đích khác nhau**

---

### 4. Decision Rule

```
Cần memoize KẾT QUẢ? → useMemo
Cần memoize FUNCTION? → useCallback
```

---

## 📚 Summary

**useMemo**:
- Memoize **kết quả** (return value)
- Function chạy **ngay**
- Return **value** (number, string, array, object)

**useCallback**:
- Memoize **function reference**
- Function **chưa chạy** (lazy)
- Return **function** (reference)

**Điểm khác biệt thực sự**:
- `useMemo` = "Tính toán và memoize kết quả"
- `useCallback` = "Memoize function để dùng sau"

**Cả hai đều memoize value**, nhưng:
- `useMemo` memoize **kết quả** của computation
- `useCallback` memoize **function reference** để pass vào dependencies

