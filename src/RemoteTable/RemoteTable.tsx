import React from 'react';
import { Table, Divider, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection, ExpandableConfig, Key } from 'antd/es/table/interface';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { PayloadAction } from '../types';
import compare from '../utils/compare';
import Grid from '../Grid';
import './index.less';

export interface RemoteTableProp {
    /** 需要参数才发起请求 */
    needQueryParam?: boolean;
    /** 行key */
    primaryKey?: string;
    /** model名称 */
    modelName: string;
    /** 查询参数 */
    queryParam?: { [key: string]: any };
    /** 查询方法 */
    queryMethod?: string;
    /** 查询参数名称, 存储到store */
    paramName?: string;
    /** 数据存储参数名称, 存储到store */
    dataStore?: string;
    /** action派发函数, 由hoc提供 */
    dispatch?: Dispatch<PayloadAction>;
    /** loading状态, 由hoc提供 */
    loading?: boolean;
    /** 分页数据, 由hoc提供 */
    pageData?: any;
    children?: React.ReactNode | React.ReactNode[];
    /** 表格标题 */
    title?: string;
    /** 表格列 */
    columns: ColumnsType<any>;
    /** 表格选中事件 */
    rowSelection?: TableRowSelection<any>;
    /** 横向滚动条出现减去的宽度 */
    scrollSub?: number;
    /** 不显示loading状态 */
    notShowLoading?: boolean;
    /** 展开配置 */
    expandable?: ExpandableConfig<any>;
    /** 是否展示表头 */
    showHeader?: boolean;
}

export interface RemoteTableState {
    /** 浏览器窗口宽度 */
    clientWidth: number;
    /** 是否是移动端 */
    isMobile: boolean;
}

class RemoteTable extends React.Component<RemoteTableProp, RemoteTableState> {
    ref: React.RefObject<HTMLDivElement | null>;

    static defaultProps = {
        primaryKey: 'id',
        needQueryParam: false,
        paramName: 'queryParam',
        dataStore: 'pageData',
        queryMethod: 'getPageInfo',
        scrollSub: 0,
        notShowLoading: false,
        showHeader: true,
    };

    constructor(props: RemoteTableProp) {
        super(props);
        this.ref = React.createRef<HTMLDivElement>();
        this.loadingData = this.loadingData.bind(this);
        this.handleGridChange = this.handleGridChange.bind(this);
        this.getWindowWidth = this.getWindowWidth.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handleShowSizeChange = this.handleShowSizeChange.bind(this);
        this.getRowKey = this.getRowKey.bind(this);
        this.showTotal = this.showTotal.bind(this);

        this.state = {
            clientWidth: this.getWindowWidth(),
            isMobile: false,
        };
    }

    getWindowWidth(): number {
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        return width + 1;
    }

    handleGridChange(type: string) {
        const currentDom = this.ref.current;
        const isMobile = type === 'xs' || type === 'sm';

        if (currentDom) {
            const { clientWidth } = currentDom;
            // 只有宽度或移动端状态改变时才更新state
            if (
                clientWidth !== this.state.clientWidth ||
                isMobile !== this.state.isMobile
            ) {
                this.setState({
                    clientWidth: clientWidth,
                    isMobile: isMobile,
                });
            }
        }
    }

    componentDidMount() {
        this.loadingData();
        // 初始化时获取一次宽度
        // handleGridChange 现在需要 type 参数,这里不调用,等 Grid onChange 触发
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

    loadingData() {
        const {
            queryParam,
            needQueryParam,
            modelName,
            queryMethod,
            paramName,
            dataStore,
            dispatch,
        } = this.props;
        if (needQueryParam && !queryParam) {
            return;
        }
        if (modelName && dispatch) {
            dispatch({
                type: `${modelName}/${queryMethod}`,
                payload: queryParam,
                queryParamName: paramName,
                dataStore: dataStore,
            });
        }
    }

    handlePageChange(currentPage: number, pageSize: number) {
        const {
            pageData,
            modelName,
            queryMethod,
            paramName,
            dataStore,
            dispatch,
        } = this.props;
        // 如果页码没变，什么都不做 (虽然Table组件应该已经处理了，但加一层保险)
        if (pageData && currentPage === pageData.currentPage) {
            return;
        }
        if (dispatch) {
            dispatch({
                type: `${modelName}/${queryMethod}`,
                payload: {
                    currentPage: currentPage,
                    pageSize: pageSize,
                },
                queryParamName: paramName,
                dataStore: dataStore,
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
                dataStore: dataStore,
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
            <Card
                key={record[primaryKey!]}
                size="small"
                className="remote-table-card"
            >
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
                {columns.find(
                    (col: any) => !col.dataIndex || col.dataIndex === 'action'
                ) && (
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
            showHeader,
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
            <div ref={this.ref} className="remote_table_box">
                <Grid onChange={this.handleGridChange} />
                {children && (
                    <div className="romote_table_menu_box">
                        <div className="romote_table_title">{title}</div>
                        <div className="romote_table_menu">
                            {children}
                            <Divider type="vertical" />
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
                                <div className="pagination-info">共 {pagination.total} 条</div>
                                <Table
                                    dataSource={[]}
                                    columns={[]}
                                    showHeader={false}
                                    pagination={{
                                        ...paginationConfig,
                                        simple: true,
                                        size: 'default',
                                        showSizeChanger: false,
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
                        size="small"
                        rowSelection={rowSelection}
                        loading={!notShowLoading && loading}
                        scroll={
                            clientWidth === 0
                                ? undefined
                                : { x: clientWidth - 0.1 - (scrollSub || 0) }
                        }
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
