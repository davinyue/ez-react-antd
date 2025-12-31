import React from 'react';
import ActionButton from './ActionButton';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyOutlined,
  TeamOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './TableActions.less';

export type ActionType =
  | 'view'          // 查看
  | 'edit'          // 编辑
  | 'delete'        // 删除
  | 'permission'    // 权限
  | 'authorisation' // 授权
  | 'session'       // 登录记录
  | 'reset'         // 重置
  | 'setting'       // 设置
  | 'custom';       // 自定义

export interface ActionConfig {
  /** 操作类型（预设类型会自动配置图标和提示） */
  type: ActionType;
  /** 点击事件 */
  onClick: (record: any) => void | Promise<void>;
  /** 权限码（可选） */
  permission?: string;
  /** 是否需要确认（可选） */
  confirm?: boolean | {
    title?: string;
    content?: string;
    okText?: string;
    cancelText?: string;
    okType?: 'primary' | 'danger';
  };
  /** 自定义提示文字（覆盖默认） */
  tooltip?: string;
  /** 自定义图标（覆盖默认） */
  icon?: React.ReactNode;
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示（用于条件渲染） */
  visible?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

export interface TableActionsProps {
  /** 操作配置列表 */
  actions: ActionConfig[];
  /** 记录数据（可用于条件判断） */
  record?: any;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 预设操作配置
 * 使用统一的 Ant Design Outlined 风格图标，视觉更现代、更统一
 */
const PRESET_ACTIONS: Record<ActionType, { icon: React.ReactNode; tooltip: string; className: string }> = {
  view: {
    icon: <EyeOutlined />,
    tooltip: '查看',
    className: 'action-view'
  },
  edit: {
    icon: <EditOutlined />,
    tooltip: '修改',
    className: 'action-edit'
  },
  delete: {
    icon: <DeleteOutlined />,
    tooltip: '删除',
    className: 'action-delete'
  },
  permission: {
    icon: <SafetyOutlined />,
    tooltip: '权限',
    className: 'action-permission'
  },
  authorisation: {
    icon: <TeamOutlined />,
    tooltip: '授权',
    className: 'action-authorisation'
  },
  session: {
    icon: <HistoryOutlined />,
    tooltip: '登录记录',
    className: 'action-session'
  },
  reset: {
    icon: <ReloadOutlined />,
    tooltip: '重置',
    className: 'action-reset'
  },
  setting: {
    icon: <SettingOutlined />,
    tooltip: '设置',
    className: 'action-setting'
  },
  custom: {
    icon: null as any,
    tooltip: '',
    className: ''
  }
};

/**
 * 表格操作列组件
 * 统一管理表格操作按钮，支持预设类型和自定义配置
 * 
 * @example
 * ```tsx
 * <TableActions
 *   record={record}
 *   actions={[
 *     {
 *       type: 'edit',
 *       permission: 'user:edit',
 *       onClick: () => handleEdit()
 *     },
 *     {
 *       type: 'delete',
 *       permission: 'user:delete',
 *       confirm: {
 *         title: '确认删除?',
 *         content: '删除后无法恢复'
 *       },
 *       onClick: () => handleDelete()
 *     },
 *     {
 *       type: 'custom',
 *       icon: <CustomIcon />,
 *       tooltip: '自定义操作',
 *       onClick: () => handleCustom()
 *     }
 *   ]}
 * />
 * ```
 */
const TableActions: React.FC<TableActionsProps> = ({ actions, record, className }) => {
  return (
    <div className={`table-actions${className ? ' ' + className : ''}`}>
      {actions.map((action, index) => {
        // 默认显示
        if (action.visible === false) {
          return null;
        }

        // 获取预设配置
        const preset = PRESET_ACTIONS[action.type];

        // 合并配置（自定义优先）
        const finalIcon = action.icon || preset?.icon;
        const finalTooltip = action.tooltip || preset?.tooltip || '';
        const finalClassName = action.className || preset?.className || '';

        if (!finalIcon) {
          console.warn(`TableActions: 操作类型 "${action.type}" 需要提供 icon`);
          return null;
        }

        return (
          <ActionButton
            key={`${action.type}-${index}`}
            icon={finalIcon}
            tooltip={finalTooltip}
            onClick={action.onClick}
            permission={action.permission}
            confirm={action.confirm}
            className={finalClassName}
            disabled={action.disabled}
            record={record}
          />
        );
      })}
    </div>
  );
};

export default TableActions;
