import type { EzAntdConfig, RequestParam, RequestConfig } from './types';

/**
 * 默认配置
 * 提供组件库的默认行为
 */
export const defaultConfig: EzAntdConfig = {
  request: {
    getRequest: async (_url: string, _params?: RequestParam, _config?: RequestConfig) => {
      console.warn('EzAntd: request method not configured');
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK' });
    },
    postRequest: async (_url: string, _data: RequestParam, _config?: RequestConfig) => {
      console.warn('EzAntd: request method not configured');
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK' });
    },
    putRequest: async (_url: string, _data: RequestParam, _config?: RequestConfig) => {
      console.warn('EzAntd: request method not configured');
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK' });
    },
    deleteRequest: async (_url: string, _params?: RequestParam, _config?: RequestConfig) => {
      console.warn('EzAntd: request method not configured');
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK' });
    },
  },
  responseIsSuccess: (response: any) => {
    // 默认假设标准 Axios 响应结构: { status: 200, data: { code: 0 } }
    return response?.status === 200 && response?.data?.code === 0;
  },
  isAuthenticated: () => {
    console.warn('EzAntd: isAuthenticated method not configured');
    return false;
  },
  hasPermission: (_permission: string | string[] | undefined | null) => {
    console.warn('EzAntd: hasPermission method not configured');
    return false;
  },
  hasRole: (_role: string | string[] | undefined | null) => {
    console.warn('EzAntd: hasRole method not configured');
    return false;
  },
  loginPath: '/login',
  forbiddenPath: '/403',
};
