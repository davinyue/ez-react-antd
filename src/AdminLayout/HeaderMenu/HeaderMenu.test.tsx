import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { AvatarProps, DropdownProps } from 'antd';
import HeaderMenu from './HeaderMenu';

let dropdownProps: DropdownProps | undefined;

vi.mock('antd', () => ({
  Dropdown: (props: DropdownProps) => {
    dropdownProps = props;
    return <div>{props.children}</div>;
  },
  Avatar: (props: AvatarProps) => <div data-testid="avatar" data-src={String(props.src ?? '')} />,
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

  it.each([
    ['https://cdn.example.com/avatar.png'],
    ['http://cdn.example.com/avatar.png'],
    ['/assets/avatar.png'],
  ])('uses avatar url directly when avatar starts with %s', (avatar) => {
    const { getByTestId } = render(
      <HeaderMenu
        userInfo={{ userName: 'admin', avatar }}
        fileDownloadUrl="/api/file/download"
      />
    );

    expect(getByTestId('avatar')).toHaveAttribute('data-src', avatar);
  });

  it('uses fileDownloadUrl when avatar is a file id', () => {
    const { getByTestId } = render(
      <HeaderMenu
        userInfo={{ userName: 'admin', avatar: 'avatar-file-id' }}
        fileDownloadUrl="/api/file/download"
      />
    );

    expect(getByTestId('avatar')).toHaveAttribute(
      'data-src',
      '/api/file/download?id=avatar-file-id'
    );
  });
});
