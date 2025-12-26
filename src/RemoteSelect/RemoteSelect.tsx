import React from 'react';
import { Select } from 'antd';
import compare from '../utils/compare';
import { ConfigContext, EzAntdConfig } from '../ConfigProvider';

export interface RemoteSelectProp {
    /** 数据请求接口 */
    api: string;
    /** 选项显示的字段key */
    labelKey?: string;
    /** 选中字段的值key */
    valueKey?: string;
    /** 查询参数 */
    queryParam?: {
        [key: string]: any;
    };
    /** 需要参数才发起请求 */
    needQueryParam?: boolean;
    /** 无选中数据时展示什么 */
    placeholder?: string;
    /** 是否支持清除选择 */
    allowClear?: boolean;
    /** 是否展示搜索 */
    showSearch?: boolean;
    /** 搜索属性 */
    optionFilterProp?: string;
    /** 默认选中第一个 */
    selectedFirst?: boolean;
    /** 修改事件 */
    onChange?: (value: any) => void;
    /** 原始数据在值里面返回 */
    metaDataInValue?: boolean;
    /** loading 改变事件 */
    onLoadingChange?: (isLoading: boolean) => void;
    /** 默认值 */
    defaultValue?: any;
    /** 值 */
    value?: any;
    /** 样式 */
    style?: React.CSSProperties | undefined;
    /** 当搜索时 */
    onSearch?: (value: string) => void;
    /** 选择模式 */
    mode?: 'multiple' | 'tags' | undefined;
    /** 是否禁用 */
    disabled?: boolean | undefined;
}

export interface RemoteSelectState {
    options: Array<any>;
    loading: boolean;
    valueIsChange: boolean;
    /** 默认值 */
    defaultValue?: any;
}

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
                const { request, isSuccess, getData } = this.context;
                if (!request) {
                    console.error('RemoteSelect: request method not provided in ConfigProvider');
                    return;
                }

                let response = await request(api, queryParam);

                if (isSuccess && isSuccess(response)) {
                    this.keyMapMetaDatas = {};
                    let metaDatas = getData ? getData(response) : response?.data?.data;

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
