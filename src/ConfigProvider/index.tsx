import React, { createContext, useContext } from 'react';

export interface EzAntdConfig {
    /** 全局请求方法 */
    request?: (url: string, params?: any) => Promise<any>;
    /** 判断请求是否成功 */
    isSuccess?: (response: any) => boolean;
    /** 从响应中获取数据列表 */
    getData?: (response: any) => any[];
    /** 上传文件方法 */
    upload?: (url: string, formData: FormData) => Promise<any>;
}

const defaultConfig: EzAntdConfig = {
    request: async () => {
        console.warn('EzAntd: request method not configured');
        return Promise.resolve({});
    },
    isSuccess: (response: any) => {
        // 默认假设标准 Axios 响应结构: { status: 200, data: { code: 0 } }
        return response?.status === 200 && response?.data?.code === 0;
    },
    getData: (response: any) => {
        // 默认假设标准响应结构: response.data.data 是列表
        return response?.data?.data || [];
    },
};

export const ConfigContext = createContext<EzAntdConfig>(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{
    children: React.ReactNode;
    value: EzAntdConfig;
}> = ({ children, value }) => {
    return (
        <ConfigContext.Provider value={{ ...defaultConfig, ...value }}>
            {children}
        </ConfigContext.Provider>
    );
};
