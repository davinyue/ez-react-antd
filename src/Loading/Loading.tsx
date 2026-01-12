import React from 'react';
import { Spin } from 'antd';
import './index.less';

/**
 * 加载组件属性接口
 */
export interface LoadingProp {
  /** 是否显示加载状态，默认 false */
  loading: boolean;
  /** 子组件内容 */
  children?: React.ReactNode;
}

/**
 * 加载组件
 * 在内容区域上方显示加载动画，支持包裹子组件
 * 
 * @example
 * <Loading loading={isLoading}>
 *   <YourContent />
 * </Loading>
 */
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
