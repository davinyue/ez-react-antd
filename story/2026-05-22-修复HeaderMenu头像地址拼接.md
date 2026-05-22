# 修复 HeaderMenu 头像地址拼接

## 背景

`HeaderMenu` 组件当前在 `userInfo.avatar` 和 `fileDownloadUrl` 同时存在时，会始终按头像文件 ID 拼接下载地址。若 `avatar` 已经是 `https://`、`http://` 或 `/` 开头的可直接访问地址，会被错误拼接成下载接口参数，导致头像无法直接展示。

## 目标

当 `userInfo.avatar` 是可直接展示的 URL 或站内绝对路径时，组件应原样传给 `Avatar`；仅当 `avatar` 是文件 ID 时，才使用 `fileDownloadUrl` 拼接下载地址。

## 范围

- 调整 `src/AdminLayout/HeaderMenu/HeaderMenu.tsx` 的头像地址解析逻辑。
- 补充 `HeaderMenu` 相关单测，覆盖直链头像和文件 ID 头像。

## 非目标

- 不调整 `HeaderMenu` 组件 API。
- 不修改 `AdminLayout` 的参数传递方式。
- 不调整默认头像资源。

## 关键设计

在 `getUserAvatar` 中先判断 `avatar` 是否为空；为空时继续使用默认头像。非空时，若匹配 `https://`、`http://` 或 `/` 开头，则直接返回原始 `avatar`。否则在存在 `fileDownloadUrl` 时按文件 ID 拼接下载地址；没有下载地址时回退到默认头像。

## 验收标准

- `avatar` 以 `https://` 开头时，`Avatar` 的 `src` 使用原始地址。
- `avatar` 以 `http://` 开头时，`Avatar` 的 `src` 使用原始地址。
- `avatar` 以 `/` 开头时，`Avatar` 的 `src` 使用原始路径。
- `avatar` 为普通文件 ID 且存在 `fileDownloadUrl` 时，继续拼接下载地址。
- 相关单测通过。

## 任务清单

### 分析

- [x] 明确需求目标、范围和非目标
- [x] 确认影响文件、接口、配置或数据结构

### 实施

- [x] 完成头像地址解析逻辑修改
- [x] 保持现有组件 API 与默认头像行为不变

### 验证

- [x] 执行与改动直接相关的测试、构建或检查
- [x] 记录无法验证的原因与风险

### 收尾

- [x] 更新当前进度
- [x] 记录剩余风险与阻塞

## 当前进度

已完成代码修改和相关单测补充，并通过 `npm test -- --run src/AdminLayout/HeaderMenu/HeaderMenu.test.tsx` 与 `npx eslint src/AdminLayout/HeaderMenu/HeaderMenu.tsx src/AdminLayout/HeaderMenu/HeaderMenu.test.tsx` 验证。

## 风险与阻塞

暂无。
