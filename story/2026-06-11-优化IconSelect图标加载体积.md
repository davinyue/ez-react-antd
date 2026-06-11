# 优化 IconSelect 图标加载体积

## 背景

`IconSelect` 需要支持选择 Ant Design、FontAwesome solid 和 FontAwesome regular 的全部图标，因此当前实现通过命名空间导入和枚举方式加载图标。组件库打包后被其它应用引入时，这部分全量图标逻辑容易进入主包，导致应用体积比直接引用源码更大。

## 目标

在不改变其它项目现有 `import { IconSelect } from 'ez-react-antd'` 使用方式、不减少可选图标范围的前提下，降低普通页面主包加载 `IconSelect` 重依赖的概率。

## 范围

- 将 `IconSelect` 拆分为轻量懒加载入口和重实现。
- 保留 `IconSelect` 选择全部图标的能力。
- 将 `@ant-design/icons` 纳入库构建 external 配置。
- 执行与本次变更直接相关的测试、类型检查或构建验证。

## 非目标

- 不修改其它项目的组件引用方式。
- 不移除现有支持的图标来源。
- 不重构整个组件库导出结构。
- 不调整与 `IconSelect` 无关的组件逻辑。

## 关键设计

`src/IconSelect/IconSelect.tsx` 作为轻量入口，仅负责 `React.lazy` 动态加载实际实现。原有全量图标枚举、`react-select`、`react-window` 和样式逻辑迁移到 `IconSelectImpl.tsx`。这样根入口仍然可以导出 `IconSelect`，但重依赖只在组件实际渲染时进入异步加载路径。

构建配置中补充 `@ant-design/icons` external，避免该依赖被直接打入组件库主产物。

## 验收标准

- 其它项目仍可通过 `import { IconSelect } from 'ez-react-antd'` 使用组件。
- `IconSelect` 仍可选择现有全部图标来源。
- `IconSelect` 首次渲染时通过动态 import 加载实现组件。
- `@ant-design/icons` 被配置为 external。
- 相关测试、类型检查或构建验证有明确结果。

## 任务清单

### 分析

- [x] 明确需求目标、范围和非目标
- [x] 确认影响文件、接口、配置或数据结构

### 实施

- [x] 完成 `IconSelect` 懒加载拆分
- [x] 补充 `@ant-design/icons` external 配置
- [x] 保持现有风格与最小必要改动

### 验证

- [x] 执行与改动直接相关的测试、构建或检查
- [x] 记录无法验证的原因与风险

### 收尾

- [x] 更新当前进度
- [x] 记录剩余风险与阻塞

## 当前进度

已完成 `IconSelect` 懒加载拆分、`@ant-design/icons` external 配置和显式依赖声明。验证已执行：

- `npx vitest run src/IconSelect/IconSelect.test.tsx`
- `npm run type-check`
- `npm run build`

## 风险与阻塞

`IconSelect` 实际使用时仍需要加载全量图标依赖；本次优化重点是避免未使用 `IconSelect` 的页面被主包同步拖入这些依赖。

暂无阻塞。`IconShow` 仍保持同步实现，如果业务页面大量单独使用 `IconShow`，后续可单独评估是否继续拆分。
