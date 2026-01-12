import React, { createContext, useContext, useState, useCallback } from 'react';
import type { EzAntdConfig } from './types';
import { defaultConfig } from './defaults';

/** 全局配置 Context */
export const ConfigContext = createContext<EzAntdConfig>(defaultConfig);

/** 更新配置的方法类型 */
export type UpdateConfigFunction = (newConfig: Partial<EzAntdConfig>) => void;

/** 配置更新 Context */
const UpdateConfigContext = createContext<UpdateConfigFunction>(() => {
  console.warn('UpdateConfigContext not initialized');
});

/**
 * 获取全局配置的 Hook
 * @returns 全局配置对象
 * @example
 * const { request, responseIsSuccess } = useConfig();
 */
export const useConfig = () => useContext(ConfigContext);

/**
 * 获取更新配置方法的 Hook
 * @returns 更新配置的函数
 * @example
 * const updateConfig = useUpdateConfig();
 * updateConfig({ buttonPermissions: {...} });
 */
export const useUpdateConfig = () => useContext(UpdateConfigContext);

/**
 * 全局配置提供者组件
 * 用于为整个应用提供全局配置，支持动态更新配置
 * 
 * @example
 * // 基本用法
 * import { ConfigProvider } from 'ez-react-antd';
 * import request from './utils/request';
 * import session from './utils/session';
 * 
 * <ConfigProvider value={{
 *   request: request,
 *   isAuthenticated: () => session.isAuthenticated(),
 *   hasPermission: (permission) => session.hasPermission(permission),
 *   hasRole: (role) => session.hasRole(role),
 *   loginPath: '/login',
 *   forbiddenPath: '/403',
 * }}>
 *   <App />
 * </ConfigProvider>
 * 
 * @example
 * // 方案 1：应用启动时加载权限配置（适合已登录用户刷新页面）
 * import { ConfigProvider } from 'ez-react-antd';
 * 
 * <ConfigProvider value={{
 *   isAuthenticated: () => session.isAuthenticated(),
 *   hasPermission: (permission) => session.hasPermission(permission),
 *   // 使用函数形式，从 sessionStorage 动态获取
 *   getRoutePermissions: () => {
 *     const cached = sessionStorage.getItem('routePermissions');
 *     return cached ? JSON.parse(cached) : {};
 *   },
 *   getButtonPermissions: () => {
 *     const cached = sessionStorage.getItem('buttonPermissions');
 *     return cached ? JSON.parse(cached) : {};
 *   },
 * }}>
 *   <App />
 * </ConfigProvider>
 * 
 * @example
 * // 方案 2：登录后保存权限配置到 sessionStorage
 * import { useUpdateConfig } from 'ez-react-antd';
 * 
 * function LoginPage() {
 *   const handleLogin = async (values) => {
 *     // 1. 登录
 *     await loginAPI(values);
 *     
 *     // 2. 加载权限配置
 *     const routePermissions = await loadRoutePermissions();
 *     const buttonPermissions = await loadButtonPermissions();
 *     
 *     // 3. 保存到 sessionStorage（页面刷新时可恢复）
 *     sessionStorage.setItem('routePermissions', JSON.stringify(routePermissions));
 *     sessionStorage.setItem('buttonPermissions', JSON.stringify(buttonPermissions));
 *     
 *     // 4. 跳转
 *     navigate('/dashboard');
 *   };
 * 
 *   return <LoginForm onSubmit={handleLogin} />;
 * }
 * 
 * @example
 * // 退出登录时清空权限配置
 * function UserMenu() {
 *   const handleLogout = () => {
 *     session.clearUserInfo();
 *     sessionStorage.removeItem('routePermissions');
 *     sessionStorage.removeItem('buttonPermissions');
 *     navigate('/login');
 *   };
 * 
 *   return <Button onClick={handleLogout}>退出登录</Button>;
 * }
 */
export const ConfigProvider: React.FC<{
  /** 子组件 */
  children: React.ReactNode;
  /** 初始配置对象 */
  value: EzAntdConfig;
}> = ({ children, value }) => {
  // 使用 state 管理配置，支持动态更新
  const [config, setConfig] = useState<EzAntdConfig>(() => ({
    ...defaultConfig,
    ...value
  }));

  // 更新配置的方法
  const updateConfig = useCallback((newConfig: Partial<EzAntdConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig
    }));
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      <UpdateConfigContext.Provider value={updateConfig}>
        {children}
      </UpdateConfigContext.Provider>
    </ConfigContext.Provider>
  );
};
