import type { RoutePermissionMap, RoutePermissionConfig, FeaturePointPermissionMap, FeaturePointPermissionConfig, EzAntdConfig } from './types';

/**
 * 根据路由路径获取权限配置
 * 支持精确匹配和前缀匹配
 * 
 * @param path 当前路由路径
 * @param routePermissions 路由权限映射配置
 * @returns 路由权限配置对象
 * 
 * @example
 * const config = getRoutePermission('/admin/users', {
 *   '/admin': { requiresAuthentication: true, permissionIds: 'admin.view' },
 *   '/admin/users': { requiresAuthentication: true, permissionIds: ['user.view', 'user.manage'] }
 * });
 * // 返回: { requiresAuthentication: true, permissionIds: ['user.view', 'user.manage'] }
 */
export function getRoutePermission(
  path: string,
  routePermissions?: RoutePermissionMap
): RoutePermissionConfig | undefined {
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
 * 根据功能点编码获取权限配置
 * 
 * @param code 功能点编码
 * @param featurePointPermissions 功能点权限映射配置
 * @returns 功能点权限配置对象
 * 
 * @example
 * const config = getFeaturePointPermission('user.create', {
 *   'user.create': { requiresAuthentication: true, permissionIds: 'user.create' },
 *   'user.delete': { requiresAuthentication: true, permissionIds: ['user.delete', 'user.manage'] }
 * });
 * // 返回: { requiresAuthentication: true, permissionIds: 'user.create' }
 */
export function getFeaturePointPermission(
  code: string,
  featurePointPermissions?: FeaturePointPermissionMap
): FeaturePointPermissionConfig | undefined {
  if (!featurePointPermissions) {
    return undefined;
  }

  // 直接返回映射的权限配置
  return featurePointPermissions[code];
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

  // 遍历路由优先级列表
  for (const routePath of routePaths) {
    // 使用统一的权限判断函数
    if (hasRoutePermission(routePath, config)) {
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

/**
 * 判断用户是否有权限展示某个功能点
 * 
 * @param code 功能点编码
 * @param config 全局配置对象
 * @returns 是否有权限展示该功能点
 * 
 * @example
 * // 未配置的功能点（默认需要登录但不需要权限）
 * const canShow = hasFeaturePointPermission('some.featurePoint', config);
 * // 返回: true（如果已登录）
 * 
 * @example
 * // 公开功能点（不需要登录）
 * const canShow = hasFeaturePointPermission('public.view', config);
 * // 返回: true
 * 
 * @example
 * // 需要登录但不需要权限
 * const canShow = hasFeaturePointPermission('user.profile', config);
 * // 返回: true（如果已登录）
 * 
 * @example
 * // 需要登录且需要权限
 * const canShow = hasFeaturePointPermission('user.create', config);
 * // 返回: true（如果已登录且拥有所需权限）
 * 
 * @example
 * // 配置了多个权限（满足任一即可）
 * // featurePointPermissions: { 'user.delete': { permissionIds: ['user.delete', 'user.manage'] } }
 * const canDelete = hasFeaturePointPermission('user.delete', config);
 * // 返回: true（如果用户拥有 'user.delete' 或 'user.manage' 任一权限）
 */
export function hasFeaturePointPermission(
  code: string,
  config: EzAntdConfig
): boolean {
  // 获取功能点权限配置
  const featurePointPermissions = config.getFeaturePointPermissions?.() || {};
  const featurePointConfig = getFeaturePointPermission(code, featurePointPermissions);

  // 如果没有配置，默认需要登录但不需要权限
  if (featurePointConfig === undefined) {
    return config.isAuthenticated?.() ?? false;
  }

  // 如果 requiresAuthentication 为 false，不需要登录，直接返回 true
  if (featurePointConfig.requiresAuthentication === false) {
    return true;
  }

  // 需要登录，检查登录状态
  const isAuthenticated = config.isAuthenticated?.() ?? false;
  if (!isAuthenticated) {
    return false;
  }

  // 已登录，检查权限
  const { permissionIds } = featurePointConfig;

  // 如果没有配置权限要求，只需要登录即可
  if (permissionIds === undefined) {
    return true;
  }

  // 如果没有提供 hasPermission 方法，无法验证权限，返回 false
  if (!config.hasPermission) {
    return false;
  }

  // 如果权限是数组，只要满足其中一个权限即可（或逻辑）
  if (Array.isArray(permissionIds)) {
    return permissionIds.some(permission =>
      config.hasPermission!(permission)
    );
  }

  // 如果权限是字符串，必须拥有该权限
  return config.hasPermission(permissionIds);
}

/**
 * 判断用户是否有权限访问某个路由
 * 
 * @param path 路由路径
 * @param config 全局配置对象
 * @returns 是否有权限访问该路由
 * 
 * @example
 * // 未配置的路由（默认需要登录但不需要权限）
 * const canAccess = hasRoutePermission('/some-page', config);
 * // 返回: true（如果已登录）
 * 
 * @example
 * // 公开路由（不需要登录）
 * const canAccess = hasRoutePermission('/login', config);
 * // 返回: true
 * 
 * @example
 * // 需要登录但不需要权限
 * const canAccess = hasRoutePermission('/dashboard', config);
 * // 返回: true（如果已登录）
 * 
 * @example
 * // 需要登录且需要权限
 * const canAccess = hasRoutePermission('/admin/users', config);
 * // 返回: true（如果已登录且拥有所需权限）
 * 
 * @example
 * // 配置了多个权限（满足任一即可）
 * // routePermissions: { '/admin/users': { permissionIds: ['user.view', 'user.manage'] } }
 * const canAccess = hasRoutePermission('/admin/users', config);
 * // 返回: true（如果用户拥有 'user.view' 或 'user.manage' 任一权限）
 */
export function hasRoutePermission(
  path: string,
  config: EzAntdConfig
): boolean {
  // 获取路由权限配置
  const routePermissions = config.getRoutePermissions?.() || {};
  const routeConfig = getRoutePermission(path, routePermissions);

  // 如果没有配置，默认需要登录但不需要权限
  if (routeConfig === undefined) {
    return config.isAuthenticated?.() ?? false;
  }

  // 如果 requiresAuthentication 为 false，不需要登录，直接返回 true
  if (routeConfig.requiresAuthentication === false) {
    return true;
  }

  // 需要登录，检查登录状态
  const isAuthenticated = config.isAuthenticated?.() ?? false;
  if (!isAuthenticated) {
    return false;
  }

  // 已登录，检查权限
  const { permissionIds } = routeConfig;

  // 如果没有配置权限要求，只需要登录即可
  if (permissionIds === undefined) {
    return true;
  }

  // 如果没有提供 hasPermission 方法，无法验证权限，返回 false
  if (!config.hasPermission) {
    return false;
  }

  // 如果权限是数组，只要满足其中一个权限即可（或逻辑）
  if (Array.isArray(permissionIds)) {
    return permissionIds.some(permission =>
      config.hasPermission!(permission)
    );
  }

  // 如果权限是字符串，必须拥有该权限
  return config.hasPermission(permissionIds);
}
