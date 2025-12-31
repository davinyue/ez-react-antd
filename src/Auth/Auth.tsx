import React from 'react';
import { useConfig } from '../ConfigProvider';

/**
 * 权限控制组件属性接口
 */
export interface AuthProps {
  /** 需要验证的权限,支持单个权限或权限数组 */
  permission?: string | string[];
  /** 需要验证的角色,支持单个角色或角色数组 */
  role?: string | string[];
  /** 是否需要验证登录状态,默认为 true */
  requireAuth?: boolean;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 权限控制组件
 * 用于根据用户的登录状态、权限和角色来控制子组件的显示
 * 
 * @example
 * // 验证权限
 * <Auth permission="user:edit">
 *   <Button>编辑用户</Button>
 * </Auth>
 * 
 * @example
 * // 验证角色
 * <Auth role="admin">
 *   <Button>管理员功能</Button>
 * </Auth>
 * 
 * @example
 * // 同时验证权限和角色
 * <Auth permission="user:delete" role={['admin', 'manager']}>
 *   <Button>删除用户</Button>
 * </Auth>
 * 
 * @example
 * // 只验证登录状态
 * <Auth requireAuth={true}>
 *   <UserProfile />
 * </Auth>
 */
const Auth: React.FC<AuthProps> = ({
  permission,
  role,
  requireAuth = true,
  children
}) => {
  const { isAuthenticated, hasPermission, hasRole } = useConfig();

  // 如果需要验证登录状态且用户未登录,则不显示
  if (requireAuth && isAuthenticated && !isAuthenticated()) {
    return null;
  }

  // 如果指定了权限,验证权限
  if (permission !== undefined && hasPermission && !hasPermission(permission)) {
    return null;
  }

  // 如果指定了角色,验证角色
  if (role !== undefined && hasRole && !hasRole(role)) {
    return null;
  }

  // 所有验证通过,显示子组件
  return <>{children}</>;
};

export default Auth;