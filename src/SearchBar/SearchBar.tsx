/**
 * SearchBar 搜索栏组件
 * 
 * 提供表格数据搜索功能的组件,支持:
 * - 响应式布局(移动端/桌面端自适应)
 * - 展开/收起更多搜索条件
 * - 新增/删除操作按钮
 * - 与 Redux 的自动状态同步
 * - 搜索、重置功能
 * 
 * @example
 * ```tsx
 * <SearchBar modelName="user">
 *   <SearchBar.Item label="用户名" name="username">
 *     <Input placeholder="请输入用户名" />
 *   </SearchBar.Item>
 * </SearchBar>
 * ```
 */

import React, { CSSProperties, createContext } from 'react';
import { Form, Button, type ColProps, type FormInstance } from 'antd';
import { connect } from 'react-redux';
import { DownOutlined, UpOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Dispatch } from 'redux';
import { PayloadAction } from '../types';
import compare from '../utils/compare';
import Grid, { WidthType } from '../Grid';
import ButtonAuth from '../ButtonAuth';
import './index.less';

/** 响应式上下文,用于在组件树中传递移动端状态 */
const ResponsiveContext = createContext<{ isMobile: boolean }>({ isMobile: false });

/**
 * SearchBar.Item 组件的属性接口
 */
export interface SearchBarItemProps {
  /** 表单项标签文本 */
  label: string;
  /** 表单项字段名,对应查询参数的 key */
  name: string;
  /** 表单项内容,通常是 Input、Select 等表单控件 */
  children?: React.ReactNode | React.ReactNode[];
  /** 表单项内容区域的布局配置 */
  wrapperCol?: ColProps,
  /** 自定义样式,可覆盖默认宽度等样式 */
  style?: CSSProperties
}

/**
 * SearchBar.Item 组件的状态接口
 */
interface SearchBarItemState {
  /** 表单项宽度,响应式变化:移动端 100%,桌面端 250px */
  width: string;
  /** 是否是移动端(xs/sm/md) */
  isMobile: boolean;
}

/**
 * SearchBar.Item 搜索项组件
 * 
 * 用于在 SearchBar 中定义单个搜索条件,支持响应式宽度调整。
 * 在移动端会自动调整为 100% 宽度,桌面端为固定 250px 宽度。
 */
class SearchBarItem extends React.Component<SearchBarItemProps, SearchBarItemState> {
  constructor(props: SearchBarItemProps) {
    super(props);
    this.handleWidthChange = this.handleWidthChange.bind(this);
    this.state = { width: '250px', isMobile: false };
  }

  /**
   * 处理响应式宽度变化
   * @param type - 当前屏幕宽度类型(xs/sm/md/lg/xl/xxl)
   */
  handleWidthChange(type: WidthType) {
    const isMobile = type === 'xs' || type === 'sm' || type === 'md';
    const newWidth = isMobile ? '100%' : '250px';

    // 只在值真正改变时才更新 state,避免不必要的重渲染
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

/**
 * SearchBar 组件的属性接口
 */
interface SearchBarProps {
  /** Redux 模块名称,用于 dispatch action 和读取 state */
  modelName: string;
  /** 更多搜索条件,点击"展开"按钮后显示 */
  moreItem?: React.ReactNode;
  /** 是否禁用所有按钮 */
  disabled?: boolean;
  /** 查询参数在 Redux store 中的字段名,默认为 'queryParam' */
  paramName?: string;
  /** 分页数据在 Redux store 中的字段名,默认为 'pageData' */
  dataStore?: string;
  /** 表单值变化时的回调函数 */
  onValuesChange?: (value: any) => void;
  /** 搜索前的数据处理函数,可用于转换或验证搜索参数 */
  onSearch?: (value: any) => any;
  /** Redux dispatch 函数,由 connect HOC 自动注入 */
  dispatch?: Dispatch<PayloadAction>;
  /** 查询参数对象,由 connect HOC 从 Redux store 中读取 */
  queryParam?: {
    [key: string]: any;
  };
  /** 是否显示"新增"按钮 */
  showAddMenu?: boolean;
  /** 新增按钮权限编码（可选，用于 ButtonAuth 方式的权限验证，优先级高于 showAddMenu） */
  addMenuCode?: string;
  /** 是否显示"删除"按钮 */
  showDeleteMenu?: boolean;
  /** 删除按钮权限编码（可选，用于 ButtonAuth 方式的权限验证，优先级高于 showDeleteMenu） */
  deleteMenuCode?: string;
  /** "新增"按钮的文本,默认为"新增" */
  addMenuName?: string;
  /** "删除"按钮的文本,默认为"删除" */
  deleteMenuName?: string;
  /** 搜索条件子组件,通常是 SearchBar.Item */
  children?: React.ReactNode | React.ReactNode[];
  /** 点击"新增"按钮时的回调函数 */
  onClickAdd?: () => void;
  /** 点击"删除"按钮时的回调函数 */
  onClickDelete?: () => void;
  /** Redux action 中的查询方法名,默认为 'getPageInfo' */
  queryMethod?: string,
}

/**
 * SearchBar 搜索栏组件
 * 
 * 提供表格数据搜索功能,集成了:
 * - 响应式布局(移动端/桌面端自适应)
 * - 展开/收起更多搜索条件
 * - 新增/删除操作按钮
 * - 与 Redux 的自动状态同步
 * - 搜索、重置功能
 */
export class SearchBar extends React.Component<SearchBarProps> {
  /** 表单实例引用,用于获取/设置表单值 */
  formRef: React.RefObject<FormInstance | null>;
  /** 静态属性:搜索项子组件 */
  static Item: typeof SearchBarItem = SearchBarItem;
  /** 默认属性值 */
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

  /**
   * 处理响应式布局变化
   * @param type - 当前屏幕宽度类型
   */
  handleGridChange(type: WidthType) {
    const isMobile = type === 'xs' || type === 'sm';
    if (this.state.isMobile !== isMobile) {
      this.setState({ isMobile });
    }
  }

  /**
   * 设置表单值
   * @param values - 要设置的表单值对象
   */
  setFormValues(values: any) {
    this.formRef.current?.setFieldsValue(values);
  }

  /**
   * 处理搜索提交
   * @param values - 表单提交的值
   */
  handleSearch(values: any) {
    // 如果提供了 onSearch 回调,先进行数据转换
    if (this.props.onSearch instanceof Function) {
      values = this.props.onSearch(values);
    }
    const { queryMethod, dispatch } = this.props;
    // 发起 Redux action,重置到第一页并应用搜索条件
    dispatch?.({
      type: `${this.props.modelName}/${queryMethod}`,
      payload: {
        currentPage: 1,
        ...values,
      },
      queryParamName: this.props.paramName,
      dataStore: this.props.dataStore
    });
  }

  /**
   * 重置表单到初始状态
   */
  resetForm() {
    this.formRef.current?.resetFields();
  }

  /**
   * 组件更新时同步 Redux store 中的查询参数到表单
   */
  componentDidUpdate(prevProps: SearchBarProps) {
    // 当 Redux store 中的查询参数变化时,更新表单值
    if (!compare(this.props.queryParam, prevProps.queryParam)) {
      const value = this.props.queryParam;
      this.setFormValues(value);
      if (this.props.onValuesChange) {
        this.props.onValuesChange(value);
      }
    }
  }

  /**
   * 组件挂载时初始化表单值
   */
  componentDidMount(): void {
    this.setFormValues(this.props.queryParam);
  }

  render() {
    const { showAddMenu, addMenuCode, addMenuName, showDeleteMenu, deleteMenuCode, onClickAdd, onClickDelete, deleteMenuName } = this.props;
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
              {/* 优先使用 addMenuCode，其次使用 showAddMenu */}
              {(addMenuCode || showAddMenu) && (
                <div className='table_search_menu_item'>
                  {addMenuCode ? (
                    <ButtonAuth code={addMenuCode}>
                      <Button icon={<PlusOutlined />} type='primary' disabled={this.props.disabled}
                        onClick={onClickAdd}>{addMenuName}</Button>
                    </ButtonAuth>
                  ) : (
                    <Button icon={<PlusOutlined />} type='primary' disabled={this.props.disabled}
                      onClick={onClickAdd}>{addMenuName}</Button>
                  )}
                </div>
              )}
              {/* 优先使用 deleteMenuCode，其次使用 showDeleteMenu */}
              {(deleteMenuCode || showDeleteMenu) && (
                <div className='table_search_menu_item'>
                  {deleteMenuCode ? (
                    <ButtonAuth code={deleteMenuCode}>
                      <Button danger icon={<DeleteOutlined />} type='primary' disabled={this.props.disabled}
                        onClick={onClickDelete}>{deleteMenuName}</Button>
                    </ButtonAuth>
                  ) : (
                    <Button danger icon={<DeleteOutlined />} type='primary' disabled={this.props.disabled}
                      onClick={onClickDelete}>{deleteMenuName}</Button>
                  )}
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

/**
 * 将 Redux state 映射到组件 props
 * @param state - Redux 全局 state
 * @param props - 组件自身的 props
 * @returns 映射后的 props 对象
 */
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

/** 使用 Redux connect 高阶组件包装后的 SearchBar */
const NewSearchBar = connect(stateMapProps)(SearchBar);
export default NewSearchBar;
