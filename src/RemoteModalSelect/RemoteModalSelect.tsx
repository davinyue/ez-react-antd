import React from 'react';
import { Button, Modal, message } from 'antd';
import RemoteTable, { RemoteTableProp } from '../RemoteTable';
import compare from '../utils/compare';
import './index.less';

export interface RemoteModalSelectProp {
    /** 行标识 */
    primaryKey?: string;
    limit?: number;
    disabled?: boolean;
    /** 选中变更时 */
    onSubmit?: (value: Array<any>) => void,
    /** @deprecated use onSubmit instead */
    onSubment?: (value: Array<any>) => void,
    /** 选中值 */
    value?: any;
    /** 下级 */
    children?: any;
    /** 表格参数 */
    tableProp: RemoteTableProp;
}

interface RemoteModalSelectState {
    /** 临时选中key */
    selectedRowTempKeys: Array<string>;
    /** 确认选中key */
    selectedRowKeys: Array<string>;
    /** 是否展示表 */
    showTable: boolean;
}

class RemoteModalSelect extends React.Component<RemoteModalSelectProp, RemoteModalSelectState> {
    static defaultProps = {
        primaryKey: 'id',
        limit: Number.MAX_VALUE,
        disabled: false,
        queryParam: {},
        paramName: 'queryParam',
        dataStore: 'pageData'
    };

    /** 背景颜色 */
    bgc: Array<string>;

    /** 选项颜色 */
    optionColor: {
        [key: string]: string
    };

    /** 选项key和原始数据映射 */
    keyMapRow: {
        [key: string]: any
    };

    constructor(props: RemoteModalSelectProp) {
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
    noticeSelectChange(selectedRowKeys: Array<string>) {
        let selected: Array<any> = [];
        // eslint-disable-next-line no-unused-vars
        selectedRowKeys.forEach((selectedRowKey) => {
            selected.push(this.keyMapRow[selectedRowKey]);
        });
        if (this.props.onSubmit instanceof Function) {
            this.props.onSubmit(selected);
        } else if (this.props.onSubment instanceof Function) {
            this.props.onSubment(selected);
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
            selectedRowTempKeys: this.state.selectedRowTempKeys
        });
        this.noticeSelectChange(this.state.selectedRowTempKeys);
        this.setState({
            showTable: false
        });
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
        let selectedRowKeys: Array<any> = [];
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

    componentDidUpdate(prevProps: RemoteModalSelectProp) {
        let value = this.props.value;
        if (!compare(prevProps.value, value)) {
            this.handleDefafultValue();
        }
    }

    render() {
        let selectedRowKeys = this.state.selectedRowKeys;
        let selectedRowTempKeys = this.state.selectedRowTempKeys;
        let { disabled, limit } = this.props;
        return (
            <>
                <div className='davinyu_RemoteTableSelect_box'>
                    <Modal
                        title='添加选项'
                        centered
                        cancelText='取消'
                        destroyOnHidden
                        okText='确定'
                        className='davinyu_RemoteTableSelect_add_modal'
                        open={this.state.showTable}
                        width='100%'
                        style={{ height: '100%' }}
                        onOk={this.handleSelectChangeOk}
                        onCancel={() => this.setState({ showTable: false, selectedRowTempKeys: selectedRowKeys })}
                    >
                        {this.props.children}
                        <RemoteTable {...{
                            ...this.props.tableProp,
                            rowSelection: {
                                fixed: true,
                                type: limit === 1 ? 'radio' : 'checkbox',
                                selectedRowKeys: selectedRowTempKeys,
                                onSelect: this.handleSelectChange,
                                onSelectAll: this.handleSelectAllChange
                            }
                        }} />
                    </Modal>
                </div>
                {!disabled && selectedRowKeys.length < this.props.limit! && (
                    <Button type='primary' onClick={() => this.setState({ showTable: true })}>添加</Button>
                )}
            </>
        );
    }
}

export default RemoteModalSelect;
