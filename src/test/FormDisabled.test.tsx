import type { ReactNode } from 'react';
import { Button, Form } from 'antd';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DrawerRemoteTableSelect from '../DrawerRemoteTableSelect';
import ImageUpload from '../ImageUpload';
import RemoteCascader from '../RemoteCascader';
import RemoteModalSelect from '../RemoteModalSelect';
import RemoteSelect from '../RemoteSelect';
import RemoteTableSelect from '../RemoteTableSelect';

interface MockRowSelection {
  getCheckboxProps?: () => { disabled?: boolean };
}

vi.mock('../RemoteTable', () => ({
  default: ({ rowSelection }: { rowSelection?: MockRowSelection }) => (
    <div
      data-testid='remote-table-selection'
      data-disabled={String(rowSelection?.getCheckboxProps?.().disabled)}
    />
  ),
}));

vi.mock('../SearchBar', () => ({
  default: ({ children, disabled, onClickAdd }: {
    children?: ReactNode;
    disabled?: boolean;
    onClickAdd?: () => void;
  }) => (
    <div>
      <button type='button' disabled={disabled} onClick={onClickAdd}>
        确认
      </button>
      {children}
    </div>
  ),
}));

vi.mock('../Drawer', () => ({
  default: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

describe('Ant Design Form 禁用继承', () => {
  /**
   * 根据可见占位文本获取 Ant Design 选择控件的输入框
   * @param placeholder 可见占位文本
   * @returns 选择控件输入框
   */
  function getSelectInput(placeholder: string): HTMLInputElement | null {
    return screen.getByText(placeholder).closest('.ant-select')?.querySelector('input') ?? null;
  }

  it('原生 Ant Design 子控件继承表单禁用状态', () => {
    const { container } = render(
      <Form disabled>
        <RemoteSelect api='/api/options' needQueryParam placeholder='远程选择' />
        <RemoteCascader api='/api/cascader' needQueryParam placeholder='远程级联' />
        <ImageUpload needCrop={false} />
      </Form>
    );

    expect(getSelectInput('远程选择')).toBeDisabled();
    expect(getSelectInput('远程级联')).toBeDisabled();
    expect(container.querySelector('.ant-upload')).toHaveClass('ant-upload-disabled');
  });

  it('显式 disabled false 覆盖表单禁用状态', () => {
    const { container } = render(
      <Form disabled>
        <RemoteSelect disabled={false} api='/api/options' needQueryParam placeholder='远程选择' />
        <RemoteCascader disabled={false} api='/api/cascader' needQueryParam placeholder='远程级联' />
        <ImageUpload disabled={false} needCrop={false} />
      </Form>
    );

    expect(getSelectInput('远程选择')).not.toBeDisabled();
    expect(getSelectInput('远程级联')).not.toBeDisabled();
    expect(container.querySelector('.ant-upload')).not.toHaveClass('ant-upload-disabled');
  });

  it('表单禁用状态动态变化时同步更新原生子控件', () => {
    const { rerender } = render(
      <Form disabled={false}>
        <RemoteSelect api='/api/options' needQueryParam placeholder='动态远程选择' />
      </Form>
    );

    expect(getSelectInput('动态远程选择')).not.toBeDisabled();

    rerender(
      <Form disabled>
        <RemoteSelect api='/api/options' needQueryParam placeholder='动态远程选择' />
      </Form>
    );

    expect(getSelectInput('动态远程选择')).toBeDisabled();
  });

  it('自定义弹窗选择组件继承表单禁用状态', () => {
    render(
      <Form disabled>
        <RemoteTableSelect modelName='table' columns={[]} />
        <RemoteModalSelect tableProp={{ modelName: 'modal', columns: [] }} />
      </Form>
    );

    expect(screen.queryByRole('button', { name: /添\s*加/ })).not.toBeInTheDocument();
  });

  it('自定义弹窗选择组件支持显式启用', () => {
    render(
      <Form disabled>
        <RemoteTableSelect disabled={false} modelName='table' columns={[]} />
        <RemoteModalSelect disabled={false} tableProp={{ modelName: 'modal', columns: [] }} />
      </Form>
    );

    expect(screen.getAllByRole('button', { name: /添\s*加/ })).toHaveLength(2);
  });

  it('已打开弹窗在表单切换为禁用后限制确认和表格选择', async () => {
    const { rerender } = render(
      <Form disabled={false}>
        <RemoteTableSelect modelName='table' columns={[]} />
      </Form>
    );

    fireEvent.click(screen.getByRole('button', { name: /添\s*加/ }));

    rerender(
      <Form disabled>
        <RemoteTableSelect modelName='table' columns={[]} />
      </Form>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /确\s*定/ })).toBeDisabled();
      expect(screen.getByTestId('remote-table-selection')).toHaveAttribute('data-disabled', 'true');
    });
  });

  it('抽屉选择组件继承禁用状态并限制确认和表格选择', () => {
    render(
      <Form disabled>
        <DrawerRemoteTableSelect open modelName='drawer' columns={[]}>
          <Button>抽屉筛选项</Button>
        </DrawerRemoteTableSelect>
      </Form>
    );

    expect(screen.getByRole('button', { name: '确认' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /抽屉筛选项/ })).toBeDisabled();
    expect(screen.getByTestId('remote-table-selection')).toHaveAttribute('data-disabled', 'true');
  });

  it('抽屉选择组件支持显式启用', () => {
    render(
      <Form disabled>
        <DrawerRemoteTableSelect disabled={false} open modelName='drawer' columns={[]}>
          <Button>抽屉筛选项</Button>
        </DrawerRemoteTableSelect>
      </Form>
    );

    expect(screen.getByRole('button', { name: '确认' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /抽屉筛选项/ })).not.toBeDisabled();
    expect(screen.getByTestId('remote-table-selection')).toHaveAttribute('data-disabled', 'false');
  });
});
