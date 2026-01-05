import type { RoutePermissionMap, ButtonPermissionMap, EzAntdConfig } from './types';

/**
 * 根据路由路径获取所需权限
 * 支持精确匹配和通配符匹配
 * 
 * @param path 当前路由路径
 * @param routePermissions 路由权限映射配置
 * @returns 所需权限（可能是 string、string[] 或 undefined）
 * 
 * @example
 * const permissions = getRoutePermission('/admin/users', {
 *   '/admin': 'admin.view',
 *   '/admin/users': ['user.view', 'user.manage']
 * });
 * // 返回: ['user.view', 'user.manage']
 */
export function getRoutePermission(
  path: string,
  routePermissions?: RoutePermissionMap
): string | string[] | undefined {
  if (!routePermissions) {
    return undefined;
  }

  // 1. 精确匹配
  if (path in routePermissions) {
    return routePermissions[path];
  }

  // 2. 查找最长匹配的路径前缀
  let longestMatch: string | undefined;
  let longestMatchLength = 0;

  for (const routePath in routePermissions) {
    // 检查是否是路径前缀
    if (path.startsWith(routePath)) {
      if (routePath.length > longestMatchLength) {
        longestMatch = routePath;
        longestMatchLength = routePath.length;
      }
    }
  }

  if (longestMatch) {
    return routePermissions[longestMatch];
  }

  // 3. 没有匹配，返回 undefined
  return undefined;
}

/**
 * 根据按钮编码获取所需权限
 * 
 * @param code 按钮编码
 * @param buttonPermissions 按钮权限映射配置
 * @returns 所需权限（可能是 string、string[] 或 undefined）
 * 
 * @example
 * const permissions = getButtonPermission('user.create', {
 *   'user.create': 'user.create',
 *   'user.delete': ['user.delete', 'user.manage']
 * });
 * // 返回: 'user.create'
 */
export function getButtonPermission(
  code: string,
  buttonPermissions?: ButtonPermissionMap
): string | string[] | undefined {
  if (!buttonPermissions) {
    return undefined;
  }

  // 直接返回映射的权限
  return buttonPermissions[code];
}

/**
 * 获取用户有权限访问的第一个路由
 * 
 * @param routePaths 路由路径优先级列表
 * @param config 全局配置对象
 * @param options 可选配置
 * @returns 第一个有权限的路由路径，如果都没权限则返回 fallback
 * 
 * @example
 * const redirectPath = getFirstAccessibleRoute(
 *   ['/admin/application/list', '/admin/role/list', '/admin/user/list'],
 *   config,
 *   { basePath: '/admin', fallback: '/403' }
 * );
 * // 返回: 'application/list' (相对路径)
 */
export function getFirstAccessibleRoute(
  routePaths: string[],
  config: EzAntdConfig,
  options?: {
    /** 基础路径，用于提取相对路径 */
    basePath?: string;
    /** 如果都没权限，返回的默认路径 */
    fallback?: string;
  }
): string {
  const { basePath = '', fallback = '/403' } = options || {};

  // 动态获取路由权限配置
  const routePermissions = config.getRoutePermissions?.() || {};

  // 遍历路由优先级列表
  for (const routePath of routePaths) {
    // 使用 getRoutePermission 获取权限（支持精确匹配和前缀匹配）
    const requiredPermission = getRoutePermission(routePath, routePermissions);

    // 如果没有配置权限要求，说明可以访问
    if (requiredPermission === undefined) {
      // 如果指定了 basePath，提取相对路径
      if (basePath && routePath.startsWith(basePath)) {
        return routePath.replace(`${basePath}/`, '');
      }
      return routePath;
    }

    // 检查是否有权限
    let hasPermission = false;
    if (Array.isArray(requiredPermission)) {
      // 数组权限：满足任一即可
      hasPermission = requiredPermission.some(permission =>
        config.hasPermission?.(permission) ?? false
      );
    } else {
      // 字符串权限：必须拥有
      hasPermission = config.hasPermission?.(requiredPermission) ?? false;
    }

    if (hasPermission) {
      // 如果指定了 basePath，提取相对路径
      if (basePath && routePath.startsWith(basePath)) {
        return routePath.replace(`${basePath}/`, '');
      }
      return routePath;
    }
  }

  // 如果都没权限，返回 fallback
  return fallback;
}
