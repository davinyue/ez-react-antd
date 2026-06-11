import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { CSSProperties, ReactNode } from 'react';
import type { ThemeType } from './constants';
import AdminLayout from './AdminLayout';

interface SiderMockProps {
  children?: ReactNode;
  collapsed?: boolean;
  breakpoint?: string;
  className?: string;
  theme?: ThemeType;
  collapsedWidth?: number;
  onBreakpoint?: (broken: boolean) => void;
}

interface LayoutMockProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

let siderProps: SiderMockProps | undefined;

const responsiveState = vi.hoisted(() => ({
  value: {
    isMobile: false,
    isTablet: false,
  },
}));

vi.mock('antd', () => {
  function Layout(props: LayoutMockProps) {
    return <div>{props.children}</div>;
  }

  function Sider(props: SiderMockProps) {
    siderProps = props;
    return <aside>{props.children}</aside>;
  }

  function Header(props: LayoutMockProps) {
    return <header>{props.children}</header>;
  }

  function Content(props: LayoutMockProps) {
    return <main>{props.children}</main>;
  }

  function Switch() {
    return <button type="button">Switch</button>;
  }

  Layout.Sider = Sider;
  Layout.Header = Header;
  Layout.Content = Content;

  return {
    Layout,
    Switch,
  };
});

vi.mock('@ant-design/icons', () => ({
  MenuUnfoldOutlined: () => <span />,
  MenuFoldOutlined: () => <span />,
  BulbOutlined: () => <span />,
}));

vi.mock('./HeaderMenu', () => ({
  default: () => <div />,
}));

vi.mock('./SiderMenu', () => ({
  default: () => <div />,
}));

vi.mock('../Grid', () => ({
  useResponsive: () => responsiveState.value,
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    siderProps = undefined;
    responsiveState.value = {
      isMobile: false,
      isTablet: false,
    };
  });

  it('collapses sider by default on tablet layout', () => {
    responsiveState.value = {
      isMobile: false,
      isTablet: true,
    };

    render(<AdminLayout menus={[]} />);

    expect(siderProps?.collapsed).toBe(true);
    expect(siderProps?.breakpoint).toBe('lg');
    expect(siderProps?.collapsedWidth).toBe(80);
  });

  it('keeps sider expanded by default on desktop layout', () => {
    render(<AdminLayout menus={[]} />);

    expect(siderProps?.collapsed).toBe(false);
    expect(siderProps?.breakpoint).toBe('lg');
  });
});
