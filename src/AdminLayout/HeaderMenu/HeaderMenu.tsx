import React from 'react';
import { Dropdown, Avatar } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useResponsive } from '../../Grid';
import defaultUserAvatar from '../../assets/default_user_avatar.svg';

export interface HeaderMenuProp {
  userInfo?: { userName?: string, avatar?: string };
  onLogout?: () => void;
  /** 文件下载前缀 URL, 用于拼接头像 ID */
  fileDownloadUrl?: string;
  onModifyPassword?: () => void;
}

/**
 * 头部菜单组件
 */
const HeaderMenu: React.FC<HeaderMenuProp> = ({
  userInfo = {},
  onLogout,
  fileDownloadUrl
}) => {
  const { isMobile } = useResponsive();

  // 处理菜单点击
  const handleMenuClick = async (menuItem: { key: string }) => {
    if (menuItem.key === 'logout') {
      onLogout?.();
    }
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
  const menuItems = [
    {
      label: '退出',
      key: 'logout',
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <div className='admin_layout_header_box'>
      <div className='admin_layout_header_menu'></div>
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
