import React from 'react';
import * as FsIcon from '@fortawesome/free-solid-svg-icons';
import * as FrIcon from '@fortawesome/free-regular-svg-icons';
import * as AntdIcon from '@ant-design/icons';
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import Select, { GroupBase, OnChangeValue, OptionsOrGroups, PropsValue } from 'react-select';
import { Tooltip } from 'antd';
import { List } from 'react-window';
import IconShow from './IconShow';
import './index.less';

const classNamePrefix = 'icon_select';
/** 选择项 */
interface Option {
  /** 图标编码 */
  value: string;
  /** 图标来源 */
  source: string;
  /** 来源对应的编码 */
  sourceKey: string;
}

export interface IconSelectProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export interface IconSelectState {
  /** 输入框宽度 */
  selectWidth: number,
  inputValue?: string
}

/** 每个图标的大小像素 */
const iconSize: number = 35;

// 虚拟滚动列表组件
class VirtualizedMenuList extends React.Component<any> {
  listRef: React.RefObject<any>;
  constructor(props: any) {
    super(props);
    this.listRef = React.createRef();
  }

  /** 计算每行显示的数量 */
  getItemsPerRow(width: number): number {
    return Math.max(1, Math.floor(width / (iconSize + 1)));
  }

  render() {
    const { maxHeight, selectWidth, selectOption, inputValue, getValue } = this.props;
    let options: OptionsOrGroups<Option, GroupBase<Option>> = this.props.options;
    const itemsPerRow = this.getItemsPerRow(selectWidth);
    if (inputValue) {
      options = options.filter((option) => (option as Option).value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1);
    }
    let values = getValue();
    let value: Option | undefined;
    if (values && values.length > 0) {
      value = values[0];
    }
    // 计算行数
    const rowCount = Math.ceil(options.length / itemsPerRow);
    return (
      <List
        rowProps={{}}
        listRef={this.listRef}
        //height={maxHeight}
        rowCount={rowCount}
        rowHeight={iconSize} // 每行高度
        //width={selectWidth} // 让宽度和输入框同步
        style={{ overflowX: 'hidden', height: maxHeight, width: selectWidth }}
        rowComponent={({ index, style }) => {
          const startIndex = index * itemsPerRow;
          const rowItems = options.slice(startIndex, startIndex + itemsPerRow);
          return (
            <div className='icon_select_option_container' style={{ ...style }}>
              {rowItems.map((item) => {
                let optionClassName = 'option_item';
                if (item === value) {
                  optionClassName = 'option_item option_item_selected';
                }
                return (
                  <Tooltip key={'icon_key_item_' + (item as Option).value}
                    title={`${(item as Option).source}.${(item as Option).sourceKey}`}>
                    <div
                      key={'icon_key' + (item as Option).value}
                      className={optionClassName}
                      onClick={() => selectOption(item)}
                    >
                      <IconShow iconValue={(item as Option).value} />
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          );
        }}
      />
    );
  }
}

const CustomSingleValue = ({ data }: { data: any }) => {
  let tip = (data as Option).source + '.' + (data as Option).sourceKey;
  return (
    <div className={`${classNamePrefix}__single-value`}>
      <IconShow iconValue={(data as Option).value} />
      <span style={{ marginLeft: '5px' }}>{tip}</span>
    </div>
  );
};

class IconSelect extends React.Component<IconSelectProps, IconSelectState> {
  selectRef: React.RefObject<any>;
  selectOptions?: OptionsOrGroups<Option, GroupBase<Option>>;
  optionMap?: Map<string, Option>;
  constructor(props: IconSelectProps) {
    super(props);
    this.selectRef = React.createRef();
    this.buildIconSelectOptions();
    this.state = {
      selectWidth: 200
    };
    this.updateWidth = this.updateWidth.bind(this);
  }


  buildIconSelectOptions() {
    this.optionMap = new Map();
    let ret: Option[] = [];
    for (let key in AntdIcon) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((AntdIcon as any)[key].render instanceof Function) {
        let option: Option = {
          value: 'antd' + '$' + key,
          source: 'Antd',
          sourceKey: key
        };
        ret.push(option);
        this.optionMap!.set(option.value, option);
      }
    }
    for (let key in FsIcon) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (this.isIconDefinition((FsIcon as any)[key])) {
        let option: Option = {
          value: 'fs' + '$' + key,
          source: 'FreeSolid',
          sourceKey: key
        };
        ret.push(option);
        this.optionMap!.set(option.value, option);
      }
    }
    for (let key in FrIcon) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (this.isIconDefinition((FrIcon as any)[key])) {
        let option: Option = {
          value: 'fr' + '$' + key,
          source: 'FreeRegular',
          sourceKey: key
        };
        ret.push(option);
        this.optionMap!.set(option.value, option);
      }
    }
    this.selectOptions = ret;
  }

  isIconDefinition(value: any): value is IconDefinition {
    return (
      value &&
      typeof value.prefix === 'string' &&
      typeof value.iconName === 'string' &&
      Array.isArray(value.icon)
    );
  }

  updateWidth() {
    let selectIns = this.selectRef.current;
    if (selectIns) {
      this.setState({ selectWidth: selectIns.offsetWidth });
    }
  }

  componentDidMount(): void {
    requestAnimationFrame(this.updateWidth);
    window.addEventListener('resize', this.updateWidth);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.updateWidth);
  }

  render(): React.ReactNode {
    let value: PropsValue<Option> | undefined = undefined;
    if (this.props.value) {
      value = this.optionMap!.get(this.props.value);
    }
    return (
      <div ref={this.selectRef} className='icon_select_container'>
        <Select
          classNamePrefix={classNamePrefix}
          options={this.selectOptions}
          onInputChange={(value) => {
            this.setState({ inputValue: value });
          }}
          components={{
            //自定义菜单列表
            MenuList: (props) => (
              <VirtualizedMenuList {...props}
                selectWidth={this.state.selectWidth}
                inputValue={this.state.inputValue} />
            ),
            SingleValue: CustomSingleValue
          }}
          isClearable
          placeholder='请选择图标'
          styles={{
            menu: (provided) => ({
              ...provided,
              // 让下拉框宽度和输入框同步
              width: this.state.selectWidth,
            }),
          }}
          menuIsOpen
          onChange={(option: OnChangeValue<Option, false>) => {
            let value: string | undefined;
            if (option) {
              value = option.value;
            }
            if (this.props.onChange) {
              this.props.onChange(value);
            }
          }}
          value={value}
        />
      </div>
    );
  }
}

export default IconSelect;