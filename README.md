# Ez-React-Antd

基于 Ant Design 5.x 的 React 业务组件库，提供开箱即用的企业级组件。

## ✨ 特性

- 🎨 **基于 Ant Design 5.x** - 继承 Ant Design 的优秀设计
- 📦 **开箱即用** - 22+ 业务组件，覆盖常见场景
- 🔥 **TypeScript** - 完整的类型定义和 JSDoc 注释
- 🎯 **零依赖打包** - Peer Dependencies 模式，避免重复打包
- 🌈 **自动样式注入** - 无需手动引入 CSS
- 📱 **响应式设计** - 自动适配移动端和桌面端
- 🔗 **Redux 集成** - 与 Redux 无缝集成

## 📦 安装

### 基础安装

```bash
npm install ez-react-antd
```

### 必需的 Peer Dependencies

```bash
npm install react react-dom antd react-redux react-router redux
```

### 可选依赖（按需安装）

**IconSelect 组件**
```bash
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-regular-svg-icons @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome react-select react-window
```

**ImageUpload 组件**
```bash
npm install antd-img-crop
```

## 🚀 快速开始

### 1. 配置全局 Provider

在应用入口配置 `ConfigProvider`：

```tsx
import { ConfigProvider } from 'ez-react-antd';
import request from './utils/request'; // 你的请求工具

function App() {
  return (
    <ConfigProvider value={{
      request: {
        getRequest: (url, params) => request.get(url, { params }),
        postRequest: (url, data) => request.post(url, data),
        putRequest: (url, data) => request.put(url, data),
        deleteRequest: (url, params) => request.delete(url, { params }),
      },
      responseIsSuccess: (res) => res.status === 200 && res.data.code === 0,
      upload: (url, formData) => request.post(url, formData),
    }}>
      <YourApp />
    </ConfigProvider>
  );
}
```

### 2. 使用组件

```tsx
import { RemoteTable, RemoteSelect, AdminLayout } from 'ez-react-antd';

// 远程表格
<RemoteTable 
  modelName="user"
  columns={columns}
  queryParam={{ status: 'active' }}
/>

// 远程下拉选择
<RemoteSelect 
  api="/api/users"
  labelKey="name"
  valueKey="id"
  onChange={(value) => console.log(value)}
/>

// 后台布局
<AdminLayout
  appName="管理系统"
  menus={menuConfig}
  userInfo={currentUser}
  onLogout={handleLogout}
>
  <YourContent />
</AdminLayout>
```

## 📚 组件文档

### 核心组件

#### ConfigProvider

全局配置提供者，为所有组件提供统一的请求和响应处理。

**Props:**
- `request` - 请求方法对象（getRequest, postRequest, putRequest, deleteRequest）
- `responseIsSuccess` - 判断响应是否成功的函数
- `upload` - 文件上传方法

**示例:**
```tsx
<ConfigProvider value={{
  request: requestInstance,
  responseIsSuccess: (res) => res.status === 200,
  upload: (url, formData) => axios.post(url, formData)
}}>
  <App />
</ConfigProvider>
```

#### AdminLayout

后台管理系统布局组件，支持响应式、主题切换。

**Props:**
- `menus` - 菜单配置数组
- `appName` - 系统名称（默认: 'System'）
- `appIcon` - 系统图标 URL
- `userInfo` - 用户信息对象
- `onLogout` - 退出登录回调
- `onModifyPassword` - 修改密码回调
- `fileDownloadUrl` - 文件下载地址

**示例:**
```tsx
<AdminLayout
  appName="ERP系统"
  appIcon="/logo.png"
  menus={[
    { name: '首页', path: '/', icon: 'HomeOutlined' },
    { name: '用户管理', path: '/users', icon: 'UserOutlined' }
  ]}
  userInfo={{ name: '张三', avatar: '/avatar.jpg' }}
  onLogout={() => logout()}
>
  <Routes />
</AdminLayout>
```

---

### 数据展示组件

#### RemoteTable

从远程 API 加载分页数据的表格组件，支持响应式布局。

**Props:**
- `modelName` - Redux 模块名称（必需）
- `columns` - 表格列配置（必需）
- `queryParam` - 查询参数对象
- `primaryKey` - 行主键字段名（默认: 'id'）
- `queryMethod` - 查询方法名（默认: 'getPageInfo'）
- `paramName` - 查询参数在 store 中的字段名（默认: 'queryParam'）
- `dataStore` - 分页数据在 store 中的字段名（默认: 'pageData'）
- `title` - 表格标题
- `rowSelection` - 行选择配置
- `expandable` - 展开配置
- `showHeader` - 是否显示表头（默认: true）
- `scrollSub` - 横向滚动条宽度补偿（默认: 0）
- `notShowLoading` - 不显示 loading（默认: false）

**示例:**
```tsx
<RemoteTable
  modelName="user"
  columns={[
    { title: '姓名', dataIndex: 'name' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '操作', render: (_, record) => <Button>编辑</Button> }
  ]}
  queryParam={{ status: 'active' }}
  rowSelection={{
    type: 'checkbox',
    onChange: (keys, rows) => console.log(keys, rows)
  }}
/>
```

#### RemoteTree

远程数据树形控件，支持动态加载子节点。

**Props:**
- `api` - 数据请求接口 URL
- `queryParam` - 查询参数
- `labelKey` - 显示字段名（默认: 'name'）
- `valueKey` - 值字段名（默认: 'id'）
- `onSelect` - 选中节点回调
- `checkable` - 是否显示复选框
- `onCheck` - 复选框选中回调

**示例:**
```tsx
<RemoteTree
  api="/api/departments"
  labelKey="name"
  valueKey="id"
  checkable
  onCheck={(checkedKeys) => console.log(checkedKeys)}
/>
```

#### IconSelect

图标选择器，支持 Ant Design Icons 和 FontAwesome 图标。

**Props:**
- `value` - 当前选中的图标值
- `onChange` - 选中变化回调

**示例:**
```tsx
<IconSelect
  value={iconValue}
  onChange={(value) => setIconValue(value)}
/>
```

---

### 表单组件

#### RemoteSelect

从远程 API 加载选项的下拉选择框。

**Props:**
- `api` - 数据请求接口 URL（必需）
- `labelKey` - 显示字段名（默认: 'name'）
- `valueKey` - 值字段名（默认: 'id'）
- `queryParam` - 查询参数对象
- `needQueryParam` - 是否需要参数才请求（默认: false）
- `placeholder` - 占位提示（默认: '请选择'）
- `allowClear` - 允许清除（默认: true）
- `showSearch` - 显示搜索（默认: true）
- `selectedFirst` - 默认选中第一个（默认: false）
- `metaDataInValue` - 返回原始数据（默认: false）
- `mode` - 选择模式（'multiple' | 'tags'）
- `disabled` - 是否禁用
- `onChange` - 选中变化回调
- `onLoadingChange` - 加载状态变化回调

**示例:**
```tsx
<RemoteSelect
  api="/api/users"
  labelKey="name"
  valueKey="id"
  queryParam={{ department: 'IT' }}
  onChange={(value) => console.log(value)}
  showSearch
  allowClear
/>
```

#### RemoteCascader

远程级联选择器，支持动态加载子节点。

**Props:**
- `api` - 数据请求接口 URL（必需）
- `labelKey` - 显示字段名（默认: 'name'）
- `valueKey` - 值字段名（默认: 'id'）
- `queryParam` - 查询参数
- `defaultParam` - 默认参数（会合并到每次请求）
- `initValue` - 初始值
- `value` - 当前值
- `placeholder` - 占位提示
- `allowClear` - 允许清除
- `onChange` - 选中变化回调
- `onLoadSonData` - 加载子节点参数构造函数

**示例:**
```tsx
<RemoteCascader
  api="/api/regions"
  labelKey="name"
  valueKey="code"
  initValue={['110000', '110100']}
  onChange={(values) => console.log(values)}
  onLoadSonData={(option) => ({ parentId: option.value })}
/>
```

#### SearchBar

搜索栏组件，与 Redux 集成，支持展开/收起。

**Props:**
- `modelName` - Redux 模块名称（必需）
- `moreItem` - 更多搜索条件（展开后显示）
- `disabled` - 禁用所有按钮
- `paramName` - 查询参数字段名（默认: 'queryParam'）
- `dataStore` - 数据存储字段名（默认: 'pageData'）
- `queryMethod` - 查询方法名（默认: 'getPageInfo'）
- `onValuesChange` - 表单值变化回调
- `onSearch` - 搜索前数据处理函数
- `showAddMenu` - 显示新增按钮
- `showDeleteMenu` - 显示删除按钮
- `addMenuName` - 新增按钮文本（默认: '新增'）
- `deleteMenuName` - 删除按钮文本（默认: '删除'）
- `onClickAdd` - 新增按钮回调
- `onClickDelete` - 删除按钮回调

**示例:**
```tsx
<SearchBar modelName="user" showAddMenu onClickAdd={handleAdd}>
  <SearchBar.Item label="用户名" name="username">
    <Input placeholder="请输入用户名" />
  </SearchBar.Item>
  <SearchBar.Item label="状态" name="status">
    <Select options={statusOptions} />
  </SearchBar.Item>
</SearchBar>
```

#### ImageUpload

图片上传组件，支持裁剪和 base64。

**Props:**
- `limit` - 张数限制（默认: 1）
- `aspect` - 裁切宽高比（默认: 1）
- `showGrid` - 显示裁切网格（默认: true）
- `quality` - 图片质量 0-1（默认: 1）
- `rotationSlider` - 启用旋转
- `cropShape` - 裁切形状（'rect' | 'round'，默认: 'rect'）
- `value` - 图片地址
- `onChange` - 变化回调
- `enabledUpload` - 启用上传到服务器（默认: true）
- `disabled` - 是否禁用
- `needCrop` - 是否需要裁剪（默认: true）
- `uploadUrl` - 上传接口地址

**示例:**
```tsx
<ImageUpload
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  uploadUrl="/api/upload"
  cropShape="round"
  aspect={1}
/>
```

#### RemoteTableSelect

表格选择器，在模态框中显示表格进行选择。

**Props:**
- 继承 `RemoteTable` 的所有属性
- `placeholder` - 占位提示
- `limit` - 最大可选数量（默认: 无限制）
- `labelKey` - 显示字段名（默认: 'name'）
- `labelRender` - 自定义标签渲染函数
- `showSort` - 显示排序按钮（默认: false）
- `disabled` - 是否禁用
- `value` - 当前值
- `onChange` - 变化回调

**示例:**
```tsx
<RemoteTableSelect
  modelName="product"
  columns={columns}
  labelKey="name"
  limit={5}
  showSort
  onChange={(selected) => console.log(selected)}
/>
```

#### DrawerRemoteTableSelect

抽屉式表格选择器。

**Props:**
- 继承 `RemoteTable` 的所有属性
- `limit` - 最大可选数量
- `open` - 是否打开抽屉
- `onClose` - 关闭回调
- `width` - 抽屉宽度
- `title` - 抽屉标题
- `onSearch` - 搜索回调
- `returnSourceData` - 返回原始数据（默认: false）
- `value` - 当前值
- `onChange` - 变化回调

**示例:**
```tsx
<DrawerRemoteTableSelect
  modelName="user"
  columns={columns}
  open={visible}
  onClose={() => setVisible(false)}
  title="选择用户"
  limit={10}
  onChange={(selected) => console.log(selected)}
/>
```

#### RemoteModalSelect

模态框表格选择器。

**Props:**
- `primaryKey` - 主键字段（默认: 'id'）
- `limit` - 最大可选数量
- `disabled` - 是否禁用
- `onSubmit` - 提交回调
- `value` - 当前值
- `tableProp` - 表格属性配置

**示例:**
```tsx
<RemoteModalSelect
  tableProp={{
    modelName: 'product',
    columns: columns
  }}
  limit={5}
  onSubmit={(selected) => console.log(selected)}
/>
```

---

### UI 组件

#### Link

链接组件，基于 react-router 的 Link 封装。

**Props:**
- `to` - 跳转路径（必需）
- `children` - 子元素

**示例:**
```tsx
<Link to="/dashboard">前往控制台</Link>
```

#### Loading

加载组件，在内容上方显示加载动画。

**Props:**
- `loading` - 是否显示加载状态（默认: false）
- `children` - 子组件内容

**示例:**
```tsx
<Loading loading={isLoading}>
  <YourContent />
</Loading>
```

#### ModalAvatar

模态框头像组件，点击预览大图。

**Props:**
- `src` - 图片地址（必需）

**示例:**
```tsx
<ModalAvatar src="/avatar.jpg" />
```

#### Drawer

抽屉组件，自定义关闭按钮样式。

**Props:**
- 继承 Ant Design Drawer 的所有属性
- `closeTxt` - 关闭按钮文本（默认: '关闭'）
- `title` - 抽屉标题
- `onClose` - 关闭回调

**示例:**
```tsx
<Drawer
  open={visible}
  title="详情"
  onClose={handleClose}
  closeTxt="取消"
>
  <YourContent />
</Drawer>
```

#### Grid

响应式网格组件，监听窗口大小变化。

**Props:**
- `onChange` - 窗口大小变化回调
- `responsive` - 响应式类型（'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'）
- `style` - 自定义样式
- `debounceDelay` - 防抖延迟（默认: 150ms）

**示例:**
```tsx
<Grid 
  onChange={(type, width) => console.log(type, width)}
  responsive={['lg', 'xl', 'xxl']}
>
  <DesktopContent />
</Grid>
```

---

### 页面组件

#### ErrorPage

500 错误页面。

**Props:**
- `status` - 状态码（默认: 500）
- `title` - 标题
- `subTitle` - 副标题
- `onBackHome` - 返回首页回调

**示例:**
```tsx
<ErrorPage
  status={500}
  title="服务器错误"
  subTitle="抱歉，服务器出错了"
  onBackHome={() => navigate('/')}
/>
```

#### NoFoundPage

404 页面。

**Props:**
- `status` - 状态码（默认: 404）
- `title` - 标题
- `subTitle` - 副标题
- `onBackHome` - 返回首页回调

**示例:**
```tsx
<NoFoundPage onBackHome={() => navigate('/')} />
```

#### NotAuthorizedPage

403 权限页面。

**Props:**
- `status` - 状态码（默认: 403）
- `title` - 标题
- `subTitle` - 副标题
- `onBackHome` - 返回首页回调

**示例:**
```tsx
<NotAuthorizedPage onBackHome={() => navigate('/')} />
```

#### Redirect

路由重定向组件。

**Props:**
- `from` - 源路径（可选，不提供则无条件重定向）
- `to` - 目标路径（必需）
- `state` - 传递的状态

**示例:**
```tsx
<Redirect from="/old-path" to="/new-path" />
<Redirect to="/home" /> {/* 无条件重定向 */}
```

---

### 通知组件

#### ErrorNotification

错误通知组件，用于在 notification 中显示格式化的错误信息。

**Props:**
- `data` - 错误数据对象（包含 msg 和 code）
- `message` - 错误消息
- `title` - 标题（默认: '错误信息:'）
- `titleStyle` - 标题样式
- `contentStyle` - 内容样式
- `containerStyle` - 容器样式

**示例:**
```tsx
import React from 'react';
import { notification } from 'antd';
import { ErrorNotification } from 'ez-react-antd';

const description = React.createElement(ErrorNotification, {
  data: { code: 500, msg: '服务器错误' }
});

notification.error({
  message: '错误代码:500',
  description: description,
  duration: 10
});
```

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run watch

# 构建
npm run build

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 📝 TypeScript

所有组件都提供完整的 TypeScript 类型定义和 JSDoc 注释，IDE 会自动提示属性和方法说明。

```tsx
import { RemoteSelect, RemoteSelectProp } from 'ez-react-antd';

// 完整的类型提示
const props: RemoteSelectProp = {
  api: '/api/users',
  labelKey: 'name',
  valueKey: 'id',
  onChange: (value) => console.log(value)
};
```

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
