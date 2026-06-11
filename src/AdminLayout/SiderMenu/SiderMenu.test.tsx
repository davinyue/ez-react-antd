import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { MenuProps } from 'antd';
import SiderMenu from './SiderMenu';

let menuProps: MenuProps | undefined;

vi.mock('antd', () => ({
  Menu: (props: MenuProps) => {
    menuProps = props;
    return <div data-testid="sider-menu" />;
  },
}));

vi.mock('react-router', () => ({
  useLocation: () => ({ pathname: '/admin/appSystem/list' }),
  useNavigate: () => vi.fn(),
}));

vi.mock('../../ConfigProvider', () => ({
  useConfig: () => ({}),
}));

describe('SiderMenu', () => {
  beforeEach(() => {
    menuProps = undefined;
  });

  it('uses shared sider menu class for light theme styles', () => {
    render(<SiderMenu menus={[]} theme="light" />);

    expect(menuProps?.className).toBe('admin_sider_menu admin_light_sider_menu');
  });

  it('keeps dark theme class while using shared sider menu class', () => {
    render(<SiderMenu menus={[]} theme="dark" />);

    expect(menuProps?.className).toBe('admin_sider_menu admin_dark_sider_menu');
  });
});
