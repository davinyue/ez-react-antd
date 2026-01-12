import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router';
import AdminLayout from './index'; // 从 index 导入
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

// 简单的菜单配置
const simpleMenus = [
  {
    id: 'dashboard',
    path: '/dashboard',
    title: '仪表盘',
    icon: <DashboardOutlined />,
    show: true,
  },
  {
    id: 'users',
    path: '/users',
    title: '用户管理',
    icon: <UserOutlined />,
    show: true,
  },
  {
    id: 'products',
    path: '/products',
    title: '商品管理',
    icon: <ShoppingCartOutlined />,
    show: true,
  },
  {
    id: 'settings',
    path: '/settings',
    title: '系统设置',
    icon: <SettingOutlined />,
    show: true,
  },
];

// Mock 用户信息
const mockUserInfo = {
  name: '张三',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
};

// 简单的内容组件
const SimpleContent = () => (
  <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
    <Card>
      <Title level={2}>欢迎使用后台管理系统</Title>
      <Paragraph>
        这是一个使用 AdminLayout 组件构建的后台管理系统示例。
      </Paragraph>
      <Paragraph>
        <strong>功能特点:</strong>
      </Paragraph>
      <ul>
        <li>响应式布局 - 自动适配桌面、平板、手机</li>
        <li>主题切换 - 支持亮色/暗色主题</li>
        <li>菜单折叠 - 可收起/展开侧边栏</li>
        <li>用户信息 - 显示用户头像和下拉菜单</li>
      </ul>
    </Card>
  </div>
);

const meta: Meta<typeof AdminLayout> = {
  title: 'Layout/AdminLayout',
  component: AdminLayout,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AdminLayout>;

/**
 * 基本示例
 * 
 * 展示 AdminLayout 的基本用法
 */
export const Basic: Story = {
  args: {
    menus: simpleMenus,
    appName: '管理系统',
    userInfo: mockUserInfo,
    onLogout: () => alert('退出登录'),
    children: <SimpleContent />,
  },
};

/**
 * 自定义品牌
 */
export const CustomBranding: Story = {
  args: {
    menus: simpleMenus,
    appName: 'ERP 系统',
    appIcon: 'https://api.dicebear.com/7.x/shapes/svg?seed=ERP',
    userInfo: mockUserInfo,
    onLogout: () => alert('退出登录'),
    children: <SimpleContent />,
  },
};

/**
 * 无用户信息
 */
export const NoUserInfo: Story = {
  args: {
    menus: simpleMenus,
    appName: '管理系统',
    children: <SimpleContent />,
  },
};

/**
 * 带子菜单
 */
export const WithSubmenus: Story = {
  args: {
    menus: [
      {
        id: 'dashboard',
        path: '/dashboard',
        title: '仪表盘',
        icon: <DashboardOutlined />,
        show: true,
      },
      {
        id: 'users',
        path: '/users',
        title: '用户管理',
        icon: <UserOutlined />,
        show: true,
        childrens: [
          {
            id: 'user-list',
            path: '/users/list',
            title: '用户列表',
            parentId: 'users',
            show: true,
          },
          {
            id: 'user-roles',
            path: '/users/roles',
            title: '角色管理',
            parentId: 'users',
            show: true,
          },
        ],
      },
      {
        id: 'settings',
        path: '/settings',
        title: '系统设置',
        icon: <SettingOutlined />,
        show: true,
        childrens: [
          {
            id: 'settings-general',
            path: '/settings/general',
            title: '基本设置',
            parentId: 'settings',
            show: true,
          },
          {
            id: 'settings-security',
            path: '/settings/security',
            title: '安全设置',
            parentId: 'settings',
            show: true,
          },
        ],
      },
    ],
    appName: '管理系统',
    userInfo: mockUserInfo,
    onLogout: () => alert('退出登录'),
    children: <SimpleContent />,
  },
};
