import React from 'react';
import {
  Navigate,
  useLocation
} from 'react-router';
import { useConfig, hasRoutePermission, getRoutePermission } from '../ConfigProvider';

/**
 * withRouteAuth HOC
 * 为路由组件添加基于路径的鉴权功能
 * 自动从 ConfigProvider 的 getRoutePermissions 配置中查询当前路由所需权限
 * 
 * 权限验证规则：
 * - 未配置 - 默认需要登录但不需要权限
 * - requiresAuthentication: false - 公开访问，不需要登录
 * - requiresAuthentication: true + permissionIds: undefined - 需要登录，不需要权限
 * - requiresAuthentication: true + permissionIds: string/array - 需要登录且需要权限
 * 
 * @param SourceComponent - 要包装的组件
 * @returns 包装后的组件，会自动根据路由路径进行权限验证
 * 
 * @example
 * ```tsx
 * // 1. 配置路由权限映射（函数形式）
 * <ConfigProvider value={{
 *   getRoutePermissions: () => {
 *     // 从 sessionStorage 动态获取
 *     const cached = sessionStorage.getItem('routePermissions');
 *     return cached ? JSON.parse(cached) : {
 *       '/login': {
 *         requiresAuthentication: false  // 公开访问
 *       },
 *       '/dashboard': {
 *         requiresAuthentication: true   // 需要登录，不需要权限
 *       },
 *       '/admin': {
 *         requiresAuthentication: true,
 *         permissionIds: 'admin.view'    // 需要登录 + 权限
 *       },
 *       '/admin/users': {
 *         requiresAuthentication: true,
 *         permissionIds: ['user.view', 'user.manage']  // 任一权限即可
 *       }
 *     };
 *   },
 *   hasPermission: (permission) => checkPermission(permission),
 *   isAuthenticated: () => !!sessionStorage.getItem('token')
 * }}>
 *   <App />
 * </ConfigProvider>
 * 
 * // 2. 使用 withRouteAuth 包装组件
 * const AdminPage = withRouteAuth(AdminPageComponent);
 * const UsersPage = withRouteAuth(UsersPageComponent);
 * const LoginPage = withRouteAuth(LoginPageComponent);  // 公开路由也可以包装
 * 
 * // 3. 在路由中使用
 * <Routes>
 *   <Route path="/login" element={<LoginPage />} />
 *   <Route path="/admin" element={<AdminPage />} />
 *   <Route path="/admin/users" element={<UsersPage />} />
 * </Routes>
 * ```
 */
export default function withRouteAuth<P extends object = {}>(
  SourceComponent: React.ComponentType<P> | React.LazyExoticComponent<React.ComponentType<P>>
): React.ComponentType<P> {
  return function WithRouteAuthComponent(props: P) {
    const location = useLocation();
    const config = useConfig();

    // 获取配置的路径（使用默认值）
    const loginPath = config.loginPath || '/login';
    const forbiddenPath = config.forbiddenPath || '/403';

    // 获取当前路由的权限配置
    const routePermissions = config.getRoutePermissions?.() || {};
    const routeConfig = getRoutePermission(location.pathname, routePermissions);

    // 1. 如果是公开路由（显式配置 requiresAuthentication: false），直接渲染
    if (routeConfig?.requiresAuthentication === false) {
      const Component = SourceComponent as React.ComponentType<any>;
      return (<Component {...props} />);
    }

    // 2. 需要登录（包括未配置的路由），检查登录状态
    const isAuthenticated = config.isAuthenticated?.() ?? false;
    if (!isAuthenticated) {
      // 未登录，重定向到登录页
      let reqUrl = location.pathname + location.search;
      reqUrl = encodeURIComponent(reqUrl);
      return (
        <Navigate to={`${loginPath}?req_url=${reqUrl}`} />
      );
    }

    // 3. 已登录，检查权限
    const hasPermission = hasRoutePermission(location.pathname, config);
    if (!hasPermission) {
      // 没有权限，重定向到 403 页面
      return (
        <Navigate to={forbiddenPath} />
      );
    }

    // 4. 通过所有验证，渲染原始组件
    const Component = SourceComponent as React.ComponentType<any>;
    return (<Component {...props} />);
  };
}
