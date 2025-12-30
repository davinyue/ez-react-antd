import { Drawer, type DrawerProps, Button } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import React from 'react';
import './index.less';

/**
 * 抽屉组件属性接口
 * 继承自 Ant Design 的 DrawerProps
 */
export interface DrawerClassProps extends DrawerProps {
  /** 关闭按钮文本，默认 '关闭' */
  closeTxt?: string;
  /** 抽屉标题 */
  title?: React.ReactNode;
  /** 子元素内容 */
  children?: React.ReactNode;
  /**
   * 关闭回调函数
   * @param e 鼠标或键盘事件
   */
  onClose?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  /** 
   * 抽屉宽度
   * 可以是数字（像素）或字符串（如 '50%'）
   */
  width?: number | string;
  /** 
   * 抽屉高度（仅在 placement 为 top 或 bottom 时有效）
   * 可以是数字（像素）或字符串（如 '50%'）
   */
  height?: number | string;
  /** 
   * 抽屉位置
   * @default 'right'
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /** 
   * 是否显示遮罩
   * @default true
   */
  mask?: boolean;
  /** 
   * 点击遮罩是否允许关闭
   * @default true
   */
  maskClosable?: boolean;
  /** 
   * 关闭时销毁子元素
   * @default false
   */
  destroyOnHidden?: boolean;
  /**
   * 关闭时隐藏子元素（推荐使用，性能更好）
   * @default false
   */
  destroyOnHidden?: boolean;
  /** 
   * 抽屉的 z-index
   * @default 1000
   */
  zIndex?: number;
  /** 
   * 可用于设置 Drawer 各部分的样式
   */
  styles?: {
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    mask?: React.CSSProperties;
    wrapper?: React.CSSProperties;
  };
  /** 
   * 底部内容
   */
  footer?: React.ReactNode;
}

/**
 * 抽屉组件
 * 基于 Ant Design Drawer 封装，自定义关闭按钮样式
 * 
 * @example
 * <Drawer 
 *   open={visible}
 *   title="详情"
 *   onClose={handleClose}
 *   width="80%"
 *   styles={{
 *     body: {
 *       paddingBottom: 80,
 *       height: 'calc(100vh - 55px)',
 *       overflow: 'auto'
 *     }
 *   }}
 * >
 *   <YourContent />
 * </Drawer>
 */
class DrawerClass extends React.Component<DrawerClassProps> {
  static defaultProps = {
    closeTxt: '关闭',
    placement: 'right',
    width: 378,
    destroyOnHidden: false,
    destroyOnHidden: false,
    mask: true,
    maskClosable: true,
    zIndex: 1000,
  };

  render() {
    const {
      closeTxt,
      title,
      children,
      styles,
      ...restProps
    } = this.props;

    // 合并默认样式和用户自定义样式
    const mergedStyles = {
      ...styles,
      body: {
        paddingBottom: 80,
        height: 'calc(100vh - 55px)',
        overflow: 'auto',
        ...styles?.body,
      },
      header: {
        ...styles?.header,
      },
      footer: {
        ...styles?.footer,
      },
    };

    return (
      <Drawer
        className="drawer_box"
        {...restProps}
        styles={mergedStyles}
        closeIcon={false}
        title={
          <div>
            <Button icon={<RollbackOutlined />} onClick={this.props.onClose}>
              {closeTxt}
            </Button>
            <span className="drawer_title">{title}</span>
          </div>
        }
      >
        {children}
      </Drawer>
    );
  }
}

export default DrawerClass;
