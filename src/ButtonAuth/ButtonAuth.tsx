import React from 'react';
import { useConfig } from '../ConfigProvider';
import { getButtonPermission } from '../ConfigProvider';

/**
 * 按钮权限控制组件属性接口
 */
export interface ButtonAuthProps {
  /** 按钮编码，用于查询所需权限 */
  code: string;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 按钮权限控制组件
 * 根据按钮编码从配置中查询所需权限，并验证用户是否拥有该权限
 * 
 * 权限验证规则：
 * - 如果权限是字符串，必须拥有该权限
 * - 如果权限是数组，只要拥有其中任意一个权限即可（或逻辑）
 * - 如果权限是 undefined，不需要权限验证，直接显示
 * 
 * @example
 * // 基本用法 - 单个权限
 * <ButtonAuth code="user.create">
 *   <Button>创建用户</Button>
 * </ButtonAuth>
 * 
 * @example
 * // 多个权限（满足任一即可）
 * // 配置: getButtonPermissions: () => ({ 'user.delete': ['user.delete', 'user.manage'] })
 * <ButtonAuth code="user.delete">
 *   <Button>删除用户</Button>
 * </ButtonAuth>
 * 
 * @example
 * // 配合 ConfigProvider 使用（函数形式）
 * <ConfigProvider value={{
 *   getButtonPermissions: () => {
 *     // 从 sessionStorage 动态获取
 *     const cached = sessionStorage.getItem('buttonPermissions');
 *     return cached ? JSON.parse(cached) : {
 *       'user.create': 'user.create',
 *       'user.delete': ['user.delete', 'user.manage'],  // 拥有任一权限即可
 *       'user.export': undefined  // 不需要权限
 *     };
 *   },
 *   hasPermission: (permission) => checkPermission(permission)
 * }}>
 *   <ButtonAuth code="user.create">
 *     <Button>创建用户</Button>
 *   </ButtonAuth>
 * </ConfigProvider>
 */
const ButtonAuth: React.FC<ButtonAuthProps> = ({
  code,
  children
}) => {
  const { hasPermission, getButtonPermissions } = useConfig();

  // 根据按钮编码获取所需权限
  const buttonPermissions = getButtonPermissions?.() || {};
  const requiredPermission = getButtonPermission(code, buttonPermissions);

  // 如果配置了权限要求，验证权限
  if (requiredPermission !== undefined && hasPermission) {
    // 如果是数组，只要满足其中一个权限即可
    if (Array.isArray(requiredPermission)) {
      const hasAnyPermission = requiredPermission.some(permission =>
        hasPermission(permission)
      );
      if (!hasAnyPermission) {
        return null;
      }
    } else {
      // 如果是字符串，必须拥有该权限
      if (!hasPermission(requiredPermission)) {
        return null;
      }
    }
  }

  // 所有验证通过，显示子组件
  return <>{children}</>;
};

export default ButtonAuth;
