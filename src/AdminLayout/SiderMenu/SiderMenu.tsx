import React, { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useConfig } from '../../ConfigProvider';

export interface MenuDef {
  /** 菜单id */
  id: string;
  /** 是否展示 */
  show?: boolean;
  /** 路径 */
  path: string;
  /** 图标 */
  icon?: React.ReactNode;
  /** 菜单标题 */
  title: string;
  /** 展示权限 */
  permission?: string | Array<string>;
  /** 展示角色 */
  role?: string | Array<string>;
  /** 下级 */
  childrens?: Array<MenuDef>;
  /** 上级菜单id */
  parentId?: string;
  [key: string]: any;
}

export interface SiderMenuProp {
  menus: Array<MenuDef>;
  /** 主题 */
  theme: 'light' | 'dark';
  /** 当点击菜单时 */
  onClickMenu?: (menu: MenuDef) => void;
  /** 侧边是否折叠 */
  collapsed?: boolean;
}

/**
 * 侧边栏菜单组件
 */
const SiderMenu: React.FC<SiderMenuProp> = ({
  menus = [],
  theme = 'dark',
  onClickMenu,
  collapsed = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useConfig();

  // 用于控制用户手动展开/收起的菜单
  const [userOpenKeys, setUserOpenKeys] = useState<string[] | undefined>(undefined);

  /**
   * 检查菜单是否有权限显示
   */
  const checkMenuPermission = useCallback((menu: MenuDef): boolean => {
    // 如果 show 明确设置为 false,则不显示
    if (menu.show === false) {
      return false;
    }

    // 检查权限
    if (menu.permission !== undefined && hasPermission) {
      if (!hasPermission(menu.permission)) {
        return false;
      }
    }

    // 检查角色
    if (menu.role !== undefined && hasRole) {
      if (!hasRole(menu.role)) {
        return false;
      }
    }

    return true;
  }, [hasPermission, hasRole]);

  // 构建菜单项
  const constructMenu = useCallback((menuList: Array<MenuDef>): MenuProps['items'] => {
    const items: MenuProps['items'] = [];
    for (const menu of menuList) {
      // 检查菜单权限
      if (!checkMenuPermission(menu)) {
        continue;
      }

      if (!menu.childrens || menu.childrens.length < 1) {
        items.push({
          key: menu.id,
          icon: menu.icon,
          label: menu.title,
        });
      } else {
        // 递归构建子菜单
        const children = constructMenu(menu.childrens);

        // 如果子菜单全部被过滤掉,则父菜单也不显示
        if (children && children.length > 0) {
          items.push({
            key: menu.id,
            icon: menu.icon,
            label: menu.title,
            children: children,
          });
        }
      }
    }

    return items;
  }, [checkMenuPermission]);

  // 获取菜单映射 (id -> menu)
  const menuMap = useMemo(() => {
    const map = new Map<string, MenuDef>();
    const queue = [...menus];

    while (queue.length > 0) {
      const menu = queue.shift()!;
      map.set(menu.id, menu);
      if (menu.childrens) {
        queue.push(...menu.childrens);
      }
    }

    return map;
  }, [menus]);

  // 使用 useMemo 计算当前菜单
  const currentMenu = useMemo(() => {
    // 获取当前路径
    let path = location.pathname;
    if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1);
    }

    // 查找匹配的菜单
    const menuList = Array.from(menuMap.values());
    let currentPath = path;

    while (currentPath !== '/' && currentPath !== '') {
      for (const menu of menuList) {
        if (currentPath.indexOf(menu.path) !== -1) {
          return menu;
        }
      }
      currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    }

    return undefined;
  }, [location.pathname, menuMap]);

  // 使用 useMemo 计算需要展开的菜单ID列表
  const openMenuIds = useMemo(() => {
    const ids: string[] = [];
    let menu = currentMenu;

    while (menu && menu.parentId) {
      if (menu.parentId === '$') {
        break;
      }
      ids.push(menu.parentId);
      menu = menuMap.get(menu.parentId);
    }

    return ids;
  }, [currentMenu, menuMap]);

  // 使用 useMemo 计算选中的菜单ID
  const selectedMenuId = useMemo(() => {
    return currentMenu ? [currentMenu.id] : [];
  }, [currentMenu]);

  // 菜单项
  const menuItems = useMemo(() => constructMenu(menus), [menus, constructMenu]);

  // 点击菜单项
  const handleMenuClick = (item: { key: string }) => {
    const menuDef = menuMap.get(item.key);
    if (menuDef) {
      if (onClickMenu) {
        onClickMenu(menuDef);
      }
      navigate(menuDef.path);
    }
  };

  // 展开/收起子菜单
  const handleOpenChange = (keys: string[]) => {
    setUserOpenKeys(keys);
  };

  return (
    <Menu
      theme={theme}
      className={theme === 'dark' ? 'admin_dark_sider_menu' : ''}
      mode='inline'
      onClick={handleMenuClick}
      onOpenChange={handleOpenChange}
      selectedKeys={selectedMenuId}
      openKeys={collapsed ? undefined : (userOpenKeys ?? openMenuIds)}
      items={menuItems}
    />
  );
};

export default SiderMenu;
