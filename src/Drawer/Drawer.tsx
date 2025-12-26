import { Drawer, type DrawerProps, Button } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import React from 'react';
import './index.less';

export interface DrawerClassProps extends DrawerProps {
    /** 关闭按钮名称 */
    closeTxt?: string;
    /** 标题 */
    title?: React.ReactNode;
    /** 子元素 */
    children?: React.ReactNode;
    onClose?: (e: React.MouseEvent | React.KeyboardEvent) => void;
}

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
