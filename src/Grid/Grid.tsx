import React, { useEffect, useState, useRef } from 'react';

export type WidthType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface GridProp {
  /**
   * 当窗口变化时
   * @param {string} type - 尺寸类型
   * @param {number} width - 宽度
   */
  onChange?: (type: WidthType, width: number) => void;
  children?: React.ReactNode;
  /** 什么类型下显示children */
  responsive?: WidthType | Array<WidthType>;
  /** 样式 */
  style?: React.CSSProperties;
  /** 防抖延迟(毫秒),默认 150ms */
  debounceDelay?: number;
}

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

/**
 * Grid 响应式组件
 * 用于监听窗口大小变化并根据断点显示/隐藏内容
 */
const Grid: React.FC<GridProp> = ({
  onChange,
  children,
  responsive,
  style,
  debounceDelay = 150,
}) => {
  const [currentType, setCurrentType] = useState<WidthType>(() => getWidthType(getWindowWidth()));

  // 使用 ref 保存 onChange,避免因引用变化导致 useEffect 重新执行
  const onChangeRef = useRef(onChange);

  // 每次渲染时更新 ref(不在依赖数组中,所以不会触发 useEffect)
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    // 初始调用
    const width = getWindowWidth();
    const type = getWidthType(width);
    if (onChangeRef.current) {
      try {
        onChangeRef.current(type, width);
      } catch (error) {
        console.error('Grid onChange error:', error);
      }
    }

    // 创建防抖的 resize 处理器
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newWidth = getWindowWidth();
        const newType = getWidthType(newWidth);
        setCurrentType(newType);

        if (onChangeRef.current) {
          try {
            onChangeRef.current(newType, newWidth);
          } catch (error) {
            console.error('Grid onChange error:', error);
          }
        }
      }, debounceDelay);
    };

    // 添加事件监听器
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceDelay]); // 只依赖 debounceDelay,不依赖 onChange

  // 判断是否应该显示 children
  const shouldShowChildren = (): boolean => {
    if (!responsive) {
      return true;
    }

    if (typeof responsive === 'string') {
      return currentType === responsive;
    }

    if (Array.isArray(responsive)) {
      return responsive.includes(currentType);
    }

    return false;
  };

  // 如果需要显示 children 且 children 存在
  if (shouldShowChildren() && children) {
    return <div style={style}>{children}</div>;
  }

  return null;
};

export default Grid;
