/**
 * AdminLayout 配置常量
 */

/** 布局配置 */
export const LAYOUT_CONFIG = {
    /** PC端收起宽度 */
    COLLAPSED_WIDTH_PC: 80,
    /** 移动端收起宽度 */
    COLLAPSED_WIDTH_MOBILE: 0,
    /** 侧边栏展开宽度 */
    SIDER_WIDTH: 256,
    /** 头部高度 */
    HEADER_HEIGHT: 64,
    /** 响应式断点 */
    BREAKPOINT: 1300,
} as const;

/** 主题配置 */
export const THEME = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

export type ThemeType = typeof THEME[keyof typeof THEME];
