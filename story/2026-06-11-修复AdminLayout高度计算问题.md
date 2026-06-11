# 修复AdminLayout高度计算问题

## 背景

当前 ez-react-antd 中 AdminLayout 的样式在使用固定高度（`height: calc(100vh - 69px)`）进行布局时，如果内容过长发生滚动，会导致背景色在超出首屏高度后出现断层失效。此外硬编码高度在不同系统或移动端上表现存在瑕疵。

## 目标

- 修复滚动时 `.admin_layout_content_children` 背景色断层的问题。
- 采用 Flex 布局使高度能够根据内容自动伸缩撑开。

## 范围

- 修改 `src/AdminLayout/index.less` 中的 `.admin_layout_container` 及其子容器的 flex 和 height 样式。

## 非目标

- 不修改现有组件的 React DOM 结构。
- 不影响 Header 和 Sider 的固有行为。

## 关键设计

- 移除 `.ant-layout-content` 上的 `height: calc(100vh - 69px) !important;` 固定高度。
- 为 `.admin_layout_container`、`.ant-layout-content` 和 `.admin_layout_content_children` 添加 Flex 布局相关的属性（`display: flex; flex-direction: column; flex: 1 0 auto;`），使得高度能够被内容自适应撑开。

## 验收标准

- 页面内容过长向下滚动时，背景色 `#f8fafc` 完整覆盖底部，不出现断层。
- 页面内容不足时，背景色依然能够填满整个容器可视区域。

## 任务清单

### 分析
- [x] 明确需求目标、范围和非目标
- [x] 确认影响文件、接口、配置或数据结构

### 实施
- [x] 移除硬编码高度，修改为 flex 弹性撑开
- [x] 保持现有风格与最小必要改动

### 验证
- [x] 执行与改动直接相关的测试、构建或检查
- [x] 记录无法验证的原因与风险

### 收尾
- [x] 更新当前进度
- [x] 记录剩余风险与阻塞

## 当前进度

- 已修复高度计算问题。

## 风险与阻塞

- 无。
