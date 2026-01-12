/**
 * Redux Action 类型定义
 */
export interface PayloadAction<P = any> {
    type: string;
    payload?: P;
    [extraProps: string]: any;
}

/**
 * 分页数据结构
 */
export interface PageData<T = any> {
    data: T[];
    total: number;
    currentPage: number;
    pageSize: number;
}
