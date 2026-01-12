import React from 'react';
import {
  Navigate,
  useLocation
} from 'react-router';
import { useConfig } from '../ConfigProvider';

/**
 * withAuth HOC 新增的属性
 */
export interface WithAuthProps {
  /** 权限码，支持单个或多个（满足任一即可） */
  permission?: string | string[];
  /** 角色，支持单个或多个（满足任一即可） */
  role?: string | string[];
}

/**
 * withAuth HOC
 * 为组件添加鉴权功能，自动检查用户登录状态、权限和角色
 * 
 * @param SourceComponent - 要包装的组件
 * @returns 包装后的组件，会新增 permission 和 role 两个可选属性
 * 
 * @example
 * ```tsx
 * const AdminPage = withAuth(AdminPageComponent);
 * 
 * // 使用时会有 permission 和 role 的类型提示
 * <AdminPage permission="admin.view" role="admin" />
 * ```
 */
export default function withAuth<P extends object = {}>(
  SourceComponent: React.ComponentType<P> | React.LazyExoticComponent<React.ComponentType<P>>
): React.ComponentType<P & WithAuthProps> {
  return function WithAuthComponent(props: P & WithAuthProps) {
    const location = useLocation();
    const config = useConfig();

    // 构建重定向 URL
    let reqUrl = location.pathname + location.search;
    reqUrl = encodeURIComponent(reqUrl);

    // 使用 ConfigProvider 提供的鉴权方法
    const isAuthenticated = config.isAuthenticated?.() ?? false;
    const hasPermission = config.hasPermission?.(props.permission) ?? true;
    const hasRole = config.hasRole?.(props.role) ?? true;

    // 获取配置的路径（使用默认值）
    const loginPath = config.loginPath || '/login';
    const forbiddenPath = config.forbiddenPath || '/403';

    // 未登录，重定向到登录页
    if (!isAuthenticated) {
      return (
        <Navigate to={`${loginPath}?req_url=${reqUrl}`} />
      );
    }

    // 没有权限或角色，重定向到 403 页面
    if (!hasPermission || !hasRole) {
      return (
        <Navigate to={forbiddenPath} />
      );
    }

    // 通过鉴权，渲染原始组件
    const Component = SourceComponent as React.ComponentType<any>;
    return (<Component {...props} />);
  };
}
