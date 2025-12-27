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
 * >
 *   <YourContent />
 * </Drawer>
 */
class DrawerClass extends React.Component<DrawerClassProps> {
    static defaultProps = {
        closeTxt: '关闭',
    };

    render() {
        return (
            <Drawer
                className="drawer_box"
                {...this.props}
                closeIcon={false}
                title={
                    <div>
                        <Button icon={<RollbackOutlined />} onClick={this.props.onClose}>
                            {this.props.closeTxt}
                        </Button>
                        <span className="drawer_title">{this.props.title}</span>
                    </div>
                }
            >
                {this.props.children}
            </Drawer>
        );
    }
}

export default DrawerClass;
