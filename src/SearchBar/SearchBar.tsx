import React, { CSSProperties, createContext } from 'react';
import { Form, Button, type ColProps, type FormInstance } from 'antd';
import { connect } from 'react-redux';
import { DownOutlined, UpOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Dispatch } from 'redux';
import { PayloadAction } from '../types';
import compare from '../utils/compare';
import Grid, { WidthType } from '../Grid';
import './index.less';

// 创建 Context 用于传递响应式状态
const ResponsiveContext = createContext<{ isMobile: boolean }>({ isMobile: false });

export interface SearchBarItemProps {
    label: string;
    name: string;
    children?: React.ReactNode | React.ReactNode[];
    wrapperCol?: ColProps,
    style?: CSSProperties
}

interface SearchBarItemState {
    /** 宽度 */
    width: string;
    /** 是否是移动端 */
    isMobile: boolean;
}

class SearchBarItem extends React.Component<SearchBarItemProps, SearchBarItemState> {
    constructor(props: SearchBarItemProps) {
        super(props);
        this.handleWidthChange = this.handleWidthChange.bind(this);
        this.state = { width: '250px', isMobile: false };
    }

    handleWidthChange(type: WidthType) {
        const isMobile = type === 'xs' || type === 'sm' || type === 'md';
        const newWidth = isMobile ? '100%' : '250px';

        // 只在值真正改变时才更新 state
        if (this.state.width !== newWidth || this.state.isMobile !== isMobile) {
            this.setState({ width: newWidth, isMobile });
        }
    }

    render() {
        let style: CSSProperties = {};
        if (this.props.style) {
            style = { ...this.props.style };
        }
        if (!style.width) {
            style.width = this.state.width;
        }
        return (
            <>
                <Grid onChange={this.handleWidthChange} />
                <div className='table_search_item' style={style}>
                    <Form.Item
                        label={this.props.label}
                        name={this.props.name}
                        style={{ width: '100%' }}
                        wrapperCol={this.props.wrapperCol}
                    >
                        {this.props.children}
                    </Form.Item>
                </div>
            </>
        );
    }
}

interface SearchBarProps {
    /** redux模块名称 */
    modelName: string;
    /** 更多条件框架 */
    moreItem?: React.ReactNode;
    /** 禁用按钮 */
    disabled?: boolean;
    /** 查询参数名称, 存储到store */
    paramName?: string;
    /** 数据存储参数名称, 存储到store */
    dataStore?: string;
    /** 表单参数改变事件 */
    onValuesChange?: (value: any) => void;
    /** 搜索事件 */
    onSearch?: (value: any) => any;
    dispatch?: Dispatch<PayloadAction>;
    queryParam?: {
        [key: string]: any;
    };
    /** 展示添加菜单 */
    showAddMenu?: boolean;
    /** 是否展示删除菜单 */
    showDeleteMenu?: boolean;
    /** 添加菜单名称 */
    addMenuName?: string;
    /** 删除菜单名称 */
    deleteMenuName?: string;
    children?: React.ReactNode | React.ReactNode[];
    /** 当点击添加菜单时 */
    onClickAdd?: () => void;
    /** 当点击删除菜单时 */
    onClickDelete?: () => void;
    /** 查询方法 */
    queryMethod?: string,
}

export class SearchBar extends React.Component<SearchBarProps> {
    formRef: React.RefObject<FormInstance | null>;
    static Item: typeof SearchBarItem = SearchBarItem;
    static defaultProps: SearchBarProps = {
        disabled: false,
        paramName: 'queryParam',
        dataStore: 'pageData',
        showAddMenu: false,
        showDeleteMenu: false,
        addMenuName: '新增',
        deleteMenuName: '删除',
        queryMethod: 'getPageInfo',
        modelName: ''
    };

    state = {
        showMore: false,
        isMobile: false,
    };

    constructor(props: SearchBarProps) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
        this.resetForm = this.resetForm.bind(this);
        this.handleGridChange = this.handleGridChange.bind(this);
        this.setFormValues = this.setFormValues.bind(this);
        this.formRef = React.createRef<FormInstance>();
    }

    handleGridChange(type: WidthType) {
        const isMobile = type === 'xs' || type === 'sm';
        if (this.state.isMobile !== isMobile) {
            this.setState({ isMobile });
        }
    }

    setFormValues(values: any) {
        this.formRef.current?.setFieldsValue(values);
    }

    handleSearch(values: any) {
        if (this.props.onSearch instanceof Function) {
            values = this.props.onSearch(values);
        }
        const { queryMethod, dispatch } = this.props;
        dispatch?.({
            type: `${this.props.modelName}/${queryMethod}`,
            payload: {
                currentPage: 1,
                ...values,
            },
        });
    }

    resetForm() {
        this.formRef.current?.resetFields();
    }

    componentDidUpdate(prevProps: SearchBarProps) {
        if (!compare(this.props.queryParam, prevProps.queryParam)) {
            const value = this.props.queryParam;
            this.setFormValues(value);
            if (this.props.onValuesChange) {
                this.props.onValuesChange(value);
            }
        }
    }

    componentDidMount(): void {
        this.setFormValues(this.props.queryParam);
    }

    render() {
        const { showAddMenu, addMenuName, showDeleteMenu, onClickAdd, onClickDelete, deleteMenuName } = this.props;
        const { isMobile } = this.state;

        return (
            <ResponsiveContext.Provider value={{ isMobile }}>
                <Grid onChange={this.handleGridChange} />
                <Form
                    ref={this.formRef}
                    layout='horizontal'
                    onFinish={this.handleSearch}
                    onValuesChange={this.props.onValuesChange}
                >
                    <div className='table_search_bar'>
                        {this.props.children}
                        {this.state.showMore ? this.props.moreItem : null}
                        <div className='table_search_menu_box'>
                            {showAddMenu && (
                                <div className='table_search_menu_item'>
                                    <Button icon={<PlusOutlined />} type='primary' disabled={this.props.disabled}
                                        onClick={onClickAdd}>{addMenuName}</Button>
                                </div>
                            )}
                            {showDeleteMenu && (
                                <div className='table_search_menu_item'>
                                    <Button danger icon={<DeleteOutlined />} type='primary' disabled={this.props.disabled}
                                        onClick={onClickDelete}>{deleteMenuName}</Button>
                                </div>
                            )}
                            <div className='table_search_menu_item'>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    disabled={this.props.disabled}
                                >
                                    搜索
                                </Button>
                            </div>
                            <div className='table_search_menu_item'>
                                <Button onClick={this.resetForm} disabled={this.props.disabled}>
                                    重置
                                </Button>
                            </div>
                            {this.props.moreItem ? (
                                <div
                                    className='table_search_menu_item'
                                    onClick={() => {
                                        this.setState({
                                            showMore: !this.state.showMore,
                                        });
                                    }}
                                >
                                    <a>
                                        {this.state.showMore ? '收起' : '展开'}
                                        {this.state.showMore ? (
                                            <UpOutlined style={{ marginLeft: '7px' }} />
                                        ) : (
                                            <DownOutlined style={{ marginLeft: '7px' }} />
                                        )}
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </Form>
            </ResponsiveContext.Provider>
        );
    }
}

function stateMapProps(state: any, props: SearchBarProps) {
    let { modelName, paramName } = props;
    if (!paramName) {
        paramName = SearchBar.defaultProps.paramName || 'queryParam';
    }
    const searchModel = state[modelName] || {};
    return {
        loading: searchModel.loading,
        queryParam: searchModel[paramName!],
    };
}

const NewSearchBar = connect(stateMapProps)(SearchBar);
export default NewSearchBar;
