# Vitest 调试指南

## 使用 Debugger 调试测试

Vitest 支持多种调试方式,以下是推荐的方法:

### 方法 1: 使用 VS Code 内置调试器 (推荐)

#### 1. 创建调试配置

在项目根目录创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test", "--", "--run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test", "--", "--run", "${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

#### 2. 使用调试器

1. 在测试文件中设置断点(点击行号左侧)
2. 按 `F5` 或点击"运行和调试"面板的绿色三角形
3. 选择 "Debug Current Test File"
4. 代码会在断点处暂停,可以:
   - 查看变量值
   - 单步执行
   - 查看调用栈
   - 在调试控制台执行表达式

### 方法 2: 使用 `debugger` 语句

在测试代码中直接添加 `debugger` 语句:

```typescript
it('compares array vs primitive', () => {
  const result = compare([1], 1);
  debugger; // 代码会在这里暂停
  expect(result).toBe(true);
});
```

然后使用 VS Code 调试器运行测试,代码会在 `debugger` 语句处暂停。

### 方法 3: 使用 Chrome DevTools

#### 1. 安装 Node.js 调试工具

```bash
npm install -D @vitest/ui
```

#### 2. 运行测试并启用调试

```bash
node --inspect-brk ./node_modules/.bin/vitest --run
```

#### 3. 在 Chrome 中打开调试

1. 打开 Chrome 浏览器
2. 访问 `chrome://inspect`
3. 点击 "Open dedicated DevTools for Node"
4. 在 Sources 面板中设置断点
5. 继续执行代码

### 方法 4: 使用 Vitest UI (可视化调试)

#### 1. 启动 Vitest UI

```bash
npm run test:ui
```

#### 2. 在浏览器中查看

- 访问 http://localhost:51204
- 可以查看测试结果
- 查看每个测试的执行时间
- 查看失败的测试详情
- 重新运行特定测试

### 方法 5: 使用 console.log 调试

最简单的方法,在测试中添加 `console.log`:

```typescript
it('compares array vs primitive', () => {
  const arr = [1];
  const num = 1;
  
  console.log('arr:', arr);
  console.log('num:', num);
  console.log('arr == num:', arr == num);
  
  const result = compare(arr, num);
  console.log('result:', result);
  
  expect(result).toBe(true);
});
```

运行测试时会在控制台显示日志。

## 调试技巧

### 1. 只运行单个测试

使用 `.only` 只运行特定测试:

```typescript
it.only('compares array vs primitive', () => {
  // 只运行这个测试
});
```

### 2. 跳过某些测试

使用 `.skip` 跳过测试:

```typescript
it.skip('compares array vs primitive', () => {
  // 跳过这个测试
});
```

### 3. 使用 `test.each` 进行数据驱动测试

```typescript
test.each([
  [[1], 1, true],
  [[], 1, false],
  [[1, 2], 1, false],
])('compare(%s, %s) should be %s', (arr, num, expected) => {
  expect(compare(arr, num)).toBe(expected);
});
```

### 4. 查看测试覆盖率

```bash
npm run test:coverage
```

在 `coverage/index.html` 中查看哪些代码没有被测试覆盖。

## 常见问题

### Q: 断点不生效?
A: 确保:
1. 使用 `--run` 参数(不使用 watch 模式)
2. 源码映射(source maps)已启用
3. TypeScript 文件已正确编译

### Q: 如何调试异步测试?
A: 在 `async` 函数中使用 `await` 和断点:

```typescript
it('async test', async () => {
  const result = await someAsyncFunction();
  debugger; // 会在异步操作完成后暂停
  expect(result).toBe(expected);
});
```

### Q: 如何查看 React 组件的状态?
A: 使用 `screen.debug()`:

```typescript
import { render, screen } from '@testing-library/react';

it('renders component', () => {
  render(<MyComponent />);
  screen.debug(); // 打印当前 DOM 结构
});
```

## 推荐的调试工作流

1. **先运行所有测试**,找出失败的测试
2. **使用 `.only`** 只运行失败的测试
3. **添加 `console.log`** 快速查看变量值
4. **使用 VS Code 调试器** 进行深入调试
5. **修复问题后移除 `.only`**,确保所有测试通过

## 示例: 调试 compare 函数

```typescript
// 在测试文件中
it.only('debug compare function', () => {
  const arr = [1];
  const num = 1;
  
  // 方法 1: 使用 console.log
  console.log('Testing compare([1], 1)');
  console.log('arr == num:', arr == num); // true!
  
  // 方法 2: 使用 debugger
  debugger; // VS Code 会在这里暂停
  
  const result = compare(arr, num);
  expect(result).toBe(true);
});
```

## 总结

- ✅ **VS Code 调试器**: 最强大,适合复杂调试
- ✅ **console.log**: 最简单,适合快速检查
- ✅ **Vitest UI**: 最直观,适合查看测试结果
- ✅ **debugger 语句**: 最灵活,适合精确定位

选择适合你的方法,happy debugging! 🐛
