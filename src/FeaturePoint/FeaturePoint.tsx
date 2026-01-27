import React from 'react';
import { useConfig } from '../ConfigProvider';
import { hasFeaturePointPermission } from '../ConfigProvider';

/**
 * 功能点权限控制组件属性接口
 */
export interface FeaturePointProps {
  /** 功能点编码，用于查询所需权限 */
  code: string;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 功能点权限控制组件
 * 根据功能点编码从配置中查询所需权限，并验证用户是否拥有该权限
 * 
 * 权限验证规则：
 * - 未配置 - 默认不需要登录和授权，可以公开显示
 * - requiresAuthentication: false - 公开显示，不需要登录
 * - requiresAuthentication: true + permissionIds: undefined - 需要登录，不需要权限
 * - requiresAuthentication: true + permissionIds: string/array - 需要登录且需要权限
 * 
 * @example
 * // 基本用法 - 需要权限
 * <FeaturePoint code="user.create">
 *   <Button>创建用户</Button>
 * </FeaturePoint>
 * 
 * @example
 * // 多个权限（满足任一即可）
 * // 配置: getFeaturePointPermissions: () => ({ 
 * //   'user.delete': { 
 * //     requiresAuthentication: true,
 * //     permissionIds: ['user.delete', 'user.manage'] 
 * //   }
 * // })
 * <FeaturePoint code="user.delete">
 *   <Button>删除用户</Button>
 * </FeaturePoint>
 * 
 * @example
 * // 配合 ConfigProvider 使用（函数形式）
 * <ConfigProvider value={{
 *   getFeaturePointPermissions: () => {
 *     // 从 sessionStorage 动态获取
 *     const cached = sessionStorage.getItem('featurePointPermissions');
 *     return cached ? JSON.parse(cached) : {
 *       'user.create': {
 *         requiresAuthentication: true,
 *         permissionIds: 'user.create'
 *       },
 *       'user.delete': {
 *         requiresAuthentication: true,
 *         permissionIds: ['user.delete', 'user.manage']  // 拥有任一权限即可
 *       },
 *       'user.export': {
 *         requiresAuthentication: true  // 需要登录，不需要权限
 *       },
 *       'public.view': {
 *         requiresAuthentication: false  // 公开显示
 *       }
 *     };
 *   },
 *   hasPermission: (permission) => checkPermission(permission),
 *   isAuthenticated: () => !!sessionStorage.getItem('token')
 * }}>
 *   <FeaturePoint code="user.create">
 *     <Button>创建用户</Button>
 *   </FeaturePoint>
 * </ConfigProvider>
 */
const FeaturePoint: React.FC<FeaturePointProps> = ({
  code,
  children
}) => {
  const config = useConfig();

  // 使用统一的权限判断函数
  const hasPermission = hasFeaturePointPermission(code, config);

  // 如果没有权限，不显示子组件
  if (!hasPermission) {
    return null;
  }

  // 有权限，显示子组件
  return <>{children}</>;
};

export default FeaturePoint;
