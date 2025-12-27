import React from 'react';
import { Button, Modal, message } from 'antd';
import RemoteTable, { RemoteTableProp } from '../RemoteTable';
import compare from '../utils/compare';
import { v1 as uuidV1 } from '../utils/uuid';
import './index.less';

/**
 * 远程表格选择组件属性接口
 * 继承自 RemoteTableProp
 */
export interface RemoteTableSelectProp extends RemoteTableProp {
    /** 占位提示文本 */
    placeholder?: string,
    /** 最大可选数量，默认无限制 */
    limit?: number,
    /** 显示的属性名，如果 labelRender 被传入则该配置失效，默认 'name' */
    labelKey?: string,
    /**
     * 自定义标签渲染函数
     * @param item 数据项
     * @returns 显示文本
     */
    labelRender?: (item: any) => string,
    /** 是否显示排序按钮，默认 false */
    showSort?: boolean,
    /** 是否禁用，默认 false */
    disabled?: boolean,
    /**
     * 选中值改变事件
     * @param value 选中的数据数组
     */
    onChange?: (any: any) => void,
    /** 当前选中值 */
    value?: any
}

/**
 * 远程表格选择组件状态接口
 */
export interface RemoteTableSelectState {
    /** 是否显示选择表格模态框 */
    showTable: boolean,
    /** 临时选中的行主键数组（未确认） */
    selectedRowTempKeys: Array<any>,
    /** 已确认选中的行主键数组 */
    selectedRowKeys: Array<any>,
}

/**
 * 远程表格选择组件
 * 在模态框中显示远程表格，支持多选、排序、删除等功能
 * 选中的项以彩色标签形式显示
 * 
 * @example
 * <RemoteTableSelect 
 *   modelName="product"
 *   columns={columns}
 *   labelKey="name"
 *   limit={5}
 *   onChange={(selected) => console.log(selected)}
 * />
 */
class RemoteTableSelect extends React.Component<RemoteTableSelectProp, RemoteTableSelectState> {
    bgc: Array<string>;
    optionColor: { [key: string]: string };
    keyMapRow: { [key: string]: any };

    static defaultProps = {
        primaryKey: 'id',
        needQueryParam: false,
        paramName: 'queryParam',
        dataStore: 'pageData',
        queryMethod: 'getPageInfo',
        scrollSub: 0,
        ////////
        limit: Number.MAX_VALUE,
        labelKey: 'name',
        showSort: false,
        disabled: false
    };

    constructor(props: RemoteTableSelectProp) {
        super(props);
        this.state = {
            showTable: false,
            /** 临时变更 */
            selectedRowTempKeys: [],
            /** 确认变更 */
            selectedRowKeys: []
        };
        this.handleSelectChangeOk = this.handleSelectChangeOk.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleSelectAllChange = this.handleSelectAllChange.bind(this);
        this.handleUp = this.handleUp.bind(this);
        this.handleDown = this.handleDown.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.bgc = [
            '#e961b4',
            '#ed664b',
            '#7b6ac7',
            '#56abd1',
            '#f7af4c',
            '#fe5467',
            '#52c7bd',
            '#a479b7',
            '#cb81ce',
            '#5eabc5'
        ];
        this.optionColor = {};
        this.keyMapRow = {};
    }

    _handleChange(selected: boolean, changeRows: any[]) {
        let selectedRowTempKeys = JSON.parse(JSON.stringify(this.state.selectedRowTempKeys));
        for (let i = 0; i < changeRows.length; i++) {
            let changeRow = changeRows[i];
            let key = changeRow[this.props.primaryKey!];
            if (selected) {
                this.keyMapRow[key] = changeRow;
                let ex = false;
                for (let h = 0; h < selectedRowTempKeys.length; h++) {
                    if (selectedRowTempKeys[h] === key) {
                        ex = true;
                        break;
                    }
                }
                if (!ex) {
                    selectedRowTempKeys.push(key);
                }
            } else {
                for (let h = 0; h < selectedRowTempKeys.length; h++) {
                    if (selectedRowTempKeys[h] === key) {
                        selectedRowTempKeys.splice(h, 1);
                        break;
                    }
                }
            }
        }
        this.setState({ selectedRowTempKeys: selectedRowTempKeys });
    }

    handleSelectChange(record: any, selected: boolean) {
        this._handleChange(selected, [record]);
    }

    handleSelectAllChange(selected: boolean, _selectedRows: any[], changeRows: any[]) {
        this._handleChange(selected, changeRows);
    }

    /** 通知选择项改变 */
    noticeSelectChange(selectedRowKeys: Array<any>) {
        let selected: Array<any> = [];
        selectedRowKeys.forEach((selectedRowKey) => {
            selected.push(this.keyMapRow[selectedRowKey]);
        });
        if (this.props.onChange instanceof Function) {
            this.props.onChange(selected);
        }
    }

    /** 获取选项颜色 */
    getOptionColor(optionId: string) {
        let color = this.optionColor[optionId];
        if (!color) {
            let index = Math.ceil(Math.random() * 10) - 1;
            color = this.bgc[index];
            this.optionColor[optionId] = color;
        }
        return color;
    }

    handleSelectChangeOk() {
        if (this.state.selectedRowTempKeys.length > this.props.limit!) {
            message.error(`最多只能选择${this.props.limit}条`);
            return;
        }
        this.setState({
            selectedRowKeys: this.state.selectedRowTempKeys
        });
        this.noticeSelectChange(this.state.selectedRowTempKeys);
        this.setState({
            showTable: false
        });
    }

    handleUp(e: any) {
        let id = e.target.getAttribute('id');
        let selectedRowKeys = this.state.selectedRowKeys;
        for (let i = 0; i < selectedRowKeys.length; i++) {
            if (selectedRowKeys[i] === id) {
                let temp = selectedRowKeys[i];
                selectedRowKeys[i] = selectedRowKeys[i - 1];
                selectedRowKeys[i - 1] = temp;
                break;
            }
        }
        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRowTempKeys: selectedRowKeys
        });
        this.noticeSelectChange(selectedRowKeys);
    }

    handleDown(e: any) {
        let id = e.target.getAttribute('id');
        let selectedRowKeys = this.state.selectedRowKeys;
        for (let i = 0; i < selectedRowKeys.length; i++) {
            if (selectedRowKeys[i] === id) {
                let temp = selectedRowKeys[i];
                selectedRowKeys[i] = selectedRowKeys[i + 1];
                selectedRowKeys[i + 1] = temp;
                break;
            }
        }
        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRowTempKeys: selectedRowKeys
        });
        this.noticeSelectChange(selectedRowKeys);
    }

    handleDelete(e: any) {
        let id = e.target.getAttribute('id');
        let selectedRowKeys = this.state.selectedRowKeys;
        for (let i = 0; i < selectedRowKeys.length; i++) {
            if (selectedRowKeys[i] === id) {
                selectedRowKeys.splice(i, 1);
                break;
            }
        }
        delete this.keyMapRow[id];
        delete this.optionColor[id];
        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRowTempKeys: selectedRowKeys
        });
        this.noticeSelectChange(selectedRowKeys);
    }

    /** 处理默认值 */
    handleDefafultValue() {
        let value = this.props.value;
        if (!value || value instanceof Function) {
            value = [];
        } else if (!(value instanceof Array)) {
            value = [value];
        }
        let selectedRowKeys: Array<string> = [];
        let keyMapRow: any = {};
        for (let i = 0; i < value.length; i++) {
            let item = value[i];
            if (!item) {
                continue;
            }
            let primaryKey = item[this.props.primaryKey!];
            selectedRowKeys.push(primaryKey);
            keyMapRow[primaryKey] = item;
        }
        this.keyMapRow = keyMapRow;
        this.setState({
            selectedRowKeys: selectedRowKeys,
            selectedRowTempKeys: selectedRowKeys
        });
    }

    componentDidMount() {
        this.handleDefafultValue();
    }

    componentDidUpdate(prevProps: RemoteTableSelectProp) {
        let value = this.props.value;
        if (!compare(prevProps.value, value)) {
            this.handleDefafultValue();
        }
    }

    render() {
        let selectedRowKeys = this.state.selectedRowKeys;
        let selectedRowTempKeys = this.state.selectedRowTempKeys;
        let { showSort, disabled, limit } = this.props;
        return (
            <div className='davinyu_RemoteTableSelect_box'>
                <div className='davinyu_RemoteTableSelect_wrap'>
                    {(!selectedRowKeys || selectedRowKeys.length === 0) && (
                        <div className='davinyu_RemoteTableSelect_placeholder'>{this.props.placeholder}</div>
                    )}
                    {selectedRowKeys.map((selectedRowKey, index) => {
                        let item = this.keyMapRow[selectedRowKey];
                        let id = item[this.props.primaryKey!];
                        let color = this.getOptionColor(id);
                        let name = item[this.props.labelKey!];
                        if (this.props.labelRender instanceof Function) {
                            name = this.props.labelRender(item);
                        }
                        return (
                            <div className='lochlan_RemoteTableSelect_option'
                                key={uuidV1()}
                                style={{ backgroundColor: color }}>
                                <span className='lochlan_RemoteTableSelect_option_content'>{name}</span>
                                <span className='lochlan_RemoteTableSelect_option_action'>
                                    {
                                        (index !== 0 && selectedRowKeys.length > 1 && showSort && !disabled) && (
                                            <span
                                                onClick={this.handleUp}
                                                id={id}
                                                className='lochlan_RemoteTableSelect_option_action_item'
                                            >
                                                &#8593;
                                            </span>
                                        )
                                    }
                                    {
                                        (index !== selectedRowKeys.length - 1 && selectedRowKeys.length > 1 && showSort && !disabled) && (
                                            <span
                                                onClick={this.handleDown}
                                                id={id}
                                                className='lochlan_RemoteTableSelect_option_action_item'
                                            >
                                                &#8595;
                                            </span>
                                        )
                                    }
                                    {
                                        !disabled && (
                                            <span
                                                onClick={this.handleDelete}
                                                id={id}
                                                className='lochlan_RemoteTableSelect_option_action_item'
                                            >
                                                &times;
                                            </span>
                                        )
                                    }
                                </span>
                            </div>
                        );
                    })}
                </div>
                {!disabled && selectedRowKeys.length < this.props.limit! && (
                    <div className='davinyu_RemoteTableSelect_add_menu'>
                        <Button type='primary' onClick={() => this.setState({ showTable: true })}>添加</Button>
                    </div>
                )}
                <Modal
                    title='添加选项'
                    centered
                    className='davinyu_RemoteTableSelect_add_modal'
                    open={this.state.showTable}
                    width='100%'
                    style={{ height: '100%' }}
                    cancelText='取消'
                    okText='确定'
                    onOk={this.handleSelectChangeOk}
                    onCancel={() => this.setState({ showTable: false, selectedRowTempKeys: selectedRowKeys })}
                >
                    {this.props.children}
                    <RemoteTable columns={this.props.columns}
                        modelName={this.props.modelName}
                        queryParam={this.props.queryParam}
                        paramName={this.props.paramName}
                        dataStore={this.props.dataStore}
                        scrollSub={this.props.scrollSub}
                        rowSelection={{
                            fixed: true,
                            type: limit === 1 ? 'radio' : 'checkbox',
                            selectedRowKeys: selectedRowTempKeys,
                            onSelect: this.handleSelectChange,
                            onSelectAll: this.handleSelectAllChange
                        }} />
                </Modal>
            </div>
        );
    }
}

export default RemoteTableSelect;
