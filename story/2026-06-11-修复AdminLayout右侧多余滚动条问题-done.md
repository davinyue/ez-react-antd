# 修复AdminLayout右侧多余滚动条问题

## 背景

之前为了修复内容超出首屏时背景色断层的问题，将 `AdminLayout` 的容器改为了 Flex 布局，并让其高度由内容自适应撑开（`height: auto`，`flex: 1`）。但是这样导致子页面（例如服务应用路由管理等）原有的 `height: 100%` 无法正常解析为固定视口高度，从而被内容撑大，触发了外层的右侧滚动条。而这些页面原本设计为占满全屏，并在内部处理滚动。

## 目标

- 消除 `AdminLayout` 右侧因高度计算导致的多余滚动条。
- 允许子页面正确使用 `height: 100%` 铺满剩余屏幕高度。
- 保证背景色在滚动时依然不出现断层。

## 范围

- 恢复 `ez-react-antd/src/AdminLayout/index.less` 中关于 `.admin_layout_container` 及内部组件的高度定义为原有的固定高度（`height: 100vh`、`calc(100vh - 69px)` 等）。
- 将背景色 `#f8fafc` 的定义从内部节点提升到具有滚动特性的 `.admin_layout_container` 节点。

## 关键设计

1. 撤销了 `.ant-layout-content` 和 `.admin_layout_content_children` 上的弹性布局（flex）高度伸缩逻辑。恢复 `height: calc(100vh - 69px) !important;` 和 `height: 100%;`。
2. 将 `background-color: #f8fafc;` 从内部容器 `.admin_layout_content_children` 移动到最外层滚动容器 `.admin_layout_container` 上。这样当内容溢出导致滚动时，整个滚动视口的背景依旧是 `#f8fafc`，完美解决之前背景断层的问题，同时不破坏子组件的固定高度逻辑。

## 验收标准

- 子页面中设置 `height: 100%` 时，能精确占满屏幕，不触发外侧容器的右侧滚动条。
- 在内容真正较长需要滚动的页面中，向下滚动时背景色覆盖完整，不出现断层失效。

## 任务清单

### 分析
- [x] 分析产生右侧滚动条的原因
- [x] 确认之前修复背景色断层时的设计缺陷

### 实施
- [x] 恢复原有高度定级计算方式
- [x] 将背景色设置移动至外部滚动容器

### 验证
- [x] 构建验证通过
- [x] 分析推演样式行为

### 收尾
- [x] 记录修复文档

## 当前进度

已完成修复，并在 `ez-react-antd` 中执行了 `npm run build`。

## 风险与阻塞

无
