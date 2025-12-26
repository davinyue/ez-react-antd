import { useEffect, useState } from 'react';
import { WidthType } from './Grid';

// Ant Design 标准断点
const BREAKPOINTS = {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
} as const;

/**
 * 获取窗口宽度
 */
function getWindowWidth(): number {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

/**
 * 根据宽度获取类型
 */
function getWidthType(width: number): WidthType {
    if (width < BREAKPOINTS.sm) return 'xs';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    if (width < BREAKPOINTS.xxl) return 'xl';
    return 'xxl';
}

export interface UseResponsiveResult {
    /** 当前窗口宽度类型 */
    type: WidthType;
    /** 当前窗口宽度 */
    width: number;
    /** 是否是移动端 (xs 或 sm) */
    isMobile: boolean;
    /** 是否是平板 (md) */
    isTablet: boolean;
    /** 是否是桌面端 (lg, xl, xxl) */
    isDesktop: boolean;
    /** 各个断点的匹配状态 */
    breakpoints: Record<WidthType, boolean>;
}

/**
 * 响应式 Hook
 * 用于监听窗口大小变化
 * 
 * @param debounceDelay - 防抖延迟(毫秒),默认 150ms
 * @returns 响应式状态信息
 * 
 * @example
 * ```tsx
 * const { type, isMobile, breakpoints } = useResponsive();
 * 
 * if (isMobile) {
 *   return <MobileView />;
 * }
 * 
 * return <DesktopView />;
 * ```
 */
export function useResponsive(debounceDelay = 150): UseResponsiveResult {
    const [width, setWidth] = useState(() => getWindowWidth());
    const [type, setType] = useState<WidthType>(() => getWidthType(getWindowWidth()));

    useEffect(() => {
        // 创建防抖的 resize 处理器
        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const newWidth = getWindowWidth();
                const newType = getWidthType(newWidth);
                setWidth(newWidth);
                setType(newType);
            }, debounceDelay);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, [debounceDelay]);

    const isMobile = type === 'xs' || type === 'sm';
    const isTablet = type === 'md';
    const isDesktop = type === 'lg' || type === 'xl' || type === 'xxl';

    const breakpoints: Record<WidthType, boolean> = {
        xs: type === 'xs',
        sm: type === 'sm',
        md: type === 'md',
        lg: type === 'lg',
        xl: type === 'xl',
        xxl: type === 'xxl',
    };

    return {
        type,
        width,
        isMobile,
        isTablet,
        isDesktop,
        breakpoints,
    };
}

export default useResponsive;
