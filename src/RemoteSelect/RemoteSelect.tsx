import React from 'react';
import { Select } from 'antd';
import compare from '../utils/compare';
import { ConfigContext, EzAntdConfig } from '../ConfigProvider';

/**
 * 远程下拉选择组件属性接口
 */
export interface RemoteSelectProp {
  /** 数据请求接口 URL */
  api: string;
  /** 选项显示的字段名，默认 'name' */
  labelKey?: string;
  /** 选中值的字段名，默认 'id' */
  valueKey?: string;
  /** 查询参数对象 */
  queryParam?: {
    [key: string]: any;
  };
  /** 是否需要查询参数才发起请求，默认 false */
  needQueryParam?: boolean;
  /** 无选中数据时的提示文本，默认 '请选择' */
  placeholder?: string;
  /** 是否支持清除选择，默认 true */
  allowClear?: boolean;
  /** 是否展示搜索功能，默认 true */
  showSearch?: boolean;
  /** 搜索过滤属性，默认 'label' */
  optionFilterProp?: string;
  /** 是否默认选中第一个选项，默认 false */
  selectedFirst?: boolean;
  /**
   * 选中值改变事件
   * @param value 选中的值或原始数据（当 metaDataInValue 为 true 时）
   */
  onChange?: (value: any) => void;
  /** 是否在值中返回原始数据，默认 false */
  metaDataInValue?: boolean;
  /**
   * 加载状态改变事件
   * @param isLoading 是否正在加载
   */
  onLoadingChange?: (isLoading: boolean) => void;
  /** 默认选中值 */
  defaultValue?: any;
  /** 当前选中值（受控模式） */
  value?: any;
  /** 自定义样式 */
  style?: React.CSSProperties | undefined;
  /**
   * 搜索时的回调
   * @param value 搜索关键词
   */
  onSearch?: (value: string) => void;
  /** 选择模式：多选或标签 */
  mode?: 'multiple' | 'tags' | undefined;
  /** 是否禁用，默认 false */
  disabled?: boolean | undefined;
}

/**
 * 远程下拉选择组件状态接口
 */
export interface RemoteSelectState {
  /** 选项列表 */
  options: Array<any>;
  /** 是否正在加载 */
  loading: boolean;
  /** 值是否已改变 */
  valueIsChange: boolean;
  /** 默认值 */
  defaultValue?: any;
}

/**
 * 远程下拉选择组件
 * 从远程 API 加载选项数据的下拉选择框
 * 支持搜索、多选、动态加载等功能
 * 
 * @example
 * // 基本用法
 * <RemoteSelect 
 *   api="/api/users"
 *   labelKey="name"
 *   valueKey="id"
 *   onChange={(value) => console.log(value)}
 * />
 * 
 * // 带查询参数
 * <RemoteSelect 
 *   api="/api/departments"
 *   queryParam={{ companyId: 1 }}
 *   placeholder="选择部门"
 * />
 * 
 * // 返回原始数据
 * <RemoteSelect 
 *   api="/api/products"
 *   metaDataInValue
 *   onChange={(data) => console.log(data)}
 * />
 */
class RemoteSelect extends React.Component<RemoteSelectProp, RemoteSelectState> {
  static contextType = ConfigContext;
  declare context: EzAntdConfig;

  static defaultProps = {
    labelKey: 'name',
    valueKey: 'id',
    needQueryParam: false,
    placeholder: '请选择',
    allowClear: true,
    showSearch: true,
    optionFilterProp: 'label',
    selectedFirst: false,
    metaDataInValue: false,
    disabled: false,
  };

  constructor(props: RemoteSelectProp) {
    super(props);
    this.state = {
      options: [],
      loading: false,
      valueIsChange: false,
    };
    this.onChange = this.onChange.bind(this);
  }

  /** 值与原始数据的映射 */
  keyMapMetaDatas: Record<string, any> = {};

  componentDidMount() {
    this.loadSelectOptions(this.props.queryParam);
  }

  componentDidUpdate(prevProps: RemoteSelectProp) {
    if (!compare(prevProps.queryParam, this.props.queryParam)) {
      this.loadSelectOptions(this.props.queryParam);
    }
  }

  /**
   * 加载下拉选项数据
   * @param queryParam 查询参数
   */
  async loadSelectOptions(queryParam?: any) {
    let { api, needQueryParam } = this.props;
    if (!queryParam && needQueryParam) {
      return;
    }
    if (api) {
      this.setState({
        loading: true,
      });
      if (this.props.onLoadingChange instanceof Function) {
        this.props.onLoadingChange(true);
      }

      try {
        const { request, responseIsSuccess } = this.context;
        if (!request) {
          console.error('RemoteSelect: request method not provided in ConfigProvider');
          return;
        }

        let response = await request.getRequest(api, queryParam);

        if (responseIsSuccess && responseIsSuccess(response)) {
          this.keyMapMetaDatas = {};
          let metaDatas = response?.data?.data;

          if (metaDatas instanceof Array) {
            let options: Array<any> = [];
            for (let i = 0; i < metaDatas.length; i++) {
              let metaData = metaDatas[i];
              options.push({
                label: metaData[this.props.labelKey!],
                value: metaData[this.props.valueKey!],
              });
              this.keyMapMetaDatas[metaData[this.props.valueKey!]] = metaData;
            }
            this.setState({
              options: options,
            });
            if (this.props.selectedFirst && this.props.onChange && options.length > 0) {
              this.props.onChange(options[0].value);
            }
          }
        }
      } catch (e) {
        console.error('RemoteSelect load error:', e);
      } finally {
        this.setState({
          loading: false,
        });
        if (this.props.onLoadingChange instanceof Function) {
          this.props.onLoadingChange(false);
        }
      }
    }
  }

  /**
   * 处理选中值改变
   * @param value 选中的值
   */
  onChange(value: any) {
    this.setState({ defaultValue: value, valueIsChange: true });
    if (this.props.onChange) {
      if (this.props.metaDataInValue) {
        let metaData = this.keyMapMetaDatas[value];
        this.props.onChange(metaData);
      } else {
        this.props.onChange(value);
      }
    }
  }

  render() {
    let { selectedFirst, defaultValue, value } = this.props;
    let { options, valueIsChange } = this.state;
    if (!defaultValue && selectedFirst && options && options.length > 0) {
      defaultValue = options[0].value;
    }
    if (!value && selectedFirst && options && options.length > 0 && !valueIsChange) {
      value = options[0].value;
    }
    if (value && value instanceof Object && this.props.metaDataInValue) {
      value = value[this.props.valueKey!];
    }
    return (
      <Select
        allowClear={this.props.allowClear}
        style={this.props.style}
        options={this.state.options}
        loading={this.state.loading}
        showSearch={this.props.showSearch}
        onSearch={this.props.onSearch}
        onChange={this.onChange}
        optionFilterProp={this.props.optionFilterProp}
        placeholder={this.props.placeholder}
        mode={this.props.mode}
        value={value}
        defaultValue={defaultValue}
        disabled={this.props.disabled}
      />
    );
  }
}

export default RemoteSelect;
