import React from 'react';
import { message } from 'antd';
import RemoteTable, { RemoteTableProp } from '../RemoteTable';
import compare from '../utils/compare';
import SearchBar from '../SearchBar';
import Drawer from '../Drawer';

/**
 * 抽屉式远程表格选择组件属性接口
 * 继承自 RemoteTableProp，添加了选择相关的配置
 */
export interface RemoteTableSelectProp extends RemoteTableProp {
  /** 最大可选数量，默认为 Number.MAX_VALUE（无限制） */
  limit?: number,
  /**
   * 选择变化回调函数
   * @param value 选中的值数组或原始数据数组（取决于 returnSourceData）
   */
  onChange?: (value: any) => void,
  /** 当前选中的值 */
  value?: any,
  /** 是否打开抽屉 */
  open?: boolean,
  /** 抽屉关闭时的回调函数 */
  onClose?: () => void;
  /** 抽屉宽度 */
  width?: number | string | undefined;
  /** 抽屉标题 */
  title?: string | undefined;
  /**
   * 搜索按钮点击回调
   * @param formValue 表单值
   * @returns 处理后的查询参数
   */
  onSearch?: (formValue: any) => any;
  /** 确认时是否返回原始数据对象，false 则返回主键值 */
  returnSourceData?: boolean
}

/**
 * 抽屉式远程表格选择组件状态接口
 */
export interface RemoteTableSelectState {
  /** 临时选中的行主键数组（未确认） */
  selectedRowTempKeys: Array<string>,
  /** 已确认选中的行主键数组 */
  selectedRowKeys: Array<any>,
}

/**
 * 抽屉式远程表格选择组件
 * 在抽屉中展示可选择的远程数据表格，支持单选/多选、搜索、分页等功能
 */
class RemoteTableSelect extends React.Component<RemoteTableSelectProp, RemoteTableSelectState> {
  /** 主键到行数据的映射表，用于快速查找完整行数据 */
  keyMapRow: { [key: string]: any };

  /** 默认属性配置 */
  static defaultProps = {
    primaryKey: 'id',
    limit: Number.MAX_VALUE,
    open: false,
    onClose: () => { },
    returnSourceData: false
  };

  constructor(props: RemoteTableSelectProp) {
    super(props);
    this.state = {
      /** 临时变更 */
      selectedRowTempKeys: [],
      /** 确认变更 */
      selectedRowKeys: []
    };
    this.handleSelectChangeOk = this.handleSelectChangeOk.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSelectAllChange = this.handleSelectAllChange.bind(this);
    this.keyMapRow = {};
  }

  /**
   * 处理选择变化的内部方法
   * @param selected 是否选中
   * @param changeRows 变化的行数据数组
   */
  _handleChange(selected: boolean, changeRows: any[]) {
    let selectedRowTempKeys = JSON.parse(JSON.stringify(this.state.selectedRowTempKeys));
    for (let i = 0; i < changeRows.length; i++) {
      let changeRow = changeRows[i];
      let key: string = changeRow[this.props.primaryKey!];
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

  /**
   * 处理单行选择变化
   * @param record 行数据
   * @param selected 是否选中
   */
  handleSelectChange(record: any, selected: boolean) {
    this._handleChange(selected, [record]);
  }

  /**
   * 处理全选/取消全选
   * @param selected 是否全选
   * @param _selectedRows 已选中的行（未使用）
   * @param changeRows 变化的行数据数组
   */
  handleSelectAllChange(selected: boolean, _selectedRows: any[], changeRows: any[]) {
    this._handleChange(selected, changeRows);
  }

  /**
   * 通知父组件选择项已变化
   * @param selectedRowKeys 选中的主键数组
   */
  noticeSelectChange(selectedRowKeys: Array<string>) {
    let selected: Array<any> = [];
    if (!this.props.returnSourceData) {
      selected = selectedRowKeys;
    } else {
      selectedRowKeys.forEach((selectedRowKey) => {
        selected.push(this.keyMapRow[selectedRowKey]);
      });
    }
    this.props.onChange?.(selected);
  }

  /**
   * 处理确认按钮点击事件
   * 验证选择数量并关闭抽屉
   */
  handleSelectChangeOk() {
    if (this.state.selectedRowTempKeys.length > this.props.limit!) {
      message.error(`最多只能选择${this.props.limit}条`);
      return;
    }
    this.setState({
      selectedRowKeys: this.state.selectedRowTempKeys
    });
    this.noticeSelectChange(this.state.selectedRowTempKeys);
    this.props.onClose?.();
  }

  /**
   * 处理默认值
   * 将 value 属性转换为内部状态
   */
  handleDefafultValue() {
    let value = this.props.value;
    if (!value || value instanceof Function) {
      value = [];
    } else if (!(value instanceof Array)) {
      value = [value];
    }
    let selectedRowKeys: Array<string> = [];
    let keyMapRow: { [key: string]: any } = {};
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
    let { limit } = this.props;
    let tableProps = { ...this.props };
    delete tableProps.children;
    return (
      <Drawer
        title={this.props.title} destroyOnHidden
        open={this.props.open}
        onClose={() => {
          this.setState({ selectedRowTempKeys: selectedRowKeys });
          if (this.props.onClose) {
            this.props.onClose();
          }
        }}
        width={this.props.width}>
        <SearchBar
          showAddMenu
          addMenuName='确认'
          modelName={this.props.modelName}
          paramName={this.props.paramName}
          queryMethod={this.props.queryMethod}
          onSearch={this.props.onSearch}
          onClickAdd={this.handleSelectChangeOk}>
          {this.props.children}
        </SearchBar>
        <RemoteTable
          {...tableProps}
          rowSelection={{
            fixed: true,
            type: limit === 1 ? 'radio' : 'checkbox',
            selectedRowKeys: selectedRowTempKeys,
            onSelect: this.handleSelectChange,
            onSelectAll: this.handleSelectAllChange
          }} />
      </Drawer>
    );
  }
}

export default RemoteTableSelect;