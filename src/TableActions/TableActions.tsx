import React from 'react';
import ActionButton, { type ActionButtonProps } from './ActionButton';
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

/**
 * 操作配置接口
 * 继承 ActionButtonProps，只添加 type 属性用于预设配置
 * icon 和 tooltip 可选，因为预设类型会自动配置
 */
export interface ActionConfig extends Omit<ActionButtonProps, 'record' | 'icon' | 'tooltip'> {
  /** 操作类型（预设类型会自动配置图标和提示） */
  type: ActionType;
  /** 自定义图标（覆盖预设，可选） */
  icon?: React.ReactNode;
  /** 自定义提示文字（覆盖预设，可选） */
  tooltip?: string;
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
    tooltip: '记录',
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
 * // 方式 1：使用 buttonCode（推荐，基于配置的权限验证）
 * <TableActions
 *   record={record}
 *   actions={[
 *     {
 *       type: 'edit',
 *       buttonCode: 'user.edit',  // 从 buttonPermissions 配置中查询权限
 *       onClick: () => handleEdit()
 *     },
 *     {
 *       type: 'delete',
 *       buttonCode: 'user.delete',
 *       confirm: {
 *         title: '确认删除?',
 *         content: '删除后无法恢复'
 *       },
 *       onClick: () => handleDelete()
 *     }
 *   ]}
 * />
 * 
 * // 方式 2：使用 permission（传统方式，手动指定权限）
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
 *       role: 'admin',
 *       onClick: () => handleDelete()
 *     }
 *   ]}
 * />
 * 
 * // 方式 3：混合使用
 * <TableActions
 *   record={record}
 *   actions={[
 *     {
 *       type: 'edit',
 *       buttonCode: 'user.edit',  // 优先使用 buttonCode
 *       onClick: () => handleEdit()
 *     },
 *     {
 *       type: 'custom',
 *       icon: <CustomIcon />,
 *       tooltip: '自定义操作',
 *       requireAuth: false,  // 不需要权限验证
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

        // 解构 action，移除 type 属性
        const { type, icon, tooltip, className: actionClassName, ...restProps } = action;

        return (
          <ActionButton
            key={`${type}-${index}`}
            icon={finalIcon}
            tooltip={finalTooltip}
            className={finalClassName}
            record={record}
            {...restProps}
          />
        );
      })}
    </div>
  );
};

export default TableActions;
