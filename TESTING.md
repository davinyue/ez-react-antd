# 测试和 Storybook 使用指南

## 概述

`ez-react-antd` 现已配置完整的测试和组件预览环境:
- **Vitest**: 单元测试框架
- **Storybook**: 组件可视化预览和文档

## 运行测试

### 运行所有测试
```bash
npm run test
```

### 运行测试并查看 UI 界面
```bash
npm run test:ui
```
在浏览器中打开 http://localhost:51204 查看测试 UI

### 生成测试覆盖率报告
```bash
npm run test:coverage
```
覆盖率报告将生成在 `coverage/` 目录

### 运行特定测试文件
```bash
npm run test -- src/RemoteSelect/RemoteSelect.test.tsx
```

## 运行 Storybook

### 启动开发服务器
```bash
npm run storybook
```
在浏览器中打开 http://localhost:6006 查看组件预览

### 构建静态站点
```bash
npm run build-storybook
```
静态文件将生成在 `storybook-static/` 目录

## 已创建的测试和 Stories

### 组件测试
- ✅ `src/RemoteSelect/RemoteSelect.test.tsx` - RemoteSelect 组件测试
- ✅ `src/ImageUpload/ImageUpload.test.tsx` - ImageUpload 组件测试

### 工具函数测试
- ✅ `src/utils/compare.test.ts` - compare 工具函数测试 (28/29 通过)

### Storybook Stories
- ✅ `src/RemoteSelect/RemoteSelect.stories.tsx` - 10 个使用场景
- ✅ `src/ImageUpload/ImageUpload.stories.tsx` - 9 个使用场景

## 编写新的测试

### 组件测试示例
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 创建新的 Story
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import YourComponent from './YourComponent';

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof YourComponent>;

export const Basic: Story = {
  args: {
    // 组件 props
  },
};
```

## 测试配置文件

- `vitest.config.ts` - Vitest 配置
- `.storybook/main.ts` - Storybook 主配置
- `.storybook/preview.tsx` - Storybook 预览配置
- `src/test/setup.ts` - 测试环境设置

## 注意事项

### 打包大小
所有测试和 Storybook 相关依赖都是 `devDependencies`,不会影响最终打包产物的大小。

### 测试文件命名
- 测试文件: `*.test.ts` 或 `*.test.tsx`
- Story 文件: `*.stories.ts` 或 `*.stories.tsx`

这些文件会被自动排除在打包之外。

### 已知问题
- `compare.test.ts` 有 1 个测试用例失败,需要进一步调试 compare 函数的边界情况

## 下一步

1. 为其他组件添加测试和 Stories
2. 提高测试覆盖率
3. 添加端到端测试(可选)
