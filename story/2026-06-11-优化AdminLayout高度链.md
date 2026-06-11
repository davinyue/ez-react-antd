# 优化AdminLayout高度链

## 背景

当前 `AdminLayout` 通过 `height: calc(100vh - 69px)` 为内容区提供高度。该方式依赖魔法数字，后续 Header 高度、padding 或移动端行为变化时容易出现偏差。同时 easy-auth 前端的路由管理和功能点管理页面依赖父级明确高度，不能改为由内容自然撑开的布局。

## 目标

- 去除内容区 `calc(100vh - 69px)` 魔法高度。
- 去除侧边栏菜单区 `calc(100vh - 112px)` 魔法高度。
- 保留从外层布局到内容容器的明确高度链。
- 让子页面继续可以通过 `height: 100%` 占满剩余屏幕高度，并在内部自行滚动。

## 范围

- 修改 `src/AdminLayout/index.less` 中 `AdminLayout` 外层容器、侧边栏菜单区、内容容器和滚动容器的高度与 overflow 设置。
- 不修改 `AdminLayout` 的 React DOM 结构。

## 非目标

- 不调整 easy-auth 前端页面自身布局。
- 不新增布局参数或兼容开关。
- 不重构菜单、Header、Sider 或主题切换逻辑。

## 关键设计

- `.admin_layout_box` 固定为 `height: 100vh`，作为整个后台布局的视口边界。
- Sider 内部 children 使用纵向 flex 布局，Logo 与主题切换区保持固定高度，菜单区通过 flex 占满剩余空间。
- `.admin_layout_container` 保留 `height: 100vh`，使用 `box-sizing: border-box` 让 `padding-top: 64px` 纳入高度计算。
- `.ant-layout-content` 使用 flex 占满 Header 下方剩余空间，并设置 `min-height: 0` 防止内容把父级撑高。
- `.admin_layout_content_children` 保留 `height: 100%`，让 easy-auth 等业务页面的百分比高度仍有稳定参考，同时将普通长内容滚动收敛到内容容器内部。

## 验收标准

- `AdminLayout` 不再依赖 `calc(100vh - 69px)`。
- Sider 菜单区不再依赖 `calc(100vh - 112px)`。
- 依赖 `height: 100%` 的业务页面仍能占满剩余屏幕高度。
- 内容溢出时不会把最外层布局撑高形成全屏外侧滚动条。
- 背景色在内容滚动时保持完整。

## 任务清单

### 分析

- [x] 明确需求目标、范围和非目标
- [x] 确认影响文件、接口、配置或数据结构

### 实施

- [x] 完成核心修改或实现
- [x] 保持现有风格与最小必要改动

### 验证

- [x] 执行与改动直接相关的测试、构建或检查
- [x] 记录无法验证的原因与风险

### 收尾

- [x] 更新当前进度
- [x] 记录剩余风险与阻塞

## 当前进度

已完成样式修改，并通过 `npm run build` 验证。

## 风险与阻塞

样式调整主要影响 `AdminLayout` 内容区滚动职责和侧边栏菜单区高度分配，构建已通过；实际页面视觉效果仍建议在 easy-auth 的路由管理、功能点管理和移动端侧边栏展开/收起场景中观察确认。若业务页面把下拉、弹窗等浮层挂载到内容容器内部，也需要确认是否受到内容区 overflow 约束影响。
