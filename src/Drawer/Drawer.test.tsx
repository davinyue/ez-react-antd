import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { DrawerProps } from 'antd';
import Drawer from './Drawer';

let drawerProps: DrawerProps | undefined;

vi.mock('antd', () => ({
  Drawer: (props: DrawerProps) => {
    drawerProps = props;
    return <div>{props.children}</div>;
  },
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: React.MouseEventHandler }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@ant-design/icons', () => ({
  RollbackOutlined: () => <span />,
}));

describe('Drawer', () => {
  beforeEach(() => {
    drawerProps = undefined;
  });

  it('maps legacy width and maskClosable props to Ant Design 6 props', () => {
    render(
      <Drawer open title="详情" width={480} mask maskClosable={false}>
        内容
      </Drawer>
    );

    expect(drawerProps?.size).toBe(480);
    expect(drawerProps?.mask).toEqual({ enabled: true, closable: false });
    expect(drawerProps).not.toHaveProperty('width');
    expect(drawerProps).not.toHaveProperty('height');
    expect(drawerProps).not.toHaveProperty('maskClosable');
  });

  it('maps legacy height to size for top and bottom drawers', () => {
    render(
      <Drawer open title="详情" placement="top" height="60%">
        内容
      </Drawer>
    );

    expect(drawerProps?.size).toBe('60%');
  });
});
