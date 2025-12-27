# Ez-Antd

基于 Ant Design 的 React 组件库，提供开箱即用的业务组件。

## 特性

- 🎨 基于 Ant Design 5.x 构建
- 📦 开箱即用的业务组件
- 🔥 支持 TypeScript
- 🎯 零依赖打包（所有依赖由宿主项目提供）
- 🌈 自动 CSS 注入，无需手动引入样式

## 安装

### 1. 安装 ez-antd

```bash
npm install ez-antd
```

### 2. 安装必需的 Peer Dependencies

Ez-antd 需要以下依赖，请确保您的项目中已安装：

```bash
npm install react react-dom antd react-redux react-router
```

### 3. 安装组件特定依赖

根据您使用的组件，可能需要安装额外的依赖：

#### IconSelect 组件
```bash
npm install @fortawesome/fontawesome-svg-core \
            @fortawesome/free-regular-svg-icons \
            @fortawesome/free-solid-svg-icons \
            @fortawesome/react-fontawesome \
            react-select \
            react-window
```

#### ImageUpload 组件
```bash
npm install antd-img-crop
```

## 快速开始

### 1. 配置全局 Provider

在应用入口文件中配置 `ConfigProvider`：

```tsx
import { ConfigProvider } from 'ez-antd';
import axios from 'axios';

function App() {
  return (
    <ConfigProvider
      request={axios}
      upload={(url, data) => axios.post(url, data)}
      getData={(response) => response.data}
      isSuccess={(response) => response.status === 200}
    >
      <YourApp />
    </ConfigProvider>
  );
}
```

### 2. 使用组件

```tsx
import { RemoteTable, AdminLayout } from 'ez-antd';

// RemoteTable 示例
function UserList() {
  return (
    <RemoteTable
      url="/api/users"
      columns={[
        { title: '姓名', dataIndex: 'name' },
        { title: '邮箱', dataIndex: 'email' }
      ]}
    />
  );
}

// AdminLayout 示例
function Layout() {
  return (
    <AdminLayout
      appName="我的系统"
      menus={[
        { name: '首页', path: '/', icon: 'HomeOutlined' }
      ]}
      userInfo={{ name: '用户名' }}
      onLogout={() => console.log('退出登录')}
    >
      <YourContent />
    </AdminLayout>
  );
}
```

## 组件列表

### 数据展示
- **RemoteTable** - 远程数据表格，支持分页、搜索、排序
- **RemoteTree** - 远程数据树形控件
- **IconSelect** - 图标选择器（需要 FontAwesome 依赖）

### 数据录入
- **RemoteSelect** - 远程数据下拉选择
- **RemoteCascader** - 远程数据级联选择
- **RemoteTableSelect** - 表格形式的数据选择器
- **RemoteModalSelect** - 弹窗形式的数据选择器
- **ImageUpload** - 图片上传组件（需要 antd-img-crop）
- **SearchBar** - 搜索栏组件

### 布局
- **AdminLayout** - 后台管理布局
- **ErrorPage** - 错误页面
- **NoFoundPage** - 404 页面
- **NotAuthorizedPage** - 未授权页面

## 完整依赖列表

### 必需依赖（所有组件）
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "antd": "^5.29.3",
  "react-redux": "^9.2.0",
  "react-router": "^7.11.0"
}
```

### 可选依赖（按需安装）
```json
{
  "@fortawesome/fontawesome-svg-core": "^7.1.0",
  "@fortawesome/free-regular-svg-icons": "^7.1.0",
  "@fortawesome/free-solid-svg-icons": "^7.1.0",
  "@fortawesome/react-fontawesome": "^3.1.1",
  "antd-img-crop": "^4.27.0",
  "react-select": "^5.10.2",
  "react-window": "^2.2.3"
}
```

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

## 本地开发调试

如果需要在本地项目中调试 ez-antd：

```bash
# 在 ez-antd 目录
npm run link:watch

# 在业务项目目录
npm link ez-antd
```

## License

MIT
