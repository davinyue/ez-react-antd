import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router';

/**
 * 重定向组件属性接口
 */
export interface RedirectProp {
  /** 源路径，如果不提供则无条件重定向 */
  from?: string;
  /** 目标路径 */
  to: string;
  /** 是否保留路由状态，默认 false */
  state?: any;
}

/**
 * 规范化路径，移除末尾的斜杠
 * @param path 路径字符串
 * @returns 规范化后的路径
 */
const normalizePath = (path: string): string => {
  return path.endsWith('/') && path.length > 1
    ? path.substring(0, path.length - 1)
    : path;
};

/**
 * 重定向组件
 * 用于路由重定向，支持条件判断
 * 
 * @example
 * // 无条件重定向
 * <Redirect to="/home" />
 * 
 * // 条件重定向：当访问 from 路径时重定向到 to
 * <Redirect from="/" to="/dashboard" />
 * 
 * // 保留路由状态
 * <Redirect from="/old" to="/new" state={{ from: 'redirect' }} />
 */
const Redirect: React.FC<RedirectProp> = ({ from, to, state }) => {
  const location = useLocation();

  // 使用 useMemo 优化性能，避免不必要的重新计算
  const shouldRedirect = useMemo(() => {
    // 如果没有指定 from，无条件重定向
    if (!from) {
      return true;
    }

    // 比较当前路径与 from 路径（规范化后）
    const normalizedFrom = normalizePath(from);
    const normalizedPathname = normalizePath(location.pathname);

    return normalizedPathname === normalizedFrom;
  }, [from, location.pathname]);

  // 构建目标 URL，保留查询参数和 hash
  const targetUrl = useMemo(() => {
    const searchParams = location.search || '';
    const hash = location.hash || '';
    return `${to}${searchParams}${hash}`;
  }, [to, location.search, location.hash]);

  // 只有满足条件时才重定向
  if (!shouldRedirect) {
    return null;
  }

  // 使用 Navigate 组件进行重定向，保留状态
  return (
    <Navigate
      to={targetUrl}
      replace
      state={state || location.state}
    />
  );
};

export default Redirect;