import React from 'react';
import { Tree, Tooltip, Input } from 'antd';
import compare from '../utils/compare';
import mergeObj from '../utils/mergeObj';
import { DeleteOutlined, EditOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { v1 as uuidv1 } from '../utils/uuid';
import { ConfigContext, EzAntdConfig } from '../ConfigProvider';
import ButtonAuth from '../ButtonAuth';
import './index.less';

const { Search } = Input;

/**
 * RemoteTree 组件属性接口
 * 用于配置远程数据树形组件的行为和交互
 */
export interface RemoteTreeProp {
  // ==================== 数据请求配置 ====================
  /** API 接口地址，用于获取树形数据 */
  api: string;
  /** 是否需要查询参数才发起请求，默认 false */
  needQueryParam?: boolean;
  /** 查询参数对象，传递给 API 请求 */
  queryParam?: { [key: string]: any } | null;
  /** 默认参数，会与 queryParam 合并后发送 */
  defaultParam?: { [key: string]: any };

  // ==================== 数据字段映射 ====================
  /** 节点标签字段名，默认 'name' */
  labelKey?: string;
  /** 节点值字段名，默认 'id' */
  valueKey?: string;

  // ==================== UI 显示控制 ====================
  /** 是否显示顶部搜索框 */
  showSearch?: boolean;
  /** 是否显示节点的添加子级按钮（主开关，为 true 时才渲染按钮） */
  showAddSon?: boolean;
  /** 添加子级按钮权限编码（可选，有值时使用 ButtonAuth 进行权限验证） */
  addSonMenuCode?: string;
  /** 是否显示节点的编辑按钮（主开关，为 true 时才渲染按钮） */
  showEdit?: boolean;
  /** 编辑按钮权限编码（可选，有值时使用 ButtonAuth 进行权限验证） */
  editMenuCode?: string;
  /** 是否显示节点的删除按钮（主开关，为 true 时才渲染按钮） */
  showDelete?: boolean;
  /** 删除按钮权限编码（可选，有值时使用 ButtonAuth 进行权限验证） */
  deleteMenuCode?: string;

  // ==================== 事件回调 ====================
  /**
   * 组件就绪事件
   * 在组件挂载后调用,传递刷新方法供外部使用
   * @param refresh 刷新树数据的方法
   */
  onReady?: (refresh: () => Promise<void>) => void;
  /**
   * 加载子节点数据时的参数生成函数
   * @param node 当前节点数据
   * @returns 返回请求子节点数据的参数对象
   */
  onLoadSonData?: (node: any) => { [key: string]: any };
  /**
   * 节点选中事件回调
   * @param value 选中的节点值或原始数据（取决于 returnSourceData）
   */
  onSelect?: (value: any) => void;
  /**
   * 搜索框回车事件回调
   * @param value 搜索关键字
   */
  onSearch?: (value: any) => void;
  /**
   * 点击节点添加子级按钮事件
   * @param node 当前节点的原始数据
   * @param callback 成功回调函数，调用时传入新增的子节点数据
   */
  onClickAddSon?: (node: any, callback: (sourceData: any) => void) => void;
  /**
   * 点击节点编辑按钮事件
   * @param node 当前节点的原始数据
   * @param callback 成功回调函数，调用时传入更新后的节点数据
   */
  onClickEdit?: (node: any, callback: (newNode: any) => void) => void;
  /**
   * 点击节点删除按钮事件
   * @param node 当前节点的原始数据
   * @param callback 成功回调函数，删除成功后调用
   */
  onClickDelete?: (node: any, callback: () => void) => void;

  // ==================== 其他配置 ====================
  /** 选中节点时是否返回原始数据，false 则返回 valueKey 对应的值 */
  returnSourceData?: boolean;
  /**
   * 自定义节点标题渲染函数
   * @param value 节点的原始数据
   * @returns React 节点
   */
  titleRender?: (value: any) => any;
}

/**
 * RemoteTree 组件状态接口
 */
export interface RemoteTreeState {
  /** 树形数据数组 */
  treeDatas: Array<any>;
  /** 数据加载状态 */
  loading: boolean;
}

/**
 * 远程数据树形组件
 * 支持异步加载数据、节点增删改、搜索等功能
 */
class RemoteTree extends React.Component<RemoteTreeProp, RemoteTreeState> {
  /** 默认属性配置 */
  static defaultProps = {
    needQueryParam: false,
    labelKey: 'name',
    valueKey: 'id',
    defaultParam: {},
    showAddSon: false,
    showDelete: false,
    showSearch: false,
    returnSourceData: false
  };
  static contextType = ConfigContext;
  declare context: EzAntdConfig;

  constructor(props: RemoteTreeProp) {
    super(props);
    this.state = {
      treeDatas: [],
      loading: false
    };
    this.loadSonData = this.loadSonData.bind(this);
    this.handleAddSon = this.handleAddSon.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.createTreeDataBySourceData = this.createTreeDataBySourceData.bind(this);
  }
  // ==================== 内部映射表 ====================
  /** 节点 key 到树节点对象的映射，用于快速查找节点 */
  keyMapNode: { [key: string]: any } = {};
  /** 节点 key 到父节点 key 的映射，用于维护父子关系 */
  keyMapParentKey: { [key: string]: string } = {};
  /** 节点 key 到原始数据的映射，用于事件回调时获取完整数据 */
  keyMapSourceData: { [key: string]: any } = {};

  /**
   * 处理节点选中事件
   * @param keys 选中的节点 key 数组
   */
  handleOnSelect(keys: any[]) {
    let ret: Array<any> = [];
    keys.forEach(key => {
      let sourceData = this.keyMapSourceData[key];
      let returnData = sourceData[this.props.valueKey!];
      if (this.props.returnSourceData) {
        ret.push(sourceData);
      } else {
        ret.push(returnData);
      }
    });
    if (this.props.onSelect) {
      if (ret.length === 0) {
        this.props.onSelect(null);
      } else if (ret.length === 1) {
        this.props.onSelect(ret[0]);
      } else {
        this.props.onSelect(ret);
      }
    }
  }

  /**
   * 处理添加子节点事件
   * @param event 点击事件对象
   * @param node 当前节点对象
   */
  handleAddSon(event: any, node: any) {
    event.stopPropagation();
    if (this.props.onClickAddSon) {
      this.props.onClickAddSon(this.keyMapSourceData[node.key], (sourceData: any) => {
        node.isLeaf = false;
        sourceData.isLeaf = true;
        let treeData = this.createTreeDataBySourceData(sourceData);
        if (!node.children) {
          node.children = [];
        }
        node.children.unshift(treeData);
        let treeDatas = this.state.treeDatas;
        this.keyMapNode[treeData.key] = treeData;
        this.keyMapParentKey[treeData.key] = node.key;
        this.setState({ treeDatas: [...treeDatas] });
      });
    }
  }

  /**
   * 处理删除节点事件
   * @param event 点击事件对象
   * @param node 当前节点对象
   */
  handleDelete(event: any, node: any) {
    event.stopPropagation();
    if (this.props.onClickDelete) {
      this.props.onClickDelete(this.keyMapSourceData[node.key], () => {
        let parentKey = this.keyMapParentKey[node.key];
        let parentNode = this.keyMapNode[parentKey];
        let rootArray = this.state.treeDatas;
        if (parentNode) {
          rootArray = parentNode.children;
        }
        for (let i = 0; i < rootArray.length; i++) {
          if (rootArray[i].key === node.key) {
            rootArray.splice(i, 1);
            break;
          }
        }
        if (rootArray.length == 0) {
          if (parentNode) {
            parentNode.isLeaf = true;
            delete parentNode.children;
          }
        }
        let newTreeDatas = this.state.treeDatas;
        this.setState({ treeDatas: [...newTreeDatas] });
      });
    }
  }

  /**
   * 处理编辑节点事件
   * @param event 点击事件对象
   * @param node 当前节点对象
   */
  handleEdit(event: any, node: any) {
    event.stopPropagation();
    if (this.props.onClickEdit) {
      this.props.onClickEdit(this.keyMapSourceData[node.key], (newNode: any) => {
        this.keyMapSourceData[node.key] = newNode;
        let newTreeDatas = this.state.treeDatas;
        this.setState({ treeDatas: [...newTreeDatas] });
      });
    }
  }

  /**
   * 根据原始数据创建树节点对象
   * @param sourceData 原始数据对象
   * @returns 树节点对象，包含 title、key、isLeaf 等属性
   */
  createTreeDataBySourceData(sourceData: any) {
    let treeData = {
      title: sourceData[this.props.labelKey!],
      key: uuidv1(),
      isLeaf: sourceData.isLeaf
    };
    this.keyMapSourceData[treeData.key] = sourceData;
    return treeData;
  }

  /**
   * 加载根级别的树形数据
   * 在组件挂载和查询参数变化时调用
   */
  async loadFirstData() {
    const { request, responseIsSuccess } = this.context;
    this.keyMapNode = {};
    this.keyMapParentKey = {};
    this.keyMapSourceData = {};
    let { api, needQueryParam, queryParam } = this.props;
    if (!(!api || (needQueryParam && !queryParam))) {
      this.setState({
        loading: true
      });
      if (!queryParam) {
        queryParam = {};
      }
      let newParam = mergeObj({}, queryParam);
      newParam = mergeObj(newParam, this.props.defaultParam!);
      let response = await request!.getRequest(api, newParam);
      if (responseIsSuccess!(response)) {
        let treeDatas: Array<any> = [];
        if (response.data && response.data.data) {
          for (let i = 0; i < response.data.data.length; i++) {
            let element = response.data.data[i];
            let option = this.createTreeDataBySourceData(element);
            treeDatas.push(option);
            this.keyMapNode[option.key] = option;
          }
        }
        this.setState({ treeDatas: treeDatas });
      }
    }
  }

  /**
   * 异步加载子节点数据
   * 当展开树节点时触发
   * @param node 当前展开的节点对象
   */
  async loadSonData(node: any) {
    const { request, responseIsSuccess } = this.context;
    let sonQueryParam: any = {
      parentId: this.keyMapSourceData[node.key][this.props.valueKey!]
    };
    sonQueryParam = mergeObj(sonQueryParam, this.props.defaultParam!);
    if (this.props.onLoadSonData instanceof Function) {
      sonQueryParam = this.props.onLoadSonData(node);
    }
    if (request && responseIsSuccess) {
      try {
        let response = await request.getRequest(this.props.api, sonQueryParam);
        if (responseIsSuccess(response)) {
          //子项目
          let sonOptions: Array<any> = [];
          if (response.data && response.data.data) {
            response.data.data.forEach((element: any) => {
              let option = this.createTreeDataBySourceData(element);
              sonOptions.push(option);
              this.keyMapNode[option.key] = option;
              node.isLeaf = false;
              this.keyMapParentKey[option.key] = node.key;
            });
          }
          node.children = sonOptions;
          //如果子项目长度为0, 则当级设置为子级
          if (sonOptions.length == 0) {
            node.isLeaf = true;
            delete node.children;
          }
          node.loading = false;
          let nodeMeta = this.keyMapNode[node.key];
          nodeMeta.children = node.children;
          let newTreeDatas = this.state.treeDatas;
          this.setState({ treeDatas: [...newTreeDatas] });
        }
      } catch (e) {
        console.error(e);
        node.loading = false;
      }
    } else {
      node.loading = false;
    }
  }

  componentDidMount() {
    this.loadFirstData();
    // 组件挂载后,将刷新方法传递给外部
    if (this.props.onReady) {
      this.props.onReady(this.loadFirstData.bind(this));
    }
  }

  async componentDidUpdate(prevProps: RemoteTreeProp) {
    if (!compare(prevProps.queryParam, this.props.queryParam) || !compare(prevProps.api, this.props.api)) {
      this.setState({ treeDatas: [] });
      await this.loadFirstData();
    }
  }

  /**
   * 处理搜索框回车事件
   * @param value 搜索关键字
   */
  handleSearch(value: any) {
    if (this.props.onSearch) {
      this.props.onSearch(value);
    }
  }

  /**
   * 获取节点标题
   * 支持自定义渲染函数
   * @param node 节点对象
   * @returns React 节点
   */
  getTitle(node: any) {
    if (this.props.titleRender) {
      return this.props.titleRender(this.keyMapSourceData[node.key]);
    } else {
      return (<>{node.title}</>);
    }
  }

  render() {
    let showTopMenu = this.props.showSearch;
    return (
      <>
        {showTopMenu ? (
          <div className='remote_tree_top_menu_box'>
            {this.props.showSearch ? (
              <Search
                className='remote_tree_top_search'
                placeholder='输入关键字回车搜索'
                allowClear
                size='middle'
                onSearch={this.handleSearch}
              />
            ) : (<></>)}
          </div>
        ) : (<></>)}
        <Tree
          treeData={this.state.treeDatas}
          showLine
          onSelect={this.handleOnSelect}
          loadData={this.loadSonData}
          className='remote_tree_box'
          titleRender={(node) => {
            return (
              <div className='remote_tree_title_box'>
                <div className='remote_tree_title'>
                  {this.getTitle(node)}
                </div>
                {
                  /* 当 showAddSon 为 true 时才渲染添加子级按钮，如果 addSonMenuCode 有值则使用 ButtonAuth 嵌套 */
                  this.props.showAddSon ? (
                    <div className='remote_tree_menu_add'>
                      {this.props.addSonMenuCode ? (
                        <ButtonAuth code={this.props.addSonMenuCode}>
                          <Tooltip placement='top' title='添加子级'>
                            <PlusSquareOutlined
                              className='tree-icon tree-icon-add'
                              onClick={(event) => this.handleAddSon(event, node)}
                            />
                          </Tooltip>
                        </ButtonAuth>
                      ) : (
                        <Tooltip placement='top' title='添加子级'>
                          <PlusSquareOutlined
                            className='tree-icon tree-icon-add'
                            onClick={(event) => this.handleAddSon(event, node)}
                          />
                        </Tooltip>
                      )}
                    </div>)
                    :
                    null
                }
                {
                  /* 当 showEdit 为 true 时才渲染编辑按钮，如果 editMenuCode 有值则使用 ButtonAuth 嵌套 */
                  this.props.showEdit ? (
                    <div className='remote_tree_menu_edit'>
                      {this.props.editMenuCode ? (
                        <ButtonAuth code={this.props.editMenuCode}>
                          <Tooltip placement='top' title='修改'>
                            <EditOutlined
                              className='tree-icon tree-icon-edit'
                              onClick={(event) => this.handleEdit(event, node)} />
                          </Tooltip>
                        </ButtonAuth>
                      ) : (
                        <Tooltip placement='top' title='修改'>
                          <EditOutlined
                            className='tree-icon tree-icon-edit'
                            onClick={(event) => this.handleEdit(event, node)} />
                        </Tooltip>
                      )}
                    </div>)
                    :
                    null
                }
                {
                  /* 当 showDelete 为 true 时才渲染删除按钮，如果 deleteMenuCode 有值则使用 ButtonAuth 嵌套 */
                  this.props.showDelete ? (
                    <div className='remote_tree_menu_delete'>
                      {this.props.deleteMenuCode ? (
                        <ButtonAuth code={this.props.deleteMenuCode}>
                          <Tooltip placement='top' title='删除'>
                            <DeleteOutlined
                              className='tree-icon tree-icon-delete'
                              onClick={(event) => this.handleDelete(event, node)} />
                          </Tooltip>
                        </ButtonAuth>
                      ) : (
                        <Tooltip placement='top' title='删除'>
                          <DeleteOutlined
                            className='tree-icon tree-icon-delete'
                            onClick={(event) => this.handleDelete(event, node)} />
                        </Tooltip>
                      )}
                    </div>)
                    :
                    null
                }
              </div>
            );
          }}
        />
      </>
    );
  }
}

export default RemoteTree;