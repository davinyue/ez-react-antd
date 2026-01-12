# React Hooks 使用指南

本文档介绍 React 官方 Hooks 的用法、使用场景和示例代码。

---

## 目录

- [基础 Hooks](#基础-hooks)
  - [useState](#usestate)
  - [useEffect](#useeffect)
  - [useContext](#usecontext)
- [额外 Hooks](#额外-hooks)
  - [useReducer](#usereducer)
  - [useCallback](#usecallback)
  - [useMemo](#usememo)
  - [useRef](#useref)
  - [useImperativeHandle](#useimperativehandle)
  - [useLayoutEffect](#uselayouteffect)
  - [useDebugValue](#usedebugvalue)
- [React 18+ 新增 Hooks](#react-18-新增-hooks)
  - [useId](#useid)
  - [useTransition](#usetransition)
  - [useDeferredValue](#usedeferredvalue)
  - [useSyncExternalStore](#usesyncexternalstore)

---

## 基础 Hooks

### useState

**用途**: 在函数组件中添加状态管理

**使用场景**:
- 管理组件的局部状态
- 处理表单输入
- 控制 UI 显示/隐藏
- 计数器、开关等简单状态

**语法**:
```tsx
const [state, setState] = useState(initialState);
```

**示例**:

```tsx
import { useState } from 'react';

// 示例 1: 简单计数器
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>当前计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}

// 示例 2: 表单输入
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('登录:', { username, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="用户名"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      <button type="submit">登录</button>
    </form>
  );
}

// 示例 3: 对象状态
function UserProfile() {
  const [user, setUser] = useState({
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com'
  });

  const updateName = (newName: string) => {
    setUser(prev => ({ ...prev, name: newName }));
  };

  return (
    <div>
      <p>姓名: {user.name}</p>
      <p>年龄: {user.age}</p>
      <button onClick={() => updateName('李四')}>改名</button>
    </div>
  );
}

// 示例 4: 惰性初始化 (适用于初始值计算昂贵的情况)
function ExpensiveComponent() {
  const [data, setData] = useState(() => {
    // 只在首次渲染时执行
    const expensiveData = computeExpensiveValue();
    return expensiveData;
  });

  return <div>{data}</div>;
}
```

**注意事项**:
- 状态更新是异步的
- 更新对象/数组时要创建新的引用
- 可以使用函数式更新: `setState(prev => prev + 1)`

---

### useEffect

**用途**: 处理副作用(数据获取、订阅、DOM 操作等)

**使用场景**:
- API 数据获取
- 订阅/取消订阅
- 手动 DOM 操作
- 定时器设置
- 监听浏览器事件

**语法**:
```tsx
useEffect(() => {
  // 副作用代码
  return () => {
    // 清理函数(可选)
  };
}, [dependencies]);
```

**示例**:

```tsx
import { useState, useEffect } from 'react';

// 示例 1: 数据获取
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // 空数组表示只在挂载时执行一次

  if (loading) return <div>加载中...</div>;
  return <ul>{users.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}

// 示例 2: 订阅和清理
function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 订阅聊天室
    const subscription = subscribeToRoom(roomId, (message) => {
      setMessages(prev => [...prev, message]);
    });

    // 清理函数:组件卸载或 roomId 变化时执行
    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]); // roomId 变化时重新订阅

  return <div>{/* 渲染消息 */}</div>;
}

// 示例 3: 定时器
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>已运行 {seconds} 秒</div>;
}

// 示例 4: 监听窗口大小
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>窗口大小: {size.width} x {size.height}</div>;
}

// 示例 5: 依赖项变化时执行
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    fetch(`/api/search?q=${query}`)
      .then(res => res.json())
      .then(setResults);
  }, [query]); // query 变化时重新搜索

  return <div>{/* 渲染结果 */}</div>;
}
```

**依赖数组说明**:
- `[]` - 只在挂载时执行一次
- `[dep1, dep2]` - 依赖项变化时执行
- 不传 - 每次渲染都执行(通常不推荐)

---

### useContext

**用途**: 读取和订阅 Context

**使用场景**:
- 全局主题配置
- 用户认证信息
- 多语言设置
- 全局状态管理
- 避免 props 层层传递

**语法**:
```tsx
const value = useContext(MyContext);
```

**示例**:

```tsx
import { createContext, useContext, useState } from 'react';

// 示例 1: 主题切换
const ThemeContext = createContext<'light' | 'dark'>('light');

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button style={{
      background: theme === 'light' ? '#fff' : '#333',
      color: theme === 'light' ? '#000' : '#fff'
    }}>
      当前主题: {theme}
    </button>
  );
}

// 示例 2: 用户认证
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return <div>请登录</div>;

  return (
    <div>
      <p>欢迎, {user.name}</p>
      <button onClick={logout}>退出</button>
    </div>
  );
}

// 示例 3: 多层级数据传递
interface AppConfig {
  apiUrl: string;
  timeout: number;
}

const ConfigContext = createContext<AppConfig>({
  apiUrl: 'https://api.example.com',
  timeout: 5000
});

function DeepNestedComponent() {
  const config = useContext(ConfigContext);
  
  // 不需要通过 props 层层传递,直接获取配置
  return <div>API URL: {config.apiUrl}</div>;
}
```

---

## 额外 Hooks

### useReducer

**用途**: 管理复杂状态逻辑

**使用场景**:
- 状态逻辑复杂
- 多个子值的状态对象
- 下一个状态依赖前一个状态
- 需要深层更新的状态

**语法**:
```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

**示例**:

```tsx
import { useReducer } from 'react';

// 示例 1: 购物车
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
  total: number;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return { items: [], total: 0 };

    default:
      return state;
  }
}

function ShoppingCart() {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  return (
    <div>
      <h2>购物车</h2>
      {cart.items.map(item => (
        <div key={item.id}>
          {item.name} x {item.quantity}
          <button onClick={() => removeItem(item.id)}>删除</button>
        </div>
      ))}
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
        清空购物车
      </button>
    </div>
  );
}

// 示例 2: 表单状态管理
interface FormState {
  username: string;
  email: string;
  password: string;
  errors: Record<string, string>;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_ERROR'; field: string; error: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: '' }
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error }
      };
    case 'RESET':
      return {
        username: '',
        email: '',
        password: '',
        errors: {}
      };
    default:
      return state;
  }
}

function RegistrationForm() {
  const [form, dispatch] = useReducer(formReducer, {
    username: '',
    email: '',
    password: '',
    errors: {}
  });

  const handleChange = (field: string, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  return (
    <form>
      <input
        value={form.username}
        onChange={(e) => handleChange('username', e.target.value)}
        placeholder="用户名"
      />
      {form.errors.username && <span>{form.errors.username}</span>}
      {/* 其他字段... */}
    </form>
  );
}
```

---

### useCallback

**用途**: 缓存函数,避免不必要的重新创建

**使用场景**:
- 传递给子组件的回调函数
- 作为 useEffect 的依赖项
- 优化性能,避免子组件不必要的重渲染

**语法**:
```tsx
const memoizedCallback = useCallback(fn, [dependencies]);
```

**示例**:

```tsx
import { useState, useCallback, memo } from 'react';

// 示例 1: 优化子组件渲染
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const ExpensiveButton = memo(({ onClick, children }: ButtonProps) => {
  console.log('Button 渲染');
  return <button onClick={onClick}>{children}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // 使用 useCallback 缓存函数
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 空依赖数组,函数永远不变

  // 不使用 useCallback,每次渲染都会创建新函数
  const handleClickBad = () => {
    setCount(c => c + 1);
  };

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <p>Count: {count}</p>
      {/* 使用 useCallback,text 变化时不会重渲染 */}
      <ExpensiveButton onClick={handleClick}>优化的按钮</ExpensiveButton>
      {/* 不使用 useCallback,text 变化时会重渲染 */}
      <ExpensiveButton onClick={handleClickBad}>未优化的按钮</ExpensiveButton>
    </div>
  );
}

// 示例 2: 作为 useEffect 依赖
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const fetchResults = useCallback(async () => {
    if (!query) return;
    const res = await fetch(`/api/search?q=${query}`);
    const data = await res.json();
    setResults(data);
  }, [query]); // query 变化时重新创建函数

  useEffect(() => {
    fetchResults();
  }, [fetchResults]); // fetchResults 作为依赖

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* 渲染结果 */}
    </div>
  );
}
```

---

### useMemo

**用途**: 缓存计算结果,避免重复计算

**使用场景**:
- 昂贵的计算
- 复杂的数据转换
- 避免子组件不必要的重渲染

**语法**:
```tsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

**示例**:

```tsx
import { useState, useMemo } from 'react';

// 示例 1: 昂贵的计算
function ProductList({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // 使用 useMemo 缓存过滤和排序结果
  const filteredAndSortedProducts = useMemo(() => {
    console.log('重新计算...');
    return products
      .filter(p => p.name.includes(filter))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price') return a.price - b.price;
        return 0;
      });
  }, [products, filter, sortBy]); // 只有这些依赖变化时才重新计算

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索..."
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">按名称</option>
        <option value="price">按价格</option>
      </select>
      <ul>
        {filteredAndSortedProducts.map(p => (
          <li key={p.id}>{p.name} - ¥{p.price}</li>
        ))}
      </ul>
    </div>
  );
}

// 示例 2: 避免对象引用变化
function UserProfile({ userId }: { userId: string }) {
  const [userData, setUserData] = useState(null);

  // 使用 useMemo 缓存配置对象
  const requestConfig = useMemo(() => ({
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'User-ID': userId
    }
  }), [userId]);

  useEffect(() => {
    fetch('/api/user', requestConfig)
      .then(res => res.json())
      .then(setUserData);
  }, [requestConfig]); // requestConfig 不会每次都变化

  return <div>{/* 渲染用户数据 */}</div>;
}

// 示例 3: 计算派生状态
function Statistics({ numbers }: { numbers: number[] }) {
  const stats = useMemo(() => {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = sum / numbers.length;
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    
    return { sum, avg, max, min };
  }, [numbers]);

  return (
    <div>
      <p>总和: {stats.sum}</p>
      <p>平均: {stats.avg.toFixed(2)}</p>
      <p>最大: {stats.max}</p>
      <p>最小: {stats.min}</p>
    </div>
  );
}
```

**useCallback vs useMemo**:
- `useCallback` 缓存函数本身
- `useMemo` 缓存函数的返回值
- `useCallback(fn, deps)` 等价于 `useMemo(() => fn, deps)`

---

### useRef

**用途**: 保存可变值,不触发重渲染;访问 DOM 元素

**使用场景**:
- 访问 DOM 元素
- 保存定时器 ID
- 保存上一次的值
- 存储不需要触发渲染的数据

**语法**:
```tsx
const ref = useRef(initialValue);
```

**示例**:

```tsx
import { useRef, useEffect, useState } from 'react';

// 示例 1: 访问 DOM 元素
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>聚焦输入框</button>
    </div>
  );
}

// 示例 2: 保存定时器 ID
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stop(); // 清理
  }, []);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={start}>开始</button>
      <button onClick={stop}>停止</button>
    </div>
  );
}

// 示例 3: 保存上一次的值
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>当前: {count}</p>
      <p>之前: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

// 示例 4: 存储不触发渲染的值
function Chat() {
  const [messages, setMessages] = useState([]);
  const isScrolledToBottom = useRef(true);

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev, msg]);
    // isScrolledToBottom 变化不会触发重渲染
    isScrolledToBottom.current = checkIfScrolledToBottom();
  };

  return <div>{/* 聊天界面 */}</div>;
}

// 示例 5: 测量 DOM 元素
function MeasureElement() {
  const divRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect();
      setSize({ width, height });
    }
  }, []);

  return (
    <div ref={divRef}>
      尺寸: {size.width} x {size.height}
    </div>
  );
}
```

---

### useImperativeHandle

**用途**: 自定义暴露给父组件的实例值

**使用场景**:
- 封装组件,只暴露特定方法
- 配合 forwardRef 使用
- 控制子组件的行为

**语法**:
```tsx
useImperativeHandle(ref, createHandle, [deps]);
```

**示例**:

```tsx
import { useRef, useImperativeHandle, forwardRef } from 'react';

// 示例 1: 自定义输入框
interface CustomInputHandle {
  focus: () => void;
  clear: () => void;
}

const CustomInput = forwardRef<CustomInputHandle, {}>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }));

  return <input ref={inputRef} />;
});

function Parent() {
  const inputRef = useRef<CustomInputHandle>(null);

  return (
    <div>
      <CustomInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>聚焦</button>
      <button onClick={() => inputRef.current?.clear()}>清空</button>
    </div>
  );
}

// 示例 2: 视频播放器
interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, { src: string }>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    seek: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    }
  }));

  return <video ref={videoRef} src={props.src} />;
});
```

---

### useLayoutEffect

**用途**: 在 DOM 更新后同步执行副作用

**使用场景**:
- 需要读取 DOM 布局
- 需要同步修改 DOM
- 避免闪烁

**语法**:
```tsx
useLayoutEffect(() => {
  // 副作用代码
  return () => {
    // 清理
  };
}, [dependencies]);
```

**示例**:

```tsx
import { useLayoutEffect, useRef, useState } from 'react';

// 示例 1: 测量元素并调整位置
function Tooltip({ children }: { children: React.ReactNode }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      // 确保 tooltip 不超出屏幕
      const newPosition = {
        top: rect.bottom > window.innerHeight ? rect.top - rect.height : rect.bottom,
        left: rect.right > window.innerWidth ? window.innerWidth - rect.width : rect.left
      };
      setPosition(newPosition);
    }
  }, [children]);

  return (
    <div
      ref={tooltipRef}
      style={{ position: 'absolute', top: position.top, left: position.left }}
    >
      {children}
    </div>
  );
}

// 示例 2: 避免闪烁
function AnimatedBox() {
  const boxRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // 在浏览器绘制前同步执行,避免闪烁
    if (boxRef.current) {
      boxRef.current.style.transform = 'translateX(100px)';
    }
  }, []);

  return <div ref={boxRef}>动画盒子</div>;
}
```

**useEffect vs useLayoutEffect**:
- `useEffect`: 异步执行,不阻塞浏览器绘制
- `useLayoutEffect`: 同步执行,阻塞浏览器绘制
- 大多数情况使用 `useEffect`,只有需要同步 DOM 操作时才用 `useLayoutEffect`

---

### useDebugValue

**用途**: 在 React DevTools 中显示自定义 Hook 的标签

**使用场景**:
- 调试自定义 Hook
- 显示 Hook 的状态

**语法**:
```tsx
useDebugValue(value);
useDebugValue(value, format);
```

**示例**:

```tsx
import { useState, useDebugValue } from 'react';

// 示例 1: 简单使用
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  // 在 DevTools 中显示 "OnlineStatus: Online" 或 "OnlineStatus: Offline"
  useDebugValue(isOnline ? 'Online' : 'Offline');

  return isOnline;
}

// 示例 2: 格式化显示
function useUserData(userId: string) {
  const [user, setUser] = useState(null);

  // 只在 DevTools 打开时才格式化,避免性能损耗
  useDebugValue(user, user => 
    user ? `User: ${user.name} (${user.id})` : 'Loading...'
  );

  return user;
}
```

---

## React 18+ 新增 Hooks

### useId

**用途**: 生成唯一 ID,用于无障碍属性

**使用场景**:
- 表单 label 和 input 关联
- ARIA 属性
- 服务端渲染时保持 ID 一致

**语法**:
```tsx
const id = useId();
```

**示例**:

```tsx
import { useId } from 'react';

// 示例 1: 表单标签
function FormField({ label }: { label: string }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}

// 示例 2: 多个相关 ID
function AccessibleForm() {
  const id = useId();

  return (
    <div>
      <label htmlFor={`${id}-email`}>邮箱</label>
      <input id={`${id}-email`} type="email" />
      
      <label htmlFor={`${id}-password`}>密码</label>
      <input id={`${id}-password`} type="password" />
    </div>
  );
}
```

---

### useTransition

**用途**: 标记非紧急更新,保持 UI 响应

**使用场景**:
- 大列表渲染
- 复杂计算
- 标签页切换

**语法**:
```tsx
const [isPending, startTransition] = useTransition();
```

**示例**:

```tsx
import { useState, useTransition } from 'react';

// 示例 1: 标签页切换
function TabContainer() {
  const [tab, setTab] = useState('home');
  const [isPending, startTransition] = useTransition();

  const selectTab = (nextTab: string) => {
    startTransition(() => {
      setTab(nextTab); // 标记为非紧急更新
    });
  };

  return (
    <div>
      <button onClick={() => selectTab('home')}>首页</button>
      <button onClick={() => selectTab('profile')}>个人</button>
      <button onClick={() => selectTab('settings')}>设置</button>
      
      {isPending && <div>加载中...</div>}
      {tab === 'home' && <HomePage />}
      {tab === 'profile' && <ProfilePage />}
      {tab === 'settings' && <SettingsPage />}
    </div>
  );
}

// 示例 2: 搜索过滤
function SearchList({ items }: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 输入立即更新
    setQuery(e.target.value);
    
    // 过滤结果标记为非紧急
    startTransition(() => {
      // 触发重渲染
    });
  };

  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <div>搜索中...</div>}
      <ul>
        {filteredItems.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}
```

---

### useDeferredValue

**用途**: 延迟更新值,保持 UI 响应

**使用场景**:
- 输入防抖
- 大列表过滤
- 实时搜索

**语法**:
```tsx
const deferredValue = useDeferredValue(value);
```

**示例**:

```tsx
import { useState, useDeferredValue, useMemo } from 'react';

// 示例 1: 搜索列表
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    // 使用延迟的 query 进行搜索
    return searchItems(deferredQuery);
  }, [deferredQuery]);

  return (
    <div>
      {results.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
}

function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <div>
      {/* 输入立即响应 */}
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {/* 搜索结果延迟更新 */}
      <SearchResults query={query} />
    </div>
  );
}

// 示例 2: 大列表渲染
function ProductList({ filter }: { filter: string }) {
  const deferredFilter = useDeferredValue(filter);
  const isStale = filter !== deferredFilter;

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.includes(deferredFilter));
  }, [deferredFilter]);

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

### useSyncExternalStore

**用途**: 订阅外部数据源

**使用场景**:
- 订阅浏览器 API
- 订阅第三方状态管理库
- 订阅 WebSocket

**语法**:
```tsx
const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
```

**示例**:

```tsx
import { useSyncExternalStore } from 'react';

// 示例 1: 订阅在线状态
function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // getSnapshot
    () => navigator.onLine,
    // getServerSnapshot (SSR)
    () => true
  );
}

function StatusIndicator() {
  const isOnline = useOnlineStatus();
  return <div>{isOnline ? '在线' : '离线'}</div>;
}

// 示例 2: 订阅窗口大小
function useWindowSize() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => ({ width: window.innerWidth, height: window.innerHeight }),
    () => ({ width: 0, height: 0 })
  );
}
```

---

## 最佳实践

### 1. Hooks 使用规则

- ✅ 只在函数组件或自定义 Hook 中调用
- ✅ 只在顶层调用,不在循环、条件或嵌套函数中
- ✅ 使用 ESLint 插件 `eslint-plugin-react-hooks`

### 2. 依赖数组

- ✅ 包含所有使用的外部变量
- ✅ 使用 ESLint 规则 `exhaustive-deps`
- ⚠️ 避免遗漏依赖导致的 bug

### 3. 性能优化

- 使用 `useMemo` 缓存昂贵计算
- 使用 `useCallback` 缓存回调函数
- 使用 `React.memo` 配合 Hooks 优化组件
- 避免过度优化,先测量再优化

### 4. 自定义 Hooks

- 以 `use` 开头命名
- 复用状态逻辑
- 保持简单和可测试

```tsx
// 自定义 Hook 示例
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// 使用
function App() {
  const [name, setName] = useLocalStorage('name', '');
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

---

## 总结

React Hooks 提供了强大而灵活的方式来管理组件状态和副作用。选择合适的 Hook:

- **状态管理**: `useState`, `useReducer`
- **副作用**: `useEffect`, `useLayoutEffect`
- **性能优化**: `useMemo`, `useCallback`
- **引用**: `useRef`, `useImperativeHandle`
- **上下文**: `useContext`
- **并发特性**: `useTransition`, `useDeferredValue`

记住:先让代码工作,再考虑优化! 🚀
