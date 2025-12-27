import React, { useState } from 'react';
import { Layout, Switch } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, BulbOutlined } from '@ant-design/icons';
import HeaderMenu, { HeaderMenuProp } from './HeaderMenu';
import SiderMenu, { MenuDef } from './SiderMenu';
import { useResponsive } from '../Grid';
import defaultAppIcon from '../assets/app_icon.png';
import { LAYOUT_CONFIG, THEME, ThemeType } from './constants';

const { Header, Sider, Content } = Layout;

/**
 * 后台管理布局组件属性接口
 * 继承自 HeaderMenuProp，包含头部菜单的所有属性
 */
export interface AdminLayoutProp extends HeaderMenuProp {
  /** 侧边栏菜单配置数组 */
  menus: Array<MenuDef>;
  /** 内容区域的子组件 */
  children?: React.ReactNode;
  /** 系统名称，显示在侧边栏顶部，默认 'System' */
  appName?: string;
  /** 系统图标 URL，显示在侧边栏顶部，默认使用内置图标 */
  appIcon?: string;
}

/**
 * 后台管理布局组件
 * 提供完整的后台管理系统布局，包括侧边栏菜单、顶部导航、内容区域
 * 支持响应式设计，自动适配移动端和桌面端
 * 支持亮色/暗色主题切换
 * 
 * @example
 * // 基本用法
 * <AdminLayout 
 *   menus={menuConfig}
 *   appName="管理系统"
 *   userInfo={currentUser}
 *   onLogout={handleLogout}
 * >
 *   <YourContent />
 * </AdminLayout>
 * 
 * // 自定义图标和修改密码
 * <AdminLayout 
 *   menus={menuConfig}
 *   appName="ERP系统"
 *   appIcon="/logo.png"
 *   userInfo={currentUser}
 *   onLogout={handleLogout}
 *   onModifyPassword={handleModifyPassword}
 * >
 *   <Dashboard />
 * </AdminLayout>
 */
const AdminLayout: React.FC<AdminLayoutProp> = ({
  menus,
  children,
  appName = 'System',
  appIcon = defaultAppIcon,
  // HeaderMenu Props
  userInfo,
  onLogout,
  fileDownloadUrl,
  onModifyPassword
}) => {
  // 响应式状态
  const { isMobile } = useResponsive();

  // 组件状态
  const [collapsed, setCollapsed] = useState(isMobile);
  const [theme, setTheme] = useState<ThemeType>(THEME.DARK);

  // iframe 中不显示布局
  if (window.parent !== window) {
    return <>{children}</>;
  }

  /**
   * 切换侧边栏展开/收起状态
   */
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  /**
   * 处理菜单点击事件
   * 移动端点击菜单项后自动收起侧边栏
   */
  const handleMenuClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  /**
   * 获取内容区域的 CSS 类名
   * @returns 内容区域类名
   */
  const getContentClass = () => {
    if (isMobile && !collapsed) {
      return 'admin_layout_container admin_layout_container_drawer_open';
    }
    return 'admin_layout_container';
  };

  /**
   * 获取头部的 CSS 类名
   * 根据设备类型和侧边栏状态返回不同的类名
   * @returns 头部类名
   */
  const getHeaderClass = () => {
    if (isMobile) {
      return 'admin_layout_container_header_normal admin_layout_container_header_broken';
    }
    if (collapsed) {
      return 'admin_layout_container_header_normal admin_layout_container_header_close';
    }
    return 'admin_layout_container_header_normal admin_layout_container_header_open';
  };

  /**
   * 获取侧边栏的 CSS 类名
   * 根据展开状态和设备类型返回不同的类名
   * @returns 侧边栏类名
   */
  const getSiderClass = () => {
    const baseClass = 'admin_layout_sider_normal';

    // 展开状态并且是移动端
    if (!collapsed && isMobile) {
      return `${baseClass} admin_layout_sider_open_broken`;
    }
    // 展开状态
    if (!collapsed) {
      return `${baseClass} admin_layout_sider_open`;
    }
    // 收起状态
    return baseClass;
  };

  // 获取收起宽度
  const collapsedWidth = isMobile
    ? LAYOUT_CONFIG.COLLAPSED_WIDTH_MOBILE
    : LAYOUT_CONFIG.COLLAPSED_WIDTH_PC;

  return (
    <div className={`admin_layout_box${isMobile ? ' admin_layout_mobile' : ''}`}>
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className={getSiderClass()}
          theme={theme}
          breakpoint='md'
          collapsedWidth={collapsedWidth}
          onBreakpoint={(broken) => {
            if (!broken) {
              setCollapsed(false);
            } else {
              setCollapsed(true);
            }
          }}
        >
          <div className='admin_layout_logo'>
            <img style={{ height: '60%' }} src={appIcon} alt="logo" />
            {!collapsed && <div className='admin_layout_logo_txt'>{appName}</div>}
          </div>

          <div className='admin_layout_menu_container'>
            <div className='admin_layout_scrollbar_container'>
              <SiderMenu
                theme={theme}
                menus={menus}
                onClickMenu={handleMenuClick}
                collapsed={collapsed}
              />
            </div>
          </div>

          <div className='admin_layout_switch_theme'>
            {!collapsed && (
              <>
                <span>
                  <span className='admin_layout_action_bulb'>
                    <BulbOutlined />
                  </span>
                  <span style={{ color: theme !== THEME.DARK ? 'inherit' : '#666' }}>
                    Switch Theme
                  </span>
                </span>
                <Switch
                  checked={theme === THEME.DARK}
                  unCheckedChildren='light'
                  checkedChildren='dark'
                  onChange={(checked) => {
                    setTheme(checked ? THEME.DARK : THEME.LIGHT);
                  }}
                />
              </>
            )}
          </div>
        </Sider>

        <div className={getContentClass()}>
          <Header className={getHeaderClass()} style={{ padding: 0 }}>
            <div className='admin_layout_sider_switch_button'>
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: toggleCollapsed,
              })}
            </div>
            <HeaderMenu
              userInfo={userInfo}
              onLogout={onLogout}
              fileDownloadUrl={fileDownloadUrl}
              onModifyPassword={onModifyPassword}
            />
          </Header>

          <Content>
            {/* 移动端遮罩层 */}
            {isMobile && !collapsed && (
              <div
                className='admin_layout_mobile_mask'
                onClick={() => setCollapsed(true)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.45)',
                  zIndex: 9,
                }}
              />
            )}
            <div className='admin_layout_content_children'>{children}</div>
          </Content>
        </div>
      </Layout>
    </div>
  );
};

export default AdminLayout;