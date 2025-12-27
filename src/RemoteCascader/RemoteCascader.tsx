import React from 'react';
import { Cascader, Input } from 'antd';
import compare from '../utils/compare';
import { ConfigContext } from '../ConfigProvider';

/**
 * 远程级联选择组件属性接口
 */
export interface RemoteCascaderProp {
  /** 是否需要查询参数才发起请求，默认 false */
  needQueryParam?: boolean;
  /** 数据请求接口 URL */
  api: string;
  /** 查询参数 */
  queryParam?: { [key: string]: any };
  /** 默认查询参数，会合并到每次请求中 */
  defaultParam?: { [key: string]: any };
  /** 选项显示的字段名，默认 'name' */
  labelKey?: string;
  /** 选中值的字段名，默认 'id' */
  valueKey?: string;
  /** 禁用的值 */
  disabledValue?: string;
  /**
   * 加载子节点数据时的参数构造函数
   * @param selectOption 当前选中的选项
   * @returns 请求参数对象
   */
  onLoadSonData?: (selectOption: any) => { [key: string]: any },
  /** 初始化选中值 */
  initValue?: any,
  /** 当前选中值（受控模式） */
  value?: any;
  /** 占位提示 */
  placeholder?: React.ReactNode;
  /** 是否允许清除 */
  allowClear?: boolean;
  /**
   * 选中值改变事件
   * @param value 选中的值数组
   */
  onChange?: (value: any) => void
}

/**
 * 远程级联选择组件状态接口
 */
export interface RemoteCascaderState {
  /** 级联选项数据 */
  options: Array<any>;
  /** 是否正在初始化 */
  inited: boolean;
}

/**
 * 远程级联选择组件
 * 从远程 API 加载级联数据，支持动态加载子节点
 * 适用于地区选择、部门选择等层级结构数据
 * 
 * @example
 * // 基本用法
 * <RemoteCascader 
 *   api="/api/regions"
 *   labelKey="name"
 *   valueKey="code"
 *   onChange={(values) => console.log(values)}
 * />
 * 
 * // 带初始值
 * <RemoteCascader 
 *   api="/api/departments"
 *   initValue={['dept1', 'dept2']}
 *   onLoadSonData={(option) => ({ parentId: option.value })}
 * />
 */
class RemoteCascader extends React.Component<RemoteCascaderProp, RemoteCascaderState> {
  static contextType = ConfigContext;
  declare context: React.ContextType<typeof ConfigContext>;

  /** 选中值映射原始数据 */
  valueMapMetaDate: { [key: string]: any };

  constructor(props: RemoteCascaderProp) {
    super(props);
    this.state = {
      options: [],
      inited: false
    };
    this.loadSonData = this.loadSonData.bind(this);
    this.valueMapMetaDate = {};
  }

  static defaultProps = {
    needQueryParam: false,
    labelKey: 'name',
    valueKey: 'id',
    disabledValue: ''
  };

  async _loadDefaultData(initValue: any, parentOption: any, index: number) {
    const { request, responseIsSuccess } = this.context;
    if (!request || !responseIsSuccess) return;

    if (index <= initValue.length) {
      let pram: any = {
        parentId: parentOption.value
      };
      if (this.props.defaultParam) {
        pram = { ...this.props.defaultParam, ...pram };
      }

      try {
        let response = await request.getRequest(this.props.api, pram);
        if (responseIsSuccess(response)) {
          let sonOptionMetaDatas = response?.data?.data;
          let sonOptions: Array<any> = [];
          for (let i = 0; i < sonOptionMetaDatas.length; i++) {
            let sonOptionMetaData = sonOptionMetaDatas[i];
            let sonOption = {
              label: sonOptionMetaData[this.props.labelKey!],
              value: sonOptionMetaData[this.props.valueKey!],
              isLeaf: sonOptionMetaData.isLeaf,
              disabled: sonOptionMetaData[this.props.valueKey!] === this.props.disabledValue,
              children: undefined // 重要: 初始化children undefined以支持动态加载
            };
            if (!sonOption.isLeaf) {
              // 如果不是叶子节点，保持 children undefined 或空数组? 
              // Antd Cascader loadData 依赖 isLeaf=false
            }

            if (sonOption.value === initValue[index]) {
              await this._loadDefaultData(initValue, sonOption, 1 + index);
            }
            sonOptions.push(sonOption);
          }
          parentOption.children = sonOptions;
          parentOption.loading = false;
        }
      } catch (e) {
        console.error(e);
        parentOption.loading = false;
      }
    }
  }

  async loadFirstData() {
    let { api, needQueryParam, queryParam, initValue } = this.props;
    const { request, responseIsSuccess } = this.context;

    if (initValue && !(initValue instanceof Array)) {
      initValue = [initValue];
    }
    if (!(!api || (needQueryParam && !queryParam))) {
      this.setState({
        inited: true
      });
      this.valueMapMetaDate = {};
      if (!queryParam) {
        queryParam = {};
      }
      if (this.props.defaultParam) {
        queryParam = { ...this.props.defaultParam, ...queryParam };
      }

      if (request && responseIsSuccess) {
        try {
          let response = await request.getRequest(api, queryParam);
          if (responseIsSuccess(response)) {
            let options: Array<any> = [];
            const dataList = response?.data?.data;
            for (let i = 0; i < dataList.length; i++) {
              let element = dataList[i];
              let option = {
                label: element[this.props.labelKey!],
                value: element[this.props.valueKey!],
                isLeaf: element.isLeaf,
                disabled: element[this.props.valueKey!] === this.props.disabledValue
              };
              options.push(option);
              if (initValue) {
                if (option.value === initValue[0]) {
                  await this._loadDefaultData(initValue, option, 1);
                }
              }
              this.valueMapMetaDate[element[this.props.valueKey!]] = element;
            }
            this.setState({ options: options });
          }
        } catch (e) {
          console.error(e);
        }
      }

      this.setState({
        inited: false
      });
    }
  }

  async loadSonData(selectedOptions: any[]) {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const { request, responseIsSuccess } = this.context;
    if (!request || !responseIsSuccess) {
      targetOption.loading = false;
      return;
    }

    let sonQueryParam: { [key: string]: any } = {
      parentId: targetOption.value
    };
    if (this.props.onLoadSonData instanceof Function) {
      sonQueryParam = this.props.onLoadSonData(targetOption);
    }
    if (this.props.defaultParam) {
      sonQueryParam = { ...this.props.defaultParam, ...sonQueryParam };
    }

    try {
      let response = await request.getRequest(this.props.api, sonQueryParam);
      if (responseIsSuccess(response)) {
        let sonOptions: Array<any> = [];
        const dataList = response?.data?.data;
        dataList.forEach((element: any) => {
          sonOptions.push({
            label: element[this.props.labelKey!],
            value: element[this.props.valueKey!],
            isLeaf: element.isLeaf,
            disabled: element[this.props.valueKey!] === this.props.disabledValue
          });
          this.valueMapMetaDate[element[this.props.valueKey!]] = element;
        });
        targetOption.children = sonOptions;
        targetOption.loading = false;
        let newOptions = this.state.options;
        this.setState({ options: [...newOptions] });
      }
    } catch (e) {
      console.error(e);
      targetOption.loading = false;
    }
  }

  componentDidMount() {
    this.loadFirstData();
  }

  async componentDidUpdate(prevProps: RemoteCascaderProp) {
    if (!compare(prevProps.queryParam, this.props.queryParam) || !compare(prevProps.api, this.props.api)) {
      await this.loadFirstData();
    }
  }

  render() {
    let value = this.props.value;
    if (value && !(value instanceof Array)) {
      value = [value];
    }
    if (this.state.inited) {
      return (<Input disabled />);
    } else {
      return (
        <Cascader options={this.state.options}
          placeholder={this.props.placeholder as string}
          onChange={this.props.onChange}
          value={value}
          changeOnSelect
          allowClear={this.props.allowClear}
          loadData={this.loadSonData} />
      );
    }
  }
}

export default RemoteCascader;
