import React from 'react';
import { Cascader, Input } from 'antd';
import compare from '../utils/compare';
import { ConfigContext } from '../ConfigProvider';

export interface RemoteCascaderProp {
    /** 数据请求接口 */
    needQueryParam?: boolean;
    /** 选中字段的值key */
    api: string;
    /** 查询参数 */
    queryParam?: { [key: string]: any };
    /** 默认查询参数 */
    defaultParam?: { [key: string]: any };
    /** 选项显示的字段key */
    labelKey?: string;
    /** 选中字段的值key */
    valueKey?: string;
    /** 禁用值 */
    disabledValue?: string;
    /** 当加载子数据时,应该返回加载参数 */
    onLoadSonData?: (selectOption: any) => { [key: string]: any },
    /** 默认值 */
    initValue?: any,
    /** 值 */
    value?: any;
    placeholder?: React.ReactNode;
    /** 允许清除 */
    allowClear?: boolean;
    /** 选中改变事件 */
    onChange?: (value: any) => void
}

export interface RemoteCascaderState {
    /** 已选择数据 */
    options: Array<any>;
    /** 是否初始化完毕状态 */
    inited: boolean;
}

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
        const { request, isSuccess, getData } = this.context;
        if (!request || !isSuccess || !getData) return;

        if (index <= initValue.length) {
            let pram: any = {
                parentId: parentOption.value
            };
            if (this.props.defaultParam) {
                pram = { ...this.props.defaultParam, ...pram };
            }

            try {
                let response = await request(this.props.api, pram);
                if (isSuccess(response)) {
                    let sonOptionMetaDatas = getData(response);
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
        const { request, isSuccess, getData } = this.context;

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

            if (request && isSuccess && getData) {
                try {
                    let response = await request(api, queryParam);
                    if (isSuccess(response)) {
                        let options: Array<any> = [];
                        const dataList = getData(response);
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
        const { request, isSuccess, getData } = this.context;
        if (!request || !isSuccess || !getData) {
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
            let response = await request(this.props.api, sonQueryParam);
            if (isSuccess(response)) {
                let sonOptions: Array<any> = [];
                const dataList = getData(response);
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
