import React from 'react';
import { useConfig, useUpdateConfig } from '../ConfigProvider';
import type { EzAntdConfig, UpdateConfigFunction } from '../ConfigProvider';

/**
 * withEzAntdConfigProps HOC 注入的属性
 */
export interface WithEzAntdConfigProps {
  /** 全局配置对象 */
  ezAntdConfig: EzAntdConfig;
  /** 更新配置的方法 */
  updateEzAntdConfig: UpdateConfigFunction;
}

/**
 * withEzAntdConfig HOC
 * 为类组件注入 ezAntdConfig 和 updateEzAntdConfig
 * 
 * @param SourceComponent - 要包装的组件
 * @returns 包装后的组件，会注入 ezAntdConfig 和 updateEzAntdConfig 两个属性
 * 
 * @example
 * ```tsx
 * // 类组件
 * interface MyComponentProps extends WithEzAntdConfigProps {
 *   title: string;
 * }
 * 
 * class MyComponent extends React.Component<MyComponentProps> {
 *   render() {
 *     const { ezAntdConfig, updateEzAntdConfig, title } = this.props;
 *     
 *     // 使用 ezAntdConfig
 *     const hasPermission = ezAntdConfig.hasPermission?.('admin.view');
 *     
 *     // 更新 ezAntdConfig
 *     const handleLogin = () => {
 *       updateEzAntdConfig({
 *         routePermissions: {...}
 *       });
 *     };
 *     
 *     return <div>{title}</div>;
 *   }
 * }
 * 
 * // 使用 withConfig 包装
 * export default withEzAntdConfig(MyComponent);
 * 
 * // 使用时
 * <MyComponent title="Hello" />
 * // ezAntdConfig 和 updateEzAntdConfig 会自动注入，不需要手动传递
 * ```
 */
export default function withEzAntdConfig<P extends WithEzAntdConfigProps = WithEzAntdConfigProps>(
  SourceComponent: React.ComponentType<P>
): React.ComponentType<Omit<P, keyof WithEzAntdConfigProps>> {
  return function WithEzAntdConfigComponent(props: Omit<P, keyof WithEzAntdConfigProps>) {
    const config = useConfig();
    const updateEzAntdConfig = useUpdateConfig();

    // 将 config 和 updateConfig 注入到组件 props 中
    return (
      <SourceComponent
        {...(props as any)}
        ezAntdConfig={config}
        updateEzAntdConfig={updateEzAntdConfig}
      />
    );
  };
}
