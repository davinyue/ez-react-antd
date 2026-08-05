import React from 'react';
import { Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useResponsive } from '../../Grid';
import defaultUserAvatar from '../../assets/default_user_avatar.svg';

export type HeaderUserMenuItem = NonNullable<MenuProps['items']>[number];

export interface HeaderMenuProp {
  userInfo?: { userName?: string, avatar?: string };
  onLogout?: () => void;
  /** 文件下载前缀 URL, 用于拼接头像 ID */
  fileDownloadUrl?: string;
  onModifyPassword?: () => void;
  /** 自定义用户下拉菜单项, 会展示在默认退出菜单之前 */
  userMenuItems?: MenuProps['items'];
  /** 自定义用户下拉菜单点击事件 */
  onUserMenuClick?: MenuProps['onClick'];
  /** 用户信息左侧的自定义顶部内容 */
  headerExtra?: React.ReactNode;
}

/**
 * 头部菜单组件
 */
const HeaderMenu: React.FC<HeaderMenuProp> = ({
  userInfo = {},
  onLogout,
  fileDownloadUrl,
  userMenuItems,
  onUserMenuClick,
  headerExtra,
}) => {
  const { isMobile } = useResponsive();

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = (menuItem) => {
    if (menuItem.key === 'logout') {
      onLogout?.();
      return;
    }
    onUserMenuClick?.(menuItem);
  };

  // 获取用户头像
  const getUserAvatar = () => {
    const avatar = userInfo.avatar;

    if (!avatar) {
      return defaultUserAvatar;
    }

    if (/^(https?:\/\/|\/)/i.test(avatar)) {
      return avatar;
    }

    if (fileDownloadUrl) {
      return `${fileDownloadUrl}?id=${avatar}`;
    }

    return defaultUserAvatar;
  };

  // 下拉菜单项
  const logoutMenuItem: HeaderUserMenuItem = {
    label: '退出',
    key: 'logout',
    icon: <LogoutOutlined />,
  };
  const menuItems: MenuProps['items'] = userMenuItems && userMenuItems.length > 0
    ? [
      ...userMenuItems,
      { type: 'divider' },
      logoutMenuItem,
    ]
    : [
      logoutMenuItem,
    ];

  return (
    <div className='admin_layout_header_box'>
      <div className='admin_layout_header_menu'>
        {headerExtra && (
          <div className='admin_layout_header_extra'>{headerExtra}</div>
        )}
      </div>
      <div className='admin_layout_header_userinfo'>
        {!isMobile && (
          <div className='admin_layout_header_userinfo_name' style={{ marginLeft: '10px' }}>
            您好:{userInfo.userName}
          </div>
        )}
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement='bottomLeft'
          classNames={isMobile ? { root: 'admin_layout_header_menu_dropdown_xs' } : undefined}
        >
          <Avatar src={getUserAvatar()} />
        </Dropdown>
      </div>
    </div>
  );
};

export default HeaderMenu;
