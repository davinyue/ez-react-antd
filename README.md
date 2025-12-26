# ez-antd

基于 Ant Design 的公共组件库

## 安装

```bash
npm install ez-antd
# 或
yarn add ez-antd
```

## 使用

```tsx
import { Grid, RemoteTable, SearchBar } from 'ez-antd';
import 'ez-antd/style.css';

function App() {
  return (
    <div>
      <SearchBar modelName="user" />
      <RemoteTable 
        modelName="user"
        columns={columns}
      />
    </div>
  );
}
```

## 组件列表

### 基础组件
- **Grid** - 响应式网格
- **Loading** - 加载组件

### 表格组件
- **RemoteTable** - 远程数据表格

### 表单组件
- **SearchBar** - 搜索栏

## 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## License

MIT
