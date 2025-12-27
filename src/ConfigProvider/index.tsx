import React, { createContext, useContext } from 'react';

/**
 * HTTP 请求配置接口
 */
export interface RequestConfig {
  /** 请求头 */
  headers?: {
    [name: string]: string;
  };
  /** 其他配置项 */
  [key: string]: any;
}

/**
 * 请求参数接口
 */
export interface RequestParam {
  [name: string]: any;
}

/**
 * Axios 响应接口
 * 模拟 Axios 的响应结构
 */
export interface AxiosResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** HTTP 状态码 */
  status: number;
  /** HTTP 状态文本 */
  statusText: string;
  /** 原始请求对象 */
  request?: any;
  /** 其他属性 */
  [key: string]: any
}

/**
 * 请求方法接口
 * 定义基本的 HTTP 请求方法
 */
export interface Request {
  /**
   * GET 请求
   * @param url 请求 URL
   * @param params 查询参数
   * @param config 请求配置
   * @returns Promise 响应
   */
  getRequest: (
    url: string,
    params?: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
  /**
   * PUT 请求
   * @param url 请求 URL
   * @param data 请求体数据
   * @param config 请求配置
   * @returns Promise 响应
   */
  putRequest: (
    url: string,
    data: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
  /**
   * DELETE 请求
   * @param url 请求 URL
   * @param params 查询参数
   * @param config 请求配置
   * @returns Promise 响应
   */
  deleteRequest: (
    url: string,
    params?: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
  /**
   * POST 请求
   * @param url 请求 URL
   * @param data 请求体数据
   * @param config 请求配置
   * @returns Promise 响应
   */
  postRequest: (
    url: string,
    data: RequestParam,
    config?: RequestConfig,
  ) => Promise<AxiosResponse<any>>;
}


/**
 * EzAntd 全局配置接口
 * 用于配置组件库的全局行为
 */
export interface EzAntdConfig {
  /** 全局请求方法对象，提供 GET/POST/PUT/DELETE 方法 */
  request?: Request;
  /**
   * 判断请求响应是否成功
   * @param response 响应对象
   * @returns 是否成功
   */
  responseIsSuccess?: (response: any) => boolean;
  /**
   * 文件上传方法
   * @param url 上传 URL
   * @param formData 表单数据
   * @returns Promise 响应
   */
  upload?: (url: string, formData: FormData) => Promise<any>;
}

/** 默认配置 */
const defaultConfig: EzAntdConfig = {
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
};

/** 全局配置 Context */
export const ConfigContext = createContext<EzAntdConfig>(defaultConfig);

/**
 * 获取全局配置的 Hook
 * @returns 全局配置对象
 * @example
 * const { request, responseIsSuccess } = useConfig();
 */
export const useConfig = () => useContext(ConfigContext);

/**
 * 全局配置提供者组件
 * 用于为整个应用提供全局配置
 * 
 * @example
 * import { ConfigProvider } from 'ez-react-antd';
 * import request from './utils/request';
 * 
 * <ConfigProvider value={{
 *   request: request,
 *   responseIsSuccess: (res) => res.status === 200 && res.data.code === 0,
 *   upload: (url, formData) => request.postRequest(url, formData)
 * }}>
 *   <App />
 * </ConfigProvider>
 */
export const ConfigProvider: React.FC<{
  /** 子组件 */
  children: React.ReactNode;
  /** 配置对象 */
  value: EzAntdConfig;
}> = ({ children, value }) => {
  return (
    <ConfigContext.Provider value={{ ...defaultConfig, ...value }}>
      {children}
    </ConfigContext.Provider>
  );
};
