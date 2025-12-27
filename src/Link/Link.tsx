import React from 'react';
import { Link as RouterLink } from 'react-router';

/**
 * 链接组件属性接口
 */
export interface LinkProp {
  /** 跳转路径 */
  to: string,
  /** 子元素 */
  children?: any
}

/**
 * 链接组件
 * 基于 react-router 的 Link 组件封装，设置为 inline 显示
 * 
 * @example
 * <Link to="/dashboard">前往控制台</Link>
 */
class Link extends React.Component<LinkProp> {
  render() {
    return (<RouterLink style={{ display: 'inline' }} {...this.props} />);
  }
}
export default Link;
