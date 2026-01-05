import React from 'react';
import {
  Navigate,
  useLocation
} from 'react-router';
import { useConfig, getRoutePermission } from '../ConfigProvider';

/**
 * withRouteAuth HOC
 * 为路由组件添加基于路径的鉴权功能
 * 自动从 ConfigProvider 的 getRoutePermissions 配置中查询当前路由所需权限
 * 
 * 权限验证规则：
 * - 如果权限是字符串，必须拥有该权限
 * - 如果权限是数组，只要拥有其中任意一个权限即可（或逻辑）
 * - 如果权限是 undefined，不需要权限验证，直接显示
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
 *       '/admin': 'admin.view',
 *       '/admin/users': ['user.view', 'user.manage'],
 *       '/public': undefined
 *     };
 *   },
 *   hasPermission: (permission) => checkPermission(permission)
 * }}>
 *   <App />
 * </ConfigProvider>
 * 
 * // 2. 使用 withRouteAuth 包装组件
 * const AdminPage = withRouteAuth(AdminPageComponent);
 * const UsersPage = withRouteAuth(UsersPageComponent);
 * 
 * // 3. 在路由中使用
 * <Routes>
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

    // 构建重定向 URL
    let reqUrl = location.pathname + location.search;
    reqUrl = encodeURIComponent(reqUrl);

    // 使用 ConfigProvider 提供的鉴权方法
    const isAuthenticated = config.isAuthenticated?.() ?? false;

    // 获取配置的路径（使用默认值）
    const loginPath = config.loginPath || '/login';
    const forbiddenPath = config.forbiddenPath || '/403';

    // 未登录，重定向到登录页
    if (!isAuthenticated) {
      return (
        <Navigate to={`${loginPath}?req_url=${reqUrl}`} />
      );
    }

    // 根据当前路由路径获取所需权限
    const routePermissions = config.getRoutePermissions?.() || {};
    const requiredPermission = getRoutePermission(location.pathname, routePermissions);

    // 如果配置了权限要求，验证权限
    if (requiredPermission !== undefined && config.hasPermission) {
      let hasRequiredPermission = false;

      // 如果是数组，只要满足其中一个权限即可
      if (Array.isArray(requiredPermission)) {
        hasRequiredPermission = requiredPermission.some(permission =>
          config.hasPermission!(permission)
        );
      } else {
        // 如果是字符串，必须拥有该权限
        hasRequiredPermission = config.hasPermission(requiredPermission);
      }

      // 没有权限，重定向到 403 页面
      if (!hasRequiredPermission) {
        return (
          <Navigate to={forbiddenPath} />
        );
      }
    }

    // 通过鉴权，渲染原始组件
    const Component = SourceComponent as React.ComponentType<any>;
    return (<Component {...props} />);
  };
}
