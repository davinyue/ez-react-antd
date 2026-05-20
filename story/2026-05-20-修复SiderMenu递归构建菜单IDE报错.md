# 修复 SiderMenu 递归构建菜单 IDE 报错

## 背景

`src/AdminLayout/SiderMenu/SiderMenu.tsx` 中使用 `const constructMenu = useCallback(...)` 递归构建菜单项。IDE 静态分析提示 `Cannot access variable before it is declared`，原因是函数表达式在初始化期间引用自身。

## 目标

消除 `constructMenu` 声明前访问报错，同时保持菜单递归构建、权限过滤和 memo 缓存行为不变。

## 范围

- 调整 `SiderMenu` 菜单项构建方式。
- 保持现有组件 API、菜单点击、展开、选中逻辑不变。

## 非目标

- 不重构 `AdminLayout`。
- 不调整菜单数据结构。
- 不修改权限和角色判断规则。

## 关键设计

将递归菜单构建函数移动到 `useMemo` 内部，并使用函数声明 `function constructMenu(...)` 递归调用自身，避免 `const` 函数表达式初始化期间的声明前访问问题。`useMemo` 仍依赖 `menus` 和 `checkMenuPermission`，缓存语义保持不变。

## 验收标准

- IDE 不再提示 `constructMenu` 声明前访问。
- 菜单递归渲染、权限过滤、空父级菜单过滤行为保持不变。
- TypeScript 类型检查通过。

## 任务清单

### 分析

- [x] 确认报错来源为 `ez-react-antd/src/AdminLayout/SiderMenu/SiderMenu.tsx`
- [x] 确认根因为 `const constructMenu = useCallback(...)` 递归引用自身

### 实施

- [x] 将递归构建逻辑移入 `useMemo` 内部函数声明
- [x] 保持现有组件行为不变

### 验证

- [x] 执行类型检查、lint 或构建验证
- [x] 记录无法验证的原因与风险

### 收尾

- [x] 更新当前进度
- [x] 记录剩余风险与阻塞

## 当前进度

已完成代码修改，并通过 `npm run type-check`、`npx eslint src/AdminLayout/SiderMenu/SiderMenu.tsx`、`npm run build` 和 `npm test -- --run` 验证。

## 风险与阻塞

全量 `npm run lint` 仍存在大量历史 lint 问题，非本次修改引入；本次修改文件单独 lint 无错误，仅保留既有 `MenuDef` 索引签名的 `any` 警告。
