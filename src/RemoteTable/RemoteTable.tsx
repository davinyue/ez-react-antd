import React from 'react';
import { Table, Divider, Card, Pagination } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection, ExpandableConfig, Key } from 'antd/es/table/interface';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { PayloadAction } from '../types';
import compare from '../utils/compare';
import Grid from '../Grid';
import './index.less';

/**
 * 远程数据表格组件属性接口
 */
export interface RemoteTableProp {
  /** 是否需要查询参数才发起请求，默认 false */
  needQueryParam?: boolean;
  /** 行主键字段名，默认 'id' */
  primaryKey?: string;
  /** Redux 模块名称 */
  modelName: string;
  /** 查询参数对象 */
  queryParam?: { [key: string]: any };
  /** Redux action 中的查询方法名，默认 'getPageInfo' */
  queryMethod?: string,
  /** 查询参数在 Redux store 中的字段名，默认 'queryParam' */
  paramName?: string;
  /** 分页数据在 Redux store 中的字段名，默认 'pageData' */
  dataStore?: string;
  /** Redux dispatch 函数，由 connect HOC 注入 */
  dispatch?: Dispatch<PayloadAction>;
  /** 加载状态，由 connect HOC 注入 */
  loading?: boolean;
  /** 分页数据，由 connect HOC 注入 */
  pageData?: any;
  /** 子组件，通常是操作按钮 */
  children?: React.ReactNode | React.ReactNode[];
  /** 表格标题 */
  title?: string;
  /** 表格列配置 */
  columns: ColumnsType<any>;
  /** 表格行选择配置 */
  rowSelection?: TableRowSelection<any>;
  /** 横向滚动条出现时减去的宽度，默认 0 */
  scrollSub?: number;
  /** 是否不显示 loading 状态，默认 false */
  notShowLoading?: boolean,
  /** 展开配置 */
  expandable?: ExpandableConfig<any>
  /** 是否显示表头，默认 true */
  showHeader?: boolean
}

/**
 * 远程数据表格组件状态接口
 */
export interface RemoteTableState {
  /** 容器宽度 */
  clientWidth: number;
  /** 是否是移动端 */
  isMobile: boolean;
}

/**
 * 远程数据表格组件
 * 从远程 API 加载分页数据，支持响应式布局
 * 移动端显示为卡片列表，桌面端显示为表格
 * 与 Redux 集成，自动管理加载状态和分页数据
 * 
 * @example
 * <RemoteTable 
 *   modelName="user"
 *   columns={columns}
 *   queryParam={{ status: 'active' }}
 * />
 */
class RemoteTable extends React.Component<RemoteTableProp, RemoteTableState> {
  ref: React.RefObject<HTMLDivElement>;
  resizeObserver: ResizeObserver | null = null;

  static defaultProps = {
    primaryKey: 'id',
    needQueryParam: false,
    paramName: 'queryParam',
    dataStore: 'pageData',
    queryMethod: 'getPageInfo',
    scrollSub: 0,
    notShowLoading: false,
    showHeader: true
  };

  constructor(props: RemoteTableProp) {
    super(props);
    this.ref = React.createRef();
    this.loadingData = this.loadingData.bind(this);
    this.handleGridChange = this.handleGridChange.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleShowSizeChange = this.handleShowSizeChange.bind(this);
    this.getRowKey = this.getRowKey.bind(this);
    this.showTotal = this.showTotal.bind(this);

    this.state = {
      clientWidth: 0,
      isMobile: false,
    };
  }

  handleGridChange(type: string) {
    const isMobile = type === 'xs' || type === 'sm';
    if (isMobile !== this.state.isMobile) {
      this.setState({ isMobile });
    }
  }

  componentDidMount() {
    this.loadingData();

    // 使用 ResizeObserver 监听容器尺寸变化
    const container = this.ref.current;
    if (container) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          if (width > 0 && width !== this.state.clientWidth) {
            this.setState({ clientWidth: width });
          }
        }
      });
      this.resizeObserver.observe(container);
    }
  }

  componentDidUpdate(prevProps: RemoteTableProp) {
    const { queryParam, modelName } = this.props;
    if (
      !compare(prevProps.queryParam, queryParam) ||
      modelName !== prevProps.modelName
    ) {
      this.loadingData();
    }
  }

  componentWillUnmount() {
    // 清理 ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  loadingData() {
    const { queryParam, needQueryParam, modelName, queryMethod, paramName, dataStore, dispatch } = this.props;
    if (needQueryParam && !queryParam) {
      return;
    }
    if (modelName && dispatch) {
      dispatch({
        type: `${modelName}/${queryMethod}`,
        payload: queryParam,
        queryParamName: paramName,
        dataStore: dataStore
      });
    }
  }

  handlePageChange(currentPage: number, pageSize: number) {
    const { pageData, modelName, queryMethod, paramName, dataStore, dispatch } = this.props;
    // 如果页码没变，什么都不做 (虽然Table组件应该已经处理了，但加一层保险)
    if (pageData && currentPage === pageData.currentPage) {
      return;
    }
    if (dispatch) {
      dispatch({
        type: `${modelName}/${queryMethod}`,
        payload: {
          currentPage: currentPage,
          pageSize: pageSize
        },
        queryParamName: paramName,
        dataStore: dataStore
      });
    }
  }

  handleShowSizeChange(currentPage: number, pageSize: number) {
    const { modelName, queryMethod, paramName, dataStore, dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: `${modelName}/${queryMethod}`,
        payload: {
          currentPage: currentPage,
          pageSize: pageSize,
        },
        queryParamName: paramName,
        dataStore: dataStore
      });
    }
  }

  getRowKey(record: any): Key {
    const { primaryKey } = this.props;
    return record[primaryKey!] as Key;
  }

  showTotal(total: number, range: [number, number]) {
    return `${range[0]}-${range[1]}/${total}`;
  }

  /**
   * 渲染移动端卡片
   */
  renderMobileCard(record: any, index: number) {
    const { columns, primaryKey } = this.props;

    return (
      <Card key={record[primaryKey!]} size="small" className="remote-table-card">
        {columns.map((col: any) => {
          // 跳过操作列,操作按钮单独渲染
          if (col.dataIndex === 'action' || !col.dataIndex) {
            return null;
          }

          // 获取显示值
          let value = record[col.dataIndex];
          if (col.render && typeof col.render === 'function') {
            value = col.render(value, record, index);
          }

          return (
            <div key={col.key || col.dataIndex} className="card-row">
              <span className="label">{col.title}:</span>
              <span className="value">{value}</span>
            </div>
          );
        })}

        {/* 操作按钮 */}
        {columns.find((col: any) => !col.dataIndex || col.dataIndex === 'action') && (
          <div className="card-actions">
            {columns.map((col: any) => {
              if (!col.dataIndex || col.dataIndex === 'action') {
                if (col.render && typeof col.render === 'function') {
                  return (
                    <div key={col.key || 'action'} className="action-wrapper">
                      {col.render(null, record, index)}
                    </div>
                  );
                }
              }
              return null;
            })}
          </div>
        )}
      </Card>
    );
  }

  render() {
    const {
      pageData = {},
      scrollSub,
      title,
      children,
      expandable,
      columns,
      rowSelection,
      notShowLoading,
      loading,
      showHeader
    } = this.props;

    const { clientWidth, isMobile } = this.state;

    const pagination = {
      total: pageData.total || 0,
      current: pageData.currentPage || 1,
      pageSize: pageData.pageSize || 10,
    };

    const paginationConfig = {
      position: ['bottomRight'] as any,
      current: pagination.current,
      pageSize: pagination.pageSize,
      pageSizeOptions: ['16', '25', '32', '64', '128'],
      total: pagination.total,
      size: 'small' as const,
      showQuickJumper: false,
      hideOnSinglePage: true,
      showTotal: this.showTotal,
      onChange: this.handlePageChange,
      onShowSizeChange: this.handleShowSizeChange,
    };

    return (
      <div ref={this.ref} className='remote_table_box'>
        <Grid onChange={this.handleGridChange} />
        {children && (
          <div className='romote_table_menu_box'>
            <div className='romote_table_title'>{title}</div>
            <div className='romote_table_menu'>
              {children}
              <Divider type='vertical' />
            </div>
          </div>
        )}

        {/* 移动端:卡片列表 */}
        {isMobile ? (
          <div className="remote-table-mobile">
            {(pageData.data || []).map((record: any, index: number) =>
              this.renderMobileCard(record, index)
            )}
            {/* 移动端分页 */}
            {pagination.total > 0 && (
              <div className="mobile-pagination">
                <div className="pagination-info">
                  共 {pagination.total} 条
                </div>
                <Pagination
                  {...paginationConfig}
                  simple
                  size='default'
                  showSizeChanger={false}
                  itemRender={(page, type, originalElement) => {
                    if (type === 'prev') {
                      return <a className="ant-pagination-item-link">上一页</a>;
                    }
                    if (type === 'next') {
                      return <a className="ant-pagination-item-link">下一页</a>;
                    }
                    return originalElement;
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          /* 桌面端:表格 */
          <Table
            expandable={expandable}
            columns={columns}
            dataSource={pageData.data || []}
            size='small'
            rowSelection={rowSelection}
            loading={!notShowLoading && loading}
            scroll={clientWidth === 0 ? undefined : { x: clientWidth - 0.1 - (scrollSub || 0) }}
            showHeader={showHeader}
            rowKey={this.getRowKey}
            pagination={paginationConfig}
          />
        )}
      </div>
    );
  }
}

function stateMapProps(state: any, props: RemoteTableProp) {
  let { modelName, dataStore } = props;
  if (!dataStore) {
    dataStore = RemoteTable.defaultProps.dataStore;
  }
  const tableModel = state[modelName] || {};
  return {
    loading: tableModel.loading,
    pageData: tableModel[dataStore],
  };
}

const connector = connect(stateMapProps);
export default connector(RemoteTable);
