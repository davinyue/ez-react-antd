import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { DropdownProps } from 'antd';
import HeaderMenu from './HeaderMenu';

let dropdownProps: DropdownProps | undefined;

vi.mock('antd', () => ({
  Dropdown: (props: DropdownProps) => {
    dropdownProps = props;
    return <div>{props.children}</div>;
  },
  Avatar: () => <div data-testid="avatar" />,
}));

vi.mock('../../Grid', () => ({
  useResponsive: () => ({ isMobile: true }),
}));

describe('HeaderMenu', () => {
  beforeEach(() => {
    dropdownProps = undefined;
  });

  it('uses Dropdown classNames.root for mobile menu popup class', () => {
    render(<HeaderMenu userInfo={{ userName: 'admin' }} />);

    expect(dropdownProps?.classNames).toEqual({
      root: 'admin_layout_header_menu_dropdown_xs',
    });
    expect(dropdownProps).not.toHaveProperty('overlayClassName');
  });
});
