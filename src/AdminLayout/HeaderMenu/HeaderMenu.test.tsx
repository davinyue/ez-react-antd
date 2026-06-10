import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { AvatarProps, DropdownProps, MenuProps } from 'antd';
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

  it('appends logout item after custom user menu items', () => {
    render(
      <HeaderMenu
        userInfo={{ userName: 'admin' }}
        userMenuItems={[
          { key: 'profile', label: '个人资料' },
          { key: 'security', label: '安全中心' },
        ]}
      />
    );

    expect(dropdownProps?.menu?.items).toEqual([
      { key: 'profile', label: '个人资料' },
      { key: 'security', label: '安全中心' },
      { type: 'divider' },
      expect.objectContaining({ key: 'logout', label: '退出' }),
    ]);
  });

  it('routes custom menu clicks and logout clicks to their own handlers', async () => {
    const onUserMenuClick = vi.fn();
    const onLogout = vi.fn();
    render(
      <HeaderMenu
        userInfo={{ userName: 'admin' }}
        userMenuItems={[
          { key: 'changePassword', label: '修改密码' },
        ]}
        onUserMenuClick={onUserMenuClick}
        onLogout={onLogout}
      />
    );

    await dropdownProps?.menu?.onClick?.({ key: 'changePassword' } as Parameters<NonNullable<MenuProps['onClick']>>[0]);
    await dropdownProps?.menu?.onClick?.({ key: 'logout' } as Parameters<NonNullable<MenuProps['onClick']>>[0]);

    expect(onUserMenuClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'changePassword' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
