import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import type { TableProps } from 'antd';
import RemoteTable from './RemoteTable';

let tableProps: TableProps<any> | undefined;
let resizeCallback: ResizeObserverCallback;

vi.mock('antd', () => ({
  Table: (props: TableProps<any>) => {
    tableProps = props;
    return <div data-testid="remote-table" />;
  },
  Divider: () => <div />,
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pagination: () => <div />,
}));

vi.mock('../Grid', () => ({
  default: () => null,
}));

function renderRemoteTable(columns: TableProps<any>['columns']) {
  const store = createStore((state = {
    demo: {
      loading: false,
      pageData: {
        data: [{ id: 1, name: 'Alpha', status: '启用' }],
        currentPage: 1,
        pageSize: 10,
        total: 1,
      },
    },
  }) => state);

  render(
    <Provider store={store}>
      <RemoteTable modelName="demo" columns={columns || []} />
    </Provider>
  );
}

describe('RemoteTable', () => {
  beforeEach(() => {
    tableProps = undefined;
    resizeCallback = undefined as unknown as ResizeObserverCallback;
    global.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }

      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    } as unknown as typeof ResizeObserver;
  });

  it('does not enable horizontal scroll when columns fit container width', async () => {
    renderRemoteTable([
      { title: '名称', dataIndex: 'name', width: 120 },
      { title: '状态', dataIndex: 'status', width: 120 },
    ]);

    act(() => {
      resizeCallback([
        { contentRect: { width: 800 } } as ResizeObserverEntry,
      ], {} as ResizeObserver);
    });

    await waitFor(() => {
      expect(tableProps?.scroll).toBeUndefined();
    });
  });

  it('keeps horizontal scroll when columns exceed container width', async () => {
    renderRemoteTable([
      { title: '名称', dataIndex: 'name', width: 500 },
      { title: '状态', dataIndex: 'status', width: 400 },
    ]);

    act(() => {
      resizeCallback([
        { contentRect: { width: 800 } } as ResizeObserverEntry,
      ], {} as ResizeObserver);
    });

    await waitFor(() => {
      expect(tableProps?.scroll).toEqual({ x: 900 });
    });
  });
});
