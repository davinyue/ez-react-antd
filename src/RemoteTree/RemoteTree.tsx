import React from 'react';
import { Tree, Tooltip, Input, Button } from 'antd';
import compare from '../utils/compare';
import mergeObj from '../utils/mergeObj';
import { ConfigContext } from '../ConfigProvider';
import { DeleteTwoTone, EditTwoTone, PlusSquareOutlined } from '@ant-design/icons';
import { v1 as uuidv1 } from '../utils/uuid';

const { Search } = Input;

export interface RemoteTreeProp {
    /** 需要参数才发起请求  */
    needQueryParam?: boolean;
    /** 数据请求接口 */
    api: string;
    /** 查询参数 */
    queryParam?: { [key: string]: any } | null;
    /** 默认参数 */
    defaultParam?: { [key: string]: any };
    /** 选项显示的字段key */
    labelKey?: string;
    /** 选中字段的值key */
    valueKey?: string;
    /** 当加载子数据时,应该返回加载参数 */
    onLoadSonData?: (node: any) => { [key: string]: any },
    /** 显示添加下级按钮 */
    showAddSon?: boolean;
    /** 显示删除按钮 */
    showDelete?: boolean;
    /** 显示编辑按钮 */
    showEdit?: boolean;
    /** 显示搜索框 */
    showSearch?: boolean;
    /** 显示添加按钮 */
    showAdd?: boolean;
    /** 当点击添加按钮时事件, 参数1是node节点, 参数2是成功回调函数 */
    onClickAddSon?: (node: any, call: (sourceData: any) => void) => void;
    /** 当点击删除按钮时事件, 参数1是node节点, 参数2是成功回调函数 */
    onClickDelete?: (node: any, call: () => void) => void;
    /** 当点击编辑按钮时事件, 参数1是node节点, 参数2是成功回调函数,回调时应携带修改节点信息 */
    onClickEdit?: (node: any, call: (newNode: any) => void) => void;
    /** 当点击添加按钮时事件, 参数1是node节点, 参数2是成功回调函数,回调时应携带新增节点信息 */
    onClickAdd?: (call: (sourceData: any) => void) => void;
    /** 回车搜索回调 */
    onSearch?: (value: any) => void;
    /** 节点选中回调 */
    onSelect?: (value: any) => void;
    /** 选中时返回原始数据 */
    returnSourceData?: boolean;
    /** 标题渲染函数, 返回react node */
    titleRender?: (value: any) => any;
    /** 新增菜单名称 */
    addMenuName?: string;
}

export interface RemoteTreeState {
    treeDatas: Array<any>;
    loading: boolean;
}

class RemoteTree extends React.Component<RemoteTreeProp, RemoteTreeState> {
    static contextType = ConfigContext;
    declare context: React.ContextType<typeof ConfigContext>;

    static defaultProps = {
        needQueryParam: false,
        labelKey: 'name',
        valueKey: 'id',
        defaultParam: {},
        showAddSon: false,
        showDelete: false,
        showSearch: false,
        showAdd: false,
        returnSourceData: false,
        addMenuName: '新增'
    };

    /** 节点key与节点数据映射 */
    keyMapNode: any = {};
    /** 节点key与上级key映射 */
    keyMapParentKey: any = {};
    /** 节点key与原始数据映射 */
    keyMapSourceData: any = {};

    constructor(props: RemoteTreeProp) {
        super(props);
        this.state = {
            treeDatas: [],
            loading: false
        };
        this.loadSonData = this.loadSonData.bind(this);
        this.handleAddSon = this.handleAddSon.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleOnSelect = this.handleOnSelect.bind(this);
        this.getTitle = this.getTitle.bind(this);
        this.createTreeDataBySourceData = this.createTreeDataBySourceData.bind(this);
    }

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

    /** 处理添加 */
    handleAddSon(event: any, node: any) {
        event.stopPropagation();
        if (this.props.onClickAddSon) {
            this.props.onClickAddSon(this.keyMapSourceData[node.key], (sourceData) => {
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

    /** 处理添加 */
    handleAdd() {
        if (this.props.onClickAdd) {
            this.props.onClickAdd((sourceData) => {
                sourceData.isLeaf = true;
                let treeData = this.createTreeDataBySourceData(sourceData);
                let treeDatas = this.state.treeDatas;
                treeDatas.unshift(treeData);
                this.keyMapNode[treeData.key] = treeData;
                this.setState({ treeDatas: [...treeDatas] });
            });
        }
    }

    /** 处理删除 */
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

    /** 处理修改 */
    handleEdit(event: any, node: any) {
        event.stopPropagation();
        if (this.props.onClickEdit) {
            this.props.onClickEdit(this.keyMapSourceData[node.key], (newNode) => {
                this.keyMapSourceData[node.key] = newNode;
                let newTreeDatas = this.state.treeDatas;
                this.setState({ treeDatas: [...newTreeDatas] });
            });
        }
    }

    /** 根据原始数据创建树节点数据 */
    createTreeDataBySourceData(sourceData: any) {
        let treeData: any = {
            title: sourceData[this.props.labelKey!],
            key: uuidv1(),
            isLeaf: sourceData.isLeaf
        };
        this.keyMapSourceData[treeData.key] = sourceData;
        return treeData;
    }

    /** 加载第一次数据 */
    async loadFirstData() {
        this.keyMapNode = {};
        this.keyMapParentKey = {};
        this.keyMapSourceData = {};
        let { api, needQueryParam, queryParam } = this.props;
        const { request, isSuccess, getData } = this.context;

        if (!(!api || (needQueryParam && !queryParam))) {
            this.setState({
                loading: true
            });
            if (!queryParam) {
                queryParam = {};
            }
            let newParam = mergeObj({}, queryParam);
            newParam = mergeObj(newParam, this.props.defaultParam!);

            if (request && isSuccess && getData) {
                try {
                    let response = await request(api, newParam);
                    if (isSuccess(response)) {
                        let treeDatas: Array<any> = [];
                        const dataList = getData(response);
                        if (dataList) {
                            for (let i = 0; i < dataList.length; i++) {
                                let element = dataList[i];
                                let option = this.createTreeDataBySourceData(element);
                                treeDatas.push(option);
                                this.keyMapNode[option.key] = option;
                            }
                        }
                        this.setState({ treeDatas: treeDatas });
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    /** 加载子层数据 */
    async loadSonData(node: any) {
        const { request, isSuccess, getData } = this.context;
        let sonQueryParam: any = {
            parentId: this.keyMapSourceData[node.key][this.props.valueKey!]
        };
        sonQueryParam = mergeObj(sonQueryParam, this.props.defaultParam!);
        if (this.props.onLoadSonData instanceof Function) {
            sonQueryParam = this.props.onLoadSonData(node);
        }

        if (request && isSuccess && getData) {
            try {
                let response = await request(this.props.api, sonQueryParam);
                if (isSuccess(response)) {
                    //子项目
                    let sonOptions: Array<any> = [];
                    const dataList = getData(response);
                    if (dataList) {
                        dataList.forEach((element: any) => {
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
    }

    async componentDidUpdate(prevProps: RemoteTreeProp) {
        if (!compare(prevProps.queryParam, this.props.queryParam) || !compare(prevProps.api, this.props.api)) {
            this.setState({ treeDatas: [] });
            await this.loadFirstData();
        }
    }

    /** 处理搜索 */
    handleSearch(value: any) {
        if (this.props.onSearch) {
            this.props.onSearch(value);
        }
    }

    /** 获取title, 返回react node */
    getTitle(node: any) {
        if (this.props.titleRender) {
            return this.props.titleRender(this.keyMapSourceData[node.key]);
        } else {
            return (<>{node.title}</>);
        }
    }

    render() {
        let showTopMenu = this.props.showAdd || this.props.showSearch;
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
                        {this.props.showAdd ? (
                            <div className='remote_tree_top_add'>
                                <Button type='primary' block onClick={this.handleAdd}>
                                    {this.props.addMenuName}
                                </Button>
                            </div>
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
                                    this.props.showAddSon ? (
                                        <div className='remote_tree_menu_add'>
                                            <Tooltip placement='top' title='添加子级'>
                                                <PlusSquareOutlined onClick={(event) => this.handleAddSon(event, node)} style={{ cursor: 'pointer', fontSize: '16px', color: '#1890ff' }} />
                                            </Tooltip>
                                        </div>)
                                        :
                                        (<></>)
                                }
                                {
                                    this.props.showEdit ? (
                                        <div className='remote_tree_menu_edit'>
                                            <Tooltip placement='top' title='修改'>
                                                <EditTwoTone
                                                    className='action_edit'
                                                    onClick={(event) => this.handleEdit(event, node)} />
                                            </Tooltip>
                                        </div>)
                                        :
                                        (<></>)
                                }
                                {
                                    this.props.showDelete ? (
                                        <div className='remote_tree_menu_delete'>
                                            <Tooltip placement='top' title='删除'>
                                                <DeleteTwoTone className='action_delete' twoToneColor='#ff0000'
                                                    onClick={(event) => this.handleDelete(event, node)} />
                                            </Tooltip>
                                        </div>)
                                        :
                                        (<></>)
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
