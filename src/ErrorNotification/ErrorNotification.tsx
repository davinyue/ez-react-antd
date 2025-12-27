import React from 'react';

/**
 * 错误通知组件属性接口
 */
export interface ErrorNotificationProp {
  /** 错误数据对象 */
  data?: {
    /** 错误消息 */
    msg: string;
    /** 错误代码（可选） */
    code?: string | number;
  };
  /** 直接传递错误消息（优先级低于 data.msg） */
  message?: string;
  /** 标题文本，默认 '错误信息:' */
  title?: string;
  /** 自定义标题样式 */
  titleStyle?: React.CSSProperties;
  /** 自定义内容样式 */
  contentStyle?: React.CSSProperties;
  /** 自定义容器样式 */
  containerStyle?: React.CSSProperties;
}

/**
 * 错误通知组件
 * 用于在 notification 的 description 中显示格式化的错误信息
 * 支持自定义样式，提供更好的视觉效果
 * 
 * @example
 * // 基本用法（配合 notification 使用）
 * notification.error({
 *   message: '操作失败',
 *   description: <ErrorNotification data={{ msg: '网络连接超时' }} />
 * });
 * 
 * // 使用 React.createElement
 * const description = React.createElement(ErrorNotification, {
 *   data: { code: 500, msg: '服务器内部错误' }
 * });
 * notification.error({
 *   message: '错误代码: 500',
 *   description: description
 * });
 */
const ErrorNotification: React.FC<ErrorNotificationProp> = ({
  data,
  message,
  title = '错误信息:',
  titleStyle,
  contentStyle,
  containerStyle
}) => {
  // 默认样式
  const defaultTitleStyle: React.CSSProperties = {
    fontWeight: 'bold',
    color: 'rgba(0, 0, 0, 0.85)',  // 改为黑色
    fontSize: '14px',
    marginRight: '4px',
    flexShrink: 0,  // 标题不收缩
    ...titleStyle
  };

  const defaultContentStyle: React.CSSProperties = {
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    lineHeight: '1.6',
    color: 'rgba(0, 0, 0, 0.85)',
    flex: 1,  // 内容占据剩余空间
    ...contentStyle
  };

  const defaultContainerStyle: React.CSSProperties = {
    padding: '4px 0',
    lineHeight: '1.6',
    display: 'flex',  // 使用 flex 布局
    flexWrap: 'wrap',  // 允许换行
    alignItems: 'flex-start',  // 顶部对齐
    ...containerStyle
  };

  // 获取错误消息
  const errorMessage = data?.msg || message || '未知错误';

  return (
    <div style={defaultContainerStyle}>
      <span style={defaultTitleStyle}>{title}</span>
      <span style={defaultContentStyle}>{errorMessage}</span>
    </div>
  );
};

export default ErrorNotification;