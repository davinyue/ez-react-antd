import React from 'react';
import { Tooltip, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Auth from '../../Auth';
import FeaturePoint from '../../FeaturePoint';
import './ActionButton.less';

export interface ActionButtonProps {
  /** 图标元素 */
  icon: React.ReactNode;
  /** Tooltip 提示文字 */
  tooltip: string;
  /** 点击事件 */
  onClick: (record: any) => void | Promise<void>;
  /** 是否显示（优先级最高，默认为 true） */
  isShow?: boolean;
  /** 按钮权限编码（可选，用于 FeaturePoint 方式的权限验证，优先级高于 permission） */
  featurePointCode?: string;
  /** 权限码（可选，不传则不进行权限控制） */
  permission?: string | string[];
  /** 角色码（可选，不传则不进行角色控制） */
  role?: string | string[];
  /** 是否需要验证登录状态，默认为 true */
  requireAuth?: boolean;
  /** 确认配置（可选） */
  confirm?: boolean | {
    title?: string;
    content?: React.ReactNode;
    okText?: string;
    cancelText?: string;
    okType?: 'primary' | 'danger';
  };
  /** 自定义样式类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** Tooltip 位置 */
  placement?: 'top' | 'left' | 'right' | 'bottom';
  /** 记录数据（可用于条件判断） */
  record?: any;
}

/**
 * 操作按钮组件
 * 统一封装了权限控制、Tooltip、确认框等常用功能
 * 
 * @example
 * ```tsx
 * // 方式 1：使用 featurePointCode（推荐）
 * <ActionButton
 *   icon={<EditOutlined />}
 *   tooltip="编辑"
 *   featurePointCode="user.edit"
 *   onClick={(record: any) => handleEdit()}
 * />
 * 
 * // 方式 2：使用 permission（传统方式）
 * <ActionButton
 *   icon={<EditOutlined />}
 *   tooltip="编辑"
 *   permission="user:edit"
 *   onClick={(record: any) => handleEdit()}
 * />
 * ```
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  tooltip,
  onClick,
  isShow = true,
  featurePointCode,
  permission,
  role,
  requireAuth = true,
  confirm,
  className = '',
  disabled = false,
  placement = 'top',
  record
}) => {

  // 优先判断 isShow
  if (!isShow) {
    return null;
  }

  const handleClick = async () => {
    if (disabled) return;

    // 如果需要确认
    if (confirm) {
      const confirmConfig = typeof confirm === 'boolean' ? {} : confirm;

      Modal.confirm({
        title: confirmConfig.title || '确认操作?',
        icon: <ExclamationCircleOutlined />,
        content: confirmConfig.content || '请确认是否继续',
        okText: confirmConfig.okText || '确认',
        okType: confirmConfig.okType || 'primary',
        cancelText: confirmConfig.cancelText || '取消',
        async onOk() {
          try {
            await onClick(record);
          } catch (error) {
            console.error('操作失败:', error);
            message.error('操作失败');
          }
        }
      });
    } else {
      // 直接执行
      try {
        await onClick(record);
      } catch (error) {
        console.error('操作失败:', error);
        message.error('操作失败');
      }
    }
  };

  const button = (
    <Tooltip placement={placement} title={tooltip}>
      <span
        className={`action-button ${className} ${disabled ? 'action-button-disabled' : ''}`}
        onClick={handleClick}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {icon}
      </span>
    </Tooltip>
  );

  // 优先使用 featurePointCode（基于配置的权限验证）
  if (featurePointCode) {
    return (
      <FeaturePoint code={featurePointCode}>
        {button}
      </FeaturePoint>
    );
  }

  // 如果有权限或角色要求，使用 Auth 组件（传统方式）
  if (permission !== undefined || role !== undefined || requireAuth !== true) {
    return (
      <Auth
        permission={permission}
        role={role}
        requireAuth={requireAuth}
      >
        {button}
      </Auth>
    );
  }

  return button;
};

export default ActionButton;
