import React from 'react';
import { Spin } from 'antd';
import './index.less';

export interface LoadingProp {
    /** loading */
    loading: boolean;
    children?: React.ReactNode;
}

class Loading extends React.Component<LoadingProp> {
    static defaultProps = {
        loading: false,
    };

    render() {
        return (
            <div className="loading_layout_box">
                <div className={this.props.loading ? 'loading_box' : 'loading_box_none'}>
                    <Spin spinning={this.props.loading}></Spin>
                </div>
                <div className="loading_content_box">{this.props.children}</div>
            </div>
        );
    }
}

export default Loading;
