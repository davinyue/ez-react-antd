import React from 'react';
import { useConfig, useUpdateConfig } from '../ConfigProvider';
import type { EzAntdConfig, UpdateConfigFunction } from '../ConfigProvider';

/**
 * withConfig HOC 注入的属性
 */
export interface WithConfigProps {
  /** 全局配置对象 */
  config: EzAntdConfig;
  /** 更新配置的方法 */
  updateConfig: UpdateConfigFunction;
}

/**
 * withConfig HOC
 * 为类组件注入 config 和 updateConfig
 * 
 * @param SourceComponent - 要包装的组件
 * @returns 包装后的组件，会注入 config 和 updateConfig 两个属性
 * 
 * @example
 * ```tsx
 * // 类组件
 * interface MyComponentProps extends WithConfigProps {
 *   title: string;
 * }
 * 
 * class MyComponent extends React.Component<MyComponentProps> {
 *   render() {
 *     const { config, updateConfig, title } = this.props;
 *     
 *     // 使用 config
 *     const hasPermission = config.hasPermission?.('admin.view');
 *     
 *     // 更新 config
 *     const handleLogin = () => {
 *       updateConfig({
 *         routePermissions: {...}
 *       });
 *     };
 *     
 *     return <div>{title}</div>;
 *   }
 * }
 * 
 * // 使用 withConfig 包装
 * export default withConfig(MyComponent);
 * 
 * // 使用时
 * <MyComponent title="Hello" />
 * // config 和 updateConfig 会自动注入，不需要手动传递
 * ```
 */
export default function withConfig<P extends object = {}>(
  SourceComponent: React.ComponentType<P & WithConfigProps>
): React.ComponentType<Omit<P, keyof WithConfigProps>> {
  return function WithConfigComponent(props: Omit<P, keyof WithConfigProps>) {
    const config = useConfig();
    const updateConfig = useUpdateConfig();

    // 将 config 和 updateConfig 注入到组件 props 中
    return (
      <SourceComponent
        {...(props as P)}
        config={config}
        updateConfig={updateConfig}
      />
    );
  };
}
